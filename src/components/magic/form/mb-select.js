import {useDictStore} from "@/store/modules/dictStore";
import common from "@/scripts/common";
const dictStore = useDictStore()
let props = {}
export function getSelectData(_props){
    props = _props
    return new Promise((resolve, reject) => {
        if (props.type) {
            resolve(listConcat(dictStore.getDictType(props.type)))
        } else if (props.url) {
            common.$get(props.url, props.params).then(res => {
                resolve(listConcat(handlerData(res.data.list || res.data)))
            })
        } else if (props.options && props.options.length > 0) {
            resolve(listConcat(handlerData(props.options)))
        } else{
            reject()
        }
    })
}

function listConcat(dictData) {
    let selectList = []
    if(props.optionsFilter){
        dictData = dictData.filter(props.optionsFilter)
    }
    if (props.allOption) {
        selectList = [{
            value: '',
            label: '全部'
        }]
        selectList = selectList.concat(dictData)
    } else {
        selectList = dictData
    }
    return selectList
}

function handlerData(data) {
    let newData = []
    data.forEach(it => {
        newData.push({
            label: it[props.labelField || 'label'],
            value: it[props.valueField || 'value'].toString()
        })
    })
    return newData
}
