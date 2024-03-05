import * as vue from "vue";
import * as NaiveUI from 'naive-ui';
import * as router from '@/scripts/router'
import xicons from '@/scripts/xicons'

const libs = {
    vue,
    'naive-ui': NaiveUI,
    '@/scripts/xicons': xicons,
    '@/scripts/router': router
}

window.___magic__import__ = function(lib, name){
    if(Object.prototype.toString.call(libs[lib]) != '[object Module]' && name == '*'){
        return libs[lib]
    }
    return (libs[lib] || {})[name]
}
