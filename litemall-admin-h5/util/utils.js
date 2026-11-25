import md5 from 'js-md5';

/**
 * MD5加密
 * @param {Object} content 需要加密的内容
 */
export function toMd5(content){
	if(isEmpty(content)){
		return content;
	}
	return md5(content);
}

/**
 * 数据判空
 * @param {Object} obj
 */
export function isEmpty(obj) {
	if (obj == '' || obj == "" || null == obj || "null" == obj || undefined == obj || "undefined" == obj) {
		return true;
	}
	if (obj.constructor === Object && Object.keys(obj).length <= 0) {
		return true;
	}
	if (obj.constructor === Array && obj.length <= 0) {
		return true;
	}
	return false;
}

/**
 * 数字转换
 * @param {Object} number
 */
export function numFormat(number){
	const unit = '万'
	if(number >= 10000){
		const val = number / 10000 + ''
		return parseFloat(val).toFixed(1) + unit
	}
	return number
}

/**
 * 对象深拷贝
 */
export const deepClone = data => {
	var type = getObjType(data);
	var obj;
	if (type === 'array') {
		obj = [];
	} else if (type === 'object') {
		obj = {};
	} else {
		//不再具有下一层次
		return data;
	}
	if (type === 'array') {
		for (var i = 0, len = data.length; i < len; i++) {
			obj.push(deepClone(data[i]));
		}
	} else if (type === 'object') {
		for (var key in data) {
			obj[key] = deepClone(data[key]);
		}
	}
	return obj;
};

export const getObjType = obj => {
	var toString = Object.prototype.toString;
	var map = {
		'[object Boolean]': 'boolean',
		'[object Number]': 'number',
		'[object String]': 'string',
		'[object Function]': 'function',
		'[object Array]': 'array',
		'[object Date]': 'date',
		'[object RegExp]': 'regExp',
		'[object Undefined]': 'undefined',
		'[object Null]': 'null',
		'[object Object]': 'object',
	};
	// if (obj instanceof Element) {
	// 	return 'element';
	// }
	return map[toString.call(obj)];
};

/**
 * 扫码-仅支持相机
 */
export function scanCodeInspection(callback){
	uni.scanCode({
		onlyFromCamera: true,
		success: function (res) {
			// 二维码
			if(res.scanType == 'QR_CODE'){
				callback(res.result)
				return
			}
			callback('')
		}
	});
}