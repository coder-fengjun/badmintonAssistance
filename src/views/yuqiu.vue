<template>
  <div class="yuqiu">
    <div class="yuqiu-left">
      <div class="yuqiu-left-content-from">
        <el-form
          :model="form"
          label-width="auto"
          style="
            max-width: 600px;
            border: 5px solid #eee;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 10px;
          "
        >
          <el-form-item label="登录手机号：" prop="phone">
            <el-input v-model="form.phone" style="width: 140px; margin-right: 10px" clearable />
            <el-button type="primary" @click="onGetSmsCode">获取验证码</el-button>
          </el-form-item>
          <el-form-item label="验证码：" prop="code">
            <el-input v-model="form.code" style="width: 140px; margin-right: 10px" clearable />
            <el-button type="primary" style="margin-right: 10px" @click="onLogin">登录</el-button>
            <span style="color: #589ff8" v-if="loginStatus === 0">登录成功！</span>
          </el-form-item>
          <span style="color: #589ff8">如果token失效，请重新登录获取～</span>
          <h2 class="now-date-timer">{{ timeString }}</h2>
        </el-form>
        <el-form
          :model="form"
          label-width="auto"
          ref="ruleFormRef"
          :rules="rules"
          style="max-width: 600px"
        >
          <el-form-item label="登录Token：" prop="token">
            <el-input v-model="form.token" clearable disabled />
          </el-form-item>
          <el-form-item label="日期：" prop="new_date">
            <el-date-picker
              v-model="form.new_date"
              type="date"
              placeholder="选择日期"
              size="default"
              value-format="YYYY-MM-DD"
              @change="onSetInfo(ruleFormRef)"
              clearable
            />
          </el-form-item>

          <el-form-item label="选择球场：">
            <el-select
              v-model="form.cll_number"
              placeholder="请选择球场"
              style="width: 240px"
              clearable
            >
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
              start="15:00"
              step="01:00"
              end="23:00"
            />
            <el-time-select
              v-model="form.end_time"
              style="margin-left: 10px; width: 140px"
              placeholder="结束时间"
              start="15:00"
              step="01:00"
              end="23:00"
            />
          </el-form-item>
          <div class="el-form-item-btn">
            <el-button @click="onReset">1.重置</el-button>
            <el-button type="primary" @click="onSubmit(ruleFormRef)">2.暴风开抢！</el-button>
            <el-button type="warning" @click="stopTimeCheck">3.手动结束</el-button>
          </div>
        </el-form>
      </div>
    </div>
    <div class="yuqiu-table" style="width: 560px">
      <el-table :data="addressList" height="300">
        <el-table-column prop="user_name" label="当前用户" width="100" />
        <el-table-column prop="course_name" label="我的场地" />
        <el-table-column prop="preper_time_text" label="预约时间" width="200" />
        <el-table-column fixed="right" prop="status_text" label="预约状态" width="100" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
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
  end_time: string
  phone: string
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
  const specificDate = new Date(form.new_date)

  // 分割传入的时间字符串
  const [hours, minutes] = timeStr.split(':').map(Number)

  // 设置时间为今天的指定时分，秒为0
  const targetTime = new Date(specificDate)
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
    console.log('---------res', res)
  } else {
    console.log('接口请求失败QAQ')
  }
}
const onSubmit = (formEl: FormInstance | undefined) => {
  try {
    if (!formEl) return
    timeCheckActive = true
    formEl.validate(async (valid, fields) => {
      if (valid) {
        // 启动初始时间检查
        checkTimeAndStartTimer()

        ElMessage({
          message: '开始监听！',
          type: 'success',
        })
      } else {
        console.log('error submit!', fields)
      }
    })
  } catch (error) {
    console.log(error)
  }
}

const interval = 30 // 每20毫秒请求一次
const maxCalls = 50 // 最大调用次数

let callCount = 0 // 当前调用次数
let timeCheckActive = true // 时间检查是否活跃

function startTimer() {
  const timer = setInterval(() => {
    if (callCount >= maxCalls) {
      clearInterval(timer)

      onAddressList()
      ElMessage({
        message: '执行结束！球场列表已刷新～',
        type: 'success',
      })
    } else {
      superYuqiu()
      callCount++
    }
  }, interval)
}

// 检查当前时间是否为15:00
function checkTimeAndStartTimer() {
  if (!timeCheckActive) return
  const now = new Date()
  const targetHour = 14
  const targetMinute = 59
  console.log(
    '------高频监听ing...',
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
    now.getMilliseconds(),
  )
  if (
    now.getHours() === targetHour &&
    now.getMinutes() === targetMinute &&
    now.getSeconds() === 59 &&
    now.getMilliseconds() < 999
  ) {
    startTimer()
    ElMessage({
      message: '已触发自动抢场地！',
      type: 'success',
    })
    timeCheckActive = false // 停止时间检查
  } else {
    // 如果不是15:00，则等待20毫秒再次检查
    setTimeout(checkTimeAndStartTimer, interval)
  }
}

// 结束时间检查的方法
function stopTimeCheck() {
  timeCheckActive = false
  ElMessage({
    message: '超级羽球已停止！',
    type: 'info',
  })
}

const onReset = () => {
  ElMessage({
    message: '重置成功,重新选择抢场地时间！',
    type: 'success',
  })
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
        const res = await getCourseList(params, form.token) // 获取有效球场
        if (res && res.length) {
          options.value = transformData(res)
          ElMessage.success('获取成功,请选择球场')
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

// 获取我的预约球场列表
const onAddressList = async () => {
  try {
    if (!form.token) return
    const params = {
      limit: 20,
      page: 1,
      type: 3,
    }
    const res = await getAddressList(params, form.token)
    if (res) {
      addressList.value = res
    } else {
      ElMessage({
        message: '列表接口请求失败QAQ',
        type: 'error',
      })
    }
  } catch (error) {}
}

const onGetSmsCode = async () => {
  try {
    if (form.phone === '') return
    const params = {
      mobile: form.phone,
    }
    const { code, data, msg } = await getSmsCode(params, form.token)
    if (code === 0) {
      ElMessage.success('短信发送成功')
    } else {
      ElMessage.error('短信发送失败QAQ')
    }
  } catch (error) {}
}

const onLogin = async () => {
  try {
    const params = {
      mobile: form.phone,
      sms_code: form.code,
      login_type: 2,
    }
    const res = await onLoginSys(params, '')
    if (res.token) {
      ElMessage.success('登录成功')
      loginStatus.value = 0
      const userToken = 'sun ' + res.token
      form.token = userToken
      setStorage('yuqiu_token', userToken)
      // sun gZgNK0trWbqkVaGYw5RGR4sVYe/8FbaB4ssDJvejGJk=
      console.log('-------------sto', getStorage('yuqiu_token'))
    } else {
      ElMessage.success('登录失败QAQ')
    }
  } catch (error) {}
}

// 初始化登录信息
const initLogin = async () => {
  const token = getStorage('yuqiu_token')
  if (token) {
    form.token = token
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
  initLogin()
  onAddressList()
})
</script>

<style lang="scss" scoped>
.yuqiu {
  color: #000;
  display: flex;
  align-items: center;
  flex-direction: column;

  width: 100vw;
  height: 100vh;

  .yuqiu-left {
    width: 560px;
    background-color: #fff;

    .yuqiu-left-content-from {
      border-radius: 20px;
      padding: 40px 10px 10px 10px;

      .el-form-item-btn {
        display: flex;
        justify-content: flex-end;
      }
    }

    .now-date-timer {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
    }
  }
}
</style>
