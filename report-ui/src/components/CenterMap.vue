<template>
  <div class="center-map-container">
    <!-- 顶部图例区（接入动态统计） -->
    <div class="map-legend">
      <div class="legend-item">
        <span class="dot dot-cyan"></span>
        <span class="l-name">农场</span>
        <span class="l-val cyan">{{ farmCount }}<span class="l-unit">个</span></span>
      </div>
      <div class="legend-item">
        <span class="dot dot-green"></span>
        <span class="l-name">服务点</span>
        <span class="l-val green">{{ serviceCount }}<span class="l-unit">个</span></span>
      </div>
      <div class="legend-item">
        <span class="dot dot-gold"></span>
        <span class="l-name">工厂</span>
        <span class="l-val gold">{{ factoryCount }}<span class="l-unit">个</span></span>
      </div>
    </div>
    
    <!-- Three.js 独立3D地图 -->
    <div class="three-map-wrapper" ref="mapWrapperRef">
      <MapScene v-if="mapLoaded" :option-data="mapOptions" />
    </div>

    <!-- 悬浮提示框 -->
    <div v-show="hoverInfo.visible" class="map-tooltip" :style="{ left: hoverInfo.x + 'px', top: hoverInfo.y + 'px' }">
      <span class="mt-dot"></span>{{ hoverInfo.text }}
    </div>

    <!-- AI 机器人辅助助手 -->
    <div class="ai-robot-box" @click="toggleChat">
      <img src="../assets/images/ai.png" class="ai-avatar" />
      <div class="ai-bubble" v-if="!isChatOpen">
        <div class="ai-text">您好！我是您的智能农业助手，有任何问题都可以问我哦～</div>
      </div>
    </div>

    <!-- AI 聊天面板 -->
    <div class="ai-chat-panel" v-if="isChatOpen">
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
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import MapScene from './MapThree3D/map/map.vue'

const router = useRouter()
const mapOptions = ref({})
const mapLoaded = ref(false)
const mapWrapperRef = ref(null)

const farmCount = ref(0)
const serviceCount = ref(0)
const factoryCount = ref(0)

const hoverInfo = ref({
  visible: false,
  x: 0,
  y: 0,
  text: ''
})

// 全局鼠标探测器兜底 (100%精准定位，兼容缩放比例)
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

const trackMouse = (e) => {
  if (mapWrapperRef.value) {
    const rect = mapWrapperRef.value.getBoundingClientRect();
    // 抵消外层 transform: scale 带来的形变错位
    const scaleX = mapWrapperRef.value.offsetWidth / rect.width;
    const scaleY = mapWrapperRef.value.offsetHeight / rect.height;
    
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top) * scaleY;
  } else {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }
}

const handlePointClick = (item, layer, event) => {
  if (layer && layer.id === 'farm1' && item.name) {
    router.push(`/gdbh/analysis?farmName=${encodeURIComponent(item.name)}`)
  }
}

const handlePointHover = (item, layer, event) => {
  if (item && item.name) {
    let cx = mouseX;
    let cy = mouseY;
    
    if (document.body && document.body.style) {
      document.body.style.cursor = 'pointer';
    }
    
    hoverInfo.value = {
      visible: true,
      x: cx,
      y: cy,
      text: item.name
    }
  }
}

const handlePointOut = () => {
  hoverInfo.value.visible = false
  if (document.body && document.body.style) {
    document.body.style.cursor = 'default';
  }
}

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


const initConfig = async () => {
  try {
    const response = await fetch('/china.json')
    const chinaJson = await response.json()
    
    // 拉取后台实际农场数据
    let realFarms = []
    try {
      const dbRes = await fetch('/api/datasource/farm-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const dbJson = await dbRes.json()
      if (dbJson.code === 200 && dbJson.data) {
        realFarms = dbJson.data
          .filter(item => item.longitude && item.latitude)
          .map(item => ({
             lon: parseFloat(item.longitude),
             lat: parseFloat(item.latitude),
             name: item.farmName
          }))
          .filter(item => !isNaN(item.lon) && !isNaN(item.lat))
        farmCount.value = realFarms.length
      }
    } catch(e) {
      console.error('获取农场经纬度失败', e)
    }

    // 拉取服务点数据
    let realServices = []
    try {
      const sRes = await fetch('/api/datasource/service-stations')
      const sJson = await sRes.json()
      if (sJson.code === 200 && sJson.data) {
        realServices = sJson.data
        serviceCount.value = realServices.length
      }
    } catch(e) {
      console.error('获取服务点失败', e)
    }

    // 拉取工厂数据
    let realFactories = []
    try {
      const fRes = await fetch('/api/datasource/factories')
      const fJson = await fRes.json()
      if (fJson.code === 200 && fJson.data) {
        realFactories = fJson.data
        factoryCount.value = realFactories.length
      }
    } catch(e) {
      console.error('获取工厂失败', e)
    }

    mapOptions.value = {
      // 传入地图数据绕过内部外部资源请求
      onPointClick: handlePointClick,
      onPointHover: handlePointHover,
      onPointOut: handlePointOut,
      three3dMap: {
        mapSource: chinaJson,
        mapCode: "100000"
      },
      scene: {
        camera: {
          cameraPosition: { x: 0.1, y: 135, z: 90 },
          cameraLookAt: { x: 0, y: 0, z: 0 }
        },
        pointCenter: [104.0, 35.0], // 地图投重视角中心
        depth: 5, // 地图厚度
        baseLabelNameScale: 0.08,
        baseLabelNameColor: '#5fc6dc',
        drill: {
          isDrill: true,
          drillLevel: 1,
          focusProvinceOnly: true
        },
        label: {
          areaName: true,
          dataLabel: false,
          areaPoint: false
        },
        style: {
          provinceLineColor: '#00ffff',
          provinceLineWidth: 1,
          provinceTopColor: '#002568',
          provinceSideColor: '#013a70',
          hoverEmissiveColor: '#00ffff',
          hoverEmissiveIntensity: 1.5,
          hoverLiftScale: 1.1,
          strokeColor: '#00ffff'
        },
        animation: {
          strokeVisible: true,
          strokeSpeed: 0.2,
          strokeWidth: 0.2,
          enterCamera: true,
          enterCameraDelay: 0.5,
          enterCameraDuration: 2,
          enterTimeScale: 1
        },
        environment: {
          fogEnabled: true,
          fogColor: '#011024',
          fogNear: 1,
          fogFar: 500,
          ambientLightIntensity: 2.5,
          ambientLightColor: '#FFFFFF',
          directionalLightIntensity: 3,
          directionalLightColor: '#FFFFFF'
        },
        effect: {
          rotateBorderVisible: true,
          rotateBorderColor: '#48afff',
          rotateBorderOuterOpacity: 0.2,
          rotateBorderInnerOpacity: 0.4,
          floorVisible: true,
          floorColor: '#ffffff',
          gridRippleVisible: true,
          gridRippleDiffuseEnabled: true,
          gridRippleColor: '#00ffff',
          particlesVisible: true,
          particlesColor: '#00eeee'
        },
        controls: {
          zoom: true,
          pan: true,
          rotate: true
        }
      },
      layers: [
        {
          id: 'farm1', name: '普通农场', type: 'point', visible: true,
          dataMapping: { lng: 'lon', lat: 'lat', label: 'name' },
          style: { color: '#00ffff', size: 4.5, opacity: 1, labelVisible: false },
          data: realFarms
        },
        {
          id: 'farm2', name: '服务点', type: 'point', visible: true,
          dataMapping: { lng: 'lon', lat: 'lat', label: 'name' },
          style: { color: '#ff4fd8', size: 4.5, opacity: 1, labelVisible: false },
          data: realServices
        },
        {
          id: 'farm3', name: '工厂', type: 'point', visible: true,
          dataMapping: { lng: 'lon', lat: 'lat', label: 'name' },
          style: { color: '#ffd700', size: 4.5, opacity: 1, labelVisible: false },
          data: realFactories
        }
      ]
    }

    mapLoaded.value = true
  } catch (e) {
    console.error('3D Map Data Load Error:', e)
  }
}

onMounted(() => {
  window.addEventListener('mousemove', trackMouse)
  initConfig()
})

import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', trackMouse)
})
</script>

<style scoped>
.center-map-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
}

.three-map-wrapper {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.map-tooltip {
  position: absolute;
  padding: 10px 18px;
  background: rgba(14, 25, 55, 0.85);
  border: 1px solid #1e7491;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  pointer-events: none;
  z-index: 99999;
  box-shadow: inset 0 0 15px rgba(0, 255, 255, 0.4), 0 0 10px rgba(0, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  transform: translate(-50%, -100%);
  margin-top: -20px; 
}

.map-tooltip::before {
  position: absolute;
  left: -2px; 
  top: -2px; 
  width: 12px; 
  height: 12px; 
  content: '';
  border-left: 2px solid #6cfffe; 
  border-top: 2px solid #6cfffe;
}

.map-tooltip::after {
  position: absolute;
  right: -2px; 
  bottom: -2px; 
  width: 12px; 
  height: 12px; 
  content: '';
  border-right: 2px solid #6cfffe; 
  border-bottom: 2px solid #6cfffe;
}

.mt-dot {
  display: inline-block;
  width: 6px; 
  height: 6px;
  background: #00ffff;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
  box-shadow: 0 0 6px #00ffff;
}

/* 顶部图例组件（保持样式不变） */
.map-legend {
  position: absolute;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 40px;
  z-index: 10;
  background: transparent;
  padding: 10px 20px;
  white-space: nowrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}
.dot-cyan { color: #00ffff; background: #00ffff; }
.dot-green { color: #ff4fd8; background: #ff4fd8; }
.dot-gold { color: #ffd700; background: #ffd700; }

.l-name {
  font-size: 15px;
  color: #fff;
  letter-spacing: 1px;
}

.l-val {
  font-size: 20px;
  font-family: 'Arial Narrow', Arial, sans-serif;
  font-weight: bold;
  margin-left: 8px;
}
.l-val.cyan { color: #00ffff; text-shadow: 0 0 5px rgba(0,255,255,0.5); }
.l-val.green { color: #ff4fd8; text-shadow: 0 0 5px rgba(255,79,216,0.55); }
.l-val.gold { color: #ffd700; text-shadow: 0 0 5px rgba(255,215,0,0.5); }

.l-unit {
  font-size: 14px;
  color: #a0d8ff;
  font-weight: normal;
  margin-left: 4px;
  text-shadow: none;
}

/* AI 机器人样式 */
.ai-robot-box {
  position: absolute;
  left: 20px;
  bottom: 30px;
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
  background: url('../assets/images/ai_bg.png') no-repeat left center;
  background-size: 100% 100%;
  padding: 18px 30px 18px 45px; /* 左侧留出更多 padding 给箭头的尖尖 */
  margin-left: -5px; /* 让对话框更贴近机器人 */
  max-width: 300px;
  min-height: 60px;
  display: flex;
  align-items: center;
  opacity: 0;
  animation: fadeInRight 0.8s ease-out 0.5s forwards;
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
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 聊天面板样式 */
.ai-chat-panel {
  position: absolute;
  left: 140px;
  bottom: 30px;
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
