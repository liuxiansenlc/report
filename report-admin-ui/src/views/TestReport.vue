<template>
  <div class="crud-container">
    <el-card class="box-card" shadow="hover">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input v-model="queryParams.keyword" placeholder="搜索农场名称或编号" class="search-input" clearable @keyup.enter="handleSearch" @clear="handleSearch">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button type="primary" plain @click="handleSearch">查 询</el-button>
          <el-popconfirm title="确定要删除这些报告吗？" @confirm="handleBatchDelete">
            <template #reference>
              <el-button v-show="selectedIds.length > 0" type="danger" plain class="action-btn">
                <el-icon><Delete /></el-icon> 批量删除 ({{ selectedIds.length }})
              </el-button>
            </template>
          </el-popconfirm>
        </div>
        <div class="toolbar-right">
          <el-button type="success" class="action-btn" @click="handleAdd"><el-icon><Plus /></el-icon> 新增检测报告</el-button>
        </div>
      </div>

      <el-table v-loading="loading" :data="tableData" class="modern-table" style="width: 100%" @selection-change="handleSelectionChange" :header-cell-style="{ background: '#f9fafb', color: '#6b7280', fontWeight: '600' }">
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="farmName" label="农场名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="farmCode" label="农场编号" min-width="120" />
        <el-table-column prop="reportType" label="报告类型" min-width="150">
          <template #default="{ row }"><el-tag :type="getTypeTag(row.reportType)" effect="light">{{ row.reportType }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="reportDate" label="检测日期" min-width="120" />
        <el-table-column prop="fileName" label="附件" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link v-if="row.fileUrl" type="primary" underline="never" @click="openPdf(row.fileUrl)">
              <el-icon><Document /></el-icon> {{ getFileDisplayName(row) }}
            </el-link>
            <span v-else class="muted">无附件</span>
            <el-tag v-if="row.reportSource === 'AI'" class="source-tag" size="small" type="success">AI</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="前端展示" width="105" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.reportType === '改良方案' && (row.frontendVisible === 1 || row.frontendVisible == null)" type="success" size="small">展示中</el-tag>
            <span v-else-if="row.reportType === '改良方案'" class="muted">未展示</span>
            <span v-else class="muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-if="row.fileUrl" type="success" link @click="downloadPdf(row.fileUrl, getDownloadName(row))">下载</el-button>
            <el-button v-if="row.reportType === '改良方案' && row.frontendVisible !== 1" type="warning" link @click="handleSetFrontendPlan(row)">设为展示</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-popconfirm title="确定要删除这条检测报告吗？" @confirm="handleDelete(row)"><template #reference><el-button type="danger" link>删除</el-button></template></el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination v-model:current-page="queryParams.current" v-model:page-size="queryParams.size" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="getList" @current-change="getList" background />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="580px" align-center>
      <el-form :model="editForm" :rules="rules" ref="formRef" label-width="104px" class="modern-form">
        <el-divider content-position="left">基础信息</el-divider>
        <el-form-item label="归属农场" prop="farmCode">
          <el-select v-model="editForm.farmCode" placeholder="请选择来源农场" style="width: 100%" filterable @change="handleFarmChange">
            <el-option v-for="item in farmList" :key="item.farmCode" :label="item.farmName + ' (' + item.farmCode + ')'" :value="item.farmCode" />
          </el-select>
        </el-form-item>
        <el-form-item label="农场名称" prop="farmName"><el-input v-model="editForm.farmName" disabled placeholder="选择农场后自动带出" /></el-form-item>

        <el-divider content-position="left">报告配置</el-divider>
        <el-form-item label="报告类型" prop="reportType">
          <el-select v-model="editForm.reportType" placeholder="请选择检测报告类型" style="width: 100%">
            <el-option label="改良方案" value="改良方案" />
            <el-option label="改良前检测报告" value="改良前检测报告" />
            <el-option label="改良后检测报告" value="改良后检测报告" />
          </el-select>
        </el-form-item>
        <el-form-item label="检测日期" prop="reportDate"><el-date-picker v-model="editForm.reportDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item>

        <el-form-item v-if="editForm.reportType === '改良方案'" label="展示选择">
          <el-switch v-model="editForm.frontendVisible" :active-value="1" :inactive-value="0" active-text="展示到前端" inactive-text="暂不展示" />
        </el-form-item>

        <el-form-item label="PDF附件" prop="fileUrl">
          <el-upload ref="uploadRef" class="upload-demo" action="/api/upload" :headers="uploadHeaders" :show-file-list="false" accept=".pdf" :before-upload="beforeUpload" :on-success="handleUploadSuccess" :on-error="handleUploadError">
            <el-button type="primary" plain><el-icon style="margin-right:4px;"><Upload /></el-icon> 上传人工 PDF</el-button>
            <template #tip><div class="el-upload__tip">只能上传 PDF 格式文件且不超过 20MB</div></template>
          </el-upload>
          <div v-if="editForm.fileUrl" class="uploaded-file">
            <el-icon color="#67C23A"><SuccessFilled /></el-icon>
            <span class="file-name">{{ getFileDisplayName(editForm) }}</span>
            <el-tag v-if="editForm.reportSource === 'AI'" size="small" type="success">AI</el-tag>
            <el-button link type="danger" style="margin-left:8px;" @click="removeFile">移除</el-button>
          </div>
        </el-form-item>

        <div v-if="editForm.reportType === '改良方案'" class="ai-box">
          <div class="ai-box-title"><el-icon><MagicStick /></el-icon><span>自动生成 AI改良方案</span></div>
          <el-form-item label="病原菌数">
            <el-input-number v-model="pathogenCount" :min="0" :precision="4" :step="0.001" style="width: 180px" />
            <el-button type="success" :loading="aiGenerating" style="margin-left: 12px" @click="handleGenerateAiPlan">生成方案</el-button>
          </el-form-item>
        </div>
      </el-form>
      <template #footer><span class="dialog-footer"><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="submitEdit" :loading="submitLoading">保存</el-button></span></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Plus, Delete, Document, Upload, SuccessFilled, MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import request from '@/utils/request'

const userStore = useUserStore()
const uploadHeaders = computed(() => ({ Authorization: `Bearer ${userStore.token}` }))
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const selectedIds = ref([])
const queryParams = reactive({ current: 1, size: 10, keyword: '' })
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const aiGenerating = ref(false)
const formRef = ref(null)
const uploadRef = ref(null)
const pathogenCount = ref(0.001)
const farmList = ref([])
const defaultForm = { id: null, farmCode: '', farmName: '', reportType: '', reportDate: '', fileUrl: '', fileName: '', reportSource: 'MANUAL', frontendVisible: 1 }
const editForm = ref({ ...defaultForm })
const rules = { farmCode: [{ required: true, message: '请选择系统内农场', trigger: 'change' }], reportType: [{ required: true, message: '请选择报告类型', trigger: 'change' }], reportDate: [{ required: true, message: '请选择检测日期', trigger: 'change' }] }

const loadFarmList = async () => {
  try { const res = await request.get('/farm-info/page', { params: { current: 1, size: 500 } }); farmList.value = res.data.records || [] } catch (error) { console.error('获取农场列表失败', error) }
}
const handleFarmChange = (selectedCode) => { const farm = farmList.value.find(f => f.farmCode === selectedCode); if (farm) editForm.value.farmName = farm.farmName }
const getTypeTag = (type) => type === '改良方案' ? 'info' : type === '改良前检测报告' ? 'warning' : type === '改良后检测报告' ? 'success' : ''
const getFileDisplayName = (row) => row.reportSource === 'AI' ? 'AI改良方案' : (row.fileName || '附件')
const getDownloadName = (row) => row.reportSource === 'AI' ? 'AI改良方案.pdf' : (row.fileName || '检测报告.pdf')
const getList = async () => { loading.value = true; try { const res = await request.get('/test-report/page', { params: queryParams }); tableData.value = res.data.records; total.value = res.data.total } catch (e) { console.error(e); ElMessage.error('获取报告列表失败') } finally { loading.value = false } }
const handleSearch = () => { queryParams.current = 1; getList() }
const handleSelectionChange = (selection) => { selectedIds.value = selection.map(item => item.id) }
const handleBatchDelete = async () => { if (!selectedIds.value.length) return; await request.post('/test-report/delete/batch', selectedIds.value); ElMessage.success('批量删除成功'); getList() }
const handleAdd = () => { editForm.value = { ...defaultForm }; pathogenCount.value = 0.001; dialogTitle.value = '新增检测报告'; dialogVisible.value = true; formRef.value?.clearValidate() }
const handleEdit = (row) => { editForm.value = { ...defaultForm, ...row, reportSource: row.reportSource || 'MANUAL', frontendVisible: row.frontendVisible == null ? 1 : row.frontendVisible }; dialogTitle.value = '编辑检测报告'; dialogVisible.value = true; formRef.value?.clearValidate() }
const handleDelete = async (row) => { await request.post(`/test-report/delete/${row.id}`); ElMessage.success('报告删除成功'); getList() }
const handleSetFrontendPlan = async (row) => { await request.post(`/test-report/plan/display/${row.id}`); ElMessage.success('已设置为前端展示方案'); getList() }
const handleGenerateAiPlan = async () => {
  if (!editForm.value.farmCode) return ElMessage.warning('请先选择农场')
  if (!editForm.value.reportDate) return ElMessage.warning('请先选择检测日期')
  aiGenerating.value = true
  try {
    const res = await request.post('/test-report/ai-plan/generate', { farmCode: editForm.value.farmCode, reportDate: editForm.value.reportDate, pathogenCount: pathogenCount.value })
    editForm.value = { ...editForm.value, ...res.data }
    ElMessage.success('AI改良方案已生成')
    getList()
  } finally { aiGenerating.value = false }
}
const submitEdit = () => { formRef.value.validate(async valid => { if (!valid) return; submitLoading.value = true; try { if (editForm.value.id) { await request.post('/test-report/update', editForm.value); ElMessage.success('报告更新成功') } else { await request.post('/test-report', editForm.value); ElMessage.success('报告新增成功') } dialogVisible.value = false; getList() } finally { submitLoading.value = false } }) }
const beforeUpload = (file) => { if (!(file.type === 'application/pdf' || file.name.endsWith('.pdf'))) { ElMessage.error('只能上传 PDF 文件!'); return false } if (file.size / 1024 / 1024 >= 20) { ElMessage.error('文件大小不能超过 20MB!'); return false } return true }
const handleUploadSuccess = (res, file) => { if (res.code === 200) { editForm.value.fileUrl = res.data; editForm.value.fileName = file.name; editForm.value.reportSource = 'MANUAL'; ElMessage.success('文件上传成功'); uploadRef.value?.clearFiles() } else { ElMessage.error(res.message || '上传异常') } }
const handleUploadError = () => ElMessage.error('上传失败，请检查网络')
const removeFile = () => { editForm.value.fileUrl = ''; editForm.value.fileName = ''; editForm.value.reportSource = 'MANUAL' }
const openPdf = (url) => { if (url) window.open(url, '_blank') }
const downloadPdf = (url, name) => { if (!url) return; const link = document.createElement('a'); link.style.display = 'none'; link.href = url; link.download = name || '检测报告.pdf'; document.body.appendChild(link); link.click(); document.body.removeChild(link) }
onMounted(() => { getList(); loadFarmList() })
</script>

<style scoped>
.crud-container { padding: 24px; background-color: transparent; }
.box-card { border-radius: 12px; border: none; box-shadow: 0 4px 20px 0 rgba(0,0,0,0.05); }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.toolbar-left, .toolbar-right { display: flex; gap: 12px; }
.search-input { width: 280px; }
.action-btn { border-radius: 8px; font-weight: 500; }
.modern-table { border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03); }
:deep(.el-table th.el-table__cell) { border-bottom: 2px solid #ebeef5; }
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) { background-color: #f3f4f6; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
.modern-form :deep(.el-form-item__label) { font-weight: 500; color: #374151; }
.dialog-footer { display: flex; justify-content: flex-end; gap: 12px; padding-top: 10px; }
.uploaded-file { margin-top: 10px; display: flex; align-items: center; gap: 6px; background: #f0f9eb; padding: 6px 12px; border-radius: 4px; border: 1px solid #e1f3d8; }
.file-name { font-size: 13px; color: #67C23A; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.muted { color:#999; font-size:12px; }
.source-tag { margin-left: 8px; }
.ai-box { margin: 8px 0 0 0; padding: 14px 14px 4px; border: 1px dashed #b7dfc5; border-radius: 8px; background: #f8fffb; }
.ai-box-title { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; color: #2f855a; font-weight: 600; }
</style>