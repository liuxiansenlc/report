// 内置地图层级树数据 - 使用 DataV 数据源

export interface MapTreeNode {
  name: string
  adcode: string
  children?: MapTreeNode[]
}

// DataV 地图树数据
let mapTreeData: MapTreeNode | null = null
let initPromise: Promise<void> | null = null

// 省份 adcode 映射
const PROVINCES: Record<string, string> = {
  '110000': '北京市', '120000': '天津市', '130000': '河北省', '140000': '山西省',
  '150000': '内蒙古自治区', '210000': '辽宁省', '220000': '吉林省', '230000': '黑龙江省',
  '310000': '上海市', '320000': '江苏省', '330000': '浙江省', '340000': '安徽省',
  '350000': '福建省', '360000': '江西省', '370000': '山东省', '410000': '河南省',
  '420000': '湖北省', '430000': '湖南省', '440000': '广东省', '450000': '广西壮族自治区',
  '460000': '海南省', '500000': '重庆市', '510000': '四川省', '520000': '贵州省',
  '530000': '云南省', '540000': '西藏自治区', '610000': '陕西省', '620000': '甘肃省',
  '630000': '青海省', '640000': '宁夏回族自治区', '650000': '新疆维吾尔自治区',
  '710000': '台湾省', '810000': '香港特别行政区', '820000': '澳门特别行政区',
}

// 从 GeoJSON 提取子区域
const extractChildren = (geojson: any): MapTreeNode[] => {
  const children: MapTreeNode[] = []
  if (geojson?.features) {
    for (const feature of geojson.features) {
      const props = feature.properties || {}
      if (props.adcode && props.name) {
        children.push({
          name: props.name,
          adcode: String(props.adcode)
        })
      }
    }
  }
  return children
}

// 初始化地图树数据
export const initMapTreeData = async (): Promise<void> => {
  if (mapTreeData) return
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      // 加载全国数据获取省份列表
      const chinaResponse = await fetch('/geojson_datav/100000.json')
      const chinaData = await chinaResponse.json()
      const provinces = extractChildren(chinaData)

      // 构建地图树
      mapTreeData = {
        name: '中国',
        adcode: '100000',
        children: provinces
      }

      // 异步加载各省的城市数据
      for (const province of provinces) {
        try {
          const provResponse = await fetch(`/geojson_datav/${province.adcode}.json`)
          if (provResponse.ok) {
            const provData = await provResponse.json()
            province.children = extractChildren(provData)
          }
        } catch {
          // 忽略加载失败的省份
        }
      }
    } catch (e) {
      console.error('[mapList] 加载地图树数据失败:', e)
      mapTreeData = { name: '中国', adcode: '100000', children: [] }
    }
  })()

  return initPromise
}

// 同步获取地图树数据
export const getMapTreeData = (): MapTreeNode => {
  return mapTreeData || { name: '中国', adcode: '100000', children: [] }
}

// 级联选择器选项
export interface CascaderOption {
  label: string
  value: string
  children?: CascaderOption[]
}

// 转换为级联选项
const convertToCascaderOptions = (nodes: MapTreeNode[]): CascaderOption[] => {
  return nodes.map(node => {
    const option: CascaderOption = {
      label: node.name,
      value: node.adcode
    }
    if (node.children && node.children.length > 0) {
      option.children = convertToCascaderOptions(node.children)
    }
    return option
  })
}

// 获取级联选择器选项
export const getCascaderOptions = (): CascaderOption[] => {
  const root = getMapTreeData()
  // 返回全国作为第一级，省份作为第二级
  return [{
    label: root.name,
    value: root.adcode,
    children: root.children ? convertToCascaderOptions(root.children) : []
  }]
}

// 根据 adcode 查找地图名称
export const getMapNameByCode = (code: string): string => {
  const root = getMapTreeData()
  if (root.adcode === code) return root.name

  const findName = (nodes: MapTreeNode[]): string | null => {
    for (const node of nodes) {
      if (node.adcode === code) return node.name
      if (node.children) {
        const found = findName(node.children)
        if (found) return found
      }
    }
    return null
  }

  return (root.children && findName(root.children)) || PROVINCES[code] || code
}

// 扁平化地图列表
export interface FlatMapItem {
  code: string
  name: string
  fullName: string
  level: number
}

export const getFlatMapList = (): FlatMapItem[] => {
  const list: FlatMapItem[] = []
  const root = getMapTreeData()

  // 添加全国
  list.push({ code: root.adcode, name: root.name, fullName: root.name, level: 0 })

  const traverse = (nodes: MapTreeNode[], parentNames: string[], level: number) => {
    for (const node of nodes) {
      const currentNames = [...parentNames, node.name]
      list.push({
        code: node.adcode,
        name: node.name,
        fullName: currentNames.join(' / '),
        level
      })
      if (node.children) {
        traverse(node.children, currentNames, level + 1)
      }
    }
  }

  if (root.children) {
    traverse(root.children, [root.name], 1)
  }
  return list
}

// 根据名称查找 adcode
export const findAdcodeByName = (name: string, parentCode?: string): string | null => {
  const cleanName = name.replace(/(省|市|区|县|自治区|自治州|自治县|特别行政区)$/g, '')
  const root = getMapTreeData()

  let exactMatch: string | null = null
  let fuzzyMatch: string | null = null

  const findInNodes = (nodes: MapTreeNode[]): void => {
    for (const node of nodes) {
      if (node.name === name) {
        exactMatch = node.adcode
        return
      }
      const nodeCleanName = node.name.replace(/(省|市|区|县|自治区|自治州|自治县|特别行政区)$/g, '')
      if (!fuzzyMatch && (nodeCleanName === cleanName || node.name === cleanName)) {
        fuzzyMatch = node.adcode
      }
    }
  }

  // 递归搜索所有节点
  const findInAllNodes = (nodes: MapTreeNode[]): void => {
    for (const node of nodes) {
      if (node.name === name) {
        exactMatch = node.adcode
        return
      }
      const nodeCleanName = node.name.replace(/(省|市|区|县|自治区|自治州|自治县|特别行政区)$/g, '')
      if (!fuzzyMatch && (nodeCleanName === cleanName || node.name === cleanName)) {
        fuzzyMatch = node.adcode
      }
      if (node.children && !exactMatch) {
        findInAllNodes(node.children)
      }
    }
  }

  if (parentCode) {
    // 在指定父级下查找
    const findParent = (nodes: MapTreeNode[]): MapTreeNode | null => {
      for (const node of nodes) {
        if (node.adcode === parentCode) return node
        if (node.children) {
          const found = findParent(node.children)
          if (found) return found
        }
      }
      return null
    }
    const parent = root.adcode === parentCode ? root : (root.children && findParent(root.children))
    if (parent?.children) {
      findInNodes(parent.children)
    }

    // 如果在父级下没找到，尝试全局搜索
    if (!exactMatch && !fuzzyMatch && root.children) {
      findInAllNodes(root.children)
    }
  } else if (root.children) {
    // 全局搜索
    findInAllNodes(root.children)
  }

  return exactMatch || fuzzyMatch
}

// 获取子级 adcode 列表
export const getChildrenAdcodes = (parentCode: string): string[] => {
  const root = getMapTreeData()

  const findNode = (nodes: MapTreeNode[]): MapTreeNode | null => {
    for (const node of nodes) {
      if (node.adcode === parentCode) return node
      if (node.children) {
        const found = findNode(node.children)
        if (found) return found
      }
    }
    return null
  }

  const target = root.adcode === parentCode ? root : (root.children && findNode(root.children))
  return target?.children?.map(c => c.adcode) || []
}

// 检查是否有子级地图
export const hasChildrenMap = (code: string): boolean => {
  const root = getMapTreeData()

  const findNode = (nodes: MapTreeNode[]): MapTreeNode | null => {
    for (const node of nodes) {
      if (node.adcode === code) return node
      if (node.children) {
        const found = findNode(node.children)
        if (found) return found
      }
    }
    return null
  }

  const target = root.adcode === code ? root : (root.children && findNode(root.children))
  return !!(target?.children && target.children.length > 0)
}

// 加载地图 GeoJSON 数据
export const loadMapGeoJson = async (code: string): Promise<any> => {
  try {
    const response = await fetch(`/geojson_datav/${code}.json`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    return await response.json()
  } catch (e) {
    console.error(`[mapList] 加载地图数据失败: ${code}`, e)
    return null
  }
}
