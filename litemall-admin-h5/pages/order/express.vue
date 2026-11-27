<template>
	<view class="page">
		<view class="card" v-if="loaded">
			<view class="head">物流轨迹</view>
			<view class="row" v-if="expName"><text class="label">快递公司</text><text>{{ expName }}</text></view>
			<view class="row" v-if="expNo"><text class="label">快递单号</text><text class="value">{{ expNo }}</text></view>
			<view class="row" v-if="statusText"><text class="label">物流状态</text><text class="warn">{{ statusText }}</text></view>
			<view v-if="message && !traces.length" class="empty">{{ message }}</view>
			<view v-else-if="!traces.length" class="empty">暂无物流轨迹</view>
		</view>
		<view class="card" v-if="traces.length">
			<view class="step" v-for="(item, index) in traces" :key="index">
				<view class="left">
					<view :class="index === 0 ? 'high-dot' : 'dot'"></view>
					<view v-if="index !== traces.length - 1" class="line"></view>
				</view>
				<view class="right">
					<view :class="index === 0 ? 'high-title' : 'title'">{{ item.context }}</view>
					<view class="time">{{ item.time }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { expressOrder } from '@/api/order'
import { getCurrentOrderId, showError } from '@/util/order'

export default {
	data() {
		return {
			loaded: false,
			expName: '',
			expNo: '',
			statusText: '',
			message: '',
			traces: []
		}
	},
	onLoad() {
		const id = getCurrentOrderId()
		if (!id) {
			uni.redirectTo({ url: '/pages/order/index' })
			return
		}
		expressOrder(id).then((data) => {
			const result = data || {}
			this.expName = result.expName || ''
			this.expNo = result.expNo || ''
			this.statusText = result.deliveryStatusText || ''
			this.message = result.message || ''
			this.traces = result.traces || []
			this.loaded = true
		}).catch((err) => {
			this.loaded = true
			this.message = (err && err.errmsg) || '暂时无法查询物流，请稍后再试'
			if (!err || err.errno !== 501) {
				showError(err)
			}
		})
	}
}
</script>

<style scoped>
.page {
	min-height: 100vh;
	background: #f5f6fa;
	padding: 12px 12px 40px;
	box-sizing: border-box;
}
.card {
	background: #fff;
	border-radius: 10px;
	padding: 14px 16px;
	margin-bottom: 12px;
}
.head {
	font-size: 16px;
	color: #333;
	font-weight: bold;
	margin-bottom: 10px;
}
.row {
	display: flex;
	justify-content: space-between;
	line-height: 32px;
	font-size: 14px;
	color: #333;
}
.label {
	color: #878787;
	min-width: 72px;
}
.value {
	flex: 1;
	text-align: right;
}
.warn {
	color: #317358;
}
.empty {
	color: #878787;
	font-size: 14px;
	line-height: 22px;
	padding: 8px 0 4px;
}
.step {
	display: flex;
}
.left {
	display: flex;
	flex-direction: column;
	align-items: center;
	width: 16px;
}
.dot,
.high-dot {
	width: 10px;
	height: 10px;
	border-radius: 5px;
	margin-top: 4px;
}
.dot {
	background: #d8d8d8;
}
.high-dot {
	background: #43896f;
}
.line {
	width: 1px;
	flex: 1;
	background: #f1f1f1;
}
.right {
	flex: 1;
	margin-left: 12px;
	padding-bottom: 18px;
}
.title,
.high-title {
	font-size: 14px;
	line-height: 20px;
}
.title {
	color: #333;
}
.high-title {
	color: #43896f;
}
.time {
	margin-top: 4px;
	color: #878787;
	font-size: 13px;
}
</style>
