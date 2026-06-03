import { Group, Vector3, CatmullRomCurve3, MeshBasicMaterial, AdditiveBlending, Mesh, TubeGeometry } from 'three'
export class PathLine {
  constructor({ time, geoProjection }, options) {
    this.time = time
    this.geoProjection = geoProjection
    this.instance = new Group()
    this.run = true
    let defaultOptions = {
      speed: 0.003,
      texture: null,
      radius: 0.1,
      segments: 32,
      radialSegments: 8,
      data: [],
      renderOrder: 1,
      material: new MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        fog: false,
        depthTest: false,
        blending: AdditiveBlending
      })
    }
    this.options = Object.assign({}, defaultOptions, options)
    this.init()
  }
  // 初始化
  init() {
    const { material, texture, segments, radius, radialSegments, data, speed, renderOrder } = this.options
    this.texture = texture
    this.speed = typeof speed === 'number' ? speed : Number(speed)
    if (!isFinite(this.speed)) this.speed = 0

    data.map(path => {
      let pathPoint = []
      path.geometry.coordinates.map(coord => {
        coord[0].forEach(item => {
          let [x, y] = this.geoProjection(item)
          pathPoint.push(new Vector3(x, -y, 0))
        })
      })
      const curve = new CatmullRomCurve3(pathPoint)
      const tubeGeometry = new TubeGeometry(curve, segments, radius, radialSegments, false)
      const mesh = new Mesh(tubeGeometry, material)
      mesh.position.set(0, 0, 0)
      mesh.renderOrder = renderOrder
      this.instance.add(mesh)
    })

    this._onTick = delta => {
      if (this.run && this.texture) {
        const s = typeof this.speed === 'number' ? this.speed : 0
        this.texture.offset.x += s * delta
      }
    }

    this.time.on('tick', this._onTick)
  }

  setSpeed(speed) {
    const raw = typeof speed === 'number' ? speed : Number(speed)
    if (!isFinite(raw)) return
    this.speed = raw
  }

  destroy() {
    this.run = false

    if (this._onTick && this.time?.off) {
      this.time.off('tick', this._onTick)
    }

    if (this.instance?.children?.length) {
      this.instance.children.forEach(child => {
        if (child?.geometry?.dispose) {
          child.geometry.dispose()
        }
      })

      this.instance.clear()
    }
  }

  // 获取实例
  getInstance() {
    return this.instance
  }
  // 设置父级
  setParent(parent) {
    parent.add(this.instance)
  }
  // 设置隐藏显示
  set visible(bool) {
    this.instance.visible = bool
    this.run = bool
  }
}
