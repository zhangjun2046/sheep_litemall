import { request } from '@/util/request'

export function login(data) {
	return request({
		url: '/admin/auth/login',
		method: 'POST',
		data
	})
}

export function logout() {
	return request({
		url: '/admin/auth/logout',
		method: 'POST'
	})
}
