/**
 * 将个人中心的switch值保存在本地
 * 
 */
export function setPersonalSwitch(value) {
	const e = value ? value : false  
	uni.setStorageSync('personal-switch', e);
}

export function getPersonalSwitch() {
	return uni.getStorageSync('personal-switch');
}