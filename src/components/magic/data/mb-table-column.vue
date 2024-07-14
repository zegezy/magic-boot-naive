<template>
    <span>
        <template v-if="type === 'switch'">
            <mb-switch
                v-model="row[col.field]"
                @change="col.change(row)"
                v-if="col.if != undefined ? col.if(row) : true"
                :checked-value="col.checkedValue"
                :unchecked-value="col.uncheckedValue"
                v-bind="col.props"
            />
            <span v-else>-</span>
        </template>
        <template v-else-if="type === 'html'">
            <mb-table-tooltip :nowrap="nowrap">
                <span v-html="getLabel(row, col)"></span>
            </mb-table-tooltip>
            <mb-icon v-if="col.copyText" class="copy-text" icon="CopyOutline" @click="copyText(getValueByPath(row, col.field))" />
        </template>
        <template v-else-if="type === 'templet'">
            <mb-table-tooltip :nowrap="nowrap">
                <span v-html="col.templet(row, col, index)"></span>
            </mb-table-tooltip>
            <mb-icon v-if="col.copyText" class="copy-text" icon="CopyOutline" @click="copyText(col.templet(row, col, index))" />
        </template>
        <template v-else-if="type === 'buttons'">
            <n-space>
                <template v-for="it in col.buttons">
                    <slot v-if="it.type == 'dynamic'" :name="it.field" :row="row" :index="index" />
                    <n-button
                        v-else-if="it.if != undefined ? it.if(row) : true"
                        v-permission="it.permission"
                        :type="it.type"
                        :text="it.link"
                        :dashed="it.dashed"
                        :href="it.href"
                        :color="it.color"
                        :target="it.target"
                        :tag="it.tag || (it.link ? 'a' : 'button')"
                        :text-color="it.textColor || '#2D8CF0'"
                        @click="it.click(row)"
                    >
                        <template #icon v-if="it.icon">
                            <mb-icon :icon="it.icon" />
                        </template>
                        {{ it.label }}
                    </n-button>
                </template>
            </n-space>
        </template>
        <template v-else-if="type === 'dictType'">
            <mb-table-tooltip :nowrap="nowrap">
                <span>{{ dictStore.getDictLabel(col.dictType, getValueByPath(row, col.field) + '') }}</span>
            </mb-table-tooltip>
            <mb-icon v-if="col.copyText" class="copy-text" icon="CopyOutline" @click="copyText(dictStore.getDictLabel(col.dictType, getValueByPath(row, col.field) + ''))" />
        </template>
        <template v-else-if="type === 'image'">
            <n-image-group v-if="row[col.field]">
                <n-space>
                    <n-image
                        v-for="it in row[col.field].split(',')"
                        lazy
                        :width="componentProperties.table.image.width"
                        :height="componentProperties.table.image.height"
                        :src="it && it.startsWith('http') ? it : $global.filePrefix + encodeURIComponent(it)"
                    />
                </n-space>
            </n-image-group>
        </template>
        <template v-else>
            <mb-table-tooltip :nowrap="nowrap">
                <span v-html="getLabel(row, col)"></span>
            </mb-table-tooltip>
            <mb-icon v-if="col.copyText" class="copy-text" icon="CopyOutline" @click="copyText(getLabel(row, col))" />
        </template>
    </span>
</template>

<script setup>
import {get as getValueByPath} from "lodash-es";
import componentProperties from '@/components/magic-component-properties'
import {useDictStore} from "@/store/modules/dictStore";

const dictStore = useDictStore()
const props = defineProps({
    type: {
        type: String,
        default: ''
    },
    row: {
        type: Object,
        default: () => {}
    },
    col: {
        type: Object,
        default: () => {}
    },
    index: {
        type: Number,
        default: undefined
    },
    nowrap: {
        type: Boolean,
        default: undefined
    }
})
function copyText(text){
    $common.copyText(text)
}
function getLabel(row, col){
    return $common.notEmptyNot01(getValueByPath(row, col.field)) ? getValueByPath(row, col.field) : $common.notEmptyNot01(col.defaultValue) ? col.defaultValue : ''
}
</script>
