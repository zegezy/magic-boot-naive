import global from '@/scripts/global'
import common from "@/scripts/common";
import treeTable from '@/scripts/treeTable'

export function setupGlobalProperties(app) {
    app.config.globalProperties.$global = global
    window['$global'] = global
    window['$common'] = common
    window['$treeTable'] = treeTable
    document.body.addEventListener('keyup', (e) => {
        if(e.keyCode === 27){ // esc
            let maxIndexObject = null;
            for (let key in global.modal.modalMap) {
                if (global.modal.modalMap[key].value === true) {
                    if (!maxIndexObject || global.modal.modalMap[key].index > maxIndexObject.index) {
                        maxIndexObject = global.modal.modalMap[key];
                    }
                }
            }
            if(maxIndexObject){
                maxIndexObject.value = false
            }
        }
    })
}
