<template>
    <div class="mb-list">
        <div class="mb-search">
            <mb-search v-if="table.where" :where="table.where" :no-reset="search && search.noReset" @search="reload"/>
        </div>
        <div class="mb-toolbar" v-if="tools && tools.length > 0">
            <template v-for="(it, i) in tools" :key="i">
                <n-button v-if="it.type == 'add'" v-permission="it.permission" type="primary" @click="it.click">
                    {{ it.label || '添加' }}
                </n-button>
                <!--        <mb-button v-else-if="it.type == 'delete'" v-permission="it.permission" :plain="true" :request-url="it.url" :btn-type="'delete'" :request-data="{ id: ids }" :after-handler="reload" />-->
                <n-button v-else :icon="it.icon" :key="it.label" v-permission="it.permission" :type="it.type"
                          :size="it.size" :class="it.class" @click="it.click(ids)">
                    {{ it.label }}
                </n-button>
            </template>
        </div>
        <div class="mb-table">
            <mb-table ref="tableRef" v-bind="table" @selection-change="selectionChange"/>
        </div>
    </div>
</template>

<script setup>
import {ref} from 'vue'

const tableRef = ref()
const ids = ref([])

const props = defineProps({
    search: {
        type: Object,
        default: () => {
        }
    },
    tools: {
        type: Array,
        default: () => []
    },
    table: {
        type: Object,
        default: () => {
        }
    }
})

props.tools.forEach(it => {
    if (it.type == 'delete') {
        props.table.selection = true
    }
})

function reload() {
    tableRef.value.reload()
}

function selectionChange(columns) {
    ids.value = columns.map(it => it['id']).join(',')
}

defineExpose({reload})

</script>
