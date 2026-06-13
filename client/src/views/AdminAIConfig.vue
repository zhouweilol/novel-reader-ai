<template>
  <div class="admin-ai">
    <h2>AI配置</h2>
    <el-card class="config-card">
      <el-form :model="form" label-width="100px" v-loading="loading">
        <el-form-item label="API Key">
          <el-input v-model="form.apiKey" type="password" show-password placeholder="请输入API Key" />
        </el-form-item>
        <el-form-item label="模型">
          <el-select v-model="form.modelName">
            <el-option label="DeepSeek" value="deepseek" />
            <el-option label="Mimo" value="mimo" />
          </el-select>
        </el-form-item>
        <el-form-item label="吐槽Prompt">
          <el-input v-model="form.promptTemplate" type="textarea" :rows="4" placeholder="输入吐槽机器人的系统提示词" />
        </el-form-item>
        <el-form-item label="AI启用">
          <el-switch v-model="form.isActive" />
        </el-form-item>
        <el-form-item label="IF续写功能">
          <el-switch v-model="form.ifEnabled" />
        </el-form-item>
        <el-form-item label="吐槽机器人">
          <el-switch v-model="form.chatEnabled" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存配置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import { ElMessage } from 'element-plus'

const form = ref({ apiKey: '', modelName: 'deepseek', promptTemplate: '', isActive: true, ifEnabled: true, chatEnabled: true })
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await api.get('/api/ai/config')
    if (res.data) {
      form.value = { apiKey: '', modelName: 'deepseek', promptTemplate: '', isActive: true, ifEnabled: true, chatEnabled: true, ...res.data }
    }
  } catch (e) {
    console.error('获取AI配置失败:', e)
  } finally {
    loading.value = false
  }
})

const handleSave = async () => {
  try {
    await api.post('/api/ai/config', form.value)
    ElMessage.success('AI配置已保存')
  } catch (e) {
    ElMessage.error('保存失败')
  }
}
</script>

<style scoped>
.admin-ai h2 { margin-bottom: 20px; }
.config-card { max-width: 600px; }
</style>
