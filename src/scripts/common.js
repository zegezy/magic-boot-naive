import request from '@/scripts/request'
import global from '@/scripts/global'
import {utils, writeFile} from 'xlsx'
import {useUserStore} from "@/store/modules/userStore";
import {isArray, cloneDeep} from "lodash-es";

const common = {}

common.handleDelete = (options) => {
    const url = options.url
    const id = options.id
    $dialog.warning({
        title: '提示',
        content: '此操作将永久删除该数据, 是否继续?',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
            request({
                url: url,
                method: 'delete',
                params: {
                    id: id
                }
            }).then(() => {
                $message.success('删除成功')
                options && options.done()
            })
        }
    })
}

const formatJson = (list, filterVal) => {
    return list.map(v => filterVal.map(j => {
        return v[j]
    }))
}

common.$get = (url, data) => request({url, params: data})
common.$delete = (url, data) => request({url, method: 'delete', params: data})
common.$post = (url, data) => request.post(url, data, {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    transformRequest: [data => data && Object.keys(data).map(it => encodeURIComponent(it) + '=' + encodeURIComponent(data[it] === null || data[it] === undefined ? '' : data[it])).join('&')]
})
common.$postJson = (url, data) => request.post(url, JSON.stringify(data), {
    headers: {
        'Content-Type': 'application/json'
    }
})

common.renderWhere = (where) => {
    let newWhere = {}
    for (let key in where) {
        if (where[key] instanceof Object) {
            newWhere[key] = where[key].value
        } else {
            newWhere[key] = where[key]
        }
    }
    return newWhere
}

// common.exportExcel = (options) => {
//   var where = options.where || {}
//   where = common.renderWhere(where)
//   where.current = 1
//   where.size = 99999999
//   const url = options.url
//   const headers = options.headers
//   const columns = options.columns
//   request({
//     url: url,
//     method: 'post',
//     params: where
//   }).then(res => {
//     import('@/vendor/Export2Excel').then(excel => {
//       const data = formatJson(res.data, columns)
//       excel.export_json_to_excel({
//         header: headers,
//         data,
//         filename: 'table-list'
//       })
//     })
//   })
// }

common.handlerTreeData = (data, id, pid, sort, pidVal) => {
    var treeData = []
    var addChildren = (it) => {
        var children = data.filter(d => d[pid] === it[id])
        if (children && children.length > 0) {
            children.sort((a, b) => {
                return a[sort] - b[sort]
            })
            it.children = children
            children.forEach(chi => {
                addChildren(chi)
            })
        }
    }
    data.sort((a, b) => {
        return a[sort] - b[sort]
    })
    data.filter(it => it[pid] === pidVal).forEach(it => {
        addChildren(it)
        treeData.push(it)
    })
    return treeData
}

common.uuid = () => {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }

    return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
}

common.objAssign = (obj1, obj2, exclude) => {
    exclude = exclude || ''
    for (var o1 in obj1) {
        for (var o2 in obj2) {
            if (o1 === o2) {
                if (exclude.indexOf(o1) == -1) {
                    obj1[o1] = obj2[o2]
                }
            }
        }
    }
}

common.copyNew = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

common.getParam = (data) => {
    let url = ''
    for (var k in data) {
        const value = data[k] !== undefined ? data[k] : ''
        url += `&${k}=${encodeURIComponent(value)}`
    }
    return url ? url.substring(1) : ''
}

common.getUrl = (url, data) => {
    url += (url.indexOf('?') < 0 ? '?' : '') + common.getParam(data)
    return url
}

function getToken(){
    const userStore = useUserStore()
    const token = userStore.getToken()
}

common.downloadMore = (urls, filename) => {
    let params = {
        // post只需编码一次，get需要编码两次（encodeURIComponent(encodeURIComponent(urls))）
        urls: encodeURIComponent(urls),
        filename: filename || '',
        token: getToken()
    }
    let form = document.createElement("form");
    form.style.display = 'none';
    form.action = global.baseApi + '/system/file/download';
    form.method = 'post';
    document.body.appendChild(form);
    for(let key in params){
        let input = document.createElement("input");
        input.type = 'hidden';
        input.name = key;
        input.value = params[key];
        form.appendChild(input);
    }
    form.submit();
    form.remove();
}

common.download = (urls, filename) => {
    location.href = common.downloadHref(urls, filename)
}

common.downloadHref = (urls, filename) => {
  return global.baseApi + `/system/file/download?urls=${encodeURIComponent(encodeURIComponent(urls))}&filename=${filename || ''}&token=${getToken()}`
}

common.loadConfig = async () => {
    await request({
        url: '/system/config/list'
    }).then(res => {
        const {data} = res
        global.config = data
        global.filePrefix = global.config.bucketDomain ? global.config.bucketDomain : global.baseApi
    })
}

common.setDefaultValue = (obj, attr, value) => {
    obj[attr] = obj[attr] === undefined ? value : obj[attr]
}

common.isComma = (value) => {
    return value.toString().indexOf(',') !== -1
}

common.exportExcel = (options) => {
    options.suffix = options.suffix || 'xlsx'
    const workBook = utils.json_to_sheet(options.data);
    const wb = utils.book_new()
    utils.book_append_sheet(wb, workBook, 'sheet1');
    writeFile(wb, `${options.fileName}.${options.suffix || 'xlsx'}`);
}

common.objectAssign = (target, source) => {
    return Object.assign({}, JSON.parse(JSON.stringify(target)), JSON.parse(JSON.stringify(source)))
}

common.getUrlType = (url) => {
    if(!url){
        return -1
    }
    if(url.startsWith('http')){
        return 0
    }else if(url.indexOf('.htm') != -1){
        return 1
    }
    return 2
}

common.getLocationHref = () => {
    return location.href.substring(0, location.href.indexOf('/', location.href.indexOf('/', location.href.indexOf('/') + 1) + 1))
}

common.handlerUrlPage = (url) => {
    let urlType = common.getUrlType(url)
    if(urlType == 1){
        return common.getLocationHref() + url
    }else if(urlType == 2){
        return common.getLocationHref() + '/#' + url
    }
    return url
}

common.filterIframeTabs = (it) => {
    return it.meta.keepAlive && it.meta.path && (
        (it.meta.path.startsWith('http') && (it.meta.openMode == '0' || it.meta.openMode == '2'))
        ||
        (it.meta.path.indexOf('.htm') != -1 && (it.meta.openMode == '0' || it.meta.openMode == '2'))
        ||
        it.meta.openMode == '2'
    )
}

/**
 * 字符串数组和字符串（带逗号）对比
 */
common.arrayStringEq = (v1, v2) => {
    let value1 = cloneDeep(v1)
    let value2 = cloneDeep(v2)
    value1 = isArray(value1) ? value1.join(',') : value1 && value1.toString()
    value2 = isArray(value2) ? value2.join(',') : value2 && value2.toString()
    return value1 == value2
}

/**
 * 判断数据不为null、undefined、空字符串。不包含0和1
 */
common.notEmptyNot01 = (value) => {
    if(value !== null && value !== undefined && value !== ''){
        return true
    }
    return false
}

common.stopWatchList = (watchList) => {
    for(let watchFunction of watchList){
        watchFunction()
    }
}

common.copyText = (selection) => {
    let copyDiv = document.createElement('div');
    copyDiv.contentEditable = 'true';
    document.body.appendChild(copyDiv);
    copyDiv.innerHTML = selection;
    copyDiv.unselectable = 'off';
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand('Copy', false, null);
    document.body.removeChild(copyDiv);
}

common.warning = (content, callback) => {
    $dialog.warning({
        title: '提示',
        content,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
            callback()
        }
    })
}

export default common
