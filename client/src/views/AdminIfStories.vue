<template>
  <div class="admin-if">
    <h2>IF线审核</h2>
    <el-table :data="ifStories" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="bookId" label="图书ID" width="80" />
      <el-table-column prop="chapterId" label="章节ID" width="80" />
      <el-table-column prop="userId" label="用户ID" width="80" />
      <el-table-column label="来源" width="80">
        <template #default="{ row }">
          <el-tag :type="row.source === 'ai' ? 'warning' : 'primary'">{{ row.source === 'ai' ? 'AI' : '读者' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容" show-overflow-tooltip />
      <el-table-column prop="wordCount" label="字数" width="80" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" type="success" @click="review(row.id, 'approved')">通过</el-button>
          <el-button size="small" type="danger" @click="review(row.id, 'rejected')">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { ElMessage } from 'element-plus'

const ifStories = ref([])
const loading = ref(false)

const fetchList = async () => {
  loading.value = true
  try {
    const res = await api.get('/api/if-stories/pending')
    ifStories.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)

const review = async (id, status) => {
  try {
    await api.put(`/api/if-stories/${id}/review`, { status })
    ElMessage.success(status === 'approved' ? '已通过' : '已拒绝')
    fetchList()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}
</script>

<style scoped>
.admin-if h2 { margin-bottom: 20px; }
</style>
