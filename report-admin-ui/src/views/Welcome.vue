<template>
  <div class="welcome-container">
    <div class="stat-cards">
      <el-card class="stat-card" shadow="hover" v-for="item in 4" :key="item">
        <div class="stat-content">
          <div class="stat-icon" :class="'icon-' + item">
            <el-icon v-if="item === 1"><DataLine /></el-icon>
            <el-icon v-if="item === 2"><DocumentChecked /></el-icon>
            <el-icon v-if="item === 3"><User /></el-icon>
            <el-icon v-if="item === 4"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-title">{{ ['今日填报量', '待审批事项', '活跃用户', '系统运行时间'][item-1] }}</div>
            <div class="stat-value">{{ ['124', '12', '45', '128h'][item-1] }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <el-card class="modern-card" shadow="never">
      <div class="empty-state">
        <img src="https://cdni.iconscout.com/illustration/premium/thumb/folder-management-4560731-3788737.png" alt="Empty Modules" class="empty-img" />
        <h3>准备就绪</h3>
        <p class="empty-desc">前端与后端双星系统已成功链接，数据引擎随时待命。<br />请在左侧菜单选择业务模块以生成或填写表单数据。</p>
        <el-button type="primary" size="large" class="action-btn">
          新建业务模型 <el-icon class="el-icon--right"><Plus /></el-icon>
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { DataLine, DocumentChecked, User, Clock, Plus } from '@element-plus/icons-vue'
</script>

<style scoped>
.welcome-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.stat-card {
  border-radius: 16px;
  border: none;
  background-color: white;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.icon-1 { background: #e8fff3; color: #50cd89; }
.icon-2 { background: #fff8dd; color: #ffc700; }
.icon-3 { background: #f8f5ff; color: #7239ea; }
.icon-4 { background: #e1e9ff; color: #009ef7; }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-title {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
}

.stat-value {
  color: var(--text-main);
  font-size: 24px;
  font-weight: 700;
}

.modern-card {
  border-radius: 16px;
  border: none;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
}

.empty-state {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.empty-img {
  width: 250px;
  margin-bottom: 20px;
  animation: float 6s ease-in-out infinite;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--text-main);
  margin-bottom: 15px;
}

.empty-desc {
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 30px;
}

.action-btn {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}
</style>
