<template>
  <div class="excel-operator">
    <el-upload
      class="upload-demo"
      action=""
      :auto-upload="false"
      :show-file-list="false"
      :on-change="handleFileSelected"
      accept=".xlsx, .xls"
    >
      <el-button type="success" plain class="action-btn">
        <el-icon><Upload /></el-icon> 导入数据
      </el-button>
    </el-upload>
    
    <el-button type="warning" plain class="action-btn" @click="handleExport">
      <el-icon><Download /></el-icon> 导出 Excel
    </el-button>

    <el-button type="info" plain class="action-btn" @click="handleDownloadTemplate">
      <el-icon><Document /></el-icon> 模板下载
    </el-button>

    <!-- Excel 导入与预览窗 -->
    <el-dialog v-model="importDialogVisible" title="Excel 数据导入确认" width="70%" destroy-on-close class="modern-dialog">
      <div v-loading="previewLoading">
        <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
          <span style="font-weight: bold; color: #374151;">请选择要导入的工作表 (Sheet) :</span>
          <el-select v-model="selectedSheetNo" @change="fetchPreviewData" style="width: 250px" class="modern-input">
            <el-option
              v-for="sheet in sheetList"
              :key="sheet.no"
              :label="sheet.name"
              :value="sheet.no"
            />
          </el-select>
        </div>

        <el-alert title="以下为所选工作表的前 10 条真实读取数据预览，请核对是否正确。" type="info" show-icon style="margin-bottom: 15px" />

        <el-table :data="previewData" class="modern-table" height="300" style="width: 100%" :header-cell-style="{ background: '#f9fafb', color: '#6b7280' }">
          <el-table-column 
            v-for="(label, key) in previewHeaders" 
            :key="key" 
            :prop="String(key)" 
            :label="label" 
            min-width="120"
            show-overflow-tooltip
          />
        </el-table>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取 消</el-button>
          <el-button type="success" :loading="confirmImportLoading" @click="confirmImport">确 认 并 导 入</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Upload, Download, Document } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

// ----- Props & Emits -----
const props = defineProps({
  apiBase: {
    type: String,
    required: true
  },
  moduleName: {
    type: String,
    default: '数据'
  },
  keyword: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['success'])

// ----- State -----
const importDialogVisible = ref(false)
const previewLoading = ref(false)
const confirmImportLoading = ref(false)
const rawUploadFile = ref(null)
const sheetList = ref([])
const selectedSheetNo = ref(0)
const previewHeaders = ref({})
const previewData = ref([])

// ----- Handlers -----
const handleDownloadTemplate = async () => {
  try {
    const res = await request.get(`${props.apiBase}/template`, { responseType: 'blob' })
    downloadFile(res, `${props.moduleName}.xlsx`)
  } catch (error) {
    console.error('Download template error:', error)
  }
}

const handleExport = async () => {
  try {
    const res = await request.get(`${props.apiBase}/export`, { 
      params: { keyword: props.keyword },
      responseType: 'blob' 
    })
    downloadFile(res, `${props.moduleName}导出数据.xlsx`)
  } catch (error) {
    console.error('Export error:', error)
  }
}

const downloadFile = (res, fileName) => {
  const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const link = document.createElement('a')
  link.href = window.URL.createObjectURL(blob)
  link.download = fileName
  link.click()
  window.URL.revokeObjectURL(link.href)
}

const handleFileSelected = async (file) => {
  const isExcel = file.raw.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.raw.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return
  }
  
  rawUploadFile.value = file.raw
  try {
    previewLoading.value = true
    importDialogVisible.value = true
    
    const formData = new FormData()
    formData.append('file', rawUploadFile.value)
    
    const sheetRes = await request.post(`${props.apiBase}/sheets`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    sheetList.value = sheetRes.data || []
    if (sheetList.value.length > 0) {
      selectedSheetNo.value = sheetList.value[0].no
      await fetchPreviewData() 
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('解析 Excel 文件结构失败')
    importDialogVisible.value = false
  } finally {
    previewLoading.value = false
  }
}

const fetchPreviewData = async () => {
  if (!rawUploadFile.value) return
  try {
    previewLoading.value = true
    const formData = new FormData()
    formData.append('file', rawUploadFile.value)
    formData.append('sheetNo', selectedSheetNo.value)
    
    const previewRes = await request.post(`${props.apiBase}/preview`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    previewHeaders.value = previewRes.data.headers || {}
    previewData.value = previewRes.data.rows || []
  } catch (error) {
    console.error(error)
    ElMessage.error('抽取预览数据失败')
  } finally {
    previewLoading.value = false
  }
}

const confirmImport = async () => {
  if (!rawUploadFile.value) return
  
  confirmImportLoading.value = true
  try {
    const formData = new FormData()
    formData.append('file', rawUploadFile.value)
    formData.append('sheetNo', selectedSheetNo.value)
    
    const res = await request.post(`${props.apiBase}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    
    ElMessage.success(res.message || '导入成功')
    importDialogVisible.value = false
    emit('success')
  } catch (error) {
    console.error(error)
    ElMessage.error('导入数据过程中发生异常')
  } finally {
    confirmImportLoading.value = false
  }
}
</script>

<style scoped>
.excel-operator {
  display: flex;
  gap: 12px;
  align-items: center;
}
.action-btn {
  border-radius: 8px;
  font-weight: 500;
}
</style>
