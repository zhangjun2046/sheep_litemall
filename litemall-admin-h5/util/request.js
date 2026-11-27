import { getToken, removeToken } from '@/util/userInfo'

let redirectingToLogin = false

function goLogin() {
	removeToken()
	const app = getApp()
	if (app && app.globalData) {
		app.globalData.token = ''
		app.globalData.isLogin = false
	}
	const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : []
	const current = pages.length ? pages[pages.length - 1].route : ''
	if (current === 'pages/login/index' || redirectingToLogin) {
		return
	}
	redirectingToLogin = true
	uni.reLaunch({ url: '/pages/login/index' })
}

function buildQuery(params) {
	const parts = []
	Object.keys(params || {}).forEach((key) => {
		const value = params[key]
		if (value === undefined || value === null || value === '') {
			return
		}
		if (Array.isArray(value)) {
			value.forEach((item) => {
				parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(item))
			})
			return
		}
		parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
	})
	return parts.join('&')
}

export function request(options = {}) {
	return new Promise((resolve, reject) => {
		const header = Object.assign({
			Accept: 'application/json, text/plain, */*',
			'Content-Type': 'application/json'
		}, options.header || {})
		const token = getToken()
		if (token) {
			header['X-Litemall-Admin-Token'] = token
		}

		let url = options.url
		if ((options.method || 'GET') === 'GET' && options.params) {
			const query = buildQuery(options.params)
			if (query) {
				url += (url.indexOf('?') >= 0 ? '&' : '?') + query
			}
		}

		uni.request({
			url,
			method: options.method || 'GET',
			data: (options.method || 'GET') === 'GET' ? undefined : options.data,
			header,
			timeout: 25000,
			success(res) {
				let body = res.data
				if (typeof body === 'string') {
					try {
						body = JSON.parse(body)
					} catch (e) {
						body = {}
					}
				}
				body = body || {}
				const status = Number(res.statusCode)
				if (status === 301 || status === 302 || body.errno === 501) {
					goLogin()
					reject(body.errno ? body : { errno: 501, errmsg: '请重新登录' })
					return
				}
				if (body.errno === 0) {
					resolve(body.data)
					return
				}
				reject(body)
			},
			fail(err) {
				reject(err)
			}
		})
	})
}
