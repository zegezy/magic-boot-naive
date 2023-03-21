import { reactive, watch } from "vue";
import common from "@/scripts/common";

function requestData(props, bindProps, where) {
  bindProps.loading = true
  if (props.page) {
    where.current = bindProps.pagination.page
    where.size = props.size
  } else {
    where.size = 99999999
  }
  let processData = (res) => {
    const { data } = res
    bindProps.data = data.list
    bindProps.loading = false
    bindProps.pagination.pageCount = Math.ceil(data.total / where.size)
    bindProps.pagination.itemCount = data.total
    props.done()
  }
  if(props.method.toLowerCase() == 'post'){
    common.$post(props.url, where).then(processData)
  }else{
    common.$get(props.url, where).then(processData)
  }
}

export function createTable(props) {
  const bindProps = reactive(props.props || {})
  if(props.page){
    bindProps.pagination = {
      page: 1,
      pageCount: 1,
      pageSize: props.size
    }
  }
  bindProps.remote = !!props.url
  bindProps.loading = false
  watch(() => props.data, (value) => {
    if(props.page){
      bindProps.pagination.page = 1
    }
    bindProps.data = props.data
  }, { deep: true })
  const where = reactive(common.renderWhere(props.where))
  const loadData = () => {
    if(props.url){
      requestData(props, bindProps, where)
    }
  }
  watch(() => props.loading, value => bindProps.loading = value)
  return {
    handlerPage(currentPage){
      bindProps.pagination.page = currentPage
      loadData()
    },
    loadData,
    getBindProps(){
      return bindProps
    }
  }
}
