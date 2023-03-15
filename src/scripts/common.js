import request from '@/scripts/request'
// import { ElMessageBox, ElNotification } from 'element-plus'
import global from '@/scripts/global'
import { utils, writeFile } from 'xlsx'
// import { getToken } from '@/scripts/auth'

const common = {}

// common.handleDelete = (options) => {
//   const url = options.url
//   const id = options.id
//   ElMessageBox.confirm('此操作将永久删除该数据, 是否继续?', '提示', {
//     confirmButtonText: '确定',
//     cancelButtonText: '取消',
//     type: 'warning'
//   }).then(() => {
//     request({
//       url: url,
//       method: 'delete',
//       params: {
//         id: id
//       }
//     }).then(() => {
//       ElNotification({
//         title: '成功',
//         message: '删除成功',
//         type: 'success',
//         duration: 2000
//       })
//       options && options.done()
//     })
//   })
// }

const formatJson = (list, filterVal) => {
  return list.map(v => filterVal.map(j => {
    return v[j]
  }))
}

common.$get =  (url, data) => request({ url, params: data })
common.$delete = (url, data) => request({ url, method: 'delete', params: data })
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
  var newWhere = {}
  for(var key in where) {
    if(where[key] instanceof Object){
      newWhere[key] = where[key].value
    }else{
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
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }
  return (S4()+S4()+S4()+S4()+S4()+S4()+S4()+S4());
}

common.objAssign = (obj1, obj2, exclude) => {
  exclude = exclude || ''
  for (var o1 in obj1) {
    for (var o2 in obj2) {
      if (o1 === o2) {
        if(exclude.indexOf(o1) == -1){
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

// common.downloadMore = (urls, filename) => {
//   var params = {
//     urls: encodeURI(urls),
//     filename: filename || '',
//     token: getToken()
//   }
//   var form = document.createElement("form");
//   form.style.display = 'none';
//   form.action = global.baseApi + '/system/file/download';
//   form.method = 'post';
//   document.body.appendChild(form);
//   for(var key in params){
//     var input = document.createElement("input");
//     input.type = 'hidden';
//     input.name = key;
//     input.value = params[key];
//     form.appendChild(input);
//   }
//   form.submit();
//   form.remove();
// }

common.download = (urls, filename) => {
  location.href = common.downloadHref(urls, filename)
}

// common.downloadHref = (urls, filename) => {
//   return global.baseApi + `/system/file/download?urls=${encodeURI(urls)}&filename=${filename || ''}&token=${getToken()}`
// }

// common.loadConfig = async() => {
//   await request({
//     url: '/system/config/list'
//   }).then(res => {
//     const { data } = res
//     global.filePrefix = data.filePrefix
//   })
// }

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

export default common
