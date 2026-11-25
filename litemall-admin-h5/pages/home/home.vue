<template>
	<view></view>
</template>

<script>
import { getToken } from '@/util/userInfo'

export default {
	onLoad() {
		if (getToken()) {
			uni.reLaunch({ url: '/pages/order/index' })
			return
		}
		uni.reLaunch({ url: '/pages/login/index' })
	}
}
</script>
