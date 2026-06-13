<template>
  <div class="writer-workspace">
    <div class="page-header">
      <h2>作家工作台</h2>
      <div class="quota-info">
        <span v-if="quota.isAdmin">管理员 · 无上传限制</span>
        <span v-else>
          今日已上传：<strong>{{ quota.used }}</strong> / {{ quota.limit === Infinity ? '∞' : quota.limit }} 章
          <el-progress
            v-if="quota.limit !== Infinity"
            :percentage="Math.round((quota.used / quota.limit) * 100)"
            :status="quota.used >= quota.limit ? 'exception' : ''"
            :show-text="false"
            style="width: 120px; display: inline-flex; margin-left: 8px;"
          />
        </span>
      </div>
    </div>

    <el-tabs v-model="activeTab">
      <!-- 我的图书 -->
      <el-tab-pane label="我的图书" name="books">
        <div class="toolbar">
          <el-button type="primary" @click="openBookDialog()">创建图书</el-button>
        </div>
        <el-row :gutter="20">
          <el-col :span="8" v-for="book in books" :key="book.id">
            <el-card class="book-card" @click="selectBook(book)">
              <div class="book-cover">
                <img v-if="book.coverUrl" :src="book.coverUrl" alt="封面" />
                <div v-else class="no-cover">暂无封面</div>
              </div>
              <div class="book-info">
                <h4>{{ book.title }}</h4>
                <p>{{ book.author }}</p>
                <el-tag :type="book.isActive ? 'success' : 'danger'" size="small">
                  {{ book.isActive ? '上架' : '下架' }}
                </el-tag>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <!-- 章节管理 -->
      <el-tab-pane label="章节管理" name="chapters" :disabled="!selectedBook">
        <template #label>
          章节管理
          <el-tag v-if="selectedBook" size="small" style="margin-left: 6px;">{{ selectedBook.title }}</el-tag>
        </template>
        <ChapterManager :book-id="selectedBook?.id" :quota="quota" @refresh="refreshQuota" />
      </el-tab-pane>
    </el-tabs>

    <!-- 创建/编辑图书对话框 -->
    <el-dialog :title="editingBook ? '编辑图书' : '创建图书'" v-model="bookDialogVisible" width="500px">
      <el-form :model="bookForm" label-width="80px">
        <el-form-item label="书名"><el-input v-model="bookForm.title" /></el-form-item>
        <el-form-item label="作者"><el-input v-model="bookForm.author" /></el-form-item>
        <el-form-item label="简介"><el-input v-model="bookForm.description" type="textarea" /></el-form-item>
        <el-form-item label="封面URL"><el-input v-model="bookForm.coverUrl" /></el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="bookForm.isActive" active-text="上架" inactive-text="下架" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bookDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBook">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'
import ChapterManager from '../components/ChapterManager.vue'

const userStore = useUserStore()
const activeTab = ref('books')
const books = ref([])
const selectedBook = ref(null)
const bookDialogVisible = ref(false)
const editingBook = ref(null)
const bookForm = ref({ title: '', author: '', description: '', coverUrl: '', isActive: true })
const quota = ref({ used: 0, limit: 10, isAdmin: false })

const refreshQuota = async () => {
  try {
    const res = await api.get('/api/writer/upload-stats')
    quota.value = res.data
  } catch { /* ignore */ }
}

onMounted(async () => {
  await refreshQuota()
  const res = await api.get('/api/books')
  // 非 admin 只看自己的书
  if (userStore.isAdmin) {
    books.value = res.data
  } else {
    books.value = res.data.filter(b => b.userId === userStore.user?.id)
  }
})

const selectBook = (book) => {
  selectedBook.value = book
  activeTab.value = 'chapters'
}

const openBookDialog = (book) => {
  if (book) {
    editingBook.value = book
    bookForm.value = { ...book }
  } else {
    editingBook.value = null
    bookForm.value = { title: '', author: userStore.user?.phone || '', description: '', coverUrl: '', isActive: true }
  }
  bookDialogVisible.value = true
}

const saveBook = async () => {
  try {
    if (editingBook.value) {
      await api.put(`/api/books/${editingBook.value.id}`, bookForm.value)
      ElMessage.success('更新成功')
    } else {
      await api.post('/api/books', bookForm.value)
      ElMessage.success('创建成功')
    }
    bookDialogVisible.value = false
    // 重新加载图书列表
    const res = await api.get('/api/books')
    books.value = userStore.isAdmin ? res.data : res.data.filter(b => b.userId === userStore.user?.id)
  } catch (e) {
    ElMessage.error('操作失败')
  }
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h2 { margin: 0; }
.quota-info { display: flex; align-items: center; gap: 8px; color: #666; font-size: 14px; }
.toolbar { margin-bottom: 16px; }
.book-card { cursor: pointer; transition: transform 0.2s; }
.book-card:hover { transform: translateY(-3px); }
.book-cover { height: 180px; overflow: hidden; border-radius: 4px; margin-bottom: 10px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; }
.book-cover img { width: 100%; height: 100%; object-fit: cover; }
.no-cover { color: #999; font-size: 14px; }
.book-info h4 { margin: 0 0 4px 0; }
.book-info p { margin: 0 0 8px 0; color: #666; font-size: 13px; }
</style>
