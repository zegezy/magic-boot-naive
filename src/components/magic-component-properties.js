
export default {
    table: {
        // 选中行颜色
        selectedRowColor: '#D9DDE2',
        // 单元格内容不换行显示
        nowrap: true,
        // todo 拖拽列之后回调此方法，用保存列
        // saveCols(tableId, columns) {
        //
        // },
        // todo 远程加载列
        // remoteLoadColumn() {
        //
        // },
        // todo 保存页码数
        // savePage(pageSize,tableId){
        //
        // },
        // todo 获取远程页码数
        // async getPage(tableId, callback){
        //
        // },
        // 下拉表格选项
        dropMenus: [],
        // 表头提示
        titleTooltip:{
            iconProps: {
                icon: 'QuestionCircleFilled',
                color: '#4b6fa7'
            }
        },
        // 单元格显示的图片
        image:{
            width: 30,
            height: 30
        }
    }
}
