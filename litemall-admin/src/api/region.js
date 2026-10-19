import request from '@/utils/request'

export function listRegion() {
  return request({
    url: '/region/list',
    method: 'get'
  })
}

export function listSubRegion(query) {
  return request({
    url: '/region/clist',
    method: 'get',
    params: query
  })
}

export function createRegion(data) {
  return request({
    url: '/region/create',
    method: 'post',
    data
  })
}

export function updateRegion(data) {
  return request({
    url: '/region/update',
    method: 'post',
    data
  })
}

export function deleteRegion(data) {
  return request({
    url: '/region/delete',
    method: 'post',
    data
  })
}
