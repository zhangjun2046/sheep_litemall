<template>
	<view class="root">
		<!-- 筛选项 -->
		<up-row>
			<block v-for="(item, index) in listFilter" :key="index">
				<up-col :span="filterSpan" style="padding-left: 3px; padding-right: 3px">
					<up-text
						:lines="1"
						color="#414141"
						:size="15"
						:lineHeight="70"
						suffixIcon="arrow-down-fill"
						iconStyle="font-size: 8px; color: #c9c9c9; margin-left: 3px"
						align="center"
						:text="item.name"
						@click="clickFilter(item)"
					></up-text>
				</up-col>
			</block>
		</up-row>

		<!-- 弹框 -->
		<u-popup :show="dialogIsShow" :round="16" mode="bottom" @close="filterClose">
			<view class="flex-column">
				<view class="dialog-title">
					{{ dialogTitle }}
				</view>
				<scroll-view :scroll-y="true" style="max-height: 65vh">
					<block v-for="(item, index) in dialogListData" :key="index">
						<up-row @click="filterSelect(item, index)" customStyle="margin: 0px 20px; height: 62px; border-bottom: 1px solid #f2f2f2">
							<up-col span="11">
								<up-text :lines="1" color="#414141" :size="15" :text="item.label"></up-text>
							</up-col>

							<up-col span="1" customStyle="display: flex; flex-direction: row; justify-content: flex-end;">
								<up-image v-if="item.check" src="/static/icon_radio_check.png" width="20px" height="20px"></up-image>
							</up-col>
						</up-row>
					</block>
				</scroll-view>
			</view>
		</u-popup>
	</view>
</template>

<script>
// 接口
import { loadWoFilterData } from '@/api/workbenches.js';
// 工具类
import { isEmpty } from '@/util/utils.js';
import { filterTime } from '@/util/dateTime.js';
export default {
	props: {
		// 显示筛选项的参数
		showFilterData: Object
	},
	data() {
		return {
			// 筛选TAB数据
			listFilter: [],
			filterSpan: 3,
			// 当前点击的筛选TAB数据
			currClickFilter: {},
			// 管理机构数据
			listGroupData: [],
			// 巡检类型数据
			listInspectionData: [],
			// 任务类型数据
			listTaskData: [],
			// 单据时间数据
			listTimeData: [],
			// 弹框-显示、隐藏
			dialogIsShow: false,
			// 弹框-标题
			dialogTitle: '',
			// 弹框-列表数据
			dialogListData: [],
			// 选中的数据
			selectData: {}
		};
	},
	created() {
		// 设置筛选数据
		if (!isEmpty(this.showFilterData)) {
			if (this.showFilterData.group == true) {
				this.listFilter.push({ name: '管理机构', type: 'group' });
			}
			if (this.showFilterData.inspection == true) {
				this.listFilter.push({ name: '巡检类型', type: 'inspection' });
			}
			if (this.showFilterData.task == true) {
				this.listFilter.push({ name: '任务类型', type: 'task' });
			}
			if (this.showFilterData.time == true) {
				this.listFilter.push({ name: '单据时间', type: 'time' });
			}
			this.filterSpan = 12 / this.listFilter.length;
		}
		this.loadFilterData();
	},
	methods: {
		loadFilterData(item) {
			loadWoFilterData()
				.then((data) => {
					// 设置管理机构数据
					this.listGroupData = [];
					const group = data.institutionList;
					this.listGroupData.push(this.addDefaultAllData());
					if (!isEmpty(group)) {
						group.forEach((item) => {
							this.listGroupData.push(this.addGroupItemData(item));
						});
					}
					// 设置巡检类型数据
					this.listInspectionData = [];
					const inspection = data.skillList;
					this.listInspectionData.push(this.addDefaultAllData());
					if (!isEmpty(inspection)) {
						inspection.forEach((item) => {
							this.listInspectionData.push(this.addInspectionTaskItemData(item));
						});
					}
					// 设置任务类型数据
					this.listTaskData = [];
					const task = data.taskTypeList;
					this.listTaskData.push(this.addDefaultAllData());
					if (!isEmpty(task)) {
						task.forEach((item) => {
							this.listTaskData.push(this.addInspectionTaskItemData(item));
						});
					}
					// 设置单据时间数据
					this.listTimeData = this.getTimeFilterList();
					this.listTimeData.unshift(this.addDefaultAllData());
				})
				.catch((error) => {});
		},
		// 点击-筛选项
		clickFilter(item) {
			this.dialogListData = [];
			this.currClickFilter = item;
			this.dialogIsShow = true;
			if (item.type == 'group') {
				this.dialogTitle = '请选择管理机构';
				this.dialogListData = this.listGroupData;
				return;
			}
			if (item.type == 'inspection') {
				this.dialogTitle = '请选择巡检类型';
				this.dialogListData = this.listInspectionData;
				return;
			}
			if (item.type == 'task') {
				this.dialogTitle = '请选择任务类型';
				this.dialogListData = this.listTaskData;
				return;
			}
			if (item.type == 'time') {
				this.dialogTitle = '请选择单据时间';
				this.dialogListData = this.listTimeData;
				return;
			}
		},
		// 选中的数据
		filterSelect(item, index) {
			if(item.check == true){
				this.filterClose();
				return
			}
			this.$emit('selectData', this.getSelectData(item, index));
			this.filterClose();
		},

		// 关闭选择弹框
		filterClose() {
			this.dialogIsShow = false;
		},

		// 获取选中的筛选数据
		getSelectData(item) {
			const type = this.currClickFilter.type;
			const value = item.value;
			if (type == 'group') {
				this.selectData.institutionId = value;
				this.setCheckStatus(this.listGroupData, value);
				return this.selectData;
			}
			if (type == 'inspection') {
				this.selectData.itemValue = value;
				this.setCheckStatus(this.listInspectionData, value);
				return this.selectData;
			}
			if (type == 'task') {
				this.selectData.woUnfinishedStatus = value;
				this.setCheckStatus(this.listTaskData, value);
				return this.selectData;
			}
			if (type == 'time') {
				this.setCheckStatus(this.listTimeData, value);
				const startEndDate = filterTime(value);
				this.selectData.startTime = startEndDate[0];
				this.selectData.endTime = startEndDate[1];
				return this.selectData;
			}
			return this.selectData;
		},

		// 管理机构数据-组装成弹框显示的数据
		addGroupItemData(item) {
			return {
				label: item.name,
				value: item.id,
				check: false
			};
		},

		// 巡检类型、任务类型数据-组装成弹框显示的数据
		addInspectionTaskItemData(item) {
			return {
				label: item.dictValue,
				value: item.dictKey,
				check: false
			};
		},

		// 添加默认全部
		addDefaultAllData() {
			return {
				value: '',
				label: '全部',
				check: true
			};
		},

		// 设置选中、未选中状态
		setCheckStatus(list, value) {
			if (isEmpty(list)) {
				return;
			}
			list.forEach((item) => {
				if (item.value == value && item.check == false) {
					item.check = true;
				} else {
					item.check = false;
				}
			});
		},
		
		// 获取时间筛选的列表数据
		getTimeFilterList(){
				return [
				{
					value: '1',
					label: '本月',
					check: false
				},
				{
					value: '2',
					label: '昨天',
					check: false
				},
				{
					value: '3',
					label: '今天',
					check: false
				},
				{
					value: '4',
					label: '本年',
					check: false
				},
				{
					value: '5',
					label: '全年',
					check: false
				}
			]
		}
	}
};
</script>

<style scoped>
.root{
	background: #fff;
	/* justify-content: flex-end;
	align-self: flex-end; */
}

.dialog-title {
	width: calc(100% - 40px);
	height: 62px;
	line-height: 62px;
	border-bottom: 1px solid #f2f2f2;
	color: #414141;
	font-size: 16px;
	text-align: center;
	margin: 0px 20px;
}
</style>
