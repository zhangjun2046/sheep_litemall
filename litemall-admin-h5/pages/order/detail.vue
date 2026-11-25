<template>
	<view class="page" v-if="order">
		<view class="card">
			<view class="head">商品</view>
			<view class="goods" v-for="item in goods" :key="item.id">
				<image v-if="item.picUrl" class="pic" :src="item.picUrl" mode="aspectFill"></image>
				<view class="info">
					<view class="name">{{ item.goodsName }}</view>
					<view class="spec">{{ spec(item.specifications) }}</view>
					<view class="meta">￥{{ item.price }} × {{ item.number }}</view>
				</view>
			</view>
		</view>
		<view class="card">
			<view class="head">收货信息</view>
			<view class="row"><text class="label">收货人</text><text>{{ order.consignee }}</text></view>
			<view class="row"><text class="label">电话</text><text class="phone" @click="call">{{ order.mobile }}</text></view>
			<view class="row"><text class="label">地址</text><text class="value">{{ order.address }}</text></view>
		</view>
		<view class="card">
			<view class="head">金额与状态</view>
			<view class="row"><text class="label">订单号</text><text class="value">{{ order.orderSn }}</text></view>
			<view class="row" v-if="order.message"><text class="label">留言</text><text class="value">{{ order.message }}</text></view>
			<view class="row"><text class="label">商品金额</text><text>￥{{ order.goodsPrice }}</text></view>
			<view class="row"><text class="label">运费</text><text>￥{{ order.freightPrice }}</text></view>
			<view class="row"><text class="label">实付</text><text>￥{{ order.actualPrice }}</text></view>
			<view class="row"><text class="label">状态</text><text class="warn">{{ statusText(order.orderStatus) }}</text></view>
			<view class="row" v-if="order.payTime"><text class="label">支付时间</text><text>{{ timeText(order.payTime) }}</text></view>
			<view class="row" v-if="order.shipTime"><text class="label">发货时间</text><text>{{ timeText(order.shipTime) }}</text></view>
			<view class="row" v-if="order.shipSn"><text class="label">快递单号</text><text class="value">{{ order.shipSn }}</text></view>
			<view class="row" v-if="order.refundAmount"><text class="label">退款金额</text><text>￥{{ order.refundAmount }}</text></view>
			<view class="row" v-if="order.refundTime"><text class="label">退款时间</text><text>{{ timeText(order.refundTime) }}</text></view>
		</view>
		<view class="actions">
			<view v-if="order.orderStatus == 201" class="plain" @click="openShip(false)">填写单号</view>
			<view v-if="order.orderStatus == 301" class="plain" @click="openShip(true)">修改单号</view>
			<view v-if="order.orderStatus == 202" class="solid" @click="confirmRefund">同意退款</view>
		</view>

		<u-overlay :show="showShip" opacity="0.65">
			<view class="overlay-view">
				<view class="overlay-title">{{ editing ? '修改快递单号' : '填写快递单号' }}</view>
				<view class="hint">快递公司：顺丰</view>
				<view class="input">
					<u--input v-model="shipSn" clearable placeholder="请输入快递单号" border="none"></u--input>
				</view>
				<view class="overlay-actions">
					<view class="plain" @click="showShip = false">取消</view>
					<view class="solid" @click="submitShip">确定</view>
				</view>
			</view>
		</u-overlay>
	</view>
</template>

<script>
import { detailOrder, shipOrder, updateShipSn, refundOrder } from '@/api/order'
import { formatTime, orderStatusText, specText, showError } from '@/util/order'

export default {
	data() {
		return {
			id: null,
			order: null,
			goods: [],
			showShip: false,
			editing: false,
			shipSn: ''
		}
	},
	onLoad(options) {
		this.id = options.id
		this.load()
	},
	methods: {
		statusText: orderStatusText,
		spec: specText,
		timeText: formatTime,
		load() {
			detailOrder(this.id).then((data) => {
				this.order = data.order
				this.goods = data.orderGoods || []
			}).catch(showError)
		},
		call() {
			if (this.order && this.order.mobile) {
				uni.makePhoneCall({ phoneNumber: String(this.order.mobile) })
			}
		},
		openShip(editing) {
			this.editing = editing
			this.shipSn = editing ? (this.order.shipSn || '') : ''
			this.showShip = true
		},
		submitShip() {
			const shipSn = (this.shipSn || '').trim()
			if (!shipSn) {
				uni.showToast({ title: '请填写快递单号', icon: 'none' })
				return
			}
			const run = () => {
				const request = this.editing
					? updateShipSn({ orderId: this.order.id, shipSn })
					: shipOrder({ orderId: this.order.id, shipSn, shipChannel: 'SF' })
				request.then(() => {
					this.showShip = false
					uni.showToast({ title: this.editing ? '已修改' : '已发货', icon: 'success' })
					this.load()
				}).catch(showError)
			}
			if (!this.editing) {
				run()
				return
			}
			uni.showModal({
				title: '修改快递单号',
				content: '确认把快递单号改为 ' + shipSn + ' ？',
				success: (res) => {
					if (res.confirm) {
						run()
					}
				}
			})
		},
		confirmRefund() {
			uni.showModal({
				title: '同意退款',
				content: '退款金额 ' + this.order.actualPrice + ' 元，确认退款？',
				success: (res) => {
					if (!res.confirm) {
						return
					}
					refundOrder({
						orderId: this.order.id,
						refundMoney: String(this.order.actualPrice)
					}).then(() => {
						uni.showToast({ title: '已退款', icon: 'success' })
						this.load()
					}).catch(showError)
				}
			})
		}
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
.goods {
	display: flex;
	margin-top: 10px;
}
.pic {
	width: 64px;
	height: 64px;
	border-radius: 6px;
	background: #f5f5fa;
}
.info {
	margin-left: 10px;
	flex: 1;
}
.name {
	color: #333;
	font-size: 14px;
}
.spec,
.meta {
	color: #878787;
	font-size: 13px;
	margin-top: 4px;
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
	line-height: 22px;
	padding-top: 5px;
}
.phone,
.warn {
	color: #317358;
}
.warn {
	color: #e12727;
}
.actions,
.overlay-actions {
	display: flex;
	justify-content: flex-end;
	margin-top: 8px;
}
.plain,
.solid {
	min-width: 96px;
	text-align: center;
	line-height: 40px;
	border-radius: 20px;
	font-size: 15px;
	margin-left: 10px;
}
.plain {
	color: #33755b;
	border: 1px solid #33755b;
}
.solid {
	color: #fff;
	background: linear-gradient(to right, #4d947a, #2d6d52);
}
.overlay-view {
	background: #fff;
	margin: 210px 10% 0;
	border-radius: 10px;
	padding: 20px 18px;
}
.overlay-title {
	color: #333;
	font-size: 17px;
	font-weight: bold;
}
.hint {
	margin-top: 12px;
	color: #878787;
	font-size: 14px;
}
.input {
	margin-top: 15px;
	background: #f5f5fa;
	border-radius: 24px;
	padding: 8px 12px;
}
</style>
