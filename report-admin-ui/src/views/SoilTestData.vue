<template>
  <div class="crud-container">
    <el-card class="box-card" shadow="hover">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="queryParams.keyword"
            placeholder="搜索农场编号/名称/类型/风险等级"
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
            api-base="/soil-test-data"
            module-name="土壤基本指标"
            :keyword="queryParams.keyword"
            @success="getList"
          />
          <el-button type="success" class="action-btn" @click="handleAdd">
            <el-icon><Plus /></el-icon> 新增检测记录
          </el-button>
        </div>
      </div>

      <!-- 大宽表数据渲染 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        class="modern-table wide-table"
        style="width: 100%"
        height="max(calc(100vh - 280px), 400px)"
        @selection-change="handleSelectionChange"
        :header-cell-style="{ background: '#f9fafb', color: '#6b7280', fontWeight: '600' }"
      >
        <el-table-column type="selection" width="55" fixed="left" />
        <el-table-column prop="farmCode" label="编号" width="80" fixed="left" align="center" />
        <el-table-column prop="farmName" label="农场名称" width="160" show-overflow-tooltip fixed="left">
          <template #default="{ row }">
            <span style="font-weight: bold; color: #1f2937;">{{ row.farmName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100" />
        
        <!-- 理化指标 -->
        <el-table-column label="理化主指标" align="center">
          <el-table-column prop="ph" label="pH" width="80" align="center">
            <template #default="{ row }">
              <span class="value-text">{{ row.ph }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="organicMatter" label="有机质" width="100" align="center">
            <template #default="{ row }">
              <span class="value-text">{{ row.organicMatter }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="等级" width="80" align="center" />
          <el-table-column prop="activeOrganicMatter" label="活性有机质" width="110" align="center" />
          <el-table-column prop="electroConductivity" label="电导率" width="100" align="center" />
        </el-table-column>

        <!-- 营养元素 -->
        <el-table-column label="营养元素 (全项)" align="center">
          <el-table-column prop="hydroNitrogen" label="水解氮" width="90" align="center" />
          <el-table-column prop="availPhosphorus" label="有效磷" width="90" align="center" />
          <el-table-column prop="availPotassium" label="速效钾" width="90" align="center" />
          <el-table-column prop="availCalcium" label="有效钙" width="90" align="center" />
          <el-table-column prop="availMagnesium" label="有效镁" width="90" align="center" />
          <el-table-column prop="availSulfur" label="有效硅" width="90" align="center" />
        </el-table-column>

        <!-- 微量元素 -->
        <el-table-column label="微量元素" align="center">
          <el-table-column prop="availBoron" label="有效硼" width="80" align="center" />
          <el-table-column prop="availIron" label="有效铁" width="80" align="center" />
          <el-table-column prop="availManganese" label="有效锰" width="80" align="center" />
          <el-table-column prop="availCopper" label="有效铜" width="80" align="center" />
        </el-table-column>

        <!-- 重金属风险区域 -->
        <el-table-column label="重金属污染风险" align="center">
          <el-table-column prop="riskLevel" label="风险等级" width="110" align="center" fixed="right">
            <template #default="{ row }">
              <el-tag
                v-if="row.riskLevel"
                :type="getRiskType(row.riskLevel)"
                effect="dark"
                size="small"
                style="font-weight: bold; width: 80px; align-items: center; justify-content: center;"
              >
                {{ row.riskLevel }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="cadmium" label="镉" width="80" align="center" />
          <el-table-column prop="availCadmium" label="有效态镉" width="100" align="center" />
          <el-table-column prop="chromium" label="铬" width="80" align="center" />
          <el-table-column prop="mercury" label="汞" width="80" align="center" />
          <el-table-column prop="arsenic" label="砷" width="80" align="center" />
          <el-table-column prop="leadVal" label="铅" width="80" align="center" />
          <el-table-column prop="copper" label="铜" width="80" align="center" />
          <el-table-column prop="zinc" label="锌" width="80" align="center" />
          <el-table-column prop="nickel" label="镍" width="80" align="center" />
        </el-table-column>

        <!-- 微生物 -->
        <el-table-column label="微生物" align="center">
          <el-table-column prop="microbialCarbon" label="微生物碳" width="100" align="center" />
          <el-table-column prop="microbialNitrogen" label="微生物氮" width="100" align="center" />
        </el-table-column>
        
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
            <el-popconfirm title="确定要删除这条检测记录吗？" @confirm="handleDelete(row)">
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

    <!-- Edit Dialog -->
    <el-dialog v-model="editDialogVisible" title="编辑基本指标" width="60%">
      <el-form :model="editForm" label-width="100px" style="max-height: 60vh; overflow-y: auto; padding-right: 20px;">
        <el-divider content-position="left">基础信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="所属农场">
              <el-select 
                v-model="editForm.farmCode" 
                placeholder="请选择归属农场" 
                style="width: 100%"
                filterable
                @change="handleFarmChange"
              >
                <el-option 
                  v-for="item in farmList" 
                  :key="item.farmCode" 
                  :label="item.farmName + ' (' + item.farmCode + ')'" 
                  :value="item.farmCode" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="农场名称">
              <el-input v-model="editForm.farmName" disabled placeholder="选择农场后自动带出" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="类型">
              <el-select v-model="editForm.type" placeholder="请选择检测类型" style="width: 100%">
                <el-option label="改良前" value="改良前" />
                <el-option label="改良后" value="改良后" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-divider content-position="left">理化指标</el-divider>
        <el-row :gutter="20">
          <el-col :span="8"><el-form-item label="pH"><el-input-number v-model="editForm.ph" :precision="3" :step="0.1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="有机质"><el-input-number v-model="editForm.organicMatter" :precision="3" :step="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="等级"><el-input v-model="editForm.level" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="活性有机质"><el-input-number v-model="editForm.activeOrganicMatter" :precision="3" :step="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="电导率"><el-input-number v-model="editForm.electroConductivity" :precision="3" :step="0.1" style="width: 100%" /></el-form-item></el-col>
        </el-row>

        <el-divider content-position="left">营养元素 (全项)</el-divider>
        <el-row :gutter="20">
          <el-col :span="8"><el-form-item label="水解氮"><el-input-number v-model="editForm.hydroNitrogen" :precision="3" :step="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="有效磷"><el-input-number v-model="editForm.availPhosphorus" :precision="3" :step="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="速效钾"><el-input-number v-model="editForm.availPotassium" :precision="3" :step="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="有效钙"><el-input-number v-model="editForm.availCalcium" :precision="3" :step="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="有效镁"><el-input-number v-model="editForm.availMagnesium" :precision="3" :step="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="有效硅"><el-input-number v-model="editForm.availSulfur" :precision="3" :step="1" style="width: 100%" /></el-form-item></el-col>
        </el-row>

        <el-divider content-position="left">微量元素</el-divider>
        <el-row :gutter="20">
          <el-col :span="8"><el-form-item label="有效硼"><el-input-number v-model="editForm.availBoron" :precision="3" :step="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="有效铁"><el-input-number v-model="editForm.availIron" :precision="3" :step="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="有效锰"><el-input-number v-model="editForm.availManganese" :precision="3" :step="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="有效铜"><el-input-number v-model="editForm.availCopper" :precision="3" :step="1" style="width: 100%" /></el-form-item></el-col>
        </el-row>

        <el-divider content-position="left">重金属风险区域</el-divider>
        <el-row :gutter="20">
          <el-col :span="8"><el-form-item label="风险等级"><el-input v-model="editForm.riskLevel" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="镉"><el-input-number v-model="editForm.cadmium" :precision="4" :step="0.1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="有效态镉"><el-input-number v-model="editForm.availCadmium" :precision="4" :step="0.1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="铬"><el-input-number v-model="editForm.chromium" :precision="4" :step="0.1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="汞"><el-input-number v-model="editForm.mercury" :precision="4" :step="0.1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="砷"><el-input-number v-model="editForm.arsenic" :precision="4" :step="0.1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="铅"><el-input-number v-model="editForm.leadVal" :precision="4" :step="0.1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="铜"><el-input-number v-model="editForm.copper" :precision="4" :step="0.1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="锌"><el-input-number v-model="editForm.zinc" :precision="4" :step="0.1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="镍"><el-input-number v-model="editForm.nickel" :precision="4" :step="0.1" style="width: 100%" /></el-form-item></el-col>
        </el-row>

        <el-divider content-position="left">微生物</el-divider>
        <el-row :gutter="20">
          <el-col :span="8"><el-form-item label="微生物碳"><el-input-number v-model="editForm.microbialCarbon" :precision="4" :step="1" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="微生物氮"><el-input-number v-model="editForm.microbialNitrogen" :precision="4" :step="1" style="width: 100%" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Search, Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import ExcelOperator from '@/components/ExcelOperator.vue'

// ----- 状态参数 -----
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const selectedIds = ref([])
const editDialogVisible = ref(false)

const defaultForm = {
  id: null,
  farmCode: '',
  farmName: '',
  type: '',
  ph: 0,
  organicMatter: 0,
  level: '',
  activeOrganicMatter: 0,
  electroConductivity: 0,
  hydroNitrogen: 0,
  availPhosphorus: 0,
  availPotassium: 0,
  availCalcium: 0,
  availMagnesium: 0,
  availSulfur: 0,
  availBoron: 0,
  availIron: 0,
  availManganese: 0,
  availCopper: 0,
  riskLevel: '',
  cadmium: 0,
  availCadmium: 0,
  chromium: 0,
  mercury: 0,
  arsenic: 0,
  leadVal: 0,
  copper: 0,
  zinc: 0,
  nickel: 0,
  microbialCarbon: 0,
  microbialNitrogen: 0
}

const editForm = ref({ ...defaultForm })

const queryParams = reactive({
  current: 1,
  size: 10,
  keyword: ''
})

const getRiskType = (rLevel) => {
  if (!rLevel) return 'info'
  if (rLevel.includes('低风险') || rLevel.includes('安全')) return 'success'
  if (rLevel.includes('中风险') || rLevel.includes('警告')) return 'warning'
  if (rLevel.includes('高风险') || rLevel.includes('危险')) return 'danger'
  return 'primary'
}

// ----- 核心列表加载 -----
const getList = async () => {
  loading.value = true
  try {
    const res = await request.get('/soil-test-data/page', { params: queryParams })
    tableData.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取基本指标列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  queryParams.current = 1
  getList()
}

// ----- 删操作 -----
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) return
  try {
    await request.post('/soil-test-data/delete/batch', selectedIds.value)
    ElMessage.success('批量删除成功')
    getList()
  } catch (error) {
    console.error('Batch delete error:', error)
  }
}

// ----- 表单联动辅助 -----
const farmList = ref([])

const loadFarmList = async () => {
  try {
    const res = await request.get('/farm-info/page', { params: { current: 1, size: 500 } })
    farmList.value = res.data.records || []
  } catch (error) {
    console.error('获取农场列表失败', error)
  }
}

const handleFarmChange = (selectedCode) => {
  const farm = farmList.value.find(f => f.farmCode === selectedCode)
  if (farm) {
    editForm.value.farmName = farm.farmName
  }
}

const handleDelete = async (row) => {
  try {
    await request.post(`/soil-test-data/delete/${row.id}`)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    console.error(error)
    ElMessage.error('删除失败')
  }
}

const handleAdd = () => {
  editForm.value = { ...defaultForm }
  editDialogVisible.value = true
}

const openEditDialog = (row) => {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

const submitEdit = async () => {
  try {
    if (editForm.value.id) {
      await request.post('/soil-test-data/update', editForm.value)
      ElMessage.success('编辑成功')
    } else {
      await request.post('/soil-test-data', editForm.value)
      ElMessage.success('新增成功')
    }
    editDialogVisible.value = false
    getList()
  } catch (error) {
    console.error(error)
    ElMessage.error(editForm.value.id ? '编辑失败' : '新增失败')
  }
}

onMounted(() => {
  getList()
  loadFarmList()
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
  width: 280px;
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
.wide-table {
  /* Prevent cell content from breaking weirdly */
  --el-table-row-hover-bg-color: #f9fafb;
}

.value-text {
  font-family: 'Consolas', 'Courier New', monospace;
  font-weight: bold;
  color: #3b82f6;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
