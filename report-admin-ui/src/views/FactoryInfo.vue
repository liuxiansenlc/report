<template>
  <div class="module-container">
    <el-card class="modern-card" shadow="never">
      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索工厂名称"
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
            api-base="/factory-info"
            module-name="工厂基础信息"
            :keyword="queryParams.keyword"
            @success="getList"
          />

          <el-button type="primary" class="add-btn action-btn" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增工厂信息
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
        <el-table-column prop="serialNumber" label="序号" min-width="120" />
        <el-table-column prop="name" label="工厂名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="address" label="工厂地址" min-width="250" show-overflow-tooltip />
        <el-table-column prop="longitude" label="经度" min-width="150" />
        <el-table-column prop="latitude" label="纬度" min-width="150" />
        
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
            <el-form-item label="序号" prop="serialNumber">
              <el-input v-model="form.serialNumber" placeholder="请输入序号" class="modern-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工厂名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称" class="modern-input" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="工厂地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入地址" class="modern-input" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="经度" prop="longitude">
              <el-input v-model="form.longitude" placeholder="请输入经度" class="modern-input" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度" prop="latitude">
              <el-input v-model="form.latitude" placeholder="请输入纬度" class="modern-input" />
            </el-form-item>
          </el-col>
        </el-row>
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
  serialNumber: '',
  name: '',
  address: '',
  longitude: '',
  latitude: ''
}
const form = reactive({ ...defaultForm })

const rules = {
  name: [{ required: true, message: '请输入工厂名称', trigger: 'blur' }]
}

// ----- 列表查询 -----
const getList = async () => {
  try {
    loading.value = true
    const res = await request.get('/factory-info/page', { params: queryParams })
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
    await request.post('/factory-info/delete/batch', selectedIds.value)
    ElMessage.success('批量删除成功')
    getList()
  } catch (error) {
    console.error('Batch delete error:', error)
  }
}

const handleAdd = () => {
  Object.assign(form, defaultForm)
  dialogTitle.value = '新增工厂信息'
  drawerVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleEdit = (row) => {
  Object.assign(form, row)
  dialogTitle.value = '编辑工厂信息'
  drawerVisible.value = true
  if (formRef.value) formRef.value.clearValidate()
}

const handleDelete = async (row) => {
  try {
    await request.post(`/factory-info/delete/${row.id}`)
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
          await request.post('/factory-info/update', form)
          ElMessage.success('更新成功')
        } else {
          await request.post('/factory-info', form)
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
