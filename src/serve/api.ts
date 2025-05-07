// api.js
import service from '../utils/http'

// POST - 抢球场接口
export function getCoursePreper(data: any, token: string) {
  return service({
    url: '/mobile/course_preper',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  })
}

// 获取球场编号信息
export function getCourseList(data: any, token: string) {
  return service({
    url: '/mobile/course_list',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  })
}

// 其他方法（PUT/DELETE 等）同理 /mobile/preper_user
// 获取球场编号信息
export function getAddressList(data: any, token: string) {
  return service({
    url: '/mobile/preper_user',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  })
}

// 获取验证码
export function getSmsCode(data: any, token: string) {
  return service({
    url: '/sms/send_sms',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  })
}

// 登录账号
export function onLoginSys(data: any) {
  return service({
    url: '/mobile/user_login',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json'
    },
  })
}