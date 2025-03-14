<template>
  <div>分享列表</div>
</template>

<script setup>
import { onActivated } from 'vue'
import { useGlobalStore } from '../../stores/global'

const globalStore = useGlobalStore()
onActivated(() => {
  globalStore.setFileListInfo('')
})
</script>

<style lang="less" scoped></style>
