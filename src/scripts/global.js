const baseApi = import.meta.env.VITE_APP_BASE_API;
const ossPrefix = import.meta.env.VITE_APP_OSS_PREFIX;
export default {
  title: 'Magic Boot',
  baseApi: baseApi,
  ossPrefix: ossPrefix,
  filePrefix: ossPrefix ? ossPrefix : baseApi,
  dynamicComponentNames: [],
  ossBucket: ''
}
