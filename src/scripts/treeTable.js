import { omit } from "lodash-es";
const treeTable = {}

treeTable.isChildren = (children, id) => {
    let result = false
    for (let i in children) {
        let chi = children[i]
        if (chi.id == id) {
            result = true
        }
        if (chi.children && children.length > 0) {
            if (treeTable.isChildren(chi.children, id)) {
                result = true
            }
        }
    }
    return result
}

treeTable.queryChildren = (children, id) => {
    let result = []
    for (let i in children) {
        let chi = children[i]
        if (chi.id == id) {
            if (chi.children && chi.children.length > 0) {
                result = chi.children
            }
        } else {
            let qc = treeTable.queryChildren(chi.children, id)
            if (qc.length > 0) {
                result = qc
            }
        }
    }
    return result
}

/**
 * 把树形数据还原成一级
 */
treeTable.recursionRearrange = (children) => {
    const list = []
    children.forEach(it => {
        list.push(omit(it, 'children'))
        if(it.children && it.children.length > 0){
            list.push(...treeTable.recursionRearrange(it.children))
        }
    })
    return list
}

treeTable.genTree = (children) => {
    let treeData = []
    for (let i in children) {
        let chi = {}
        chi.label = children[i].name
        chi.key = children[i].id
        if (children[i].children && children[i].children.length > 0) {
            chi.children = treeTable.genTree(children[i].children)
        }
        treeData.push(chi)
    }
    return treeData
}

treeTable.deleteEmptyChildren = (children) => {
    for (let i in children) {
        let chi = children[i]
        if (chi.children && chi.children.length == 0) {
            delete chi.children
        } else {
            treeTable.deleteEmptyChildren(chi.children)
        }
    }
}

treeTable.recursionSearch = (fields, data, text, html) => {
    html = html != undefined ? html : true
    let searchData = []
    for (let i in data) {
        let treeNode = data[i]
        let children = treeNode.children
        if (children && children.length > 0) {
            let childrenSearch = treeTable.recursionSearch(fields, children, text, html)
            treeNode.children = childrenSearch && childrenSearch.length > 0 ? childrenSearch : treeNode.children
            treeTable.treeNodeReplace(fields, searchData, treeNode, text, childrenSearch, html)
        } else {
            treeTable.treeNodeReplace(fields, searchData, treeNode, text, null, html)
        }
    }
    return searchData
}

treeTable.treeNodeReplace = (fields, searchData, treeNode, text, childrenSearch, html) => {
    let exist = false
    fields.forEach((f) => {
        if (treeNode[f] && treeNode[f].indexOf(text) != -1) {
            if (html) {
                treeNode[f] = treeNode[f].replace(text, `<font color="#FAA353">${text}</font>`)
            }
            exist = true
        }
    })
    if (exist || (childrenSearch && childrenSearch.length > 0)) {
        searchData.push(treeNode)
    }
}

treeTable.clearFont = (data, fields) => {
    fields.forEach(field => {
        data[field] = data[field].replace(/<font.*?>(.*?)<\/font>/g, '$1')
    })
}

export default treeTable
