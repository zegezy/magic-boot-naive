<template>
  <div class="icons-container">
    <el-tabs type="border-card">
      <el-tab-pane label="Icons">
        <div class="grid">
          <div v-for="item of svgIcons" :key="item" @click="selectIcon(item)">
            <el-tooltip placement="top">
              <template #content>
                <mb-icon :icon="item" />
              </template>
              <div class="icon-item">
                <mb-icon :icon="item" />
                <span>{{ item }}</span>
              </div>
            </el-tooltip>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import svgIcons from '@/scripts/svg-icons'
const props = defineProps({
  selectIcon: Function
})

</script>

<style lang="scss" scoped>
.icons-container {
  margin: 10px 20px 0;
  overflow: hidden;

  .grid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }

  .icon-item {
    margin: 20px;
    height: 85px;
    text-align: center;
    width: 100px;
    float: left;
    font-size: 30px;
    color: #24292e;
    cursor: pointer;
  }

  span {
    display: block;
    font-size: 16px;
    margin-top: 10px;
  }

  .disabled {
    pointer-events: none;
  }
}
</style>
