/** 事件名称-登录成功 */
export const E_LOGIN_SUCCESS = 'login-success'

/**
 * 发送事件
 * @param {Object} eventName
 * @param {Object} params
 */
export function emit(eventName, params){
	uni.$emit(eventName, params)
}

/**
 * 接收事件
 * @param {Object} eventName
 * @param {Object} callback
 */
export function on(eventName, callback){
	uni.$on(eventName, (data) => {
		callback(data)
	}) 
}