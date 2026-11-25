<template>
	<view class="page-root">
		<view class="flex">
			<view class="title">蒙关牧</view>
			<view class="title title-sub">移动端管理系统</view>
		</view>

		<view style="margin: 0px 30px 48px 30px">
			<up-input
				placeholder="请输入管理员账号"
				clearable
				placeholderStyle="color: #B9B9B9"
				fontSize="15px"
				color="#333"
				border="none"
				v-model="username"
				:customStyle="inputStyle"
			></up-input>
			<up-input
				placeholder="请输入密码"
				clearable
				:password="!showPassword"
				placeholderStyle="color: #B9B9B9"
				fontSize="15px"
				color="#333"
				border="none"
				v-model="password"
				:customStyle="passwordStyle"
			>
				<template #suffix>
					<view class="eye" @click="showPassword = !showPassword">
						<up-icon
							:name="showPassword ? 'eye-fill' : 'eye-off'"
							size="20"
							color="#999999"
						></up-icon>
					</view>
				</template>
			</up-input>
		</view>
		<view style="margin: 0px 30px">
			<up-button
				@click="submit"
				color="linear-gradient(to right, #4D947A, #2D6D52)"
				:custom-style="{ height: '46px', borderRadius: '23px' }"
				text="登录"
			></up-button>
		</view>
	</view>
</template>

<script>
import { login } from '@/api/login'
import { getToken, setToken, setUserName } from '@/util/userInfo'
import { showError } from '@/util/order'

export default {
	data() {
		return {
			username: '',
			password: '',
			showPassword: false,
			inputStyle: {
				background: '#F5F5FA',
				borderRadius: '25px',
				height: '50px',
				paddingLeft: '30px'
			},
			passwordStyle: {
				background: '#F5F5FA',
				borderRadius: '25px',
				height: '50px',
				paddingLeft: '30px',
				paddingRight: '18px',
				marginTop: '20px'
			}
		}
	},
	onLoad() {
		if (getToken()) {
			uni.reLaunch({ url: '/pages/order/index' })
		}
	},
	methods: {
		submit() {
			if (!this.username) {
				uni.showToast({ title: '请输入账号', icon: 'none' })
				return
			}
			if (!this.password) {
				uni.showToast({ title: '请输入密码', icon: 'none' })
				return
			}
			login({ username: this.username, password: this.password })
				.then((data) => {
					const app = getApp()
					app.globalData.isLogin = true
					app.globalData.token = data.token
					app.globalData.userName = this.username
					setToken(data.token)
					setUserName(this.username)
					uni.reLaunch({ url: '/pages/order/index' })
				})
				.catch((error) => {
					showError(error)
				})
		}
	}
}
</script>

<style scoped>
.page-root {
	background-color: #fff;
	min-height: 100vh;
	padding-top: 80px;
}
.flex {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}
.title {
	font-size: 18px;
	color: #333333;
	font-weight: bold;
	text-align: center;
	line-height: 28px;
	margin: 30px 24px 0;
}
.title-sub {
	font-size: 15px;
	font-weight: normal;
	color: #666666;
	margin: 8px 24px 38px;
}
.eye {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 50px;
	padding-left: 8px;
}
</style>
