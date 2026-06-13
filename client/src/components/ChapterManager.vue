<template>
  <div>
    <div class="cm-toolbar">
      <span v-if="quota && !quota.isAdmin && quota.limit !== Infinity" class="quota-badge">
        今日配额：{{ quota.used }}/{{ quota.limit }}
      </span>
      <div class="cm-actions">
        <el-button @click="uploadDialogVisible = true" :disabled="quotaReached">
          <el-icon><Upload /></el-icon> 上传文档
        </el-button>
        <el-button type="primary" @click="openDialog()" :disabled="quotaReached">
          添加章节
        </el-button>
      </div>
    </div>

    <div class="chapter-scroll" ref="scrollRef" @scroll="onScroll" v-loading="loading" :style="{ maxHeight: scrollHeight + 'px' }">
      <el-table :data="displayedChapters" border stripe row-key="id">
        <el-table-column prop="chapterNum" label="序号" width="60" />
        <el-table-column prop="title" label="章节标题" min-width="200" />
        <el-table-column prop="wordCount" label="字数" width="80" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openDialog(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div v-if="hasMore" class="scroll-tip">滚动加载更多...</div>
      <div v-else-if="chapters.length > 0" class="scroll-tip">已加载全部 {{ chapters.length }} 章</div>
    </div>

    <!-- 上传文档对话框 -->
    <el-dialog title="上传文档" v-model="uploadDialogVisible" width="700px" @close="resetUpload">
      <el-upload
        ref="uploadRef"
        :http-request="customUpload"
        :show-file-list="true"
        :multiple="true"
        accept=".md,.txt,.markdown"
        drag
      >
        <el-icon :size="48"><UploadFilled /></el-icon>
        <div class="upload-text">将 .md / .txt 文件拖到此处，或点击选择</div>
        <template #tip>
          <div class="upload-tip">支持 Markdown、纯文本格式。自动识别标题（# 标题 / 第X章）并拆分章节。</div>
        </template>
      </el-upload>
      <div v-if="parsedChapters.length > 0" class="parsed-preview">
        <h4>识别到 {{ parsedChapters.length }} 个章节</h4>
        <el-table :data="parsedChapters" max-height="300" border stripe>
          <el-table-column type="index" label="#" width="40" />
          <el-table-column prop="title" label="标题" />
          <el-table-column label="字数" width="80">
            <template #default="{ row }">{{ row.content.replace(/\s/g, '').length }}</template>
          </el-table-column>
          <el-table-column label="导入" width="60">
            <template #default="{ row }"><el-switch v-model="row.selected" /></template>
          </el-table-column>
        </el-table>
        <div class="batch-actions">
          <el-button type="primary" @click="batchImport" :loading="importing" :disabled="!parsedChapters.some(c => c.selected)">
            批量导入选中章节
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="isEdit ? '编辑章节' : '添加章节'" v-model="dialogVisible" width="700px" @close="resetEditor">
      <el-form :model="form" label-width="80px">
        <el-form-item label="章节序号"><el-input-number v-model="form.chapterNum" :min="1" /></el-form-item>
        <el-form-item label="章节标题"><el-input v-model="form.title" /></el-form-item>
        <el-form-item label="章节内容">
          <el-input v-model="form.content" type="textarea" :rows="16" placeholder="请输入章节内容" />
        </el-form-item>
        <el-form-item label="字数">
          <span>{{ form.content ? form.content.replace(/\s/g, '').length : 0 }} 字</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  bookId: { type: Number, required: true },
  quota: { type: Object, default: () => ({ used: 0, limit: 10, isAdmin: false }) },
})

const emit = defineEmits(['refresh'])

const chapters = ref([])
const loading = ref(false)
const saving = ref(false)
const importing = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({})
let uploadQueue = Promise.resolve() // 上传序列化队列

const uploadDialogVisible = ref(false)
const uploadRef = ref()
const parsedChapters = ref([])

const quotaReached = computed(() => {
  if (!props.quota || props.quota.isAdmin || props.quota.limit === Infinity) return false
  return props.quota.used >= props.quota.limit
})

const fetchChapters = async () => {
  if (!props.bookId) return
  loading.value = true
  try {
    const res = await api.get(`/api/books/${props.bookId}/chapters`)
    chapters.value = res.data
  } finally {
    loading.value = false
  }
}

watch(() => props.bookId, fetchChapters)
onMounted(fetchChapters)

// 滚动分页
const scrollRef = ref(null)
const pageSize = 50
const displayCount = ref(pageSize)
const scrollHeight = computed(() => window.innerHeight - 200)
const displayedChapters = computed(() => chapters.value.slice(0, displayCount.value))
const hasMore = computed(() => displayCount.value < chapters.value.length)
const onScroll = (e) => {
  const { scrollTop, scrollHeight: sh, clientHeight } = e.target
  if (sh - scrollTop - clientHeight < 100 && hasMore.value && !loading.value) {
    displayCount.value = Math.min(displayCount.value + pageSize, chapters.value.length)
  }
}
watch(chapters, () => { displayCount.value = pageSize })

const openDialog = async (row) => {
  if (row) {
    isEdit.value = true
    saving.value = true // 复用 loading 状态
    try {
      const res = await api.get(`/api/chapters/${row.id}`)
      form.value = { ...res.data, bookId: props.bookId }
    } catch {
      ElMessage.error('获取章节详情失败')
      return
    } finally { saving.value = false }
  } else {
    isEdit.value = false
    const nextNum = chapters.value.length > 0
      ? Math.max(...chapters.value.map(c => c.chapterNum)) + 1 : 1
    form.value = { chapterNum: nextNum, title: '', content: '', bookId: props.bookId }
  }
  dialogVisible.value = true
}

const resetEditor = () => { form.value = {} }
const resetUpload = () => { parsedChapters.value = []; uploadRef.value?.clearFiles() }

const handleSave = async () => {
  if (!form.value.title.trim() || !form.value.content.trim()) {
    ElMessage.warning('标题和内容不能为空'); return
  }
  saving.value = true
  try {
    if (isEdit.value) {
      await api.put(`/api/chapters/${form.value.id}`, form.value)
      ElMessage.success('更新成功')
    } else {
      await api.post('/api/chapters', form.value)
      ElMessage.success('添加成功')
      emit('refresh')
    }
    dialogVisible.value = false
    fetchChapters()
  } catch (e) {
    ElMessage.error('操作失败')
  } finally { saving.value = false }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定删除该章节？', '提示', { type: 'warning' })
    await api.delete(`/api/chapters/${row.id}`)
    ElMessage.success('删除成功')
    fetchChapters()
  } catch (e) {
    if (e?.response?.data?.message) {
      ElMessage.error(e.response.data.message)
    }
  }
}

const customUpload = (options) => {
  // 序列化上传，避免多文件并发导致章节序号错乱
  uploadQueue = uploadQueue.then(() => doUpload(options))
}

const doUpload = async (options) => {
  const formData = new FormData()
  formData.append('file', options.file)
  formData.append('bookId', String(props.bookId))
  try {
    const res = await api.post('/api/chapters/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const baseNum = chapters.value.length + parsedChapters.value.length
    const newChapters = (res.data.chapters || []).map((c, i) => ({
      ...c, selected: true,
      chapterNum: baseNum + i + 1,
    }))
    parsedChapters.value = [...parsedChapters.value, ...newChapters]
    ElMessage.success(`${options.file.name} 解析完成，识别到 ${newChapters.length} 个章节`)
  } catch (err) {
    ElMessage.error('上传失败：' + (err?.response?.data?.message || err?.message || ''))
  }
}

const batchImport = async () => {
  const toImport = parsedChapters.value.filter(c => c.selected)
  if (toImport.length === 0) return
  importing.value = true
  try {
    const payload = {
      bookId: props.bookId,
      chapters: toImport.map((c, i) => ({
        chapterNum: chapters.value.length + i + 1,
        title: c.title,
        content: c.content,
        wordCount: c.content.replace(/\s/g, '').length,
      })),
    }
    const res = await api.post('/api/chapters/batch', payload)
    ElMessage.success(`成功导入 ${res.data.count} 个章节`)
    uploadDialogVisible.value = false
    resetUpload()
    fetchChapters()
    emit('refresh')
  } catch (e) {
    ElMessage.error(e.response?.data?.message || '导入失败')
  } finally { importing.value = false }
}
</script>

<style scoped>
.cm-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.quota-badge { color: #e6a23c; font-weight: 500; }
.cm-actions { display: flex; gap: 10px; }
.upload-text { margin-top: 12px; color: #999; font-size: 14px; }
.upload-tip { color: #999; font-size: 12px; margin-top: 4px; }
.parsed-preview { margin-top: 20px; }
.parsed-preview h4 { margin-bottom: 12px; }
.batch-actions { margin-top: 12px; text-align: right; }
.chapter-scroll { overflow-y: auto; }
.scroll-tip { text-align: center; color: #999; padding: 16px 0; font-size: 13px; }
</style>
