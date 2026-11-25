<template>
	<!-- 弹框 -->
	<u-popup :show="isShow" :round="13"  :safeAreaInsetBottom="false" mode="center" @close="filterClose">
		<view class="dialog-root">
			<view @click="filterClose" class="dialog-close">
				<u-icon name="close" color="#B9B9B9" size="14"></u-icon>
			</view>
			<up-text :text="title" color="#333" align="center" :size="17" :bold="true" margin="0px 10px 12px 10px"></up-text>
			<up-text :text="desc" color="#333" align="center" :size="15" margin="0px 10px"></up-text>
			<up-row customStyle="margin: 34px 18px 20px 18px;">
				<up-col span="6" customStyle="padding-right: 4px">
					<up-button @click="clickCancel()" :custom-style="plainStyle" text="取消"></up-button>
				</up-col>
				<up-col span="6" customStyle="padding-left: 4px">
					<up-button @click="clickSure()" :custom-style="noPlainStyle" text="确定"></up-button>
				</up-col>
			</up-row>
		</view>
	</u-popup>
</template>

<script>
export default {
	props: {
		// 显示隐藏弹框
		isShow: Boolean,
		// 弹框标题
		title: String,
		// 显示描述
		desc: String
	},
	data() {
		return {
			noPlainStyle: {
				color: 'white',
				background: '#448AFF',
				borderRadius: '10px',
				height: '40px',
				width: '115px'
			},
			plainStyle: {
				color: '#333333',
				background: 'white',
				borderRadius: '10px',
				borderColor: '#E3E3E3',
				height: '40px',
				width: '115px'
			}
		};
	},
	methods: {
		// 点击-取消按钮
		clickCancel() {
			this.filterClose();
			this.$emit('clickCancel');
		},

		// 点击-确定按钮
		clickSure() {
			this.filterClose();
			this.$emit('clickSure');
		},

		// 关闭选择弹框
		filterClose() {
			this.$emit('clickClose');
		}
	}
};
</script>

<style scoped>
.dialog-root {
	display: flex;
	flex-direction: column;
	background: linear-gradient(to bottom, #e5f0ff, #f5f6ff);
	border-radius: 13px;
}

.dialog-close {
	display: flex;
	align-self: flex-end;
	padding: 14px;
}
</style>
