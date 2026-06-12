<template>
  <div class="left-panel" @click="closePanelDetails">
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
    <div class="panel-section sec-2" @click.stop="activePlanStage = ''">
      <div class="panel-title">
        <span class="title-text">改良方案情况</span>
      </div>

      <div class="plan-console">
        <div class="plan-overview">
          <div class="plan-total-core">
            <div class="plan-scan-ring"></div>
            <div class="plan-total-value">{{ planTotalDisplay }}</div>
            <div class="plan-total-unit">份方案</div>
          </div>
          <div class="plan-overview-copy">
            <div class="plan-overview-label">累计制定改良方案</div>
            <div class="plan-rate-row">
              <span class="plan-rate-value">{{ planCompletionRate }}%</span>
              <span class="plan-rate-label">方案完成率</span>
            </div>
            <div class="plan-rate-track">
              <span :style="{ width: planCompletionRate + '%' }"></span>
            </div>
          </div>
        </div>

        <div class="plan-flow">
          <template v-for="(stage, index) in planStages" :key="stage.key">
            <button
              class="plan-stage"
              :class="{ active: activePlanStage === stage.key }"
              type="button"
              @click.stop="togglePlanStage(stage.key)"
            >
              <span class="plan-stage-orbit"><i :class="stage.icon"></i></span>
              <strong>{{ stage.count }}</strong>
              <span>{{ stage.label }}</span>
            </button>
            <div v-if="index < planStages.length - 1" class="plan-flow-line"><i></i></div>
          </template>
        </div>

        <div v-if="activePlanStage" class="plan-detail" @click.stop>
          <div class="plan-detail-head">
            <span>{{ activePlanStageLabel }} · 农场明细</span>
            <button type="button" class="plan-detail-close" title="关闭" @click="activePlanStage = ''">×</button>
          </div>
          <div v-if="activePlanRows.length" class="plan-detail-list">
            <div v-for="item in activePlanRows" :key="activePlanStage + item.name" class="plan-detail-row">
              <div class="plan-detail-info">
                <span class="plan-detail-name">{{ item.name }}</span>
                <span class="plan-detail-date">{{ item.date || '--' }}</span>
              </div>
              <button
                type="button"
                class="plan-download"
                :disabled="!item[activePlanStageUrlField]"
                :title="item[activePlanStageUrlField] ? '下载文件' : '暂无文件'"
                @click="downloadPlanStageFile(item)"
              >↓</button>
            </div>
          </div>
          <div v-else class="plan-detail-empty">暂无对应农场数据</div>
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
        <div
          class="benefit-item item-top"
          :class="{ active: activeBenefitType === 'yield' }"
          @click.stop
          @click="showBenefitDistribution('yield')"
        >
          <div class="b-value"><span>{{ bVal1 }}</span></div>
          <div class="b-label">新增农作物产量(吨)</div>
        </div>
        <!-- 化肥 -->
        <div
          class="benefit-item item-bl"
          :class="{ active: activeBenefitType === 'fertilizer' }"
          @click.stop
          @click="showBenefitDistribution('fertilizer')"
        >
          <div class="b-value"><span>{{ bVal2 }}</span></div>
          <div class="b-label">减少化肥使用量(吨)</div>
        </div>
        <!-- 经济效益 -->
        <div
          class="benefit-item item-br"
          :class="{ active: activeBenefitType === 'revenue' }"
          @click.stop
          @click="showBenefitDistribution('revenue')"
        >
          <div class="b-value"><span>{{ bVal3 }}</span></div>
          <div class="b-label">新增经济效益(万)</div>
        </div>

        <div class="benefit-distribution" v-if="activeBenefitType" @click.stop>
          <div class="bd-header">
            <span>{{ activeBenefitTitle }}农场分布</span>
            <button class="bd-close" @click="activeBenefitType = ''">×</button>
          </div>
          <div class="bd-list">
            <div class="bd-row" v-for="item in activeBenefitRows" :key="item.name">
              <div class="bd-row-top">
                <span class="bd-name">{{ item.name }}</span>
                <span class="bd-value">{{ item.value }}{{ activeBenefitUnit }}</span>
              </div>
              <div class="bd-bar">
                <div class="bd-bar-fill" :style="{ width: item.percent + '%' }"></div>
              </div>
            </div>
          </div>
          <div class="bd-note">按农场面积权重展示</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import gsap from 'gsap'

const farmTotalCount = ref(0)
const farmTotalArea = ref('0.0')
const farmVarietyCount = ref(0)
const farmCards = ref([])
const farmDistributionSource = ref([])

const improvementPlans = ref([])
const activePlanStage = ref('')

const planStageMeta = {
  before: { label: '初检完成', urlField: 'beforeUrl', icon: 'icon-scan', fileLabel: '检测前报告' },
  after: { label: '复检完成', urlField: 'afterUrl', icon: 'icon-review', fileLabel: '检测后报告' },
  plan: { label: '方案已制定', urlField: 'planUrl', icon: 'icon-plan', fileLabel: '改良方案' }
}

const planTotal = computed(() => improvementPlans.value.filter(item => item.planUrl).length)
const planTotalDisplay = computed(() => String(planTotal.value).padStart(3, '0'))
const planCompletionRate = computed(() => {
  if (!improvementPlans.value.length) return 0
  return Math.round(planTotal.value / improvementPlans.value.length * 100)
})
const planStages = computed(() => Object.entries(planStageMeta).map(([key, meta]) => ({
  key,
  ...meta,
  count: improvementPlans.value.filter(item => item[meta.urlField]).length
})))
const activePlanStageMeta = computed(() => planStageMeta[activePlanStage.value] || null)
const activePlanStageLabel = computed(() => activePlanStageMeta.value?.label || '')
const activePlanStageUrlField = computed(() => activePlanStageMeta.value?.urlField || '')
const activePlanRows = computed(() => {
  const field = activePlanStageUrlField.value
  if (!field) return []
  return improvementPlans.value.slice().sort((a, b) => Number(Boolean(b[field])) - Number(Boolean(a[field])))
})

const closePanelDetails = () => {
  activeBenefitType.value = ''
  activePlanStage.value = ''
}

const togglePlanStage = (stage) => {
  activePlanStage.value = activePlanStage.value === stage ? '' : stage
}

// 底部生态与经济效益动画数值
const bVal1 = ref(0)
const bVal2 = ref(0)
const bVal3 = ref(0)

const targetBVal1 = ref(0)
const targetBVal2 = ref(0)
const targetBVal3 = ref(0)
const activeBenefitType = ref('')
const activeBenefitRows = ref([])

const benefitMeta = {
  yield: { title: '新增农作物产量', unit: '吨', target: targetBVal1 },
  fertilizer: { title: '减少化肥使用量', unit: '吨', target: targetBVal2 },
  revenue: { title: '新增经济效益', unit: '万', target: targetBVal3 }
}

const activeBenefitTitle = ref('')
const activeBenefitUnit = ref('')

const showBenefitDistribution = (type) => {
  if (activeBenefitType.value === type) {
    activeBenefitType.value = ''
    return
  }

  const meta = benefitMeta[type]
  if (!meta) return

  activeBenefitType.value = type
  activeBenefitTitle.value = meta.title
  activeBenefitUnit.value = meta.unit

  const farms = farmDistributionSource.value.length
    ? farmDistributionSource.value
    : [{ name: '暂无农场数据', area: 1 }]
  const totalArea = farms.reduce((sum, item) => sum + item.area, 0) || 1
  const totalValue = parseFloat(meta.target.value) || 0

  activeBenefitRows.value = farms
    .map(item => {
      const value = totalValue * item.area / totalArea
      return {
        name: item.name,
        value: value.toFixed(2),
        percent: totalValue > 0 ? Math.max(3, Math.min(100, value / totalValue * 100)) : 0
      }
    })
    .sort((a, b) => parseFloat(b.value) - parseFloat(a.value))
    .slice(0, 5)
}

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

const downloadPlanStageFile = (item) => {
  const meta = activePlanStageMeta.value
  if (!meta || !item?.[meta.urlField]) return
  downloadFile(item[meta.urlField], `${item.name}_${meta.fileLabel}.pdf`)
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
      improvementPlans.value = json.data.map(item => ({
        name: item.name,
        date: item.date,
        beforeUrl: item.beforeUrl,
        afterUrl: item.afterUrl,
        planUrl: item.planUrl
      }))
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

      farmDistributionSource.value = list.map(item => ({
        name: item.farmName || '未知农场',
        area: Math.max(0, parseFloat(item.farmArea) || 0)
      })).filter(item => item.area > 0)
      
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
  height: 150px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  padding: 28px 24px 0;
  box-sizing: border-box;
}

.benefit-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 112px;
  min-width: 0;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
  z-index: 2;
}

.benefit-item:hover,
.benefit-item.active {
  transform: translateY(-4px);
  filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.45));
}

.benefit-item.active .b-value::after {
  border-color: rgba(255, 220, 85, 0.65);
  box-shadow:
    0 0 10px rgba(255, 220, 85, 0.4),
    inset 0 0 8px rgba(0, 110, 220, 0.16);
}

.b-value {
  width: 76px;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 22px;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-weight: bold;
  color: #eaf8ff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
  margin-bottom: 12px;
  border-radius: 50%;
  background:
    radial-gradient(circle at center, rgba(7, 27, 55, 0.92) 0 52%, rgba(2, 34, 68, 0.7) 53% 62%, transparent 63%);
  box-shadow:
    0 0 10px rgba(0, 170, 255, 0.28),
    inset 0 0 12px rgba(0, 0, 0, 0.45);
  isolation: isolate;
}

.b-value span {
  position: relative;
  z-index: 3;
  display: block;
  padding-top: 1px;
}

.b-value::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  z-index: 1;
  background:
    conic-gradient(
      from 0deg,
      transparent 0deg,
      transparent 34deg,
      rgba(0, 255, 255, 0.3) 52deg,
      #33f6ff 72deg,
      rgba(0, 158, 255, 0.14) 96deg,
      transparent 128deg,
      transparent 218deg,
      rgba(0, 255, 255, 0.18) 238deg,
      rgba(85, 255, 255, 0.75) 252deg,
      transparent 284deg,
      transparent 360deg
    );
  -webkit-mask: radial-gradient(circle, transparent 0 55%, #000 57% 68%, transparent 70%);
  mask: radial-gradient(circle, transparent 0 55%, #000 57% 68%, transparent 70%);
  animation: benefitRingSpin 2.8s linear infinite;
}

.b-value::after {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  z-index: 2;
  border: 1px solid rgba(0, 210, 255, 0.28);
  border-left-color: rgba(0, 210, 255, 0.06);
  border-bottom-color: rgba(0, 210, 255, 0.08);
  background: transparent;
  box-shadow:
    0 0 8px rgba(0, 210, 255, 0.18),
    inset 0 0 8px rgba(0, 110, 220, 0.16);
  pointer-events: none;
}

@keyframes benefitRingSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.benefit-distribution {
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 8px;
  z-index: 8;
  padding: 10px 12px 8px;
  background: linear-gradient(180deg, rgba(5, 28, 63, 0.96), rgba(2, 16, 38, 0.92));
  border: 1px solid rgba(0, 198, 255, 0.65);
  box-shadow:
    0 0 14px rgba(0, 180, 255, 0.38),
    inset 0 0 18px rgba(0, 150, 255, 0.18);
  backdrop-filter: blur(4px);
}

.benefit-distribution::before,
.benefit-distribution::after {
  content: '';
  position: absolute;
  top: -1px;
  width: 34px;
  height: 1px;
  background: #73faff;
  box-shadow: 0 0 8px #00eaff;
}

.benefit-distribution::before { left: 0; }
.benefit-distribution::after { right: 0; }

.bd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
  color: #dffcff;
  font-size: 13px;
  font-weight: bold;
  text-shadow: 0 0 6px rgba(0, 234, 255, 0.65);
}

.bd-close {
  width: 18px;
  height: 18px;
  line-height: 16px;
  padding: 0;
  border: 1px solid rgba(0, 220, 255, 0.5);
  background: rgba(0, 60, 120, 0.35);
  color: #aef8ff;
  cursor: pointer;
}

.bd-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.bd-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 12px;
}

.bd-name {
  max-width: 170px;
  color: #c8ecff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bd-value {
  color: #fff;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-weight: bold;
}

.bd-bar {
  height: 5px;
  background: rgba(15, 69, 110, 0.7);
  overflow: hidden;
}

.bd-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #00b6ff, #65fff1);
  box-shadow: 0 0 8px rgba(0, 234, 255, 0.65);
}

.bd-note {
  margin-top: 6px;
  color: rgba(185, 230, 255, 0.65);
  font-size: 11px;
  text-align: right;
}

.b-label {
  width: 118px;
  font-size: 12px;
  color: #ffffff; 
  letter-spacing: 0;
  line-height: 1.25;
  text-align: center;
  white-space: nowrap;
  text-shadow: 0 0 6px rgba(0, 162, 255, 0.55);
}

.item-top {
  top: auto;
  left: auto;
  transform: none;
}

.item-bl {
  top: auto;
  left: auto;
  transform: none;
}

.item-br {
  top: auto;
  right: auto;
  transform: none;
}

/* Improvement plan process console */
.plan-console {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 12px 24px 16px;
  box-sizing: border-box;
  overflow: hidden;
}

.plan-console::before {
  content: '';
  position: absolute;
  inset: 8px 18px 13px;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(0, 225, 255, 0.55), transparent 82%) left top / 75px 1px no-repeat,
    linear-gradient(270deg, rgba(0, 225, 255, 0.55), transparent 82%) right bottom / 75px 1px no-repeat;
  opacity: 0.8;
}

.plan-overview {
  height: 112px;
  display: flex;
  align-items: center;
  padding: 0 22px;
  box-sizing: border-box;
  background: linear-gradient(90deg, rgba(0, 42, 92, 0.18), rgba(0, 105, 160, 0.13), rgba(0, 42, 92, 0.05));
  border-top: 1px solid rgba(0, 220, 255, 0.22);
  border-bottom: 1px solid rgba(0, 143, 255, 0.2);
}

.plan-total-core {
  position: relative;
  width: 94px;
  height: 94px;
  flex: 0 0 94px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(3, 20, 50, 0.98) 0 48%, rgba(0, 94, 145, 0.24) 50% 62%, transparent 64%);
  box-shadow: inset 0 0 20px rgba(0, 145, 255, 0.18), 0 0 15px rgba(0, 208, 255, 0.16);
}

.plan-total-core::before,
.plan-total-core::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.plan-total-core::before {
  inset: 8px;
  border: 1px solid rgba(90, 245, 255, 0.38);
  border-left-color: transparent;
  border-bottom-color: rgba(255, 210, 62, 0.72);
  animation: planOrbit 5s linear infinite;
}

.plan-total-core::after {
  inset: 1px;
  background: repeating-conic-gradient(from 0deg, rgba(66, 235, 255, 0.75) 0 2deg, transparent 2deg 12deg);
  -webkit-mask: radial-gradient(circle, transparent 0 84%, #000 85% 88%, transparent 89%);
  mask: radial-gradient(circle, transparent 0 84%, #000 85% 88%, transparent 89%);
  opacity: 0.72;
}

.plan-scan-ring {
  position: absolute;
  inset: 14px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, transparent 0 285deg, rgba(0, 238, 255, 0.65) 330deg, transparent 360deg);
  -webkit-mask: radial-gradient(circle, transparent 0 67%, #000 69% 75%, transparent 77%);
  mask: radial-gradient(circle, transparent 0 67%, #000 69% 75%, transparent 77%);
  animation: planOrbit 2.8s linear infinite;
}

.plan-total-value {
  position: relative;
  z-index: 2;
  color: #effeff;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-size: 31px;
  line-height: 1;
  font-weight: 800;
  text-shadow: 0 0 8px rgba(0, 225, 255, 0.8);
}

.plan-total-unit {
  position: relative;
  z-index: 2;
  margin-top: 5px;
  color: #76dff3;
  font-size: 11px;
}

.plan-overview-copy {
  flex: 1;
  min-width: 0;
  padding-left: 24px;
}

.plan-overview-label {
  color: #d8f7ff;
  font-size: 15px;
  font-weight: 700;
  text-shadow: 0 0 7px rgba(0, 185, 255, 0.55);
}

.plan-rate-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 9px;
}

.plan-rate-value {
  color: #ffd74a;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-size: 25px;
  font-weight: 800;
  text-shadow: 0 0 8px rgba(255, 196, 26, 0.45);
}

.plan-rate-label {
  color: #8dbcd4;
  font-size: 11px;
}

.plan-rate-track {
  width: 100%;
  height: 4px;
  margin-top: 7px;
  overflow: hidden;
  background: rgba(5, 54, 94, 0.85);
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.7);
}

.plan-rate-track span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #00a9ff, #48fff0, #ffe04f);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.75);
  transition: width 0.8s ease;
}

.plan-flow {
  height: 130px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 8px 0;
  box-sizing: border-box;
}

.plan-stage {
  width: 92px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #d8f7ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  font-family: inherit;
}

.plan-stage-orbit {
  position: relative;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgba(0, 218, 255, 0.45);
  background: radial-gradient(circle, rgba(0, 179, 224, 0.28), rgba(1, 24, 58, 0.92) 65%);
  box-shadow: inset 0 0 11px rgba(0, 207, 255, 0.35), 0 0 8px rgba(0, 197, 255, 0.2);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.plan-stage-orbit::before {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border-top: 1px solid rgba(70, 246, 255, 0.82);
  border-right: 1px solid transparent;
  border-bottom: 1px solid rgba(24, 121, 224, 0.35);
  border-left: 1px solid transparent;
  animation: planOrbit 4s linear infinite;
}

.plan-stage:hover .plan-stage-orbit,
.plan-stage.active .plan-stage-orbit {
  transform: translateY(-2px);
  border-color: #ffe05b;
  box-shadow: inset 0 0 13px rgba(0, 226, 255, 0.5), 0 0 13px rgba(255, 209, 50, 0.35);
}

.plan-stage-orbit i {
  position: relative;
  width: 18px;
  height: 18px;
  display: block;
}

.plan-stage-orbit .icon-scan {
  border: 2px solid #4af5ff;
  border-radius: 50%;
  box-shadow: inset 0 0 5px rgba(0, 255, 255, 0.55);
}

.plan-stage-orbit .icon-scan::after {
  content: '';
  position: absolute;
  left: 2px;
  right: 2px;
  top: 7px;
  height: 2px;
  background: #ffe054;
  box-shadow: 0 0 5px #ffe054;
}

.plan-stage-orbit .icon-review {
  border-left: 2px solid #4af5ff;
  border-bottom: 2px solid #4af5ff;
  transform: rotate(-45deg) translate(1px, -1px);
}

.plan-stage-orbit .icon-review::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 14px;
  left: 8px;
  top: -3px;
  border-right: 2px solid #ffe054;
  border-bottom: 2px solid #ffe054;
}

.plan-stage-orbit .icon-plan {
  border: 2px solid #4af5ff;
  box-sizing: border-box;
}

.plan-stage-orbit .icon-plan::before,
.plan-stage-orbit .icon-plan::after {
  content: '';
  position: absolute;
  left: 3px;
  width: 8px;
  height: 1px;
  background: #ffe054;
  box-shadow: 0 0 4px rgba(255, 224, 84, 0.7);
}

.plan-stage-orbit .icon-plan::before { top: 5px; }
.plan-stage-orbit .icon-plan::after { top: 10px; }

.plan-stage strong {
  margin-top: 8px;
  color: #fff5b3;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-size: 19px;
  line-height: 1;
}

.plan-stage > span:last-child {
  margin-top: 5px;
  color: #a8ddf1;
  font-size: 11px;
  white-space: nowrap;
}

.plan-flow-line {
  position: relative;
  width: 37px;
  height: 1px;
  margin: 0 -4px 35px;
  overflow: hidden;
  background: rgba(0, 134, 205, 0.55);
}

.plan-flow-line i {
  position: absolute;
  top: 0;
  left: -15px;
  width: 15px;
  height: 1px;
  background: #6dffff;
  box-shadow: 0 0 6px #00eaff;
  animation: planFlow 1.8s linear infinite;
}

.plan-detail {
  position: absolute;
  left: 22px;
  right: 22px;
  bottom: 14px;
  height: 137px;
  z-index: 6;
  padding: 9px 11px;
  box-sizing: border-box;
  border: 1px solid rgba(0, 209, 255, 0.58);
  background: linear-gradient(180deg, rgba(3, 28, 65, 0.98), rgba(2, 14, 36, 0.97));
  box-shadow: 0 0 14px rgba(0, 169, 255, 0.32), inset 0 0 16px rgba(0, 108, 206, 0.12);
}

.plan-detail-head {
  height: 23px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #dffcff;
  font-size: 12px;
  font-weight: 700;
}

.plan-detail-close,
.plan-download {
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 224, 255, 0.5);
  background: rgba(0, 80, 135, 0.28);
  color: #b9fbff;
  cursor: pointer;
}

.plan-detail-close {
  width: 18px;
  height: 18px;
  font-size: 15px;
}

.plan-detail-list {
  height: 94px;
  overflow-y: auto;
  padding-right: 3px;
}

.plan-detail-list::-webkit-scrollbar { width: 3px; }
.plan-detail-list::-webkit-scrollbar-thumb { background: rgba(0, 211, 255, 0.6); }

.plan-detail-row {
  height: 31px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(64, 172, 219, 0.15);
}

.plan-detail-info {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
}

.plan-detail-name {
  width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #c9edff;
  font-size: 11px;
}

.plan-detail-date {
  color: #6f9db7;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-size: 10px;
}

.plan-download {
  width: 23px;
  height: 21px;
  flex: 0 0 23px;
  font-size: 15px;
  line-height: 1;
}

.plan-download:hover:not(:disabled) {
  color: #ffe15a;
  border-color: rgba(255, 220, 75, 0.75);
  box-shadow: 0 0 7px rgba(255, 216, 44, 0.32);
}

.plan-download:disabled {
  opacity: 0.3;
  cursor: default;
}

.plan-detail-empty {
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #668ca5;
  font-size: 12px;
}

@keyframes planOrbit {
  to { transform: rotate(360deg); }
}

@keyframes planFlow {
  to { transform: translateX(52px); }
}
</style>
