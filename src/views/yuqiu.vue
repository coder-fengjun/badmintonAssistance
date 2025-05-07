<template>
  <div class="yuqiu">
    <div class="yuqiu-left">
      <div class="yuqiu-left-content-from">
        <el-form
          :model="form"
          label-width="auto"
          ref="ruleFormRef"
          :rules="rules"
          style="max-width: 600px"
        >

          <el-form-item label="登录手机号：" prop="phone">
            <el-input v-model="form.phone"  style="width: 140px; margin-right: 10px;" clearable/>
            <el-button type="primary" @click="onGetSmsCode">获取验证码</el-button>
          </el-form-item>
          <el-form-item label="验证码：" prop="code">
            <el-input v-model="form.code"  style="width: 140px; margin-right: 10px;" clearable/>
            <el-button type="primary" style="margin-right: 10px;" @click="onLogin">登录</el-button>
            <span style="color: #589ff8" v-if="loginStatus === 0">登录成功！</span>
          </el-form-item>
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
            <el-input v-model="form.token" clearable disabled/>
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
import { getCoursePreper, getCourseList, getAddressList, getSmsCode, onLoginSys } from '@/serve/api'
import { getStorage, setStorage } from '@/utils/localStorage'


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
  end_time: string,
  phone: string,
  code: string
}
// do not use same name with ref
const timeString = ref('')
const options = ref<Option[]>([])
const ruleFormRef = ref<FormInstance>()
const form = reactive<RuleForm>({
  phone: '',
  code: '',
  new_date: '',
  token: '',
  cll_number: '',
  start_time: '',
  end_time: '',
})
const addressList = ref<Option[]>([])
const loginStatus = ref(1)

function displayCurrentTime() {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  timeString.value = `${hours}:${minutes}:${seconds}`
}

// 转换方法
function transformData(source: SourceItem[]): Option[] {
  return source
    .filter((item) => item.name.includes('羽毛球'))
    .map((item) => ({
      label: item.name,
      value: item.cll_number,
    }))
}

function generateTimestamp(timeStr: {
  split: (arg0: string) => {
    (): any
    new (): any
    map: { (arg0: NumberConstructor): [any, any]; new (): any }
  }
}) {
  // 获取当前日期
  const now = new Date()

  // 分割传入的时间字符串
  const [hours, minutes] = timeStr.split(':').map(Number)

  // 设置时间为今天的指定时分，秒为0
  const targetTime = new Date(now)
  targetTime.setHours(hours, minutes, 0, 0) // 秒和毫秒都设为0

  // 返回秒级时间戳（注意：JS的Date.getTime()返回的是毫秒，所以要除以1000）
  return Math.floor(targetTime.getTime() / 1000)
}

const superYuqiu = async () => {
  const params = {
    payment_type: 0,
    cll_number: form.cll_number, // 5.7-3号场 85269187914726704460
    course_type: '3',
    timestamp: generateTimestamp(form.start_time),
    timestamp_end: generateTimestamp(form.end_time),
  }
  const res = await getCoursePreper(params, form.token) // 抢场地接口
  if (res && res.length) {
    options.value = transformData(res)
    ElMessage.success('获取成功,请选择场地')
  } else {
    console.log('接口请求失败')
  }
}
const onSubmit = (formEl: FormInstance | undefined) => {
  try {
    if (!formEl) return
    formEl.validate(async (valid, fields) => {
      if (valid) {
        const interval = 20 // 每20毫秒请求一次
        const duration = 3000 // 总共持续3000毫秒（3秒）

        // 启动定时器，每20毫秒执行一次
        const timer = setInterval(superYuqiu, interval)

        // 设置5秒后清除定时器，停止请求
        setTimeout(() => {
          clearInterval(timer)
          ElMessage.success('狂飙结束')
        }, duration)
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
    formEl.validate(async (valid, fields) => {
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

const onAddressList = async () => {
  try {
    const params = {
      limit: 20,
      page: 1,
      type: 3
    }
    const { code, data, msg } = await getAddressList(params, form.token)
    if (code === 0) {
      addressList.value = data
    } else {
      ElMessage.success('列表接口请求失败')
    }
  } catch (error) {

  }
}

const onGetSmsCode = async () => {
  try {
    if (form.phone === '') return
    const params = {
      mobile: form.phone
    }
    const { code, data, msg } = await getSmsCode(params, form.token)
    if (code === 0) {
      ElMessage.success('短信发送成功')
    } else {
      ElMessage.success('短信发送失败')
    }
  } catch (error) {

  }
}

const onLogin = async () => {
  try {
    const params = {
      mobile: form.phone,
      sms_code: form.code,
      login_type: 2
    }
    const { code, data, msg } = await onLoginSys(params)

    if (code === 0) {
      ElMessage.success('登录成功')
      loginStatus.value = 0
      setStorage('yuqiu_token', data.token)
      console.log(data.token)
    } else {
      ElMessage.success('登录失败')
    }
  } catch (error) {
    
  }
}

const rules = reactive<FormRules<RuleForm>>({
  new_date: [{ required: true, message: '日期信息必须填写', trigger: 'blur' }],
  token: [{ required: true, message: '登录信息必须填写', trigger: 'blur' }],
  cll_number: [{ required: true, message: '球场信息必须填写', trigger: 'blur' }],
  target_time: [{ required: true, message: '球场时段信息必须填写', trigger: 'blur' }],
})

// 时间显示
displayCurrentTime()
// 每秒钟更新一次
setInterval(displayCurrentTime, 500)

onMounted(() => {
  onAddressList()
})
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
      border-radius: 20px;
      padding: 60px 10px 10px 10px;
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
