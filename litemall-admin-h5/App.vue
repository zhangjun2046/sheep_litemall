<script>
import { getToken, getTokenType, getUserId, getUserName, getMobile, getRefreshToken } from '@/util/userInfo';
import { isEmpty } from '@/util/utils';
export default {
	globalData: {
		isLogin: false,
		token: '',
		refreshToken: '',
		tokenType: '',
		userId: '',
		userName: '',
		account: ''
	},
	onLaunch: function () {
		this.globalData.token = getToken();
		this.globalData.refreshToken = getRefreshToken();
		this.globalData.tokenType = getTokenType();
		this.globalData.userId = getUserId();
		this.globalData.userName = getUserName();
		this.globalData.account = getMobile();
		this.globalData.isLogin = !isEmpty(this.globalData.token);
		console.log('App Launch');
		// 禁止横屏
		// #ifdef APP-PLUS
		plus.screen.lockOrientation('portrait-primary');
		// #endif
	},
	onShow: function () {
		console.log('App Show');
	},
	onHide: function () {
		console.log('App Hide');
	}
};
</script>

<style lang="scss">
/* 注意要写在第一行，同时给style标签加入lang="scss"属性 */
@import 'uview-plus/index.scss';
/*每个页面公共css */
.page-root {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: $uni-bg-color;
}

.flex-column {
	display: flex;
	flex-direction: column;
}

.flex-row {
	display: flex;
	flex-direction: row;
}

.flex-row-right {
	display: flex;
	flex-direction: row;
	justify-content: right;
}

.flex-row-between {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
}

.fixed-bottom {
	position: fixed;
	bottom: 0;
	right: 0;
	left: 0;
}

.bottom-button-empty-view {
	height: $uni-bottom-button-root-height;
}
</style>
