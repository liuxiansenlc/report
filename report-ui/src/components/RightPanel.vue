<template>
  <div class="right-panel">
    <!-- 顶部下拉选择器 -->
    <div class="custom-select" @click="toggleDropdown">
      <div class="select-text">{{ selectedValue || '请选择（可展示到乡镇一级）' }}</div>
      <div class="select-icon" :class="{ 'icon-up': isOpen }"></div>
      
      <!-- 展开的下拉菜单 -->
      <transition name="fade">
        <div class="dropdown-menu" v-if="isOpen">
          <div 
            class="dropdown-item" 
            v-for="(item, index) in options" 
            :key="index"
            @click.stop="selectOption(item)"
          >
            {{ item }}
          </div>
        </div>
      </transition>
    </div>

    <div class="rp-content">
      <div class="rp-title main-title">耕地质量指标评价</div>

      <!-- 1. 农作物适应性(酸碱度) -->
      <div class="rp-section sec-crop">
        <div class="sec-title">农作物适种性(酸碱度)</div>
        <div class="crop-data">
          <div class="crop-left-space"></div>
          <div class="crop-right-area">
            <div class="crop-labels">
              <span class="cl-box"><span class="blue-dot"></span>改良前</span>
              <span class="cl-box"><span class="blue-dot"></span>改良后</span>
              <span class="crop-trend" :class="calcDiff(overview.ph.before, overview.ph.after).cls" style="display: flex; align-items: center; gap: 4px;">
                <img src="../assets/images/涨停.png" class="trend-icon-img" v-if="calcDiff(overview.ph.before, overview.ph.after).isUp" />
                <img src="../assets/images/下降.png" class="trend-icon-img" v-else />
                {{ calcDiff(overview.ph.before, overview.ph.after).text }}
              </span>
            </div>
            <div class="crop-values">
              <span class="cv-val txt-dark">{{ overview.ph.before }}</span>
              <span class="cv-val txt-blue">{{ overview.ph.after }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. 有机质(mg/kg) -->
      <div class="rp-section sec-organic">
        <div class="sec-title">有机质(mg/kg)</div>
        <div class="org-layout">
          <div class="org-platform">
             <div class="op-top">
               <span>改良前</span><span>/</span><span>改良后</span>
             </div>
             <div class="op-bot">
               <span class="val-dark">{{ overview.organicMatter.before }}</span>
               <span class="val-slash">/</span>
               <span class="val-blue">{{ overview.organicMatter.after }}</span>
             </div>
          </div>
          
          <!-- 改良幅度居中 -->
          <div class="org-trend">
            <span class="ot-lbl">改良幅度</span>
            <span :class="calcDiff(overview.organicMatter.before, overview.organicMatter.after).cls" style="display: flex; align-items: center; gap: 4px;">
              <img src="../assets/images/涨停.png" class="trend-icon-img" v-if="calcDiff(overview.organicMatter.before, overview.organicMatter.after).isUp" />
              <img src="../assets/images/下降.png" class="trend-icon-img" v-else />
              {{ calcDiff(overview.organicMatter.before, overview.organicMatter.after).text }}
            </span>
          </div>

          <!-- 等级和进度条 -->
          <div class="org-level-box">
             <span class="lvl-label">等级</span>
             <div class="lvl-num-pill">{{ omLevel.num }}</div>
             <div class="org-bars">
               <div v-for="i in 5" :key="i" class="prog-bar"
                 :style="omLevel.num >= i
                   ? { background: omLevelMap[i-1].color, boxShadow: `0 0 5px ${omLevelMap[i-1].color}` }
                   : {}"
               ></div>
             </div>
             <span class="lvl-desc" :style="{ color: omLevel.color }">{{ omLevel.text }}</span>
          </div>
        </div>
      </div>

      <!-- 3. 水解氮、有效磷、速效钾 -->
      <div class="rp-section sec-npk">
        <div class="sec-title">水解氮、有效磷、速效钾</div>
        <div class="npk-grid">
           <div class="npk-header">
             <div class="nh-left">改良前</div>
             <div class="nh-right">改良后</div>
           </div>
           
           <!-- 水解氮 -->
           <div class="npk-row">
             <div class="nr-left">
               <span class="nr-val txt-dark">{{ overview.hydroNitrogen.before }}</span>
               <div class="nr-bar-wrap"><div class="nr-bar" :style="{ width: barPct(overview.hydroNitrogen.before, overview.hydroNitrogen.after) }"></div></div>
             </div>
             <div class="nr-center">
               <div class="nc-trend" :class="calcDiff(overview.hydroNitrogen.before, overview.hydroNitrogen.after).cls">
                 <img src="../assets/images/涨停.png" class="trend-icon-img" v-if="calcDiff(overview.hydroNitrogen.before, overview.hydroNitrogen.after).isUp" />
                 <img src="../assets/images/下降.png" class="trend-icon-img" v-else />
                 {{ calcDiff(overview.hydroNitrogen.before, overview.hydroNitrogen.after).text }}
               </div>
               <div class="nc-name">水解氮</div>
             </div>
             <div class="nr-right">
               <div class="nr-bar-wrap"><div class="nr-bar" :style="{ width: barPct(overview.hydroNitrogen.after, overview.hydroNitrogen.before) }"></div></div>
               <span class="nr-val txt-blue">{{ overview.hydroNitrogen.after }}</span>
             </div>
           </div>
           
           <!-- 有效磷 -->
           <div class="npk-row">
             <div class="nr-left">
               <span class="nr-val txt-dark">{{ overview.availPhosphorus.before }}</span>
               <div class="nr-bar-wrap"><div class="nr-bar" :style="{ width: barPct(overview.availPhosphorus.before, overview.availPhosphorus.after) }"></div></div>
             </div>
             <div class="nr-center">
               <div class="nc-trend" :class="calcDiff(overview.availPhosphorus.before, overview.availPhosphorus.after).cls">
                 <img src="../assets/images/涨停.png" class="trend-icon-img" v-if="calcDiff(overview.availPhosphorus.before, overview.availPhosphorus.after).isUp" />
                 <img src="../assets/images/下降.png" class="trend-icon-img" v-else />
                 {{ calcDiff(overview.availPhosphorus.before, overview.availPhosphorus.after).text }}
               </div>
               <div class="nc-name">有效磷</div>
             </div>
             <div class="nr-right">
               <div class="nr-bar-wrap"><div class="nr-bar" :style="{ width: barPct(overview.availPhosphorus.after, overview.availPhosphorus.before) }"></div></div>
               <span class="nr-val txt-blue">{{ overview.availPhosphorus.after }}</span>
             </div>
           </div>
           
           <!-- 速效钾 -->
           <div class="npk-row">
             <div class="nr-left">
               <span class="nr-val txt-dark">{{ overview.availPotassium.before }}</span>
               <div class="nr-bar-wrap"><div class="nr-bar" :style="{ width: barPct(overview.availPotassium.before, overview.availPotassium.after) }"></div></div>
             </div>
             <div class="nr-center">
               <div class="nc-trend" :class="calcDiff(overview.availPotassium.before, overview.availPotassium.after).cls">
                 <img src="../assets/images/涨停.png" class="trend-icon-img" v-if="calcDiff(overview.availPotassium.before, overview.availPotassium.after).isUp" />
                 <img src="../assets/images/下降.png" class="trend-icon-img" v-else />
                 {{ calcDiff(overview.availPotassium.before, overview.availPotassium.after).text }}
               </div>
               <div class="nc-name">速效钾</div>
             </div>
             <div class="nr-right">
               <div class="nr-bar-wrap"><div class="nr-bar" :style="{ width: barPct(overview.availPotassium.after, overview.availPotassium.before) }"></div></div>
               <span class="nr-val txt-blue">{{ overview.availPotassium.after }}</span>
             </div>
           </div>
        </div>
      </div>

      <!-- Bottom: 重金属镉污染风险 -->
      <div class="rp-title sub-title">重金属镉污染风险</div>
      <div class="rp-section sec-risk">
        <div class="risk-legend">
          <div class="rl-item"><span class="dot g-green"></span>低风险</div>
          <div class="rl-item"><span class="dot g-yellow"></span>高风险</div>
          <div class="rl-item"><span class="dot g-orange"></span>严管控</div>
        </div>
        <div class="risk-charts">
          <div class="chart-box">
             <div ref="chart1Ref" class="echart-ring"></div>
             <div class="chart-center-txt">改良前</div>
          </div>
          <div class="chart-box">
             <div ref="chart2Ref" class="echart-ring"></div>
             <div class="chart-center-txt">改良后</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as echarts from 'echarts'

const isOpen = ref(false)
const selectedValue = ref('')
const options = ref([
  '全国',
  '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
  '辽宁省', '吉林省', '黑龙江省',
  '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省',
  '重庆市', '四川省', '贵州省', '云南省', '西藏自治区',
  '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区'
])

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (item) => {
  selectedValue.value = item
  isOpen.value = false
}

// ============ 首页总览数据 ============
const defaultStat = () => ({ before: 0, after: 0 })
const overview = ref({
  ph:              defaultStat(),
  organicMatter:   defaultStat(),
  hydroNitrogen:   defaultStat(),
  availPhosphorus: defaultStat(),
  availPotassium:  defaultStat()
})

// 计算改良幅度，返回 { text, cls }
const calcDiff = (before, after) => {
  const b = parseFloat(before) || 0
  const a = parseFloat(after)  || 0
  if (b === 0) return { text: '-', cls: 'trend-red' }
  const pct = ((a - b) / b * 100).toFixed(1)
  const up = parseFloat(pct) >= 0
  return {
    text: (up ? '+' : '') + pct + '%',
    cls: up ? 'trend-red' : 'trend-green',
    isUp: up
  }
}

// 进度条百分比：以两值中较大*1.3为基准
const barPct = (val, other) => {
  const v = parseFloat(val)   || 0
  const o = parseFloat(other) || 0
  const max = Math.max(v, o) * 1.3 || 1
  return Math.min(100, Math.max(0, (v / max) * 100)).toFixed(0) + '%'
}

// 有机质等级映射（正确规则：每级跨10，共5档）
const omLevelMap = [
  { min: 0,  max: 10,  num: 1, text: '极缺乏', color: '#ffb347' },
  { min: 10, max: 20,  num: 2, text: '缺乏',   color: '#ffd700' },
  { min: 20, max: 30,  num: 3, text: '中等',   color: '#9acd32' },
  { min: 30, max: 40,  num: 4, text: '较丰富', color: '#90ee90' },
  { min: 40, max: Infinity, num: 5, text: '丰富', color: '#228b22' }
]
const omLevel = computed(() => {
  const v = parseFloat(overview.value.organicMatter.after) || 0
  return omLevelMap.find(l => v >= l.min && v < l.max) || omLevelMap[3]
})

const loadOverview = async () => {
  try {
    const res = await fetch('/api/datasource/dashboard-overview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    const json = await res.json()
    if (json.code === 200 && json.data) {
      const d = json.data
      overview.value.ph              = { before: d.ph?.before ?? 0,              after: d.ph?.after ?? 0 }
      overview.value.organicMatter   = { before: d.organicMatter?.before ?? 0,   after: d.organicMatter?.after ?? 0 }
      overview.value.hydroNitrogen   = { before: d.hydroNitrogen?.before ?? 0,   after: d.hydroNitrogen?.after ?? 0 }
      overview.value.availPhosphorus = { before: d.availPhosphorus?.before ?? 0, after: d.availPhosphorus?.after ?? 0 }
      overview.value.availPotassium  = { before: d.availPotassium?.before ?? 0,  after: d.availPotassium?.after ?? 0 }
    }
  } catch (e) {
    console.error('获取首页概览数据失败:', e)
  }
}

// Echarts instances
const chart1Ref = ref(null)
const chart2Ref = ref(null)

onMounted(() => {
  loadOverview()
  const getPieOption = (data, centerText) => ({
    backgroundColor: 'transparent',
    series: [
      {
        type: 'pie',
        radius: ['28%', '46%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        clockwise: false,
        padAngle: 3,
        label: {
          show: true,
          position: 'outside',
          alignTo: 'edge',
          edgeDistance: 4,
          bleedMargin: 1,
          distanceToLabelLine: 2,
          formatter: '{c}%',
          fontSize: 12,
          fontWeight: 'bold',
          color: '#fff',
          textShadowColor: 'rgba(0, 0, 0, 0.8)',
          textShadowBlur: 4,
        },
        labelLine: {
          show: true,
          length: 6,
          length2: 10,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.75)',
            width: 1
          }
        },
        itemStyle: { borderWidth: 0 },
        data: data.sort((a, b) => b.value - a.value) 
      },
      {
        type: 'pie',
        radius: ['0%', '0%'],
        center: ['50%', '50%'],
        silent: true,
        label: {
          show: true,
          position: 'center',
          formatter: centerText,
          fontSize: 13,
          color: '#fff',
          fontWeight: 'bold',
        },
        data: [{ value: 1, itemStyle: { color: 'transparent' } }]
      }
    ]
  })

  // 统一基础颜色：低风险 #00ffba, 高风险 #ffd700, 严管控 #ff4500
  if (chart1Ref.value) {
    const chart1 = echarts.init(chart1Ref.value)
    chart1.setOption(getPieOption([
      { value: 55, name: '低风险', itemStyle: { color: '#00ffba' } },
      { value: 25, name: '高风险', itemStyle: { color: '#ffd700' } },
      { value: 20, name: '严管控', itemStyle: { color: '#ff4500' } }
    ], '改良前'))
  }

  if (chart2Ref.value) {
    const chart2 = echarts.init(chart2Ref.value)
    chart2.setOption(getPieOption([
      { value: 65, name: '低风险', itemStyle: { color: '#00ffba' } },
      { value: 20, name: '高风险', itemStyle: { color: '#ffd700' } },
      { value: 15, name: '严管控', itemStyle: { color: '#ff4500' } }
    ], '改良后'))
  }
})
</script>

<style scoped>
.right-panel {
  width: 440px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.custom-select {
  width: 403px;
  height: 33px;
  background: url('../assets/images/选择框.png') no-repeat center;
  background-size: 100% 100%;
  margin: 15px auto 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  box-sizing: border-box;
  cursor: pointer;
  position: relative;
}

.select-text {
  font-size: 13px;
  color: #a0c4e0;
  letter-spacing: 1px;
}

.select-icon {
  width: 0; 
  height: 0; 
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid #00a2ff;
  margin-right: 5px;
  transition: transform 0.3s ease;
}

.select-icon.icon-up {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 35px;
  left: 0;
  width: 100%;
  background: rgba(3, 20, 50, 0.95);
  border: 1px solid rgba(0, 162, 255, 0.5);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  border-radius: 2px;
  z-index: 99;
  max-height: 160px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 10px 15px;
  font-size: 13px;
  color: #cce8ff;
  cursor: pointer;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: rgba(0, 162, 255, 0.3);
  color: #ffffff;
}


.rp-content {
  width: 413px;
  height: 902px; 
  background: url('../assets/images/right_new.png') no-repeat left top;
  background-size: 100% 100%;
  margin-top: 15px;
  position: relative;
  flex-shrink: 0; 
}

/* 蓝色横幅标题 */
.rp-title {
  font-size: 20px;
  font-weight: 900;
  color: #fff;
  letter-spacing: 2px;
  position: absolute;
  font-style: italic;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.8), 0 0 10px rgba(0, 162, 255, 0.8);
}
.main-title {
  top: 5px;
  left: 40px;
}
.sub-title {
  top: 689px; 
  left: 40px;
}

/* 面板段落框架 */
.rp-section {
  position: absolute;
  width: 100%;
}
.sec-title {
  font-size: 14px;
  color: #ffffff;
  font-weight: bold;
  letter-spacing: 1px;
  padding-left: 35px;
  font-style: italic;
  margin-bottom: 25px;
}

.txt-dark { color: #fff !important; }
.txt-blue { color: #00ffff !important; }
.trend-red { color: #ff4500; font-size: 12px; font-weight: bold; }
.trend-green { color: #00bb77; font-size: 12px; font-weight: bold; }

/* --- 1. 农作物适应性 --- */
.sec-crop {
  top: 55px; 
}
.crop-data {
  display: flex;
  align-items: center;
  padding: 0 40px;
  height: 60px;
}
.crop-left-space {
  width: 110px; 
}
.crop-right-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.crop-labels {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 12px;
  color: #a0c4e0;
}
.cl-box {
  background: transparent;
  color: #a0c4e0;
  display: flex;
  align-items: center;
  gap: 4px;
}
.crop-labels .cl-box:nth-child(2) {
  margin-left: 30px;
}
.blue-dot {
  width: 4px; height: 4px; background: #00ffff; border-radius: 50%;
}
.crop-trend {
  margin-left: auto;
}
.crop-values {
  display: flex;
  align-items: center;
  gap: 40px;
  padding-left: 10px;
}
.cv-val {
  font-size: 20px;
  font-family: 'Arial Narrow';
  font-weight: bold;
}
.crop-values .cv-val:nth-child(2) {
  margin-left: 30px;
}

/* --- 2. 有机质 --- */
.sec-organic {
  top: 125px;
}
.sec-organic .sec-title {
  position: relative;
  top: 50px;
}
.org-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 40px;
}
.org-platform {
  width: 100%;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
}
.op-top {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #a0c4e0;
  font-weight: normal;
  margin-bottom: 5px;
}
.op-bot {
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.val-dark { font-size: 20px; font-weight: bold; color: #fff; font-family: 'Arial Narrow'; }
.val-slash { font-size: 16px; color: #a0c4e0; }
.val-blue { font-size: 20px; font-weight: bold; color: #00ffff; font-family: 'Arial Narrow'; }

.org-trend {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 40px;
  margin-bottom: 25px;
}
.ot-lbl { font-size: 13px; color: #a0c4e0; }

.org-level-box {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  justify-content: center;
}
.lvl-label { font-size: 13px; color: #a0c4e0; }
.lvl-num-pill {
  background: rgba(0, 162, 255, 0.2);
  color: #fff;
  border-radius: 12px;
  padding: 2px 12px;
  font-weight: bold;
  font-style: italic;
  border: 1px solid rgba(0, 162, 255, 0.5);
}
.org-bars { display: flex; gap: 8px; }
.prog-bar { width: 25px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; }
.lvl-desc { font-size: 14px; font-weight: bold; }

/* --- 3. NPK --- */
.sec-npk {
  top: 400px;
}
.npk-grid {
  display: flex;
  flex-direction: column;
  padding: 0 35px;
  gap: 0; /* Remove gap so rows touch each other */
}
.npk-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #a0c4e0;
  padding: 0 10px;
  margin-bottom: 5px;
}
.npk-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 55px; /* Fixed height for rows to make center blocks touch */
}
.nr-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end; /* Push to right, touching center */
  width: 130px;
  gap: 15px; /* Gap between number and track */
}
.nr-right {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start; /* Push to left, touching center */
  width: 130px;
  gap: 15px;
}
.nr-val { font-size: 16px; font-family: 'Arial Narrow'; font-weight: bold; }

.nr-bar-wrap {
  width: 80px; /* Fixed length for track */
  height: 10px; /* Thinner bars */
  background: rgba(4, 25, 60, 0.8); /* Solid dark track */
  border-radius: 0; /* Square bars */
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}
.nr-right .nr-bar-wrap {
  background: rgba(4, 25, 60, 0.8);
}
.nr-bar {
  position: absolute;
  top: 0; 
  height: 100%;
  border-radius: 0; /* Square bars */
}

/* Left side: bar anchored to the right (touching center) */
.nr-left .nr-bar {
  right: 0; 
  left: auto;
  background: linear-gradient(270deg, #0055cc, #00ffff);
}

/* Right side: bar anchored to the left (touching center) */
.nr-right .nr-bar {
  left: 0; 
  right: auto;
  background: linear-gradient(90deg, #0055cc, #00ffff);
}

.nr-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(5, 35, 85, 0.7); /* Solid darker blue block */
  border-left: 1px solid rgba(160, 196, 224, 0.2);
  border-right: 1px solid rgba(160, 196, 224, 0.2);
  width: 80px;
  height: 100%; /* Fill the row */
  box-sizing: border-box;
  gap: 6px;
}

/* Make the top and bottom rounded */
.npk-row:first-child .nr-center {
  border-top: 1px solid rgba(160, 196, 224, 0.2);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.npk-row:last-child .nr-center {
  border-bottom: 1px solid rgba(160, 196, 224, 0.2);
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
/* REMOVE Separator between center cells to make it solid */
.npk-row:not(:first-child) .nr-center {
  border-top: none;
}

.nc-trend { 
  font-size: 13px; 
  display: flex; 
  align-items: center; 
  gap: 4px; 
  font-weight: bold;
}
.trend-icon-img {
  width: 14px;
  height: 14px;
  object-fit: contain;
}
.nc-name { font-size: 13px; color: #ffffff; } /* Name is white */

/* --- Bottom: 重金属镉风险 --- */
.sec-risk {
  top: 750px;
}
.risk-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: absolute;
  left: 20px;
  top: 20px;
}
.rl-item { font-size: 12px; color: #ffffff; display: flex; align-items: center; gap: 8px; font-weight: bold; }
.dot { width: 12px; height: 6px; border-radius: 3px; }
.g-green { background: #00bb77; }
.g-yellow { background: #ffaa00; }
.g-orange { background: #ff4500; }

.risk-charts {
  display: flex;
  justify-content: flex-end;
  padding-left: 72px;
  padding-right: 0;
  gap: 0;
}
.chart-box {
  width: 166px;
  height: 140px;
  position: relative;
}
.echart-ring {
  width: 100%;
  height: 100%;
}
.chart-center-txt {
  display: none;
}
</style>
