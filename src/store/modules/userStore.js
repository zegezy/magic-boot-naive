import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sha256 } from "js-sha256"
import common from '@/scripts/common'

export const useUserStore = defineStore('user', () => {
  const tokenKey = 'magic_boot_token'
  const auths = ref([])
  const info = ref({})
  const permissionRouters = ref([])

  const getAuths = computed(() => auths.value)
  const getInfo = computed(() => info.value)
  const getPermissionRouters = computed(() => permissionRouters.value)

  function setAuths(value) {
    auths.value = value
  }
  function setInfo(value) {
    info.value = value
  }
  function setPermissionRouters(value) {
    permissionRouters.value = value
  }

  function pushPermissionRouter(value){
    permissionRouters.value.push(value)
  }

  function clear(){
    setAuths([])
    setInfo({})
    setPermissionRouters([])
  }

  function getToken() {
    return localStorage.getItem(tokenKey)
  }

  function setToken(token) {
    localStorage.setItem(tokenKey, token)
  }

  function removeToken() {
    localStorage.removeItem(tokenKey)
    clear()
  }

  async function getUserInfo() {
    await common.$get('/system/user/info').then(res => {
      const { data } = res
      if(data){
        const authorities_ = []
        for (let i = 0; i < data.authorities.length; i++) {
          authorities_.push(data.authorities[i])
        }
        setAuths(authorities_)
        setInfo(data)
      }
    })
  }

  function login(data){
    return new Promise((resolve, reject) => {
      common.$postJson('/system/security/login', {
        username: data.username,
        password: sha256(data.password),
        code: data.code,
        uuid: data.uuid
      }).then(res => {
        let token = res.data
        setToken(token)
        resolve(token)
      }).catch((e) => {
        reject(e)
      })
    })
  }

  function logout(){
    common.$get('/system/security/logout').then(() => {
      removeToken()
      location.reload()
    })
  }

  return {
    getAuths,
    getInfo,
    getPermissionRouters,
    setAuths,
    pushPermissionRouter,
    getToken,
    getUserInfo,
    login,
    logout
  }

})