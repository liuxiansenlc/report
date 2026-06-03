<template>
  <div class="login-container">
    <div class="login-overlay"></div>
    <div class="login-wrapper">
      <div class="brand-section">
        <div class="brand-content">
          <h1>耕地改良AI管理平台</h1>
          <p>智能化的高性能耕地土壤监测与调控系统</p>
          <div class="brand-features">
            <span><el-icon><Check /></el-icon> 灵活模块定义</span>
            <span><el-icon><Check /></el-icon> 全局数据透视</span>
            <span><el-icon><Check /></el-icon> 高效协作流转</span>
          </div>
        </div>
      </div>
      <div class="form-section">
        <div class="form-card">
          <div class="form-header">
            <h2>欢迎回来</h2>
            <p>请登录您的账号以继续</p>
          </div>
          
          <el-form :model="loginForm" :rules="rules" ref="loginFormRef" class="modern-form">
            <el-form-item prop="username">
              <el-input 
                v-model="loginForm.username" 
                placeholder="请输入用户名" 
                size="large"
                class="modern-input">
                <template #prefix>
                  <el-icon class="input-icon"><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item prop="password">
              <el-input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="请输入密码" 
                size="large"
                show-password
                class="modern-input"
                @keyup.enter="handleLogin">
                <template #prefix>
                  <el-icon class="input-icon"><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <div class="form-options">
              <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
              <a href="#" class="forgot-link">忘记密码？</a>
            </div>

            <el-form-item>
              <el-button 
                type="primary" 
                class="login-btn" 
                size="large" 
                :loading="loading" 
                @click="handleLogin">
                登 录
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { User, Lock, Check } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = () => {
  loginFormRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      request.post('/login', loginForm).then(res => {
        userStore.setToken(res.data.token)
        userStore.setUsername(res.data.username)
        ElMessage.success('登录成功，欢迎访问！')
        router.push('/')
      }).catch(err => {
        console.error(err)
      }).finally(() => {
        loading.value = false
      })
    }
  })
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  position: relative;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  background-image: url('@/assets/login-bg.jpg');
  background-size: cover;
  background-position: center;
}

.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 24, 39, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.login-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  width: 1000px;
  height: 600px;
  margin: auto;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.brand-section {
  flex: 1;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(67, 56, 202, 0.9) 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand-content h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  letter-spacing: -0.025em;
}

.brand-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 40px;
  line-height: 1.6;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.brand-features span {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
  opacity: 0.9;
}

.form-section {
  flex: 1;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: white;
}

.form-header {
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 2rem;
  color: var(--text-main);
  margin: 0 0 10px 0;
  font-weight: 700;
}

.form-header p {
  color: var(--text-muted);
  margin: 0;
}

.modern-form .el-form-item {
  margin-bottom: 25px;
}

:deep(.modern-input .el-input__wrapper) {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  background-color: #f9fafb;
  border-radius: 12px;
  padding: 8px 15px;
  transition: all 0.3s ease;
}

:deep(.modern-input .el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
  background-color: white;
}

.input-icon {
  font-size: 18px;
  color: #9ca3af;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s;
}

.forgot-link:hover {
  color: var(--primary-hover);
}

.login-btn {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  border: none;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3), 0 2px 4px -1px rgba(79, 70, 229, 0.1);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4), 0 4px 6px -2px rgba(79, 70, 229, 0.2);
}
</style>
