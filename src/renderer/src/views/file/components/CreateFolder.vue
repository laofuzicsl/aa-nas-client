<template>
  <el-dialog
    v-model="dialogShow"
    title="新建文件夹"
    width="400"
    @close="clickCancel"
    :close-on-click-modal="false"
    @opened="handleOpened"
  >
    <el-input ref="inputRef" placeholder="请输入文件夹名称" v-model="folderName"></el-input>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="clickCancel">取消</el-button>
        <el-button type="primary" @click="clickCreateFolder">确定</el-button>
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
  }
})

const dialogShow = ref(false)
const inputRef = ref()

watch(
  () => props.visible,
  (val) => {
    dialogShow.value = val
    if (val) {
      folderName.value = '新建文件夹'
    }
  }
)

const emit = defineEmits(['cancel', 'confirm'])

const folderName = ref('新建文件夹')

const clickCancel = () => {
  emit('cancel')
}

const clickCreateFolder = () => {
  emit('confirm', folderName.value)
}

const handleOpened = () => {
  const len = folderName.value.length
  inputRef.value.input.setSelectionRange(len, len)
  inputRef.value.focus()
}
</script>

<style lang="less" scoped></style>
