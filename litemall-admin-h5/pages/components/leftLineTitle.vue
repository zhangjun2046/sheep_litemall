<template>
	<view class="line-root">
		<view class="line"></view>
		<up-text color="#333333" :size="16" :text="title"></up-text>
	</view>
</template>

<script>
export default {
	props: {
		// 接收外部传递的参数
		title: String
	}
};
</script>

<style scoped>
.line-root {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.line {
	width: 3px;
	height: 12px;
	background-color: #3688ff;
	margin-right: 5px;
}
</style>
