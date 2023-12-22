<template>
    <n-form
        ref="dataForm"
        :rules="rules"
        :model="formData"
        v-bind="form.props"
    >
        <n-grid v-for="(row,i) in form.rows" :key="i" :cols="row.gutter">
            <n-gi v-for="(col,j) in row.cols" :key="j" :span="col.span" v-bind="col.colProps">
                <n-form-item :label="col.label" :label-width="col.labelWidth" :path="col.name"
                             v-bind="col.formItemProps">
                    <slot v-if="col.component == 'dynamic'" :name="col.name" :form-data="formData" :col="col"></slot>
                    <component
                        v-else
                        :is="!col.component ? 'mb-input' : col.component.startsWith('n-') || $global.dynamicComponentNames.indexOf(col.component) != -1 ? col.component : 'mb-' + col.component"
                        v-model="formData[col.name]"
                        :item-label="col.label"
                        v-bind="col.props"
                        @change="col.change"
                    />
                </n-form-item>
            </n-gi>
        </n-grid>
    </n-form>
</template>

<script setup>
import {ref, reactive, watch} from 'vue'

const rules = reactive(getRules())
const formData = ref({})
const dataForm = ref()
const props = defineProps({
    form: {
        type: Object,
        default: () => {
        }
    },
    detail: {
        type: Object,
        default: () => {
        }
    },
    add: {
        type: Object,
        default: () => {
        }
    },
    primaryField: {
        type: String,
        default: 'id'
    }
})
const emit = defineEmits(['reload'])
watch(() => [props.detail && props.detail.formData, props.add && props.add.formData], (value) => {
    value.forEach(it => {
        if (it) {
            formData.value = $common.objectAssign(formData.value, it)
        }
    })
}, {deep: true})

props.form.props = props.form.props || {}
$common.setDefaultValue(props.form.props, 'labelPosition', 'right')
$common.setDefaultValue(props.form.props, 'labelWidth', '')

if (props.add && props.add.formData) {
    formData.value = $common.objectAssign(formData.value, props.add.formData)
}

function getRules() {
    let _rules = {}
    props.form.rows.forEach(row => {
        row.cols.forEach(col => {
            if (col.rules) {
                _rules[col.name] = col.rules
            }
        })
    })
    return _rules
}

function getData() {
    let data = {}
    props.form.rows.forEach(row => {
        row.cols.forEach(col => {
            data[col.name] = col.defaultValue || undefined
        })
    })
    return data
}

function initFormData() {
    formData.value = getData()
}

function getFormData() {
    return formData.value
}

function save(d) {
    dataForm.value.validate((errors) => {
        if (!errors) {
            d.loading()
            $common.post(props.form.request.url, formData.value).then(res => {
                d.hideLoading()
                $message.success((!formData.value[props.primaryField] ? '创建' : '修改') + '成功')
                d.hide()
                emit('reload')
            }).catch(() => d.hideLoading())
        }
    })
}

function getDetail(id) {
    formData.value = props.detail.formData || {}
    if (props.detail && props.detail.request) {
        let _formData = getData()
        _formData[props.primaryField] = id
        $common.get(props.detail.request.url, {[props.primaryField]: id}).then(res => {
            const {data} = res
            for (let t in _formData) {
                if ((data[t] || data[t] === 0) && (!props.detail.excludeAssign || props.detail.excludeAssign.indexOf(t) === -1)) {
                    _formData[t] = data[t]
                }
            }
            if (formData.value) {
                formData.value = $common.objectAssign(_formData, formData.value)
            } else {
                formData.value = _formData
            }
            if (props.detail.handlerFormData) {
                props.detail.handlerFormData(formData.value)
            }
        })
    } else {
        if (props.detail.handlerFormData) {
            props.detail.handlerFormData(formData.value)
        }
    }
}

defineExpose({save, getDetail, getFormData, initFormData})

</script>
