import common from "@/scripts/common";
import treeTable from "@/scripts/treeTable";

export function getTreeSelectData(props){
    return new Promise(resolve => {
        common.$get(props.url).then(res => {
            let options = res.data.list
            treeTable.deleteEmptyChildren(options)
            resolve(options)
        })
    })
}
