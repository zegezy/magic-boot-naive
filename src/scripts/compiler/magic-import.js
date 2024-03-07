import * as vue from "vue";
import * as NaiveUI from 'naive-ui';
import * as router from '@/scripts/router'
import xicons from '@/scripts/xicons'
import svgIcons from '@/scripts/svg-icons'
import * as dictStore from "@/store/modules/dictStore";
import * as userStore from "@/store/modules/userStore";
import MbIcon from '@/components/magic/basic/mb-icon.vue';
import * as lodashEs from 'lodash-es'
import * as vueRouter from 'vue-router'

const libs = {
    vue,
    'naive-ui': NaiveUI,
    '@/scripts/xicons': xicons,
    '@/scripts/svg-icons': svgIcons,
    '@/scripts/router': router,
    '@/store/modules/dictStore': dictStore,
    '@/store/modules/userStore': userStore,
    '@/components/magic/basic/mb-icon.vue': MbIcon,
    'lodash-es': lodashEs,
    'vue-router': vueRouter
}

window.___magic__import__ = function(lib, name){
    if(Object.prototype.toString.call(libs[lib]) != '[object Module]' && name == '*'){
        return libs[lib]
    }
    return (libs[lib] || {})[name]
}
