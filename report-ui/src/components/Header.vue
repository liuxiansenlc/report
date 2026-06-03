<template>
  <header class="app-header" @click="goHome" style="cursor: pointer;">
    <div class="time-container">
      <div class="time-bg">
        <div class="date-widget">
          <span class="day-of-week">{{ dayOfWeek }}</span>
          <span class="calendar-date">{{ calendarDate }}</span>
        </div>
        <span class="time-val">{{ time }}</span>
      </div>
    </div>
    <div class="btn-group">
      <button class="icon-btn" @click.stop>
        <img src="../assets/images/退出按钮.png" alt="退出" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const dayOfWeek = ref('')
const calendarDate = ref('')
const time = ref('')
let timer = null

const goHome = () => {
  router.push('/')
}

const updateTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  const days = ['星 期 日', '星 期 一', '星 期 二', '星 期 三', '星 期 四', '星 期 五', '星 期 六']
  
  dayOfWeek.value = days[now.getDay()]
  calendarDate.value = `${year}-${month}-${day}`
  time.value = `${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.app-header {
  position: relative;
  width: 100%;
  height: 95px; 
  background: url('../assets/images/top.png') no-repeat center top;
  background-size: 1920px 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  z-index: 100;
}

.time-container {
  display: flex;
  align-items: center;
  width: 400px;
}

.time-bg {
  display: flex;
  align-items: center;
  height: 40px;
}

.weather-icon {
  width: 116px;
  height: 29px;
  object-fit: contain;
  margin-right: 30px;
}

.date-widget {
  width: 116px;
  height: 29px;
  background: url('../assets/images/日期天气.png') no-repeat center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-left: 36px; /* Push text to the right of the clock icon */
  gap: 2px;
}

.day-of-week {
  font-size: 12px;
  color: #cce8ff;
  letter-spacing: 2px;
  line-height: 1;
}

.calendar-date {
  font-size: 10px;
  color: #a0d8ff;
  line-height: 1;
  transform: scale(0.9);
  transform-origin: left;
}

.time-val {
  font-size: 24px;
  color: #e6f3ff;
  font-family: 'Arial Narrow', Arial, sans-serif;
  letter-spacing: 1px;
}

.main-title {
  position: absolute;
  left: 50%;
  top: 15px; 
  transform: translateX(-50%);
  font-size: 38px;
  font-weight: bold;
  letter-spacing: 6px;
  color: #ffffff;
  text-shadow: 0 0 15px #00a2ff, 0 0 5px #00ffff;
  font-style: italic;
}

.btn-group {
  width: 400px;
  display: flex;
  justify-content: flex-end;
  margin-top: -10px;
}

.icon-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 5px;
  transition: transform 0.2s;
}

.icon-btn:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 5px #00a2ff);
}

.icon-btn img {
  width: 32px;
  height: auto;
}
</style>
