<template>
  <div class="module-container">
    <el-card class="modern-card" shadow="never">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索农场编号/名称"
            class="search-input modern-input"
            clearable
            @keyup.enter="handleSearch"
            @clear="handleSearch"
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
            api-base="/economic-indicator"
            module-name="经济指标"
            :keyword="queryParams.keyword"
            @success="getList"
          />

          <el-button type="primary" class="add-btn action-btn" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增经济指标
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
        <el-table-column prop="farmCode" label="农场编号" min-width="120" />
        <el-table-column prop="farmName" label="农场名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" min-width="120">
          <template #default="scope">
            <el-tag :type="scope.row.type === '改良前' ? 'info' : 'success'">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fertilizerAmount" label="化肥用量（吨/亩）" min-width="150" />
        <el-table-column prop="cropYield" label="农作产量（吨/亩）" min-width="150" />
        <el-table-column prop="unitPrice" label="单价（元/吨）" min-width="150" />
        <el-table-column prop="revenue" label="收益（万元）" min-width="150" />
        
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="handleEdit(scope.row)">编辑</el-button>
            <el-popconfirm title="确定要删除这条记录吗？" @confirm="handleDelete(scope.row)">
              <template #reference>
                <el-button link type="danger">删除</el-button>
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
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="getList"
          @current-change="getList"
          background
        />
      </div>
    </el-card>

    <!-- Form Dialog -->
    <el-dialog
      v-model="drawerVisible"
      :title="dialogTitle"
      width="600px"
      align-center
      destroy-on-close
      class="modern-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="modern-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="农场编号" prop="farmCode">
              <el-input v-model="form.farmCode" placeholder="如: 1" class="modern-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="农场名称" prop="farmName">
              <el-input v-model="form.farmName" placeholder="农场名称" class="modern-input" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择类型" class="modern-input w-100">
                <el-option label="改良前" value="改良前" />
                <el-option label="改良后" value="改良后" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="化肥用量 (吨)" prop="fertilizerAmount">
              <el-input-number v-model="form.fertilizerAmount" :min="0" :precision="2" :step="1" placeholder="化肥用量" class="modern-input w-100" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="农作产量 (吨)" prop="cropYield">
              <el-input-number v-model="form.cropYield" :min="0" :precision="2" :step="10" placeholder="产量" class="modern-input w-100" @change="calculateRevenue" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价 (元/吨)" prop="unitPrice">
              <el-input-number v-model="form.unitPrice" :min="0" :precision="2" :step="100" placeholder="单价" class="modern-input w-100" @change="calculateRevenue" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="收益 (万元)" prop="revenue">
          <el-input-number v-model="form.revenue" :min="0" :precision="4" :step="1" placeholder="系统自动计算或手动输入" class="modern-input w-100" />
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="drawerVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">确定保存</el-button>
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

// ----- 抽屉与表单状态 -----
const drawerVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const formRef = ref(null)

const defaultForm = {
  id: null,
  farmCode: '',
  farmName: '',
  type: '改良前',
  fertilizerAmount: 0,
  cropYield: 0,
  unitPrice: 0,
  revenue: 0
}
const form = reactive({ ...defaultForm })

const rules = {
  farmCode: [{ required: true, message: '请输入农场编号', trigger: 'blur' }],
  farmName: [{ required: true, message: '请输入农场名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

// 自动计算收益 (万元) = 产量(吨) * 单价(元/吨) / 10000
const calculateRevenue = () => {
  if (form.cropYield > 0 && form.unitPrice > 0) {
    const calculated = (form.cropYield * form.unitPrice) / 10000;
    form.revenue = Number(calculated.toFixed(4));
  }
}

// ----- 列表查询 -----
const getList = async () => {
  try {
    loading.value = true
    const res = await request.get('/economic-indicator/page', { params: queryParams })
    tableData.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error('Fetch error:', error)
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
    await request.post('/economic-indicator/delete/batch', selectedIds.value)
    ElMessage.success('批量删除成功')
    getList()
  } catch (error) {
    console.error('Batch delete error:', error)
  }
}

const handleAdd = () => {
  Object.assign(form, defaultForm)
  dialogTitle.value = '新增经济指标'
  drawerVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleEdit = (row) => {
  Object.assign(form, row)
  dialogTitle.value = '编辑经济指标'
  drawerVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleDelete = async (row) => {
  try {
    await request.post(`/economic-indicator/delete/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error('Delete error:', error)
  }
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (form.id) {
          await request.post('/economic-indicator/update', form)
          ElMessage.success('更新成功')
        } else {
          await request.post('/economic-indicator', form)
          ElMessage.success('新增成功')
        }
        drawerVisible.value = false
        getList()
      } catch (error) {
        console.error('Submit error:', error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.module-container {
  height: 100%;
}

.modern-card {
  border-radius: 12px;
  border: none;
  min-height: calc(100vh - 130px);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 280px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  border-radius: 8px;
  font-weight: 500;
}

.add-btn {
  background: var(--primary-color);
  border: none;
}

.modern-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.pagination-container {
  margin-top: 25px;
  display: flex;
  justify-content: flex-end;
}

/* Form Styles */
.modern-form .el-form-item {
  margin-bottom: 22px;
}

:deep(.modern-form .el-form-item__label) {
  font-weight: 500;
  color: #374151;
  padding-bottom: 4px;
}

.w-100 {
  width: 100%;
}

:deep(.modern-input .el-input__wrapper),
:deep(.modern-input .el-input-number__wrapper),
:deep(.modern-input .el-select__wrapper) {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  background-color: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s;
}

:deep(.modern-input .el-input__wrapper:focus-within),
:deep(.modern-input .el-select__wrapper:focus-within) {
  box-shadow: 0 0 0 1px var(--primary-color);
  background-color: white;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 10px;
}

:deep(.modern-dialog .el-dialog__header) {
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 15px;
  margin-right: 0;
}
</style>
