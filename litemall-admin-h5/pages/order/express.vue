<template>
	<view class="page">
		<view class="product">
			<view class="step-view" v-for="(item, index) in list" :key="index">
				<view class="left">
					<view v-if="index == 0" class="high-dot"></view>
					<view v-else class="dot"></view>
					<view v-if="list.length-1 != index" class="line"></view>
				</view>
				<view class="right">
					<view v-if="index == 0" class="high-title">{{item.status}}</view>
					<view v-else class="title">{{item.status}}</view>
					<view class="desc-title">{{item.time}}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list:[]
			}
		},
		onLoad(options) {
			const data = decodeURIComponent(options.data)
			this.list = JSON.parse(options.data)
		},
		methods: {
			
		}
	}
</script>

<style scoped lang="scss">
	.page {
		width: 100vw;
		min-height: 100vh;
		padding-top: 10px;
		font-family: "Heiti SC", "Heiti TC", "黑体", sans-serif;
	}
	.product {
		background-color: white;
		padding: 10px 10px;
		margin: 10px 12px;
		border-radius: 10rpx;
		
		.b-title {
			font-size:15px;
			font-weight: bold;
			color:#333333;
			line-height: 50rpx;
		}
		
		.line {
			background-color: #EEE;
			width: 90%;
			height: 1px;
		}
		
		.item {
			display: flex;
			justify-content: space-between;
			line-height: 30px;
			color: #666;
			padding: 0 10rpx;
			
			.title {
				color: #878787;
				font-size: 14px;
				margin-right: 20rpx;
			}
			.content {
				color: #333333;
				font-size: 14px;
			}
		}
	}
	
	.step-view {
		display: flex;
		flex-direction: row;
		
		.left {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-left: 8px;
			
			.dot {
				width: 10px;
				height: 10px;
				border-radius: 5px;
				background-color: #D8D8D8;
			}
			
			.high-dot {
				width: 10px;
				height: 10px;
				border-radius: 5px;
				background-color: #43896F;
			}
			
			.line {
				width: 1px;
				margin-left: -0.5px;
				background-color: #F1F1F1;
				height: 90%;
			}	
		}
		.right {
			display: flex;
			flex-direction: column;
			margin-left: 14px;
			padding-top: 2px;
			// margin-top: -6px;
			.title {
				color: #333333;
				font-size: 14px;
			}
			.high-title {
				color: #43896F;
				font-size: 14px;
			}
			
			.desc-title {
				margin-top: 5px;
				margin-bottom: 20px;
				color: #878787;
				font-size: 13px;
			}
		}
	}
</style>
