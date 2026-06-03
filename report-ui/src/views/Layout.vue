<template>
  <el-container class="modern-layout">
    <el-aside width="250px" class="modern-sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">AI</div>
        <span class="logo-text" style="font-size: 14px; margin-left: 5px;">耕地改良管理系统</span>
      </div>
      
      <el-menu
        :default-active="route.path"
        class="modern-menu"
        background-color="transparent"
        text-color="#a1a5b7"
        active-text-color="#ffffff"
        router
      >

        <div class="menu-section-title">业务管理</div>
        <el-sub-menu index="modules">
          <template #title>
            <el-icon><Grid /></el-icon>
            <span>数据填报模块</span>
          </template>
          <el-menu-item 
            v-for="menu in userStore.menus" 
            :key="menu.id" 
            :index="menu.path"
          >
            <div class="menu-bullet"></div>
            {{ menu.name }}
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="modern-header" height="70px">
        <div class="header-left">
          <div class="page-title">{{ currentRouteName }}</div>
        </div>
        <div class="header-right">
          <div class="header-action-icon">
            <el-icon><Bell /></el-icon>
            <div class="notification-badge"></div>
          </div>
          
          <el-dropdown @command="handleCommand" trigger="click">
            <div class="user-dropdown">
              <div class="avatar">
                {{ userStore.username.charAt(0).toUpperCase() }}
              </div>
              <div class="user-info">
                <span class="username">{{ userStore.username }}</span>
                <span class="role">超级管理员</span>
              </div>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile"><el-icon><User /></el-icon>个人设置</el-dropdown-item>
                <el-dropdown-item divided command="logout"><el-icon><SwitchButton /></el-icon>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- License 提醒 banner -->
      <el-alert
        v-if="licenseBanner.show"
        :title="licenseBanner.text"
        :type="licenseBanner.type"
        :closable="true"
        show-icon
        @close="licenseBanner.show = false"
        style="border-radius: 0; margin: 0;"
      />
      
      <el-main class="modern-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <!-- 设置密码弹窗 -->
    <el-dialog v-model="pwdDialogVisible" title="个人设置 - 修改密码" width="400px" align-center>
      <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-width="90px">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入当前原密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="pwdDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="pwdLoading" @click="submitPassword">确认修改</el-button>
        </span>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup>
import { computed, onMounted, ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/store/user'
import { HomeFilled, Grid, Bell, ArrowDown, User, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const licenseBanner = reactive({ show: false, type: 'warning', text: '' })

const checkLicense = async () => {
  try {
    const res = await request.get('/license/status')
    if (res.data) {
      const { valid, daysRemaining, message } = res.data
      if (!valid) {
        licenseBanner.type = 'error'
        licenseBanner.text = `许可证无效：${message || '请联系管理员'}，系统功能受限`
        licenseBanner.show = true
      } else if (daysRemaining !== undefined && daysRemaining <= 30) {
        licenseBanner.type = 'warning'
        licenseBanner.text = `许可证将在 ${daysRemaining} 天后到期，请及时续期`
        licenseBanner.show = true
      }
    }
  } catch (e) {
    // 静默处理
  }
}

const currentRouteName = computed(() => {
  if (route.path === '/' || route.path === '/welcome') return '首页总览'
  const currentMenu = userStore.menus.find(m => m.path === route.path)
  return currentMenu ? currentMenu.name : '数据详情'
})

onMounted(() => {
  fetchModules()
  checkLicense()
})

const fetchModules = async () => {
  try {
    const res = await request.get('/modules')
    userStore.setMenus(res.data)
  } catch (error) {
    console.error('获取模块失败', error)
  }
}

// ----- 个人设置 (修改密码) -----
const pwdDialogVisible = ref(false)
const pwdLoading = ref(false)
const pwdFormRef = ref(null)

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== pwdForm.newPassword) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const pwdRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  } else if (command === 'profile') {
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    if (pwdFormRef.value) pwdFormRef.value.clearValidate()
    pwdDialogVisible.value = true
  }
}

const submitPassword = () => {
  pwdFormRef.value.validate(async (valid) => {
    if (valid) {
      pwdLoading.value = true
      try {
        await request.post('/password', {
          username: userStore.username,
          oldPassword: pwdForm.oldPassword,
          newPassword: pwdForm.newPassword
        })
        ElMessage.success('密码修改成功，请重新登录！')
        pwdDialogVisible.value = false
        userStore.logout()
        router.push('/login')
      } catch (error) {
        console.error('修改密码失败', error)
      } finally {
        pwdLoading.value = false
      }
    }
  })
}
</script>

<style scoped>
.modern-layout {
  height: 100vh;
  background-color: #f3f6f9;
}

.modern-sidebar {
  background-color: #1e1e2d;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
}

.sidebar-logo {
  height: 70px;
  display: flex;
  align-items: center;
  padding: 0 25px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  margin-right: 12px;
}

.logo-text {
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.5px;
}

.menu-section-title {
  padding: 25px 25px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #565674;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.modern-menu {
  border-right: none;
  flex: 1;
  overflow-y: auto;
}

/* 隐藏菜单滚动条 */
.modern-menu::-webkit-scrollbar {
  display: none;
}

:deep(.el-menu-item), :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  margin: 4px 15px;
  border-radius: 8px;
}

:deep(.el-menu-item:hover), :deep(.el-sub-menu__title:hover) {
  background-color: rgba(255,255,255,0.05) !important;
  color: #ffffff !important;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--primary-color) !important;
  color: #ffffff !important;
  font-weight: 600;
}

.menu-bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #a1a5b7;
  margin-right: 12px;
  transition: all 0.3s;
}

:deep(.el-menu-item.is-active) .menu-bullet {
  background-color: #ffffff;
  transform: scale(1.2);
}

.modern-header {
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  z-index: 10;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #181c32;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 25px;
}

.header-action-icon {
  position: relative;
  font-size: 20px;
  color: #a1a5b7;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.header-action-icon:hover {
  background-color: #f3f6f9;
  color: var(--primary-color);
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 10px;
  width: 8px;
  height: 8px;
  background-color: #f1416c;
  border-radius: 50%;
  border: 2px solid white;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 5px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.user-dropdown:hover {
  background-color: #f3f6f9;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #e1e9ff;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-info .username {
  font-weight: 600;
  font-size: 14px;
  color: #181c32;
}

.user-info .role {
  font-size: 12px;
  color: #a1a5b7;
}

.modern-main {
  padding: 30px;
  overflow-x: hidden;
}

/* Transitions */
.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
