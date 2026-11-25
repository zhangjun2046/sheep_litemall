<template>
	<view v-if="buttons.length > 0" class="root">
		<up-row customStyle="padding: 17px;">
			<up-col v-for="(item, index) in buttons" :key="index" :span="spanCount" style="padding: 0px 5px">
				<!-- 边框样式 -->
				<up-button @click="clickButton(item)" v-if="item.type == 'border'" :custom-style="plainStyle" :text="item.name"></up-button>

				<!-- 背景样式 -->
				<up-button @click="clickButton(item)" v-if="item.type == 'background'" :custom-style="noPlainStyle" :text="item.name"></up-button>
			</up-col>
		</up-row>
		<u-safe-bottom></u-safe-bottom>
	</view>
</template>

<script>
import { isEmpty } from '@/util/utils';
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
			spanCount: 12,
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
		if (isEmpty(this.buttons)) {
			return;
		}
		this.spanCount = 12 / this.buttons.length;
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
		background: #fff;
	}
</style>
