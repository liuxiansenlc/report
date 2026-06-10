import {
  Mesh,
  Vector2,
  Vector3,
  Group,
  Shape,
  ExtrudeGeometry,
  MeshBasicMaterial,
  LineBasicMaterial,
  LineLoop,
  BufferGeometry,
  BufferAttribute
} from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { geoMercator } from 'd3-geo'
import { transfromMapGeoJSON } from '../utils'
export class ExtrudeMap {
  constructor({ assets, time, geoProjection }, config = {}) {
    // this.geoProjection = geoProjection;
    this.mapGroup = new Group()
    this.assets = assets
    this.time = time
    this.coordinates = []
    this.config = Object.assign(
      {
        position: new Vector3(0, 0, 0),
        center: new Vector2(0, 0),
        data: '',
        renderOrder: 1,
        topFaceMaterial: new MeshBasicMaterial({
          color: 0x18263b,
          transparent: true,
          opacity: 1
        }),
        sideMaterial: new MeshBasicMaterial({
          color: 0x07152b,
          transparent: true,
          opacity: 1
        }),
        lineMaterial: new LineBasicMaterial({ color: 0x2bc4dc }),
        depth: 0.1
      },
      config
    )
    this.mapGroup.position.copy(this.config.position)

    let mapData = transfromMapGeoJSON(this.config.data)
    this.create(mapData)
  }

  create(mapData) {
    let linesGroup = new Group()
    mapData.features.forEach((feature, groupIndex) => {
      // 获取属性中的名称，中心点，质心
      let { name, center = [], centroid = [], adcode } = feature.properties
      this.coordinates.push({
        name,
        center,
        centroid: feature.properties.centroid || feature.properties.center,
        adcode,
        enName: '',
        value: 0
      })
      // 组
      const group = new Group()
      group.name = 'meshGroup' + groupIndex
      group.userData.index = groupIndex
      group.userData.name = name
      group.userData.adcode = adcode
      group.userData = {
        index: groupIndex,
        name,
        center,
        centroid: feature.properties.centroid || feature.properties.center,
        adcode,
        childrenNum: feature.properties.childrenNum,
        geometry: feature.geometry
      }
      // 存材质的默认发光颜色
      group.userData.materialEmissiveHex = this.config.topFaceMaterial.emissive.getHex()
      // 线组
      let lineGroup = new Group()
      lineGroup.name = 'lineGroup' + groupIndex
      lineGroup.userData.index = groupIndex
      lineGroup.userData.adcode = adcode
      // 拉伸设置
      const extrudeSettings = {
        depth: this.config.depth,
        bevelEnabled: true,
        bevelSegments: 1,
        bevelThickness: 0.1
      }
      let materials = [this.config.topFaceMaterial.clone(), this.config.sideMaterial]
      feature.geometry.coordinates.forEach(multiPolygon => {
        multiPolygon.forEach((polygon, index) => {
          // 绘制shape
          const shape = new Shape()
          for (let i = 0; i < polygon.length; i++) {
            if (!polygon[i][0] || !polygon[i][1]) {
              return false
            }
            const [x, y] = this.geoProjection(polygon[i])
            if (i === 0) {
              shape.moveTo(x, -y)
            }
            shape.lineTo(x, -y)
          }

          const geometry = new ExtrudeGeometry(shape, extrudeSettings)
          const mesh = new Mesh(geometry, materials)
          mesh.userData.depth = this.config.depth
          mesh.userData.name = name
          mesh.userData.adcode = adcode
          mesh.userData.materialEmissiveHex = this.config.topFaceMaterial.emissive.getHex()

          mesh.renderOrder = this.config.renderOrder
          group.add(mesh)
        })
        const points = []
        let line = null
        multiPolygon[0].forEach(item => {
          const [x, y] = this.geoProjection(item)
          // points.push(new Vector3(x, -y, 0));
          points.push(x, -y, 0)
        })
        line = this.createLine(points)
        lineGroup.add(line)
      })
      linesGroup.add(lineGroup)
      lineGroup.position.set(0, 0, this.config.depth + 0.11)
      group.add(linesGroup)
      this.mapGroup.add(group)
    })
  }
  createLine(points) {
    // 如果配置了 lineWidth > 1，使用 Line2 支持真实线宽
    const lineWidth = this.config.lineWidth || 1
    if (lineWidth > 1) {
      const geometry = new LineGeometry()
      geometry.setPositions(points)
      const mat = new LineMaterial({
        color: this.config.lineMaterial?.color || 0x2bc4dc,
        linewidth: lineWidth,
        transparent: true,
        opacity: this.config.lineMaterial?.opacity ?? 0,
        resolution: this.config.resolution || new Vector2(window.innerWidth, window.innerHeight)
      })
      // 同步 lineMaterial 引用，方便外部修改 opacity/color
      this._line2Material = mat
      const line = new Line2(geometry, mat)
      line.computeLineDistances()
      line.renderOrder = 2
      line.name = 'mapLine'
      return line
    }
    const geometry = new BufferGeometry()
    const vertices = new Float32Array(points)
    const attribute = new BufferAttribute(vertices, 3)
    geometry.setAttribute('position', attribute)
    let line = new LineLoop(geometry, this.config.lineMaterial)
    line.renderOrder = 2
    line.name = 'mapLine'
    return line
  }
  geoProjection = args => {
    let { center } = this.config
    return geoMercator().center(center).scale(120).translate([0, 0])(args)
  }
  getCoordinates() {
    return this.coordinates
  }
  setParent(parent) {
    parent.add(this.mapGroup)
  }
}
