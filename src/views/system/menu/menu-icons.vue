<template>
    <div class="icons-container">
        <n-tabs type="line" animated>
            <n-tab-pane v-for="tab in tabs" :name="tab.name" :tab="tab.tab">
                <div class="grid">
                    <div v-for="icon of tab.icons" :key="icon" @click="selectIcon(icon)">
                        <n-tooltip placement="top" trigger="hover">
                            <template #trigger>
                                <mb-icon :icon="icon" size="2em" />
                            </template>
                            <div class="icon-item">
                                <span>{{ icon }}</span>
                            </div>
                        </n-tooltip>
                    </div>
                </div>
            </n-tab-pane>
        </n-tabs>
    </div>
</template>

<script setup>
import svgIcons from '@/scripts/svg-icons'
import xicons from '@/scripts/xicons'
import { ref } from 'vue'
const props = defineProps({
  selectIcon: Function
})
const tabs = ref([{
    name: 'dynamic',
    tab: '自定义',
    icons: svgIcons
}, {
    name: 'xicons',
    tab: 'xicons',
    icons: Object.keys(xicons)
}])
</script>

<style lang="less" scoped>
.icons-container {
    margin: 10px 20px 0;
    overflow: hidden;

    .grid {
        position: relative;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }

    .icon-item {
        margin: 20px;
        height: 85px;
        text-align: center;
        width: 100px;
        float: left;
        font-size: 30px;
        color: #24292e;
        cursor: pointer;
    }

    span {
        display: block;
        font-size: 16px;
        margin-top: 10px;
    }

    .disabled {
        pointer-events: none;
    }
}
</style>
