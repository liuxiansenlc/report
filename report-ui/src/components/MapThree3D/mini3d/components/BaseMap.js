import {
  Mesh,
  Vector2,
  Color,
  Group,
  Object3D,
  BufferAttribute,
  Shape,
  ExtrudeGeometry,
  MeshBasicMaterial,
  DoubleSide,
  ShapeGeometry,
  Vector3
} from 'three'
import { transfromMapGeoJSON, getBoundBox } from '../utils'
import { geoMercator } from 'd3-geo'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
export class BaseMap {
  constructor({}, config = {}) {
    this.mapGroup = new Group() //地图容器
    this.coordinates = [] //要素坐标容器
    this.config = Object.assign(
      {
        position: new Vector3(0, 0, 0),
        geoProjectionCenter: new Vector2(0, 0),
        geoProjectionScale: 120,
        data: '',
        renderOrder: 1,
        merge: false,
        material: new MeshBasicMaterial({
          color: 0x18263b,
          transparent: true,
          opacity: 1
        })
      },
      config
    )
    this.mapGroup.position.copy(this.config.position) //地图容器位置
    let mapData = transfromMapGeoJSON(this.config.data) //地图JSON数据
    this.create(mapData)
  }

  //墨卡托投影转换
  geoProjection(args) {
    return geoMercator()
      .center(this.config.geoProjectionCenter)
      .scale(this.config.geoProjectionScale)
      .translate([0, 0])(args)
  }

  //为每个要素创建 Shape 并生成几何体
  create(mapData) {
    let { merge } = this.config
    let shapes = []
    mapData.features.forEach(feature => {
      const group = new Object3D()

      let { name, center = [], centroid = [] } = feature.properties
      this.coordinates.push({ name, center, centroid })
      group.userData.name = name
      feature.geometry.coordinates.forEach(multiPolygon => {
        multiPolygon.forEach(polygon => {
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

          const geometry = new ShapeGeometry(shape)
          if (merge) {
            shapes.push(geometry)
          } else {
            const mesh = new Mesh(geometry, this.config.material)
            mesh.renderOrder = this.config.renderOrder
            mesh.userData.name = name
            group.add(mesh)
          }
        })
      })
      if (!merge) {
        this.mapGroup.add(group)
      }
    })
    if (merge) {
      let geometry = mergeGeometries(shapes)
      const mesh = new Mesh(geometry, this.config.material)
      mesh.renderOrder = this.config.renderOrder
      this.mapGroup.add(mesh)
    }
  }

  //返回所有地理要素的坐标信息
  getCoordinates() {
    return this.coordinates
  }

  //将地图组添加到指定的父对象中
  setParent(parent) {
    parent.add(this.mapGroup)
  }
}
