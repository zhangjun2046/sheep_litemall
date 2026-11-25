<template>
	<view>
		<!-- 加载中 -->
		<u-loading-icon v-if="loadingStatus == 'loading'" :size="35" textColor="#414141" text="正在加载中..." :vertical="true" customStyle="margin-top: 210px"></u-loading-icon>

		<!-- 空页面 -->
		<u-empty
			v-if="loadingStatus == 'empty'"
			mode="data"
			textColor="#414141"
			icon="/static/icon_empty_data.png"
			text="暂无内容"
			:width="143"
			:height="115"
			:textSize="16"
			:marginTop="150"
		></u-empty>

		<!-- 加载更多 -->
		<u-loadmore v-if="loadingStatus == '' && listData.length > 0" :status="moreStatus" :marginBottom="20" />
		<u-safe-bottom v-if="loadingStatus == '' && listData.length > 0"></u-safe-bottom>
	</view>
</template>

<script>
export default {
	props: {
		// 加载中、空页面的状态 loading：加载中，空页面：empty
		loadingStatus: String,
		// 列表加载更多状态 loading：加载中 nomore：没有数据了 loadmore：默认状态
		moreStatus: String,
		// 列表的数组
		listData: {
			type: Array,
			default: []
		}
	}
};
</script>

<style scoped></style>
