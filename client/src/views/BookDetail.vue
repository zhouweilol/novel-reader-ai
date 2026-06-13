<template>
  <div class="book-detail">
    <el-page-header @back="$router.back()" title="返回" />

    <div v-if="error" class="error-tip">{{ error }}</div>
    <div class="content" v-else-if="book">
      <el-row :gutter="40">
        <el-col :span="8">
          <div class="cover">
            <img v-if="book.coverUrl" :src="book.coverUrl" alt="封面" />
            <div v-else class="no-cover">暂无封面</div>
          </div>
        </el-col>
        <el-col :span="16">
          <h1>{{ book.title }}</h1>
          <p class="author">作者：{{ book.author }}</p>
          <p class="description">{{ book.description || '暂无简介' }}</p>
        </el-col>
      </el-row>

      <div class="chapters-section">
        <h2>目录</h2>
        <div v-if="readingProgress" class="progress-bar">
          <span>上次读到：第 {{ readingProgress.chapterNum }} 章</span>
          <el-button type="primary" size="small" @click="$router.push(`/chapter/${readingProgress.chapterId}`)">继续阅读</el-button>
        </div>
        <el-table :data="chapters" stripe>
          <el-table-column prop="chapterNum" label="章节号" width="100" />
          <el-table-column prop="title" label="章节标题" />
          <el-table-column prop="wordCount" label="字数" width="100" />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button type="primary" link @click="$router.push(`/chapter/${row.id}`)">阅读</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const book = ref(null)
const chapters = ref([])
const readingProgress = ref(null)
const error = ref('')

onMounted(async () => {
  const id = route.params.id
  try {
    const [bookRes, chaptersRes] = await Promise.all([
      api.get(`/api/books/${id}`),
      api.get(`/api/books/${id}/chapters`)
    ])
    book.value = bookRes.data
    chapters.value = chaptersRes.data

    // 检查阅读进度（确认章节仍存在）
    try {
      const saved = localStorage.getItem(`reading_progress_${id}`)
      if (saved) {
        const progress = JSON.parse(saved)
        if (chapters.value.some(c => c.id === progress.chapterId)) {
          readingProgress.value = progress
        } else {
          localStorage.removeItem(`reading_progress_${id}`)
        }
      }
    } catch {}
  } catch (err) {
    if (err?.response?.status === 404) {
      error.value = '该图书不存在或已下架'
    } else {
      error.value = '加载失败，请刷新页面重试'
    }
  }
})
</script>

<style scoped>
.book-detail {
  padding: 20px;
}

.content {
  margin-top: 20px;
}

.cover {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cover img {
  width: 100%;
  display: block;
}

.no-cover {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
}

h1 {
  margin: 0 0 10px 0;
}

.author {
  color: #666;
  margin-bottom: 20px;
}

.description {
  line-height: 1.8;
  color: #333;
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: #ecf5ff;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #409eff;
}

.chapters-section {
  margin-top: 40px;
}
.error-tip {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}
</style>
