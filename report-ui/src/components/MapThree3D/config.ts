import { echartOptionProfixHandle, PublicConfigClass } from '@/packages/public'
import { MapThree3DConfig } from './index'
import { chartInitConfig } from '@/settings/designSetting'
import { CreateComponentType } from '@/packages/index.d'
import cloneDeep from 'lodash/cloneDeep'
import dataJson from './data.json'

export const includes = []


const optionData = {
  base: {
    area: {
      areaJson: "",
      areaName: "",
      areCode: "",
      mapDepth: 5,
      pointCenter: [108.55, 34.32],//中心位置
    },
    camera: {
      cameraPosition: {
        x: 3.134497983573052,
        y: 126.8312346165316,
        z: 78.77649752477839
      },
      cameraLookAt: {
        x: 0,
        y: 0,
        z: 0
      }
    },
    drill: {
      isDrill: true,
      drillLevel: 2,
    },
    areaLabel: {

    }
  },
  environment: {},
  material: {},
  layer: {},
  effect: {},
  animation: {}
}

export const option = {
  dataset: dataJson,
  scene: {
    camera: {
      cameraPosition: {
        x: 3.134497983573052,
        y: 126.8312346165316,
        z: 78.77649752477839
      },
      cameraLookAt: {
        x: 0,
        y: 0,
        z: 0
      }
    },
    pointCenter: [108.55, 34.32],//中心位置
    // flyLineCenter: [116.41995, 40.18994],
    depth: 5, //地图厚度
    baseLabelNameScale: 0.1, //区域名称缩放
    baseLabelNameColor: '#5fc6dc', //区域名称颜色
    baseLabelNameFontFamily: '', //区域名称字体族
    baseLabelNameFontId: '', //区域名称字体ID
    provinceNameOffset: [0, 0], //区域名称位置偏移 [x, y]
    environment: {
      fogEnabled: true,
      ambientLightIntensity: 2,
      ambientLightColor: '#FFFFFF',
      directionalLightIntensity: 4,
      directionalLightColor: '#FFFFFF',
      fogColor: '#011024',
      fogNear: 1,
      fogFar: 500
    },
    effect: {
      rotateBorderVisible: true,
      rotateBorderColor: '#48afff',
      rotateBorderOuterOpacity: 0.2,
      rotateBorderOuterSpeed: 0.001,
      rotateBorderInnerOpacity: 0.4,
      rotateBorderInnerSpeed: -0.004,
      floorVisible: true,
      floorColor: '#ffffff',
      gridRippleVisible: true,
      gridRippleDiffuseEnabled: true,
      gridRippleColor: '#00ffff',
      particlesVisible: true,
      particlesColor: '#00eeee'
    },
    label: {
      areaName: false,//区域名称
      dataLabel: false,//区域数据
      areaPoint: false//区域标点
    },
    style: {
      provinceLineColor: '#2bc4dc',//省边缘轮廓线
      provinceLineWidth: 1,//省边缘轮廓线宽度
      provinceTopColor: '#061e47',
      provinceTopTexture: '',
      provinceSideColor: '#ffffff',
      provinceSideTexture: '',
      hoverEmissiveColor: '#0b112d',
      hoverEmissiveIntensity: 1.5,
      hoverLiftScale: 1.5,
      strokeColor: '#2bc4dc'//描边颜色
    },
    animation: {
      strokeVisible: true,
      strokeSpeed: 0.2,
      strokeWidth: 0.2,
      enterCamera: true,
      enterCameraDelay: 2,       // 相机飞入延迟（秒）
      enterCameraDuration: 2.5,  // 相机飞入时长（秒）
      enterTimeScale: 1          // 整体动画速度倍率
    },
    controls: {
      zoom: true,
      pan: true,
      rotate: true
    },
    //是否下钻
    drill: {
      isDrill: true,
      drillLevel: 2,
    },
  },
  three3dMap: {
    mapSource: '',
    mapName: "",
    mapCode: ""
  },
  layers: [] as LayerItem[]
}

export interface LayerCondition {
  field: string
  operator: '==' | '!=' | '>' | '>=' | '<' | '<='
  value: any
  style: {
    image?: string
    color?: string
    size?: number
    opacity?: number
    labelVisible?: boolean
    labelColor?: string
    labelSize?: number
  }
}

export interface DistributionRange {
  min?: number   // 可选，不填则自动等分
  max?: number   // 可选，不填则自动等分
  color: string
  label: string
}

export interface LayerItem {
  id: string
  name: string
  type: 'point' | 'distribution'
  visible: boolean
  modelId: string
  modelName: string
  modelFields: string[]
  dataMapping: {
    lng: string
    lat: string
    label: string
    name: string    // 区域名称字段（分布图层用）
    value: string   // 数值字段（分布图层用）
  }
  style: {
    image: string
    color: string
    size: number
    opacity: number
    labelVisible: boolean
    labelColor: string
    labelSize: number
    labelField: string
  }
  conditions: LayerCondition[]
  // 分布图层专属
  distribution: {
    colorEnabled: boolean       // 是否启用颜色渲染
    ranges: DistributionRange[] // 值区间配置
    defaultColor: string        // 无匹配时的颜色
    tooltipEnabled: boolean     // 是否显示tooltip
  }
}
export const MapDefaultConfig = { ...option }
export default class Config extends PublicConfigClass implements CreateComponentType {
  public key: string = MapThree3DConfig.key
  public attr = { ...chartInitConfig, w: 750, h: 800, zIndex: -1 }
  public chartConfig = cloneDeep(MapThree3DConfig)
  public option = echartOptionProfixHandle(option, includes)
}
