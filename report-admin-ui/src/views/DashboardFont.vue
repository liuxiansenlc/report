<template>
  <div class="font-page">
    <el-card class="settings-card" shadow="hover">
      <div class="page-head">
        <div>
          <h2>大屏字体设置</h2>
          <p>调整会实时同步到右侧真实预览，点击保存后前台正式生效。</p>
        </div>
        <div class="head-actions">
          <el-button @click="resetAll">全部重置</el-button>
          <el-button type="primary" :loading="saving" @click="saveConfig">保存设置</el-button>
        </div>
      </div>

      <div class="config-grid">
        <div v-for="item in scaleItems" :key="item.key" class="scale-row">
          <div class="scale-meta">
            <span class="scale-title">{{ item.label }}</span>
            <span class="scale-desc">{{ item.desc }}</span>
          </div>
          <el-slider v-model="draft[item.key]" :min="0.75" :max="1.35" :step="0.01" />
          <el-input-number v-model="draft[item.key]" :min="0.75" :max="1.35" :step="0.01" :precision="2" controls-position="right" />
          <el-button text @click="draft[item.key] = 1">重置</el-button>
        </div>
      </div>
    </el-card>

    <el-card class="preview-card" shadow="hover">
      <div class="preview-head">
        <div class="preview-title">真实预览</div>
        <el-segmented v-model="previewPath" :options="previewOptions" />
      </div>
      <div class="preview-frame-wrap">
        <iframe ref="previewRef" class="preview-frame" :src="previewUrl" @load="postDraft"></iframe>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const defaultConfig = {
  globalScale: 1,
  headerScale: 1,
  leftScale: 1,
  centerScale: 1,
  rightScale: 1,
  analysisScale: 1,
  chartScale: 1,
  overlayScale: 1
}

const scaleItems = [
  { key: 'globalScale', label: '全局统一', desc: '所有大屏文字整体缩放' },
  { key: 'headerScale', label: '头部', desc: '日期、时间、顶部标题区域' },
  { key: 'leftScale', label: '左侧面板', desc: '服务农场、方案、生态效益等' },
  { key: 'centerScale', label: '中间地图', desc: '地图标签、浮层、AI助手' },
  { key: 'rightScale', label: '右侧面板', desc: '质量评价、风险列表等' },
  { key: 'analysisScale', label: '二级页面', desc: '农场详情分析页文字' },
  { key: 'chartScale', label: '图表文字', desc: '坐标轴、图例、图表标签' },
  { key: 'overlayScale', label: '弹窗/浮层', desc: '详情面板、下拉、聊天框' }
]

const previewOptions = [
  { label: '前台大屏', value: '/gdbh/dashboard' },
  { label: '二级页面', value: '/gdbh/analysis' }
]

const draft = reactive({ ...defaultConfig })
const saving = ref(false)
const previewRef = ref(null)
const previewPath = ref('/gdbh/dashboard')
const previewUrl = computed(() => `http://localhost:5173${previewPath.value}?fontPreview=1`)

const normalize = (value) => Number(value || 1)

const applyConfig = (data) => {
  Object.keys(defaultConfig).forEach(key => {
    draft[key] = normalize(data?.[key])
  })
}

const postDraft = () => {
  const win = previewRef.value?.contentWindow
  if (!win) return
  win.postMessage({ type: 'dashboard-font-preview', payload: { ...draft } }, '*')
}

const loadConfig = async () => {
  const res = await request.get('/dashboard-font-config')
  applyConfig(res.data)
  nextTick(postDraft)
}

const saveConfig = async () => {
  saving.value = true
  try {
    const res = await request.post('/dashboard-font-config', { ...draft })
    applyConfig(res.data)
    ElMessage.success('字体设置已保存')
    postDraft()
  } finally {
    saving.value = false
  }
}

const resetAll = () => {
  applyConfig(defaultConfig)
}

watch(draft, postDraft, { deep: true })
watch(previewPath, () => nextTick(() => setTimeout(postDraft, 500)))

onMounted(loadConfig)
</script>

<style scoped>
.font-page {
  display: grid;
  grid-template-columns: minmax(440px, 520px) 1fr;
  gap: 18px;
  height: calc(100vh - 110px);
}
.settings-card,
.preview-card {
  border-radius: 8px;
}
.page-head,
.preview-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.page-head h2 {
  margin: 0 0 6px;
  font-size: 20px;
  color: #1f2937;
}
.page-head p {
  margin: 0;
  color: #6b7280;
  font-size: 13px;
}
.head-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
.config-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.scale-row {
  display: grid;
  grid-template-columns: 120px 1fr 118px 48px;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  background: #fbfdff;
}
.scale-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.scale-title {
  font-weight: 700;
  color: #1f2937;
}
.scale-desc {
  font-size: 12px;
  color: #8a94a6;
}
.preview-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}
.preview-card :deep(.el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.preview-frame-wrap {
  flex: 1;
  min-height: 0;
  background: #0b1220;
  border-radius: 8px;
  overflow: hidden;
}
.preview-frame {
  width: 100%;
  height: 100%;
  border: 0;
  background: #000;
}
</style>
