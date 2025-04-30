import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, AxiosError } from 'axios'

// 定义响应数据通用结构（可根据项目实际调整）
interface ResponseData<T = any> {
  code: number
  data: T
  message: string
}

// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '/api', // 基础路径（根据项目配置）
  timeout: 5000, // 超时时间
})

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    // 添加 token 到 headers
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError): Promise<never> => {
    console.error('请求拦截错误:', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ResponseData>): AxiosResponse<ResponseData> => {
    const res = response.data

    // 假设后端返回格式为 { code: 200, data: xxx, message: '成功' }
    if (res.code !== 0) {
      console.error('接口错误:', res.message)
      // 可触发全局错误提示（如 ElMessage.error(res.message)）
      return Promise.reject(new Error(res.message || '接口错误'))
    }

    return response
  },
  (error: AxiosError): Promise<never> => {
    if (error.code === 'ECONNABORTED') {
      console.error('请求超时，请重试')
    } else if (error.response?.status === 401) {
      console.error('未授权，请重新登录')
      // 跳转登录页逻辑
    } else {
      console.error('未知错误:', error)
    }
    return Promise.reject(error)
  },
)

// 自定义请求方法（支持泛型）
export default <T = any>(config: AxiosRequestConfig): Promise<T> => {
  return new Promise((resolve, reject) => {
    service
      .request(config)
      .then((response: AxiosResponse<ResponseData<T>>) => {
        resolve(response.data.data) // 返回 data.data 部分
      })
      .catch((error: AxiosError) => {
        reject(error)
      })
  })
}
