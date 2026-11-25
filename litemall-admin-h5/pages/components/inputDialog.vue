<template>
	<!-- 弹框 -->
	<u-popup :show="isShow" :round="13" :safeAreaInsetBottom="false" mode="center" @close="filterClose" :closeOnClickOverlay="false">
		<view class="dialog-root">
			<!-- 关闭图标 -->
			<view @click="filterClose" class="dialog-close">
				<u-icon name="close" color="#B9B9B9" size="14"></u-icon>
			</view>
			<!-- 标题 -->
			<up-text :text="title" color="#333" :size="17" :bold="true" margin="0px 20px"></up-text>
			<!-- 输入框 -->
			<u--textarea customStyle="margin: 15px 14px;" v-model="inputValue" :placeholder="placeholder" :height="70" ></u--textarea>
			<!-- 操作按钮 -->
			<up-row customStyle="padding: 0px 18px 20px 18px;">
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
import { isEmpty } from '@/util/utils';
export default {
	props: {
		// 显示隐藏弹框
		isShow: Boolean,
		// 弹框标题
		title: String,
		// 输入框为空时的占位符
		placeholder: {
			type: String,
			default: '请输入内容'
		}
	},
	data() {
		return {
			inputValue: '',
			noPlainStyle: {
				color: 'white',
				background: '#448AFF',
				borderRadius: '10px',
				height: '40px',
				width: '120px'
			},
			plainStyle: {
				color: '#333333',
				background: 'white',
				borderRadius: '10px',
				borderColor: '#E3E3E3',
				height: '40px',
				width: '120px'
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
			if(isEmpty(this.inputValue)){
				uni.showToast({
					title: '请输入内容',
					icon: 'none'
				})
				return
			}
			this.filterClose();
			this.$emit('clickSure', this.inputValue);
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
