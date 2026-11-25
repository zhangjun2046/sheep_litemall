import dayjs from 'dayjs';

/**
 * 获取当前年
 */
export function getCurrY(){
	return dayjs().format('YYYY')
}

/**
 * 获取当前年月
 */
export function getCurrYM(){
	return dayjs().format('YYYY-MM')
}

/**
 * 获取当前年月日
 */
export function getCurrYMD(){
	return dayjs().format('YYYY-MM-DD')
}

/**
 * 获取当前年月日 时分秒
 */
export function getCurrYMDHMS(){
	return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 获取当前月的天数
 */
export function getCurrMonthDay(){
	return dayjs().daysInMonth();
}

/**
 * 获取昨天
 */
export function getYesterday(){
	return dayjs().subtract(1, 'day').format('YYYY-MM-DD');
}

/**
 * 获取当前年的第一天日期
 */
export function getStartOfYmd(){
	return dayjs().startOf('year').format('YYYY-MM-DD');
}

/**
 * 获取当前年的最后一天日期
 */
export function getEndOfYmd(){
	return dayjs().endOf('year').format('YYYY-MM-DD');
}

/**
 * 获取当前月的第一天日期
 */
export function getCurrMonthFirst(){
	return dayjs().startOf('month').format('YYYY-MM-DD');
}

/**
 * 获取当前月的最后一天日期
 */
export function getCurrMonthLast(){
	return dayjs().endOf('month').format('YYYY-MM-DD');
}

/**
 * 时间戳转年月日 时分秒
 * @param {Object} timestamp 时间戳
 */
export function timestampToDate(timestamp) {
   return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 工单-单据时间筛选，获取开始、结束时间
 * @param {Object} value
 */
export function filterTime(value){
	// 本月
	if (value == '1') {
		return [getCurrMonthFirst(), getCurrMonthLast()];
	}
	// 昨天
	if (value == '2') {
		const yesterday = getYesterday();
		return [yesterday, yesterday];
	}
	// 今天
	if (value == '3') {
		const ymd = getCurrYMD();
		return [ymd, ymd];
	}
	// 本年
	if (value == '4') {
		return [getStartOfYmd(), getCurrYMD()]
	}
	// 全年
	if (value == '5') {
		return [getStartOfYmd(), getEndOfYmd()];
	}
	return ['', ''];
}