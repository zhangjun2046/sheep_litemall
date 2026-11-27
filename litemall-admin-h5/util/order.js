const ORDER_STATUS = {
	101: '未付款',
	102: '用户取消',
	103: '系统取消',
	104: '管理员取消',
	201: '已付款',
	202: '申请退款',
	203: '已退款',
	301: '已发货',
	401: '用户收货',
	402: '系统收货'
}

const AFTERSALE_STATUS = {
	1: '已申请',
	2: '审核通过',
	3: '已退款',
	4: '已拒绝',
	5: '用户已取消'
}

const AFTERSALE_TYPE = {
	0: '未收货退款',
	1: '不退货退款',
	2: '退货退款'
}

export function canEditShipSn(order) {
	if (!order) {
		return false
	}
	return order.orderStatus == 301 && order.shipSnModified !== true && order.shipSnModified !== 1
}

export function shipResultLines(result) {
	const sn = (result && result.orderSn) || ''
	const mall = result && result.editing
		? (result.mallOk
			? '商城端 ' + sn + ' 订单快递单号修改成功'
			: '商城端 ' + sn + ' 订单快递单号修改失败，原因是：' + (result.mallReason || ''))
		: (result && result.mallOk
			? '商城端 ' + sn + ' 订单发货成功'
			: '商城端 ' + sn + ' 订单发货失败，原因是：' + ((result && result.mallReason) || ''))
	let wx = '未执行'
	if (result && result.wxExecuted) {
		if (result.editing) {
			wx = result.wxOk
				? '微信小程序后台发货信息修改成功'
				: '微信小程序后台发货信息修改失败，原因是：' + (result.wxMessage || '')
		} else {
			wx = result.wxOk
				? '微信小程序后台发货信息录入成功'
				: '微信小程序后台发货信息录入失败，原因是：' + (result.wxMessage || '')
		}
	}
	return { mall, wx }
}

export function orderStatusText(status) {
	return ORDER_STATUS[status] || ''
}

export function aftersaleStatusText(status) {
	return AFTERSALE_STATUS[status] || ''
}

export function aftersaleTypeText(type) {
	return AFTERSALE_TYPE[type] || ''
}

export function formatTime(value) {
	if (!value) {
		return ''
	}
	return String(value).replace('T', ' ').slice(0, 19)
}

export function specText(specs) {
	if (!specs) {
		return ''
	}
	if (Array.isArray(specs)) {
		return specs.join(' ')
	}
	return String(specs)
}

const CURRENT_ORDER_ID = 'h5CurrentOrderId'

export function setCurrentOrderId(id) {
	const value = id === undefined || id === null ? '' : String(id)
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.setItem(CURRENT_ORDER_ID, value)
		return
	}
	uni.setStorageSync(CURRENT_ORDER_ID, value)
}

export function getCurrentOrderId() {
	if (typeof sessionStorage !== 'undefined') {
		return sessionStorage.getItem(CURRENT_ORDER_ID) || ''
	}
	return uni.getStorageSync(CURRENT_ORDER_ID) || ''
}

export function clearCurrentOrderId() {
	if (typeof sessionStorage !== 'undefined') {
		sessionStorage.removeItem(CURRENT_ORDER_ID)
		return
	}
	uni.removeStorageSync(CURRENT_ORDER_ID)
}

export function showError(error) {
	const title = (error && (error.errmsg || error.errMsg || error.msg)) || '请求失败'
	uni.showToast({
		title,
		icon: 'none'
	})
}
