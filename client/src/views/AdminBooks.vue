<template>
  <div class="admin-books">
    <div class="toolbar">
      <h2>图书管理</h2>
      <el-button type="primary" @click="openDialog()">添加图书</el-button>
    </div>

    <el-table :data="books" border stripe>
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="title" label="书名" />
      <el-table-column prop="author" label="作者" width="120" />
      <el-table-column prop="description" label="简介" show-overflow-tooltip />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'danger'">{{ row.isActive ? '上架' : '下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="openDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="isEdit ? '编辑图书' : '添加图书'" v-model="dialogVisible" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="书名">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="form.author" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="封面URL">
          <el-input v-model="form.coverUrl" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.isActive" active-text="上架" inactive-text="下架" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const books = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const form = ref({})

const fetchBooks = async () => {
  const res = await api.get('/api/books')
  books.value = res.data
}

onMounted(fetchBooks)

const openDialog = (row) => {
  if (row) {
    isEdit.value = true
    form.value = { ...row }
  } else {
    isEdit.value = false
    form.value = { title: '', author: '', description: '', coverUrl: '', isActive: true }
  }
  dialogVisible.value = true
}

const handleSave = async () => {
  try {
    if (isEdit.value) {
      await api.put(`/api/books/${form.value.id}`, form.value)
      ElMessage.success('更新成功')
    } else {
      await api.post('/api/books', form.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    fetchBooks()
  } catch (e) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm('确定删除该图书？', '提示', { type: 'warning' })
  await api.delete(`/api/books/${row.id}`)
  ElMessage.success('删除成功')
  fetchBooks()
}
</script>

<style scoped>
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.toolbar h2 { margin: 0; }
</style>
