<template>
  <div class="app-container">

    <div class="filter-container">
      <el-button v-permission="['POST /admin/region/create']" class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('app.button.create') }}</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      :element-loading-text="$t('app.message.list_loading')"
      :tree-props="{ children: 'children' }"
      row-key="id"
      border
      style="width: 100%;margin-bottom: 20px;"
    >

      <el-table-column :label="$t('mall_region.table.name')" prop="name" />

      <el-table-column :label="$t('mall_region.table.type')" prop="type" width="100">
        <template slot-scope="scope">
          {{ typeLabel(scope.row.type) }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('mall_region.table.code')" prop="code" width="140" />

      <el-table-column align="center" :label="$t('mall_region.table.actions')" width="280" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="Number(scope.row.type) !== 3"
            v-permission="['POST /admin/region/create']"
            type="primary"
            size="mini"
            @click="handleCreateChild(scope.row)"
          >{{ $t('mall_region.button.add_child') }}</el-button>
          <el-button v-permission="['POST /admin/region/update']" type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('app.button.edit') }}</el-button>
          <el-button v-permission="['POST /admin/region/delete']" type="danger" size="mini" @click="handleDelete(scope.row)">{{ $t('app.button.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('mall_region.form.type')">
          <el-input :value="typeLabel(dataForm.type)" disabled />
        </el-form-item>
        <el-form-item :label="$t('mall_region.form.parent')">
          <el-input :value="dataForm.parentName || $t('mall_region.value.parent_none')" disabled />
        </el-form-item>
        <el-form-item :label="$t('mall_region.form.name')" prop="name">
          <el-input v-model="dataForm.name" :placeholder="$t('mall_region.placeholder.name')" maxlength="120" />
        </el-form-item>
        <el-form-item :label="$t('mall_region.form.code')" prop="code">
          <el-input v-model="dataForm.code" :placeholder="$t('mall_region.placeholder.code')" maxlength="6" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('app.button.cancel') }}</el-button>
        <el-button v-if="dialogStatus==='create'" type="primary" @click="createData">{{ $t('app.button.confirm') }}</el-button>
        <el-button v-else type="primary" @click="updateData">{{ $t('app.button.confirm') }}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listRegion, createRegion, updateRegion, deleteRegion } from '@/api/region'

export default {
  name: 'Region',
  data() {
    const validateCode = (rule, value, callback) => {
      if (!value && value !== 0) {
        callback(new Error(this.$t('mall_region.placeholder.code')))
        return
      }
      if (!/^\d{6}$/.test(String(value))) {
        callback(new Error(this.$t('mall_region.placeholder.code')))
        return
      }
      callback()
    }
    return {
      list: [],
      listLoading: true,
      dataForm: {
        id: undefined,
        pid: 0,
        type: 1,
        name: '',
        code: '',
        parentName: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [{ required: true, message: '区域名称不能为空', trigger: 'blur' }],
        code: [{ required: true, validator: validateCode, trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    typeLabel(type) {
      const key = 'mall_region.value.type_' + Number(type)
      const label = this.$t(key)
      return label === key ? '' : label
    },
    getList() {
      this.listLoading = true
      listRegion().then(response => {
        this.list = response.data.data.list
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.listLoading = false
      })
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        pid: 0,
        type: 1,
        name: '',
        code: '',
        parentName: ''
      }
    },
    openDialog(status) {
      this.dialogStatus = status
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleCreate() {
      this.resetForm()
      this.openDialog('create')
    },
    handleCreateChild(row) {
      this.resetForm()
      this.dataForm.pid = row.id
      this.dataForm.type = Number(row.type) + 1
      this.dataForm.parentName = row.name
      this.openDialog('create')
    },
    handleUpdate(row) {
      this.dataForm = {
        id: row.id,
        pid: row.pid,
        type: Number(row.type),
        name: row.name,
        code: row.code == null ? '' : String(row.code),
        parentName: ''
      }
      this.openDialog('update')
    },
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (!valid) {
          return
        }
        const payload = {
          name: this.dataForm.name,
          code: Number(this.dataForm.code),
          type: this.dataForm.type,
          pid: this.dataForm.pid
        }
        createRegion(payload)
          .then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '创建成功'
            })
          })
          .catch(response => {
            this.$notify.error({
              title: '失败',
              message: (response.data && response.data.errmsg) || '创建失败'
            })
          })
      })
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (!valid) {
          return
        }
        const payload = {
          id: this.dataForm.id,
          name: this.dataForm.name,
          code: Number(this.dataForm.code)
        }
        updateRegion(payload)
          .then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '更新成功'
            })
          })
          .catch(response => {
            this.$notify.error({
              title: '失败',
              message: (response.data && response.data.errmsg) || '更新失败'
            })
          })
      })
    },
    handleDelete(row) {
      this.$confirm(this.$t('mall_region.message.delete_confirm'), '提示', {
        type: 'warning'
      }).then(() => {
        return deleteRegion({ id: row.id })
      }).then(() => {
        this.getList()
        this.$notify.success({
          title: '成功',
          message: '删除成功'
        })
      }).catch(response => {
        if (response === 'cancel' || response === 'close') {
          return
        }
        this.$notify.error({
          title: '失败',
          message: (response.data && response.data.errmsg) || '删除失败'
        })
      })
    }
  }
}
</script>
