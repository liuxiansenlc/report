import { EventEmitter } from './EventEmitter'

export class Sizes extends EventEmitter {
  constructor({ canvas }) {
    super()

    this.canvas = canvas
    this.target = canvas?.parentNode || canvas

    this.width = 0
    this.height = 0
    this.layoutWidth = 0
    this.layoutHeight = 0
    this.scaleX = 1
    this.scaleY = 1
    this.devicePixelRatio = 1
    this.pixelRatio = 1

    this._handleWindowResize = () => {
      this.refresh()
    }

    window.addEventListener('resize', this._handleWindowResize, { passive: true })

    if (typeof ResizeObserver !== 'undefined' && this.target) {
      this._resizeObserver = new ResizeObserver(() => {
        this.refresh()
      })
      this._resizeObserver.observe(this.target)
    }

    this.refresh(true)
    this._startWatch()
  }

  _startWatch() {
    this._rafId = window.requestAnimationFrame(() => {
      this.refresh()
      this._startWatch()
    })
  }

  _measure() {
    const el = this.target
    if (!el) {
      return {
        width: 0,
        height: 0,
        layoutWidth: 0,
        layoutHeight: 0,
        scaleX: 1,
        scaleY: 1
      }
    }

    const layoutWidth = el.offsetWidth || 0
    const layoutHeight = el.offsetHeight || 0

    if (typeof el.getBoundingClientRect === 'function') {
      const rect = el.getBoundingClientRect()
      const width = rect.width || 0
      const height = rect.height || 0

      const scaleX = layoutWidth ? width / layoutWidth : 1
      const scaleY = layoutHeight ? height / layoutHeight : 1

      return { width, height, layoutWidth, layoutHeight, scaleX, scaleY }
    }

    return {
      width: layoutWidth,
      height: layoutHeight,
      layoutWidth,
      layoutHeight,
      scaleX: 1,
      scaleY: 1
    }
  }

  refresh(force = false) {
    const next = this._measure()
    const nextWidth = Math.round(next.width)
    const nextHeight = Math.round(next.height)

    if (nextWidth <= 0 || nextHeight <= 0) {
      return
    }

    const nextDevicePixelRatio = window.devicePixelRatio || 1
    const viewportScale = Math.min(next.scaleX || 1, next.scaleY || 1)
    const nextPixelRatio = Math.max(0.1, Math.min(nextDevicePixelRatio, 2) * viewportScale)

    const changed =
      force ||
      nextWidth !== this.width ||
      nextHeight !== this.height ||
      next.layoutWidth !== this.layoutWidth ||
      next.layoutHeight !== this.layoutHeight ||
      next.scaleX !== this.scaleX ||
      next.scaleY !== this.scaleY ||
      nextDevicePixelRatio !== this.devicePixelRatio ||
      nextPixelRatio !== this.pixelRatio

    this.width = nextWidth
    this.height = nextHeight
    this.layoutWidth = next.layoutWidth
    this.layoutHeight = next.layoutHeight
    this.scaleX = next.scaleX
    this.scaleY = next.scaleY
    this.devicePixelRatio = nextDevicePixelRatio
    this.pixelRatio = nextPixelRatio

    if (changed) {
      this.emit('resize', {
        width: this.width,
        height: this.height,
        layoutWidth: this.layoutWidth,
        layoutHeight: this.layoutHeight,
        scaleX: this.scaleX,
        scaleY: this.scaleY,
        devicePixelRatio: this.devicePixelRatio,
        pixelRatio: this.pixelRatio
      })
    }
  }

  init() {
    this.refresh(true)
  }

  destroy() {
    this.off('resize')

    if (this._rafId) {
      window.cancelAnimationFrame(this._rafId)
      this._rafId = null
    }

    if (this._resizeObserver) {
      this._resizeObserver.disconnect()
      this._resizeObserver = null
    }

    if (this._handleWindowResize) {
      window.removeEventListener('resize', this._handleWindowResize)
      this._handleWindowResize = null
    }
  }
}
