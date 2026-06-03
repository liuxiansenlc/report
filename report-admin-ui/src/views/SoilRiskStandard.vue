<template>
  <div class="crud-container">
    <el-card class="box-card" shadow="hover">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索指标或风险等级"
            class="search-input"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" plain @click="handleSearch">查 询</el-button>
          
          <el-popconfirm title="确定要删除这些记录吗？" @confirm="handleBatchDelete">
            <template #reference>
              <el-button v-show="selectedIds.length > 0" type="danger" plain class="action-btn">
                <el-icon><Delete /></el-icon> 批量删除 ({{ selectedIds.length }})
              </el-button>
            </template>
          </el-popconfirm>
        </div>
        <div class="toolbar-right">
          <ExcelOperator 
            api-base="/soil-risk-standard"
            module-name="重金属风险分级标准"
            :keyword="queryParams.keyword"
            @success="getList"
          />
          <el-button type="success" class="action-btn" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增标准
          </el-button>
        </div>
      </div>

      <!-- Data Table -->
      <el-table
        v-loading="loading"
        :data="tableData"
        class="modern-table"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :header-cell-style="{ background: '#f9fafb', color: '#6b7280', fontWeight: '600' }"
      >
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="indicator" label="指标" min-width="120" />
        <el-table-column prop="riskLevel" label="风险等级" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getRiskTagType(row.riskLevel)" effect="dark" round>
              {{ row.riskLevel }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phRangeExpr" label="pH 区间界定" min-width="180">
          <template #default="{ row }">
            <span class="expr-text">{{ row.phRangeExpr }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="valueRangeExpr" label="数值界定" min-width="180">
          <template #default="{ row }">
            <span class="expr-text">{{ row.valueRangeExpr }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="landUseType" label="土地利用类型" min-width="150" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-popconfirm title="确定要删除该标准吗？" @confirm="handleDelete(row)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.current"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="getList"
          @current-change="getList"
          background
        />
      </div>
    </el-card>

    <!-- Form Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="550px"
      align-center
      :destroy-on-close="true"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" class="modern-form">
        <el-divider content-position="left">基础属性</el-divider>
        <el-form-item label="指标元素" prop="indicator">
          <el-input v-model="form.indicator" placeholder="如：镉、铅、砷" />
        </el-form-item>
        <el-form-item label="风险等级" prop="riskLevel">
          <el-select v-model="form.riskLevel" placeholder="请选择风险等级" style="width: 100%">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="土地利用类型" prop="landUseType">
          <el-select v-model="form.landUseType" placeholder="请选择类型" style="width: 100%">
            <el-option label="旱地" value="旱地" />
            <el-option label="水田" value="水田" />
            <el-option label="果园" value="果园" />
          </el-select>
        </el-form-item>
        
        <el-divider content-position="left">判定表达式</el-divider>
        <el-form-item label="pH 连续区间" prop="phRangeExpr">
          <el-input v-model="form.phRangeExpr" placeholder="如：5.5 < pH <= 6.5" />
        </el-form-item>
        <el-form-item label="数值界限" prop="valueRangeExpr">
          <el-input v-model="form.valueRangeExpr" placeholder="如：0.3 <= 值 < 1" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitLoading">保 存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import ExcelOperator from '@/components/ExcelOperator.vue'

// ----- 状态参数 -----
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const selectedIds = ref([])
const queryParams = reactive({
  current: 1,
  size: 10,
  keyword: ''
})

const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref(null)

const defaultForm = {
  id: null,
  indicator: '镉',
  riskLevel: '中',
  phRangeExpr: '',
  valueRangeExpr: '',
  landUseType: '旱地'
}
const form = reactive({ ...defaultForm })

const rules = {
  indicator: [{ required: true, message: '请输入指标', trigger: 'blur' }],
  riskLevel: [{ required: true, message: '请选择等级', trigger: 'change' }]
}

// 动态主题 Tag 渲染
const getRiskTagType = (level) => {
  if (level === '高') return 'danger'
  if (level === '中') return 'warning'
  if (level === '低') return 'success'
  return 'info'
}

// ----- 核心列表加载 -----
const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/soil-risk-standard/page', { params: queryParams })
    tableData.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取列表记录失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.current = 1
  getList()
}

// ----- 增删改操作 -----
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) return
  try {
    await request.post('/soil-risk-standard/delete/batch', selectedIds.value)
    ElMessage.success('批量删除成功')
    getList()
  } catch (error) {
    console.error('Batch delete error:', error)
  }
}

const handleAdd = () => {
  Object.assign(form, defaultForm)
  dialogTitle.value = '新增重金属风险标准'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, row)
  dialogTitle.value = '编辑风险标准'
  dialogVisible.value = true
}

const submitForm = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (form.id) {
          await request.post('/soil-risk-standard/update', form)
          ElMessage.success('标准修改成功')
        } else {
          await request.post('/soil-risk-standard', form)
          ElMessage.success('标准新增成功')
        }
        dialogVisible.value = false
        getList()
      } catch (error) {
        console.error(error)
        ElMessage.error(form.id ? '修改失败' : '新增失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

const handleDelete = async (row) => {
  try {
    await request.post(`/soil-risk-standard/delete/${row.id}`)
    ElMessage.success('标准删除成功')
    getList()
  } catch (error) {
    console.error(error)
    ElMessage.error('标准删除失败')
  }
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.crud-container {
  padding: 24px;
  background-color: transparent;
}
.box-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 20px 0 rgba(0,0,0,0.05);
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.toolbar-left, .toolbar-right {
  display: flex;
  gap: 12px;
}
.search-input {
  width: 250px;
}
.action-btn {
  border-radius: 8px;
  font-weight: 500;
}
.modern-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}
:deep(.el-table th.el-table__cell) {
  border-bottom: 2px solid #ebeef5;
}
:deep(.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background-color: #f3f4f6;
}
.expr-text {
  font-family: 'Consolas', 'Courier New', monospace;
  background-color: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  color: #0366d6;
  font-size: 13px;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.modern-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
.modern-form :deep(.el-input__wrapper), .modern-form :deep(.el-select) {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
</style>
