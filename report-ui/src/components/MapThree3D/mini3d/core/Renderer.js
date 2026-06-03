import { SRGBColorSpace, WebGLRenderer } from 'three'
export class Renderer {
  constructor({ canvas, sizes, scene, camera, postprocessing = false, composer = null }) {
    this.canvas = canvas
    this.sizes = sizes
    this.scene = scene
    this.camera = camera
    this.postprocessing = postprocessing
    this.composer = composer
    this.setInstance()
  }
  setInstance() {
    this.instance = new WebGLRenderer({
      alpha: true,
      antialias: true,
      canvas: this.canvas
    })
    this.instance.setClearColor(0x000000, 0)
    const width = this.sizes.layoutWidth ?? this.sizes.width
    const height = this.sizes.layoutHeight ?? this.sizes.height
    this.instance.setSize(width, height, false)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
  }
  resize() {
    const width = this.sizes.layoutWidth ?? this.sizes.width
    const height = this.sizes.layoutHeight ?? this.sizes.height
    this.instance.setSize(width, height, false)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
  }
  update() {
    if (this.postprocessing && this.composer) {
      this.composer.render()
    } else {
      this.instance.render(this.scene, this.camera.instance)
    }
  }
  destroy() {
    if (this.instance) {
      this.instance.dispose()
    }
  }
}
