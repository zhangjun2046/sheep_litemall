import { logout } from '@/api/login'
import { clearStorageSync } from '@/util/userInfo'
import { clearCurrentOrderId } from '@/util/order'

function finishLogout() {
	clearCurrentOrderId()
	clearStorageSync()
	const app = getApp()
	if (app && app.globalData) {
		app.globalData.token = ''
		app.globalData.isLogin = false
		app.globalData.userName = ''
	}
	uni.reLaunch({ url: '/pages/login/index' })
}

export function confirmLogout() {
	uni.showModal({
		title: '退出登录',
		content: '确认退出当前账号？',
		success(res) {
			if (!res.confirm) {
				return
			}
			logout().then(finishLogout).catch(finishLogout)
		}
	})
}
