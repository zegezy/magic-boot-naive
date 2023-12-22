<template>
    <mb-tree ref="tree" v-model="menus" style="height: 320px" url="/system/menu/tree" :search="true"
             search-width="230px"/>
</template>

<script setup>
import {ref} from 'vue'

const emit = defineEmits(['close'])
const props = defineProps({
    id: {
        type: String,
        default: ''
    }
})

const menus = ref('')

$common.get('/system/menu/by/role', {roleId: props.id}).then(res => {
    menus.value = res.data.join(',')
})

function save(d) {
    d.loading()
    $common.post('/system/role/save', {
        id: props.id,
        menus: menus.value
    }).then((response) => {
        d.hideLoading()
        $message.success('分配成功')
        emit('close')
    }).catch(() => d.hideLoading())
}

defineExpose({save})

</script>
