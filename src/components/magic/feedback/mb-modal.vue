<template>
  <n-modal
    v-model:show="showModal"
    preset="dialog"
    :title="title"
    :show-icon="false"
    :mask-closable="false"
    :style="{ width }"
  >
    <slot />
    <template #action>
      <slot name="action">
        <n-button @click="() => showModal = false">关闭</n-button>
        <n-button type="primary" :loading="confirmLoading" @click="confirm">
          确认
        </n-button>
      </slot>
    </template>
  </n-modal>
</template>

<script setup>
  import { ref } from 'vue'
  const emit = defineEmits(['confirm'])
  const props = defineProps({
    title: {
      type: String,
      default: ''
    },
    width: {
      type: String,
      default: ''
    }
  })
  const showModal = ref(false)
  const confirmLoading = ref(false)
  function show(){
    showModal.value = true
  }
  function hide(){
    showModal.value = false
  }

  function loading(){
    confirmLoading.value = true
  }

  function hideLoading(){
    confirmLoading.value = false
  }

  function confirm(){
    emit('confirm', {
      loading,
      hideLoading,
      hide,
      title: props.title
    })
  }

  defineExpose({ show, hide, loading, hideLoading })
</script>