import { config } from './config';
import { request } from './request';

const TOKEN_KEY = 'access_token';

export interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  phone: string;
  [key: string]: any;
}

export type SilentLoginStatus =
  | 'SUCCESS'
  | 'NEED_ONE_CLICK_LOGIN'
  | 'CONTACT_SERVICE';

export interface SilentLoginResult {
  status: SilentLoginStatus;
  businessBound?: boolean;
  access_token?: string;
  expire_in?: number;
}

export const AuthService = {
  getToken(): string {
    return wx.getStorageSync(TOKEN_KEY);
  },

  setToken(token: string) {
    wx.setStorageSync(TOKEN_KEY, token);
  },

  removeToken() {
    wx.removeStorageSync(TOKEN_KEY);
  },

  getLoginCode(): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code);
          } else {
            reject(new Error(`wx.login failed: ${res.errMsg}`));
          }
        },
        fail: reject,
      });
    });
  },

  async silentLogin(): Promise<SilentLoginResult> {
    const loginCode = await AuthService.getLoginCode();
    const res: any = await request({
      url: '/app/v1/auth/silent-login',
      method: 'POST',
      data: {
        loginCode,
        clientId: config.clientId,
        grantType: config.grantType,
      },
    });

    const result = res?.data as SilentLoginResult;
    if (!result || !result.status) {
      throw new Error('Silent login failed: Invalid response structure');
    }

    if (result.status === 'SUCCESS') {
      if (!result.access_token) {
        throw new Error('Silent login failed: Missing access token');
      }
      AuthService.setToken(result.access_token);
      return result;
    }

    // Explicitly clear stale token if silent login did not pass.
    AuthService.removeToken();
    return result;
  },

  async bootstrapSession(): Promise<SilentLoginResult | null> {
    try {
      return await AuthService.silentLogin();
    } catch (error) {
      console.error('AuthService silent login error:', error);
      return null;
    }
  },

  async login(phoneCode: string): Promise<any> {
    try {
      const loginCode = await AuthService.getLoginCode();
      const res: any = await request({
        url: '/app/v1/auth/one-click-login',
        method: 'POST',
        data: {
          loginCode,
          phoneCode,
          clientId: config.clientId,
          grantType: config.grantType,
        },
      });

      // 适配后端返回结构: { code: 200, data: { access_token: "..." } }
      if (res?.data?.access_token) {
        AuthService.setToken(res.data.access_token);
        return res;
      } else {
        throw new Error('Login failed: Invalid response structure');
      }
    } catch (error) {
      console.error('AuthService login error:', error);
      throw error;
    }
  },

  async getUserInfo(): Promise<UserInfo> {
    const res: any = await request({
      url: '/app/v1/user',
      method: 'POST',
    });
    return res.data || res;
  },

  async getReferralInfo(): Promise<any> {
    const res: any = await request({
      url: '/app/parties/referral-info',
      method: 'GET',
    });
    return res.data || res;
  },

  async checkSession(): Promise<boolean> {
    try {
      await AuthService.getUserInfo();
      return true;
    } catch (_e) {
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      await request({
        url: '/app/v1/auth/logout',
        method: 'POST',
      });
    } catch (e) {
      console.error('Logout API failed:', e);
    } finally {
      AuthService.removeToken();
    }
  },

  async deleteAccount(): Promise<any> {
    try {
      const res = await request({
        url: '/app/v1/user/cancellation',
        method: 'POST',
      });
      return res;
    } finally {
      AuthService.removeToken();
    }
  },
};
