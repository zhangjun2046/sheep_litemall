// 用户token
const K_TOKEN = 'token'
// 用户token类型
const K_TOKEN_TYPE = 'tokenType'
// 用户ID
const K_USER_ID = 'userId'
// 用户名称
const K_USER_NAME = 'userName'
// 用户手机号
const K_MOBILE = 'mobile'
// 刷新token
const K_REFRESH_TOKEN = 'refreshToken'


// 用户id
export function setUserId(val){
	uni.setStorageSync(K_USER_ID, val)
}

export function getUserId(){
	return uni.getStorageSync(K_USER_ID)
}

// token
export function setToken(val){
	uni.setStorageSync(K_TOKEN, val)
}

export function getToken(){
	return uni.getStorageSync(K_TOKEN)
}

export function removeToken(){
	if(uni.getStorageSync(K_TOKEN)) {
		uni.removeStorageSync(K_TOKEN)
	}
}

// token类型
export function setTokenType(val){
	uni.setStorageSync(K_TOKEN_TYPE, val)
}

export function getTokenType(){
	return uni.getStorageSync(K_TOKEN_TYPE)
}

// 手机号
export function setMobile(val){
	uni.setStorageSync(K_MOBILE, val)
}

export function getMobile(){
	return uni.getStorageSync(K_MOBILE)
}

export function removeMobile(){
	if(uni.getStorageSync(K_MOBILE)) {
		uni.removeStorageSync(K_MOBILE)
	}
}

// 刷新token
export function setRefreshToken(val){
	uni.setStorageSync(K_REFRESH_TOKEN, val)
}

export function getRefreshToken(){
	return uni.getStorageSync(K_REFRESH_TOKEN)
}

// 用户名称
export function setUserName(val){
	uni.setStorageSync(K_USER_NAME, val)
}

export function getUserName(){
	return uni.getStorageSync(K_USER_NAME)
}

// 清理本地数据缓存
export function clearStorageSync(){
	uni.clearStorageSync()
}