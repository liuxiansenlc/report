<template>
  <div class="crud-container">
    <el-card class="box-card" shadow="hover">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索作物名称或编号"
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
            api-base="/crop-ph-standard"
            module-name="作物最适区间"
            :keyword="queryParams.keyword"
            @success="getList"
          />
          <el-button type="success" class="action-btn" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增配置
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
        <el-table-column prop="cropName" label="作物名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="cropCode" label="作物编号" min-width="120" />
        <el-table-column prop="phMin" label="pH 区间最低" min-width="150">
          <template #default="{ row }">
            <el-tag type="warning" effect="plain">{{ row.phMin }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phMax" label="pH 区间最高" min-width="150">
          <template #default="{ row }">
            <el-tag type="danger" effect="plain">{{ row.phMax }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="landUseType" label="土地利用类型" min-width="150" />
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-popconfirm title="确定要删除这条记录吗？" @confirm="handleDelete(row)">
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
      width="500px"
      align-center
      :destroy-on-close="true"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" class="modern-form">
        <el-divider content-position="left">基础属性</el-divider>
        <el-form-item label="作物名称" prop="cropName">
          <el-input v-model="form.cropName" placeholder="如：番茄" />
        </el-form-item>
        <el-form-item label="作物编号" prop="cropCode">
          <el-input v-model="form.cropCode" placeholder="系统唯一编号" />
        </el-form-item>
        
        <el-divider content-position="left">酸碱度区间控制</el-divider>
        <el-form-item label="pH 最低阈值" prop="phMin">
          <el-input-number v-model="form.phMin" :precision="2" :step="0.1" :min="0" :max="14" style="width: 100%" />
        </el-form-item>
        <el-form-item label="pH 最高阈值" prop="phMax">
          <el-input-number v-model="form.phMax" :precision="2" :step="0.1" :min="0" :max="14" style="width: 100%" />
        </el-form-item>

        <el-form-item label="土地利用类型" prop="landUseType">
          <el-select v-model="form.landUseType" placeholder="请选择土地利用类型" style="width: 100%">
            <el-option label="旱地" value="旱地" />
            <el-option label="水田" value="水田" />
            <el-option label="果园" value="果园" />
          </el-select>
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
  cropName: '',
  cropCode: '',
  phMin: 0,
  phMax: 0,
  landUseType: '旱地'
}
const form = reactive({ ...defaultForm })

const rules = {
  cropName: [{ required: true, message: '请输入作物名称', trigger: 'blur' }],
  cropCode: [{ required: true, message: '请输入作物编号', trigger: 'blur' }]
}

// ----- 核心列表加载 -----
const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/crop-ph-standard/page', { params: queryParams })
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
    await request.post('/crop-ph-standard/delete/batch', selectedIds.value)
    ElMessage.success('批量删除成功')
    getList()
  } catch (error) {
    console.error('Batch delete error:', error)
  }
}

const handleAdd = () => {
  Object.assign(form, defaultForm)
  dialogTitle.value = '新增作物酸碱度配置'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, row)
  dialogTitle.value = '编辑作物酸碱度配置'
  dialogVisible.value = true
}

const submitForm = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (form.id) {
          await request.post('/crop-ph-standard/update', form)
          ElMessage.success('配置修改成功')
        } else {
          await request.post('/crop-ph-standard', form)
          ElMessage.success('配置新增成功')
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
    await request.post(`/crop-ph-standard/delete/${row.id}`)
    ElMessage.success('配置删除成功')
    getList()
  } catch (error) {
    console.error(error)
    ElMessage.error('配置删除失败')
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
