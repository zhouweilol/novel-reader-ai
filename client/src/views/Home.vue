<template>
  <div class="home">
    <el-header class="header">
      <div class="logo">小说阅读器</div>
      <div class="nav">
        <el-input v-model="searchText" placeholder="搜索小说" class="search-input">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button v-if="!userStore.isLoggedIn" type="primary" @click="$router.push('/login')">登录</el-button>
        <el-button v-if="userStore.isLoggedIn && !userStore.isAdmin" @click="$router.push('/writer')">作家工作台</el-button>
        <el-button v-if="userStore.isAdmin" @click="$router.push('/admin')">管理后台</el-button>
        <el-dropdown v-if="userStore.isLoggedIn">
          <el-button type="primary">
            {{ userStore.user?.phone }}
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="userStore.logout()">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-main class="main">
      <div class="section">
        <h2>热门推荐</h2>
        <el-row :gutter="20">
          <el-col :span="6" v-for="book in books" :key="book.id">
            <el-card class="book-card" @click="$router.push(`/book/${book.id}`)">
              <div class="book-cover">
                <img v-if="book.coverUrl" :src="book.coverUrl" alt="封面" />
                <div v-else class="no-cover">暂无封面</div>
              </div>
              <div class="book-info">
                <h3>{{ book.title }}</h3>
                <p>{{ book.author }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../store/user'
import api from '../api'

const userStore = useUserStore()
const books = ref([])
const searchText = ref('')

onMounted(async () => {
  try {
    const res = await api.get('/api/books')
    books.value = res.data
  } catch (error) {
    console.error('获取图书列表失败:', error)
  }
})
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-input {
  width: 300px;
}

.main {
  padding: 20px;
  background: #f5f5f5;
}

.section h2 {
  margin-bottom: 20px;
}

.book-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.book-card:hover {
  transform: translateY(-5px);
}

.book-cover {
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
  margin-bottom: 10px;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-cover {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
}

.book-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.book-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style>
