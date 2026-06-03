import { Group, RepeatWrapping, LineBasicMaterial, Vector3, SpriteMaterial, Sprite, Color } from 'three'

import { getBoundBox, emptyObject, ExtrudeMap } from '../mini3d'
import { geoMercator } from 'd3-geo'
import { gsap } from 'gsap'

const normalizeThreeColor = color => {
  if (!color || typeof color !== 'string') return color
  if (color.startsWith('#') && color.length === 9) return color.slice(0, 7)
  return color
}
export class ChildMap {
  constructor(parent, options) {
    this.parent = parent
    this.instance = new Group()
    this.instance.rotateX(-Math.PI / 2)
    this.instance.position.set(0, 0.2, 0)
    let defaultOptions = {
      adcode: 10000,
      center: [0, 0],
      centroid: [0, 0],
      childrenNum: 0,
      parentBoxSize: [1, 1], // 上级地图的尺寸
      mapData: {},
      geoProjectionCenter: [0, 0],
      geoProjectionScale: 120,
      geoProjectionTranslate: [0, 0],
      lineColor: '#2bc4dc',
      provinceNameOffset: [0, 0],
      // 地图标签
      label: {
        areaName: true,
        dataLabel: true,
        areaPoint: true
      }
    }
    this.options = Object.assign({}, defaultOptions, options)

    const rawOffset = Array.isArray(this.options.provinceNameOffset)
      ? this.options.provinceNameOffset
      : Array.isArray(this.parent?.provinceNameOffset)
      ? this.parent.provinceNameOffset
      : [0, 0]
    const ox = typeof rawOffset[0] === 'number' ? rawOffset[0] : Number(rawOffset[0])
    const oy = typeof rawOffset[1] === 'number' ? rawOffset[1] : Number(rawOffset[1])
    this.provinceNameOffset = [isFinite(ox) ? ox : 0, isFinite(oy) ? oy : 0]
    // 是否点击了
    this.clicked = false

    this.hoverEmissiveColor = normalizeThreeColor(this.parent?.hoverEmissiveColor) || '#0b112d'
    const rawHoverEmissiveIntensity =
      typeof this.parent?.hoverEmissiveIntensity === 'number'
        ? this.parent.hoverEmissiveIntensity
        : Number(this.parent?.hoverEmissiveIntensity)
    const normalizedHoverEmissiveIntensity = isFinite(rawHoverEmissiveIntensity) ? rawHoverEmissiveIntensity : 1.5
    this.hoverEmissiveIntensity = Math.min(10, Math.max(0, normalizedHoverEmissiveIntensity))

    const rawHoverLiftScale =
      typeof this.parent?.hoverLiftScale === 'number' ? this.parent.hoverLiftScale : Number(this.parent?.hoverLiftScale)
    const normalizedHoverLiftScale = isFinite(rawHoverLiftScale) ? rawHoverLiftScale : 1.5
    this.hoverLiftScale = Math.min(3, Math.max(1, normalizedHoverLiftScale))

    this.hoveredMapAreas = new Set()
    // 缩放值
    this.scale = 1
    // 地图的box大小
    this.boundBox = {}
    // 地图的区域数据
    this.areaData = []
    // 区域标签
    this.allAreaLabel = []
    // 区域标签组
    this.areaLabelGroup = new Group()

    // 区域点组
    this.areaPointGroup = new Group()
    // 信息标签组
    this.allInfoLabel = []
    this.infoLabelGroup = new Group()
    this.instance.add(this.areaLabelGroup, this.areaPointGroup, this.infoLabelGroup)

    // 事件元素
    this.eventElement = []
    this.pointEventElement = []
    this.init()
  }
  init() {
    this.createModel()
    this.addLabel()
    this.areaLabelGroup.visible = this.options.label.areaName
    this.areaPointGroup.visible = this.options.label.areaPoint
    this.infoLabelGroup.visible = this.options.label.dataLabel

    if (this.options.childrenNum) {
      this.addEvent()
    }
    // this.addPointEvent()
  }
  createModel() {
    let { map } = this.createMap()
    this.setScale(map)
    map.setParent(this.instance)
  }
  // 创建省份
  createMap() {
    // 广东地图
    let mapJsonData = this.options.mapData
    let topNormal = this.parent.assets.instance.getResource('topNormal')
    topNormal.wrapS = topNormal.wrapT = RepeatWrapping

    // 地图线
    this.mapLineMaterial = new LineBasicMaterial({
      color: new Color(normalizeThreeColor(this.options.lineColor)),
      opacity: 1,
      transparent: true,
      fog: false
    })
    let [top, side] = this.parent.createProvinceMaterial()
    let topMaterial = top.clone()
    topMaterial.opacity = 1
    let sideMaterial = side.clone()
    sideMaterial.opacity = 1
    let map = new ExtrudeMap(this.parent, {
      center: this.options.center,
      position: new Vector3(0, 0, 0.06),
      data: mapJsonData,
      depth: this.parent.depth,
      topFaceMaterial: topMaterial,
      sideMaterial: sideMaterial,
      lineMaterial: this.mapLineMaterial,
      renderOrder: 9
    })
    this.areaData = map.coordinates

    let { boxSize, box3 } = getBoundBox(map.mapGroup)
    map.mapGroup.children.map((group, index) => {
      group.children.map(mesh => {
        if (mesh.type === 'Mesh') {
          mesh.userData.type = 'map'
          this.eventElement.push(mesh)
          this.parent.calcUv2(mesh.geometry, boxSize.x, boxSize.y, box3.min.x, box3.min.y)
        }
      })
    })

    return {
      map
    }
  }

  setHoverEmissiveColor(color) {
    const next = normalizeThreeColor(color) || '#0b112d'
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
  }

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

      this.setLabelMove(mesh.userData.adcode, 'down')
      this.setPointMove(mesh.userData.adcode, 'down')
      this.setValueLabelMove(mesh.userData.adcode, 'down')
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

      this.setLabelMove(mesh.userData.adcode)
      this.setPointMove(mesh.userData.adcode)
      this.setValueLabelMove(mesh.userData.adcode)

      const hoverColor = this.hoverEmissiveColor || normalizeThreeColor(this.parent?.hoverEmissiveColor) || '#0b112d'
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
      this.parent.interactionManager.add(mesh)
      mesh.addEventListener('mousedown', event => {
        if (!this.parent.drill || this.clicked) return false
        this.clicked = true
        let userData = event.target.parent.userData
        this.parent.history.push(userData)
        this.parent.loadChildMap(userData)
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

        if (this.parent.drill) {
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
  // 添加标点事件
  addPointEvent() {
    let objectsHover = []

    this.pointEventElement.map(mesh => {
      this.parent.interactionManager.add(mesh)
      mesh.addEventListener('mousedown', event => {
        if (this.clicked) return false
        this.clicked = true
        let userData = event.target.userData
        this.allInfoLabel.map((label, index) => {
          label.hide()
          if (userData.index === index) {
            label.show()
          }
        })
      })
      mesh.addEventListener('mouseup', ev => {
        this.clicked = false
      })
      mesh.addEventListener('mouseover', event => {
        if (!objectsHover.includes(event.target.parent)) {
          objectsHover.push(event.target.parent)
        }

        document.body.style.cursor = 'pointer'
        let sprite = event.target
        sprite.material = this.pointHoverMaterial.clone()
      })
      mesh.addEventListener('mouseout', event => {
        objectsHover = objectsHover.filter(n => n.userData.name !== event.target.parent.userData.name)
        if (objectsHover.length > 0) {
          const mesh = objectsHover[objectsHover.length - 1]
        }

        document.body.style.cursor = 'default'
        let sprite = event.target
        sprite.material = this.pointDefaultMaterial.clone()
      })
    })
  }
  // 设置标签移动
  setLabelMove(adcode, type = 'up') {
    ;[...this.allAreaLabel].map(label => {
      if (label.userData.adcode === adcode) {
        gsap.to(label.position, {
          duration: 0.3,
          z: type === 'up' ? label.userData.position[2] + 3 / this.scale : label.userData.position[2]
        })
      }
    })
  }

  //设置数值标签移动
  setValueLabelMove(adcode, type = 'up') {
    ;[...this.allInfoLabel].map(label => {
      if (label.userData.adcode === adcode) {
        gsap.to(label.position, {
          duration: 0.3,
          z: type === 'up' ? label.userData.position[2] + 3 / this.scale : label.userData.position[2]
        })
      }
    })
  }
  // 设置点移动
  setPointMove(adcode, type = 'up') {
    this.areaPointGroup.children.map(point => {
      if (point.userData.adcode === adcode) {
        gsap.to(point.position, {
          duration: 0.3,
          z: type === 'up' ? point.userData.position[2] + 3 / this.scale : point.userData.position[2]
        })
      }
    })
  }

  addLabel() {
    // 贴图
    const texture = this.parent.assets.instance.getResource('point')

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
    this.areaData.map((item, index) => {
      let [x, y] = this.geoProjection(item.centroid)
      // 名称
      let nameLabel = this.labelNameStyle(item, index, new Vector3(x, -y, 0))
      this.allAreaLabel.push(nameLabel)
      // 信息
      // let infoLabel = this.infoLabel(item, index, new Vector3(x, -y, 0))
      let infoLabel = this.labelStyle04(item, index, new Vector3(x, -y, 0))
      this.allInfoLabel.push(infoLabel)

      //点
      let areaPoint = sprite.clone()
      sprite.material = material.clone()
      areaPoint.position.set(x, -y, 0)
      areaPoint.userData.adcode = item.adcode

      areaPoint.userData.type = 'point'
      areaPoint.userData.name = item.name
      areaPoint.userData.position = [x, -y, 0]
      areaPoint.userData.index = index
      this.areaPointGroup.add(areaPoint)
    })
    this.setNameScale()
    // this.setInfoScale()
    this.setAreaValScale()
    this.setPointScale()
  }

  // 人口标签
  labelStyle04(data, index, position) {
    let label3d = this.parent.label3d
    let label = label3d.create('', 'city-label-style02', true)
    label.init(
      `<div class="city-label-style02 ${index < 3 ? 'yellow' : ''}">
      <div class="city-label-style02-wrap">
        <div class="number"><span class="value">${data.value || 0}</span><span class="unit">万人</span></div>

      </div>
     </div>`,
      position
    )
    // label3d.setLabelStyle(label, 0.05, 'x')
    label3d.setLabelStyle(label, 0.08 / this.scale, 'x')
    label.setParent(this.infoLabelGroup)

    label.userData.type = 'valueLabel'
    label.userData.adcode = data.adcode
    label.userData.position = [position.x, position.y, position.z]

    const element = label.element?.querySelector?.('.city-label-style02-wrap')
    if (element) {
      gsap.to(element, {
        duration: 0.5,
        delay: 0.05 * index,
        translateY: 0,
        opacity: 1,
        ease: 'circ.out'
      })

      const number = label.element?.querySelector?.('.number .value')
      const numberVal = Number(number?.innerText)
      if (number && Number.isFinite(numberVal)) {
        let numberAnimate = { score: 0 }
        gsap.to(numberAnimate, {
          duration: 0.5,
          delay: 0.05 * index,
          score: numberVal,
          onUpdate: () => {
            number.innerText = numberAnimate.score.toFixed(0)
          }
        })
      }
    }

    // label.userData.adcode = data.adcode
    // label.userData.position = [position.x, position.y, position.z]
    return label
  }

  // 数据标签
  infoLabel(data, index, position) {
    let label3d = this.parent.label3d
    let label = label3d.create('', 'info-point', true)

    label.init(
      ` <div class="info-point-wrap">
      <div class="info-point-wrap-inner">
        <div class="info-point-line">
          <div class="line"></div>
          <div class="line"></div>
          <div class="line"></div>
        </div>
        <div class="info-point-content">
          <div class="content-item"><span class="label">名称</span><span class="value">${data.name}</span></div>
          <div class="content-item"><span class="label">PM2.5</span><span class="value">100ug/m²</span></div>
          <div class="content-item"><span class="label">等级</span><span class="value">良好</span></div>
        </div>
      </div>
      </div>
      `,
      position
    )
    label3d.setLabelStyle(label, 0.06 / this.scale, 'x')
    label.setParent(this.infoLabelGroup)

    label.userData.type = 'infoLabel'
    label.userData.adcode = data.adcode
    label.userData.position = [position.x, position.y, position.z]

    label.hide()
    return label
  }
  // 城市标签
  labelNameStyle(data, index, position) {
    let label3d = this.parent.label3d
    let label = label3d.create('', 'area-name-label', true)
    label.init(`<div class="area-name-label-wrap">${data.name}</div>`, position)
    const wrap = label.element?.querySelector?.('.area-name-label-wrap')
    if (wrap) {
      wrap.style.color = this.parent.baseLabelNameColor
      wrap.style.fontFamily = this.parent.baseLabelNameFontFamily
    }
    label3d.setLabelStyle(label, 0.08 / this.scale, 'x')
    label.setParent(this.areaLabelGroup)

    label.userData.adcode = data.adcode
    label.userData.basePosition = [position.x, position.y, position.z]
    label.userData.position = [position.x, position.y, position.z]
    return label
  }

  calculateScale(parentBoxSize, boxSize) {
    let xScale = parentBoxSize[0] / boxSize[0]
    let yScale = parentBoxSize[1] / boxSize[1]
    let scale = Math.min(xScale, yScale)

    return scale
  }

  setScale(map) {
    let { parentBoxSize } = this.options
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

  setAreaValScale() {
    this.infoLabelGroup.scale.set(this.scale, this.scale, this.scale)

    this.infoLabelGroup.position.x = -this.boundBox.center.x
    this.infoLabelGroup.position.y = -this.boundBox.center.y
    this.allInfoLabel.map(label => {
      let z = (this.parent.depth + 0.4) / this.scale
      label.position.z = z

      label.position.y += 1 / this.scale
      label.userData.position = [label.position.x, label.position.y, label.position.z]
    })
  }

  setNameScale() {
    this.areaLabelGroup.scale.set(this.scale, this.scale, this.scale)

    this.areaLabelGroup.position.x = -this.boundBox.center.x
    this.areaLabelGroup.position.y = -this.boundBox.center.y

    const ox = Array.isArray(this.provinceNameOffset) ? this.provinceNameOffset[0] || 0 : 0
    const oy = Array.isArray(this.provinceNameOffset) ? this.provinceNameOffset[1] || 0 : 0

    const rawBaseLabelScale =
      typeof this.parent?.baseLabelNameScale === 'number'
        ? this.parent.baseLabelNameScale
        : Number(this.parent?.baseLabelNameScale)
    const baseLabelScale = isFinite(rawBaseLabelScale) ? rawBaseLabelScale : 0.1
    const labelScale = baseLabelScale / this.scale

    this.allAreaLabel.map(label => {
      const base = Array.isArray(label?.userData?.basePosition)
        ? label.userData.basePosition
        : Array.isArray(label?.userData?.position)
        ? label.userData.position
        : [label.position.x, label.position.y, label.position.z]

      const z = (this.parent.depth + 0.4) / this.scale
      label.position.set(base[0], base[1], z)

      label.position.x += ox / this.scale
      label.position.y += -1.5 / this.scale + oy / this.scale

      label.scale.set(labelScale, labelScale, labelScale)
      label.userData.position = [label.position.x, label.position.y, label.position.z]
    })
  }

  /**
   * 设置区域点大小
   */
  setPointScale() {
    this.areaPointGroup.scale.set(this.scale, this.scale, this.scale)

    this.areaPointGroup.position.x = -this.boundBox.center.x
    this.areaPointGroup.position.y = -this.boundBox.center.y
    this.areaPointGroup.children.map(point => {
      let z = (this.parent.depth + 1.4) / this.scale
      point.position.z = z
      point.userData.position[2] = z

      point.scale.set(5 / this.scale, 5 / this.scale, 5 / this.scale)

      point.userData.position = [point.position.x, point.position.y, point.position.z]

      // this.pointEventElement.push(point)
    })
  }

  /**
   * 设置数据标签大小
   */
  setInfoScale() {
    this.infoLabelGroup.scale.set(this.scale, this.scale, this.scale)

    this.infoLabelGroup.position.x = -this.boundBox.center.x
    this.infoLabelGroup.position.y = -this.boundBox.center.y

    this.infoLabelGroup.children.map(label => {
      if (label?.userData?.type === 'infoLabel') {
        const z = (this.parent.depth + 10) / this.scale
        label.position.z = z
        label.scale.set(0.06 / this.scale, 0.06 / this.scale, 0.06 / this.scale)
        label.userData.position = [label.position.x, label.position.y, label.position.z]
        return
      }

      const z = (this.parent.depth + 1.5) / this.scale
      label.position.z = z
      label.scale.set(0.05 / this.scale, 0.05 / this.scale, 0.05 / this.scale)
      label.userData.position = [label.position.x, label.position.y, label.position.z]
    })
  }
  geoProjection = args => {
    let { geoProjectionScale, geoProjectionTranslate, center } = this.options
    return geoMercator().center(center).scale(geoProjectionScale).translate(geoProjectionTranslate)(args)
  }

  setParent(parent) {
    parent.add(this.instance)
  }

  setAreaNameColor(color) {
    const next = typeof color === 'string' ? color : String(color)
    if (this.areaLabelGroup?.children?.length) {
      this.areaLabelGroup.children.forEach(obj => {
        const el = obj?.element
        if (el && typeof el.querySelector === 'function') {
          const wrap = el.querySelector('.area-name-label-wrap')
          if (wrap) wrap.style.color = next
        }
      })
    }
  }

  setAreaNameFontFamily(fontFamily) {
    const next = typeof fontFamily === 'string' ? fontFamily : String(fontFamily || '')
    if (this.areaLabelGroup?.children?.length) {
      this.areaLabelGroup.children.forEach(obj => {
        const el = obj?.element
        if (el && typeof el.querySelector === 'function') {
          const wrap = el.querySelector('.area-name-label-wrap')
          if (!wrap) return
          if (next) {
            wrap.style.fontFamily = next
          } else {
            wrap.style.removeProperty('font-family')
          }
        }
      })
    }
  }

  setProvinceNameOffset(offset) {
    const arr = Array.isArray(offset) ? offset : [0, 0]
    const ox = typeof arr[0] === 'number' ? arr[0] : Number(arr[0])
    const oy = typeof arr[1] === 'number' ? arr[1] : Number(arr[1])
    const prev = Array.isArray(this.provinceNameOffset) ? this.provinceNameOffset : [0, 0]
    this.provinceNameOffset = [isFinite(ox) ? ox : prev[0] || 0, isFinite(oy) ? oy : prev[1] || 0]

    if (this.allAreaLabel?.length) {
      this.setNameScale()
    }
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

  setLineColor(color) {
    const nextColor = normalizeThreeColor(color)
    if (!nextColor) return

    this.options.lineColor = nextColor

    if (this.mapLineMaterial?.color?.set) {
      this.mapLineMaterial.color.set(nextColor)
    }

    this.instance.traverse(obj => {
      if (obj?.name === 'mapLine' && obj?.material?.color?.set) {
        obj.material.color.set(nextColor)
      }
    })
  }

  destroy() {
    ;[...this.allAreaLabel, ...this.allInfoLabel].map(label => {
      label.remove()
    })
    this.removeElement('.area-name-label')
    this.removeElement('.info-point')
    ;[...this.eventElement, ...this.pointEventElement].map(mesh => {
      this.parent.interactionManager.remove(mesh)
    })

    emptyObject(this.instance)
  }
  removeElement(elementClassName) {
    var elements = document.querySelectorAll(elementClassName)
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      const parent = element.parentNode
      parent.removeChild(element)
    }
  }
}
