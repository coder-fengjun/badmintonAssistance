// api.js
import service from '../utils/http'

// POST - 抢球场接口
export function getCoursePreper(data: any) {
  return service({
    url: '/mobile/course_preper',
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'application/json',
      'authorization': 'sun gZgNK0trWbqkVaGYw5RGR4sVYe/8FbaB4ssDJvejGJk=',
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
      'authorization': token,
    },
  })
}

// 其他方法（PUT/DELETE 等）同理
