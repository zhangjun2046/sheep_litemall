import { request } from '@/util/request'

let currentAftersale = null

export function setCurrentAftersale(item) {
	currentAftersale = item
}

export function getCurrentAftersale() {
	return currentAftersale
}

export function listAftersale(params) {
	return request({
		url: '/admin/aftersale/list',
		method: 'GET',
		params
	})
}

export function receptAftersale(data) {
	return request({
		url: '/admin/aftersale/recept',
		method: 'POST',
		data
	})
}

export function rejectAftersale(data) {
	return request({
		url: '/admin/aftersale/reject',
		method: 'POST',
		data
	})
}

export function refundAftersale(data) {
	return request({
		url: '/admin/aftersale/refund',
		method: 'POST',
		data
	})
}
