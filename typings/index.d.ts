/// <reference path="./types/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
  }
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
}

// 扩展隐私协议接口定义
declare namespace WechatMiniprogram {
    interface Wx {
        /**
         * 打开隐私协议页面
         * https://developers.weixin.qq.com/miniprogram/dev/api/open-api/privacy/wx.openPrivacyContract.html
         */
        openPrivacyContract(option?: OpenPrivacyContractOption): void;
    }

    interface OpenPrivacyContractOption {
        /** 接口调用结束的回调函数（调用成功、失败都会执行） */
        complete?: (res: GeneralCallbackResult) => void;
        /** 接口调用失败的回调函数 */
        fail?: (res: GeneralCallbackResult) => void;
        /** 接口调用成功的回调函数 */
        success?: (res: GeneralCallbackResult) => void;
    }
}