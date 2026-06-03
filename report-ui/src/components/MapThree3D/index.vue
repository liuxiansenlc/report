<template>
  <div class="map-three-3d-container">
    <mapScene :option-data="chartConfig.option" />
  </div>
</template>

<script setup lang="ts">
import { PropType, watch } from 'vue'
import { CreateComponentType } from '@/packages/index.d'
import mapScene from './map/map.vue'

const props = defineProps({
  chartConfig: {
    type: Object as PropType<CreateComponentType>,
    required: true
  }
})
</script>
<style scoped lang="scss">
.map-three-3d-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: transparent;
  margin: 0 auto;
  font-size: 14px;
  .map {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 2;
  }
  .loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    transform-origin: center;
    right: 0;
    bottom: 0;
    background: #000;
    pointer-events: none;
    z-index: 99;
    animation: none;
    &-text {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      color: #fff;
      font-family: 'D-DIN', Arial, sans-serif;
      letter-spacing: 10px;
      span {
        font-size: 2vw;
        animation: blurAni 1.5s calc(var(--index) / 5 * 1s) alternate infinite;
      }
    }
    &-progress {
      font-size: 2vw;
      color: #fff;
      font-family: 'D-DIN', Arial, sans-serif;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      transform-origin: center;
      margin-top: -3vw;
      .unit {
        padding-left: 10px;
        font-size: 1vw;
      }
    }
  }
}
@keyframes blurAni {
  to {
    filter: blur(3px);
  }
}
</style>
