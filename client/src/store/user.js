import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const setToken = (newToken) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const setUser = (newUser) => {
    user.value = newUser
  }

  // 刷新页面后从 JWT 中恢复用户信息
  const restoreUser = () => {
    if (!token.value) return
    try {
      const payload = token.value.split('.')[1]
      const decoded = JSON.parse(atob(payload))
      user.value = { id: decoded.userId, phone: decoded.phone, role: decoded.role || 'user' }
    } catch {
      logout()
    }
  }

  const login = async (phone, password) => {
    const res = await api.post('/api/auth/login', { phone, password })
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const register = async (phone, password) => {
    const res = await api.post('/api/auth/register', { phone, password })
    setToken(res.data.token)
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    isLoggedIn,
    isAdmin,
    setToken,
    setUser,
    restoreUser,
    login,
    register,
    logout
  }
})
