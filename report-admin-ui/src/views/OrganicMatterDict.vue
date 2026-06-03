<template>
  <div class="crud-container">
    <el-card class="box-card" shadow="hover">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索等级或描述"
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
            api-base="/organic-matter-dict"
            module-name="有机质级别字典"
            :keyword="queryParams.keyword"
            @success="getList"
          />
          <el-button type="success" class="action-btn" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增字典配置
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
        <el-table-column prop="level" label="分级等级" min-width="120" />
        <el-table-column prop="color" label="专属标签拾色" min-width="150" align="center">
          <template #default="{ row }">
            <div class="color-tag" :style="getColorStyle(row.color)">
              {{ row.color }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="富集度描述" min-width="180">
          <template #default="{ row }">
            <span style="font-weight: 500; color: #4b5563;">{{ row.description }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="valueRange" label="测量数值闭环" min-width="180">
          <template #default="{ row }">
            <span class="expr-text">{{ row.valueRange }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-divider direction="vertical" />
            <el-popconfirm title="确定要删除该字典吗？" @confirm="handleDelete(row)">
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
        <el-form-item label="分级等级" prop="level">
          <el-input v-model="form.level" placeholder="如：1级、2级" />
        </el-form-item>
        <el-form-item label="颜色标识" prop="color">
          <el-select v-model="form.color" placeholder="请选择对应颜色" style="width: 100%">
            <el-option label="橙色带黄" value="橙色带黄" />
            <el-option label="黄色" value="黄色" />
            <el-option label="黄色带绿" value="黄色带绿" />
            <el-option label="浅绿" value="浅绿" />
            <el-option label="深绿色" value="深绿色" />
          </el-select>
        </el-form-item>
        
        <el-divider content-position="left">文字判定</el-divider>
        <el-form-item label="富集度描述" prop="description">
          <el-input v-model="form.description" placeholder="针对该等级的富集度修饰词，如：极缺乏" />
        </el-form-item>
        <el-form-item label="数值闭环" prop="valueRange">
          <el-input v-model="form.valueRange" placeholder="如：0-10 或 >40" />
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
  level: '1级',
  color: '橙色带黄',
  description: '',
  valueRange: ''
}
const form = reactive({ ...defaultForm })

const rules = {
  level: [{ required: true, message: '请输入等级', trigger: 'blur' }],
  color: [{ required: true, message: '请选择颜色标识', trigger: 'change' }]
}

// 动态主题 Tag 渲染：重写五级渐变色系
const getColorStyle = (colorName) => {
  const styles = {
    '橙色带黄': { background: '#fffbeb', color: '#d97706', border: '1px solid #fcd34d' },
    '黄色': { background: '#fef9c3', color: '#a16207', border: '1px solid #fef08a' },
    '黄色带绿': { background: '#ecfccb', color: '#4d7c0f', border: '1px solid #d9f99d' },
    '浅绿': { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
    '深绿色': { background: '#f0fdf4', color: '#14532d', border: '1px solid #86efac', fontWeight: 'bold' }
  }
  return styles[colorName] || { background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }
}

// ----- 核心列表加载 -----
const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/organic-matter-dict/page', { params: queryParams })
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
    await request.post('/organic-matter-dict/delete/batch', selectedIds.value)
    ElMessage.success('批量删除成功')
    getList()
  } catch (error) {
    console.error('Batch delete error:', error)
  }
}

const handleAdd = () => {
  Object.assign(form, defaultForm)
  dialogTitle.value = '新增有机质字典配置'
  dialogVisible.value = true
}

const handleEdit = (row) => {
  Object.assign(form, row)
  dialogTitle.value = '编辑字典配置'
  dialogVisible.value = true
}

const submitForm = () => {
  formRef.value?.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (form.id) {
          await request.post('/organic-matter-dict/update', form)
          ElMessage.success('配置修改成功')
        } else {
          await request.post('/organic-matter-dict', form)
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
    await request.post(`/organic-matter-dict/delete/${row.id}`)
    ElMessage.success('配置删除成功')
    getList()
  } catch (error) {
    console.error(error)
    ElMessage.error('删除配置失败')
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
  color: #8b5cf6;
  font-size: 13px;
  font-weight: bold;
}
.color-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  white-space: nowrap;
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
