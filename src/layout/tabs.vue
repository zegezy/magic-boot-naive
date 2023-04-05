<template>
    <div class="tabs">
        <n-tag
            :size="global.uiSize"
            @contextmenu="handleContextMenu(tab,$event)"
            v-for="tab in tabsStore.getTabs"
            :closable="tab.path!==`/home`"
            @close="handleClose(tab.path)"
            @click="jump(tab)"
            :type="tabsStore.getCurrentTab == tab.path ? 'primary' : 'default'"
            :class="[tabsStore.getCurrentTab == tab.path?'selected':'',global.uiSize]"
            :bordered="false"
        >
            {{ tab.meta.title }}
        </n-tag>
        <n-dropdown
            placement="bottom-start"
            trigger="manual"
            :x="xAxis"
            :y="yAxis"
            :options="dropdownOptions"
            :show="showDropdown"
            :on-clickoutside="() => showDropdown = false"
            @select="handleDropdownSelect"
        />
    </div>
</template>

<script setup>
import {useTabsStore} from '@/store/modules/tabsStore'
import router from '@/scripts/router'
import {ref, nextTick} from "vue";
import global from "@/scripts/global.js";

const tabsStore = useTabsStore()
const tabs = tabsStore.getTabs

const showDropdown = ref(false);
const dropdownOptions = ref([
    {
        label: "刷新",
        key: 'refresh'
    },
    {
        label: "关闭左侧",
        key: 'left'
    },
    {
        label: "关闭右侧",
        key: 'right'
    },
    {
        label: "关闭其他",
        key: 'other'
    }
])

// 弹出菜单展示位置
const xAxis = ref(0);
const yAxis = ref(0);

function handleClose(path) {
    if (tabs.length == 1) {
        tabs.splice(0, 1)
        router.push({
            path: '/home'
        })
    } else {
        tabs.forEach((it, i) => {
            if (it.path == path) {
                tabs.splice(i, 1)
                router.push({
                    path: tabs[tabs.length - 1].path,
                    query: tabs[tabs.length - 1].query
                })
            }
        })
    }
}

function jump(item) {
    router.push({
        path: item.path,
        query: tabs.filter(it => it.path == item.path)[0].query
    })
}

const currentPath = ref()

function handleContextMenu(item, e) {
    currentPath.value = item.path
    e.preventDefault();
    xAxis.value = e.clientX;
    yAxis.value = e.clientY;
    showDropdown.value = true;
}

function handleDropdownSelect(type) {
    if (type != 'refresh') {
        close(type)
    } else {
        tabsStore.refreshReplace({path: currentPath.value})
    }
    showDropdown.value = false;
}

function close(type) {
    let path = currentPath.value
    if (type == 'other') {
        for (let i = tabs.length - 1; i >= 0; i--) {
            if (tabs[i].path != path) {
                tabs.splice(i, 1)
            }
        }
    } else if (type == 'right') {
        for (let i = tabs.length - 1; i >= 0; i--) {
            if (tabs[i].path != path) {
                tabs.splice(i, 1)
            } else {
                break;
            }
        }
    } else {
        for (let i = 0, len = tabs.length; i < len; i++) {
            if (tabs[0].path != path) {
                tabs.splice(0, 1)
            } else {
                break;
            }
        }
    }
    router.push({
        path: path,
        query: tabs.filter(it => it.path == path)[0].query
    })
}

</script>

<style scoped lang="less">

.n-tag {
    //padding: 17px 20px;
    cursor: pointer;
    margin-right: 12px;
    border-radius: 4px;
    //flex-shrink: 0;
    transition: box-shadow;
    transition-duration: 0.25s;
}
.small:hover{
    box-shadow: 1px 1px 6px #ccc;
}

.medium:hover{
    box-shadow: 1px 1px 3px #ccc;
}

.medium{
    padding: 15px 20px;
    cursor: pointer;
    margin-right: 4px;
    border-radius: 4px;
}

.small{
    padding: 14px 17px;
    cursor: pointer;
    margin-right: 4px;
    border-radius: 4px;
}

.selected {

}

.tabs {
    width: 100%;
    height: 100%;
    overflow-x: auto;
    white-space: nowrap;
}
</style>
