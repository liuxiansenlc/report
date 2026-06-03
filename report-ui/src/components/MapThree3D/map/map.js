import {
  Fog,
  Group,
  MeshBasicMaterial,
  DirectionalLight,
  DirectionalLightHelper,
  AmbientLight,
  PointLight,
  Vector3,
  PointLightHelper,
  LineBasicMaterial,
  Color,
  MeshStandardMaterial,
  PlaneGeometry,
  PointsMaterial,
  Mesh,
  DoubleSide,
  RepeatWrapping,
  SRGBColorSpace,
  AdditiveBlending,
  NearestFilter,
  BoxGeometry,
  SpriteMaterial,
  Sprite,
  TextureLoader,
  MOUSE,
  BufferGeometry,
  Line
} from 'three'

import {
  Mini3d,
  // Debug,
  Particles,
  // FlyLine,
  PathLine,
  Label3d,
  ToastLoading,
  Plane,
  GradientShader,
  getBoundBox,
  createHistory,
  emptyObject,
  ExtrudeMap,
  DiffuseShader
} from '../mini3d'
import { Assets } from './assets'
import { InteractionManager } from 'three.interactive'
import { ChildMap } from './map-china-child'
// import provincesData from './provincesData'
import gsap from 'gsap'

// 排序
function sortByValue(data) {
  data.sort((a, b) => b.value - a.value)
  return data
}

export class World extends Mini3d {
  constructor(canvas, config) {
    super(canvas, config)
    this.dataset = config.dataset
    this.layers = Array.isArray(config.layers) ? config.layers : []
    this._layerDataset = config.dataset
    this._onMapReadyCallback = null // 地图就绪持久回调
    this.defaultMainMapBoxSize = [129.00074005126953, 126.23402404785156]
    const rawProvinceNameOffset = Array.isArray(config?.provinceNameOffset) ? config.provinceNameOffset : [0, 0]
    const ox =
      typeof rawProvinceNameOffset[0] === 'number' ? rawProvinceNameOffset[0] : Number(rawProvinceNameOffset[0])
    const oy =
      typeof rawProvinceNameOffset[1] === 'number' ? rawProvinceNameOffset[1] : Number(rawProvinceNameOffset[1])
    this.provinceNameOffset = [isFinite(ox) ? ox : 0, isFinite(oy) ? oy : 0]

    const center =
      Array.isArray(config?.geoProjectionCenter) && config.geoProjectionCenter.length >= 2
        ? config.geoProjectionCenter
        : Array.isArray(config?.pointCenter) && config.pointCenter.length >= 2
        ? config.pointCenter
        : [108.55, 34.32]

    this.pointCenter = center
    this.config.geoProjectionCenter = center

    this.mapSource = config?.mapSource || ''
    this.adcode = config.mapCode
    this.strokeMapSource = config?.strokeMapSource || ''

    this.flyLineCenter = [116.41995, 40.18994]

    const rawDepth = typeof config?.depth === 'number' ? config.depth : Number(config?.depth)
    const normalizedDepth = isFinite(rawDepth) ? rawDepth : 5
    this.depth = Math.min(50, Math.max(0, normalizedDepth))

    const drill = config?.drill || {}
    const rawLevel = typeof drill.drillLevel === 'number' ? drill.drillLevel : 2
    const clampedLevel = Math.min(2, Math.max(0, Math.floor(rawLevel)))

    this.drill = {
      isDrill: drill.isDrill === undefined ? true : !!drill.isDrill,
      drillLevel: clampedLevel
    }
    this.provinceLineColor = config?.style?.provinceLineColor || '#2bc4dc'
    this.provinceLineWidth = typeof config?.style?.provinceLineWidth === 'number' ? config.style.provinceLineWidth : 1

    const rawProvinceTopColor = config?.style?.provinceTopColor
    const nextProvinceTopColor =
      typeof rawProvinceTopColor === 'string'
        ? rawProvinceTopColor
        : rawProvinceTopColor == null
        ? '#061e47'
        : String(rawProvinceTopColor)
    this.provinceTopColor =
      nextProvinceTopColor && nextProvinceTopColor.startsWith('#') && nextProvinceTopColor.length === 9
        ? nextProvinceTopColor.slice(0, 7)
        : nextProvinceTopColor || '#061e47'

    const rawProvinceTopTexture = config?.style?.provinceTopTexture
    this.provinceTopTexture =
      typeof rawProvinceTopTexture === 'string'
        ? rawProvinceTopTexture
        : rawProvinceTopTexture == null
        ? ''
        : String(rawProvinceTopTexture)
    this._customProvinceTopMap = null

    const rawProvinceSideColor = config?.style?.provinceSideColor
    const nextProvinceSideColor =
      typeof rawProvinceSideColor === 'string'
        ? rawProvinceSideColor
        : rawProvinceSideColor == null
        ? '#ffffff'
        : String(rawProvinceSideColor)
    this.provinceSideColor =
      nextProvinceSideColor && nextProvinceSideColor.startsWith('#') && nextProvinceSideColor.length === 9
        ? nextProvinceSideColor.slice(0, 7)
        : nextProvinceSideColor || '#ffffff'

    const rawProvinceSideTexture = config?.style?.provinceSideTexture
    this.provinceSideTexture =
      typeof rawProvinceSideTexture === 'string'
        ? rawProvinceSideTexture
        : rawProvinceSideTexture == null
        ? ''
        : String(rawProvinceSideTexture)
    this._customProvinceSideMap = null

    const rawHoverEmissiveColor = config?.style?.hoverEmissiveColor
    const nextHoverEmissiveColor =
      typeof rawHoverEmissiveColor === 'string'
        ? rawHoverEmissiveColor
        : rawHoverEmissiveColor == null
        ? '#0b112d'
        : String(rawHoverEmissiveColor)
    this.hoverEmissiveColor =
      nextHoverEmissiveColor && nextHoverEmissiveColor.startsWith('#') && nextHoverEmissiveColor.length === 9
        ? nextHoverEmissiveColor.slice(0, 7)
        : nextHoverEmissiveColor || '#0b112d'

    this.hoveredMapAreas = new Set()

    const rawHoverEmissiveIntensity =
      typeof config?.style?.hoverEmissiveIntensity === 'number'
        ? config.style.hoverEmissiveIntensity
        : Number(config?.style?.hoverEmissiveIntensity)
    const normalizedHoverEmissiveIntensity = isFinite(rawHoverEmissiveIntensity) ? rawHoverEmissiveIntensity : 1.5
    this.hoverEmissiveIntensity = Math.min(10, Math.max(0, normalizedHoverEmissiveIntensity))

    const rawHoverLiftScale =
      typeof config?.style?.hoverLiftScale === 'number'
        ? config.style.hoverLiftScale
        : Number(config?.style?.hoverLiftScale)
    const normalizedHoverLiftScale = isFinite(rawHoverLiftScale) ? rawHoverLiftScale : 1.5
    this.hoverLiftScale = Math.min(3, Math.max(1, normalizedHoverLiftScale))

    this.enterCameraAnimationEnabled =
      config?.animation?.enterCamera === undefined ? true : !!config.animation.enterCamera
    this.enterCameraDelay = typeof config?.animation?.enterCameraDelay === 'number' ? config.animation.enterCameraDelay : 2
    this.enterCameraDuration = typeof config?.animation?.enterCameraDuration === 'number' ? config.animation.enterCameraDuration : 2.5
    this.enterTimeScale = typeof config?.animation?.enterTimeScale === 'number' ? config.animation.enterTimeScale : 1
    this.strokeVisible = config?.animation?.strokeVisible !== undefined ? !!config.animation.strokeVisible : false

    const rawStrokeSpeed =
      typeof config?.animation?.strokeSpeed === 'number'
        ? config.animation.strokeSpeed
        : Number(config?.animation?.strokeSpeed)
    const normalizedStrokeSpeed = isFinite(rawStrokeSpeed) ? rawStrokeSpeed : 0.2
    this.strokeSpeed = Math.min(1, Math.max(0, normalizedStrokeSpeed))

    const rawStrokeWidth =
      typeof config?.animation?.strokeWidth === 'number'
        ? config.animation.strokeWidth
        : Number(config?.animation?.strokeWidth)
    const normalizedStrokeWidth = isFinite(rawStrokeWidth) ? rawStrokeWidth : 0.2
    this.strokeWidth = Math.min(1, Math.max(0.01, normalizedStrokeWidth))

    this.strokeColor = config?.style?.strokeColor || '#2bc4dc'
    this.viewControls = config?.controls
    this.rotateBorderVisible =
      config?.effect?.rotateBorderVisible === undefined ? true : !!config.effect.rotateBorderVisible
    this.rotateBorderIntroPlayed = false
    this.floorVisible = config?.effect?.floorVisible === undefined ? true : !!config.effect.floorVisible
    this.gridRippleVisible = config?.effect?.gridRippleVisible === undefined ? true : !!config.effect.gridRippleVisible
    this.gridRippleDiffuseEnabled =
      config?.effect?.gridRippleDiffuseEnabled === undefined ? true : !!config.effect.gridRippleDiffuseEnabled
    this.gridRippleColor = config?.effect?.gridRippleColor || '#00ffff'
    this.particlesVisible = config?.effect?.particlesVisible === undefined ? true : !!config.effect.particlesVisible
    this.particlesColor = config?.effect?.particlesColor || '#00eeee'
    this.floorColor = config?.effect?.floorColor || '#ffffff'
    this.rotateBorderColor = config?.effect?.rotateBorderColor || '#48afff'
    const rawRotateBorderOuterOpacity =
      typeof config?.effect?.rotateBorderOuterOpacity === 'number'
        ? config.effect.rotateBorderOuterOpacity
        : Number(config?.effect?.rotateBorderOuterOpacity)
    const normalizedRotateBorderOuterOpacity = isFinite(rawRotateBorderOuterOpacity) ? rawRotateBorderOuterOpacity : 0.2
    this.rotateBorderOuterOpacity = Math.min(1, Math.max(0, normalizedRotateBorderOuterOpacity))

    const rawRotateBorderOuterSpeed =
      typeof config?.effect?.rotateBorderOuterSpeed === 'number'
        ? config.effect.rotateBorderOuterSpeed
        : Number(config?.effect?.rotateBorderOuterSpeed)
    const normalizedRotateBorderOuterSpeed = isFinite(rawRotateBorderOuterSpeed) ? rawRotateBorderOuterSpeed : 0.001
    this.rotateBorderOuterSpeed = Math.min(0.02, Math.max(-0.02, normalizedRotateBorderOuterSpeed))

    const rawRotateBorderInnerOpacity =
      typeof config?.effect?.rotateBorderInnerOpacity === 'number'
        ? config.effect.rotateBorderInnerOpacity
        : Number(config?.effect?.rotateBorderInnerOpacity)
    const normalizedRotateBorderInnerOpacity = isFinite(rawRotateBorderInnerOpacity) ? rawRotateBorderInnerOpacity : 0.4
    this.rotateBorderInnerOpacity = Math.min(1, Math.max(0, normalizedRotateBorderInnerOpacity))

    const rawRotateBorderInnerSpeed =
      typeof config?.effect?.rotateBorderInnerSpeed === 'number'
        ? config.effect.rotateBorderInnerSpeed
        : Number(config?.effect?.rotateBorderInnerSpeed)
    const normalizedRotateBorderInnerSpeed = isFinite(rawRotateBorderInnerSpeed) ? rawRotateBorderInnerSpeed : -0.004
    this.rotateBorderInnerSpeed = Math.min(0.02, Math.max(-0.02, normalizedRotateBorderInnerSpeed))

    const camPos = config?.camera?.cameraPosition
    const camTarget = config?.camera?.cameraLookAt

    this.cameraPosition = {
      x: camPos && isFinite(camPos.x) ? camPos.x : 3.134497983573052,
      y: camPos && isFinite(camPos.y) ? camPos.y : 126.8312346165316,
      z: camPos && isFinite(camPos.z) ? camPos.z : 78.77649752477839
    }
    this.cameraLookAt = {
      x: camTarget && isFinite(camTarget.x) ? camTarget.x : 0,
      y: camTarget && isFinite(camTarget.y) ? camTarget.y : 0,
      z: camTarget && isFinite(camTarget.z) ? camTarget.z : 0
    }

    this.fogEnabled = config?.environment?.fogEnabled === undefined ? true : !!config.environment.fogEnabled
    const rawFogColor = config?.environment?.fogColor
    const nextFogColor =
      typeof rawFogColor === 'string' ? rawFogColor : rawFogColor == null ? '#011024' : String(rawFogColor)
    this.fogColor =
      nextFogColor && nextFogColor.startsWith('#') && nextFogColor.length === 9
        ? nextFogColor.slice(0, 7)
        : nextFogColor || '#011024'

    const rawFogFar =
      typeof config?.environment?.fogFar === 'number' ? config.environment.fogFar : Number(config?.environment?.fogFar)
    const normalizedFogFar = isFinite(rawFogFar) ? rawFogFar : 500

    const rawFogNear =
      typeof config?.environment?.fogNear === 'number'
        ? config.environment.fogNear
        : Number(config?.environment?.fogNear)
    const normalizedFogNear = isFinite(rawFogNear) ? rawFogNear : 1

    const near0 = Math.max(0, normalizedFogNear)
    const far0 = Math.max(0, normalizedFogFar)
    const far = far0 > near0 ? far0 : near0 + 1

    this.fogFar = far
    this.fogNear = Math.min(this.fogFar - 1e-6, near0)
    this.applyFog()

    const rawAmbient =
      typeof config?.environment?.ambientLightIntensity === 'number'
        ? config.environment.ambientLightIntensity
        : Number(config?.environment?.ambientLightIntensity)
    const normalizedAmbient = isFinite(rawAmbient) ? rawAmbient : 2
    this.ambientLightIntensity = Math.min(10, Math.max(0, normalizedAmbient))

    const rawAmbientColor = config?.environment?.ambientLightColor
    const nextAmbientColor =
      typeof rawAmbientColor === 'string'
        ? rawAmbientColor
        : rawAmbientColor == null
        ? '#ffffff'
        : String(rawAmbientColor)
    this.ambientLightColor =
      nextAmbientColor && nextAmbientColor.startsWith('#') && nextAmbientColor.length === 9
        ? nextAmbientColor.slice(0, 7)
        : nextAmbientColor || '#ffffff'

    const rawDirectional =
      typeof config?.environment?.directionalLightIntensity === 'number'
        ? config.environment.directionalLightIntensity
        : Number(config?.environment?.directionalLightIntensity)
    const normalizedDirectional = isFinite(rawDirectional) ? rawDirectional : 4
    this.directionalLightIntensity = Math.min(20, Math.max(0, normalizedDirectional))

    const rawDirectionalColor = config?.environment?.directionalLightColor
    const nextDirectionalColor =
      typeof rawDirectionalColor === 'string'
        ? rawDirectionalColor
        : rawDirectionalColor == null
        ? '#ffffff'
        : String(rawDirectionalColor)
    this.directionalLightColor =
      nextDirectionalColor && nextDirectionalColor.startsWith('#') && nextDirectionalColor.length === 9
        ? nextDirectionalColor.slice(0, 7)
        : nextDirectionalColor || '#ffffff'

    this.camera.instance.position.set(0.00002366776247217723, 225.1025284992283, 0.0002238648924037432)
    this.camera.instance.near = 1
    this.camera.instance.far = 10000
    this.camera.instance.updateProjectionMatrix()

    this.setViewControls(this.viewControls)

    // 交互管理器
    this.interactionManager = new InteractionManager(this.renderer.instance, this.camera.instance, this.canvas)
    this.initSetting()
    this.initEnvironment()
    this.toastLoading = new ToastLoading()
    this.history = new createHistory()
    this.history.push({ name: '中国' })

    const container = this.canvas && this.canvas.parentNode ? this.canvas.parentNode : null
    this.returnBtn =
      config?.dom?.returnBtn ||
      (container && typeof container.querySelector === 'function' ? container.querySelector('.return-btn') : null) ||
      document.querySelector('.return-btn')
    this.clicked = false // 是否已经点击
    this.currentScene = 'mainScene' // 当前场景 mainScene | childScene
    this.assets = new Assets(() => {
      // 场景组
      this.sceneGroup = new Group()
      this.mainSceneGroup = new Group()
      this.childSceneGroup = new Group()
      this.labelGroup = new Group()
      this.provinceNameGroup = new Group()
      const rawBaseLabelNameScale =
        typeof config?.baseLabelNameScale === 'number' ? config.baseLabelNameScale : Number(config?.baseLabelNameScale)
      const normalizedBaseLabelNameScale = isFinite(rawBaseLabelNameScale) ? rawBaseLabelNameScale : 0.1
      this.baseLabelNameScale = Math.min(0.3, Math.max(0.02, normalizedBaseLabelNameScale))
      this.areaPointGroup = new Group()
      this.basePointScale = 5 //区域标点缩放
      this.provinceNameGroup.visible = config.label.areaName
      this.labelGroup.visible = config.label.dataLabel
      this.areaPointGroup.visible = config.label.areaPoint

      this.label3d = new Label3d(this)
      this.mainSceneGroup.rotateX(-Math.PI / 2)

      this.mainMapRoot = new Group()
      this.mainMapRoot.name = 'mainMapRoot'
      this.mainMapRoot.add(this.labelGroup, this.provinceNameGroup, this.areaPointGroup)

      this.mainSceneGroup.add(this.mainMapRoot)

      this.sceneGroup.add(this.mainSceneGroup, this.childSceneGroup)
      this.scene.add(this.sceneGroup)

      // 创建底图
      this.createFloor()
      this.setFloorVisible(this.floorVisible)
      this.setFloorColor(this.floorColor)
      // 旋转边框
      this.createRotateBorder()
      this.setRotateBorderVisible(this.rotateBorderVisible)
      // 处理地图
      this.createModel()
      // 添加事件
      this.addEvent()
      // 创建柱状图
      this.createBar()

      // 创建图层
      this._rebuildLayers()

      // 创建粒子

      // 创建描边动画
      if (this.strokeVisible) {
        this.createStorke()
      }

      // 创建时间线
      let tl = gsap.timeline()

      // 动画关闭时直接设置最终状态并立即就绪
      if (!this.enterCameraAnimationEnabled) {
        this.camera.instance.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z)
        this.camera.instance.updateProjectionMatrix()
        this.camera.controls.target.set(this.cameraLookAt.x, this.cameraLookAt.y, this.cameraLookAt.z)
        this.camera.controls.update()
        this.camera.controls.saveState()

        this.focusMapGroup.position.set(0, 0, 0)
        this.focusMapGroup.scale.set(1, 1, 1)

        this.provinceMesh.mapGroup.traverse(obj => {
          if (obj.isMesh) {
            if (obj.material[0]) obj.material[0].opacity = 0.65
            obj.position.set(0, 0, 0)
          }
        })
        if (this.focusMapSideMaterial) this.focusMapSideMaterial.opacity = 0.65
        if (this.provinceLineMaterial) this.provinceLineMaterial.opacity = 0.85
        if (this.rotateBorder1) this.rotateBorder1.scale.set(1, 1, 1)
        if (this.rotateBorder2) this.rotateBorder2.scale.set(1, 1, 1)
        this.rotateBorderIntroPlayed = true

        this.setParticlesVisible(this.particlesVisible)
        if (this.gridRippleVisible) this.createGridRipple()

        this.allAreaPoint.forEach(item => { item.material.opacity = 1 })
        this.allProvinceNameLabel.forEach(item => {
          const el = item.element?.querySelector?.('.provinces-name-label-wrap')
          if (el) { el.style.opacity = 1; el.style.transform = '' }
        })
        this.allProvinceDataLabel.forEach(item => {
          const el = item.element?.querySelector?.('.provinces-label-style02-wrap')
          if (el) { el.style.opacity = 1; el.style.transform = '' }
        })

        if (typeof this._onMapReadyCallback === 'function') { this._onMapReadyCallback() }
        return
      }

      // 相机动画
      tl.timeScale(this.enterTimeScale || 1)
      tl.addLabel('focusMap', 3.5)
      tl.addLabel('focusMapOpacity', 4.0)
      tl.addLabel('bar', 5.0)

      if (this.enterCameraAnimationEnabled) {
        tl.add(
          gsap.to(this.camera.instance.position, {
            duration: this.enterCameraDuration,
            delay: this.enterCameraDelay,
            x: this.cameraPosition.x,
            y: this.cameraPosition.y,
            z: this.cameraPosition.z,
            ease: 'circ.out'
          })
        )
      } else {
        this.camera.instance.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z)
        this.camera.instance.updateProjectionMatrix()
      }

      if (this.enterCameraAnimationEnabled) {
        tl.add(
          gsap.to(this.camera.controls.target, {
            duration: this.enterCameraDuration,
            delay: this.enterCameraDelay,
            x: this.cameraLookAt.x,
            y: this.cameraLookAt.y,
            z: this.cameraLookAt.z,
            ease: 'circ.out',
            onUpdate: () => {
              this.camera.controls.update()
            },
            onComplete: () => {
              this.camera.controls.saveState()
            }
          }),
          0
        )
      } else {
        this.camera.controls.target.set(this.cameraLookAt.x, this.cameraLookAt.y, this.cameraLookAt.z)
        this.camera.controls.update()
        this.camera.controls.saveState()
      }

      if (this.enterCameraAnimationEnabled && this.quan?.rotation) {
        this.floorRotateTween = gsap.to(this.quan.rotation, {
          duration: 5,
          z: -2 * Math.PI
        })
        tl.add(this.floorRotateTween, '-=2')
      }

      tl.add(
        gsap.to(this.focusMapGroup.position, {
          duration: 1,
          x: 0,
          y: 0,
          z: 0
        }),
        'focusMap'
      )
      tl.add(
        gsap.to(this.focusMapGroup.scale, {
          duration: 1,
          x: 1,
          y: 1,
          z: 1,
          ease: 'circ.out'
        }),
        'focusMap'
      )

      this.provinceMesh.mapGroup.traverse(obj => {
        if (obj.isMesh) {
          tl.add(
            gsap.to(obj.material[0], {
              duration: 1,
              opacity: 0.65,
              ease: 'circ.out'
            }),
            'focusMapOpacity'
          )
          tl.add(
            gsap.to(obj.position, {
              duration: 1,
              x: 0,
              y: 0,
              z: 0,
              ease: 'circ.out'
            }),
            'focusMapOpacity'
          )
        }
      })
      tl.add(
        gsap.to(this.focusMapSideMaterial, {
          duration: 1,
          opacity: 0.65,
          ease: 'circ.out',
          onComplete: () => {
            this.setParticlesVisible(this.particlesVisible)
            // this.createMirror()
            if (this.gridRippleVisible) {
              this.createGridRipple()
            }
          }
        }),
        'focusMapOpacity'
      )

      tl.add(
        gsap.to(this.provinceLineMaterial, {
          duration: 0.5,
          delay: 0.3,
          opacity: 0.85
        }),
        'focusMapOpacity'
      )

      tl.add(
        gsap.to(this.rotateBorder1.scale, {
          delay: 0.3,
          duration: 1,
          x: 1,
          y: 1,
          z: 1,
          ease: 'circ.out'
        }),
        'focusMapOpacity'
      )
      tl.add(
        gsap.to(this.rotateBorder2.scale, {
          duration: 1,
          delay: 0.5,
          x: 1,
          y: 1,
          z: 1,
          ease: 'circ.out',
          onComplete: () => {
            this.rotateBorderIntroPlayed = true
          }
        }),
        'focusMapOpacity'
      )
      // this.allBar.map((item, index) => {
      //   tl.add(
      //     gsap.to(item.scale, {
      //       duration: 1,
      //       delay: 0.05 * index,
      //       x: 1,
      //       y: 1,
      //       z: 1,
      //       ease: 'circ.out'
      //     }),
      //     'bar'
      //   )
      // })
      // this.allBarMaterial.map((item, index) => {
      //   tl.add(
      //     gsap.to(item, {
      //       duration: 0.5,
      //       delay: 0.05 * index,
      //       opacity: 1,
      //       ease: 'circ.out'
      //     }),
      //     'bar'
      //   )
      // })
      this.allProvinceDataLabel.map((item, index) => {
        let element = item.element.querySelector('.provinces-label-style02-wrap')
        let number = item.element.querySelector('.number .value')
        let numberVal = Number(number.innerText)
        let numberAnimate = {
          score: 0
        }
        tl.add(
          gsap.to(element, {
            duration: 0.5,
            delay: 0.05 * index,
            translateY: 0,
            opacity: 1,
            ease: 'circ.out'
          }),
          'bar'
        )
        let text = gsap.to(numberAnimate, {
          duration: 0.5,
          delay: 0.05 * index,
          score: numberVal,
          onUpdate: showScore
        })
        function showScore() {
          number.innerText = numberAnimate.score.toFixed(0)
        }
        tl.add(text, 'bar')
      })
      this.allProvinceNameLabel.map((item, index) => {
        let element = item.element.querySelector('.provinces-name-label-wrap')

        tl.add(
          gsap.to(element, {
            duration: 0.5,
            delay: 0.05 * index,
            translateY: 0,
            opacity: 1,
            ease: 'circ.out'
          }),
          'bar'
        )
      })

      this.allAreaPoint.map((item, index) => {
        tl.add(
          gsap.to(item.material, {
            duration: 0.5,
            delay: 0.002 * index,
            opacity: 1,
            ease: 'circ.out'
          }),
          'bar'
        )
      })

      // 动画全部结束后触发就绪回调
      tl.then(() => {
        if (typeof this._onMapReadyCallback === 'function') { this._onMapReadyCallback() }
      })
      // this.allGuangquan.map((item, index) => {
      //   tl.add(
      //     gsap.to(item.children[0].scale, {
      //       duration: 0.5,
      //       delay: 0.05 * index,
      //       x: 1,
      //       y: 1,
      //       z: 1,
      //       ease: 'circ.out'
      //     }),
      //     'bar'
      //   )
      //   tl.add(
      //     gsap.to(item.children[1].scale, {
      //       duration: 0.5,
      //       delay: 0.05 * index,
      //       x: 1,
      //       y: 1,
      //       z: 1,
      //       ease: 'circ.out'
      //     }),
      //     'bar'
      //   )
      // })
    })
  }

  /**
   * 设置css3d标签的隐藏显示
   * @param {*} labelGroup
   * @param {*} bool
   */
  setLabelVisible(labelGroup = 'labelGroup', bool) {
    this[labelGroup].visible = bool
    this[labelGroup].children.map(label => {
      bool ? label.show() : label.hide()
    })
  }

  /**
   * 设置点显隐
   */
  setSpritVisible(spritGroup, bool) {
    this[spritGroup].visible = bool
    this[spritGroup].children.map(label => {
      label.visible = bool
    })
  }

  setRotateBorderVisible(visible) {
    const next = !!visible
    this.rotateBorderVisible = next

    const shouldRestoreScale = next && this.rotateBorderIntroPlayed

    if (this.rotateBorder1) {
      this.rotateBorder1.visible = next
      if (!next) {
        this.rotateBorder1.scale.set(0, 0, 0)
      } else if (
        shouldRestoreScale &&
        this.rotateBorder1.scale.x === 0 &&
        this.rotateBorder1.scale.y === 0 &&
        this.rotateBorder1.scale.z === 0
      ) {
        this.rotateBorder1.scale.set(1, 1, 1)
      }
    }

    if (this.rotateBorder2) {
      this.rotateBorder2.visible = next
      if (!next) {
        this.rotateBorder2.scale.set(0, 0, 0)
      } else if (
        shouldRestoreScale &&
        this.rotateBorder2.scale.x === 0 &&
        this.rotateBorder2.scale.y === 0 &&
        this.rotateBorder2.scale.z === 0
      ) {
        this.rotateBorder2.scale.set(1, 1, 1)
      }
    }
  }

  setRotateBorderColor(color) {
    const next = typeof color === 'string' ? color : color == null ? '' : String(color)
    if (!next) return

    this.rotateBorderColor = next

    if (this.rotateBorder1?.material?.color?.set) {
      this.rotateBorder1.material.color.set(next)
    }
    if (this.rotateBorder2?.material?.color?.set) {
      this.rotateBorder2.material.color.set(next)
    }
  }

  setRotateBorderOuterOpacity(opacity) {
    const raw = typeof opacity === 'number' ? opacity : Number(opacity)
    if (!isFinite(raw)) return

    const next = Math.min(1, Math.max(0, raw))
    this.rotateBorderOuterOpacity = next

    if (this.rotateBorder1?.material) {
      this.rotateBorder1.material.opacity = next
      this.rotateBorder1.material.transparent = true
      this.rotateBorder1.material.needsUpdate = true
    }
  }

  setRotateBorderOuterSpeed(speed) {
    const raw = typeof speed === 'number' ? speed : Number(speed)
    if (!isFinite(raw)) return

    const next = Math.min(0.02, Math.max(-0.02, raw))
    this.rotateBorderOuterSpeed = next

    if (this.rotateBorderOuterPlane?.options) {
      this.rotateBorderOuterPlane.options.rotateSpeed = next
    }
  }

  setRotateBorderInnerOpacity(opacity) {
    const raw = typeof opacity === 'number' ? opacity : Number(opacity)
    if (!isFinite(raw)) return

    const next = Math.min(1, Math.max(0, raw))
    this.rotateBorderInnerOpacity = next

    if (this.rotateBorder2?.material) {
      this.rotateBorder2.material.opacity = next
      this.rotateBorder2.material.transparent = true
      this.rotateBorder2.material.needsUpdate = true
    }
  }

  setRotateBorderInnerSpeed(speed) {
    const raw = typeof speed === 'number' ? speed : Number(speed)
    if (!isFinite(raw)) return

    const next = Math.min(0.02, Math.max(-0.02, raw))
    this.rotateBorderInnerSpeed = next

    if (this.rotateBorderInnerPlane?.options) {
      this.rotateBorderInnerPlane.options.rotateSpeed = next
    }
  }

  setFloorVisible(visible) {
    const next = !!visible
    this.floorVisible = next
    if (this.floorMesh) this.floorMesh.visible = next
    if (this.quan) this.quan.visible = next
  }

  setFloorColor(color) {
    const next = typeof color === 'string' ? color : color == null ? '' : String(color)
    if (!next) return

    this.floorColor = next

    if (this.floorMesh?.material?.color?.set) {
      this.floorMesh.material.color.set(next)
    }
    if (this.quan?.material?.color?.set) {
      this.quan.material.color.set(next)
    }
  }

  setGridRippleVisible(visible) {
    const next = !!visible
    this.gridRippleVisible = next

    if (next && !this.gridRippleGroup && this.assets?.instance) {
      this.createGridRipple()
    }

    if (this.gridRippleGroup) {
      this.gridRippleGroup.visible = next
    }
  }

  setGridRippleDiffuseEnabled(enabled) {
    const next = !!enabled
    this.gridRippleDiffuseEnabled = next

    if (this.gridRippleDiffuseShader?.setEnabled) {
      this.gridRippleDiffuseShader.setEnabled(next)
    }
  }

  setParticlesVisible(visible) {
    const next = !!visible
    this.particlesVisible = next

    if (next && !this.particles) {
      this.createParticles()
    }

    if (this.particles) {
      this.particles.enable = next
      if (this.particles.instance) {
        this.particles.instance.visible = next
      }
    }
  }

  setParticlesColor(color) {
    const next = typeof color === 'string' ? color : color == null ? '' : String(color)
    if (!next) return

    this.particlesColor = next

    const material = this.particles?.instance?.material
    if (material?.color?.set) {
      material.color.set(next)
    }

    const geometry = this.particles?.instance?.geometry
    const colors = geometry?.getAttribute?.('color')
    const baseColor = material?.color

    if (colors && baseColor?.getHSL) {
      let hsl = {}
      baseColor.getHSL(hsl)
      for (let i = 0; i < colors.count; i++) {
        const l = hsl.l * Math.random()
        const tmp = baseColor.clone()
        tmp.setHSL(hsl.h, hsl.s, l)
        colors.setXYZ(i, tmp.r, tmp.g, tmp.b)
      }
      colors.needsUpdate = true
    }
  }

  setGridRippleColor(color) {
    const next = typeof color === 'string' ? color : color == null ? '' : String(color)
    if (!next) return

    this.gridRippleColor = next

    if (this.gridRippleMaterialPrimary?.color?.set) {
      this.gridRippleMaterialPrimary.color.set(next)
    }
    if (this.gridRippleMaterialSecondary?.color?.set) {
      this.gridRippleMaterialSecondary.color.set(next)
    }

    const shader = this.gridRippleDiffuseShader?.shader
    if (shader?.uniforms?.uColor?.value?.set) {
      shader.uniforms.uColor.value.set(next)
    }
  }

  // 隐藏显示主地图及标签
  setMainMapVisible(bool) {
    this.scene.getObjectByName('chinaMapGroup').visible = bool
    this.mainSceneGroup.visible = bool
  }

  /**
   * 设置区域名称缩放
   * @param {Number} value
   */
  applyFog() {
    const enabled = this.fogEnabled !== false
    if (!enabled) {
      this.scene.fog = null
      return
    }

    const fog = this.scene.fog
    if (fog && fog.isFog) {
      if (fog.color?.set) fog.color.set(this.fogColor)
      fog.near = this.fogNear
      fog.far = this.fogFar
      return
    }

    this.scene.fog = new Fog(this.fogColor, this.fogNear, this.fogFar)
  }

  setFogEnabled(enabled) {
    this.fogEnabled = enabled === undefined ? true : !!enabled
    this.applyFog()
  }

  setFogColor(color) {
    const next = typeof color === 'string' ? color : color == null ? '' : String(color)
    this.fogColor = next && next.startsWith('#') && next.length === 9 ? next.slice(0, 7) : next || '#011024'
    this.applyFog()
  }

  setFogNear(near) {
    const next = typeof near === 'number' ? near : Number(near)
    const normalized = isFinite(next) ? next : this.fogNear
    const far = typeof this.fogFar === 'number' && isFinite(this.fogFar) ? this.fogFar : 500
    this.fogNear = Math.min(far - 1e-6, Math.max(0, normalized))
    this.applyFog()
  }

  setFogFar(far) {
    const next = typeof far === 'number' ? far : Number(far)
    const normalized = isFinite(next) ? next : this.fogFar
    const near = typeof this.fogNear === 'number' && isFinite(this.fogNear) ? this.fogNear : 1

    this.fogFar = Math.max(near + 1e-6, normalized)
    if (this.fogNear >= this.fogFar) {
      this.fogNear = Math.min(this.fogFar - 1e-6, this.fogNear)
    }

    this.applyFog()
  }

  setAmbientLightIntensity(intensity) {
    const next = typeof intensity === 'number' ? intensity : Number(intensity)
    const normalized = isFinite(next) ? next : this.ambientLightIntensity
    this.ambientLightIntensity = Math.min(10, Math.max(0, normalized))

    if (this.ambientLight) {
      this.ambientLight.intensity = this.ambientLightIntensity
    }
  }

  setAmbientLightColor(color) {
    const next = typeof color === 'string' ? color : color == null ? '' : String(color)
    this.ambientLightColor = next && next.startsWith('#') && next.length === 9 ? next.slice(0, 7) : next || '#ffffff'

    if (this.ambientLight?.color?.set) {
      this.ambientLight.color.set(this.ambientLightColor)
    }
  }

  setDirectionalLightIntensity(intensity) {
    const next = typeof intensity === 'number' ? intensity : Number(intensity)
    const normalized = isFinite(next) ? next : this.directionalLightIntensity
    this.directionalLightIntensity = Math.min(20, Math.max(0, normalized))

    if (this.directionalLight) {
      this.directionalLight.intensity = this.directionalLightIntensity
    }
  }

  setDirectionalLightColor(color) {
    const next = typeof color === 'string' ? color : color == null ? '' : String(color)
    this.directionalLightColor =
      next && next.startsWith('#') && next.length === 9 ? next.slice(0, 7) : next || '#ffffff'

    if (this.directionalLight?.color?.set) {
      this.directionalLight.color.set(this.directionalLightColor)
    }
  }

  setBaseLabelNameScale(value) {
    const next = typeof value === 'number' ? value : Number(value)
    const normalized = isFinite(next) ? next : this.baseLabelNameScale
    this.baseLabelNameScale = Math.min(0.3, Math.max(0.02, normalized))

    if (this.provinceNameGroup && this.allProvinceNameLabel?.length) {
      this.setNameScale()
    }
  }

  /**
   * 设置区域名称颜色
   * @param {String} color  区域名称颜色
   */
  setBaseLabelNameColor(color) {
    const next = typeof color === 'string' ? color : String(color || this.baseLabelNameColor || '#5fc6dc')
    this.baseLabelNameColor = next || '#5fc6dc'

    if (this.allProvinceNameLabel?.length) {
      this.allProvinceNameLabel.forEach(label => {
        const wrap = label.element?.querySelector?.('.provinces-name-label-wrap')
        if (wrap) wrap.style.color = this.baseLabelNameColor
      })
    }
  }

  setBaseLabelNameFontFamily(fontFamily) {
    const next = typeof fontFamily === 'string' ? fontFamily : String(fontFamily || '')
    this.baseLabelNameFontFamily = next

    if (this.allProvinceNameLabel?.length) {
      this.allProvinceNameLabel.forEach(label => {
        const wrap = label.element?.querySelector?.('.provinces-name-label-wrap')
        if (wrap) wrap.style.removeProperty('font-family')
      })
    }

    if (this.childMap?.setAreaNameFontFamily) {
      this.childMap.setAreaNameFontFamily(next)
    }
  }

  setProvinceNameOffset(offset) {
    const arr = Array.isArray(offset) ? offset : [0, 0]
    const ox = typeof arr[0] === 'number' ? arr[0] : Number(arr[0])
    const oy = typeof arr[1] === 'number' ? arr[1] : Number(arr[1])
    const prev = Array.isArray(this.provinceNameOffset) ? this.provinceNameOffset : [0, 0]
    this.provinceNameOffset = [isFinite(ox) ? ox : prev[0] || 0, isFinite(oy) ? oy : prev[1] || 0]

    if (this.provinceNameGroup && this.allProvinceNameLabel?.length) {
      this.setNameScale()
    }

    if (this.childMap?.setProvinceNameOffset) {
      this.childMap.setProvinceNameOffset(this.provinceNameOffset)
    }
  }

  /**
   * 创建区域名称、点标签
   * @param {Array} areaList  区域数据
   */
  createMainAreaNameLabels(areaList = []) {
    let self = this
    //区域点
    const texture = this.assets.instance.getResource('point')
    const material = new SpriteMaterial({
      map: texture,
      color: 0xffffff,
      transparent: true,
      depthTest: false
    })
    this.pointDefaultMaterial = material
    this.pointHoverMaterial = material.clone()
    this.pointHoverMaterial.color = new Color(0x00ffff)
    const sprite = new Sprite(material)
    sprite.renderOrder = 23

    this.allAreaPoint = []
    this.allProvinceNameLabel = []

    const scale = this.scale || 1

    areaList.forEach((item, index) => {
      const geo = item?.centroid || item?.center
      if (!Array.isArray(geo) || geo.length < 2) return
      const [x, y] = this.geoProjection(geo)

      const nameLabel = labelNameStyle(item, index, new Vector3(x, -y - 1.5 / scale, this.depth + 0.4))
      areaPoint(item, index, new Vector3(x, -y, this.depth + 0.9))

      this.allProvinceNameLabel.push(nameLabel)
    })

    this.setPointScale()
    this.setNameScale()
    // 省份城市名称
    function labelNameStyle(data, index, position) {
      let label = self.label3d.create('', 'provinces-name-label', true)
      label.init(
        `<div class="provinces-name-label"><div class="provinces-name-label-wrap" >${data.name}</div></div>`,
        position
      )
      self.label3d.setLabelStyle(label, 0.08, 'x')
      label.setParent(self.provinceNameGroup)
      label.userData.adcode = data.adcode
      label.userData.basePosition = [position.x, position.y, position.z]
      label.userData.position = [position.x, position.y, position.z]
      return label
    }

    //省份点
    function areaPoint(data, index, position) {
      let areaPoint = sprite.clone()
      areaPoint.material = material.clone()
      areaPoint.material.opacity = 0
      areaPoint.position.set(position.x, position.y, 0)
      areaPoint.userData.adcode = data.adcode

      areaPoint.userData.type = 'point'
      areaPoint.userData.name = data.name
      areaPoint.userData.position = [position.x, -position.y, 0]
      areaPoint.userData.index = index
      self.areaPointGroup.add(areaPoint)

      return areaPoint
    }
  }

  /**
   * 设置轮廓线可见性
   * @param {Boolean} visible
   */
  setStrokeVisible(visible) {
    const next = !!visible
    this.strokeVisible = next

    if (!next) {
      if (Array.isArray(this.strokePathLines) && this.strokePathLines.length) {
        this.strokePathLines.forEach(line => {
          line?.destroy && line.destroy()
          if (line?.instance?.parent) {
            line.instance.parent.remove(line.instance)
          }
        })
        this.strokePathLines = []
      }

      if (this.strokePathLine) {
        this.strokePathLine.destroy && this.strokePathLine.destroy()
        if (this.strokePathLine?.instance?.parent) {
          this.strokePathLine.instance.parent.remove(this.strokePathLine.instance)
        }
        this.strokePathLine = null
      }
      return
    }

    if (!Array.isArray(this.strokePathLines) || this.strokePathLines.length === 0) {
      this.createStorke()
      return
    }

    this.strokePathLines.forEach(line => {
      if (line) line.visible = true
    })
  }

  /**
   * 设置轮廓线颜色
   * @param {String} color
   */
  setStrokeColor(color) {
    const nextColor =
      typeof color === 'string' && color.startsWith('#') && color.length === 9 ? color.slice(0, 7) : color
    if (!nextColor) return
    this.strokeColor = nextColor

    if (Array.isArray(this.strokePathLines) && this.strokePathLines.length) {
      this.strokePathLines.forEach(line => {
        if (!line?.instance?.children) return
        line.instance.children.forEach(mesh => {
          if (mesh?.material?.color?.set) {
            mesh.material.color.set(nextColor)
          }
        })
      })
      return
    }

    if (this.strokePathLine?.instance) {
      this.strokePathLine.instance.children.forEach(mesh => {
        if (mesh?.material?.color?.set) {
          mesh.material.color.set(nextColor)
        }
      })
    }
  }

  // 创建柱状图
  createBar() {
    let self = this
    const mapData = Array.isArray(this.dataset?.map) ? this.dataset.map.slice() : []
    let data = sortByValue(mapData) //.filter((item, index) => index < 15);

    const barGroup = new Group()
    this.barGroup = barGroup

    this.allProvinceDataLabel = []
    data.map((item, index) => {
      const geo = item?.centroid || item?.center
      if (!Array.isArray(geo) || geo.length < 2) return
      let [x, y] = this.geoProjection(geo)

      const dataLabel = this.labelData04(item, index, new Vector3(x, -y + 0.8, this.depth + 1.1))

      this.allProvinceDataLabel.push(dataLabel)

      this.setDataScale()
    })
  }

  // 数据标签
  labelData04(data, index, position) {
    let self = this
    let label = self.label3d.create('', 'provinces-label-style02', true)
    label.init(
      `<div class="provinces-label-style02 ${index < 3 ? 'yellow' : ''}">
      <div class="provinces-label-style02-wrap">
        <div class="number"><span class="value">${data.value}</span><span class="unit">${data.unit}</span></div>

      </div>
     </div>`,
      position
    )
    const scale = self.mainMapScale || 1
    self.label3d.setLabelStyle(label, 0.05 / scale, 'x')
    label.setParent(self.labelGroup)
    label.userData.adcode = data.adcode
    label.userData.position = [position.x, position.y, position.z]
    return label
  }

  setStrokeSpeed(speed) {
    const raw = typeof speed === 'number' ? speed : Number(speed)
    if (!isFinite(raw)) return
    const next = Math.min(1, Math.max(0, raw))
    this.strokeSpeed = next

    if (Array.isArray(this.strokePathLines) && this.strokePathLines.length) {
      this.strokePathLines.forEach(line => {
        if (!line) return
        if (typeof line.setSpeed === 'function') {
          line.setSpeed(next)
          return
        }
        line.speed = next
      })
    }
  }

  setStrokeWidth(width) {
    const raw = typeof width === 'number' ? width : Number(width)
    if (!isFinite(raw)) return

    const next = Math.min(1, Math.max(0.01, raw))
    if (next === this.strokeWidth) return

    this.strokeWidth = next

    if (this.strokeVisible) {
      this.createStorke()
    }
  }

  // 创建轮廓
  async createStorke() {
    const texture = this.assets.instance.getResource('pathLine2')
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(1, 1)

    let mapJsonData = await this.getMapOutlineData(this.adcode || '100000')

    if (typeof mapJsonData === 'string') {
      try {
        mapJsonData = JSON.parse(mapJsonData)
      } catch {
        mapJsonData = null
      }
    }

    const features = Array.isArray(mapJsonData?.features) ? mapJsonData.features : []
    if (!features.length) return

    if (Array.isArray(this.strokePathLines) && this.strokePathLines.length) {
      this.strokePathLines.forEach(line => {
        line?.destroy && line.destroy()
        if (line?.instance?.parent) {
          line.instance.parent.remove(line.instance)
        }
      })
      this.strokePathLines = []
    }

    if (Array.isArray(this.strokePathLines) && this.strokePathLines.length) {
      this.strokePathLines.forEach(line => {
        line?.destroy && line.destroy()
        if (line?.instance?.parent) {
          line.instance.parent.remove(line.instance)
        }
      })
      this.strokePathLines = []
    }

    if (this.strokePathLine) {
      this.strokePathLine.destroy && this.strokePathLine.destroy()
      if (this.strokePathLine?.instance?.parent) {
        this.strokePathLine.instance.parent.remove(this.strokePathLine.instance)
      }
      this.strokePathLine = null
    }

    const normalizeKey = v => {
      if (v == null) return ''
      return String(v)
    }

    const getFeatureKeys = (f, index) => {
      const p = f?.properties || {}
      const keys = [p.adcode, p.code, p.id, p.name, p.NAME, p.fullname, p.adname, p.cityname, p.provname]
        .map(normalizeKey)
        .filter(Boolean)

      if (!keys.length) keys.push(String(index))
      return keys
    }

    const items = features.map((f, i) => ({ f, i, keys: getFeatureKeys(f, i) }))

    const rawGroups = this.config?.style?.strokeGroups
    const groups = []
    const used = new Set()

    const addGroup = groupItems => {
      if (!Array.isArray(groupItems) || groupItems.length === 0) return
      groups.push(groupItems)
      groupItems.forEach(it => used.add(it.i))
    }

    if (Array.isArray(rawGroups) && rawGroups.length) {
      rawGroups.forEach(raw => {
        const arr = Array.isArray(raw) ? raw : [raw]
        const keySet = new Set(arr.map(normalizeKey).filter(Boolean))
        if (!keySet.size) return

        const matched = items.filter(it => !used.has(it.i) && it.keys.some(k => keySet.has(k)))
        addGroup(matched)
      })
    }

    items.forEach(it => {
      if (!used.has(it.i)) addGroup([it])
    })

    const colorVal =
      typeof this.strokeColor === 'string' && this.strokeColor.startsWith('#') && this.strokeColor.length === 9
        ? this.strokeColor.slice(0, 7)
        : this.strokeColor

    const parent = this.focusMapGroup || this.mainMapRoot || this.mainSceneGroup

    const fitScale = typeof this.scale === 'number' && isFinite(this.scale) ? this.scale : 1
    const strokeBaseRadius = typeof this.strokeWidth === 'number' && isFinite(this.strokeWidth) ? this.strokeWidth : 0.2
    const strokeRadius = fitScale > 0 ? strokeBaseRadius / fitScale : strokeBaseRadius
    const cx = this.boundBox?.center?.x || 0
    const cy = this.boundBox?.center?.y || 0

    const pathLines = []

    groups.forEach(groupItems => {
      const data = []

      groupItems.forEach(({ f }) => {
        const g = f?.geometry
        if (!g || !g.coordinates) return

        const polygons = g.type === 'Polygon' ? [g.coordinates] : g.coordinates
        if (!Array.isArray(polygons)) return

        polygons.forEach(poly => {
          if (!Array.isArray(poly)) return
          data.push({ geometry: { coordinates: [poly] } })
        })
      })

      if (!data.length) return

      const pathLine = new PathLine(this, {
        data,
        texture,
        renderOrder: 21,
        speed: typeof this.strokeSpeed === 'number' ? this.strokeSpeed : 0.2,
        radius: strokeRadius,
        segments: 256 * 10,
        radialSegments: 4,
        material: new MeshBasicMaterial({
          color: colorVal || '#2bc4dc',
          map: texture,
          alphaMap: texture,
          fog: false,
          transparent: true,
          opacity: 1,
          blending: AdditiveBlending
        })
      })

      pathLine.setParent(parent)
      pathLine.instance.scale.set(fitScale, fitScale, fitScale)
      pathLine.instance.position.x = -cx
      pathLine.instance.position.y = -cy
      pathLine.instance.position.z = this.depth + 0.38
      pathLine.visible = !!this.strokeVisible

      pathLines.push(pathLine)
    })

    this.strokePathLines = pathLines
    this.strokePathLine = pathLines[0] || null
  }

  // 添加事件
  addEvent() {
    let objectsHover = []

    const reset = mesh => {
      if (mesh?.scale) {
        gsap.killTweensOf(mesh.scale)
      }
      gsap.to(mesh.scale, {
        duration: 0.3,
        z: 1,
        onComplete: () => {
          if (this.hoveredMapAreas && this.hoveredMapAreas.has && this.hoveredMapAreas.has(mesh)) return
          mesh.traverse(obj => {
            if (obj.isMesh) {
              obj.material[0].emissive.setHex(mesh.userData.materialEmissiveHex)
              obj.material[0].emissiveIntensity = 1
              obj.renderOrder = 9
            }
          })
        }
      })
      // this.setBarMove(mesh.userData.adcode, 'down')
      // this.setGQMove(mesh.userData.adcode, 'down')
      // this.setLabelMove(mesh.userData.adcode, 'down')
      // this.setScatterMove(mesh.userData.adcode, 'down')
    }
    const move = mesh => {
      if (mesh?.scale) {
        gsap.killTweensOf(mesh.scale)
      }
      const liftScale = typeof this.hoverLiftScale === 'number' ? this.hoverLiftScale : 1.5
      gsap.to(mesh.scale, {
        duration: 0.3,
        z: liftScale
      })
      // this.setBarMove(mesh.userData.adcode)
      // this.setGQMove(mesh.userData.adcode)
      // this.setLabelMove(mesh.userData.adcode)
      // this.setScatterMove(mesh.userData.adcode)

      const hoverColor = this.hoverEmissiveColor || '#0b112d'
      const hoverIntensity = typeof this.hoverEmissiveIntensity === 'number' ? this.hoverEmissiveIntensity : 1.5
      mesh.traverse(obj => {
        if (obj.isMesh) {
          if (obj.material && obj.material[0]?.emissive?.set) {
            obj.material[0].emissive.set(hoverColor)
          }
          obj.material[0].emissiveIntensity = hoverIntensity
          obj.renderOrder = 21
        }
      })
    }

    // 循环添加事件
    this.eventElement.map(mesh => {
      this.interactionManager.add(mesh)
      mesh.addEventListener('mousedown', event => {
        if (!this.drill.isDrill || this.clicked || !this.mainSceneGroup.visible) return false
        this.clicked = true
        let userData = event.target.parent.userData
        this.history.push(userData)
        this.loadChildMap(userData)
      })
      mesh.addEventListener('mouseup', ev => {
        this.clicked = false
      })
      mesh.addEventListener('mouseover', event => {
        if (!objectsHover.includes(event.target.parent)) {
          objectsHover.push(event.target.parent)
        }

        if (this.hoveredMapAreas && this.hoveredMapAreas.add) {
          this.hoveredMapAreas.add(event.target.parent)
        }

        if (this.mainSceneGroup.visible && this.drill.isDrill) {
          document.body.style.cursor = 'pointer'
        }
        move(event.target.parent)
      })
      mesh.addEventListener('mouseout', event => {
        objectsHover = objectsHover.filter(n => n.userData.name !== event.target.parent.userData.name)
        if (objectsHover.length > 0) {
          const mesh = objectsHover[objectsHover.length - 1]
        }

        if (this.hoveredMapAreas && this.hoveredMapAreas.delete) {
          this.hoveredMapAreas.delete(event.target.parent)
        }

        reset(event.target.parent)
        document.body.style.cursor = 'default'
      })
    })
  }

  //获取主地图大小
  getMainMapSize() {
    const fallbackParentBoxSize = [129.00074005126953, (126.23402404785156 * 3) / 4]
    const parentBoxSize =
      Array.isArray(this.mainMapBoxSize) && this.mainMapBoxSize.length >= 2
        ? this.mainMapBoxSize
        : fallbackParentBoxSize

    return parentBoxSize
  }

  // 加载子地图
  async loadChildMap(userData) {
    if (!this.drill.isDrill) {
      this.clicked = false
      return
    }

    const maxDrillIndex = Math.min(2, Math.max(0, Math.floor(this.drill.drillLevel || 0)))
    if (this.history && this.history.getIndex && this.history.getIndex() > maxDrillIndex) {
      this.history.undo()
      this.toastLoading.hide()
      this.clicked = false
      return
    }

    this.toastLoading.show()

    try {
      const data = await this.getChildMapData(userData)
      if (!data) {
        this.history.undo()
        this.toastLoading.hide()
        this.clicked = false
        return
      }

      this.returnBtn.style.display = 'block'
      this.childMap && this.childMap.destroy()

      const parentBoxSize = this.getMainMapSize()

      this.childMap = new ChildMap(this, {
        adcode: userData.adcode,
        center: userData.center,
        centroid: userData.centroid,
        childrenNum: userData.childrenNum,
        mapData: data,
        label: {
          areaName: this.provinceNameGroup.visible,
          dataLabel: this.labelGroup.visible,
          areaPoint: this.areaPointGroup.visible
        },
        lineColor: this.provinceLineColor,
        provinceNameOffset: this.provinceNameOffset,
        parentBoxSize
      })
      this.childSceneGroup.add(this.childMap.instance)
      this.setProvinceTopColor && this.setProvinceTopColor(this.provinceTopColor)
      this.setProvinceSideColor && this.setProvinceSideColor(this.provinceSideColor)
      this.setHoverEmissiveColor && this.setHoverEmissiveColor(this.hoverEmissiveColor)
      this.setHoverEmissiveIntensity && this.setHoverEmissiveIntensity(this.hoverEmissiveIntensity)
      this.setHoverLiftScale && this.setHoverLiftScale(this.hoverLiftScale)
      this.setMainMapVisible(false)
      this.toastLoading.hide()

      this.camera.controls.reset()
      this.currentScene = 'childScene'
      // this.config.setEnable(false)
    } catch (e) {
      this.history.undo()
      this.toastLoading.hide()
      this.clicked = false
    }
  }

  //获取子地图数据
  async getChildMapData(userData) {
    const res = await fetch(`/geojson_datav/${userData.adcode}.json`)
    if (!res.ok) {
      return null
    }

    const text = await res.text()
    if (!text) {
      return null
    }

    try {
      const json = JSON.parse(text)
      if (!json || !Array.isArray(json.features) || json.features.length === 0) {
        return null
      }
    } catch (e) {
      return null
    }

    return text
  }

  //获取地图轮廓数据
  async getMapOutlineData(adcode) {
    const res = await fetch(`/geoBoundjson_datav/${adcode}_bound.json`)
    if (!res.ok) {
      return null
    }

    const text = await res.text()
    if (!text) {
      return null
    }

    try {
      const json = JSON.parse(text)
      if (!json || !Array.isArray(json.features) || json.features.length === 0) {
        return null
      }
    } catch (e) {
      return null
    }
    return text
  }

  // 返回上一级
  goBack() {
    this.history.undo()
    if (!this.history.getIndex()) {
      this.currentScene = 'mainScene'

      this.returnBtn.style.display = 'none'

      this.childMap && this.childMap.destroy()
      this.childMap = null

      this.setMainMapVisible(true)
    } else {
      let userData = this.history.present

      this.loadChildMap(userData)
    }

    this.camera.controls.reset()
  }

  clearProvinceValueLabels() {
    this.allProvinceNameLabel = []
    this.labelGroup && this.labelGroup.clear()
  }

  rebuildProvinceValueLabels() {
    const mapData = this.dataset?.map
    if (!Array.isArray(mapData) || mapData.length === 0) {
      this.clearProvinceValueLabels()
      return
    }

    this.clearProvinceValueLabels()

    const data = sortByValue(mapData.slice())
    data.map((item, index) => {
      const geo = item?.centroid || item?.center
      if (!Array.isArray(geo) || geo.length < 2) return

      const [x, y] = this.geoProjection(geo)
      const label = this.labelStyle04(item, index, new Vector3(x, -y, this.depth + 1.1))
      this.allProvinceNameLabel.push(label)

      const wrap = label.element?.querySelector?.('.provinces-label-style02-wrap')
      if (wrap) {
        gsap.set(wrap, { translateY: 0, opacity: 1 })
      }
    })
  }

  setDataset(dataset) {
    this.dataset = dataset
    this.rebuildProvinceValueLabels()
  }

  // ============ 图层管理 ============
  setLayers(layers, dataset) {
    this.layers = Array.isArray(layers) ? layers : []
    this._layerDataset = dataset
    this._rebuildLayers()
  }

  // 每个图层携带独立查询结果
  setLayersWithData(layerResults) {
    this._layerResults = Array.isArray(layerResults) ? layerResults : []
    this._rebuildLayersWithData()
  }
  _rebuildLayers() {
    // 清除旧图层
    if (this._layerGroup) {
      this._layerGroup.clear()
      this._layerLabels && this._layerLabels.forEach(l => l?.element?.remove())
      this._layerLabels = []
    } else {
      this._layerGroup = new Group()
      this._layerGroup.name = 'layerGroup'
      const parent = this.mainMapRoot || this.mainSceneGroup
      parent && parent.add(this._layerGroup)
    }
    // 重置分布图层着色
    this._clearDistributionColors()

    if (!Array.isArray(this.layers)) return

    this.layers.forEach(layer => {
      if (!layer.visible) return
      if (layer.type === 'point') this._renderPointLayer(layer)
    })

    const scale = this.scale || 1
    this._layerGroup.scale.set(scale, scale, scale)
    if (this.boundBox) {
      this._layerGroup.position.x = -(this.boundBox.center?.x || 0)
      this._layerGroup.position.y = -(this.boundBox.center?.y || 0)
    }
  }

  _rebuildLayersWithData() {
    // 清除旧图层
    if (this._layerGroup) {
      this._layerGroup.clear()
      this._layerLabels && this._layerLabels.forEach(l => l?.element?.remove())
      this._layerLabels = []
    } else {
      this._layerGroup = new Group()
      this._layerGroup.name = 'layerGroup'
      const parent = this.mainMapRoot || this.mainSceneGroup
      parent && parent.add(this._layerGroup)
    }
    // 重置分布图层着色
    this._clearDistributionColors()

    if (!Array.isArray(this._layerResults)) return

    this._layerResults.forEach(({ layer, rows }) => {
      if (!layer.visible) return
      if (layer.type === 'point') this._renderPointLayer(layer, rows)
      else if (layer.type === 'distribution') this._renderDistributionLayer(layer, rows)
    })

    const scale = this.scale || 1
    this._layerGroup.scale.set(scale, scale, scale)
    if (this.boundBox) {
      this._layerGroup.position.x = -(this.boundBox.center?.x || 0)
      this._layerGroup.position.y = -(this.boundBox.center?.y || 0)
    }
  }

  // 条件匹配，返回合并后的样式
  _resolvePointStyle(item, layer) {
    const base = { ...layer.style }
    const conditions = Array.isArray(layer.conditions) ? layer.conditions : []
    for (const cond of conditions) {
      const fieldVal = item[cond.field]
      const condVal = cond.value
      let match = false
      switch (cond.operator) {
        case '==': match = fieldVal == condVal; break
        case '!=': match = fieldVal != condVal; break
        case '>':  match = fieldVal > condVal;  break
        case '>=': match = fieldVal >= condVal; break
        case '<':  match = fieldVal < condVal;  break
        case '<=': match = fieldVal <= condVal; break
      }
      if (match) Object.assign(base, cond.style)
    }
    return base
  }

  _renderPointLayer(layer, rows) {
    const mapping = layer.dataMapping || {}
    const lngField = mapping.lng || 'lng'
    const latField = mapping.lat || 'lat'
    const labelField = layer.style?.labelField || mapping.label || 'name'

    let dataRows = Array.isArray(rows) ? rows : []
    if (!dataRows.length) {
      const dataset = this._layerDataset
      dataRows = Array.isArray(dataset?.source) ? dataset.source : (Array.isArray(dataset) ? dataset : [])
    }
    if (!dataRows.length) return

    const scale = this.scale || 1
    const loader = new TextureLoader()
    const textureCache = {}
    const getTexture = (url) => {
      if (!url) return null
      if (textureCache[url]) return textureCache[url]
      const tex = loader.load(url)
      textureCache[url] = tex
      return tex
    }

    dataRows.forEach(item => {
      const lng = parseFloat(item[lngField])
      const lat = parseFloat(item[latField])
      if (!isFinite(lng) || !isFinite(lat)) return

      const [x, y] = this.geoProjection([lng, lat])
      const z = (this.depth + 1.2) / scale

      const s = this._resolvePointStyle(item, layer)
      const size = typeof s.size === 'number' ? s.size : 1
      const opacity = typeof s.opacity === 'number' ? s.opacity : 1
      const spriteSize = size / scale

      const tex = getTexture(s.image) || this.assets.instance.getResource('point') || this.assets.instance.getResource('gaoguang1')
      const mat = new SpriteMaterial({
        map: tex,
        color: new Color(s.color || '#ffffff'),
        opacity,
        transparent: true,
        depthTest: false
      })
      const sprite = new Sprite(mat)
      sprite.scale.set(spriteSize, spriteSize, spriteSize)
      sprite.position.set(x, -y, z)
      sprite.renderOrder = 25
      this._layerGroup.add(sprite)

      if (this.interactionManager) {
        this.interactionManager.add(sprite)
        sprite.cursor = 'pointer'
        sprite.addEventListener('click', (event) => {
          if (typeof this.onPointClick === 'function') this.onPointClick(item, layer, event)
        })
        sprite.addEventListener('mouseover', (event) => {
          if (typeof this.onPointHover === 'function') this.onPointHover(item, layer, event)
        })
        sprite.addEventListener('mouseout', (event) => {
          if (typeof this.onPointOut === 'function') this.onPointOut(item, layer, event)
        })
        if (!this._layerEventElements) this._layerEventElements = []
        this._layerEventElements.push(sprite)
      }

      const labelVisible = s.labelVisible !== false
      const labelText = item[labelField] ?? ''
      if (labelVisible && labelText) {
        const labelColor = s.labelColor || '#ffffff'
        const labelSize = typeof s.labelSize === 'number' ? s.labelSize : 0.08
        const label = this.label3d.create('', 'layer-point-label', true)
        label.init(
          `<div class="layer-point-label-wrap" style="color:${labelColor};font-size:12px;white-space:nowrap;text-shadow:1px 1px 0 #000">${labelText}</div>`,
          new Vector3(x, -y + spriteSize * 0.6 + 0.5 / scale, z)
        )
        this.label3d.setLabelStyle(label, labelSize / scale, 'x')
        label.setParent(this._layerGroup)
        if (!this._layerLabels) this._layerLabels = []
        this._layerLabels.push(label)
      }
    })
  }

  _renderLineLayer(layer, rows) {
    const dataRows = Array.isArray(rows) ? rows : []
    if (!dataRows.length) return
    const color = layer.style?.color || '#00ffff'
    const opacity = typeof layer.style?.opacity === 'number' ? layer.style.opacity : 1
    const scale = this.scale || 1

    dataRows.forEach(item => {
      const coords = item.coords
      if (!Array.isArray(coords) || coords.length < 2) return
      const points = coords.map(c => {
        const [x, y] = this.geoProjection([c[0], c[1]])
        return new Vector3(x, -y, (this.depth + 0.5) / scale)
      })
      const geometry = new BufferGeometry().setFromPoints(points)
      const mat = new LineBasicMaterial({ color: new Color(color), opacity, transparent: true })
      const line = new Line(geometry, mat)
      line.renderOrder = 24
      this._layerGroup.add(line)
    })
  }

  // 清除分布图层对区块的着色
  _clearDistributionColors() {
    if (!this.provinceMesh?.mapGroup) return
    this._distAutoRanges = null
    this.provinceMesh.mapGroup.traverse(obj => {
      if (obj.isMesh && obj.userData._distributionColor) {
        obj.material[0].color.set(this.provinceTopColor || '#061e47')
        delete obj.userData._distributionColor
        delete obj.userData._distributionValue
        delete obj.userData._distributionLabel
      }
    })
    this._removeDistributionTooltip()
  }

  _renderDistributionLayer(layer, rows) {
    const dataRows = Array.isArray(rows) ? rows : []
    if (!dataRows.length) return

    const mapping = layer.dataMapping || {}
    const nameField = mapping.name || 'name'
    const valueField = mapping.value || 'value'
    const dist = layer.distribution || {}
    const colorEnabled = dist.colorEnabled !== false
    const tooltipEnabled = dist.tooltipEnabled !== false
    const ranges = Array.isArray(dist.ranges) ? dist.ranges : []
    const defaultColor = dist.defaultColor || null

    const normalize = s => String(s || '').replace(/(省|市|自治区|特别行政区|壮族|回族|维吾尔|朝鲜族)$/g, '').trim()

    // 建立 name -> { value, label } 映射
    const dataMap = new Map()
    dataRows.forEach(item => {
      const name = String(item[nameField] || '').trim()
      if (name) dataMap.set(name, { value: parseFloat(item[valueField]), label: name })
    })

    if (!this.provinceMesh?.mapGroup) return

    // 第一遍：写入匹配值
    const matchedMeshes = []
    this.provinceMesh.mapGroup.traverse(obj => {
      if (!obj.isMesh) return
      const meshName = String(obj.userData.name || '').trim()
      if (!meshName) return
      const normMesh = normalize(meshName)
      let matched = dataMap.get(meshName) || dataMap.get(normMesh)
      if (!matched) {
        for (const [k, v] of dataMap) {
          if (normalize(k) === normMesh || k.includes(normMesh) || normMesh.includes(normalize(k))) {
            matched = v; break
          }
        }
      }
      if (!matched) return
      obj.userData._distributionValue = matched.value
      obj.userData._distributionLabel = matched.label
      matchedMeshes.push(obj)
    })

    if (!colorEnabled || !matchedMeshes.length) {
      if (tooltipEnabled) this._bindDistributionTooltip()
      return
    }

    // 计算颜色映射
    const hasManualRange = ranges.some(r => r.min != null || r.max != null)
    let resolvedRanges = ranges

    if (ranges.length && !hasManualRange) {
      // 自动等分
      const allVals = matchedMeshes.map(o => o.userData._distributionValue).filter(isFinite)
      const gMin = Math.min(...allVals)
      const gMax = Math.max(...allVals)
      const step = (gMax - gMin) / ranges.length || 1
      resolvedRanges = ranges.map((r, i) => ({
        min: gMin + step * i,
        max: i === ranges.length - 1 ? gMax + 0.001 : gMin + step * (i + 1),
        color: r.color
      }))
    }

    // 第二遍：着色
    matchedMeshes.forEach(obj => {
      const val = obj.userData._distributionValue
      let color = defaultColor
      if (resolvedRanges.length && isFinite(val)) {
        for (const r of resolvedRanges) {
          const rMin = r.min != null ? r.min : -Infinity
          const rMax = r.max != null ? r.max : Infinity
          if (val >= rMin && val < rMax) { color = r.color; break }
        }
        // 最后一个区间用 <=
        if (!color) {
          const last = resolvedRanges[resolvedRanges.length - 1]
          if (val <= (last.max != null ? last.max : Infinity)) color = last.color
        }
      }
      if (color && obj.material[0]?.color?.set) {
        obj.material[0].color.set(color)
        obj.userData._distributionColor = color
      }
    })

    if (tooltipEnabled) this._bindDistributionTooltip()
  }

  _bindDistributionTooltip() {
    if (this._distributionTooltipBound) return
    this._distributionTooltipBound = true

    this._distributionTooltipEl = document.createElement('div')
    this._distributionTooltipEl.style.cssText = `
      position:fixed;pointer-events:none;z-index:99999;
      background:rgba(0,0,0,0.75);color:#fff;
      padding:6px 10px;border-radius:4px;font-size:12px;
      border:1px solid rgba(255,255,255,0.2);
      display:none;white-space:nowrap;
    `
    document.body.appendChild(this._distributionTooltipEl)

    const canvas = this.renderer?.instance?.domElement
    if (!canvas) return

    this._distMouseMove = e => {
      // 用 interactionManager 的 raycaster 检测
      const rect = canvas.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1

      const raycaster = this.interactionManager?.raycaster
      if (!raycaster) return

      raycaster.setFromCamera({ x, y }, this.camera.instance)
      const meshes = []
      this.provinceMesh?.mapGroup?.traverse(obj => { if (obj.isMesh) meshes.push(obj) })
      const hits = raycaster.intersectObjects(meshes, false)

      if (hits.length && hits[0].object.userData._distributionValue !== undefined) {
        const d = hits[0].object.userData
        this._distributionTooltipEl.innerHTML = `<b>${d.name || d._distributionLabel}</b><br/>数值：${d._distributionValue}`
        this._distributionTooltipEl.style.display = 'block'
        this._distributionTooltipEl.style.left = (e.clientX + 12) + 'px'
        this._distributionTooltipEl.style.top = (e.clientY - 10) + 'px'
      } else {
        this._distributionTooltipEl.style.display = 'none'
      }
    }
    canvas.addEventListener('mousemove', this._distMouseMove)
  }

  _removeDistributionTooltip() {
    if (this._distributionTooltipEl) {
      this._distributionTooltipEl.remove()
      this._distributionTooltipEl = null
    }
    if (this._distMouseMove) {
      const canvas = this.renderer?.instance?.domElement
      canvas?.removeEventListener('mousemove', this._distMouseMove)
      this._distMouseMove = null
    }
    this._distributionTooltipBound = false
  }

  setDrill(enabled) {
    this.drill.isDrill = !!enabled
    if (!this.drill.isDrill) {
      this.clicked = false
      document.body.style.cursor = 'default'
    }
  }

  setDrillLevel(level) {
    const next = typeof level === 'number' ? level : Number(level)
    const normalized = isFinite(next) ? next : 0
    this.drill.drillLevel = Math.min(2, Math.max(0, Math.floor(normalized)))
  }

  setDepth(depth) {
    const next = typeof depth === 'number' ? depth : Number(depth)
    const normalized = isFinite(next) ? next : 0
    const clamped = Math.min(50, Math.max(0, normalized))
    if (clamped === this.depth) return

    this.depth = clamped

    if (Array.isArray(this.strokePathLines) && this.strokePathLines.length) {
      this.strokePathLines.forEach(line => {
        if (line?.instance?.position) {
          line.instance.position.z = this.depth + 0.38
        }
      })
    } else if (this.strokePathLine?.instance?.position) {
      this.strokePathLine.instance.position.z = this.depth + 0.38
    }

    if (this.quan?.position) {
      this.quan.position.set(0, this.depth + 2.05, 0)
    }

    if (this.eventElement?.length && this.interactionManager?.remove) {
      this.eventElement.forEach(mesh => {
        this.interactionManager.remove(mesh)
      })
    }

    const mapGroup = this.chinaMapGroup || this.scene.getObjectByName('chinaMapGroup')
    if (mapGroup?.parent) {
      mapGroup.parent.remove(mapGroup)
      emptyObject(mapGroup)
    }

    if (this.barGroup?.parent) {
      this.barGroup.parent.remove(this.barGroup)
      emptyObject(this.barGroup)
      this.barGroup = null
    }

    this.labelGroup && this.labelGroup.clear()
    this.provinceNameGroup && this.provinceNameGroup.clear()
    this.areaPointGroup && this.areaPointGroup.clear()

    this.removeElement('.provinces-label-style02')
    this.removeElement('.provinces-name-label')

    this.createModel()

    if (this.focusMapGroup?.position && this.focusMapGroup?.scale) {
      this.focusMapGroup.position.set(0, 0, 0)
      this.focusMapGroup.scale.set(1, 1, 1)
    }

    if (this.provinceMesh?.mapGroup?.traverse) {
      this.provinceMesh.mapGroup.traverse(obj => {
        if (obj?.isMesh) {
          if (obj.material && obj.material[0]) {
            obj.material[0].opacity = 1
          }
          if (obj.position?.set) {
            obj.position.set(0, 0, 0)
          }
        }
      })
    }

    if (this.focusMapSideMaterial) {
      this.focusMapSideMaterial.opacity = 1
    }

    if (this.provinceLineMaterial) {
      this.provinceLineMaterial.opacity = 1
    }

    this.addEvent()
    this.createBar()

    if (this.currentScene === 'childScene' && this.history?.present) {
      this.loadChildMap(this.history.present)
    }

    if (typeof this._onMapReadyCallback === 'function') { this._onMapReadyCallback() }
  }

  setGeoProjectionCenter(center) {
    if (!Array.isArray(center) || center.length < 2) return

    this.pointCenter = center
    this.config.geoProjectionCenter = center

    this.setMapSource(this.mapSource, true)
  }

  setMapSource(source, force = false) {
    const next = source || ''
    if (!force && next === this.mapSource) return

    this.mapSource = next

    this.currentScene = 'mainScene'
    if (this.returnBtn?.style) {
      this.returnBtn.style.display = 'none'
    }

    if (this.childMap) {
      this.childMap.destroy()
      this.childMap = null
    }

    this.history = new createHistory()
    this.history.push({ name: '中国' })

    if (this.eventElement?.length && this.interactionManager?.remove) {
      this.eventElement.forEach(mesh => {
        this.interactionManager.remove(mesh)
      })
    }

    const mapGroup = this.chinaMapGroup || this.scene.getObjectByName('chinaMapGroup')
    if (mapGroup?.parent) {
      mapGroup.parent.remove(mapGroup)
      emptyObject(mapGroup)
    }

    if (this.barGroup?.parent) {
      this.barGroup.parent.remove(this.barGroup)
      emptyObject(this.barGroup)
      this.barGroup = null
    }

    this.labelGroup && this.labelGroup.clear()
    this.provinceNameGroup && this.provinceNameGroup.clear()
    this.areaPointGroup && this.areaPointGroup.clear()

    this.removeElement('.provinces-label-style02')
    this.removeElement('.provinces-name-label')

    if (this.strokePathLine) {
      this.strokePathLine.destroy && this.strokePathLine.destroy()
      if (this.strokePathLine?.instance?.parent) {
        this.strokePathLine.instance.parent.remove(this.strokePathLine.instance)
      }
      this.strokePathLine = null
    }

    this.createModel()

    if (this.focusMapGroup?.position && this.focusMapGroup?.scale) {
      this.focusMapGroup.position.set(0, 0, 0)
      this.focusMapGroup.scale.set(1, 1, 1)
    }

    if (this.provinceMesh?.mapGroup?.traverse) {
      this.provinceMesh.mapGroup.traverse(obj => {
        if (obj?.isMesh) {
          if (obj.material && obj.material[0]) {
            obj.material[0].opacity = 1
          }
          if (obj.position?.set) {
            obj.position.set(0, 0, 0)
          }
        }
      })
    }

    if (this.focusMapSideMaterial) {
      this.focusMapSideMaterial.opacity = 1
    }

    if (this.provinceLineMaterial) {
      this.provinceLineMaterial.opacity = 1
    }

    this.addEvent()
    this.createBar()

    if (this.strokeVisible) {
      this.createStorke()
    }

    if (typeof this._onMapReadyCallback === 'function') { this._onMapReadyCallback() }
  }

  removeElement(elementClassName) {
    const elements = document.querySelectorAll(elementClassName)
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      const parent = element.parentNode
      parent && parent.removeChild(element)
    }
  }

  setProvinceLineColor(color) {
    if (!color) return
    this.provinceLineColor = color
    if (this.provinceLineMaterial?.color?.set) {
      this.provinceLineMaterial.color.set(color)
    }
    if (this.childMap && this.childMap.setLineColor) {
      this.childMap.setLineColor(color)
    }
  }

  setProvinceLineWidth(width) {
    const w = typeof width === 'number' ? width : Number(width)
    if (!isFinite(w) || w <= 0) return
    this.provinceLineWidth = w
    // Line2 材质
    if (this.provinceMesh?._line2Material) {
      this.provinceMesh._line2Material.linewidth = w
    }
    // 重建地图以应用新线宽（lineWidth 变化需要重建 ExtrudeMap）
    // 通过触发 rebuildWorld 实现，这里只更新值
  }

  setProvinceTopColor(color) {
    const next = typeof color === 'string' && color.startsWith('#') && color.length === 9 ? color.slice(0, 7) : color
    if (!next) return

    this.provinceTopColor = next

    if (this.focusMapTopMaterial?.color?.set) {
      this.focusMapTopMaterial.color.set(next)
    }

    if (this.provinceMesh?.mapGroup?.traverse) {
      this.provinceMesh.mapGroup.traverse(obj => {
        if (obj?.isMesh && obj.material && obj.material[0]?.color?.set) {
          obj.material[0].color.set(next)
        }
      })
    }

    if (this.childMap?.instance?.traverse) {
      this.childMap.instance.traverse(obj => {
        if (obj?.isMesh && obj.material && obj.material[0]?.color?.set) {
          obj.material[0].color.set(next)
        }
      })
    }
  }

  setProvinceTopTexture(textureSrc) {
    const next = typeof textureSrc === 'string' ? textureSrc : textureSrc == null ? '' : String(textureSrc)
    this.provinceTopTexture = next

    const applyMap = map => {
      if (!map) return

      if (this.focusMapTopMaterial) {
        this.focusMapTopMaterial.map = map
        this.focusMapTopMaterial.needsUpdate = true
      }

      if (this.provinceMesh?.mapGroup?.traverse) {
        this.provinceMesh.mapGroup.traverse(obj => {
          if (obj?.isMesh && obj.material && obj.material[0]) {
            obj.material[0].map = map
            obj.material[0].needsUpdate = true
          }
        })
      }

      if (this.childMap?.instance?.traverse) {
        this.childMap.instance.traverse(obj => {
          if (obj?.isMesh && obj.material && obj.material[0]) {
            obj.material[0].map = map
            obj.material[0].needsUpdate = true
          }
        })
      }
    }

    if (!next) {
      if (this._customProvinceTopMap && this._customProvinceTopMap.dispose) {
        this._customProvinceTopMap.dispose()
      }
      this._customProvinceTopMap = null

      const topNormal = this.assets.instance.getResource('topNormal')
      topNormal.colorSpace = SRGBColorSpace
      topNormal.wrapS = topNormal.wrapT = RepeatWrapping
      applyMap(topNormal)
      return
    }

    const loader = new TextureLoader()
    loader.load(
      next,
      texture => {
        texture.colorSpace = SRGBColorSpace
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping

        if (this._customProvinceTopMap && this._customProvinceTopMap.dispose) {
          this._customProvinceTopMap.dispose()
        }
        this._customProvinceTopMap = texture

        applyMap(texture)
      },
      undefined,
      err => {
        console.error('[Map] load provinceTopTexture failed:', err)
      }
    )
  }

  setProvinceSideColor(color) {
    const next = typeof color === 'string' && color.startsWith('#') && color.length === 9 ? color.slice(0, 7) : color
    if (!next) return

    this.provinceSideColor = next

    if (this.focusMapSideMaterial?.color?.set) {
      this.focusMapSideMaterial.color.set(next)
    }

    if (this.provinceMesh?.mapGroup?.traverse) {
      this.provinceMesh.mapGroup.traverse(obj => {
        if (obj?.isMesh && obj.material && obj.material[1]?.color?.set) {
          obj.material[1].color.set(next)
        }
      })
    }

    if (this.childMap?.instance?.traverse) {
      this.childMap.instance.traverse(obj => {
        if (obj?.isMesh && obj.material && obj.material[1]?.color?.set) {
          obj.material[1].color.set(next)
        }
      })
    }
  }

  setProvinceSideTexture(textureSrc) {
    const next = typeof textureSrc === 'string' ? textureSrc : textureSrc == null ? '' : String(textureSrc)
    this.provinceSideTexture = next

    const applyMap = map => {
      if (!map) return

      if (this.focusMapSideMaterial) {
        this.focusMapSideMaterial.map = map
        this.focusMapSideMaterial.needsUpdate = true
      }

      if (this.provinceMesh?.mapGroup?.traverse) {
        this.provinceMesh.mapGroup.traverse(obj => {
          if (obj?.isMesh && obj.material && obj.material[1]) {
            obj.material[1].map = map
            obj.material[1].needsUpdate = true
          }
        })
      }

      if (this.childMap?.instance?.traverse) {
        this.childMap.instance.traverse(obj => {
          if (obj?.isMesh && obj.material && obj.material[1]) {
            obj.material[1].map = map
            obj.material[1].needsUpdate = true
          }
        })
      }
    }

    if (!next) {
      if (this._customProvinceSideMap && this._customProvinceSideMap.dispose) {
        this._customProvinceSideMap.dispose()
      }
      this._customProvinceSideMap = null

      const sideMap = this.assets.instance.getResource('side')
      sideMap.colorSpace = SRGBColorSpace
      sideMap.wrapS = RepeatWrapping
      sideMap.wrapT = RepeatWrapping
      sideMap.repeat.set(1, 0.2)
      sideMap.offset.y += 0.01

      applyMap(sideMap)
      return
    }

    const loader = new TextureLoader()
    loader.load(
      next,
      texture => {
        texture.colorSpace = SRGBColorSpace
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.repeat.set(1, 0.2)
        texture.offset.y += 0.01

        if (this._customProvinceSideMap && this._customProvinceSideMap.dispose) {
          this._customProvinceSideMap.dispose()
        }
        this._customProvinceSideMap = texture

        applyMap(texture)
      },
      undefined,
      err => {
        console.error('[Map] load provinceSideTexture failed:', err)
      }
    )
  }

  setHoverEmissiveColor(color) {
    const next = typeof color === 'string' && color.startsWith('#') && color.length === 9 ? color.slice(0, 7) : color
    if (!next) return

    this.hoverEmissiveColor = next

    if (this.hoveredMapAreas && this.hoveredMapAreas.forEach) {
      this.hoveredMapAreas.forEach(mesh => {
        if (!mesh?.traverse) return
        mesh.traverse(obj => {
          if (obj?.isMesh && obj.material && obj.material[0]?.emissive?.set) {
            obj.material[0].emissive.set(next)
          }
        })
      })
    }

    if (this.childMap && this.childMap.setHoverEmissiveColor) {
      this.childMap.setHoverEmissiveColor(next)
    }
  }

  setHoverEmissiveIntensity(intensity) {
    const raw = typeof intensity === 'number' ? intensity : Number(intensity)
    if (!isFinite(raw)) return

    const next = Math.min(10, Math.max(0, raw))
    this.hoverEmissiveIntensity = next

    if (this.hoveredMapAreas && this.hoveredMapAreas.forEach) {
      this.hoveredMapAreas.forEach(mesh => {
        if (!mesh?.traverse) return
        mesh.traverse(obj => {
          if (obj?.isMesh && obj.material && obj.material[0]) {
            obj.material[0].emissiveIntensity = next
          }
        })
      })
    }

    if (this.childMap && this.childMap.setHoverEmissiveIntensity) {
      this.childMap.setHoverEmissiveIntensity(next)
    }
  }

  setHoverLiftScale(scale) {
    const raw = typeof scale === 'number' ? scale : Number(scale)
    if (!isFinite(raw)) return

    const next = Math.min(3, Math.max(1, raw))
    this.hoverLiftScale = next

    if (this.hoveredMapAreas && this.hoveredMapAreas.forEach) {
      this.hoveredMapAreas.forEach(mesh => {
        if (mesh?.scale?.z == null) return
        gsap.to(mesh.scale, {
          duration: 0.2,
          z: next
        })
      })
    }

    if (this.childMap && this.childMap.setHoverLiftScale) {
      this.childMap.setHoverLiftScale(next)
    }
  }

  setViewControls(controls) {
    if (!this.camera?.controls) return

    const next = Object.assign(
      {
        zoom: true,
        pan: true,
        rotate: true
      },
      controls || {}
    )

    this.camera.controls.enableZoom = !!next.zoom
    this.camera.controls.enablePan = !!next.pan
    this.camera.controls.enableRotate = !!next.rotate

    if (this.camera.controls.mouseButtons) {
      this.camera.controls.mouseButtons.RIGHT = MOUSE.PAN
    }

    this.camera.controls.update()
  }

  setEnterCameraAnimationEnabled(enabled) {
    const next = !!enabled
    this.enterCameraAnimationEnabled = next

    if (!next) {
      if (this.floorRotateTween?.kill) {
        this.floorRotateTween.kill()
      }
      this.floorRotateTween = null
      return
    }

    if (this.quan?.rotation) {
      if (this.floorRotateTween?.kill) {
        this.floorRotateTween.kill()
      }
      this.floorRotateTween = gsap.to(this.quan.rotation, {
        duration: 5,
        z: this.quan.rotation.z - 2 * Math.PI
      })
    }
  }

  // 初始化环境灯光
  initEnvironment() {
    this.ambientLight = new AmbientLight(this.ambientLightColor || 0xffffff, this.ambientLightIntensity)
    this.scene.add(this.ambientLight)
    // 方向光
    this.directionalLight = new DirectionalLight(this.directionalLightColor || 0xffffff, this.directionalLightIntensity)
    this.directionalLight.position.set(-30, 6, -8)
    // directionalLight.castShadow = true
    // directionalLight.shadow.radius = 20
    // directionalLight.shadow.mapSize.width = 1024
    // directionalLight.shadow.mapSize.height = 1024
    this.scene.add(this.directionalLight)

    this.createPointLight({
      color: '#0e81fb',
      intensity: 160,
      distance: 10000,
      x: -3,
      y: 16,
      z: -3
    })
    this.createPointLight({
      color: '#1f5f7a',
      intensity: 100,
      distance: 100,
      x: -4,
      y: 8,
      z: 43
    })
  }

  createPointLight(pointParams) {
    // 点光源
    const pointLight = new PointLight(0x1d5e5e, pointParams.intensity, pointParams.distance, 1)
    pointLight.position.set(pointParams.x, pointParams.y, pointParams.z)
    this.scene.add(pointLight)
  }

  // 模型渲染
  createModel() {
    if (this.mainMapRoot?.position?.set && this.mainMapRoot?.scale?.set) {
      this.mainMapRoot.position.set(0, 0, 0)
      this.mainMapRoot.scale.set(1, 1, 1)
    }

    let mapGroup = new Group()
    mapGroup.name = 'chinaMapGroup'
    this.chinaMapGroup = mapGroup
    let focusMapGroup = new Group()
    this.focusMapGroup = focusMapGroup // 聚焦地图
    // 地图
    let { province } = this.createProvince()
    this.provinceMesh = province
    province.setParent(focusMapGroup)

    this.applyMainMapFit(province.mapGroup)

    this.createMainAreaNameLabels(province.getCoordinates())

    focusMapGroup.position.set(0, 0, -5)
    focusMapGroup.scale.set(1, 1, 0)

    mapGroup.add(focusMapGroup)
    mapGroup.position.set(0, 0.2, 0)
    ;(this.mainMapRoot || this.mainSceneGroup).add(mapGroup)
  }

  calculateScale(parentBoxSize, boxSize) {
    let xScale = parentBoxSize[0] / boxSize[0]
    let yScale = parentBoxSize[1] / boxSize[1]

    let scale = Math.min(xScale, yScale)

    return scale
  }

  setScale(map) {
    let parentBoxSize = this.defaultMainMapBoxSize
    let boundBox = getBoundBox(map.mapGroup)

    let scale = this.calculateScale(parentBoxSize, [boundBox.boxSize.x, boundBox.boxSize.y])
    // 子地图缩放到主地图大小
    map.mapGroup.scale.set(scale, scale, 1)
    let boundBox1 = getBoundBox(map.mapGroup)
    // 放大后，中心坐标有偏移，偏移了多少，就反向移动多少
    map.mapGroup.position.x = -boundBox1.center.x
    map.mapGroup.position.y = -boundBox1.center.y
    this.scale = scale
    this.boundBox = boundBox1
  }

  applyMainMapFit(mapGroup) {
    if (!mapGroup || !this.mainMapRoot) return

    // this.mainMapTargetBoxSize = this.defaultMainMapBoxSize //默认全国地图大小
    const boundBox = getBoundBox(mapGroup)

    let scale = this.calculateScale(this.defaultMainMapBoxSize, [boundBox.boxSize.x, boundBox.boxSize.y])

    //地图缩放到默认地图大小
    mapGroup.scale.set(scale, scale, 1)
    let boundBox1 = getBoundBox(mapGroup)

    // // 放大后，中心坐标有偏移，偏移了多少，就反向移动多少
    mapGroup.position.x = -boundBox1.center.x
    mapGroup.position.y = -boundBox1.center.y
    this.scale = scale
    this.boundBox = boundBox1

    // const w = bound?.boxSize?.x
    // const h = bound?.boxSize?.y
    // if (!isFinite(w) || !isFinite(h) || w <= 0 || h <= 0) return

    // console.log('========', this.mainMapTargetBoxSize)
    // const [tw, th] = this.mainMapTargetBoxSize
    // const scale = Math.min(tw / w, th / h)
    // if (!isFinite(scale) || scale <= 0) return

    // this.mainMapScale = scale

    // this.mainMapRoot.scale.set(scale, scale, 1)

    // const cx = bound?.center?.x || 0
    // const cy = bound?.center?.y || 0
    // this.mainMapRoot.position.set(-cx * scale, -cy * scale, 0)

    // this.mainMapBoxSize = [w * scale, h * scale]
  }

  setNameScale() {
    const scale = this.scale || 1

    this.provinceNameGroup.scale.set(scale, scale, scale)

    this.provinceNameGroup.position.x = -(this.boundBox?.center?.x || 0)
    this.provinceNameGroup.position.y = -(this.boundBox?.center?.y || 0)

    const baseLabelScale = typeof this.baseLabelNameScale === 'number' ? this.baseLabelNameScale : 0.1
    const labelScale = baseLabelScale / scale

    this.allProvinceNameLabel.map(label => {
      const base = Array.isArray(label?.userData?.basePosition)
        ? label.userData.basePosition
        : Array.isArray(label?.userData?.position)
        ? label.userData.position
        : [label.position.x, label.position.y, label.position.z]
      const z = (this.depth + 0.4) / scale
      label.position.set(base[0], base[1], z)

      // 位置偏移（按当前缩放归一化）
      const ox = Array.isArray(this.provinceNameOffset) ? this.provinceNameOffset[0] || 0 : 0
      const oy = Array.isArray(this.provinceNameOffset) ? this.provinceNameOffset[1] || 0 : 0
      label.position.x += ox / scale
      label.position.y += oy / scale

      label.scale.set(labelScale, labelScale, labelScale)
      label.userData.position = [label.position.x, label.position.y, label.position.z]
    })
  }

  setPointScale() {
    const scale = this.scale || 1

    this.areaPointGroup.scale.set(scale, scale, scale)

    this.areaPointGroup.position.x = -this.boundBox.center.x
    this.areaPointGroup.position.y = -this.boundBox.center.y

    this.allAreaPoint = []

    const basePointScale = typeof this.basePointScale === 'number' ? this.basePointScale : 8

    this.areaPointGroup.children.map(point => {
      const z = (this.depth + 1.4) / scale
      point.position.z = z

      if (point.userData?.position) {
        point.userData.position[2] = z
      }

      point.scale.set(basePointScale / scale, basePointScale / scale, basePointScale / scale)

      point.userData.position = [point.position.x, point.position.y, point.position.z]

      this.allAreaPoint.push(point)
    })
  }

  setDataScale() {
    this.labelGroup.scale.set(this.scale, this.scale, this.scale)

    this.labelGroup.position.x = -this.boundBox.center.x
    this.labelGroup.position.y = -this.boundBox.center.y

    this.labelGroup.children.map(label => {
      // if (label?.userData?.type === 'infoLabel') {
      //   const z = (this.depth + 10) / this.scale
      //   label.position.z = z
      //   label.scale.set(0.06 / this.scale, 0.06 / this.scale, 0.06 / this.scale)
      //   label.userData.position = [label.position.x, label.position.y, label.position.z]
      //   return
      // }

      const z = (this.depth + 1.5) / this.scale
      label.position.z = z
      label.scale.set(0.05 / this.scale, 0.05 / this.scale, 0.05 / this.scale)
      label.userData.position = [label.position.x, label.position.y, label.position.z]
    })
  }

  // 创建省份
  createProvince() {
    const mapJsonData = this.mapSource || this.assets.instance.getResource('china')
    let topNormal = this.assets.instance.getResource('topNormal')
    topNormal.colorSpace = SRGBColorSpace

    topNormal.wrapS = topNormal.wrapT = RepeatWrapping

    this.provinceLineMaterial = new LineBasicMaterial({
      color: new Color(this.provinceLineColor),
      opacity: 0,
      transparent: true,
      fog: false
    })
    let [topMaterial, sideMaterial] = this.createProvinceMaterial()

    this.focusMapTopMaterial = topMaterial
    this.focusMapSideMaterial = sideMaterial
    let province = new ExtrudeMap(this, {
      center: this.pointCenter,
      position: new Vector3(0, 0, 0.06),
      data: mapJsonData,
      depth: this.depth,
      topFaceMaterial: topMaterial,
      sideMaterial: sideMaterial,
      lineMaterial: this.provinceLineMaterial,
      lineWidth: this.provinceLineWidth,
      renderOrder: 9
    })

    this.time.on('tick', () => {
      sideMaterial.map.offset.y += 0.002
    })
    let faceMaterial = new MeshStandardMaterial({
      color: 0x061e47,
      map: topNormal,
      transparent: true,
      normalMap: topNormal,
      opacity: 1
    })

    let { boxSize, box3 } = getBoundBox(province.mapGroup)

    this.eventElement = []
    province.mapGroup.children.map((group, index) => {
      group.children.map(mesh => {
        if (mesh.type === 'Mesh') {
          this.eventElement.push(mesh)

          this.calcUv2(mesh.geometry, boxSize.x, boxSize.y, box3.min.x, box3.min.y)
        }
      })
    })
    return {
      province
    }
  }

  createProvinceMaterial() {
    let topNormal = this.assets.instance.getResource('topNormal')
    topNormal.colorSpace = SRGBColorSpace
    topNormal.wrapS = topNormal.wrapT = RepeatWrapping
    let topMaterial = new MeshStandardMaterial({
      color: this.provinceTopColor || 0x061e47,
      emissive: 0x000000,
      map: topNormal,
      transparent: true,
      normalMap: topNormal,
      opacity: 0
    })

    if (typeof this.provinceTopTexture === 'string' && this.provinceTopTexture) {
      const loader = new TextureLoader()
      loader.load(
        this.provinceTopTexture,
        texture => {
          texture.colorSpace = SRGBColorSpace
          texture.wrapS = RepeatWrapping
          texture.wrapT = RepeatWrapping

          if (this._customProvinceTopMap && this._customProvinceTopMap.dispose) {
            this._customProvinceTopMap.dispose()
          }
          this._customProvinceTopMap = texture

          topMaterial.map = texture
          topMaterial.needsUpdate = true

          if (this.focusMapTopMaterial) {
            this.focusMapTopMaterial.map = texture
            this.focusMapTopMaterial.needsUpdate = true
          }

          if (this.provinceMesh?.mapGroup?.traverse) {
            this.provinceMesh.mapGroup.traverse(obj => {
              if (obj?.isMesh && obj.material && obj.material[0]) {
                obj.material[0].map = texture
                obj.material[0].needsUpdate = true
              }
            })
          }

          if (this.childMap?.instance?.traverse) {
            this.childMap.instance.traverse(obj => {
              if (obj?.isMesh && obj.material && obj.material[0]) {
                obj.material[0].map = texture
                obj.material[0].needsUpdate = true
              }
            })
          }
        },
        undefined,
        err => {
          console.error('[Map] load provinceTopTexture failed:', err)
        }
      )
    }

    let sideMap = this.assets.instance.getResource('side')
    sideMap.colorSpace = SRGBColorSpace
    sideMap.wrapS = RepeatWrapping
    sideMap.wrapT = RepeatWrapping
    sideMap.repeat.set(1, 0.2)
    sideMap.offset.y += 0.01
    let sideMaterial = new MeshStandardMaterial({
      // color: 0x62c3d1,
      color: this.provinceSideColor || 0xffffff,
      map: sideMap,
      fog: false,
      transparent: true,
      opacity: 0
      // side: DoubleSide
    })

    if (typeof this.provinceSideTexture === 'string' && this.provinceSideTexture) {
      const loader = new TextureLoader()
      loader.load(
        this.provinceSideTexture,
        texture => {
          texture.colorSpace = SRGBColorSpace
          texture.wrapS = RepeatWrapping
          texture.wrapT = RepeatWrapping
          texture.repeat.set(1, 0.2)
          texture.offset.y += 0.01

          if (this._customProvinceSideMap && this._customProvinceSideMap.dispose) {
            this._customProvinceSideMap.dispose()
          }
          this._customProvinceSideMap = texture

          sideMaterial.map = texture
          sideMaterial.needsUpdate = true
        },
        undefined,
        err => {
          console.error('[Map] load provinceSideTexture failed:', err)
        }
      )
    }

    // sideMaterial.onBeforeCompile = (shader) => {
    //   shader.uniforms = {
    //     ...shader.uniforms,
    //     uColor1: { value: new Color(0x30b3ff) },
    //     uColor2: { value: new Color(0x30b3ff) },
    //   }
    //   shader.vertexShader = shader.vertexShader.replace(
    //     "void main() {",
    //     `
    //     attribute float alpha;
    //     varying vec3 vPosition;
    //     varying float vAlpha;
    //     void main() {
    //       vAlpha = alpha;
    //       vPosition = position;
    //   `
    //   )
    //   shader.fragmentShader = shader.fragmentShader.replace(
    //     "void main() {",
    //     `
    //     varying vec3 vPosition;
    //     varying float vAlpha;
    //     uniform vec3 uColor1;
    //     uniform vec3 uColor2;

    //     void main() {
    //   `
    //   )
    //   shader.fragmentShader = shader.fragmentShader.replace(
    //     "#include <opaque_fragment>",
    //     /* glsl */ `
    //   #ifdef OPAQUE
    //   diffuseColor.a = 1.0;
    //   #endif

    //   // https://github.com/mrdoob/three.js/pull/22425
    //   #ifdef USE_TRANSMISSION
    //   diffuseColor.a *= transmissionAlpha + 0.1;
    //   #endif
    //   vec3 gradient = mix(uColor1, uColor2, vPosition.z/1.2);

    //   outgoingLight = outgoingLight*gradient;

    //   gl_FragColor = vec4( outgoingLight, diffuseColor.a  );
    //   `
    //   )
    // }
    return [topMaterial, sideMaterial]
  }

  //计算和更新几何体的第二组UV坐标
  calcUv2(geometry, width, height, minX, minY) {
    const positionAttribute = geometry.attributes.position
    const uvAttribute = geometry.attributes.uv

    const count = geometry.groups[0].count
    for (let i = 0; i < count; i++) {
      const x = positionAttribute.getX(i)
      const y = positionAttribute.getY(i)

      const u = (x - minX) / width
      const v = (y - minY) / height

      uvAttribute.setXY(i, u, v)
    }

    uvAttribute.needsUpdate = true
    geometry.computeVertexNormals()
  }
  createRotateBorder() {
    //
    let max = 100
    let rotationBorder1 = this.assets.instance.getResource('rotationBorder1')
    let rotationBorder2 = this.assets.instance.getResource('rotationBorder2')
    let plane01 = new Plane(this, {
      width: max * 1.178,
      needRotate: true,
      rotateSpeed: typeof this.rotateBorderOuterSpeed === 'number' ? this.rotateBorderOuterSpeed : 0.001,
      material: new MeshBasicMaterial({
        map: rotationBorder1,
        color: this.rotateBorderColor || 0x48afff,
        transparent: true,
        opacity: typeof this.rotateBorderOuterOpacity === 'number' ? this.rotateBorderOuterOpacity : 0.2,
        depthWrite: false,
        blending: AdditiveBlending
      }),
      position: new Vector3(0, 0.07, 0)
    })
    plane01.instance.renderOrder = 6
    plane01.instance.scale.set(0, 0, 0)
    plane01.setParent(this.scene)
    //
    let plane02 = new Plane(this, {
      width: max * 1.116,
      needRotate: true,
      rotateSpeed: typeof this.rotateBorderInnerSpeed === 'number' ? this.rotateBorderInnerSpeed : -0.004,
      material: new MeshBasicMaterial({
        map: rotationBorder2,
        color: this.rotateBorderColor || 0x48afff,
        transparent: true,
        opacity: typeof this.rotateBorderInnerOpacity === 'number' ? this.rotateBorderInnerOpacity : 0.4,
        depthWrite: false,
        blending: AdditiveBlending
      }),
      position: new Vector3(0, 0.06, 0)
    })
    plane02.instance.renderOrder = 6
    plane02.instance.scale.set(0, 0, 0)
    plane02.setParent(this.scene)
    this.rotateBorderOuterPlane = plane01
    this.rotateBorderInnerPlane = plane02
    this.rotateBorder1 = plane01.instance
    this.rotateBorder2 = plane02.instance
    this.setRotateBorderColor(this.rotateBorderColor)
    this.setRotateBorderOuterOpacity(this.rotateBorderOuterOpacity)
    this.setRotateBorderOuterSpeed(this.rotateBorderOuterSpeed)
    this.setRotateBorderInnerOpacity(this.rotateBorderInnerOpacity)
    this.setRotateBorderInnerSpeed(this.rotateBorderInnerSpeed)
  }
  createFloor() {
    let geometry = new PlaneGeometry(200, 200)
    const texture = this.assets.instance.getResource('gaoguang1')
    texture.colorSpace = SRGBColorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    texture.repeat.set(1, 1)
    let material = new MeshBasicMaterial({
      map: texture,
      color: this.floorColor || 0xffffff,
      opacity: 1,
      transparent: true,
      blending: AdditiveBlending //YUAN
    })
    let mesh = new Mesh(geometry, material)
    mesh.rotateX(-Math.PI / 2)
    mesh.position.set(0, 0.05, 0)
    this.floorMesh = mesh
    this.scene.add(mesh)

    const quanTexture = this.assets.instance.getResource('quan')

    let quan = new Mesh(
      new PlaneGeometry(250, 250),
      new MeshBasicMaterial({
        map: quanTexture,
        color: this.floorColor || 0xffffff,
        opacity: 1,
        transparent: true,
        blending: AdditiveBlending,
        depthTest: false
      })
    )
    quan.rotateX(-Math.PI / 2)
    quan.position.set(0, this.depth + 2.05, 0)
    this.quan = quan
    this.scene.add(quan)
  }

  createGridRipple() {
    if (this.gridRippleGroup) {
      return
    }

    let geometry = new PlaneGeometry(300, 300)
    const texture = this.assets.instance.getResource('grid')
    const alphaMap = this.assets.instance.getResource('gridBlack')
    texture.wrapS = texture.wrapT = alphaMap.wrapS = alphaMap.wrapT = RepeatWrapping
    texture.repeat.set(40, 40)
    alphaMap.repeat.set(40, 40)
    let material = new MeshBasicMaterial({
      map: texture,
      color: this.gridRippleColor || 0x00ffff,
      transparent: true,
      opacity: 0.5,
      alphaMap: alphaMap,
      blending: AdditiveBlending
    })

    let mesh = new Mesh(geometry, material)
    mesh.rotateX(-Math.PI / 2)
    let [x, y] = this.geoProjection(this.pointCenter)
    mesh.position.set(x, -y, 0.01)
    const mesh2 = mesh.clone()
    mesh2.material = material.clone()
    mesh2.material.opacity = 0.1

    this.gridRippleMaterialPrimary = material
    this.gridRippleMaterialSecondary = mesh2.material

    const group = new Group()
    group.add(mesh, mesh2)
    group.visible = this.gridRippleVisible !== false
    this.gridRippleGroup = group
    this.scene.add(group)

    this.gridRippleDiffuseShader = new DiffuseShader({
      material,
      time: this.time,
      size: 300,
      diffuseColor: this.gridRippleColor || 0x00ffff,
      diffuseSpeed: 30,
      diffuseWidth: 20,
      diffuseDir: 2.0
    })
    this.setGridRippleColor(this.gridRippleColor)
    this.setGridRippleDiffuseEnabled(this.gridRippleDiffuseEnabled)
  }

  // 创建粒子
  createParticles() {
    this.particles = new Particles(this, {
      num: 10, // 粒子数量
      range: 200, // 范围
      dir: 'up',
      speed: 0.1,
      material: new PointsMaterial({
        map: Particles.createTexture(),
        size: 10,
        color: this.particlesColor || 0x00eeee,
        transparent: true,
        opacity: 0.3,
        depthTest: false,
        depthWrite: false,
        vertexColors: true,
        blending: AdditiveBlending,
        sizeAttenuation: true
      })
    })
    this.particles.instance.position.set(0, 0, 0)
    this.particles.instance.rotation.x = -Math.PI / 2
    this.particles.setParent(this.scene)
    this.setParticlesVisible(this.particlesVisible)
    this.setParticlesColor(this.particlesColor)
  }

  initSetting() {
    this.renderer.resize()
    // this.setAxesHelper()
  }
  update() {
    super.update()
    this.stats && this.stats.update()
    this.interactionManager && this.interactionManager.update()
  }
  // 销毁
  destroy() {
    super.destroy()

    if (Array.isArray(this.strokePathLines) && this.strokePathLines.length) {
      this.strokePathLines.forEach(line => {
        line?.destroy && line.destroy()
      })
      this.strokePathLines = []
    }

    this.strokePathLine && this.strokePathLine.destroy && this.strokePathLine.destroy()
    this.label3d && this.label3d.destroy()
    this.stats && this.stats.dom && document.body.removeChild(this.stats.dom)
    this.groundMirror && this.groundMirror.dispose()
    this.toastLoading && this.toastLoading.destroy()
    this.childMap && this.childMap.destroy()
    this._removeDistributionTooltip()
  }
}
