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

export function showError(error) {
	const title = (error && (error.errmsg || error.errMsg || error.msg)) || '请求失败'
	uni.showToast({
		title,
		icon: 'none'
	})
}
