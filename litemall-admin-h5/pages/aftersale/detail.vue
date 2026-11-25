<template>
	<view class="page" v-if="item">
		<view class="card">
			<view class="row"><text class="label">售后编号</text><text>{{ item.aftersaleSn }}</text></view>
			<view class="row"><text class="label">订单号</text><text>{{ item.orderSn }}</text></view>
			<view class="row"><text class="label">类型</text><text>{{ typeText(item.type) }}</text></view>
			<view class="row"><text class="label">原因</text><text class="value">{{ item.reason }}</text></view>
			<view class="row"><text class="label">金额</text><text>￥{{ item.amount }}</text></view>
			<view class="row"><text class="label">状态</text><text class="warn">{{ statusText(item.status) }}</text></view>
			<view class="row" v-if="item.comment"><text class="label">说明</text><text class="value">{{ item.comment }}</text></view>
		</view>
		<view class="card" v-if="pictures.length">
			<view class="head">凭证</view>
			<image v-for="(pic, index) in pictures" :key="index" class="pic" :src="pic" mode="widthFix" @click="preview(index)"></image>
		</view>
		<view class="actions">
			<view v-if="item.status == 1" class="plain" @click="recept">通过</view>
			<view v-if="item.status == 1" class="plain danger" @click="reject">拒绝</view>
			<view v-if="item.status == 2" class="solid" @click="refund">退款</view>
		</view>
	</view>
</template>

<script>
import { listAftersale, receptAftersale, rejectAftersale, refundAftersale, getCurrentAftersale, setCurrentAftersale } from '@/api/aftersale'
import { aftersaleStatusText, aftersaleTypeText, showError } from '@/util/order'

export default {
	data() {
		return {
			id: null,
			item: null
		}
	},
	computed: {
		pictures() {
			const pics = this.item && this.item.pictures
			return Array.isArray(pics) ? pics : []
		}
	},
	onLoad(options) {
		this.id = Number(options.id)
		this.load()
	},
	methods: {
		statusText: aftersaleStatusText,
		typeText: aftersaleTypeText,
		load() {
			const cached = getCurrentAftersale()
			if (cached && cached.id === this.id) {
				this.item = cached
			}
			listAftersale({ page: 1, limit: 100, sort: 'add_time', order: 'desc' }).then((data) => {
				const rows = (data && data.list) || []
				const found = rows.find((row) => row.id === this.id)
				if (found) {
					this.item = found
					setCurrentAftersale(found)
				} else if (!this.item) {
					uni.showToast({ title: '没有找到这笔售后', icon: 'none' })
				}
			}).catch(showError)
		},
		preview(index) {
			uni.previewImage({ current: this.pictures[index], urls: this.pictures })
		},
		payload() {
			return { id: this.item.id, type: this.item.type }
		},
		recept() {
			this.confirm('审核通过', '确认通过这笔售后？', receptAftersale)
		},
		reject() {
			this.confirm('审核拒绝', '确认拒绝这笔售后？', rejectAftersale)
		},
		refund() {
			this.confirm('售后退款', '退款金额 ' + this.item.amount + ' 元，确认退款？', refundAftersale)
		},
		confirm(title, content, action) {
			uni.showModal({
				title,
				content,
				success: (res) => {
					if (!res.confirm) {
						return
					}
					action(this.payload()).then(() => {
						uni.showToast({ title: '已处理', icon: 'success' })
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
	padding: 12px;
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
	font-weight: bold;
	color: #333;
	margin-bottom: 8px;
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
.warn {
	color: #e12727;
}
.pic {
	width: 100%;
	margin-top: 8px;
	border-radius: 6px;
}
.actions {
	display: flex;
	justify-content: flex-end;
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
.danger {
	color: #e12727;
	border-color: #e12727;
}
.solid {
	color: #fff;
	background: linear-gradient(to right, #4d947a, #2d6d52);
}
</style>
