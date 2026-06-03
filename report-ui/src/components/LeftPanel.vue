<template>
  <div class="left-panel">
    <!-- 第一块：服务农场 -->
    <div class="panel-section sec-1">
      <div class="panel-title">
        <span class="title-text">服务农场</span>
      </div>
      <div class="stats-row">
        <!-- 农场总数 -->
        <div class="stat-item">
          <img src="../assets/images/1.png" class="stat-icon" />
          <div class="stat-info">
            <div class="stat-label">农场总数</div>
            <div class="stat-value val-cyan">{{ farmTotalCount }}<span class="unit">个</span></div>
          </div>
        </div>
        
        <!-- 总面积 -->
        <div class="stat-item">
          <img src="../assets/images/2.png" class="stat-icon" />
          <div class="stat-info">
            <div class="stat-label">总面积</div>
            <div class="stat-value val-cyan">{{ farmTotalArea }}<span class="unit">亩</span></div>
          </div>
        </div>

        <!-- 品种数 -->
        <div class="stat-item">
          <img src="../assets/images/3.png" class="stat-icon" />
          <div class="stat-info">
            <div class="stat-label">品种数</div>
            <div class="stat-value val-gold">{{ farmVarietyCount }}<span class="unit">个</span></div>
          </div>
        </div>
      </div>
      
      <!-- 自动上滑的农场卡片区 -->
      <div class="farm-carousel">
        <div class="carousel-track v-track" :class="{ 'animate-v-scroll': farmCards.length > 3 }">
          <div class="farm-card-new" v-for="(item, index) in farmCards" :key="index">
            <div class="fcn-img-box">
              <img :src="item.img" class="fcn-img" />
            </div>
            <div class="fcn-info">
              <div class="fcn-name">{{ item.name }}</div>
              <div class="fcn-stat">
                <span class="fcn-val">{{ item.area }}</span>
                <span class="fcn-unit">亩</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二块：改良方案情况 -->
    <div class="panel-section sec-2">
      <div class="panel-title">
        <span class="title-text">改良方案情况</span>
      </div>
      
      <!-- 累计制定改良方案 / 覆盖面积 -->
      <div class="plan-metrics-row">
        <div class="plan-label">累计制定改良方案：</div>
        <div class="plan-flipper-box">
          <div class="flip-digit" v-for="(digit, idx) in displayDigits" :key="idx">
            <div class="digit-roller" :style="{ transform: `translateY(-${digit * 41}px)` }">
              <div v-for="n in 10" :key="n" class="roller-num">{{ n - 1 }}</div>
            </div>
          </div>
          <span class="plan-trend">个</span>
        </div>
      </div>

      <!-- 并排展示的数据卡片 -->
      <div class="quality-carousel">
        <div class="q-cards-row" :class="{ 'animate-scroll': qualityCards.length > 3 }">
          <div class="q-card-new2" v-for="(item, index) in qualityCards" :key="index">
            <div class="qc2-top">
              <img :src="item.img" class="qc2-img" />
              <span class="qc2-name">{{ item.name }}</span>
            </div>
            <div class="qc2-date">{{ item.date }}</div>
            <div class="qc2-rows">
              <div class="qc2-row">
                <span class="qc2-label">检测前</span>
                <img v-if="item.beforeUrl" src="../assets/images/下载按钮.png" class="qc2-dl" @click="downloadFile(item.beforeUrl, item.name + '_检测前报告.pdf')" />
                <span v-else class="qc2-no-file">-</span>
              </div>
              <div class="qc2-row">
                <span class="qc2-label">检测后</span>
                <img v-if="item.afterUrl" src="../assets/images/下载按钮.png" class="qc2-dl" @click="downloadFile(item.afterUrl, item.name + '_检测后报告.pdf')" />
                <span v-else class="qc2-no-file">-</span>
              </div>
              <div class="qc2-row">
                <span class="qc2-label">改良方案</span>
                <img v-if="item.planUrl" src="../assets/images/下载按钮.png" class="qc2-dl" @click="downloadFile(item.planUrl, item.name + '_改良方案.pdf')" />
                <span v-else class="qc2-no-file">-</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第三块：生态与经济效益 -->
    <div class="panel-section sec-3">
      <div class="panel-title sec3-title">
        <span class="title-text">生态与经济效益</span>
      </div>
      <div class="benefit-container">
        <!-- 产量 -->
        <div class="benefit-item item-top">
          <div class="b-value">{{ bVal1 }}</div>
          <div class="b-label">新增农作物产量(吨)</div>
        </div>
        <!-- 化肥 -->
        <div class="benefit-item item-bl">
          <div class="b-value">{{ bVal2 }}</div>
          <div class="b-label">减少化肥使用量(吨)</div>
        </div>
        <!-- 经济效益 -->
        <div class="benefit-item item-br">
          <div class="b-value">{{ bVal3 }}</div>
          <div class="b-label">新增经济效益(万)</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import gsap from 'gsap'

const farmTotalCount = ref(0)
const farmTotalArea = ref('0.0')
const farmVarietyCount = ref(0)
const farmCards = ref([])

// 累计制定改良方案个数
const targetValue = ref('0000')
// Start with 0000 so that it rolls upwards
const displayDigits = ref(['0', '0', '0', '0'])

// 监测 targetValue 变化并同步到翻牌器
watch(targetValue, (newVal) => {
  displayDigits.value = newVal.padStart(4, '0').split('')
})

// 底部生态与经济效益动画数值
const bVal1 = ref(0)
const bVal2 = ref(0)
const bVal3 = ref(0)

const targetBVal1 = ref(0)
const targetBVal2 = ref(0)
const targetBVal3 = ref(0)

const animateBottomNumbers = () => {
  // Only animate if we have targets > 0, otherwise just stay at 0
  if (targetBVal1.value === 0 && targetBVal2.value === 0 && targetBVal3.value === 0) {
    setTimeout(animateBottomNumbers, 2000)
    return
  }

  const obj = { v1: 0, v2: 0, v3: 0 }
  gsap.to(obj, {
    v1: targetBVal1.value,
    v2: targetBVal2.value,
    v3: targetBVal3.value,
    duration: 3,
    ease: "power2.out",
    onUpdate: () => {
      bVal1.value = obj.v1.toFixed(2)
      bVal2.value = obj.v2.toFixed(2)
      bVal3.value = obj.v3.toFixed(2)
    },
    onComplete: () => {
      setTimeout(animateBottomNumbers, 2000) // 重复执行
    }
  })
}

const loadEconomicBenefits = async () => {
  try {
    const res = await fetch('/api/datasource/economic-benefits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const json = await res.json()
    if (json.code === 200 && json.data) {
      targetBVal1.value = json.data.yieldIncrease || 0
      targetBVal2.value = json.data.fertilizerReduction || 0
      targetBVal3.value = json.data.revenueIncrease || 0
    }
  } catch (e) {
    console.error('获取生态与经济效益数据失败:', e)
  }
}

onMounted(() => {
  // 启动底部数字滚动动画
  animateBottomNumbers()
  
  loadFarmData()
  loadEconomicBenefits()
  loadImprovementPlans()
})

const downloadFile = (url, name) => {
  if (!url) return
  const link = document.createElement('a')
  link.href = url
  link.download = name || '文件.pdf'
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const loadImprovementPlans = async () => {
  try {
    const res = await fetch('/api/datasource/improvement-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    const json = await res.json()
    if (json.code === 200 && json.data) {
      const list = json.data
      
      // 累计制定改良方案：统计有多少个 planUrl
      const totalPlans = list.filter(item => item.planUrl).length
      targetValue.value = totalPlans.toString()
      
      const newCards = list.map(item => ({
        name: item.name,
        date: item.date,
        img: getImageUrl('左上图片.png'),
        beforeUrl: item.beforeUrl,
        afterUrl: item.afterUrl,
        planUrl: item.planUrl
      }))
      
      qualityCards.value = newCards.length > 3 ? [...newCards, ...newCards] : newCards
    }
  } catch (e) {
    console.error('获取改良方案数据失败:', e)
  }
}

const loadFarmData = async () => {
  try {
    const res = await fetch('/api/datasource/farm-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
    const json = await res.json()
    if (json.code === 200 && json.data) {
      const list = json.data
      farmTotalCount.value = list.length
      
      let totalA = 0
      let cropSet = new Set()
      const newCards = []
      
      list.forEach(item => {
        if (item.farmArea) totalA += parseFloat(item.farmArea)
        if (item.cropVariety) cropSet.add(item.cropVariety)
        
        newCards.push({
          name: item.farmName,
          area: item.farmArea || '0.0',
          count: '40', // 暂定硬写死 40
          img: item.imageUrl || getImageUrl('左上图片.png')
        })
      })
      
      farmTotalArea.value = totalA.toFixed(1)
      farmVarietyCount.value = cropSet.size
      
      // 仅在数据量足够时生成无缝滚动副本
      farmCards.value = newCards.length > 3 ? [...newCards, ...newCards] : newCards
    }
  } catch (e) {
    console.error('获取左侧服务农场数据失败:', e)
  }
}

const getImageUrl = (name) => {
  return new URL(`../assets/images/${name}`, import.meta.url).href
}

// 初始为空，由接口加载
const qualityCards = ref([])
</script>

<style scoped>
.left-panel {
  width: 460px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-section {
  width: 100%;
  height: 33.33%;
  display: flex;
  flex-direction: column;
}

.sec-1 {
  width: 413px;
  height: 345px;
  background: url('../assets/images/left1.png') no-repeat left top;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
}

.sec-2 {
  width: 422px;
  height: 345px; 
  background: url('../assets/images/left2.png') no-repeat left top;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  margin-top: 15px;
}

.sec-3 {
  width: 413px;
  height: 246px; 
  background: url('../assets/images/left3.png') no-repeat left top;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  margin-top: 15px;
  position: relative;
}

.panel-title {
  margin-top: 5px; 
  padding-left: 40px; 
}

.title-text {
  font-size: 20px;
  font-weight: 900;
  font-style: italic;
  color: #fff;
  letter-spacing: 2px;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.8), 0 0 10px rgba(0, 162, 255, 0.8);
}

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-top: 15px; 
  padding: 0 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  width: 44px; 
  height: auto;
}

.stat-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.stat-label {
  font-size: 13px;
  color: #cce8ff;
  letter-spacing: 1px;
}

.stat-value {
  font-size: 22px;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-weight: bold;
}

.val-cyan {
  color: #00ffff;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
}

.val-gold {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
}

.unit {
  font-size: 12px;
  color: #cce8ff;
  margin-left: 2px;
  font-weight: normal;
  text-shadow: none;
}

/* 轮播卡片样式 */
.farm-carousel {
  width: calc(100% - 40px);
  margin: 5px 0 0 20px; 
  flex: 1;
  overflow: hidden;
  position: relative;
}

.carousel-track.v-track.animate-v-scroll {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  animation: slideUp 12s linear infinite;
}

.carousel-track.v-track.animate-v-scroll:hover {
  animation-play-state: paused;
}

@keyframes slideUp {
  0% { transform: translateY(0); }
  100% { transform: translateY(calc(-50% - 5px)); } /* 5px is half the gap */
}

.farm-card-new {
  width: 360px;
  height: 68px; /* Slightly taller for better proportions */
  background: url('../assets/images/car_bg_new_1.png') no-repeat center;
  background-size: 100% 100%;
  position: relative;
  display: flex;
  align-items: center;
  margin: 0 auto;
}

.fcn-img-box {
  position: absolute;
  left: 12px; /* Shift right 3px as requested */
  top: 50%;
  transform: translateY(-50%);
  width: 86px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
}

.fcn-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fcn-info {
  width: 100%;
  padding-left: 100px; /* Leave space for the image on the left */
  padding-right: 15px; /* Slight right padding to visually center over the gradient */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.fcn-name {
  font-size: 14px;
  color: #fff;
  font-weight: bold;
  letter-spacing: 1px;
}

.fcn-stat {
  font-size: 12px;
  color: #cce8ff;
  margin-top: 2px;
  display: flex;
  align-items: baseline; /* Align baselines of number and unit */
  justify-content: center;
  gap: 3px;
}

.fcn-val {
  font-size: 16px;
  color: #00ffff;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-weight: bold;
  position: relative;
  top: 2px;
}

.chart-container {
  flex: 1;
  width: 100%;
  position: relative;
  margin-top: 10px;
}

/* 改良方案数字翻牌器 */
.plan-metrics-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding: 0 45px 0 40px; 
}

.plan-label {
  font-size: 16px;
  color: #ffffff; 
  letter-spacing: 1px;
}

.plan-flipper-box {
  display: flex;
  align-items: center;
  gap: 4px; 
}

.flip-digit {
  width: 37px;
  height: 41px;
  background: url('../assets/images/翻拍.png') no-repeat center;
  background-size: 100% 100%;
  overflow: hidden; 
  position: relative;
}

.digit-roller {
  display: flex;
  flex-direction: column;
  transition: transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  width: 100%;
}

.roller-num {
  width: 100%;
  height: 41px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-size: 24px; 
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.5); 
}

.plan-trend {
  font-size: 14px;
  color: #cce8ff;
  margin-left: 6px;
  align-self: flex-end;
  margin-bottom: 5px;
  font-weight: normal;
}

/* 并排卡片样式 */
.quality-carousel {
  flex: 1;
  width: 100%;
  margin-top: 8px; 
  padding-left: 25px;
  overflow: hidden;
  position: relative;
}

.q-cards-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 15px;
}

.q-cards-row.animate-scroll {
  animation: slideLeft 15s linear infinite;
}

.q-cards-row.animate-scroll:hover {
  animation-play-state: paused;
}

@keyframes slideLeft {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-50% - 7.5px)); }
}

.q-card-new2 {
  width: 115px;
  height: 230px;
  background: url('../assets/images/car_bg_new_2.png') no-repeat center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.qc2-top {
  position: relative;
  width: 78px;
  height: 78px;
  margin-top: 11px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.qc2-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.qc2-name {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 0 0 4px rgba(0,0,0,0.8);
  white-space: nowrap;
}

.qc2-date {
  font-size: 12px;
  color: #a0c4e0;
  font-family: 'Arial Narrow', Arial, sans-serif;
  margin-top: 15px;
}

.qc2-rows {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
  width: 75%;
}

.qc2-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qc2-label {
  font-size: 13px;
  color: #cce8ff;
}

.qc2-dl {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.qc2-no-file {
  font-size: 12px;
  color: #555;
  font-style: italic;
}

/* 底部生态效益区域 */
.sec3-title {
  margin-top: 2px; 
  padding-left: 28px;
}

.benefit-container {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
}

.benefit-item {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.b-value {
  font-size: 28px;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(0, 162, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.5);
  margin-bottom: 35px; 
}

.b-label {
  font-size: 12px;
  color: #ffffff; 
  letter-spacing: 1px;
}

.item-top {
  top: 35px;
  left: 50%;
  transform: translateX(-50%);
}

.item-bl {
  top: 100px;
  left: 85px;
  transform: translateX(-50%); 
}

.item-br {
  top: 100px;
  right: 85px;
  transform: translateX(50%); 
}
</style>