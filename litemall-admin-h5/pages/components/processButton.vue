<template>
	<view v-if="buttons.length > 0" class="root">
		<up-row customStyle="padding: 17px;">
			<up-col v-for="(item, index) in buttons" :key="index" :span="spanCount" customStyle="padding: 0px 5px">
				<!-- 不处理 -->
				<up-button @click="clickButton(item)" v-if="item.buttonKey == 'not'" :custom-style="plainStyle" :text="item.name"></up-button>

				<!-- 退回 -->
				<up-button @click="clickButton(item)" v-if="item.buttonKey == 'wf_reject'" :custom-style="plainStyle" :text="item.name"></up-button>

				<!-- 派单 -->
				<up-button @click="clickButton(item)" v-if="item.buttonKey == 'wf_send'" :custom-style="noPlainStyle" :text="item.name"></up-button>

				<!-- 接单 -->
				<up-button @click="clickButton(item)" v-if="item.buttonKey == 'wf_receive'" :custom-style="noPlainStyle" :text="item.name"></up-button>

				<!-- 到达 -->
				<up-button @click="clickButton(item)" v-if="item.buttonKey == 'wf_arrive'" :custom-style="noPlainStyle" :text="item.name"></up-button>

				<!-- 开始巡检 -->
				<up-button @click="clickButton(item)" v-if="item.buttonKey == 'wf_start'" :custom-style="noPlainStyle" :text="item.name"></up-button>

				<!-- 扫一扫 -->
				<up-button @click="clickButton(item)" v-if="item.buttonKey == 'wf_scan'" icon="scan" iconColor="#ffffff" :custom-style="noPlainStyle" :text="item.name"></up-button>
			</up-col>
		</up-row>
		<u-safe-bottom></u-safe-bottom>
	</view>
</template>

<script>
export default {
	props: {
		// 接收外部传递的参数
		buttons: {
			type: Array,
			default: []
		}
	},
	data() {
		return {
			spanCount: 6,
			noPlainStyle: {
				color: 'white',
				background: '#448AFF',
				borderRadius: '10px',
				height: '42px'
			},
			plainStyle: {
				color: '#448AFF',
				background: '#ffffff',
				borderRadius: '10px',
				borderColor: '#448AFF',
				height: '42px'
			}
		};
	},
	created() {
		console.log('this.buttons.length = ' + this.buttons.length);
		if (this.buttons.length > 0) {
			this.spanCount = 12 / this.buttons.length;
		}
	},
	methods: {
		// 点击-TAB
		clickButton(item) {
			this.$emit('clickButton', item);
		}
	}
};
</script>

<style scoped>
	.root{
		background-color: #fff;
	}
</style>
