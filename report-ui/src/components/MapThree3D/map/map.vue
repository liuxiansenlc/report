<template>
  <div class="map-level" @click="handleMapLevelClick">
    <canvas ref="canvasRef" class="map-canvas"></canvas>
    <div ref="focusProvinceNameRef" class="focus-province-name"></div>
    <div ref="returnBtnRef" class="return-btn" @click="goBack">返回上一级</div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, computed, ref } from 'vue'
import { World } from './map.js'
let app = null

const props = defineProps({
  optionData: {
    type: Object
  }
})

const canvasRef = ref(null)
const returnBtnRef = ref(null)
const focusProvinceNameRef = ref(null)
const scene = computed(() => props.optionData.scene || {})
const cameraPosition = computed(() => scene.value.camera.cameraPosition)
const cameraLookAt = computed(() => scene.value.camera.cameraLookAt)
const dataset = computed(() => props.optionData.dataset || [])
const provinceLineColor = computed(() => scene.value?.style?.provinceLineColor)
const provinceLineWidth = computed(() => scene.value?.style?.provinceLineWidth)
const provinceTopColor = computed(() => scene.value?.style?.provinceTopColor)
const provinceTopTexture = computed(() => scene.value?.style?.provinceTopTexture)
const provinceSideColor = computed(() => scene.value?.style?.provinceSideColor)
const provinceSideTexture = computed(() => scene.value?.style?.provinceSideTexture)
const hoverEmissiveColor = computed(() => scene.value?.style?.hoverEmissiveColor)
const hoverEmissiveIntensity = computed(() => scene.value?.style?.hoverEmissiveIntensity)
const hoverLiftScale = computed(() => scene.value?.style?.hoverLiftScale)
const strokeVisible = computed(() => scene.value?.animation?.strokeVisible)
const strokeSpeed = computed(() => scene.value?.animation?.strokeSpeed)
const strokeWidth = computed(() => scene.value?.animation?.strokeWidth)
const rotateBorderVisible = computed(() => scene.value?.effect?.rotateBorderVisible)
const rotateBorderColor = computed(() => scene.value?.effect?.rotateBorderColor)
const rotateBorderOuterOpacity = computed(() => scene.value?.effect?.rotateBorderOuterOpacity)
const rotateBorderOuterSpeed = computed(() => scene.value?.effect?.rotateBorderOuterSpeed)
const rotateBorderInnerOpacity = computed(() => scene.value?.effect?.rotateBorderInnerOpacity)
const rotateBorderInnerSpeed = computed(() => scene.value?.effect?.rotateBorderInnerSpeed)
const floorVisible = computed(() => scene.value?.effect?.floorVisible)
const floorColor = computed(() => scene.value?.effect?.floorColor)
const gridRippleVisible = computed(() => scene.value?.effect?.gridRippleVisible)
const gridRippleDiffuseEnabled = computed(() => scene.value?.effect?.gridRippleDiffuseEnabled)
const gridRippleColor = computed(() => scene.value?.effect?.gridRippleColor)
const particlesVisible = computed(() => scene.value?.effect?.particlesVisible)
const particlesColor = computed(() => scene.value?.effect?.particlesColor)
const strokeColor = computed(() => scene.value?.style?.strokeColor)
const viewControls = computed(() => scene.value?.controls)
const enterCamera = computed(() => scene.value?.animation?.enterCamera)
const enterCameraDelay = computed(() => scene.value?.animation?.enterCameraDelay)
const enterCameraDuration = computed(() => scene.value?.animation?.enterCameraDuration)
const enterTimeScale = computed(() => scene.value?.animation?.enterTimeScale)
const depth = computed(() => scene.value?.depth)
const baseLabelNameScale = computed(() => scene.value?.baseLabelNameScale)
const baseLabelNameColor = computed(() => scene.value?.baseLabelNameColor)
const baseLabelNameFontFamily = computed(() => scene.value?.baseLabelNameFontFamily)
const provinceNameOffset = computed(() => scene.value?.provinceNameOffset)
const pointCenter = computed(() => scene.value?.pointCenter)
const mapSource = computed(() => props.optionData?.three3dMap?.mapSource)
const fogEnabled = computed(() => scene.value?.environment?.fogEnabled)
const fogColor = computed(() => scene.value?.environment?.fogColor)
const fogNear = computed(() => scene.value?.environment?.fogNear)
const fogFar = computed(() => scene.value?.environment?.fogFar)
const ambientLightIntensity = computed(() => scene.value?.environment?.ambientLightIntensity)
const ambientLightColor = computed(() => scene.value?.environment?.ambientLightColor)
const directionalLightIntensity = computed(() => scene.value?.environment?.directionalLightIntensity)
const directionalLightColor = computed(() => scene.value?.environment?.directionalLightColor)
const mapCode = computed(() => props.optionData?.three3dMap?.mapCode)
const layers = computed(() => props.optionData?.layers || [])
let isApplyingCamera = false
let cameraSyncPending = false
let onControlsChange = null
let lastAppliedBaseLabelNameFontFamily = ''

const center = Array.isArray(pointCenter.value) && pointCenter.value.length >= 2 ? pointCenter.value : [108.55, 34.32]
lastAppliedBaseLabelNameFontFamily =
  typeof baseLabelNameFontFamily.value === 'string' ? baseLabelNameFontFamily.value : ''

const rebuildWorld = source => {
  if (app?.camera?.controls && onControlsChange) {
    app.camera.controls.removeEventListener('change', onControlsChange)
  }
  if (app) {
    app.destroy()
    app = null
  }
  if (!canvasRef.value) return
  const center = Array.isArray(pointCenter.value) && pointCenter.value.length >= 2 ? pointCenter.value : [108.55, 34.32]
  const nextSource = typeof source === 'string' ? source : ''
  app = createWorld(canvasRef.value,worldConfig.value)

  lastAppliedBaseLabelNameFontFamily =
    typeof baseLabelNameFontFamily.value === 'string' ? baseLabelNameFontFamily.value : ''

  bindCameraSyncFromThree()

  app._onMapReadyCallback = () => {
    fetchAndSetLayers(layers.value)
  }
}

const applyCamera = () => {
  if (!app) return

  isApplyingCamera = true

  const pos = cameraPosition.value
  if (pos && isFinite(pos.x) && isFinite(pos.y) && isFinite(pos.z)) {
    app.camera.instance.position.set(pos.x, pos.y, pos.z)
    app.camera.instance.updateProjectionMatrix()
  }

  const target = cameraLookAt.value
  if (target && app.camera?.controls && isFinite(target.x) && isFinite(target.y) && isFinite(target.z)) {
    app.camera.controls.target.set(target.x, target.y, target.z)
    app.camera.controls.update()
  }

  isApplyingCamera = false
}

const bindCameraSyncFromThree = () => {
  if (!app?.camera?.controls) return

  onControlsChange = () => {
    if (isApplyingCamera) return
    if (cameraSyncPending) return

    cameraSyncPending = true
    requestAnimationFrame(() => {
      cameraSyncPending = false
      if (!app?.camera?.controls) return

      const pos = app.camera.instance.position
      const target = app.camera.controls.target

      if (!scene.value.camera) scene.value.camera = {}
      if (!scene.value.camera.cameraPosition) scene.value.camera.cameraPosition = { x: 0, y: 0, z: 0 }
      if (!scene.value.camera.cameraLookAt) scene.value.camera.cameraLookAt = { x: 0, y: 0, z: 0 }

      scene.value.camera.cameraPosition.x = pos.x
      scene.value.camera.cameraPosition.y = pos.y
      scene.value.camera.cameraPosition.z = pos.z

      scene.value.camera.cameraLookAt.x = target.x
      scene.value.camera.cameraLookAt.y = target.y
      scene.value.camera.cameraLookAt.z = target.z
    })
  }

  app.camera.controls.addEventListener('change', onControlsChange)
}

const worldConfig = computed(() => ({
  geoProjectionCenter: center,
  camera: {
    cameraPosition: cameraPosition.value,
    cameraLookAt: cameraLookAt.value
  },
  label: {
    areaName: scene.value.label.areaName,
    dataLabel: scene.value.label.dataLabel,
    areaPoint: scene.value.label.areaPoint
  },
  style: {
    provinceLineColor: provinceLineColor.value,
    provinceLineWidth: provinceLineWidth.value,
    provinceTopColor: provinceTopColor.value,
    provinceTopTexture: provinceTopTexture.value,
    provinceSideColor: provinceSideColor.value,
    provinceSideTexture: provinceSideTexture.value,
    hoverEmissiveColor: hoverEmissiveColor.value,
    hoverEmissiveIntensity: hoverEmissiveIntensity.value,
    hoverLiftScale: hoverLiftScale.value,
    strokeColor: strokeColor.value
  },
  controls: viewControls.value,
  animation: {
    strokeVisible: strokeVisible.value,
    strokeSpeed: strokeSpeed.value,
    strokeWidth: strokeWidth.value,
    enterCamera: enterCamera.value,
    enterCameraDelay: enterCameraDelay.value,
    enterCameraDuration: enterCameraDuration.value,
    enterTimeScale: enterTimeScale.value
  },
  environment: {
    fogEnabled: fogEnabled.value,
    fogColor: fogColor.value,
    fogNear: fogNear.value,
    fogFar: fogFar.value,
    ambientLightIntensity: ambientLightIntensity.value
  },
  effect: {
    rotateBorderVisible: rotateBorderVisible.value,
    rotateBorderColor: rotateBorderColor.value,
    rotateBorderOuterOpacity: rotateBorderOuterOpacity.value,
    rotateBorderOuterSpeed: rotateBorderOuterSpeed.value,
    rotateBorderInnerOpacity: rotateBorderInnerOpacity.value,
    rotateBorderInnerSpeed: rotateBorderInnerSpeed.value,
    floorVisible: floorVisible.value,
    floorColor: floorColor.value,
    gridRippleVisible: gridRippleVisible.value,
    gridRippleDiffuseEnabled: gridRippleDiffuseEnabled.value,
    gridRippleColor: gridRippleColor.value,
    particlesVisible: particlesVisible.value,
    particlesColor: particlesColor.value
  },

  depth: depth.value,
  baseLabelNameScale: baseLabelNameScale.value,
  baseLabelNameColor: baseLabelNameColor.value,
  baseLabelNameFontFamily: baseLabelNameFontFamily.value,
  provinceNameOffset: provinceNameOffset.value,
  mapSource: mapSource.value,
  mapCode: mapCode.value,
  dom: {
    returnBtn: returnBtnRef.value,
    focusProvinceName: focusProvinceNameRef.value
  },
  dataset: dataset.value,
  //是否下钻
  drill: scene.value.drill,
  layers: layers.value
}))


// 返回上一级
const goBack = () => {
  app && app.goBack()
}

const handleMapLevelClick = event => {
  app && app.handleCanvasBlankClick && app.handleCanvasBlankClick(event)
}

function createWorld(canvas,config) {
  const world = new World(canvas, config)
  return world
}

onMounted(() => {
  if (!canvasRef.value) return

  app = createWorld(canvasRef.value, worldConfig.value)
  app.onPointClick = props.optionData.onPointClick
  app.onPointHover = props.optionData.onPointHover
  app.onPointOut = props.optionData.onPointOut

  bindCameraSyncFromThree()

  // 等地图就绪后再加载图层
  app._onMapReadyCallback = () => {
    fetchAndSetLayers(layers.value)
  }

  // 编辑器拖拽禁用（预览环境略）
})
onBeforeUnmount(() => {
  if (app?.camera?.controls && onControlsChange) {
    app.camera.controls.removeEventListener('change', onControlsChange)
  }
  app && app.destroy()
})

watch(
  () => [
    cameraPosition.value?.x,
    cameraPosition.value?.y,
    cameraPosition.value?.z,
    cameraLookAt.value?.x,
    cameraLookAt.value?.y,
    cameraLookAt.value?.z
  ],
  () => {
    applyCamera()
  }
)
watch(
  () => scene.value.label.areaName,
  newVal => {
    app && app.setLabelVisible('provinceNameGroup', newVal)
  }
)
watch(
  () => scene.value.label.dataLabel,
  newVal => {
    app && app.setLabelVisible('labelGroup', newVal)
  }
)
watch(
  () => scene.value.label.areaPoint,
  newVal => {
    app && app.setSpritVisible('areaPointGroup', newVal)
  }
)
watch(
  () => scene.value.drill.isDrill,
  newVal => {
    app && app.setDrill(newVal)
  }
)
watch(
  () => scene.value.drill.drillLevel,
  newVal => {
    app && app.setDrillLevel(newVal)
  }
)
watch(
  () => scene.value.depth,
  () => {
    rebuildWorld(mapSource.value)
  }
)
watch(
  () => baseLabelNameScale.value,
  newVal => {
    app && app.setBaseLabelNameScale && app.setBaseLabelNameScale(newVal)
  }
)
watch(
  () => baseLabelNameColor.value,
  newVal => {
    app && app.setBaseLabelNameColor && app.setBaseLabelNameColor(newVal)
  }
)
watch(
  () => baseLabelNameFontFamily.value,
  newVal => {
    if (!app?.setBaseLabelNameFontFamily) return

    const next = typeof newVal === 'string' ? newVal : newVal == null ? '' : String(newVal)
    if (next === lastAppliedBaseLabelNameFontFamily) return

    lastAppliedBaseLabelNameFontFamily = next
    app.setBaseLabelNameFontFamily(next)
  }
)
watch(
  () => provinceNameOffset.value,
  newVal => {
    app && app.setProvinceNameOffset && app.setProvinceNameOffset(newVal)
  },
  { deep: true }
)
watch(
  () => pointCenter.value,
  newVal => {
    app && app.setGeoProjectionCenter(newVal)
  },
  { deep: true }
)
watch(
  () => mapSource.value,
  newVal => {
    rebuildWorld(newVal)
    app.onPointClick = props.optionData.onPointClick
    app.onPointHover = props.optionData.onPointHover
    app.onPointOut = props.optionData.onPointOut
  }
)
watch(
  () => provinceLineColor.value,
  newVal => {
    app && app.setProvinceLineColor(newVal)
  }
)
watch(
  () => provinceLineWidth.value,
  () => {
    rebuildWorld(mapSource.value)
  }
)
watch(
  () => provinceTopColor.value,
  newVal => {
    app && app.setProvinceTopColor && app.setProvinceTopColor(newVal)
  }
)
watch(
  () => provinceTopTexture.value,
  newVal => {
    app && app.setProvinceTopTexture && app.setProvinceTopTexture(newVal)
  }
)
watch(
  () => provinceSideColor.value,
  newVal => {
    app && app.setProvinceSideColor && app.setProvinceSideColor(newVal)
  }
)
watch(
  () => provinceSideTexture.value,
  newVal => {
    app && app.setProvinceSideTexture && app.setProvinceSideTexture(newVal)
  }
)
watch(
  () => hoverEmissiveColor.value,
  newVal => {
    app && app.setHoverEmissiveColor && app.setHoverEmissiveColor(newVal)
  }
)
watch(
  () => hoverEmissiveIntensity.value,
  newVal => {
    app && app.setHoverEmissiveIntensity && app.setHoverEmissiveIntensity(newVal)
  }
)
watch(
  () => hoverLiftScale.value,
  newVal => {
    app && app.setHoverLiftScale && app.setHoverLiftScale(newVal)
  }
)
watch(
  () => strokeColor.value,
  newVal => {
    app && app.setStrokeColor(newVal)
  }
)
watch(
  () => strokeVisible.value,
  newVal => {
    app && app.setStrokeVisible(newVal)
  }
)
watch(
  () => strokeSpeed.value,
  newVal => {
    app && app.setStrokeSpeed && app.setStrokeSpeed(newVal)
  }
)
watch(
  () => strokeWidth.value,
  newVal => {
    app && app.setStrokeWidth && app.setStrokeWidth(newVal)
  }
)
watch(
  () => rotateBorderVisible.value,
  newVal => {
    app && app.setRotateBorderVisible && app.setRotateBorderVisible(newVal)
  }
)
watch(
  () => rotateBorderColor.value,
  newVal => {
    app && app.setRotateBorderColor && app.setRotateBorderColor(newVal)
  }
)
watch(
  () => rotateBorderOuterOpacity.value,
  newVal => {
    app && app.setRotateBorderOuterOpacity && app.setRotateBorderOuterOpacity(newVal)
  }
)
watch(
  () => rotateBorderOuterSpeed.value,
  newVal => {
    app && app.setRotateBorderOuterSpeed && app.setRotateBorderOuterSpeed(newVal)
  }
)
watch(
  () => rotateBorderInnerOpacity.value,
  newVal => {
    app && app.setRotateBorderInnerOpacity && app.setRotateBorderInnerOpacity(newVal)
  }
)
watch(
  () => rotateBorderInnerSpeed.value,
  newVal => {
    app && app.setRotateBorderInnerSpeed && app.setRotateBorderInnerSpeed(newVal)
  }
)
watch(
  () => floorVisible.value,
  newVal => {
    app && app.setFloorVisible && app.setFloorVisible(newVal)
  }
)
watch(
  () => floorColor.value,
  newVal => {
    app && app.setFloorColor && app.setFloorColor(newVal)
  }
)
watch(
  () => gridRippleVisible.value,
  newVal => {
    app && app.setGridRippleVisible && app.setGridRippleVisible(newVal)
  }
)
watch(
  () => gridRippleDiffuseEnabled.value,
  newVal => {
    app && app.setGridRippleDiffuseEnabled && app.setGridRippleDiffuseEnabled(newVal)
  }
)
watch(
  () => gridRippleColor.value,
  newVal => {
    app && app.setGridRippleColor && app.setGridRippleColor(newVal)
  }
)
watch(
  () => particlesVisible.value,
  newVal => {
    app && app.setParticlesVisible && app.setParticlesVisible(newVal)
  }
)
watch(
  () => particlesColor.value,
  newVal => {
    app && app.setParticlesColor && app.setParticlesColor(newVal)
  }
)
watch(
  () => enterCamera.value,
  newVal => {
    app && app.setEnterCameraAnimationEnabled(newVal)
  }
)
watch(
  () => fogEnabled.value,
  newVal => {
    app && app.setFogEnabled && app.setFogEnabled(newVal)
  }
)
watch(
  () => fogColor.value,
  newVal => {
    app && app.setFogColor && app.setFogColor(newVal)
  }
)
watch(
  () => fogNear.value,
  newVal => {
    app && app.setFogNear && app.setFogNear(newVal)
  }
)
watch(
  () => fogFar.value,
  newVal => {
    app && app.setFogFar && app.setFogFar(newVal)
  }
)
watch(
  () => ambientLightIntensity.value,
  newVal => {
    app && app.setAmbientLightIntensity && app.setAmbientLightIntensity(newVal)
  }
)
watch(
  () => ambientLightColor.value,
  newVal => {
    app && app.setAmbientLightColor && app.setAmbientLightColor(newVal)
  }
)
watch(
  () => directionalLightIntensity.value,
  newVal => {
    app && app.setDirectionalLightIntensity && app.setDirectionalLightIntensity(newVal)
  }
)
watch(
  () => directionalLightColor.value,
  newVal => {
    app && app.setDirectionalLightColor && app.setDirectionalLightColor(newVal)
  }
)
watch(
  () => [viewControls.value?.zoom, viewControls.value?.pan, viewControls.value?.rotate],
  () => {
    app && app.setViewControls(viewControls.value)
  }
)
watch(
  () => dataset.value,
  (newVal, oldVal) => {
    app && app.setDataset(newVal)
  },
  { deep: true }
)
watch(
  () => layers.value,
  (newVal) => {
    fetchAndSetLayers(newVal)
  },
  { deep: true }
)
watch(
  () => dataset.value,
  (newVal) => {
    app && app.setLayers && app.setLayers(layers.value, newVal)
  },
  { deep: true }
)

async function fetchAndSetLayers(layerList) {
  if (!app?.setLayers) return
  const results = (layerList || []).map(layer => {
    return { layer, rows: layer.data || [] }
  })
  app.setLayersWithData(results)
}
</script>

<style lang="scss">
.map-level {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  .map-canvas {
    width: 100%;
    height: 100%;
    background: transparent;
  }
}

.focus-province-name {
  position: absolute;
  left: 50%;
  top: 12%;
  z-index: 8;
  display: none;
  min-width: 180px;
  padding: 5px 34px 7px;
  transform: translateX(-50%);
  color: #f2fdff;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0;
  text-align: center;
  white-space: nowrap;
  pointer-events: none;
  text-shadow: 0 0 4px #07213b, 0 0 10px rgba(0, 231, 255, 0.9), 0 2px 3px #001225;
  background: linear-gradient(90deg, transparent, rgba(0, 42, 87, 0.78) 18%, rgba(0, 42, 87, 0.78) 82%, transparent);

  &::before,
  &::after {
    position: absolute;
    top: 50%;
    width: 42px;
    height: 1px;
    content: '';
    background: linear-gradient(90deg, transparent, #38eaff);
    box-shadow: 0 0 7px rgba(56, 234, 255, 0.8);
  }

  &::before {
    left: -20px;
  }

  &::after {
    right: -20px;
    transform: rotate(180deg);
  }
}

// 返回按钮
.return-btn {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  padding: 5px 24px;
  color: #fff;
  border: 1px solid #2bc4dc;
  margin-bottom: 10px;
  font-size: 12px;
  text-align: center;
  opacity: 0.5;
  display: none;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    opacity: 1;
  }
}
// 右侧按钮组
.map-btn-group {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  .btn {
    padding: 5px 12px;
    color: #fff;
    border: 1px solid #2bc4dc;
    margin-bottom: 10px;
    font-size: 12px;
    text-align: center;
    opacity: 0.5;
    cursor: pointer;
    transition: all 0.3s;
    &.active {
      opacity: 1;
    }
  }
}
// 信息框
.info-point {
  background: rgba(0, 0, 0, 0.5);
  color: #a3dcde;
  font-size: 14px;
  width: 170px;
  height: 106px;
  padding: 16px 12px 0;
  margin-bottom: 30px;
  &-wrap {
    &:after,
    &:before {
      display: block;
      content: '';
      position: absolute;
      top: 0;
      width: 15px;
      height: 15px;
      border-top: 1px solid #4b87a6;
    }
    &:before {
      left: 0;
      border-left: 1px solid #4b87a6;
    }
    &:after {
      right: 0;
      border-right: 1px solid #4b87a6;
    }
    &-inner {
      &:after,
      &:before {
        display: block;
        content: '';
        position: absolute;
        bottom: 0;
        width: 15px;
        height: 15px;
        border-bottom: 1px solid #4b87a6;
      }
      &:before {
        left: 0;
        border-left: 1px solid #4b87a6;
      }
      &:after {
        right: 0;
        border-right: 1px solid #4b87a6;
      }
    }
  }
  &-line {
    position: absolute;
    top: 7px;
    right: 12px;
    display: flex;
    .line {
      width: 5px;
      height: 2px;
      margin-right: 5px;
      background: #17e5c3;
    }
  }
  &-content {
    .content-item {
      display: flex;
      height: 28px;
      line-height: 28px;
      background: rgba(35, 47, 58, 0.6);
      margin-bottom: 5px;
      .label {
        width: 60px;
        padding-left: 10px;
      }
      .value {
        color: #fff;
      }
    }
  }
}
// 标牌
.badges-label {
  z-index: 99999;
  &-outline {
    position: absolute;
  }
  &-wrap {
    position: relative;
    padding: 10px 10px;
    background: #0e1937;
    border: 1px solid #1e7491;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    // margin-bottom: 50px;
    bottom: 50px;
    z-index: 99999;
    span {
      color: #ffe70b;
    }
    &:after {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 10px;
      height: 10px;
      display: block;
      content: '';
      border-right: 2px solid #6cfffe;
      border-bottom: 2px solid #6cfffe;
    }
    &:before {
      position: absolute;
      left: 0;
      top: 0;
      width: 10px;
      height: 10px;
      display: block;
      content: '';
      border-left: 2px solid #6cfffe;
      border-top: 2px solid #6cfffe;
    }
    .icon {
      position: absolute;
      width: 27px;
      height: 20px;
      left: 50%;
      transform: translateX(-13px);
      bottom: -40px;
    }
  }
}

.area-name-label {
  &-wrap {
    color: #5fc6dc;
    opacity: 1;
    text-shadow: 1px 1px 0px #000;
  }
}
.provinces-name-label {
  &-wrap {
    color: #5fc6dc;
    opacity: 0;
    text-shadow: 1px 1px 0px #000;
  }
}
.provinces-label-style02 {
  z-index: 2;
  &-wrap {
    transform: translate(0%, 200%);
    opacity: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 40px;
    z-index: 2;
  }
  .number {
    color: #fff;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 10px;
    /* .unit {
      color: #fff;
      font-size: 12px;
      font-weight: 400;
      opacity: 0.5;
      padding-left: 5px;
    } */
  }

  .no {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #7efbf6;
    /* text-shadow: 0px 0px 4px 0px #7efbf6; */
    text-shadow: 0 0 5px #7efbf6;
    font-size: 16px;
    /* font-weight: 700; */
    width: 30px;
    height: 30px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
  }
  .yellow {
    .no {
      color: #fef99e !important;
      text-shadow: 0 0 5px #fef99e !important;
    }
  }
}

.city-name-label {
  &-wrap {
    color: #5fc6dc;
    opacity: 0;
    text-shadow: 1px 1px 0px #000;
  }
}
.city-label-style02 {
  z-index: 2;
  &-wrap {
    transform: translate(0%, 200%);
    opacity: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 40px;
    z-index: 2;
  }
  .number {
    color: #fff;
    // font-size: 12px;
    // font-weight: 700;
    margin-bottom: 10px;
    /* .unit {
      color: #fff;
      font-size: 12px;
      font-weight: 400;
      opacity: 0.5;
      padding-left: 5px;
    } */
  }

  .no {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #7efbf6;
    /* text-shadow: 0px 0px 4px 0px #7efbf6; */
    text-shadow: 0 0 5px #7efbf6;
    // font-size: 16px;
    /* font-weight: 700; */
    width: 30px;
    height: 30px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.5);
  }
  .yellow {
    .no {
      color: #fef99e !important;
      text-shadow: 0 0 5px #fef99e !important;
    }
  }
}

.fixed-loading {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 99;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
}
.page-loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 10px;
}
.page-loading {
  width: 30px;
  height: 30px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 100%;
  animation: loading infinite 0.75s linear;
}

@keyframes loading {
  from {
    transform: rotate(0);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
