<template>
	<view>
		<u-sticky bgColor="#F9F9F9" customNavHeight="0">
			<view class="category">
				<view class="active">订单管理</view>
				<view class="normal" @click="goAftersale">售后管理</view>
				<view class="logout" @click="confirmLogout">退出</view>
			</view>
			<u-tabs
				:list="tabs"
				:current="tabIndex"
				keyName="name"
				lineWidth="40"
				lineColor="#317358"
				:scrollable="false"
				:activeStyle="{ color: '#317358', fontWeight: 'bold', fontSize: '15px' }"
				:inactiveStyle="{ color: '#BFBFBF', fontSize: '15px' }"
				@click="handleTab"
			></u-tabs>
			<view class="flex-row">
				<view class="input-view">
					<u--input
						v-model="orderSn"
						clearable
						shape="circle"
						confirmType="search"
						placeholder="搜索订单号"
						prefixIcon="search"
						fontSize="14px"
						prefixIconStyle="font-size: 20px;color: #BBB"
						:customStyle="{ paddingLeft: '10px', height: '20px', border: '1px solid #E5E6E7' }"
						@confirm="handleSearch"
					></u--input>
				</view>
			</view>
		</u-sticky>

		<view class="page">
			<view class="item" v-for="item in list" :key="item.id">
				<view class="number">订单编号：{{ item.orderSn }}</view>
				<view class="line"></view>
				<view class="flex">
					<view class="title">订单状态：</view>
					<view class="content warn">{{ statusText(item.orderStatus) }}</view>
				</view>
				<view class="flex">
					<view class="title">下单时间：</view>
					<view class="content">{{ timeText(item.addTime) }}</view>
				</view>
				<view class="flex">
					<view class="title">商品：</view>
					<view class="content goods">{{ goodsText(item) }}</view>
				</view>
				<view class="flex">
					<view class="title">实付：</view>
					<view class="content">￥{{ item.actualPrice }}</view>
				</view>
				<view class="flex" v-if="item.message">
					<view class="title">留言：</view>
					<view class="content goods">{{ item.message }}</view>
				</view>
				<view class="flex">
					<view class="title">收货人：</view>
					<view class="content">{{ item.consignee }}</view>
				</view>
				<view class="flex">
					<view class="title">联系方式：</view>
					<view class="content phone" @click.stop="call(item.mobile)">{{ item.mobile }}</view>
				</view>
				<view class="flex address-row">
					<view class="title">收货地址：</view>
					<view class="content address">{{ item.address }}</view>
					<view class="flex-icon" @click.stop="copyAddress(item)">
						<u-icon name="/static/icon_fuzhi_n.png" color="#2D6D52"></u-icon>
					</view>
				</view>
				<view class="flex" v-if="item.shipSn">
					<view class="title">快递单号：</view>
					<view class="content">{{ item.shipSn }}</view>
				</view>
				<view class="line"></view>
				<view class="flex-end">
					<view v-if="item.orderStatus == 201" class="number-btn" @click.stop="openShip(item, false)">填写单号</view>
					<view v-if="canEditSn(item)" class="number-btn" @click.stop="openShip(item, true)">修改单号</view>
					<view v-if="item.orderStatus == 202" class="number-btn" @click.stop="confirmRefund(item)">同意退款</view>
					<view class="detail" @click.stop="openDetail(item)">详情</view>
				</view>
			</view>
			<u-loadmore v-if="!isEmptyData" :status="loadStatus" />
			<u-empty v-if="isEmptyData" mode="data" text="暂无订单" textColor="#BBB" marginTop="80px" textSize="30rpx"></u-empty>
		</view>

		<u-overlay :show="showShip" opacity="0.65">
			<view class="overlay-view">
				<view class="overlay-title">{{ editing ? '修改快递单号' : '填写快递单号' }}</view>
				<view class="hint">快递公司：顺丰</view>
				<view class="input">
					<u--input
						v-model="shipSn"
						clearable
						shape="circle"
						placeholder="请输入快递单号"
						fontSize="14px"
						:customStyle="{ paddingLeft: '10px', lineHeight: '20px', border: 'none' }"
					></u--input>
				</view>
				<view class="flex-end">
					<view class="cancel" @click.stop="showShip = false">取消</view>
					<view class="confirm" @click.stop="submitShip">确定</view>
				</view>
			</view>
		</u-overlay>
		<u-overlay :show="showResult" opacity="0.65">
			<view class="overlay-view" @click.stop>
				<view class="overlay-title">{{ result.editing ? '修改快递单号结果' : '发货结果' }}</view>
				<view class="result-line">{{ resultLines.mall }}</view>
				<view class="result-line">{{ resultLines.wx }}</view>
				<view class="flex-end">
					<view class="confirm" @click.stop="closeResult">我知道了</view>
				</view>
			</view>
		</u-overlay>
	</view>
</template>

<script>
import { listOrder, shipOrder, updateShipSn, refundOrder } from '@/api/order'
import { canEditShipSn, formatTime, orderStatusText, setCurrentOrderId, shipResultLines, showError } from '@/util/order'
import { confirmLogout } from '@/util/logout'

export default {
	data() {
		return {
			tabs: [
				{ name: '全部', code: '' },
				{ name: '待发货', code: 201 },
				{ name: '申请退款', code: 202 },
				{ name: '已发货', code: 301 }
			],
			tabIndex: 0,
			status: '',
			orderSn: '',
			page: 1,
			list: [],
			loadStatus: 'loadmore',
			isEmptyData: false,
			showShip: false,
			editing: false,
			shipSn: '',
			current: null,
			showResult: false,
			result: {
				editing: false,
				orderSn: '',
				mallOk: false,
				mallReason: '',
				wxExecuted: false,
				wxOk: false,
				wxMessage: ''
			}
		}
	},
	computed: {
		resultLines() {
			return shipResultLines(this.result)
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
		statusText: orderStatusText,
		timeText: formatTime,
		goAftersale() {
			uni.redirectTo({ url: '/pages/aftersale/index' })
		},
		confirmLogout,
		handleTab(item) {
			this.tabIndex = this.tabs.findIndex((tab) => tab.code === item.code)
			this.status = item.code
			this.reload()
		},
		handleSearch() {
			this.tabIndex = 0
			this.status = ''
			this.reload()
		},
		reload() {
			this.page = 1
			this.list = []
			this.isEmptyData = false
			this.fetchList()
		},
		fetchList() {
			this.loadStatus = 'loading'
			const params = {
				page: this.page,
				limit: 10,
				sort: 'add_time',
				order: 'desc',
				orderSn: this.orderSn
			}
			if (this.status !== '') {
				params.orderStatusArray = [this.status]
			}
			listOrder(params).then((data) => {
				uni.stopPullDownRefresh()
				const rows = (data && data.list) || []
				this.list = this.page === 1 ? rows : this.list.concat(rows)
				const total = data ? data.total : 0
				this.loadStatus = this.list.length >= total ? 'nomore' : 'loadmore'
				this.isEmptyData = this.list.length === 0
			}).catch((error) => {
				uni.stopPullDownRefresh()
				this.isEmptyData = this.list.length === 0
				showError(error)
			})
		},
		goodsText(item) {
			const goods = item.goodsVoList || []
			return goods.map((row) => (row.goodsName || '') + ' x' + row.number).join('、')
		},
		copyAddress(item) {
			const text = [item.consignee, item.mobile, item.address].filter(Boolean).join(' ')
			uni.setClipboardData({
				data: text,
				success() {
					uni.showToast({ title: '复制成功', icon: 'none' })
				}
			})
		},
		call(mobile) {
			if (!mobile) {
				return
			}
			uni.makePhoneCall({ phoneNumber: String(mobile) })
		},
		openDetail(item) {
			setCurrentOrderId(item.id)
			uni.navigateTo({ url: '/pages/order/detail' })
		},
		canEditSn: canEditShipSn,
		openShip(item, editing) {
			this.current = item
			this.editing = editing
			this.shipSn = editing ? (item.shipSn || '') : ''
			this.showShip = true
		},
		submitShip() {
			const shipSn = (this.shipSn || '').trim()
			if (!shipSn) {
				uni.showToast({ title: '请填写快递单号', icon: 'none' })
				return
			}
			const run = () => {
				const editing = this.editing
				const orderSn = this.current.orderSn
				const request = editing
					? updateShipSn({ orderId: this.current.id, shipSn })
					: shipOrder({ orderId: this.current.id, shipSn, shipChannel: 'SF' })
				request.then((data) => {
					this.showShip = false
					this.openResult(editing, orderSn, true, '', data)
					this.reload()
				}).catch((err) => {
					this.openResult(editing, orderSn, false, (err && err.errmsg) || '请求失败', null)
				})
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
		openResult(editing, orderSn, mallOk, mallReason, data) {
			const wxSync = data && data.wxSync
			this.result = {
				editing,
				orderSn: (data && data.orderSn) || orderSn,
				mallOk,
				mallReason,
				wxExecuted: mallOk,
				wxOk: !!(wxSync && wxSync.success),
				wxMessage: (wxSync && wxSync.message) || ''
			}
			this.showResult = true
		},
		closeResult() {
			this.showResult = false
		},
		confirmRefund(item) {
			uni.showModal({
				title: '同意退款',
				content: '退款金额 ' + item.actualPrice + ' 元，确认退款？',
				success: (res) => {
					if (!res.confirm) {
						return
					}
					refundOrder({
						orderId: item.id,
						refundMoney: String(item.actualPrice)
					}).then(() => {
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
.flex-row {
	display: flex;
	padding: 10px 15px 15px 15px;
	.input-view {
		width: 100%;
	}
}
.item {
	margin-top: 10px;
	width: calc(100% - 16px);
	background: #ffffff;
	border-radius: 10px;
	display: flex;
	flex-direction: column;
	padding: 0 18px 14px 18px;
	box-sizing: border-box;
	.number {
		color: #333333;
		font-size: 14px;
		line-height: 50px;
	}
	.line {
		background-color: #f9f9f9;
		height: 2rpx;
	}
	.flex {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-start;
		line-height: 32px;
		.title {
			color: #878787;
			font-size: 14px;
			min-width: 76px;
		}
		.content {
			color: #333333;
			font-size: 14px;
			text-align: right;
			flex: 1;
		}
		.warn {
			color: #e12727;
		}
		.goods,
		.address {
			line-height: 22px;
			padding-top: 6px;
		}
		.phone {
			color: #317358;
		}
	}
	.address-row {
		margin-top: 6px;
	}
	.flex-icon {
		margin-left: 8px;
		padding-top: 6px;
	}
}
.flex-end {
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	margin-top: 10px;
	.number-btn {
		color: #33755b;
		font-size: 15px;
		border: 1px solid #33755b;
		line-height: 40px;
		border-radius: 20px;
		min-width: 90px;
		padding: 0 12px;
		text-align: center;
	}
	.detail {
		margin-left: 10px;
		width: 90px;
		text-align: center;
		background: linear-gradient(to right, #4d947a, #2d6d52);
		color: #fff;
		font-size: 15px;
		line-height: 40px;
		border-radius: 20px;
	}
}
.overlay-view {
	display: flex;
	flex-direction: column;
	background-color: white;
	margin: 210px 10% 0 10%;
	border-radius: 10px;
	padding: 20px 18px;
	.overlay-title {
		color: #333333;
		font-size: 17px;
		font-weight: bold;
		margin-left: 17px;
	}
	.hint {
		margin: 12px 17px 0;
		color: #878787;
		font-size: 14px;
	}
	.input {
		margin-top: 15px;
		background-color: #f5f5fa;
		border-radius: 24px;
		padding: 0 10px;
	}
	.flex-end {
		margin-top: 26px;
	}
	.result-line {
		margin: 14px 17px 0;
		color: #333;
		font-size: 15px;
		line-height: 22px;
	}
	.cancel {
		color: #33755b;
		font-size: 15px;
		border: 1px solid #33755b;
		line-height: 40px;
		border-radius: 20px;
		width: 90px;
		text-align: center;
	}
	.confirm {
		margin-left: 10px;
		width: 90px;
		text-align: center;
		background: linear-gradient(to right, #4d947a, #2d6d52);
		color: #fff;
		font-size: 15px;
		line-height: 40px;
		border-radius: 20px;
	}
}
</style>
