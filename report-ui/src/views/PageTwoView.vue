<template>
  <div class="dashboard-body">
    <div class="side-panel left-panel-wrapper">


      <!-- 左侧大看板主体 -->
      <div class="left-board">
        <!-- 区块1：农场基本信息 -->
        <div class="left-section s1-farm-info">
          <div class="sec-title left-title" v-if="selectedFarm">{{ selectedFarm.farmName }}基本信息</div>
          <div class="sec-title left-title" v-else>农场基本信息</div>
          <div class="s1-content flex-row">
             <div class="farm-details" v-if="selectedFarm">
                <div class="detail-row">
                  <div class="detail-col"><span class="d-label">农场编号</span><span class="d-val">{{ selectedFarm.farmCode || '未知' }}</span></div>
                  <div class="detail-col"><span class="d-label">农场面积</span><span class="d-val">{{ selectedFarm.farmArea || 0 }} 亩</span></div>
                </div>
                <div class="detail-row">
                  <div class="detail-col"><span class="d-label">农场主姓名</span><span class="d-val">{{ selectedFarm.farmerName || '未知' }}</span></div>
                  <div class="detail-col"><span class="d-label">联系方式</span><span class="d-val">{{ selectedFarm.contactInfo || '无' }}</span></div>
                </div>
                <div class="detail-row full-row">
                  <div class="detail-col"><span class="d-label">农场地址</span><span class="d-val address">{{ selectedFarm.farmAddress || '未录入' }}</span></div>
                </div>
             </div>
             <div class="farm-details" v-else>
               <div style="color:#cce8ff; padding: 20px;">数据加载中...</div>
             </div>
          </div>
        </div>

        <!-- 区块2：改良方案情况 -->
        <div class="left-section s2-plan">
          <div class="sec-title left-title">改良方案情况</div>
          
          <div class="s2-plan-details static-card-new" v-if="currentPlan">
            <div class="q-avatar-box">
              <img src="../assets/images/左上图片.png" class="q-avatar" />
            </div>
            <div class="q-inner">
              <div class="q-header">
                <span class="q-title">{{ currentPlan.name }}</span>
              </div>
              <div class="q-date">{{ currentPlan.date }}</div>
              <div class="q-body">
                <div class="q-dl-item">
                  <span class="q-dl-label">检测前</span>
                  <img v-if="currentPlan.beforeUrl" src="../assets/images/下载按钮.png" class="q-icon-btn" @click="downloadFile(currentPlan.beforeUrl, currentPlan.name + '_检测前报告.pdf')" />
                  <span v-else class="q-no-file">-</span>
                </div>
                <div class="q-dl-item">
                  <span class="q-dl-label">检测后</span>
                  <img v-if="currentPlan.afterUrl" src="../assets/images/下载按钮.png" class="q-icon-btn" @click="downloadFile(currentPlan.afterUrl, currentPlan.name + '_检测后报告.pdf')" />
                  <span v-else class="q-no-file">-</span>
                </div>
                <div class="q-dl-item">
                  <span class="q-dl-label">改良方案</span>
                  <img v-if="currentPlan.planUrl" src="../assets/images/下载按钮.png" class="q-icon-btn" @click="downloadFile(currentPlan.planUrl, currentPlan.name + '_改良方案.pdf')" />
                  <span v-else class="q-no-file">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 区块3：微生物量 -->
        <div class="left-section s3-bio">
          <div class="sec-title left-title">微生物量</div>
          <div class="s3-content flex-row">
            
            <!-- 左侧：悬空发光数值（改良后） -->
            <div class="bio-left-hologram">
              <div class="bio-huge-val bio-flipper-box" :key="bioFlipperKey">
                <template v-for="(char, idx) in bioDisplayDigits" :key="idx">
                  <div v-if="char === '.'" class="bio-digit-dot">.</div>
                  <div v-else class="bio-flip-digit">
                    <div class="bio-digit-roller" :style="{ '--target-y': `-${parseInt(char) * 10}%` }">
                      <div class="bio-roller-num" v-for="n in 10" :key="n-1">{{ n-1 }}</div>
                    </div>
                  </div>
                </template>
              </div>
              <div class="bio-sub-label">微生物碳</div>
            </div>
            
            <!-- 右侧：指标条与幅度 -->
            <div class="bio-right-stats">
               <div class="bio-stat-row">
                 <span class="bio-label">改良前</span>
                 <span class="bio-score">{{ biomassCarbonData.beforeCarbon }}</span>
                 <span class="bio-status">{{ biomassCarbonData.statusLabel }}</span>
               </div>
               <div class="bio-progress-bar">
                 <div class="bio-inner-bar" :style="{ width: biomassCarbonData.progressPct }"></div>
               </div>
               
               <div class="bio-stat-row margin-top-row">
                 <span class="bio-label">改良幅度</span>
                 <div class="bio-diff">
                   <img v-if="parseFloat(biomassCarbonData.diff) > 0" class="diff-icon-img" src="../assets/images/涨停.png" />
                   <img v-else-if="parseFloat(biomassCarbonData.diff) < 0" class="diff-icon-img" src="../assets/images/下降.png" />
                   <span :class="['diff-val', parseFloat(biomassCarbonData.diff) > 0 ? 'up' : (parseFloat(biomassCarbonData.diff) < 0 ? 'down' : '')]">{{ parseFloat(biomassCarbonData.diff) > 0 ? '+' : '' }}{{ biomassCarbonData.diff }}%</span>
                 </div>
               </div>
            </div>
            
          </div>
        </div>

        <!-- 区块4：微生物碳氮比 (双指标左右对比) -->
        <div class="left-section s4-cn-ratio">
          <div class="sec-title left-title">微生物碳氮比</div>
          <div class="cn-compare-row new-layout">
            <!-- 左：改良前 -->
            <div class="cn-compare-item before">
              <div class="cn-compare-tag">改良前</div>
              <div class="cn-compare-value num-gold">
                {{ microbialData.beforeRatio }}<span class="cn-ratio-unit">:1</span>
              </div>
            </div>

            <!-- 中间占位以撑开两边 -->
            <div class="cn-center-orb">
              <img src="../assets/images/5_2.png" class="orb-img" />
            </div>

            <!-- 右：改良后 -->
            <div class="cn-compare-item after">
              <div class="cn-compare-tag after-tag">改良后</div>
              <div class="cn-compare-value num-cyan">
                {{ microbialData.afterRatio }}<span class="cn-ratio-unit">:1</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    
    <div class="center-panel">
      <!-- 顶部下拉选择器 -->
      <div class="farm-select-container">
        <div class="farm-custom-select" @click="toggleDropdown">
          <div class="select-text" style="width: 100%; text-align: center;">{{ selectedFarm ? selectedFarm.farmName : '请选择农场' }}</div>
          
          <transition name="fade">
            <div class="dropdown-menu" v-if="isOpen">
              <div 
                class="dropdown-item" 
                v-for="(item, index) in farmList" 
                :key="index"
                @click.stop="selectFarm(item)"
              >
                {{ item.farmName }}
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- 中间图片区域 -->
      <div class="main-center-image-container">
        <img src="../assets/images/2_center_bk.png" class="center-img-layer img-bg" />
        <img src="../assets/images/2_center_bktp.png" class="center-img-layer img-fg" />

        <!-- AI 机器人辅助助手 -->
        <div class="ai-robot-box" @click="toggleChat">
          <img src="../assets/images/ai.png" class="ai-avatar" />
          <div class="ai-bubble" v-if="!isChatOpen">
            <div class="ai-text">您好！我是您的智能农业助手，有任何问题都可以问我哦～</div>
          </div>
          
          <!-- AI 聊天面板放在机器人容器内部，随动 -->
          <div class="ai-chat-panel" v-if="isChatOpen" @click.stop>
            <div class="chat-header">
              <span>智能农业助手</span>
              <button class="close-btn" @click.stop="toggleChat">×</button>
            </div>
            <div class="chat-body" ref="chatBodyRef">
              <div v-for="(msg, index) in chatMessages" :key="index" :class="['chat-msg', msg.role]">
                <div class="msg-content">{{ msg.content }}</div>
              </div>
              <div class="chat-msg ai" v-if="isAiTyping">
                <div class="msg-content typing-dots">正在思考...</div>
              </div>
            </div>
            <div class="chat-footer">
              <input 
                v-model="chatInput" 
                type="text" 
                placeholder="请输入您的问题..." 
                @keyup.enter="sendMessage"
              />
              <button class="send-btn" @click="sendMessage">发送</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 为下方的模块预留位置：水平3个模块布局 -->
      <div class="bottom-modules-container">
        <!-- 模块1：左侧酸碱匹配度 -->
        <div class="bm-box left-bm">
          <div class="echart-wrapper" ref="chartPhRef"></div>
        </div>
        
        <!-- 模块2：居中模块-镉污染 -->
        <div class="bm-box center-bm">
          <div class="risk-title">镉污染：<span class="risk-level">{{ cadmiumRiskData.riskLevel }}</span></div>
          <div class="echart-wrapper" ref="chartRiskRef"></div>
        </div>
        
        <!-- 模块3：居中模块-重金属镉含量 -->
        <div class="bm-box right-bm">
          <div class="risk-title">重金属镉含量</div>
          
          <div class="cd-stats-container">
            <!-- 左侧有效镉 -->
            <div class="cd-col col-left">
              <div class="cd-label sm">改良前</div>
              <div class="cd-val num-orange">{{ cadmiumData.availBefore }}</div>
              <div class="cd-label md">有效镉</div>
              <div class="cd-val num-orange">{{ cadmiumData.availAfter }}</div>
              <div class="cd-label sm">改良后</div>
            </div>
            
            <!-- 右侧总镉 -->
            <div class="cd-col col-right">
              <div class="cd-label sm">改良前</div>
              <div class="cd-val num-cyan">{{ cadmiumData.totalBefore }}</div>
              <div class="cd-label md">总镉</div>
              <div class="cd-val num-cyan">{{ cadmiumData.totalAfter }}</div>
              <div class="cd-label sm">改良后</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="side-panel right-panel-wrapper">
      <!-- 右侧顶部下拉选择器 -->
      <div class="crop-select-container">
        <div class="crop-custom-select" @click="toggleCropDropdown">
          <div class="crop-select-text">{{ selectedCrop || '请选择不同农作物品种' }}</div>
          
          <transition name="fade">
            <div class="dropdown-menu crop-dropdown" v-if="isCropOpen">
              <div 
                class="dropdown-item" 
                v-for="(item, index) in cropOptions" 
                :key="index"
                @click.stop="selectCrop(item)"
              >
                {{ item }}
              </div>
            </div>
          </transition>
        </div>
      </div>
      
      <!-- 右侧大数据看板背景体 -->
      <div class="right-board">
        <div class="board-title">耕地质量指标评价</div>
        
        <!-- 区块1：有机质 -->
        <div class="organic-section">
          <div class="section-title">有机质(mg/kg)</div>
          
          <div class="organic-disc-container">
            <img src="../assets/images/yp_bg.png" class="yp-bg-rotating" />
            <!-- 悬浮于自带3D图腾上方的数据群 -->
            <div class="disc-data">
              <div class="disc-headers">
                <span>改良前</span><span>改良后</span>
              </div>
              <div class="disc-values">
                <span class="old-val">{{ organicMatterData.before }}</span><span class="divider">/</span><span class="new-val">{{ organicMatterData.after }}</span>
              </div>
            </div>
          </div>
          
          <div class="diff-tag">
            <span class="diff-label">改良幅度</span>
            <img class="diff-icon-img" v-if="parseFloat(organicMatterData.diff) > 0" src="../assets/images/涨停.png" />
            <img class="diff-icon-img" v-else-if="parseFloat(organicMatterData.diff) < 0" src="../assets/images/下降.png" />
            <span class="diff-val" :style="{ color: parseFloat(organicMatterData.diff) > 0 ? '#ff0000' : (parseFloat(organicMatterData.diff) < 0 ? '#00ff00' : '#ffffff') }">{{ parseFloat(organicMatterData.diff) > 0 ? '+' : '' }}{{ organicMatterData.diff }}%</span>
          </div>
          
          <!-- 彩色等级长条 -->
          <div class="level-indicator">
            <div class="level-text-row">
              <span class="lvl-label">等级</span>
              <span class="lvl-num" :style="{ color: organicMatterData.color }">{{ organicMatterData.level }}</span>
              <span class="lvl-status" :style="{ color: organicMatterData.color }">{{ organicMatterData.status }}</span>
            </div>
            <div class="level-bars">
              <div class="bar bar-1" :style="{ backgroundColor: organicMatterData.level >= 1 ? levelValueMap['一级'].color : '#1f4886' }"></div>
              <div class="bar bar-2" :style="{ backgroundColor: organicMatterData.level >= 2 ? levelValueMap['二级'].color : '#1f4886' }"></div>
              <div class="bar bar-3" :style="{ backgroundColor: organicMatterData.level >= 3 ? levelValueMap['三级'].color : '#1f4886' }"></div>
              <div class="bar bar-4" :style="{ backgroundColor: organicMatterData.level >= 4 ? levelValueMap['四级'].color : '#1f4886' }"></div>
              <div class="bar bar-5" :style="{ backgroundColor: organicMatterData.level >= 5 ? levelValueMap['五级'].color : '#1f4886' }"></div>
            </div>
          </div>
        </div>
        
        <!-- 区块2：中段图表 -->
        <div class="middle-chart-section">
          <div class="section-title">氮、磷、钾元素</div>
          
          <!-- 图例与单位共处同行并下移 20px -->
          <div class="chart-header-row">
            <span class="sub-unit">mg/kg</span>
            <div class="chart-legend">
              <span class="leg-item leg-cyan"><i class="leg-box"></i>水解氮</span>
              <span class="leg-item leg-teal"><i class="leg-box"></i>有效磷</span>
              <span class="leg-item leg-yellow"><i class="leg-box"></i>速效钾</span>
            </div>
          </div>
          
          <div class="echart-wrapper custom-height-chart" ref="chartNpkRef"></div>
        </div>
        
        <!-- 区块3：底部四列对比 -->
        <div class="bottom-elements-section">
           <div class="section-title">钙、镁、硅、硼元素</div>
           
           <!-- 列标题行 -->
           <div class="elements-header">
             <div class="h-left">改良前</div>
             <div class="h-right">改良后</div>
           </div>
           
           <div class="elements-list">
             <div class="element-row" v-for="(el, i) in bottomElements" :key="i">
               <div class="el-left">
                  <div class="el-val num-left">{{el.old}}</div>
                  <div class="el-bar-wrap left-wrap"><div class="el-bar inner-left" :style="{width: el.oldPct}"></div></div>
               </div>
               
               <div class="el-center">
                  <div class="el-diff">
                     <img v-if="el.diffStatus === 'up'" class="diff-icon-img" src="../assets/images/涨停.png" />
                     <img v-else-if="el.diffStatus === 'down'" class="diff-icon-img" src="../assets/images/下降.png" />
                     <span :class="['diff-text', el.diffStatus]">{{el.diff}}</span>
                  </div>
                  <div class="el-name">{{el.name}}</div>
               </div>
               
               <div class="el-right">
                  <div class="el-val num-right">{{el.new}}</div>
                  <div class="el-bar-wrap right-wrap"><div class="el-bar inner-right" :style="{width: el.newPct}"></div></div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'

const route = useRoute()

// AI Chat Logic
const isChatOpen = ref(false)
const chatInput = ref('')
const chatMessages = ref([
  { role: 'ai', content: '您好！我是您的智能农业助手，请问有什么可以帮您？' }
])
const isAiTyping = ref(false)
const chatBodyRef = ref(null)

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
  if (isChatOpen.value) {
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!chatInput.value.trim() || isAiTyping.value) return
  
  const userMsg = chatInput.value.trim()
  chatMessages.value.push({ role: 'user', content: userMsg })
  chatInput.value = ''
  scrollToBottom()
  
  isAiTyping.value = true
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMsg })
    })
    const json = await res.json()
    if (json.code === 200) {
      chatMessages.value.push({ role: 'ai', content: json.data })
    } else {
      chatMessages.value.push({ role: 'ai', content: '抱歉，服务出现异常：' + json.msg })
    }
  } catch (error) {
    chatMessages.value.push({ role: 'ai', content: '网络错误，无法连接到大模型服务。' })
  } finally {
    isAiTyping.value = false
    scrollToBottom()
  }
}

const isOpen = ref(false)

const farmList = ref([])
const selectedFarm = ref(null)

const isCropOpen = ref(false)
const selectedCrop = ref('')
const cropOptions = ref(['农作物A', '农作物B', '农作物C'])

const chartPhRef = ref(null)
const chartRiskRef = ref(null)
const chartNpkRef = ref(null)

const bottomElements = ref([
  { name: '钙元素', old: 20.8, new: 19.6, oldPct: '60%', newPct: '50%', diff: '+2.5%' },
  { name: '镁元素', old: 20.8, new: 19.6, oldPct: '60%', newPct: '50%', diff: '+2.5%' },
  { name: '有效硅', old: 21.2, new: 22.3, oldPct: '60%', newPct: '80%', diff: '+2.5%' },
  { name: '有效硼', old: 22.2, new: 23.6, oldPct: '70%', newPct: '90%', diff: '+2.5%' }
])

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectFarm = (item) => {
  selectedFarm.value = item
  // 联动更新关联的作物
  if (item.cropVariety) {
    selectedCrop.value = item.cropVariety
  }
  isOpen.value = false
  loadImprovementPlan(item)
}

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

const currentPlan = ref(null)

const loadImprovementPlan = async (farm) => {
  if (!farm) return
  try {
    const res = await fetch('/api/datasource/improvement-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmCode: farm.farmCode })
    })
    const json = await res.json()
    if (json.code === 200 && json.data && json.data.length > 0) {
      currentPlan.value = json.data[0]
    } else {
      currentPlan.value = {
        name: farm.farmName,
        date: '-',
        beforeUrl: '',
        afterUrl: '',
        planUrl: ''
      }
    }
  } catch (e) {
    console.error('获取改良方案数据失败:', e)
  }
}

const loadFarmList = async () => {
  try {
    const response = await fetch('/api/datasource/farm-info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
    const res = await response.json()
    if (res.code === 200 && res.data && res.data.length > 0) {
      farmList.value = res.data
      
      // 动态提取去重后的品种列表填充到下拉框
      const uniqueCrops = [...new Set(res.data.map(f => f.cropVariety).filter(Boolean))]
      if (uniqueCrops.length > 0) {
        cropOptions.value = uniqueCrops
      }
      
      const targetFarmName = route.query.farmName
      const targetFarm = targetFarmName ? res.data.find(f => f.farmName === targetFarmName) : null
      selectedFarm.value = targetFarm || res.data[0] // 如果有传参匹配上就选中，否则默认首个
      
      // 初始化默认的作物品种
      if (selectedFarm.value.cropVariety) {
        selectedCrop.value = selectedFarm.value.cropVariety
      }
    }
  } catch (error) {
    console.error('获取农场数据失败:', error)
  }
}

const toggleCropDropdown = () => {
  isCropOpen.value = !isCropOpen.value
}

const selectCrop = (item) => {
  selectedCrop.value = item
  isCropOpen.value = false
}

const organicMatterData = ref({ before: '0.0', after: '0.0', diff: 0, level: 4, status: '丰富', color: '#90ee90' })

const microbialData = ref({ beforeRatio: '0.00', afterRatio: '0.00' })

const biomassCarbonData = ref({
  beforeCarbon: '0.00',
  afterCarbon: '0.00',
  diff: '0.0',
  progressPct: '0%',
  statusLabel: '-'
})

const bioFlipperKey = ref(0)
let bioLoopTimer = null
const startBioLoop = () => {
  if (bioLoopTimer) clearInterval(bioLoopTimer)
  bioLoopTimer = setInterval(() => {
    // 通过递增 key 强制 Vue 销毁并重建整个翻牌器组件，从而重新触发 transition 动画
    bioFlipperKey.value++
  }, 5000)
}

const bioDisplayDigits = computed(() => {
  return biomassCarbonData.value.afterCarbon.toString().split('')
})

const levelValueMap = {
  '一级': { num: 1, status: '极缺乏', color: '#ffb347' }, // 橙色带黄
  '二级': { num: 2, status: '缺乏', color: '#ffd700' },   // 黄色
  '三级': { num: 3, status: '中等', color: '#9acd32' },   // 黄色带绿
  '四级': { num: 4, status: '较丰富', color: '#90ee90' }, // 浅绿
  '五级': { num: 5, status: '丰富', color: '#228b22' }    // 深绿
}

const loadOrganicMatter = async (farm) => {
  if (!farm) return
  try {
    const response = await fetch('/api/datasource/organic-matter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmCode: farm.farmCode, farmName: farm.farmName })
    })
    const res = await response.json()
    if (res.code === 200 && res.data) {
      let before = 0
      let after = 0
      res.data.forEach(item => {
        if (item.type && item.type.includes('前')) before = parseFloat(item.organic_matter) || 0
        if (item.type && item.type.includes('后')) after = parseFloat(item.organic_matter) || 0
      })
      organicMatterData.value.before = before.toFixed(1)
      organicMatterData.value.after = after.toFixed(1)
      let diff = 0
      if (before > 0) {
        diff = ((after - before) / before) * 100
      }
      organicMatterData.value.diff = diff.toFixed(1)
    }
  } catch (error) {
    console.error('获取有机质数据失败:', error)
  }
}

const loadMicrobialCnRatio = async (farm) => {
  if (!farm) return
  try {
    const response = await fetch('/api/datasource/microbial-cn-ratio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmCode: farm.farmCode, farmName: farm.farmName })
    })
    const res = await response.json()
    if (res.code === 200 && res.data) {
      let beforeC = 0, beforeN = 0
      let afterC = 0, afterN = 0
      res.data.forEach(item => {
        if (item.type && item.type.includes('前')) {
          beforeC = parseFloat(item.microbial_carbon) || 0
          beforeN = parseFloat(item.microbial_nitrogen) || 0
        }
        if (item.type && item.type.includes('后')) {
          afterC = parseFloat(item.microbial_carbon) || 0
          afterN = parseFloat(item.microbial_nitrogen) || 0
        }
      })
      const beforeRatio = beforeN > 0 ? beforeC / beforeN : 0
      const afterRatio = afterN > 0 ? afterC / afterN : 0
      microbialData.value.beforeRatio = beforeRatio > 0 ? beforeRatio.toFixed(2) : '0.00'
      microbialData.value.afterRatio = afterRatio > 0 ? afterRatio.toFixed(2) : '0.00'
    }
  } catch (error) {
    console.error('获取微生物碳氮比数据失败:', error)
  }
}

// 微生物量碳：调用新接口，前端计算增幅
const loadMicrobialBiomassCarbon = async (farm) => {
  if (!farm) return
  biomassCarbonData.value.progressPct = '0%' // 重置进度条，触发加载动画
  try {
    const response = await fetch('/api/datasource/microbial-biomass-carbon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmCode: farm.farmCode, farmName: farm.farmName })
    })
    const res = await response.json()
    if (res.code === 200 && res.data) {
      const beforeC = parseFloat(res.data.beforeCarbon) || 0
      const afterC = parseFloat(res.data.afterCarbon) || 0

      let diff = '0.0'
      if (beforeC > 0) {
        diff = (((afterC - beforeC) / beforeC) * 100).toFixed(1)
      } else if (afterC > 0) {
        diff = '100.0'
      }

      const localMax = Math.max(beforeC, afterC) * 1.3 || 100
      const progressPct = Math.min(100, Math.max(0, (afterC / localMax) * 100)).toFixed(0) + '%'

      let statusLabel = '-'
      if (afterC > 0) {
        if (afterC >= 500) statusLabel = '极丰富'
        else if (afterC >= 200) statusLabel = '丰富'
        else if (afterC >= 100) statusLabel = '中等'
        else statusLabel = '偏低'
      }

      biomassCarbonData.value.beforeCarbon = beforeC.toFixed(2)
      biomassCarbonData.value.afterCarbon = afterC.toFixed(2)
      biomassCarbonData.value.diff = diff
      biomassCarbonData.value.progressPct = progressPct
      biomassCarbonData.value.statusLabel = statusLabel
      
      // 数据加载后开启循环滚动效果
      startBioLoop()
    }
  } catch (error) {
    console.error('获取微生物量碳数据失败:', error)
  }
}

const loadSoilLevel = async (farm) => {
  if (!farm) return
  try {
    const response = await fetch('/api/datasource/soil-level', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmCode: farm.farmCode, farmName: farm.farmName })
    })
    const res = await response.json()
    if (res.code === 200 && res.data) {
      let levelText = '四级'
      const afterNode = res.data.find(item => item.type && item.type.includes('后'))
      const beforeNode = res.data.find(item => item.type && item.type.includes('前'))
      
      if (afterNode && afterNode.level) {
        levelText = afterNode.level
      } else if (beforeNode && beforeNode.level) {
        levelText = beforeNode.level
      }

      const mapObj = levelValueMap[levelText] || { num: 4, status: '较丰富', color: '#90ee90' }
      organicMatterData.value.level = mapObj.num
      organicMatterData.value.status = mapObj.status
      organicMatterData.value.color = mapObj.color
    }
  } catch (error) {
    console.error('获取土壤等级数据失败:', error)
  }
}

let chartNpkInstance = null;

const loadNpkElements = async (farm) => {
  if (!farm || !chartNpkInstance) return
  try {
    const response = await fetch('/api/datasource/npk-elements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmCode: farm.farmCode, farmName: farm.farmName })
    })
    const res = await response.json()
    if (res.code === 200 && res.data) {
      const bObj = res.data.find(v => v.type && v.type.includes('前')) || {}
      const aObj = res.data.find(v => v.type && v.type.includes('后')) || {}
      
      const parseVal = (v) => parseFloat(v) || 0
      
      const n = [parseVal(bObj.hydro_nitrogen), parseVal(aObj.hydro_nitrogen)]
      const p = [parseVal(bObj.avail_phosphorus), parseVal(aObj.avail_phosphorus)]
      const k = [parseVal(bObj.avail_potassium), parseVal(aObj.avail_potassium)]

      const pCap = [n[0] + p[0], n[1] + p[1]]
      const kCap = [pCap[0] + k[0], pCap[1] + k[1]]
      
      const maxVal = Math.ceil(Math.max(kCap[0], kCap[1]) * 1.2) || 500

      chartNpkInstance.setOption({
        yAxis: { max: maxVal },
        series: [
          { name: '水解氮', data: n },
          { name: '有效磷', data: p },
          { name: '速效钾', data: k },
          { name: '水解氮-cap', data: n },
          { name: '有效磷-cap', data: pCap },
          { name: '速效钾-cap', data: kCap },
          { name: '上升运动粒子', data: [
            { coords: [[-0.08, 0], [-0.08, kCap[0]]] },
            { coords: [[0.05, 50], [0.05, kCap[0]]], effect: { period: 4 } }, 
            { coords: [[0, 120], [0, kCap[0]]], effect: { period: 2.5 } },
            { coords: [[-0.03, 150], [-0.03, kCap[0]]], effect: { period: 3.5 } },
            { coords: [[0.08, 80], [0.08, kCap[0]]], effect: { period: 4.5 } },
            
            { coords: [[0.92, 0], [0.92, kCap[1]]] },
            { coords: [[1.05, 50], [1.05, kCap[1]]], effect: { period: 4 } },
            { coords: [[1, 100], [1, kCap[1]]], effect: { period: 2.5 } },
            { coords: [[0.96, 150], [0.96, kCap[1]]], effect: { period: 3.5 } },
            { coords: [[1.08, 20], [1.08, kCap[1]]], effect: { period: 4.5 } }
          ] }
        ]
      })
    }
  } catch (error) {
    console.error('获取NPK元素失败:', error)
  }
}

const loadTraceElements = async (farm) => {
  if (!farm) return
  try {
    const response = await fetch('/api/datasource/trace-elements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmCode: farm.farmCode, farmName: farm.farmName })
    })
    const res = await response.json()
    if (res.code === 200 && res.data) {
      const bObj = res.data.find(v => v.type && v.type.includes('前')) || {}
      const aObj = res.data.find(v => v.type && v.type.includes('后')) || {}
      
      const parseVal = (v) => parseFloat(v) || 0
      
      const elements = [
        { key: 'avail_calcium', name: '钙元素' },
        { key: 'avail_magnesium', name: '镁元素' },
        { key: 'avail_sulfur', name: '有效硅' },
        { key: 'avail_boron', name: '有效硼' }
      ]
      
      bottomElements.value = elements.map(el => {
        let oldV = parseVal(bObj[el.key])
        let newV = parseVal(aObj[el.key])
        
        // 四舍五入保留1位小数，然后再计算涨幅，防止出现 0.8 -> 0.8 但涨幅是 3.8% 的诡异视觉感
        oldV = Number(oldV.toFixed(1))
        newV = Number(newV.toFixed(1))
        
        let diffStr = '0.0%'
        let diffVal = 0
        let diffStatus = 'flat'
        if (oldV > 0) {
          diffVal = ((newV - oldV) / oldV) * 100
          if (diffVal > 0) {
            diffStr = '+' + diffVal.toFixed(1) + '%'
            diffStatus = 'up'
          } else if (diffVal < 0) {
            diffStr = diffVal.toFixed(1) + '%'
            diffStatus = 'down'
          } else {
            diffStr = '0.0%'
            diffStatus = 'flat'
          }
        } else if (newV > 0) {
          diffVal = 100
          diffStr = '+100.0%'
          diffStatus = 'up'
        } else {
          diffStr = '0.0%'
          diffStatus = 'flat'
        }
        
        const localMax = Math.max(oldV, newV) * 1.5 || 10
        
        return {
          name: el.name,
          old: oldV.toFixed(1),
          new: newV.toFixed(1),
          oldPct: Math.min(100, Math.max(0, (oldV / localMax) * 100)) + '%',
          newPct: Math.min(100, Math.max(0, (newV / localMax) * 100)) + '%',
          diff: diffStr,
          diffStatus: diffStatus
        }
      })
    }
  } catch (error) {
    console.error('获取微量元素失败:', error)
  }
}

const cadmiumData = ref({
  availBefore: '0.0',
  availAfter: '0.0',
  totalBefore: '0.0',
  totalAfter: '0.0'
})

const loadCadmiumContent = async (farm) => {
  if (!farm) return
  try {
    const response = await fetch('/api/datasource/cadmium-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmCode: farm.farmCode, farmName: farm.farmName })
    })
    const res = await response.json()
    if (res.code === 200 && res.data) {
      let bObj = res.data.find(v => v.type && v.type.includes('前')) || {}
      let aObj = res.data.find(v => v.type && v.type.includes('后')) || {}
      
      const parseVal = (v) => {
        const num = parseFloat(v) || 0;
        return num === 0 ? '0.0' : num < 0.1 ? num.toFixed(3).replace(/0+$/, '') : num.toFixed(1)
      }
      
      cadmiumData.value.availBefore = parseVal(bObj.avail_cadmium)
      cadmiumData.value.availAfter = parseVal(aObj.avail_cadmium)
      cadmiumData.value.totalBefore = parseVal(bObj.cadmium)
      cadmiumData.value.totalAfter = parseVal(aObj.cadmium)
    }
  } catch (error) {
    console.error('获取镉含量失败:', error)
  }
}

const cadmiumRiskData = ref({
  riskLevel: '低风险',
  ph: 0,
  cadmium: 0
})

const loadCadmiumRisk = async (farm) => {
  if (!farm) return
  try {
    const response = await fetch('/api/datasource/cadmium-risk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmCode: farm.farmCode })
    })
    const res = await response.json()
    if (res.code === 200 && res.data) {
      cadmiumRiskData.value.riskLevel = res.data.riskLevel || '低风险'
      cadmiumRiskData.value.ph = res.data.ph || 0
      cadmiumRiskData.value.cadmium = res.data.cadmium || 0
      
      if (chartRiskRef.value) {
        const instance = echarts.getInstanceByDom(chartRiskRef.value)
        if (instance) {
          // 将真实的 pH (0~14) 映射到 x轴 (-10~10)
          // pH=7 为中心 0，<7 偏左，>7 偏右
          const rawPh = res.data.ph || 7;
          let mappedX = ((rawPh - 7) / 7) * 10;
          
          // 将真实的 Cd (0~5左右) 映射到 y轴 (0~10)
          // 假设 4.0 满量程对应 y轴的 8.0 左右
          const rawCd = res.data.cadmium || 0;
          let mappedY = (rawCd / 4) * 8;
          if (mappedY > 9) mappedY = 9; // 防止超出外圈

          instance.setOption({
            series: [
              {}, {}, {}, {},
              {
                data: [ [mappedX, mappedY] ]
              }
            ]
          })
        }
      }
    }
  } catch (error) {
    console.error('获取镉污染风险失败:', error)
  }
}

let chartPhInstance = null;

const loadPhMatch = async (farm, cropName) => {
  if (!farm || !chartPhInstance) return
  try {
    // 如果接口没传 cropName 时，我们主动用 farm.cropVariety 填充兜底
    const cropQuery = cropName || farm.cropVariety || ''
    
    const response = await fetch('/api/datasource/ph-match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        farmCode: farm.farmCode, 
        farmName: farm.farmName,
        cropName: cropQuery
      })
    })
    const res = await response.json()
    if (res.code === 200 && res.data) {
      const { phMin, phMax, soilData } = res.data
      
      let bObj = (soilData || []).find(v => v.type && v.type.includes('前')) || {}
      let aObj = (soilData || []).find(v => v.type && v.type.includes('后')) || {}
      
      const beforePh = parseFloat(bObj.ph) || 0;
      const afterPh = parseFloat(aObj.ph) || 0;
      
      const cropLabel = cropQuery ? cropQuery : '默认作物';
      
      const dynamicMax = Math.min(14, Math.ceil(Math.max(phMin || 0, phMax || 0, beforePh, afterPh)) + 1);
      
      chartPhInstance.setOption({
        xAxis: {
          data: [cropLabel]
        },
        yAxis: {
          min: 0,
          max: Math.max(1, dynamicMax - 4),
          splitNumber: Math.max(1, dynamicMax - 4)
        },
        series: [
          {
            name: '改良前',
            data: [Math.max(0, beforePh - 4)]
          },
          {
            name: '改良后',
            data: [Math.max(0, afterPh - 4)],
            markLine: {
              data: [
                { yAxis: Math.max(0, (phMin || 0) - 4) },
                { yAxis: Math.max(0, (phMax || 0) - 4) }
              ]
            }
          }
        ]
      })
    }
  } catch (error) {
    console.error('获取PH匹配度失败:', error)
  }
}

watch([selectedFarm, selectedCrop], ([newFarm, newCrop]) => {
  if (newFarm) {
    loadOrganicMatter(newFarm)
    loadSoilLevel(newFarm)
    loadTraceElements(newFarm)
    loadNpkElements(newFarm)
    loadCadmiumContent(newFarm)
    loadPhMatch(newFarm, newCrop)
    loadMicrobialCnRatio(newFarm)
    loadMicrobialBiomassCarbon(newFarm)
    loadCadmiumRisk(newFarm)
    loadImprovementPlan(newFarm)
  }
})

// 监听全局点击事件以实现点击外部关闭下拉框
const closeDropdowns = (e) => {
  if (!e.target.closest('.farm-custom-select')) {
    isOpen.value = false
  }
  if (!e.target.closest('.crop-custom-select')) {
    isCropOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeDropdowns)
  loadFarmList()
  
  if (chartPhRef.value) {
    chartPhInstance = echarts.init(chartPhRef.value)
    
    // 只留下作物1的一组数据
    const xAxisData = ['农作物1']
    const dataBefore = [0] // Dummy, real data loaded later
    const dataAfter = [0]
    
    // 锥形曲线 SVG path (钟形分布形状)
    const conePath = 'path://M0,100 C20,100 40,0 50,0 C60,0 80,100 100,100 Z'

    chartPhInstance.setOption({
      title: [
        {
          text: '耕地土壤农作物种植酸碱匹配度',
          textStyle: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontStyle: 'italic', textShadowColor: '#00a2ff', textShadowBlur: 5 },
          left: '10',
          top: '10'
        },
        {
          text: 'PH',
          textStyle: { color: '#fff', fontSize: 12, fontWeight: 'normal' },
          left: '20',
          top: '40'
        }
      ],
      legend: {
        data: ['改良前', '改良后'],
        right: '20',
        top: '40',
        textStyle: { color: '#a0c4e0', fontSize: 12 },
        itemWidth: 12,
        itemHeight: 4,
        icon: 'rect'
      },
      grid: {
        left: '30',
        right: '30',
        bottom: '20',
        top: '80',
        containLabel: true
      },
      xAxis: {
        data: xAxisData,
        axisLine: { show: true, lineStyle: { color: '#1f4886' } },
        axisTick: { show: false },
        axisLabel: { color: '#cce8ff', fontSize: 13, margin: 12 }
      },
      yAxis: {
        min: 0,
        max: 4,
        splitNumber: 4,
        axisLine: { show: true, lineStyle: { color: '#1f4886' } },
        axisLabel: { 
          color: '#cce8ff', fontSize: 14, margin: 15,
          formatter: function(val) { return val + 4; }
        },
        splitLine: { show: true, lineStyle: { color: 'rgba(31, 72, 134, 0.6)', type: 'dashed' } }
      },
      series: [
        // --- 改良前 ---
        {
          name: '改良前',
          type: 'pictorialBar',
          symbol: conePath,
          barWidth: 55, // 设置合适的恒定宽度
          symbolOffset: ['-55%', 0], 
          z: 2,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 170, 0, 0.9)' },
              { offset: 1, color: 'rgba(255, 170, 0, 0.05)' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            distance: 0,
            offset: [-30, 0], 
            formatter: function(params) {
              return '{value|' + (Number(params.value) + 4).toFixed(2) + '}\n{dot|}';
            },
            rich: {
              value: {
                color: '#ffd700',
                fontWeight: 'bold',
                fontSize: 14,
                align: 'center',
                padding: [0, 0, 4, 0]
              },
              dot: {
                backgroundColor: '#ffd700',
                width: 6,
                height: 6,
                borderRadius: 3,
                shadowBlur: 5,
                shadowColor: '#ffd700',
                align: 'center'
              }
            }
          },
          data: dataBefore
        },

        // --- 改良后 ---
        {
          name: '改良后',
          type: 'pictorialBar',
          symbol: conePath,
          barWidth: 55,
          symbolOffset: ['55%', 0],
          z: 1,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(0, 162, 255, 0.9)' },
              { offset: 1, color: 'rgba(0, 162, 255, 0.05)' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            distance: 0,
            offset: [30, 0], 
            formatter: function(params) {
              return '{value|' + (Number(params.value) + 4).toFixed(2) + '}\n{dot|}';
            },
            rich: {
              value: {
                color: '#00ffff',
                fontWeight: 'bold',
                fontSize: 14,
                align: 'center',
                padding: [0, 0, 4, 0]
              },
              dot: {
                backgroundColor: '#ccffff',
                width: 6,
                height: 6,
                borderRadius: 3,
                shadowBlur: 5,
                shadowColor: '#00ffff',
                align: 'center'
              }
            }
          },
          markLine: {
            symbol: ['none', 'none'],
            label: { show: false },
            lineStyle: { color: 'red', type: 'solid', width: 2, opacity: 0.8 },
            data: [
              { yAxis: 3.5 },
              { yAxis: 4.4 }
            ]
          },
          data: dataAfter
        }
      ]
    })
  }

  if (chartRiskRef.value) {
    const chartRisk = echarts.init(chartRiskRef.value)
    
    chartRisk.setOption({
      grid: {
        left: 40,
        right: 40,
        top: 60,  
        bottom: 20
      },
      xAxis: {
        type: 'value',
        min: -10,
        max: 10,
        name: 'PH',
        nameLocation: 'end',
        nameTextStyle: { color: '#cce8ff', padding: [30, 0, 0, 15] }, // 增加 left padding(15) 避免和箭头重叠，增加 top padding(30) 使其位于箭头下方
        axisLine: {
          show: true,
          symbol: ['none', 'path://M0,0 L10,5 L0,10 Z'],
          symbolSize: [8, 10],
          symbolOffset: [0, 8],
          lineStyle: { color: '#1f4886', width: 2 },
          onZero: true
        },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false }
      },
      yAxis: {
        type: 'value',
        min: -10,
        max: 10,
        name: '总镉(mg/kg)',
        nameLocation: 'end',
        nameTextStyle: { color: '#cce8ff', padding: [110, 0, -10, 220] }, 
        axisLine: {
          show: true,
          symbol: ['none', 'path://M0,0 L10,5 L0,10 Z'],
          symbolSize: [8, 10],
          symbolOffset: [0, 8],
          lineStyle: { color: '#1f4886', width: 2 },
          onZero: true
        },
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false }
      },
      series: [
        // 外圈细线
        {
          type: 'pie',
          radius: ['68%', '69%'],
          center: ['50%', '58%'], 
          itemStyle: { color: 'rgba(0, 162, 255, 0.4)' },
          label: { show: false },
          emphasis: { scale: false },
          silent: true,
          data: [{ value: 1 }]
        },
        // 内圈细线
        {
          type: 'pie',
          radius: ['45%', '46%'],
          center: ['50%', '58%'], 
          itemStyle: { color: 'rgba(0, 162, 255, 0.2)' },
          label: { show: false },
          emphasis: { scale: false },
          silent: true,
          data: [{ value: 1 }]
        },
        {
          type: 'pie',
          radius: ['57%', '69%'],
          center: ['50%', '58%'],
          startAngle: 225,
          endAngle: -45,
          label: { show: false },
          silent: true,
          emphasis: { scale: false },
          data: [
            {
              value: 1,
              itemStyle: { 
                color: new echarts.graphic.LinearGradient(0, 1, 1, 0, [
                  { offset: 0, color: 'rgba(0, 200, 255, 0.15)' },
                  { offset: 0.5, color: 'rgba(0, 200, 255, 0.7)' },
                  { offset: 1, color: 'rgba(0, 230, 255, 1)' }
                ])
              } 
            }
          ]
        },
        {
          type: 'scatter',
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#00ffff', shadowBlur: 10, shadowColor: '#00ffff' },
          data: [ [-5.25, -6.5] ], 
          z: 10
        },
        // 红色风险点数据
        {
          type: 'effectScatter',
          symbol: 'circle',
          symbolSize: 10,
          itemStyle: { color: 'red', shadowBlur: 12, shadowColor: 'red' },
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'fill',
            scale: 3,
            period: 1.5
          },
          data: [ [3, 2.5] ], 
          z: 10
        }
      ]
    })
  }

  if (chartNpkRef.value) {
    chartNpkInstance = echarts.init(chartNpkRef.value)
    chartNpkInstance.setOption({
      grid: { left: '15%', right: '15%', bottom: '15%', top: '15%' },
      xAxis: {
        type: 'category',
        data: ['改良前', '改良后'],
        axisLine: { lineStyle: { color: '#1f4886' } },
        axisLabel: { color: '#cce8ff', fontSize: 13, margin: 15 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        max: 500,
        splitLine: { lineStyle: { color: 'rgba(31, 72, 134, 0.4)', type: 'dashed' } },
        axisLabel: { color: '#cce8ff', fontSize: 12 }
      },
      series: [
        {
          name: '水解氮',
          type: 'bar',
          stack: 'total',
          barWidth: 26,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: 'rgba(10, 60, 180, 0.5)' },
              { offset: 0.49, color: 'rgba(10, 60, 180, 0.9)' }, // 右侧深蓝暗角
              { offset: 0.5, color: 'rgba(30, 120, 255, 1)' },   // 深蓝折角高点
              { offset: 1, color: 'rgba(30, 120, 255, 0.6)' }    // 左侧受光面
            ])
          },
          label: {
            show: true, position: 'right', formatter: ' ◀ {c}', color: '#1e78ff', fontSize: 11
          },
          data: [100, 62]
        },
        {
          name: '有效磷',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: 'rgba(0, 140, 180, 0.4)' },
              { offset: 0.49, color: 'rgba(0, 140, 180, 0.8)' },
              { offset: 0.5, color: 'rgba(0, 220, 220, 0.9)' },
              { offset: 1, color: 'rgba(0, 220, 220, 0.4)' }
            ])
          },
          label: {
            show: true, position: 'right', formatter: ' ◀ {c}', color: '#00c8c8', fontSize: 11
          },
          data: [163, 148]
        },
        {
          name: '速效钾',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
              { offset: 0, color: 'rgba(200, 150, 0, 0.4)' },
              { offset: 0.49, color: 'rgba(200, 150, 0, 0.8)' },
              { offset: 0.5, color: 'rgba(255, 220, 0, 0.9)' },
              { offset: 1, color: 'rgba(255, 220, 0, 0.4)' }
            ])
          },
          label: {
            show: true, position: 'right', formatter: ' ◀ {c}', color: '#ffcc00', fontSize: 11
          },
          data: [123, 134]
        },
        // ----------------- 正方体菱形顶盖 (Cube Top Diamond Caps) -----------------
        {
          name: '水解氮-cap',
          type: 'pictorialBar',
          symbol: 'diamond',  
          symbolSize: [26, 10], 
          symbolPosition: 'end',
          symbolOffset: [0, -5],
          itemStyle: { color: 'rgba(40, 140, 255, 1)' }, // 深蓝色调顶盖
          data: [100, 62],
          z: 10
        },
        {
          name: '有效磷-cap',
          type: 'pictorialBar',
          symbol: 'diamond',
          symbolSize: [26, 10],
          symbolPosition: 'end',
          symbolOffset: [0, -5],
          itemStyle: { color: 'rgba(50, 220, 220, 0.9)' },
          data: [263, 210],
          z: 10
        },
        {
          name: '速效钾-cap',
          type: 'pictorialBar',
          symbol: 'diamond',
          symbolSize: [26, 10],
          symbolPosition: 'end',
          symbolOffset: [0, -5],
          itemStyle: { color: 'rgba(255, 240, 100, 0.9)' },
          data: [386, 344],
          z: 10
        },
        // ----------------- 动态运动粒子系统 (Moving Flow Particles) -----------------
        {
          name: '上升运动粒子',
          type: 'lines',
          coordinateSystem: 'cartesian2d',
          zlevel: 15,
          effect: {
            show: true,
            period: 3, 
            trailLength: 0.15, 
            color: '#ffffff',
            symbolSize: 2.5,
            symbol: 'circle'
          },
          lineStyle: { width: 0, opacity: 0 }, 
          data: [
            { coords: [[-0.08, 0], [-0.08, 386]] },
            { coords: [[0.05, 50], [0.05, 386]], effect: { period: 4 } }, 
            { coords: [[0, 120], [0, 386]], effect: { period: 2.5 } },
            { coords: [[-0.03, 150], [-0.03, 386]], effect: { period: 3.5 } },
            { coords: [[0.08, 80], [0.08, 386]], effect: { period: 4.5 } },
            
            { coords: [[0.92, 0], [0.92, 344]] },
            { coords: [[1.05, 50], [1.05, 344]], effect: { period: 4 } },
            { coords: [[1, 100], [1, 344]], effect: { period: 2.5 } },
            { coords: [[0.96, 150], [0.96, 344]], effect: { period: 3.5 } },
            { coords: [[1.08, 20], [1.08, 344]], effect: { period: 4.5 } }
          ]
        }
      ]
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdowns)
  if (bioLoopTimer) clearInterval(bioLoopTimer)
})
</script>

<style scoped>
.dashboard-body {
  flex: 1;
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  gap: 20px;
  min-width: 0;
  min-height: 0;
}

.side-panel {
  width: 440px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

/* ================== 左侧看板样式 ================== */
.left-panel-wrapper {
  background: transparent;
  border: none;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  padding-top: 25px;
}

.global-time-header {
  width: 413px;
  display: flex;
  align-items: center;
  padding-left: 20px;
  color: #cce8ff;
  font-family: Arial, sans-serif;
  font-size: 15px;
  gap: 15px;
  margin-bottom: 20px;
}
.icon-clock { font-size: 20px; color: #a0c4e0; }
.time-clock { font-size: 22px; font-weight: bold; color: #fff; letter-spacing: 1px; }

.left-board {
  width: 413px;
  height: 922px;
  background: url('../assets/images/左看板.png') no-repeat center;
  background-size: 100% 100%;
  position: relative;
  overflow: hidden; /* 确保扫光不溢出 */
}

/* 看板边缘扫光效果 */
.left-board::after, .right-board::after {
  content: "";
  position: absolute;
  top: -100%;
  left: -100%;
  width: 300%;
  height: 300%;
  background: linear-gradient(
    45deg,
    transparent 45%,
    rgba(0, 255, 255, 0.1) 50%,
    transparent 55%
  );
  animation: board-scan 6s linear infinite;
  pointer-events: none;
}

@keyframes board-scan {
  0% { transform: translate(-30%, -30%); }
  100% { transform: translate(30%, 30%); }
}

.left-section {
  position: absolute;
  width: 100%;
  left: 0;
}

.left-title {
  position: absolute;
  top: 5px; 
  left: 35px;
  font-size: 18px;
  font-weight: bold;
  font-style: italic;
  color: #fff;
  text-shadow: 0 0 8px rgba(0, 162, 255, 0.8);
}

.flex-row { display: flex; align-items: center; }

/* Phase 1 Layout */
.s1-farm-info {
  top: 0px;
  height: 220px;
}

.s1-farm-info .s1-content {
  margin-top: 60px; /* 下推离开标题区 */
  padding: 0 25px;
  gap: 20px;
}

.farm-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-left: 160px; 
}
.detail-row {
  display: flex;
  justify-content: space-between;
}
.detail-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 48%;
}
.full-row .detail-col { width: 100%; }
.d-label {
  font-size: 12px;
  color: #a0c4e0;
}
.d-label::before { 
  content: ''; display: block;
  width: 30px; height: 2px;
  background: linear-gradient(to right, #00ffff, transparent);
  margin-bottom: 2px;
}
.d-val {
  font-size: 14px;
  color: #00ffff;
  font-weight: bold;
}
.d-val.address { font-size: 12px; font-weight: normal; line-height: 1.4; color: #cce8ff; }

/* Phase 2 Layout */
.s2-plan {
  top: 275px; 
  height: 200px;
}

.s2-plan-details {
  margin-top: 42px;
}

.plan-status-card {
  width: 100%;
  height: 160px;
  padding: 14px 20px 10px;
  box-sizing: border-box;
  background:
    linear-gradient(135deg, rgba(0, 215, 255, 0.16), transparent 22%),
    linear-gradient(180deg, rgba(5, 30, 70, 0.78), rgba(2, 15, 36, 0.62));
  border: 1px solid rgba(0, 192, 255, 0.58);
  box-shadow:
    0 0 18px rgba(0, 170, 255, 0.34),
    inset 0 0 22px rgba(0, 120, 255, 0.16);
  position: relative;
  overflow: hidden;
}

.plan-status-card::before,
.plan-status-card::after {
  content: '';
  position: absolute;
  top: -1px;
  width: 72px;
  height: 2px;
  background: #5ef8ff;
  box-shadow: 0 0 10px #00eaff;
}

.plan-status-card::before { left: 0; }
.plan-status-card::after { right: 0; }

.plan-status-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.plan-status-item {
  width: 62px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: default;
}

.plan-status-label {
  height: 18px;
  font-size: 12px;
  color: #fff;
  font-weight: bold;
  white-space: nowrap;
  text-shadow: 0 0 6px rgba(0, 220, 255, 0.65);
}

.plan-status-icon {
  width: 42px;
  height: 42px;
  margin-top: 5px;
  position: relative;
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(0, 244, 255, 0.34) 0 24%, rgba(0, 105, 210, 0.28) 25% 48%, transparent 50%),
    conic-gradient(from 180deg, transparent, rgba(0, 250, 255, 0.9), transparent 42%, rgba(0, 132, 255, 0.55), transparent 75%);
  box-shadow: 0 0 18px rgba(0, 220, 255, 0.45);
}

.plan-status-icon::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -7px;
  width: 1px;
  height: 56px;
  background: linear-gradient(180deg, transparent, rgba(0, 220, 255, 0.8), transparent);
  transform: translateX(-50%);
}

.plan-status-icon::after {
  content: '';
  position: absolute;
  inset: 9px;
  border-radius: 50%;
  border: 1px solid rgba(110, 255, 255, 0.6);
}

.icon-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16px;
  height: 16px;
  transform: translate(-50%, -50%);
}

.detect .icon-core {
  border-radius: 50%;
  background: #ffd84c;
  box-shadow: 0 0 12px rgba(255, 216, 76, 0.8);
}

.analyze .icon-core::before,
.analyze .icon-core::after {
  content: '';
  position: absolute;
  background: #ffd84c;
  box-shadow: 0 0 8px rgba(255, 216, 76, 0.8);
}

.analyze .icon-core::before {
  width: 18px;
  height: 2px;
  top: 8px;
  left: -1px;
  transform: rotate(-28deg);
}

.analyze .icon-core::after {
  width: 2px;
  height: 20px;
  left: 8px;
  top: -2px;
  transform: rotate(28deg);
}

.formulate .icon-core {
  width: 18px;
  height: 18px;
  border: 2px solid #ffd84c;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(255, 216, 76, 0.7);
}

.running .icon-core {
  border-left: 14px solid #ffd84c;
  border-top: 9px solid transparent;
  border-bottom: 9px solid transparent;
  filter: drop-shadow(0 0 8px rgba(255, 216, 76, 0.8));
}

.done .icon-core {
  width: 18px;
  height: 10px;
  border-left: 3px solid #ffd84c;
  border-bottom: 3px solid #ffd84c;
  transform: translate(-50%, -58%) rotate(-45deg);
  filter: drop-shadow(0 0 8px rgba(255, 216, 76, 0.8));
}

.plan-status-value {
  margin-top: 5px;
  font-size: 19px;
  color: #f4fbff;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.45);
}

.plan-total-row {
  margin-top: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.plan-total-label {
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}

.plan-total-digits {
  display: flex;
  gap: 4px;
}

.plan-total-digit {
  width: 18px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  color: #ffe85c;
  font-size: 17px;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-weight: bold;
  background: linear-gradient(180deg, rgba(0, 160, 255, 0.35), rgba(0, 60, 130, 0.55));
  border: 1px solid rgba(0, 220, 255, 0.55);
  box-shadow: inset 0 0 8px rgba(0, 220, 255, 0.25), 0 0 6px rgba(0, 170, 255, 0.25);
}

.plan-download-row {
  margin-top: 7px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.plan-download-btn {
  height: 24px;
  min-width: 66px;
  padding: 0 10px;
  border: 1px solid rgba(0, 210, 255, 0.55);
  background: linear-gradient(180deg, rgba(0, 145, 255, 0.28), rgba(0, 48, 110, 0.42));
  color: #dffcff;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: inset 0 0 8px rgba(0, 210, 255, 0.18), 0 0 6px rgba(0, 170, 255, 0.22);
}

.plan-download-btn.primary {
  color: #ffe85c;
  border-color: rgba(255, 220, 80, 0.65);
}

.plan-download-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, rgba(0, 220, 255, 0.4), rgba(0, 85, 160, 0.58));
}

.plan-download-btn:disabled {
  color: rgba(190, 220, 235, 0.45);
  border-color: rgba(80, 140, 170, 0.28);
  background: rgba(8, 30, 58, 0.35);
  cursor: not-allowed;
  box-shadow: none;
}

/* 从左看板引入的卡片样式，单体无滚动版 */
.static-card-new {
  width: 100%;
  height: 160px;
  background: url('../assets/images/car_bg_new_3.png') no-repeat center;
  background-size: 100% 100%;
  position: relative;
  display: flex;
  align-items: center;
}

.static-card-new .q-avatar-box {
  position: absolute;
  left: 18px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.static-card-new .q-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.static-card-new .q-inner {
  margin-left: 140px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 20px;
}

.static-card-new .q-header {
  margin-bottom: 5px;
  margin-top: -10px;
  text-align: center;
}

.static-card-new .q-title {
  font-size: 16px;
  color: #fff;
  font-weight: bold;
  letter-spacing: 2px;
}

.static-card-new .q-date {
  font-size: 12px;
  color: #cce8ff;
  text-align: center;
  margin-bottom: 15px;
}

.static-card-new .q-body {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
}

.static-card-new .q-dl-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.static-card-new .q-dl-label {
  font-size: 13px;
  color: #cce8ff;
}

.static-card-new .q-icon-btn {
  width: 24px;
  height: 24px;
  cursor: pointer;
  transition: transform 0.2s;
}

.static-card-new .q-icon-btn:hover {
  transform: scale(1.1);
}

.static-card {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px; 
}

.static-card .q-inner {
  width: 281px;
  height: 75px;
  background: url('../assets/images/leftcard2.png') no-repeat center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  padding-left: 20px; 
  padding-right: 15px;
  justify-content: center;
  box-sizing: border-box;
}

.static-card .q-avatar-box {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 2px solid rgba(0, 255, 255, 0.2);
  border-left-color: #00ffff; 
  padding: 3px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 0 15px rgba(0, 255, 255, 0.4);
}

.static-card .q-avatar-box::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: #00ffff;
  border-radius: 50%;
  box-shadow: 0 0 6px #00ffff;
}

.static-card .q-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.static-card .q-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0; 
}

.static-card .q-title {
  font-size: 14px;
  color: #cce8ff;
  font-weight: bold;
  font-style: italic; 
  letter-spacing: 1px;
  margin-left: 10px; 
  position: relative;
  top: -3px; 
}

.static-card .q-date {
  font-size: 12px;
  color: #a0c4e0;
  font-family: 'Arial Narrow', Arial, sans-serif;
}

.static-card .q-body {
  display: flex;
  align-items: center;
  margin-top: 8px; 
}

.static-card .q-status-label {
  font-size: 12px;
  color: #cce8ff;
  margin-right: 6px;
}

.static-card .q-icon-btn {
  width: 18px;
  height: 18px;
  cursor: pointer;
  transition: transform 0.2s;
}

.static-card .q-icon-btn:hover {
  transform: scale(1.1);
}

.static-card .q-spacer {
  width: 20px;
}

/* Phase 3 Layout */
.q-no-file {
  font-size: 12px;
  color: #555;
  font-style: italic;
}

.s3-bio {
  top: 500px; /* 往下移动 10px */
  height: 180px;
}

.s3-bio .s3-content {
  margin-top: 55px; /* 推离标题 */
  padding: 0 45px 0 35px; /* 控制两侧缩进容留雷达发光环 */
  justify-content: space-between;
  align-items: flex-start; /* 允许左右列按自定义坐标独立设定 */
}

.bio-left-hologram {
  width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  top: -15px; /* 上抬数值使其贴合底图发光环面上浮 */
}

.bio-huge-val {
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-weight: bold;
  color: #ffffff;
  letter-spacing: 2px;
}

.bio-flipper-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 45px;
  padding: 0 5px;
}

.bio-flip-digit {
  width: 22px;
  height: 34px;
  background: rgba(0, 162, 255, 0.15);
  border: 1px solid rgba(0, 162, 255, 0.4);
  border-radius: 4px;
  margin: 0 1px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 8px rgba(0, 162, 255, 0.3);
}

.bio-digit-roller {
  display: flex;
  flex-direction: column;
  animation: roll-up 1.5s cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
}

@keyframes roll-up {
  0% { transform: translateY(0); }
  100% { transform: translateY(var(--target-y)); }
}

.bio-roller-num {
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.4);
}

.bio-digit-dot {
  font-size: 24px;
  color: #00ffff;
  margin: 0 1px;
  padding-top: 8px;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);
}

.bio-sub-label {
  font-size: 13px;
  color: #a0c4e0;
  margin-top: 50px; 
  margin-left: -5px; 
}

.bio-right-stats {
  flex: 1;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: -10px; 
}

.bio-stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.bio-label {
  font-size: 14px;
  color: #cce8ff;
  letter-spacing: 1px;
}

.bio-score {
  font-size: 16px;
  color: #cce8ff;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-weight: bold;
  /* 将具体数值固定在轨道的1/2略偏左处 */
  position: absolute;
  left: 60%;
  transform: translateX(-50%);
}

.bio-status {
  font-size: 14px;
  color: #00ffff;
  font-weight: bold;
}

.bio-progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(31, 72, 134, 0.6);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.bio-inner-bar {
  height: 100%;
  background: linear-gradient(to right, rgba(0,102,255,0.7), rgba(0,255,255,1));
  box-shadow: 0 0 8px #00ffff;
  transition: width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1); /* 匀速生长并带有轻微弹性 */
  position: relative;
  overflow: hidden;
}

.bio-inner-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: bar-shine 2.5s infinite;
}

@keyframes bar-shine {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: 100%; }
}

.margin-top-row {
  margin-top: 30px;
}

.bio-diff {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bio-diff .diff-val {
  font-size: 16px;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-weight: bold;
}
.bio-diff .diff-val.up { color: #ff3333; }

/* Phase 4 Layout: 微生物碳氮比 - 双指标左右对比 (新版背景图 5.png) */
.s4-cn-ratio {
  top: 680px; /* 往下移动 10px */
  height: 250px;
}

.cn-compare-row.new-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 50px auto 0; /* 图片整体下移 30px (原为 20px) */
  width: 354px;
  height: 184px;
  background: url('../assets/images/5.png') no-repeat center;
  background-size: 100% 100%;
  position: relative;
}

.cn-compare-row.new-layout .cn-compare-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  position: relative;
  top: 3px; 
}

.cn-compare-row.new-layout .cn-compare-item.before {
  margin-left: 0;
}

.cn-compare-row.new-layout .cn-compare-item.after {
  margin-right: 0;
}

.cn-compare-row.new-layout .cn-center-orb {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.orb-img {
  position: absolute;
  width: 191px;
  height: 185px;
  object-fit: contain;
  margin-top: -30px; /* 微调以漂浮在底座上方 */
  animation: orb-float-flash 2.5s ease-in-out infinite alternate;
}

@keyframes orb-float-flash {
  0% {
    transform: translateY(5px);
    opacity: 0.8;
    filter: brightness(0.9) drop-shadow(0 0 5px rgba(0, 200, 255, 0.4));
  }
  100% {
    transform: translateY(-8px);
    opacity: 1;
    filter: brightness(1.2) drop-shadow(0 0 20px rgba(0, 255, 255, 0.9));
  }
}

.cn-compare-row.new-layout .cn-compare-tag {
  font-size: 15px;
  letter-spacing: 2px;
  color: #fff;
  margin-bottom: 35px; /* 将数值推到色块下方 */
}

.cn-compare-row.new-layout .cn-compare-value {
  font-size: 32px;
  font-family: 'Arial Narrow', 'DIN Alternate', Arial, sans-serif;
  font-weight: bold;
  line-height: 1;
}

.cn-ratio-unit {
  font-size: 24px;
  font-family: 'Arial Narrow', 'DIN Alternate', Arial, sans-serif;
  font-weight: bold;
  color: inherit;
  margin-left: 2px;
}

/* Common text colors */
.num-gold { color: #ffcc00; text-shadow: 0 0 12px rgba(255, 204, 0, 0.8); }
.num-cyan { color: #00ffff; text-shadow: 0 0 12px rgba(0, 255, 255, 0.8); }

.center-panel {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
  min-height: 0;
}

.farm-select-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 0px; 
  position: relative;
  z-index: 50;
}

.farm-custom-select {
  width: 328px; 
  height: 52px;
  background: url('../assets/images/农场名称.png') no-repeat center;
  background-size: 100% 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  cursor: pointer;
  position: relative;
}

.select-text {
  font-size: 16px;
  color: #fff;
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: 0 0 5px rgba(0, 162, 255, 0.8);
}

/* 右侧面板及选择器重写 */
.right-panel-wrapper {
  background: transparent;
  border: none;
  justify-content: flex-start;
  flex-direction: column;
  padding-top: 25px; 
}

.crop-select-container {
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 50;
  margin-top: -50px; 
  margin-left: 50px; 
}

/* 依据 选择框.png (403x33) */
.crop-custom-select {
  width: 403px; 
  height: 33px;
  background: url('../assets/images/选择框.png') no-repeat center;
  background-size: 100% 100%;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.crop-select-text {
  font-size: 14px;
  color: #cce8ff;
  font-weight: bold;
  letter-spacing: 1px;
  padding-left: 20px; 
}

/* 下拉菜单样式复用基类 */
.dropdown-menu {
  position: absolute;
  top: 55px; 
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  background: rgba(3, 20, 50, 0.95);
  border: 1px solid rgba(0, 162, 255, 0.5);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  box-sizing: border-box; 
}

/* ================== 右侧看板样式 ================== */
.right-board {
  width: 413px;
  height: 922px;
  background: url('../assets/images/右看板.png') no-repeat center;
  background-size: 100% 100%;
  position: relative;
  overflow: hidden;
  margin-top: 15px;
  margin-left: 45px;
}

.board-title {
  position: absolute;
  top: 5px; /* 向上移动10px */
  left: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  font-style: italic;
  text-shadow: 0 0 5px rgba(0, 162, 255, 0.8);
  letter-spacing: 2px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  letter-spacing: 1px;
  padding-left: 25px;
  margin-top: 10px;
}

/* 区块1: 有机质 */
.organic-section {
  position: absolute;
  top: 35px;
  left: 0;
  width: 100%;
  height: 250px;
}

.organic-disc-container {
  position: absolute;
  top: 45px;
  left: 0;
  width: 100%;
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.yp-bg-rotating {
  position: absolute;
  width: 287px;
  height: 84px;
  animation: rotate-disc 4s ease-in-out infinite;
  opacity: 0.8;
  z-index: 1;
}

@keyframes rotate-disc {
  0% { transform: scale(0.9); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.5; }
}

.disc-data {
  position: relative;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -15px; /* 微调文字在圆盘上的位置 */
}

.disc-headers {
  display: flex;
  gap: 50px;
  color: #a0c4e0;
  font-size: 12px;
}

.disc-values {
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.disc-values .divider {
  color: #a0c4e0;
  font-size: 20px;
  font-weight: 300;
}

.disc-values .old-val {
  color: #a0c4e0;
  font-size: 22px;
  font-weight: bold;
}

.disc-values .new-val {
  color: #00ffff;
  font-size: 26px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.5);
}

.diff-tag {
  position: absolute;
  top: 155px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
.diff-tag .diff-label { color: #a0c4e0; }
.diff-tag .diff-icon-img { width: 14px; height: 14px; object-fit: contain; } 
.diff-tag .diff-val { color: #ff3333; font-weight: bold; }

/* 等级进度槽 */
.level-indicator {
  position: absolute;
  top: 185px;
  width: 100%;
  padding: 0 30px;
  box-sizing: border-box;
}

.level-text-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.lvl-label { color: #a0c4e0; font-size: 12px; }
.lvl-num { 
  background: rgba(0, 162, 255, 0.2); 
  border: 1px solid rgba(0, 162, 255, 0.5);
  padding: 2px 25px;
  color: #00ffff;
  border-radius: 12px;
  font-weight: bold;
  font-size: 14px;
}
.lvl-status { color: #00ff00; font-size: 14px; font-weight: bold; }

.level-bars {
  display: flex;
  gap: 5px;
  width: 100%;
}

.level-bars .bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
}
.bar-1 { background: #ffaa00; }
.bar-2 { background: #ffcc00; }
.bar-3 { background: #aaff00; }
.bar-4 { background: #00ff00; box-shadow: 0 0 8px #00ff00; } /* 激活状态高亮 */
.bar-5 { background: rgba(160, 196, 224, 0.3); } /* 灰阶未到达 */

/* 区块2: Echarts 图表段 */
.middle-chart-section {
  position: absolute;
  top: 290px; /* 向下偏移 50px */
  left: 0;
  width: 100%;
  height: 280px;
}

/* 图例与单位的横行对齐容器 */
.chart-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px 0 25px; /* 保证单位左对齐标题，图例右靠边 */
  margin-top: 5px;
}

.sub-unit {
  font-size: 13px;
  color: #cce8ff;
  font-weight: normal;
}

.chart-legend {
  display: flex;
  gap: 15px;
}

.leg-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #cce8ff;
}

.leg-box {
  width: 10px;
  height: 10px;
  display: inline-block;
  margin-right: 5px;
  border-radius: 2px;
}

.leg-cyan .leg-box { background: #1e78ff; }
.leg-teal .leg-box { background: #00c8c8; }
.leg-yellow .leg-box { background: #ffcc00; }

.custom-height-chart {
  width: 100%;
  height: 240px; 
  margin-top: 25px; 
}

/* 区块3: 底部微量元素矩阵 */
.bottom-elements-section {
  position: absolute;
  top: 570px;
  left: 0;
  width: 100%;
  height: 330px;
}

.elements-header {
  display: flex;
  justify-content: space-between;
  padding: 15px 50px 0 50px; 
  color: #a0c4e0;
  font-size: 13px;
}

.elements-list {
  display: flex;
  flex-direction: column;
  gap: 15px; 
  margin-top: 15px;
  padding: 0 25px; 
}

.element-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
}

.el-left, .el-right {
  width: 130px; 
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.el-left { align-items: flex-end; }  
.el-right { align-items: flex-start; } 

.el-center {
  width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.el-val {
  font-size: 14px;
  margin-bottom: 6px;
  width: 100%; /* 强迫满宽 */
}
.el-left .el-val { 
  color: #cce8ff; 
  text-align: left;
} 
.el-right .el-val { 
  color: #00ffff; 
  font-weight: bold; 
  text-shadow: 0 0 5px rgba(0,255,255,0.5); 
  text-align: right; 
} 

.el-bar-wrap {
  width: 100%;
  height: 18px; /* 柱体加厚（更宽点） */
  background: transparent; /* 去除原本的灰暗槽背景色 */
  overflow: hidden;
  position: relative;
}

.el-bar {
  height: 100%;
  position: absolute;
  top: 0;
}

.left-wrap .inner-left {
  right: 0; /* 向左端生长，右侧实心，左侧半透明黑 */
  background: linear-gradient(to left, rgba(160, 196, 224, 0.9) 0%, rgba(160, 196, 224, 0.1) 100%);
}

.right-wrap {
  transform: translateX(9px); /* 单独将右侧的进度柱往右横移 5px */
}

.right-wrap .inner-right {
  left: 0; /* 向右端生长，左侧实心，右侧半透明黑 */
  background: linear-gradient(to right, rgba(0, 255, 255, 0.9) 0%, rgba(0, 255, 255, 0.1) 100%);
}

.el-diff {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.diff-icon-img { 
  width: 14px;
  height: 14px;
  object-fit: contain;
}
.diff-text.up { color: #ff3333; font-weight: bold; }
.diff-text.down { color: #00ff66; font-weight: bold; } /* 备用下降颜色 */

.el-name {
  color: #cce8ff;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
}

/* 用更高的优先级覆盖基类样式，确保它和选择器完全等宽对其 */
.crop-custom-select .crop-dropdown {
  top: 36px;
  width: 100%; /* 和选择器保持绝对一样的大小 */
  left: 0;
  transform: none; /* 移除居中偏移，直接从最左边对齐 */
}

.dropdown-item {
  padding: 10px 15px;
  font-size: 14px;
  color: #cce8ff;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: rgba(0, 162, 255, 0.3);
  color: #ffffff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -5px);
}

.main-center-image-container {
  width: 1013px;
  height: 611px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  flex: none; /* 防止伸缩挤压变形 */
}

.img-bg {
  position: absolute;
  width: 1013px; 
  height: 611px;
  top: 0;
  left: 0;
}

.img-fg {
  position: absolute;
  width: 984px;
  height: 585px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 10px rgba(0, 162, 255, 0.4));
}

.bottom-modules-container {
  width: 100%;
  margin-top: 15px;
  margin-left: -75px;
  display: flex;
  justify-content: flex-start;
  gap: 15px;
  align-items: stretch;
}

.bm-box {
  position: relative;
  border-radius: 8px;
  background: rgba(8, 20, 43, 0.4); 
}

.left-bm {
  width: 413px;
  height: 252px;
  flex: none; 
  background: url('../assets/images/2_center_left1.png') no-repeat center;
  background-size: 100% 100%;
  border-radius: 0;
}

.center-bm {
  width: 293px;
  height: 252px;
  flex: none;
  background: url('../assets/images/2_center_left2.png') no-repeat center;
  background-size: 100% 100%;
  border-radius: 0;
}

.risk-title {
  position: absolute;
  top: 10px; 
  left: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  font-style: italic;
  text-shadow: 0 0 5px rgba(0, 162, 255, 0.8);
  z-index: 10;
  letter-spacing: 1px;
}

.risk-level {
  font-size: 16px;
  color: #cce8ff;
  text-shadow: 0 0 8px #cce8ff;
}

.right-bm {
  width: 293px;
  height: 252px;
  flex: none;
  background: url('../assets/images/2_center_left3.png') no-repeat center;
  background-size: 100% 100%;
  border-radius: 0;
  position: relative;
}

.cd-stats-container {
  position: absolute;
  top: 62px;
  left: 0;
  width: 100%;
  height: 155px; /* 利用弹性竖直对齐撑开各个文本 */
}

.cd-col {
  position: absolute;
  top: 0;
  width: 90px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.col-left {
  left: 17px;
}

.col-right {
  right: 17px;
}

.cd-label.sm {
  font-size: 13px;
  color: #a0c4e0;
}

.cd-label.md {
  font-size: 15px;
  color: #fff;
  font-weight: bold;
  letter-spacing: 2px;
}

.cd-val {
  font-size: 22px;
  font-weight: bold;
  font-family: Arial, sans-serif;
  margin: 2px 0; /* 控制数字边缘距离 */
}

.num-orange {
  color: #ffaa00;
  text-shadow: 0 0 5px rgba(255, 170, 0, 0.6);
}

.num-cyan {
  color: #00ffff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.6);
}

.echart-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>

<style scoped>
/* Supplemental logic for zero diff status */
.diff-text.flat {
  color: #ffffff !important;
}

/* AI 机器人样式 */
.ai-robot-box {
  position: absolute;
  right: 850px;
  bottom: 0px;
  display: flex;
  align-items: center;
  z-index: 20;
  cursor: pointer;
}

.ai-avatar {
  width: 120px; 
  height: auto;
  animation: float 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 10px rgba(0, 255, 255, 0.3));
}

.ai-bubble {
  position: absolute;
  left: 110px; /* position it to the right of the avatar */
  background: url('../assets/images/ai_bg.png') no-repeat left center;
  background-size: 100% 100%;
  padding: 18px 30px 18px 45px;
  margin-left: -5px;
  max-width: 300px;
  min-width: 250px;
  min-height: 60px;
  display: flex;
  align-items: center;
  opacity: 0;
  animation: fadeInRight 0.8s ease-out 0.5s forwards;
  pointer-events: none; /* so clicks fall through if needed, though parent handles it */
}

.ai-text {
  color: #fff;
  font-size: 14px;
  line-height: 1.6;
  letter-spacing: 1px;
  text-shadow: 0 0 5px rgba(0, 162, 255, 0.5);
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* 聊天面板样式 */
.ai-chat-panel {
  position: absolute;
  bottom: 120px;
  right: -50px;
  width: 320px;
  height: 400px;
  background: rgba(8, 18, 41, 0.9);
  border: 1px solid #00ffff;
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3), inset 0 0 10px rgba(0, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  z-index: 25;
  backdrop-filter: blur(5px);
  animation: scaleIn 0.3s ease-out forwards;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.chat-header {
  height: 40px;
  background: linear-gradient(90deg, rgba(0, 255, 255, 0.2), transparent);
  border-bottom: 1px solid rgba(0, 255, 255, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  color: #00ffff;
  font-weight: bold;
  font-size: 15px;
}

.close-btn {
  background: none;
  border: none;
  color: #a0d8ff;
  font-size: 20px;
  cursor: pointer;
}
.close-btn:hover { color: #fff; }

.chat-body {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.chat-body::-webkit-scrollbar { width: 5px; }
.chat-body::-webkit-scrollbar-thumb { background: rgba(0, 255, 255, 0.3); border-radius: 5px; }

.chat-msg {
  display: flex;
  width: 100%;
}
.chat-msg.user { justify-content: flex-end; }
.chat-msg.ai { justify-content: flex-start; }

.msg-content {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
  word-wrap: break-word;
}
.chat-msg.user .msg-content {
  background: rgba(0, 255, 255, 0.2);
  color: #fff;
  border: 1px solid rgba(0, 255, 255, 0.4);
}
.chat-msg.ai .msg-content {
  background: rgba(255, 255, 255, 0.1);
  color: #e0f2fe;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.chat-footer {
  padding: 12px;
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  display: flex;
  gap: 10px;
}

.chat-footer input {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 4px;
  padding: 0 10px;
  color: #fff;
  font-size: 13px;
  outline: none;
}
.chat-footer input:focus { border-color: #00ffff; }

.send-btn {
  background: #00a2ff;
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}
.send-btn:hover { background: #00ffff; color: #000; font-weight: bold; }
</style>
