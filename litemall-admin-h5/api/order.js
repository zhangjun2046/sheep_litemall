import { request } from '@/util/request'

export function listOrder(params) {
	return request({
		url: '/admin/order/list',
		method: 'GET',
		params
	})
}

export function detailOrder(id) {
	return request({
		url: '/admin/order/detail',
		method: 'GET',
		params: { id }
	})
}

export function expressOrder(id) {
	return request({
		url: '/admin/order/express',
		method: 'GET',
		params: { id }
	})
}

export function shipOrder(data) {
	return request({
		url: '/admin/order/ship',
		method: 'POST',
		data
	})
}

export function updateShipSn(data) {
	return request({
		url: '/admin/order/ship-sn',
		method: 'POST',
		data
	})
}

export function refundOrder(data) {
	return request({
		url: '/admin/order/refund',
		method: 'POST',
		data
	})
}
