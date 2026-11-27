<template>
	<view>
		<u-sticky bgColor="#F9F9F9" customNavHeight="0">
			<view class="category">
				<view class="normal" @click="goOrder">订单管理</view>
				<view class="active">售后管理</view>
				<view class="logout" @click="confirmLogout">退出</view>
			</view>
		</u-sticky>
		<view class="page">
			<view class="item" v-for="item in list" :key="item.id" @click="openDetail(item)">
				<view class="number">售后编号：{{ item.aftersaleSn }}</view>
				<view class="line"></view>
				<view class="flex">
					<view class="title">订单号：</view>
					<view class="content">{{ item.orderSn }}</view>
				</view>
				<view class="flex">
					<view class="title">类型：</view>
					<view class="content">{{ typeText(item.type) }}</view>
				</view>
				<view class="flex">
					<view class="title">原因：</view>
					<view class="content">{{ item.reason }}</view>
				</view>
				<view class="flex">
					<view class="title">金额：</view>
					<view class="content">￥{{ item.amount }}</view>
				</view>
				<view class="flex">
					<view class="title">状态：</view>
					<view class="content warn">{{ statusText(item.status) }}</view>
				</view>
				<view class="flex">
					<view class="title">申请时间：</view>
					<view class="content">{{ timeText(item.addTime) }}</view>
				</view>
				<view class="line"></view>
				<view class="flex-end">
					<view v-if="item.status == 1" class="plain" @click.stop="recept(item)">通过</view>
					<view v-if="item.status == 1" class="plain danger" @click.stop="reject(item)">拒绝</view>
					<view v-if="item.status == 2" class="detail" @click.stop="refund(item)">退款</view>
					<view class="detail" @click.stop="openDetail(item)">详情</view>
				</view>
			</view>
			<u-loadmore v-if="!isEmptyData" :status="loadStatus" />
			<u-empty v-if="isEmptyData" mode="data" text="暂无售后" textColor="#BBB" marginTop="80px" textSize="30rpx"></u-empty>
		</view>
	</view>
</template>

<script>
import { listAftersale, receptAftersale, rejectAftersale, refundAftersale, setCurrentAftersale } from '@/api/aftersale'
import { aftersaleStatusText, aftersaleTypeText, formatTime, showError } from '@/util/order'
import { confirmLogout } from '@/util/logout'

export default {
	data() {
		return {
			page: 1,
			list: [],
			loadStatus: 'loadmore',
			isEmptyData: false
		}
	},
	onShow() {
		this.reload()
	},
	onPullDownRefresh() {
		this.reload()
	},
	onReachBottom() {
		if (this.loadStatus !== 'nomore') {
			this.page += 1
			this.fetchList()
		}
	},
	methods: {
		statusText: aftersaleStatusText,
		typeText: aftersaleTypeText,
		timeText: formatTime,
		goOrder() {
			uni.redirectTo({ url: '/pages/order/index' })
		},
		confirmLogout,
		reload() {
			this.page = 1
			this.list = []
			this.fetchList()
		},
		fetchList() {
			this.loadStatus = 'loading'
			listAftersale({
				page: this.page,
				limit: 10,
				sort: 'add_time',
				order: 'desc'
			}).then((data) => {
				uni.stopPullDownRefresh()
				const rows = (data && data.list) || []
				this.list = this.page === 1 ? rows : this.list.concat(rows)
				const total = data ? data.total : 0
				this.loadStatus = this.list.length >= total ? 'nomore' : 'loadmore'
				this.isEmptyData = this.list.length === 0
			}).catch((error) => {
				uni.stopPullDownRefresh()
				showError(error)
			})
		},
		openDetail(item) {
			setCurrentAftersale(item)
			uni.navigateTo({ url: '/pages/aftersale/detail?id=' + item.id })
		},
		payload(item) {
			return { id: item.id, type: item.type }
		},
		recept(item) {
			uni.showModal({
				title: '审核通过',
				content: '确认通过这笔售后？',
				success: (res) => {
					if (!res.confirm) {
						return
					}
					receptAftersale(this.payload(item)).then(() => {
						uni.showToast({ title: '已通过', icon: 'success' })
						this.reload()
					}).catch(showError)
				}
			})
		},
		reject(item) {
			uni.showModal({
				title: '审核拒绝',
				content: '确认拒绝这笔售后？',
				success: (res) => {
					if (!res.confirm) {
						return
					}
					rejectAftersale(this.payload(item)).then(() => {
						uni.showToast({ title: '已拒绝', icon: 'success' })
						this.reload()
					}).catch(showError)
				}
			})
		},
		refund(item) {
			uni.showModal({
				title: '售后退款',
				content: '退款金额 ' + item.amount + ' 元，确认退款？',
				success: (res) => {
					if (!res.confirm) {
						return
					}
					refundAftersale(this.payload(item)).then(() => {
						uni.showToast({ title: '已退款', icon: 'success' })
						this.reload()
					}).catch(showError)
				}
			})
		}
	}
}
</script>

<style lang="scss" scoped>
.page {
	width: 100vw;
	min-height: 100vh;
	background: #f9f9f9;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.category {
	background-color: white;
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 10px 25px 15px 15px;
	.normal {
		margin-right: 15px;
		color: #666;
		font-size: 15px;
	}
	.active {
		margin-right: 15px;
		color: #333;
		font-size: 18px;
		font-weight: bold;
	}
	.logout {
		margin-left: auto;
		color: #878787;
		font-size: 14px;
	}
}
.item {
	margin-top: 10px;
	width: calc(100% - 16px);
	background: #fff;
	border-radius: 10px;
	padding: 0 18px 14px;
	box-sizing: border-box;
	.number {
		color: #333;
		font-size: 14px;
		line-height: 50px;
	}
	.line {
		background: #f9f9f9;
		height: 2rpx;
	}
	.flex {
		display: flex;
		justify-content: space-between;
		line-height: 32px;
		.title {
			color: #878787;
			font-size: 14px;
			min-width: 64px;
		}
		.content {
			color: #333;
			font-size: 14px;
			text-align: right;
			flex: 1;
		}
		.warn {
			color: #e12727;
		}
	}
}
.flex-end {
	display: flex;
	justify-content: flex-end;
	margin-top: 10px;
}
.plain,
.detail {
	min-width: 72px;
	text-align: center;
	line-height: 36px;
	border-radius: 18px;
	font-size: 14px;
	margin-left: 8px;
	padding: 0 10px;
}
.plain {
	color: #33755b;
	border: 1px solid #33755b;
}
.danger {
	color: #e12727;
	border-color: #e12727;
}
.detail {
	color: #fff;
	background: linear-gradient(to right, #4d947a, #2d6d52);
}
</style>
