<template>
  <div>
    <button @click="settingAuths">
      赋值 auths
    </button>
    {{ store.getAuths }}
  </div>
</template>

<script setup>
import { useUserStore } from "@/store/modules/userStore"

const store = useUserStore()

function settingAuths(){
  if(store.getAuths.length > 0){
    alert(1)
    store.getAuths.push(9)
  }
  store.setAuths(['1','2','3','4'])
}

</script>