<style scoped>
  .video{
    margin: 0 auto;
    display: table;
  }
</style>

<template>
  <video width="300" height="300" controls class="video">
    <source :src="url" type="video/mp4">
  </video>
</template>

<script setup>
  const props = defineProps({
    url: String
  })
</script>
