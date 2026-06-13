<template>
  <div class="placeholder"><h2>{{ route.meta.title || '功能开发中' }}</h2><p>该功能模块正在开发中，敬请期待。</p></div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
.placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; color: #999; }
.placeholder h2 { margin-bottom: 10px; }
</style>
