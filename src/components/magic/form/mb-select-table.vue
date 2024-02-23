<style scoped>
.mb-list{
    border-radius: 5px;
    border: 1px solid #ccc;
    background: white;
    padding: 10px;
}
</style>

<template>
    <div class="list-container" ref="listContainer">
        <mb-input ref="magicInput" @focus="inputFocus" @blur="inputBlur" v-model="inputValue" />
        <div class="mb-list" :style="{ width: width + 'px', height: height + 'px', ...componentStyle }" v-if="showList">
            <div class="mb-search">
                <mb-search :where="tableOptions.where" @search="reloadTable" />
            </div>
            <div class="mb-table">
                <mb-table
                    ref="magicTable"
                    v-bind="tableOptions"
                    v-model:checked-row-keys="checkedRowKeys"
                    @dblclick="tableDblclick"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import { clone } from 'lodash-es'
const magicTable = ref()
const magicInput = ref()
const listContainer = ref()
const checkedRowKeys = ref()
const showList = ref(false)

const props = defineProps({
    modelValue: {
        required: true
    },
    selectRowData: {
        type: Object,
        default: () => {}
    },
    width: {
        type: Number,
        default: 500
    },
    height: {
        type: Number,
        default: 300
    },
    tableOptions: {
        type: Object,
        default: () => {}
    },
    selectRowCallback: {
        type: Function,
        default: () => {}
    }
})
const inputValue = ref(clone(props.modelValue))
watch(() => props.modelValue, (value) => {
    inputValue.value = value
})

watch(() => listContainer.value, () => {
    onClickOutside(listContainer, () => showList.value = false)
})

function tableDblclick({ row }){
    showList.value = false
    props.selectRowCallback(props.selectRowData, row)
}
const componentStyle = ref()
function inputFocus(){
    let style = {}
    let inputRect = magicInput.value.$el.getBoundingClientRect()
    let bodyClientWidth = document.body.clientWidth
    let bodyClientHeight = document.body.clientHeight
    let top = inputRect.y + inputRect.height
    let left = inputRect.x
    style.position = 'fixed'
    style['z-index'] = 999999
    if((bodyClientWidth - props.width - left) < 1){
        style.right = `1px`
        style.left = 'unset'
    }else{
        style.left = `${left}px`
        style.right = 'unset'
    }

    if((bodyClientHeight - props.height - top) < 1){
        style.bottom = `${bodyClientHeight - inputRect.y}px`
        style.top = 'unset'
    }else{
        style.top = `${top}px`
        style.bottom = 'unset'
    }
    componentStyle.value = style
    showList.value = true
}

function inputBlur(){
    // setTimeout(() => magicInput.value.$refs[Object.keys(toRaw(magicInput.value.$refs))[0]].focus(), 0)
    // showList.value = false
}

function reloadTable() {
    magicTable.value.reload()
}

</script>
