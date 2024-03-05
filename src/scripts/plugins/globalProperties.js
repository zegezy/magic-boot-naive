import global from '@/scripts/global'
import common from "@/scripts/common";
import treeTable from '@/scripts/treeTable'

export function setupGlobalProperties(app) {
    app.config.globalProperties.$global = global
    window['$global'] = global
    window['$common'] = common
    window['$treeTable'] = treeTable
}
