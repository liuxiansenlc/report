import { ConfigType, PackagesCategoryEnum, ChartFrameEnum } from '@/packages/index.d'
import { ChatCategoryEnum, ChatCategoryEnumName } from '../../index.d'

export const MapThree3DConfig: ConfigType = {
    key: 'MapThree3D',//组件/图表的唯一标识（用来索引这个图表类型）
    chartKey: 'VMapThree3D',//图表渲染组件的 key对应实际 Vue 组件名/注册名
    conKey: 'VCMapThree3D',//配置面板（控制器/右侧属性面板）组件的 key。
    title: 'Three3D地图',//在 UI 里展示的名称
    category: ChatCategoryEnum.MAP,//归类到 “地图” 分类,用于左侧组件库分组/筛选。
    categoryName: ChatCategoryEnumName.MAP,
    package: PackagesCategoryEnum.CHARTS,//属于 Charts 包（项目里组件分包管理）。
    chartFrame: ChartFrameEnum.COMMON,//属于通用图表框架
    image: 'map.png',//组件库里显示的缩略图资源名
    //数据通道声明
    visualChannels: [
        {
            key: 'name',
            name: '区域名称',
            type: 'dimension',//维度
            required: true
        },
        {
            key: 'value',
            name: '数值',
            type: 'metric',//指标
            required: true
        }
    ]
}
