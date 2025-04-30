<template>
  <div class="yuqiu">
    <div class="yuqiu-left">
      <div class="yuqiu-left-content-from">
        <el-form :model="form" label-width="auto" ref="ruleFormRef" :rules="rules" style="max-width: 600px">
          <el-form-item label="日期：" prop="new_date">
            <el-date-picker
              v-model="form.new_date"
              type="date"
              placeholder="选择日期"
              size="default"
              value-format="YYYY-MM-DD"
              clearable
            />
          </el-form-item>

          <el-form-item label="登录Token：" prop="token">
            <el-input v-model="form.token" clearable />
          </el-form-item>

          <el-form-item label="选择球场：">
            <el-select v-model="form.cll_number" placeholder="请选择球场" style="width: 240px">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="目标时段：">
            <el-time-select
              v-model="form.start_time"
              style="width: 140px"
              class="mr-4"
              placeholder="开始时间"
              start="16:00"
              step="01:00"
              end="23:00"
            />
            <el-time-select
              v-model="form.end_time"
              style="margin-left: 10px; width: 140px"
              placeholder="结束时间"
              start="16:00"
              step="01:00"
              end="23:00"
            />
          </el-form-item>
          <el-form-item>
            <el-button @click="onReset">1.重置</el-button>
            <el-button type="warning" @click="onSetInfo(ruleFormRef)">2.获取球场</el-button>
            <el-button type="primary" @click="onSubmit(ruleFormRef)">3.开抢！</el-button>
          </el-form-item>
        </el-form>
        <h2 class="now-date-timer">{{ timeString }}</h2>
      </div>
    </div>
    <div class="yuqiu-right"></div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getCoursePreper, getCourseList } from '@/serve/api'

// 定义原始数据类型
interface SourceItem {
  name: string
  cll_number: string
  // 其他字段省略...
}

// 定义生成的选项类型
interface Option {
  label: string
  value: string
}

interface RuleForm {
  new_date: string
  token: string
  cll_number: string
  start_time: string
  end_time:  string
}
// do not use same name with ref
const timeString = ref('')
const options = ref<Option[]>([])
const ruleFormRef = ref<FormInstance>()
const form = reactive<RuleForm>({
  new_date: '',
  token: '',
  cll_number: '',
  start_time: '',
  end_time: ''
})

function displayCurrentTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  timeString.value = `${hours}:${minutes}:${seconds}`
}

// 转换方法
function transformData(source: SourceItem[]): Option[] {
  return source.filter(item => item.name.includes('羽毛球')).map((item) => ({
    label: item.name,
    value: item.cll_number,
  }))
}

const onSubmit =  (formEl: FormInstance | undefined) => {
  try {
    const params = {
      page: 1,
      limit: 20,
      course_type: 3,
      day: form.new_date,
    }
    if (!formEl) return
    formEl.validate( async (valid, fields) => {
    if (valid) {
      const res = await getCourseList(params, form.token)
      if (res && res.length) {
        options.value = transformData(res)
        ElMessage.success('获取成功,请选择场地')
      } else {
        console.log('接口请求失败')
      }
    } else {
      console.log('error submit!', fields)
    }
  })
  } catch (error) {
    console.log(error)
  }
}

const onReset = () => {
  console.log('reset!')
}

const onSetInfo = (formEl: FormInstance | undefined) => {
  try {
    const params = {
      page: 1,
      limit: 20,
      course_type: 3,
      day: form.new_date,
    }
    if (!formEl) return
    formEl.validate( async (valid, fields) => {
    if (valid) {
      const res = await getCourseList(params, form.token)
      if (res && res.length) {
        options.value = transformData(res)
        ElMessage.success('获取成功,请选择场地')
      } else {
        console.log('接口请求失败')
      }
    } else {
      console.log('error submit!', fields)
    }
  })
  } catch (error) {
    console.log(error)
  }
}

const rules = reactive<FormRules<RuleForm>>({
  new_date: [
    { required: true, message: '日期信息必须填写', trigger: 'blur' },
  ],
  token: [
    { required: true, message: '登录信息必须填写', trigger: 'blur' },
  ],
  cll_number: [
    { required: true, message: '球场信息必须填写', trigger: 'blur' },
  ],
  target_time: [
    { required: true, message: '球场时段信息必须填写', trigger: 'blur' },
  ]

})

// 时间显示
displayCurrentTime()
// 每秒钟更新一次
setInterval(displayCurrentTime, 500)
</script>

<style lang="scss" scoped>
.yuqiu {
  color: #000;
  display: flex;
  flex-direction: row;

  width: 100vw;
  height: 100vh;

  .yuqiu-left {
    flex: 1;
    height: 100vh;
    background-color: #fff;

    .yuqiu-left-content-from {
      padding: 20px;
    }

    .now-date-timer {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
    }
  }
  .yuqiu-right {
    flex: 2;
    background-color: #eef5fe;
  }
}
</style>
