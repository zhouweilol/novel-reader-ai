<template>
  <div class="admin-stats">
    <h2>数据统计</h2>
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="8" v-for="item in statItems" :key="item.label">
        <el-card class="stat-card">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const stats = ref({})

const statItems = ref([
  { label: '图书总数', value: 0 },
  { label: '章节总数', value: 0 },
  { label: '用户总数', value: 0 },
  { label: 'IF线作品', value: 0 },
  { label: '待审核', value: 0 },
])

onMounted(async () => {
  try {
    const res = await api.get('/api/admin/stats')
    stats.value = res.data
    statItems.value[0].value = res.data.bookCount || 0
    statItems.value[1].value = res.data.chapterCount || 0
    statItems.value[2].value = res.data.userCount || 0
    statItems.value[3].value = res.data.ifStoryCount || 0
    statItems.value[4].value = res.data.pendingReviewCount || 0
  } catch (e) {
    console.error('获取统计数据失败:', e)
  }
})
</script>

<style scoped>
.admin-stats h2 { margin-bottom: 20px; }
.stat-card { text-align: center; padding: 20px; }
.stat-value { font-size: 36px; font-weight: bold; color: #409eff; }
.stat-label { margin-top: 10px; color: #666; font-size: 14px; }
</style>
