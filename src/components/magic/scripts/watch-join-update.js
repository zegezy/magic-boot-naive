import {computed, watch} from 'vue'
import {isArray, isNumber, isString} from "lodash-es";

/**
 * 监听组件值变化的工具函数
 * @param {Ref} componentValue - 组件的值
 * @param {Object} props - 组件的props
 * @param {Object} props.multiple - 是否开启多选
 * @param {Object} props.join - 当多选时，是否使用逗号join。如果是false则modelValue是Array
 * @param {Object} props.modelValue - 组件的值
 * @param {Function} emit - 触发事件的函数
 * @returns {Array} 返回watch清理函数数组
 */
export function watchValue(componentValue, props, emit){
    let watchList = []
    let multiple = props.multiple
    let join = props.join
    if(!multiple){
        join = false
    }
    const getComponentValue = computed(() => {
        if (join) {
            return componentValue.value && componentValue.value.join(',')
        } else {
            return componentValue.value
        }
    })
    let componentValueWatch = false
    let setValue = (value) => {
        if(isArray(value)){
            value = value.map(v => v.toString())
            componentValue.value = value
        }else if(isNumber(value)){
            join = multiple
            componentValue.value = props.multiple ? value.toString().split(',') : value.toString()
        }else if(isString(value)){
            join = multiple
            componentValue.value = props.multiple ? value.split(',') : value
        }else{
            componentValue.value = value
        }
        if (!componentValueWatch) {
            watchList.push(watch(componentValue, (value) => {
                if (join) {
                    emit('update:modelValue', value && value.join(','))
                    emit('change', value && value.join(','))
                } else {
                    emit('update:modelValue', value)
                    emit('change', value)
                }
            }))
        }
        componentValueWatch = true
    }
    setValue(props.modelValue)
    watchList.push(watch(() => props.modelValue, (value) => {
        // 如果传过来的值和选择的值不一样则更新
        if(!$common.arrayStringEq(value, getComponentValue.value)){
            setValue(value)
        }
    }))
    return watchList
}
