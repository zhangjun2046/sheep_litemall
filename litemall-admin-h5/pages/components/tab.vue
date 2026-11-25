<template>
	<view class="root">
		<u-tabs
			:list="tabData"
			lineWidth="24"
			lineColor="#2C81FF"
			@click="clickTab"
			:activeStyle="{
				color: '#414141',
				fontWeight: 'bold',
				fontSize: '17px'
			}"
			:inactiveStyle="{
				color: '#B9B9B9',
				fontSize: '15px'
			}"
			:itemStyle="{
				height: '70px',
				minWidth: '70px'
			}"
		></u-tabs>
	</view>
</template>

<script>
export default {
	props: {
		// 接收外部传递的参数
		tabData: Array
	},
	methods: {
		// 点击-TAB
		clickTab(item) {
			this.$emit('clickTab', item);
		},
	}
};
</script>

<style scoped>
.root{
	background: #fff;
}
</style>
