<template>
  <template v-if="showPackageStyleEntry">
    <ConfigSection title="样式设置" :expanded="true">
      <n-button type="primary" block @click="showModal = true">
        <template #icon><n-icon :component="SettingsOutline" /></template>
        打开样式设置
      </n-button>
    </ConfigSection>
    <n-modal
      v-model:show="showModal"
      preset="dialog"
      title="Three3D地图设置"
      style="width: 1000px"
      :show-icon="false"
      :closable="false"
      :mask-closable="false"
    >
      <div class="advanced-config-container">
        <div class="preview-panel">
          <div class="preview-title">实时预览</div>
          <div class="preview-content">
            <mapScene :option-data="optionData" />
          </div>
        </div>
        <div class="config-panel">
          <n-tabs type="line" animated>
            <n-tab-pane name="map" tab="基础">
              <div class="tab-content">
                <n-form size="small" label-placement="left" label-width="80">
                  <n-divider title-placement="left">区域</n-divider>
                  <n-grid :cols="2" :x-gap="12" :y-gap="0">
                    <n-form-item-gi label="选择地图">
                      <n-cascader
                        v-model:value="selectedMapCode"
                        :options="builtInMapOptions"
                        check-strategy="all"
                        :show-path="false"
                        filterable
                        placeholder="选择地图"
                        @update:value="onBuiltInMapChange"
                      />
                    </n-form-item-gi>
                    <n-form-item-gi label="地图厚度">
                      <n-input-number v-model:value="sceneList.depth" size="small" :min="1" :max="5" :step="1" />
                    </n-form-item-gi>
                    <n-form-item-gi label="中心经度">
                      <n-input-number v-model:value="optionData.scene.pointCenter[0]" :show-button="false" />
                    </n-form-item-gi>
                    <n-form-item-gi label="中心维度">
                      <n-input-number v-model:value="optionData.scene.pointCenter[1]" :show-button="false" />
                    </n-form-item-gi>
                  </n-grid>
                  <n-divider title-placement="left">相机</n-divider>
                  <n-grid :cols="3" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="位置X">
                      <n-input-number v-model:value="sceneList.camera.cameraPosition.x" size="small" :show-button="false" />
                    </n-form-item-gi>
                    <n-form-item-gi label="位置Y">
                      <n-input-number v-model:value="sceneList.camera.cameraPosition.y" size="small" :show-button="false" />
                    </n-form-item-gi>
                    <n-form-item-gi label="位置Z">
                      <n-input-number v-model:value="sceneList.camera.cameraPosition.z" size="small" :show-button="false" />
                    </n-form-item-gi>
                    <n-form-item-gi label="目标X">
                      <n-input-number v-model:value="cameraOptions.cameraLookAt.x" size="small" :show-button="false" />
                    </n-form-item-gi>
                    <n-form-item-gi label="目标Y">
                      <n-input-number v-model:value="cameraOptions.cameraLookAt.y" size="small" :show-button="false" />
                    </n-form-item-gi>
                    <n-form-item-gi label="目标Z">
                      <n-input-number v-model:value="cameraOptions.cameraLookAt.z" size="small" :show-button="false" />
                    </n-form-item-gi>
                  </n-grid>
                  <n-divider title-placement="left">下钻</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="启用下钻">
                      <n-switch v-model:value="sceneList.drill.isDrill" />
                    </n-form-item-gi>
                    <n-form-item-gi label="最大层级">
                      <n-input-number v-model:value="sceneList.drill.drillLevel" size="small" :min="0" :max="2" :step="1" />
                    </n-form-item-gi>
                  </n-grid>
                  <n-divider title-placement="left">区域标签</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="显示">
                      <n-switch v-model:value="sceneList.label.areaName" />
                    </n-form-item-gi>
                    <n-form-item-gi label="字体大小">
                      <n-input-number v-model:value="sceneList.baseLabelNameScale" size="small" :min="0.05" :max="0.3" :step="0.005" />
                    </n-form-item-gi>
                    <n-form-item-gi label="字体颜色">
                      <n-color-picker v-model:value="sceneList.baseLabelNameColor" size="small" />
                    </n-form-item-gi>
                    <n-form-item-gi label="字体族">
                      <n-input-group>
                        <n-input v-model:value="sceneList.baseLabelNameFontFamily" size="small" placeholder="选择字体" readonly />
                        <n-button size="small" @click="showLabelFontSelector = true">
                          <template #icon><n-icon :component="TextOutline" /></template>
                        </n-button>
                      </n-input-group>
                    </n-form-item-gi>
                    <n-form-item-gi label="X偏移">
                      <n-input-number v-model:value="sceneList.provinceNameOffset[0]" size="small" :step="0.1" />
                    </n-form-item-gi>
                    <n-form-item-gi label="Y偏移">
                      <n-input-number v-model:value="sceneList.provinceNameOffset[1]" size="small" :step="0.1" />
                    </n-form-item-gi>
                  </n-grid>
                  <n-divider title-placement="left">交互</n-divider>
                  <n-grid :cols="3" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="滚轮缩放">
                      <n-switch v-model:value="sceneList.controls.zoom" />
                    </n-form-item-gi>
                    <n-form-item-gi label="右键漫游">
                      <n-switch v-model:value="sceneList.controls.pan" />
                    </n-form-item-gi>
                    <n-form-item-gi label="视角旋转">
                      <n-switch v-model:value="sceneList.controls.rotate" />
                    </n-form-item-gi>
                  </n-grid>
                </n-form>
              </div>
            </n-tab-pane>
            <n-tab-pane name="environment" tab="环境">
              <div class="tab-content">
                <n-form size="small" label-placement="left" label-width="80">
                  <n-divider title-placement="left">雾效</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="启动雾效">
                      <n-switch v-model:value="sceneList.environment.fogEnabled" />
                    </n-form-item-gi>
                    <n-form-item-gi label="雾颜色">
                      <n-color-picker v-model:value="sceneList.environment.fogColor" :show-alpha="false" size="small" />
                    </n-form-item-gi>
                    <n-form-item-gi label="近距离">
                      <n-input-number v-model:value="sceneList.environment.fogNear" size="small" :min="1" :step="1" />
                    </n-form-item-gi>
                    <n-form-item-gi label="远距离雾">
                      <n-input-number v-model:value="sceneList.environment.fogFar" size="small" :min="1" :step="10" />
                    </n-form-item-gi>
                  </n-grid>
                  <n-divider title-placement="left">环境光</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="强度">
                      <n-input-number v-model:value="sceneList.environment.ambientLightIntensity" size="small" :min="0" :step="0.1" />
                    </n-form-item-gi>
                    <n-form-item-gi label="颜色">
                      <n-color-picker v-model:value="sceneList.environment.ambientLightColor" :show-alpha="false" size="small" />
                    </n-form-item-gi>
                  </n-grid>
                  <n-divider title-placement="left">方向光</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="强度">
                      <n-input-number v-model:value="sceneList.environment.directionalLightIntensity" size="small" :min="0" :step="0.1" />
                    </n-form-item-gi>
                    <n-form-item-gi label="颜色">
                      <n-color-picker v-model:value="sceneList.environment.directionalLightColor" :show-alpha="false" size="small" />
                    </n-form-item-gi>
                  </n-grid>
                </n-form>
              </div>
            </n-tab-pane>
            <n-tab-pane name="material" tab="材质">
              <div class="tab-content">
                <n-form size="small" label-placement="left" label-width="80">
                  <n-divider title-placement="left">顶部</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="颜色">
                      <n-color-picker v-model:value="sceneList.style.provinceTopColor" :show-alpha="false" size="small" />
                    </n-form-item-gi>
                    <n-form-item-gi label="纹理">
                      <n-space vertical :size="6" style="width: 100%">
                        <n-upload accept="image/*" :max="1" :show-file-list="false" :before-upload="beforeUploadProvinceTopTexture" :custom-request="uploadProvinceTopTexture">
                          <n-upload-dragger>
                            <div style="display:flex;align-items:center;justify-content:center;width:100%;height:34px">
                              <img v-if="sceneList.style.provinceTopTexture" :src="sceneList.style.provinceTopTexture" alt="纹理" style="max-width:100%;max-height:34px;object-fit:contain" />
                              <div v-else style="display:flex;align-items:center;gap:6px">
                                <n-icon :component="ImageOutline" size="16" /><span>上传</span>
                              </div>
                            </div>
                          </n-upload-dragger>
                        </n-upload>
                        <n-button v-if="sceneList.style.provinceTopTexture" size="tiny" type="error" secondary @click="clearProvinceTopTexture">清除</n-button>
                      </n-space>
                    </n-form-item-gi>
                  </n-grid>
                  <n-divider title-placement="left">侧面</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="颜色">
                      <n-color-picker v-model:value="sceneList.style.provinceSideColor" :show-alpha="false" size="small" />
                    </n-form-item-gi>
                    <n-form-item-gi label="纹理">
                      <n-space vertical :size="6" style="width: 100%">
                        <n-upload accept="image/*" :max="1" :show-file-list="false" :before-upload="beforeUploadProvinceSideTexture" :custom-request="uploadProvinceSideTexture">
                          <n-upload-dragger>
                            <div style="display:flex;align-items:center;justify-content:center;width:100%;height:34px">
                              <img v-if="sceneList.style.provinceSideTexture" :src="sceneList.style.provinceSideTexture" alt="纹理" style="max-width:100%;max-height:34px;object-fit:contain" />
                              <div v-else style="display:flex;align-items:center;gap:6px">
                                <n-icon :component="ImageOutline" size="16" /><span>上传</span>
                              </div>
                            </div>
                          </n-upload-dragger>
                        </n-upload>
                        <n-button v-if="sceneList.style.provinceSideTexture" size="tiny" type="error" secondary @click="clearProvinceSideTexture">清除</n-button>
                      </n-space>
                    </n-form-item-gi>
                  </n-grid>
                  <n-divider title-placement="left">边界线</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="颜色">
                      <n-color-picker v-model:value="sceneList.style.provinceLineColor" :show-alpha="false" size="small" />
                    </n-form-item-gi>
                    <n-form-item-gi label="线宽">
                      <n-input-number v-model:value="sceneList.style.provinceLineWidth" size="small" :min="1" :max="10" :step="0.5" />
                    </n-form-item-gi>
                  </n-grid>
                  <n-divider title-placement="left">悬停效果</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="颜色">
                      <n-color-picker v-model:value="sceneList.style.hoverEmissiveColor" :show-alpha="false" size="small" />
                    </n-form-item-gi>
                    <n-form-item-gi label="发光强度">
                      <n-input-number v-model:value="sceneList.style.hoverEmissiveIntensity" :min="0" :max="10" :step="0.1" size="small" />
                    </n-form-item-gi>
                    <n-form-item-gi label="抬起倍数">
                      <n-input-number v-model:value="sceneList.style.hoverLiftScale" :min="1" :max="3" :step="0.1" size="small" />
                    </n-form-item-gi>
                  </n-grid>
                </n-form>
              </div>
            </n-tab-pane>
            <n-tab-pane name="effect" tab="特效">
              <div class="tab-content">
                <n-form size="small" label-placement="left" label-width="80">
                  <n-divider title-placement="left">描边动画</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="启用">
                      <n-switch v-model:value="sceneList.animation.strokeVisible" />
                    </n-form-item-gi>
                    <n-form-item-gi label="颜色">
                      <n-color-picker v-model:value="sceneList.style.strokeColor" :show-alpha="false" size="small" />
                    </n-form-item-gi>
                    <n-form-item-gi label="速度">
                      <n-input-number v-model:value="sceneList.animation.strokeSpeed" :min="0" :max="1" :step="0.01" size="small" />
                    </n-form-item-gi>
                    <n-form-item-gi label="线宽">
                      <n-input-number v-model:value="sceneList.animation.strokeWidth" :min="0.01" :max="1" :step="0.01" size="small" />
                    </n-form-item-gi>
                  </n-grid>
                  <n-divider title-placement="left">旋转光圈</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="启用">
                      <n-switch v-model:value="sceneList.effect.rotateBorderVisible" />
                    </n-form-item-gi>
                    <n-form-item-gi label="颜色">
                      <n-color-picker v-model:value="sceneList.effect.rotateBorderColor" :show-alpha="false" size="small" />
                    </n-form-item-gi>
                    <n-form-item-gi label="外圈透明度">
                      <n-input-number v-model:value="sceneList.effect.rotateBorderOuterOpacity" :min="0" :max="1" :step="0.01" size="small" />
                    </n-form-item-gi>
                    <n-form-item-gi label="外圈速度">
                      <n-input-number v-model:value="sceneList.effect.rotateBorderOuterSpeed" :min="-0.02" :max="0.02" :step="0.0001" size="small" />
                    </n-form-item-gi>
                    <n-form-item-gi label="内圈透明度">
                      <n-input-number v-model:value="sceneList.effect.rotateBorderInnerOpacity" :min="0" :max="1" :step="0.01" size="small" />
                    </n-form-item-gi>
                    <n-form-item-gi label="内圈速度">
                      <n-input-number v-model:value="sceneList.effect.rotateBorderInnerSpeed" :min="-0.02" :max="0.02" :step="0.0001" size="small" />
                    </n-form-item-gi>
                  </n-grid>
                  <n-divider title-placement="left">底部高光</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="启用">
                      <n-switch v-model:value="sceneList.effect.floorVisible" />
                    </n-form-item-gi>
                    <n-form-item-gi label="颜色">
                      <n-color-picker v-model:value="sceneList.effect.floorColor" :show-alpha="false" size="small" />
                    </n-form-item-gi>
                  </n-grid>
                  <n-divider title-placement="left">网格波纹</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="启用">
                      <n-switch v-model:value="sceneList.effect.gridRippleVisible" />
                    </n-form-item-gi>
                    <n-form-item-gi label="扩散启用">
                      <n-switch v-model:value="sceneList.effect.gridRippleDiffuseEnabled" />
                    </n-form-item-gi>
                    <n-form-item-gi label="颜色">
                      <n-color-picker v-model:value="sceneList.effect.gridRippleColor" :show-alpha="false" size="small" />
                    </n-form-item-gi>
                  </n-grid>
                  <n-divider title-placement="left">粒子</n-divider>
                  <n-grid :cols="2" :x-gap="0" :y-gap="0">
                    <n-form-item-gi label="启用">
                      <n-switch v-model:value="sceneList.effect.particlesVisible" />
                    </n-form-item-gi>
                    <n-form-item-gi label="颜色">
                      <n-color-picker v-model:value="sceneList.effect.particlesColor" :show-alpha="false" size="small" />
                    </n-form-item-gi>
                  </n-grid>
                </n-form>
              </div>
            </n-tab-pane>
            <n-tab-pane name="animation" tab="动画">
              <div class="tab-content">
                <n-form size="small" label-placement="left" label-width="90">
                  <n-divider title-placement="left">入场动画</n-divider>
                  <n-grid :cols="2" :x-gap="8" :y-gap="0">
                    <n-form-item-gi label="启用">
                      <n-switch v-model:value="sceneList.animation.enterCamera" />
                    </n-form-item-gi>
                    <n-form-item-gi label="速度倍率">
                      <n-input-number
                        v-model:value="sceneList.animation.enterTimeScale"
                        size="small" :min="0.1" :max="5" :step="0.1"
                        :disabled="!sceneList.animation.enterCamera"
                      />
                    </n-form-item-gi>
                    <n-form-item-gi label="相机延迟(s)">
                      <n-input-number
                        v-model:value="sceneList.animation.enterCameraDelay"
                        size="small" :min="0" :max="10" :step="0.5"
                        :disabled="!sceneList.animation.enterCamera"
                      />
                    </n-form-item-gi>
                    <n-form-item-gi label="相机时长(s)">
                      <n-input-number
                        v-model:value="sceneList.animation.enterCameraDuration"
                        size="small" :min="0.5" :max="10" :step="0.5"
                        :disabled="!sceneList.animation.enterCamera"
                      />
                    </n-form-item-gi>
                  </n-grid>
                </n-form>
              </div>
            </n-tab-pane>
            <n-tab-pane name="layers" tab="图层">
              <div class="tab-content">
                <div class="layer-list-toolbar">
                  <span style="font-size:12px;color:#aaa">共 {{ layerList.length }} 个图层</span>
                  <n-space :size="6">
                    <n-button size="small" type="primary" @click="addLayer('point')">+ 点图层</n-button>
                    <n-button
                      size="small"
                      type="primary"
                      :disabled="layerList.some(l => l.type === 'distribution')"
                      @click="addLayer('distribution')"
                    >+ 分布图层</n-button>
                  </n-space>
                </div>
                <div class="layer-table">
                  <div class="layer-table-head">
                    <span style="width:32px">显示</span>
                    <span style="flex:1">名称</span>
                    <span style="width:48px">类型</span>
                    <span style="width:80px">数据模型</span>
                    <span style="width:80px">操作</span>
                  </div>
                  <div v-if="layerList.length === 0" class="layer-table-empty">暂无图层，点击右上角添加</div>
                  <div v-for="(layer, index) in layerList" :key="layer.id" class="layer-table-row">
                    <span style="width:32px"><n-switch v-model:value="layer.visible" size="small" /></span>
                    <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ layer.name }}</span>
                    <span style="width:48px;color:#aaa">{{ layer.type === 'point' ? '点' : '分布' }}</span>
                    <span style="width:80px;color:#aaa;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ layer.modelName || '未绑定' }}</span>
                    <span style="width:80px;display:flex;gap:4px">
                      <n-button size="tiny" @click="openLayerEdit(index)">配置</n-button>
                      <n-button size="tiny" type="error" text @click="removeLayer(index)">删除</n-button>
                    </span>
                  </div>
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>
        </div>
      </div>
      <template #action>
        <div class="modal-actions">
          <n-button @click="handleCancel">取消</n-button>
          <n-button type="primary" @click="handleConfirm">确认</n-button>
        </div>
      </template>
    </n-modal>
  </template>

  <!-- 图层配置弹窗 -->
  <n-modal
    v-model:show="showLayerEditModal"
    preset="dialog"
    :title="`配置图层 - ${editingLayer?.name ?? ''}`"
    style="width: 860px"
    :show-icon="false"
    :mask-closable="false"
  >
    <div v-if="editingLayer" style="max-height:520px;overflow-y:auto;padding-right:4px">
      <n-form size="small" label-placement="left" label-width="72">
        <n-divider title-placement="left">基础</n-divider>
        <n-grid :cols="2" :x-gap="8">
          <n-form-item-gi label="图层名称">
            <n-input v-model:value="editingLayer.name" size="small" />
          </n-form-item-gi>
          <n-form-item-gi label="类型">
            <n-select v-model:value="editingLayer.type" :options="layerTypeOptions" size="small" />
          </n-form-item-gi>
        </n-grid>

        <n-divider title-placement="left">数据模型</n-divider>
        <n-form-item label="选择模型" label-placement="left" label-width="72">
          <n-tree-select
            v-model:value="editingLayer.modelId"
            :options="modelOptions"
            :loading="modelListLoading"
            filterable
            clearable
            placeholder="搜索并选择数据模型"
            size="small"
            key-field="key"
            label-field="label"
            children-field="children"
            @update:value="onLayerModelChange"
          />
        </n-form-item>
        <n-grid v-if="editingLayer.modelFields?.length && editingLayer.type === 'point'" :cols="3" :x-gap="8">
          <n-form-item-gi label="经度字段">
            <n-select v-model:value="editingLayer.dataMapping.lng" :options="layerFieldOptions" size="small" clearable />
          </n-form-item-gi>
          <n-form-item-gi label="纬度字段">
            <n-select v-model:value="editingLayer.dataMapping.lat" :options="layerFieldOptions" size="small" clearable />
          </n-form-item-gi>
          <n-form-item-gi label="标注字段">
            <n-select v-model:value="editingLayer.dataMapping.label" :options="layerFieldOptions" size="small" clearable />
          </n-form-item-gi>
        </n-grid>
        <template v-if="editingLayer.type === 'point'">
          <div v-if="editingLayer.modelId && !editingLayer.modelFields?.length" style="font-size:11px;color:#888;margin-bottom:8px">加载字段中...</div>
        </template>
        <!-- 点标注专属配置 -->
        <template v-if="editingLayer.type === 'point'">
        <n-divider title-placement="left">默认样式</n-divider>
        <n-grid :cols="2" :x-gap="8">
          <n-form-item-gi label="标注图片" :span="2">
            <n-space align="center" :size="6">
              <n-upload accept="image/*" :max="1" :show-file-list="false" :custom-request="uploadLayerImage">
                <n-button size="small"><template #icon><n-icon :component="ImageOutline" /></template>上传图片</n-button>
              </n-upload>
              <img v-if="editingLayer.style.image" :src="editingLayer.style.image" style="height:28px;border-radius:3px" />
              <n-button v-if="editingLayer.style.image" size="tiny" type="error" text @click="editingLayer.style.image = ''">清除</n-button>
            </n-space>
          </n-form-item-gi>
          <n-form-item-gi label="着色">
            <n-color-picker v-model:value="editingLayer.style.color" :show-alpha="false" size="small" />
          </n-form-item-gi>
          <n-form-item-gi label="透明度">
            <n-input-number v-model:value="editingLayer.style.opacity" size="small" :min="0" :max="1" :step="0.1" />
          </n-form-item-gi>
          <n-form-item-gi label="大小">
            <n-input-number v-model:value="editingLayer.style.size" size="small" :min="0.1" :max="20" :step="0.5" />
          </n-form-item-gi>
          <n-form-item-gi label="显示标注">
            <n-switch v-model:value="editingLayer.style.labelVisible" size="small" />
          </n-form-item-gi>
          <template v-if="editingLayer.style.labelVisible">
            <n-form-item-gi label="标注字段">
              <n-select v-if="editingLayer.modelFields?.length" v-model:value="editingLayer.style.labelField" :options="layerFieldOptions" size="small" clearable placeholder="选择字段" />
              <n-input v-else v-model:value="editingLayer.style.labelField" size="small" placeholder="name" />
            </n-form-item-gi>
            <n-form-item-gi label="标注颜色">
              <n-color-picker v-model:value="editingLayer.style.labelColor" :show-alpha="false" size="small" />
            </n-form-item-gi>
            <n-form-item-gi label="标注大小">
              <n-input-number v-model:value="editingLayer.style.labelSize" size="small" :min="0.01" :max="0.5" :step="0.01" />
            </n-form-item-gi>
          </template>
        </n-grid>
        <n-divider title-placement="left">
          条件样式
          <n-button size="tiny" style="margin-left:8px" @click="addCondition">+ 添加规则</n-button>
        </n-divider>
        <div v-if="!editingLayer.conditions?.length" style="font-size:11px;color:#666;padding:4px 0 8px">无条件规则，所有点使用默认样式</div>
        <div v-for="(cond, ci) in editingLayer.conditions" :key="ci" class="condition-row">
          <div class="condition-header">
            <span style="font-size:11px;color:#aaa">规则 {{ ci + 1 }}</span>
            <n-button size="tiny" type="error" text @click="removeCondition(ci)">✕</n-button>
          </div>
          <n-grid :cols="3" :x-gap="6">
            <n-form-item-gi label="字段">
              <n-input v-model:value="cond.field" size="small" placeholder="如 type" />
            </n-form-item-gi>
            <n-form-item-gi label="运算符">
              <n-select v-model:value="cond.operator" :options="operatorOptions" size="small" />
            </n-form-item-gi>
            <n-form-item-gi label="值">
              <n-input v-model:value="cond.value" size="small" placeholder="匹配值" />
            </n-form-item-gi>
          </n-grid>
          <n-grid :cols="2" :x-gap="6">
            <n-form-item-gi label="图片" :span="2">
              <n-space align="center" :size="6">
                <n-upload accept="image/*" :max="1" :show-file-list="false" :custom-request="(o) => uploadConditionImage(o, ci)">
                  <n-button size="small"><template #icon><n-icon :component="ImageOutline" /></template>上传</n-button>
                </n-upload>
                <img v-if="cond.style.image" :src="cond.style.image" style="height:24px;border-radius:3px" />
                <n-button v-if="cond.style.image" size="tiny" type="error" text @click="cond.style.image = ''">清除</n-button>
              </n-space>
            </n-form-item-gi>
            <n-form-item-gi label="着色">
              <n-color-picker v-model:value="cond.style.color" :show-alpha="false" size="small" />
            </n-form-item-gi>
            <n-form-item-gi label="大小">
              <n-input-number v-model:value="cond.style.size" size="small" :min="0.1" :max="20" :step="0.5" />
            </n-form-item-gi>
          </n-grid>
        </div>
        </template>

        <!-- 分布图层专属配置 -->
        <template v-if="editingLayer.type === 'distribution' && editingLayer.distribution">
        <n-divider title-placement="left">字段映射</n-divider>
        <n-grid :cols="2" :x-gap="8">
          <n-form-item-gi label="区域名称字段">
            <n-select v-if="editingLayer.modelFields?.length" v-model:value="editingLayer.dataMapping.name" :options="layerFieldOptions" size="small" clearable />
            <n-input v-else v-model:value="editingLayer.dataMapping.name" size="small" placeholder="如 name" />
          </n-form-item-gi>
          <n-form-item-gi label="数值字段">
            <n-select v-if="editingLayer.modelFields?.length" v-model:value="editingLayer.dataMapping.value" :options="layerFieldOptions" size="small" clearable />
            <n-input v-else v-model:value="editingLayer.dataMapping.value" size="small" placeholder="如 value" />
          </n-form-item-gi>
        </n-grid>
        <n-divider title-placement="left">渲染设置</n-divider>
        <n-grid :cols="2" :x-gap="8">
          <n-form-item-gi label="颜色渲染">
            <n-switch v-model:value="editingLayer.distribution.colorEnabled" size="small" />
          </n-form-item-gi>
          <n-form-item-gi label="悬停提示">
            <n-switch v-model:value="editingLayer.distribution.tooltipEnabled" size="small" />
          </n-form-item-gi>
          <n-form-item-gi label="默认颜色" :span="2">
            <n-space align="center" :size="6">
              <n-color-picker v-model:value="editingLayer.distribution.defaultColor" :show-alpha="false" size="small" style="width:120px" />
              <span style="font-size:11px;color:#888">无匹配区间时使用</span>
            </n-space>
          </n-form-item-gi>
        </n-grid>
        <n-divider title-placement="left">
          值区间
          <n-button size="tiny" style="margin-left:8px" @click="addRange">+ 添加</n-button>
        </n-divider>
        <div v-if="!editingLayer.distribution.ranges?.length" style="font-size:11px;color:#666;padding:4px 0 8px">无区间配置，系统将自动等分着色</div>
        <div v-for="(range, ri) in editingLayer.distribution.ranges" :key="ri" class="condition-row">
          <div class="condition-header">
            <span style="font-size:11px;color:#aaa">分级 {{ ri + 1 }}</span>
            <n-button size="tiny" type="error" text @click="removeRange(ri)">✕</n-button>
          </div>
          <n-grid :cols="4" :x-gap="6">
            <n-form-item-gi label="颜色">
              <n-color-picker v-model:value="range.color" :show-alpha="false" size="small" />
            </n-form-item-gi>
            <n-form-item-gi label="标签">
              <n-input v-model:value="range.label" size="small" placeholder="如 高" />
            </n-form-item-gi>
            <n-form-item-gi label="最小值">
              <n-input-number v-model:value="range.min" size="small" :step="1" placeholder="自动" clearable />
            </n-form-item-gi>
            <n-form-item-gi label="最大值">
              <n-input-number v-model:value="range.max" size="small" :step="1" placeholder="自动" clearable />
            </n-form-item-gi>
          </n-grid>
        </div>
        </template>
      </n-form>
    </div>
    <template #action>
      <div class="modal-actions">
        <n-button @click="showLayerEditModal = false">关闭</n-button>
      </div>
    </template>
  </n-modal>
  <FontSelector v-model:visible="showLabelFontSelector" @confirm="handleLabelFontConfirm" />
</template>

<script setup lang="ts">
import { PropType, computed, ref, onMounted, watch } from 'vue'
import defaultsDeep from 'lodash/defaultsDeep'
import mapScene from './map/map.vue'
import { getDataModelListApi, getDataModelDetailApi } from '@/api/datamodel'
import {
  ConfigSection,
  ConfigGrid,
  ConfigItem,
  ConfigColorGroup,
  ConfigColorItem,
  ConfigSwitch,
  GlobalSetting
} from '@/components/Pages/ChartItemSetting'
import {
  NButton,
  NIcon,
  NSelect,
  NSwitch,
  NSlider,
  NUpload,
  NUploadDragger,
  NModal,
  NCascader,
  NSpace,
  NCheckbox,
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NDivider,
  NGrid,
  NFormItemGi,
  NInputNumber,
  NInput,
  NInputGroup,
  NColorPicker,
  NTreeSelect,
  type UploadCustomRequestOptions
} from 'naive-ui'
import { SettingsOutline, ImageOutline, TextOutline } from '@vicons/ionicons5'
import { FontSelector } from '@/components/MediaCenter'
import { loadFontCss, type FontResourceVO } from '@/api/http/font.api'
import { GlobalThemeJsonType } from '@/settings/chartThemes/index'
import { getCascaderOptions, getMapNameByCode, loadMapGeoJson, initMapTreeData } from './mapList'
import { useTargetData } from '@/views/chart/ContentConfigurations/components/hooks/useTargetData.hook'

const props = defineProps({
  optionData: {
    type: Object as PropType<GlobalThemeJsonType>,
    required: true
  }
})

const { chartTargetForSetting, isMultiSelect, isSameComponentType } = useTargetData()
const isBatchStyleContext = computed(() => isMultiSelect.value && isSameComponentType.value)
const showPackageStyleEntry = computed(() => {
  if (!isBatchStyleContext.value) return true
  const paths = chartTargetForSetting.value?.chartConfig?.batchEditablePaths
  return Array.isArray(paths) && paths.length > 0
})

const showModal = ref(false) //样式选择弹窗
const selectedMapCode = ref('100000') //地图默认
const showLabelFontSelector = ref(false)

const handleLabelFontConfirm = async (font: FontResourceVO) => {
  try {
    await loadFontCss(font.id)
    sceneList.value.baseLabelNameFontFamily = font.fontFamily
    sceneList.value.baseLabelNameFontId = font.id
  } catch (e) {
    console.error('加载字体失败', e)
    window.$message?.error('加载字体失败')
  }
}

watch(
  () => (props.optionData as any)?.three3dMap?.mapCode,
  code => {
    if (typeof code === 'string' && code) {
      selectedMapCode.value = code
    }
  },
  { immediate: true }
)
const builtInMapOptions = computed(() => getCascaderOptions()) //地图选择
const cameraOptions = computed(() => {
  const optionData: any = props.optionData

  if (!optionData.scene) {
    optionData.scene = {}
  }

  if (!optionData.scene.camera) {
    optionData.scene.camera = {
      cameraPosition: {
        x: 0.00002366776247217723,
        y: 225.1025284992283,
        z: 0.0002238648924037432
      },
      cameraLookAt: {
        x: 0,
        y: 0,
        z: 0
      }
    }
  }

  if (!optionData.scene.camera.cameraPosition) {
    optionData.scene.camera.cameraPosition = { x: 0, y: 0, z: 0 }
  }

  if (!optionData.scene.camera.cameraLookAt) {
    optionData.scene.camera.cameraLookAt = { x: 0, y: 0, z: 0 }
  }

  return optionData.scene.camera
})

const sceneDefaults = {
  style: {
    provinceLineColor: '#2bc4dc',
    provinceLineWidth: 1,
    provinceTopColor: '#061e47',
    provinceTopTexture: '',
    provinceSideColor: '#ffffff',
    provinceSideTexture: '',
    hoverEmissiveColor: '#0b112d',
    hoverEmissiveIntensity: 1.5,
    hoverLiftScale: 1.5,
    strokeColor: '#2bc4dc'
  },
  animation: {
    strokeVisible: true,
    strokeSpeed: 0.2,
    strokeWidth: 0.2,
    enterCamera: true,
    enterCameraDelay: 2,
    enterCameraDuration: 2.5,
    enterTimeScale: 1
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
  controls: {
    zoom: true,
    pan: true,
    rotate: true
  },
  label: {
    areaName: false,
    dataLabel: false,
    areaPoint: false
  },
  baseLabelNameScale: 0.1,
  baseLabelNameColor: '#5fc6dc',
  baseLabelNameFontFamily: '',
  baseLabelNameFontId: '',
  provinceNameOffset: [0, 0],
  pointCenter: [108.55, 34.32],
  depth: 5,
  drill: {
    isDrill: true,
    drillLevel: 2
  },
  environment: {
    fogEnabled: true,
    fogColor: '#011024',
    fogNear: 1,
    fogFar: 500,
    ambientLightIntensity: 2,
    ambientLightColor: '#ffffff',
    directionalLightIntensity: 4,
    directionalLightColor: '#ffffff'
  }
}

const sceneList = computed(() => {
  const optionData: any = props.optionData

  if (!optionData.scene) {
    optionData.scene = {}
  }

  defaultsDeep(optionData.scene, sceneDefaults)

  // 强制关闭内置标注（迁移旧数据）
  if (!optionData.scene._labelMigrated) {
    optionData.scene.label.areaName = false
    optionData.scene.label.dataLabel = false
    optionData.scene.label.areaPoint = false
    optionData.scene._labelMigrated = true
  }

  return optionData.scene
})

const beforeUploadProvinceTopTexture = ({ file }: any) => {
  const raw = file?.file
  if (!(raw instanceof File)) return false
  if (!raw.type || !raw.type.startsWith('image/')) {
    window.$message?.warning?.('仅支持上传图片')
    return false
  }
  return true
}

const uploadProvinceTopTexture = (options: UploadCustomRequestOptions) => {
  const raw = options?.file?.file
  if (!(raw instanceof File)) {
    window.$message?.error?.('读取图片失败')
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const result = typeof reader.result === 'string' ? reader.result : ''
    sceneList.value.style.provinceTopTexture = result
  }
  reader.onerror = () => {
    window.$message?.error?.('读取图片失败')
  }
  reader.readAsDataURL(raw)
}

const clearProvinceTopTexture = () => {
  sceneList.value.style.provinceTopTexture = ''
}

const beforeUploadProvinceSideTexture = ({ file }: any) => {
  const raw = file?.file
  if (!(raw instanceof File)) return false
  if (!raw.type || !raw.type.startsWith('image/')) {
    window.$message?.warning?.('仅支持上传图片')
    return false
  }
  return true
}

const uploadProvinceSideTexture = (options: UploadCustomRequestOptions) => {
  const raw = options?.file?.file
  if (!(raw instanceof File)) {
    window.$message?.error?.('读取图片失败')
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    const result = typeof reader.result === 'string' ? reader.result : ''
    sceneList.value.style.provinceSideTexture = result
  }
  reader.onerror = () => {
    window.$message?.error?.('读取图片失败')
  }
  reader.readAsDataURL(raw)
}

const clearProvinceSideTexture = () => {
  sceneList.value.style.provinceSideTexture = ''
}

const onBuiltInMapChange = async (value: string | null) => {
  if (!value) return
  try {
    const geoJsonData = await loadMapGeoJson(value)
    if (!geoJsonData) throw new Error('load failed')

    if (!props.optionData.three3dMap) props.optionData.three3dMap = {}

    props.optionData.three3dMap.mapSource = JSON.stringify(geoJsonData)
    props.optionData.three3dMap.mapName = getMapNameByCode(value)
    props.optionData.three3dMap.mapCode = value
  } catch (e) {
    console.error('[Config] load map failed:', value, e)
  }
}

//确认方法
const handleConfirm = () => {
  showModal.value = false
}
//取消方法
const handleCancel = () => {
  showModal.value = false
}

// ============ 数据模型 ============
const modelListLoading = ref(false)
const modelList = ref<any[]>([])

const modelOptions = computed(() => {
  // 按 groupName 分组构建树
  const grouped: Record<string, any[]> = {}
  const ungrouped: any[] = []

  modelList.value.forEach(m => {
    if (m.groupName) {
      if (!grouped[m.groupName]) grouped[m.groupName] = []
      grouped[m.groupName].push(m)
    } else {
      ungrouped.push(m)
    }
  })

  const tree: any[] = []

  Object.entries(grouped).forEach(([groupName, models]) => {
    tree.push({
      key: `group_${groupName}`,
      label: groupName,
      disabled: true,
      children: models.map(m => ({ key: m.id, label: m.modelName }))
    })
  })

  ungrouped.forEach(m => tree.push({ key: m.id, label: m.modelName }))

  return tree
})

const layerFieldOptions = computed(() => {
  if (!editingLayer.value?.modelFields?.length) return []
  return editingLayer.value.modelFields.map((f: string) => ({ label: f, value: f }))
})

const loadModelList = async () => {
  if (modelList.value.length) return
  modelListLoading.value = true
  try {
    let pageNum = 1
    const pageSize = 100
    const all: any[] = []
    while (true) {
      const res = await getDataModelListApi({ pageNum, pageSize })
      const data = res?.data
      const records = data?.records || data?.list || []
      all.push(...records)
      const total = data?.total ?? records.length
      if (all.length >= total || records.length < pageSize) break
      pageNum++
    }
    modelList.value = all
  } catch (e) {
    console.warn('[LayerModel] 加载数据模型列表失败', e)
  } finally {
    modelListLoading.value = false
  }
}

const onLayerModelChange = async (modelId: string) => {
  if (!editingLayer.value) return
  if (!modelId) {
    editingLayer.value.modelName = ''
    editingLayer.value.modelFields = []
    return
  }
  try {
    const res = await getDataModelDetailApi(modelId)
    const model = res?.data
    if (!model) return
    editingLayer.value.modelName = model.modelName || ''
    const fields: string[] = (model.fields || []).map((f: any) => f.fieldName || f.alias || f.field || f)
    editingLayer.value.modelFields = fields
    // 自动填充字段映射（如果还没配置）
    if (!editingLayer.value.dataMapping) editingLayer.value.dataMapping = { lng: '', lat: '', label: '' }
  } catch (e) {
    console.warn('[LayerModel] 加载模型字段失败', e)
  }
}

// ============ 图层管理 ============
const layerList = computed(() => {
  const optionData: any = props.optionData
  if (!Array.isArray(optionData.layers)) optionData.layers = []
  return optionData.layers
})

const layerTypeOptions = [
  { label: '点标注', value: 'point' },
  { label: '分布图层', value: 'distribution' }
]

const editingLayerIndex = ref<number | null>(null)
const showLayerEditModal = ref(false)

const openLayerEdit = async (index: number) => {
  editingLayerIndex.value = index
  const layer = layerList.value[index]
  if (layer && !layer.dataMapping) layer.dataMapping = { lng: '', lat: '', label: '', name: 'name', value: 'value' }
  if (layer && !layer.conditions) layer.conditions = []
  if (layer && !layer.modelFields) layer.modelFields = []
  if (layer && !layer.distribution) {
    layer.distribution = { colorEnabled: true, tooltipEnabled: true, defaultColor: '', ranges: [] }
  }
  showLayerEditModal.value = true
  await loadModelList()
  if (layer?.modelId && !layer.modelFields?.length) {
    await onLayerModelChange(layer.modelId)
  }
}

const addLayer = (type: 'point' | 'distribution' = 'point') => {
  // 分布图层只允许一个
  if (type === 'distribution' && layerList.value.some(l => l.type === 'distribution')) {
    window.$message?.warning?.('分布图层只能添加一个')
    return
  }
  const newLayer = {
    id: Date.now().toString(),
    name: type === 'distribution' ? '分布图层' : `点图层 ${layerList.value.filter(l => l.type === 'point').length + 1}`,
    type,
    visible: true,
    data: [],
    style: { image: '', color: '#ffffff', size: 1, opacity: 1, labelVisible: true, labelColor: '#ffffff', labelSize: 0.08, labelField: 'name' },
    conditions: [],
    dataMapping: { lng: 'lng', lat: 'lat', label: 'name', name: 'name', value: 'value' },
    modelId: '',
    modelName: '',
    modelFields: [],
    distribution: {
      colorEnabled: true,
      tooltipEnabled: true,
      defaultColor: '',
      ranges: [
        { color: '#1a6b3c', label: '低' },
        { color: '#f5a623', label: '中' },
        { color: '#d0021b', label: '高' }
      ]
    }
  }
  layerList.value.push(newLayer)
  editingLayerIndex.value = layerList.value.length - 1
}

const removeLayer = (index: number) => {
  layerList.value.splice(index, 1)
  if (editingLayerIndex.value === index) editingLayerIndex.value = null
  else if (editingLayerIndex.value !== null && editingLayerIndex.value > index) editingLayerIndex.value--
}

const editingLayer = computed(() => {
  if (editingLayerIndex.value === null) return null
  return layerList.value[editingLayerIndex.value] ?? null
})

// 条件规则
const operatorOptions = [
  { label: '==', value: '==' },
  { label: '!=', value: '!=' },
  { label: '>', value: '>' },
  { label: '>=', value: '>=' },
  { label: '<', value: '<' },
  { label: '<=', value: '<=' }
]

const addCondition = () => {
  if (!editingLayer.value) return
  if (!Array.isArray(editingLayer.value.conditions)) editingLayer.value.conditions = []
  editingLayer.value.conditions.push({
    field: 'type', operator: '==', value: '',
    style: { image: '', color: '#ff0000', size: 1, opacity: 1 }
  })
}

const removeCondition = (index: number) => {
  editingLayer.value?.conditions?.splice(index, 1)
}

// 图片上传（默认样式）
const uploadLayerImage = (options: UploadCustomRequestOptions) => {
  const raw = options?.file?.file
  if (!(raw instanceof File) || !editingLayer.value) return
  const reader = new FileReader()
  reader.onload = () => { editingLayer.value!.style.image = reader.result as string }
  reader.readAsDataURL(raw)
}

// 条件图片上传
const uploadConditionImage = (options: UploadCustomRequestOptions, index: number) => {
  const raw = options?.file?.file
  if (!(raw instanceof File) || !editingLayer.value) return
  const reader = new FileReader()
  reader.onload = () => { editingLayer.value!.conditions[index].style.image = reader.result as string }
  reader.readAsDataURL(raw)
}

// 分布图层区间管理
const addRange = () => {
  if (!editingLayer.value?.distribution) return
  editingLayer.value.distribution.ranges.push({ min: 0, max: 100, color: '#1890ff', label: '' })
}
const removeRange = (i: number) => {
  editingLayer.value?.distribution?.ranges?.splice(i, 1)
}

onMounted(async () => {
  await initMapTreeData()

  const savedCode = (props.optionData as any)?.three3dMap?.mapCode
  if (typeof savedCode === 'string' && savedCode) {
    selectedMapCode.value = savedCode
  }
  // initMissingConfig()
})
</script>
<style lang="less" scoped>
.advanced-config-container {
  display: flex;
  gap: 12px;
  min-height: 480px;
  max-height: 550px;
}
.preview-panel {
  width: 480px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border-radius: 6px;
  overflow: hidden;
}
.preview-title {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
}
.preview-content {
  flex: 1;
  min-height: 380px;
  position: relative;
}
.preview-content :deep(.preview-area) {
  height: 100%;
  min-height: 380px;
}

.tab-content {
  max-height: 440px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 6px;
  padding-bottom: 8px;
}
.tab-content::-webkit-scrollbar {
  width: 5px;
}
.tab-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
.tab-content::-webkit-scrollbar-track {
  background: transparent;
}

.layer-list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.layer-table {
  font-size: 12px;
}

.layer-table-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(255,255,255,0.05);
  border-radius: 4px 4px 0 0;
  color: rgba(255,255,255,0.5);
  font-size: 11px;
}

.layer-table-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  &:hover { background: rgba(255,255,255,0.04); }
}

.layer-table-empty {
  padding: 24px;
  text-align: center;
  color: rgba(255,255,255,0.3);
  font-size: 12px;
}

.condition-row {
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 6px 8px;
  margin-bottom: 8px;
}

.condition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

:deep(.n-divider) {
  margin: 8px 0 6px 0;
  font-size: 12px;
}
:deep(.n-divider .n-divider__title) {
  font-size: 12px;
  font-weight: 500;
}
:deep(.n-tabs-tab) {
  padding: 6px 10px !important;
  font-size: 12px;
}
:deep(.n-form-item) {
  margin-bottom: 6px;
}
:deep(.n-form-item .n-form-item-label) {
  font-size: 12px;
  padding-bottom: 0;
}
:deep(.n-form-item-blank) {
  min-height: 26px;
}
:deep(.n-slider) {
  --n-handle-size: 12px;
}
:deep(.n-select) {
  font-size: 12px;
}
:deep(.n-switch) {
  --n-rail-height: 18px;
  --n-rail-width: 36px;
}
:deep(.n-button) {
  font-size: 12px;
}
:deep(.layers-content) {
  padding: 0;
}
</style>
