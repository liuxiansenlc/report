import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { useUserStore } from '@/store/user'

const request = axios.create({
  baseURL: '/api',
  timeout: 5000
})

request.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => {
  return Promise.reject(error)
})

request.interceptors.response.use(response => {
  let res = response.data
  if (response.config.responseType === 'blob') {
    return res
  }
  if (res.code === 200) {
    return res
  } else if (res.code === 401) {
    ElMessage.error('登录已过期，请重新登录')
    const userStore = useUserStore()
    userStore.logout()
    router.push('/login')
    return Promise.reject(new Error('未授权'))
  } else if (res.code === 403) {
    ElMessage.error({ message: res.message || '许可证验证失败，请联系管理员', duration: 5000 })
    return Promise.reject(new Error(res.message || '许可证验证失败'))
  } else {
    ElMessage.error(res.message || 'Error occurred')
    return Promise.reject(new Error(res.message || 'Error'))
  }
}, error => {
  if (error.response && error.response.status === 401) {
    ElMessage.error('登录已过期，请重新登录')
    const userStore = useUserStore()
    userStore.logout()
    router.push('/login')
  } else if (error.response && error.response.status === 403) {
    const msg = error.response.data?.message || '许可证验证失败，系统功能受限'
    ElMessage.error({ message: msg, duration: 5000 })
  } else {
    ElMessage.error('网络异常，请稍后重试')
  }
  return Promise.reject(error)
})

export default request
