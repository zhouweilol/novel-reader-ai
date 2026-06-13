<template>
  <div class="chapter-read" :class="`theme-${prefs.theme}`" :style="{ '--reader-width': prefs.width + 'px', '--font-size': prefs.fontSize + 'px', '--line-height': prefs.lineHeight }">
    <!-- 悬浮返回按钮 -->
    <div class="float-back" @click="$router.push(`/book/${chapter?.bookId}`)" v-if="chapter">
      <el-icon :size="20"><ArrowLeft /></el-icon>
    </div>

    <!-- 阅读工具栏 -->
    <div class="reader-toolbar" v-if="chapter">
      <span class="chapter-progress">第 {{ chapter.chapterNum }} 章 / 共 {{ chapters.length }} 章</span>
      <div class="reader-toolbar-actions">
        <el-button circle size="small" @click="drawerVisible = true" title="目录">
          <el-icon><List /></el-icon>
        </el-button>
        <el-popover placement="bottom" :width="280" trigger="click">
          <template #reference>
            <el-button circle size="small">
              <el-icon><Setting /></el-icon>
            </el-button>
          </template>
          <div class="settings-panel">
            <div class="setting-row">
              <span>字体大小</span>
              <div class="font-size-ctl">
                <el-button size="small" circle @click="adjustFont(-1)" :disabled="prefs.fontSize <= 14">A-</el-button>
                <span>{{ prefs.fontSize }}px</span>
                <el-button size="small" circle @click="adjustFont(1)" :disabled="prefs.fontSize >= 28">A+</el-button>
              </div>
            </div>
            <div class="setting-row">
              <span>主题</span>
              <div class="theme-options">
                <span class="theme-dot theme-white" :class="{ active: prefs.theme === 'white' }" @click="prefs.theme = 'white'; savePrefs()" title="白色"></span>
                <span class="theme-dot theme-warm" :class="{ active: prefs.theme === 'warm' }" @click="prefs.theme = 'warm'; savePrefs()" title="护眼黄"></span>
                <span class="theme-dot theme-dark" :class="{ active: prefs.theme === 'dark' }" @click="prefs.theme = 'dark'; savePrefs()" title="夜间"></span>
              </div>
            </div>
            <div class="setting-row">
              <span>行间距</span>
              <el-radio-group v-model="prefs.lineHeight" size="small" @change="savePrefs">
                <el-radio-button :value="1.6">紧凑</el-radio-button>
                <el-radio-button :value="2">标准</el-radio-button>
                <el-radio-button :value="2.5">宽松</el-radio-button>
              </el-radio-group>
            </div>
            <div class="setting-row">
              <span>阅读宽度</span>
              <el-radio-group v-model="prefs.width" size="small" @change="savePrefs">
                <el-radio-button :value="600">窄</el-radio-button>
                <el-radio-button :value="800">标准</el-radio-button>
                <el-radio-button :value="1000">宽</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </el-popover>
      </div>
    </div>

    <!-- 加载中提示 -->
    <div class="reader-placeholder" v-if="!chapter && !pageError">
      <p class="placeholder-text">正在加载章节内容...</p>
    </div>

    <!-- 加载出错提示 -->
    <div class="reader-placeholder" v-if="pageError">
      <p class="placeholder-text">{{ pageError }}</p>
      <el-button v-if="firstChapterId" type="primary" @click="$router.push(`/chapter/${firstChapterId}`)">
        前往第一章
      </el-button>
      <el-button v-if="chapter?.bookId" @click="$router.push(`/book/${chapter?.bookId}`)">
        返回目录
      </el-button>
    </div>

    <div class="reader" v-if="chapter">
      <h1>{{ chapter.title }}</h1>

      <div class="content markdown-body" ref="contentRef" v-html="htmlContent" />

      <div class="chapter-end">---本章完---</div>

      <div class="chapter-nav">
        <el-button @click="prevChapter" :disabled="!prevId">上一章</el-button>
        <el-button @click="nextChapter" :disabled="!nextId">下一章</el-button>
      </div>
    </div>

    <!-- 目录抽屉 -->
    <el-drawer v-model="drawerVisible" title="目录" direction="ltr" size="300px">
      <div class="toc-list">
        <div
          v-for="ch in chapters"
          :key="ch.id"
          :class="['toc-item', { active: ch.id === chapter?.id }]"
          @click="goToChapter(ch.id)"
        >
          <span class="toc-num">第{{ ch.chapterNum }}章</span>
          <span class="toc-title">{{ ch.title }}</span>
          <span class="toc-words">{{ ch.wordCount }}字</span>
        </div>
      </div>
    </el-drawer>

    <!-- 吐槽机器人侧边栏（可拖动） -->
    <div
      v-if="chatFeatureEnabled"
      class="chat-widget"
      :style="{ left: widgetPos.x + 'px', top: widgetPos.y + 'px' }"
      @mousedown.prevent="onDragStart"
      @click="onWidgetClick"
    >
      <el-icon :size="24"><ChatDotRound /></el-icon>
    </div>

    <!-- 吐槽对话框 -->
    <div class="chat-dialog" v-if="showChat" @click.self="showChat = false">
      <el-card
        class="chat-card"
        :style="{
          position: 'fixed',
          left: dialogPos.x + 'px',
          top: dialogPos.y + 'px'
        }"
      >
        <template #header>
          <div class="chat-header" @mousedown.prevent="onDialogDragStart" style="cursor: move;">
            <span>吐槽机器人</span>
            <el-button type="text" @click="showChat = false">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </template>

        <div class="chat-messages">
          <div class="message bot" v-if="chatMessages.length === 0">
            点击下方按钮，让我吐槽一下这段内容吧！
          </div>
          <div v-for="(msg, index) in chatMessages" :key="index" :class="['message', msg.type]">
            {{ msg.content }}
          </div>
        </div>

        <div class="chat-input">
          <el-input v-model="chatInput" placeholder="说点什么..." @keyup.enter="sendMessage">
            <template #append>
              <el-button @click="sendMessage" :loading="chatLoading">发送</el-button>
            </template>
          </el-input>
        </div>
      </el-card>
    </div>

    <!-- IF线弹窗 -->
    <div class="if-story-dialog" v-if="showIfDialog" @click.self="showIfDialog = false">
      <el-card class="if-card">
        <template #header>
          <div class="if-header">
            <span>IF线续写</span>
            <el-button type="text" @click="showIfDialog = false">
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
        </template>

        <div v-if="!ifStoryContent">
          <p>这篇小说还没有更新，要不要看看AI续写的IF线？</p>
          <div class="if-actions">
            <el-button type="primary" @click="generateIfStory" :loading="ifLoading">
              生成AI续写
            </el-button>
            <el-button @click="showIfDialog = false">跳过</el-button>
          </div>
        </div>

        <div v-else class="if-content">
          <div class="if-story">{{ ifStoryContent }}</div>
          <div class="if-actions">
            <el-button type="primary" @click="tipIfStory">打赏</el-button>
            <el-button @click="likeIfStory">点赞 ({{ ifStoryLikes }})</el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'
import api from '../api'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const chapter = ref(null)
const chapters = ref([])
const contentRef = ref()
const showChat = ref(false)
const chatInput = ref('')
const chatMessages = ref([])
const chatLoading = ref(false)
const showIfDialog = ref(false)
const ifStoryContent = ref('')
const ifStoryLikes = ref(0)
const ifLoading = ref(false)
const ifPrompted = ref(false)
const drawerVisible = ref(false)
const ifFeatureEnabled = ref(true)
const chatFeatureEnabled = ref(true)
const pageError = ref('')
const firstChapterId = ref(null)
let ifScrollListener = null

// ---- 阅读偏好 ----
const PREFS_KEY = 'reader_prefs'
const defaultPrefs = { fontSize: 18, theme: 'white', lineHeight: 2, width: 800 }

const loadPrefs = () => {
  try {
    const saved = localStorage.getItem(PREFS_KEY)
    return saved ? { ...defaultPrefs, ...JSON.parse(saved) } : { ...defaultPrefs }
  } catch { return { ...defaultPrefs } }
}

const prefs = reactive(loadPrefs())
const savePrefs = () => localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))

const adjustFont = (delta) => {
  const next = prefs.fontSize + delta
  if (next >= 14 && next <= 28) {
    prefs.fontSize = next
    savePrefs()
  }
}

// ---- 阅读进度 ----
const saveProgress = (bookId, chapterId, chapterNum) => {
  if (!bookId) return
  localStorage.setItem(`reading_progress_${bookId}`, JSON.stringify({ chapterId, chapterNum }))
}

// ---- 章节数据 ----
const htmlContent = computed(() => {
  if (!chapter.value?.content) return ''
  return marked(chapter.value.content)
})

const prevId = computed(() => {
  if (!chapter.value) return null
  const index = chapters.value.findIndex(c => c.id === chapter.value.id)
  return index > 0 ? chapters.value[index - 1].id : null
})

const nextId = computed(() => {
  if (!chapter.value) return null
  const index = chapters.value.findIndex(c => c.id === chapter.value.id)
  return index < chapters.value.length - 1 ? chapters.value[index + 1].id : null
})

const loadChapter = async (id) => {
  pageError.value = ''
  chapter.value = null
  try {
    const res = await api.get(`/api/chapters/${id}`)
    chapter.value = res.data

    const chaptersRes = await api.get(`/api/books/${res.data.bookId}/chapters`)
    chapters.value = chaptersRes.data

    // 记录第一章 ID，用于错误恢复
    if (chapters.value.length > 0) {
      firstChapterId.value = chapters.value[0].id
    }

    // 保存阅读进度
    saveProgress(res.data.bookId, res.data.id, res.data.chapterNum)

    // 清理旧的滚动监听器
    if (ifScrollListener) {
      window.removeEventListener('scroll', ifScrollListener)
      ifScrollListener = null
    }
    // 最后一章且IF功能开启时，滚动到底部才弹出IF线提示
    ifPrompted.value = false
    const currentIndex = chapters.value.findIndex(c => c.id === chapter.value.id)
    if (currentIndex === chapters.value.length - 1 && ifFeatureEnabled.value) {
      ifScrollListener = () => {
        const scrollBottom = window.innerHeight + window.scrollY
        const docHeight = document.documentElement.scrollHeight
        if (docHeight - scrollBottom < 200) {
          ifPrompted.value = true
          showIfDialog.value = true
          window.removeEventListener('scroll', ifScrollListener)
          ifScrollListener = null
        }
      }
      window.addEventListener('scroll', ifScrollListener, { passive: true })
    }
  } catch (error) {
    const status = error?.response?.status
    if (status === 404) {
      pageError.value = '该章节已被删除或不存在'
      // 清理该章节的阅读进度
      const match = id && chapters.value.find(c => c.id === Number(id))
      if (match) {
        localStorage.removeItem(`reading_progress_${match.bookId}`)
      }
    } else {
      pageError.value = '加载失败，请刷新页面重试'
    }
  }
}

onMounted(async () => {
  loadChapter(route.params.id)
  // 获取IF续写功能开关
  try {
    const res = await api.get('/api/ai/features')
    ifFeatureEnabled.value = res.data.ifEnabled
    chatFeatureEnabled.value = res.data.chatEnabled
  } catch { /* 默认开启 */ }
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    window.scrollTo(0, 0)
    loadChapter(newId)
  }
})

const prevChapter = () => {
  if (prevId.value) router.push(`/chapter/${prevId.value}`)
}

const nextChapter = () => {
  if (nextId.value) router.push(`/chapter/${nextId.value}`)
}

const goToChapter = (id) => {
  drawerVisible.value = false
  router.push(`/chapter/${id}`)
}

const sendMessage = async () => {
  if (!chatInput.value.trim()) return
  const userMessage = chatInput.value
  chatMessages.value.push({ type: 'user', content: userMessage })
  chatInput.value = ''
  chatLoading.value = true
  try {
    const res = await api.post('/api/ai/chat', {
      chapterContent: chapter.value.content,
      message: userMessage
    })
    chatMessages.value.push({ type: 'bot', content: res.data.reply })
  } catch (error) {
    ElMessage.error('发送失败')
  } finally {
    chatLoading.value = false
  }
}

const generateIfStory = async () => {
  if (!userStore.user) {
    ElMessage.warning('请先登录')
    return
  }
  ifLoading.value = true
  try {
    const res = await api.post('/api/if-stories/generate', {
      chapterId: chapter.value.id,
      userId: userStore.user.id
    })
    ifStoryContent.value = res.data.content
    ifStoryLikes.value = res.data.likesCount || 0
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    ifLoading.value = false
  }
}

const tipIfStory = () => {
  ElMessage.success('打赏功能开发中...')
}

const likeIfStory = () => {
  ElMessage.success('点赞功能开发中...')
}

// ---- 拖动逻辑 ----
const widgetPos = ref({ x: window.innerWidth - 90, y: window.innerHeight - 90 })
const dialogPos = ref({ x: 0, y: 0 })
let dragging = false, dragTarget = ''
let dragStart = { x: 0, y: 0, elX: 0, elY: 0 }

const onDragStart = (e) => {
  dragging = true
  dragTarget = 'widget'
  dragStart = { x: e.clientX, y: e.clientY, elX: widgetPos.value.x, elY: widgetPos.value.y }
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
}

const onDialogDragStart = (e) => {
  dragging = true
  dragTarget = 'dialog'
  dragStart = { x: e.clientX, y: e.clientY, elX: dialogPos.value.x, elY: dialogPos.value.y }
  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
}

const onDragMove = (e) => {
  if (!dragging) return
  const dx = e.clientX - dragStart.x
  const dy = e.clientY - dragStart.y
  const pos = dragTarget === 'widget' ? widgetPos : dialogPos
  pos.value = {
    x: Math.max(0, Math.min(window.innerWidth - 60, dragStart.elX + dx)),
    y: Math.max(0, Math.min(window.innerHeight - 60, dragStart.elY + dy)),
  }
}

const onDragEnd = () => {
  dragging = false
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
}

const onWidgetClick = () => {
  if (dragging) return
  showChat.value = !showChat.value
  if (showChat.value) {
    dialogPos.value = {
      x: Math.max(0, (window.innerWidth - 400) / 2),
      y: Math.max(0, (window.innerHeight - 500) / 2),
    }
  }
}
</script>

<style scoped>
/* 主题变量 */
.chapter-read {
  min-height: 100vh;
  padding: 20px;
  max-width: var(--reader-width);
  margin: 0 auto;
  background: #fff;
  color: #333;
  transition: background 0.3s, color 0.3s;
}

/* 护眼黄 */
.chapter-read.theme-warm {
  background: #f5ecd7;
  color: #4a3728;
}

/* 夜间模式 */
.chapter-read.theme-dark {
  background: #1a1a1a;
  color: #bbb;
}

/* 悬浮返回按钮 */
.float-back {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 999;
  transition: transform 0.2s, box-shadow 0.2s;
}
.float-back:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
}
.theme-dark .float-back {
  background: rgba(40, 40, 40, 0.9);
  color: #ccc;
}

/* 工具栏 */
.reader-toolbar {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
}
.reader-toolbar-actions {
  display: flex;
  gap: 8px;
}
.chapter-progress {
  font-size: 14px;
  color: #999;
}
.theme-dark .chapter-progress { color: #999; }
.theme-dark .reader-toolbar { background: rgba(40,40,40,0.9); }

/* 设置面板 */
.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.setting-row > span:first-child {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
}
.font-size-ctl {
  display: flex;
  align-items: center;
  gap: 8px;
}
.theme-options {
  display: flex;
  gap: 8px;
}
.theme-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}
.theme-dot.active { border-color: #409eff; }
.theme-white { background: #fff; border: 2px solid #ddd; }
.theme-warm { background: #f5ecd7; }
.theme-dark { background: #1a1a1a; }

/* 目录抽屉 */
.toc-list {
  display: flex;
  flex-direction: column;
}
.toc-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 4px;
  gap: 8px;
  transition: background 0.2s;
}
.toc-item:hover { background: #f5f5f5; }
.toc-item.active {
  background: #ecf5ff;
  color: #409eff;
}
.toc-num {
  font-size: 12px;
  color: #999;
  min-width: 52px;
}
.toc-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toc-words {
  font-size: 11px;
  color: #ccc;
}

/* 加载/错误占位 */
.reader-placeholder {
  padding-top: 120px;
  text-align: center;
}
.placeholder-text {
  color: #999;
  font-size: 15px;
  margin-bottom: 24px;
}
.theme-dark .placeholder-text { color: #666; }

/* 阅读器 */
.reader {
  padding-top: 80px;
}
.reader h1 {
  text-align: center;
  margin-bottom: 30px;
}

.content {
  line-height: var(--line-height);
  font-size: var(--font-size);
}

/* markdown 渲染样式 */
.markdown-body :deep(p) {
  text-indent: 2em;
  margin-bottom: 0.8em;
}
.markdown-body :deep(blockquote) {
  margin: 0.8em 0;
  padding: 4px 16px;
  border-left: 4px solid #409eff;
  background: rgba(64, 158, 255, 0.05);
  color: #666;
}
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  margin: 1.2em 0 0.6em;
}
.markdown-body :deep(strong) { font-weight: 700; }
.markdown-body :deep(em) { font-style: italic; }
.markdown-body :deep(ul), .markdown-body :deep(ol) {
  padding-left: 2em;
  margin-bottom: 0.8em;
}
.markdown-body :deep(li) { margin-bottom: 0.3em; }
.markdown-body :deep(code) {
  background: rgba(0,0,0,0.06);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.9em;
}
.markdown-body :deep(pre) {
  background: rgba(0,0,0,0.04);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 0.8em;
}
.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}
.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid #ddd;
  margin: 1.5em 0;
}

/* 夜间模式适配 */
.theme-dark .markdown-body :deep(blockquote) {
  background: rgba(255,255,255,0.05);
  color: #999;
}
.theme-dark .markdown-body :deep(code) {
  background: rgba(255,255,255,0.1);
}
.theme-dark .markdown-body :deep(pre) {
  background: rgba(255,255,255,0.06);
}
.theme-dark .markdown-body :deep(hr) {
  border-color: #444;
}
.theme-dark .chapter-end { color: #555; }

.chapter-end {
  text-align: center;
  color: #bbb;
  font-size: 13px;
  margin-top: 32px;
  user-select: none;
}

.chapter-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

/* 吐槽机器人 */
.chat-widget {
  position: fixed;
  width: 60px;
  height: 60px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  z-index: 1000;
  user-select: none;
}
.chat-widget:active { cursor: grabbing; }

.chat-dialog {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
}

.chat-card {
  width: 400px;
  max-height: 500px;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-messages {
  height: 300px;
  overflow-y: auto;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 10px;
}

.message {
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  max-width: 80%;
}

.message.user {
  background: #409eff;
  color: white;
  margin-left: auto;
}

.message.bot {
  background: white;
  border: 1px solid #ddd;
}

.chat-input {
  display: flex;
  gap: 10px;
}

/* IF线弹窗 */
.if-story-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
}

.if-card {
  width: 500px;
}

.if-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.if-content {
  max-height: 400px;
  overflow-y: auto;
}

.if-story {
  line-height: 1.8;
  margin-bottom: 20px;
  white-space: pre-wrap;
}

.if-actions {
  display: flex;
  gap: 10px;
}
</style>
