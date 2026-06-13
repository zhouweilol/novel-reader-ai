import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/book/:id',
    name: 'BookDetail',
    component: () => import('../views/BookDetail.vue')
  },
  {
    path: '/chapter/:id',
    name: 'ChapterRead',
    component: () => import('../views/ChapterRead.vue')
  },
  {
    path: '/writer',
    name: 'Writer',
    component: () => import('../views/WriterWorkspace.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    component: () => import('../views/Admin.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'AdminStats',
        component: () => import('../views/AdminStats.vue')
      },
      {
        path: 'books',
        name: 'AdminBooks',
        component: () => import('../views/AdminBooks.vue')
      },
      {
        path: 'chapters',
        name: 'AdminChapters',
        component: () => import('../views/AdminChapters.vue')
      },
      {
        path: 'if-stories',
        name: 'AdminIfStories',
        component: () => import('../views/AdminIfStories.vue')
      },
      {
        path: 'ai-config',
        name: 'AdminAIConfig',
        component: () => import('../views/AdminAIConfig.vue')
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('../views/AdminPlaceholder.vue')
      },
      {
        path: 'images',
        name: 'AdminImages',
        component: () => import('../views/AdminPlaceholder.vue')
      },
      {
        path: 'comments',
        name: 'AdminComments',
        component: () => import('../views/AdminPlaceholder.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  // 管理员路由检查
  if (to.path.startsWith('/admin') && token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      // 旧 token 没有 role 字段，需要重新登录
      if (!payload.role) {
        localStorage.removeItem('token')
        next('/login')
        return
      }
      if (payload.role !== 'admin') {
        next('/')
        return
      }
    } catch {
      next('/login')
      return
    }
  }

  next()
})

export default router
