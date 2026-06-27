<template>
  <div class="dashboard-container">
    <div class="dashboard-inner" :style="scaleStyle">
      <Header />
      <router-view />
      <div class="dashboard-bottom">
        <img src="./assets/images/down.png" class="bottom-img" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import Header from './components/Header.vue'
import { initDashboardFont, stopDashboardFont } from './utils/dashboardFont'

const width = 1920
const height = 1080
const scale = ref(1)

const updateScale = () => {
  const ww = window.innerWidth / width
  const wh = window.innerHeight / height
  scale.value = ww < wh ? ww : wh
}

onMounted(() => {
  updateScale()
  window.addEventListener('resize', updateScale)
  nextTick(initDashboardFont)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScale)
  stopDashboardFont()
})

const scaleStyle = computed(() => ({
  transform: `scale(${scale.value}) translate(-50%, -50%)`,
  width: `${width}px`,
  height: `${height}px`
}))
</script>

<style scoped>
.dashboard-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  background: transparent;
}

.dashboard-inner {
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: 0 0;
  display: flex;
  flex-direction: column;
}

.dashboard-bottom {
  width: 100%;
  display: flex;
  justify-content: center;
}
.bottom-img {
  width: 100%;
  object-fit: contain;
}
</style>
