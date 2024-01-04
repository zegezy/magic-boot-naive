import {useDictStore} from "@/store/modules/dictStore";
const dictStore = useDictStore()
export function getCheckboxData(props){
    let handlerData = (dictData) => {
        if(props.optionsFilter){
            dictData = dictData.filter(props.optionsFilter)
        }
        return dictData
    }
    return new Promise((resolve, reject) => {
        if (props.type) {
            resolve(handlerData(dictStore.getDictType(props.type)))
        } else if (props.url) {
            $common.get(props.url, props.params).then(res => {
                resolve(handlerData($common.mapLabelValue((res.data.list || res.data), props.labelField, props.valueField)))
            })
        } else if (props.options && props.options.length > 0) {
            resolve(handlerData($common.mapLabelValue(props.options, props.labelField, props.valueField)))
        } else{
            reject()
        }
    })
}
