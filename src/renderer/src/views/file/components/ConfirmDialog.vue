<template>
  <el-dialog
    v-model="dialogShow"
    :title="props.title"
    width="400"
    @close="clickCancel"
    :close-on-click-modal="false"
  >
    <p>{{ props.content }}</p>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="clickCancel">取消</el-button>
        <el-button @click="clickCover">覆盖</el-button>
        <el-button type="primary" @click="clickSkip">跳过</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, defineProps, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '下载提示'
  },
  content: {
    type: String,
    default: '请输入内容'
  }
})

const dialogShow = ref(false)
const inputRef = ref()

watch(
  () => props.visible,
  (val) => {
    dialogShow.value = val
  }
)

const emit = defineEmits(['cancel', 'cover', 'skip'])

const clickCancel = () => {
  emit('cancel')
}

// 覆盖
const clickCover = () => {
  emit('cover')
}

// 跳过
const clickSkip = () => {
  emit('skip')
}
</script>

<style lang="less" scoped></style>
