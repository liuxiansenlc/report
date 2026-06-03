import { PerspectiveCamera, OrthographicCamera, Vector3 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

//相机管理：
//1.支持两种相机类型：正交相机(OrthographicCamera)和透视相机(PerspectiveCamera)
//2.默认使用正交相机，适合地图等需要保持比例的场景

//相机控制器集成
//集成 OrbitControls 轨道控制器，支持鼠标交互控制相机
//启用阻尼效果，使交互更自然

//响应式设计
// 提供 resize 方法，适应窗口大小变化
export class Camera {
  constructor({ sizes, scene, canvas }, options = { isOrthographic: false }) {
    this.sizes = sizes
    this.scene = scene
    this.canvas = canvas
    this.options = Object.assign({ isOrthographic: false }, options)
    this.setInstance()
  }

  /**
   * 初始化相机实例
   */
  setInstance() {
    this.instance = null
    this.setCamera(this.options.isOrthographic)

    this.instance.position.set(10, 10, 10)

    this.scene.add(this.instance)
  }
  /**
   * 设置当前相机
   * @param {*} isOrthographic true 默认正交相机，false 透视相机
   */
  setCamera(isOrthographic = true) {
    let aspect = this.sizes.width / this.sizes.height
    if (isOrthographic) {
      let s = 120
      this.instance = new OrthographicCamera(-s * aspect, s * aspect, s, -s, 1, 10000)
    } else {
      // 透视相机
      this.instance = new PerspectiveCamera(45, aspect, 1, 10000)
    }
    this.setControls()
  }
  /**
   * 设置相机控制器
   */
  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true //启动阻尼效果
    this.controls.update()
  }
  resize() {
    let aspect = this.sizes.width / this.sizes.height
    if (this.options.isOrthographic) {
      let s = 120
      this.instance.left = -s * aspect
      this.instance.right = s * aspect
      this.instance.top = s
      this.instance.bottom = -s
    } else {
      this.instance.aspect = aspect
    }
    this.instance.updateProjectionMatrix()
  }
  update() {
    this.controls.update()
  }
  destroy() {
    this.controls.dispose()
  }
}
