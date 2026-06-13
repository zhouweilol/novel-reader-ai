<template>
  <div class="admin-container">
    <el-container>
      <el-aside width="200px">
        <el-menu :default-active="activeMenu" router>
          <el-menu-item index="/admin">
            <el-icon><DataBoard /></el-icon>
            <span>数据统计</span>
          </el-menu-item>
          <el-menu-item index="/admin/books">
            <el-icon><Book /></el-icon>
            <span>图书管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/chapters">
            <el-icon><Document /></el-icon>
            <span>章节管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/if-stories">
            <el-icon><ChatLineSquare /></el-icon>
            <span>IF线审核</span>
          </el-menu-item>
          <el-menu-item index="/admin/images">
            <el-icon><Picture /></el-icon>
            <span>插图审核</span>
          </el-menu-item>
          <el-menu-item index="/admin/comments">
            <el-icon><ChatDotSquare /></el-icon>
            <span>评论管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/ai-config">
            <el-icon><Setting /></el-icon>
            <span>AI配置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<style scoped>
.admin-container {
  height: 100vh;
}

.el-aside {
  background: #fff;
  border-right: 1px solid #eee;
}

.el-menu {
  border-right: none;
}

.el-main {
  background: #f5f5f5;
}
</style>
