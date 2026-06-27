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

const areaSelectors = [
  { selector: '.app-header', key: 'headerScale' },
  { selector: '.left-panel, .left-panel-wrapper', key: 'leftScale' },
  { selector: '.center-map, .center-panel', key: 'centerScale' },
  { selector: '.right-panel, .right-panel-wrapper', key: 'rightScale' },
  { selector: '.dashboard-body', key: 'analysisScale', whenAnalysis: true },
  { selector: '.echart-wrapper, .echart-ring', key: 'chartScale' },
  { selector: '.dropdown-menu, .risk-detail-panel, .plan-detail-panel, .ai-chat-panel, .map-tooltip', key: 'overlayScale' }
]

let activeConfig = { ...defaultConfig }
let observer = null
let scheduled = false

const number = (value) => {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(1.35, Math.max(0.75, n)) : 1
}

export const getDashboardFontConfig = () => ({ ...activeConfig })

export const dashboardFontSize = (base, areaKey = 'globalScale') => {
  return Math.round(Number(base) * number(activeConfig.globalScale) * number(activeConfig[areaKey]))
}

const elementScale = (el) => {
  let scale = number(activeConfig.globalScale)
  const isAnalysis = window.location.pathname.includes('/gdbh/analysis')
  for (const item of areaSelectors) {
    if (item.whenAnalysis && !isAnalysis) continue
    if (el.closest(item.selector)) scale *= number(activeConfig[item.key])
  }
  return scale
}

const markBaseFont = (el) => {
  if (el.dataset.fontBaseSize) return
  const size = parseFloat(window.getComputedStyle(el).fontSize)
  if (Number.isFinite(size) && size > 0) {
    el.dataset.fontBaseSize = String(size / elementScale(el))
  }
}

export const applyDashboardFontConfig = (config = {}) => {
  activeConfig = { ...defaultConfig, ...config }
  Object.keys(defaultConfig).forEach(key => {
    activeConfig[key] = number(activeConfig[key])
    document.documentElement.style.setProperty(`--font-${key.replace('Scale', '').replace(/[A-Z]/g, m => '-' + m.toLowerCase())}-scale`, activeConfig[key])
  })

  const nodes = document.querySelectorAll('.dashboard-inner *')
  nodes.forEach(el => {
    markBaseFont(el)
    if (!el.dataset.fontBaseSize) return
    el.style.fontSize = `${Number(el.dataset.fontBaseSize) * elementScale(el)}px`
  })

  window.dispatchEvent(new CustomEvent('dashboard-font-change', { detail: getDashboardFontConfig() }))
}

const scheduleApply = () => {
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(() => {
    scheduled = false
    applyDashboardFontConfig(activeConfig)
  })
}

export const initDashboardFont = async () => {
  try {
    const res = await fetch('/api/dashboard-font-config')
    const json = await res.json()
    if (json.code === 200 && json.data) {
      activeConfig = { ...defaultConfig, ...json.data }
    }
  } catch (e) {
    activeConfig = { ...defaultConfig }
  }

  applyDashboardFontConfig(activeConfig)

  window.addEventListener('message', event => {
    if (event.data?.type === 'dashboard-font-preview') {
      applyDashboardFontConfig(event.data.payload)
    }
  })

  observer = new MutationObserver(scheduleApply)
  observer.observe(document.body, { childList: true, subtree: true })
}

export const stopDashboardFont = () => {
  observer?.disconnect()
  observer = null
}
