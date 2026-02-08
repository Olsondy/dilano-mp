import { request } from './request';
import { config } from './config';

const TOKEN_KEY = 'access_token';

export interface UserInfo {
  id: string;
  nickname: string;
  avatar: string;
  phone: string;
  [key: string]: any;
}

export class AuthService {
  static getToken(): string {
    return wx.getStorageSync(TOKEN_KEY);
  }

  static setToken(token: string) {
    wx.setStorageSync(TOKEN_KEY, token);
  }

  static removeToken() {
    wx.removeStorageSync(TOKEN_KEY);
  }

  static getLoginCode(): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code);
          } else {
            reject(new Error('wx.login failed: ' + res.errMsg));
          }
        },
        fail: reject
      });
    });
  }

  static async login(phoneCode: string): Promise<any> {
    try {
      const loginCode = await this.getLoginCode();
      const res: any = await request({
        url: '/app/v1/auth/wx-login',
        method: 'POST',
        data: {
          loginCode,
          phoneCode,
          clientId: config.clientId,
          grantType: config.grantType
        }
      });

      // 适配后端返回结构: { code: 200, data: { access_token: "..." } }
      if (res && res.data && res.data.access_token) {
        this.setToken(res.data.access_token);
        return res;
      } else {
        throw new Error('Login failed: Invalid response structure');
      }
    } catch (error) {
      console.error('AuthService login error:', error);
      throw error;
    }
  }

  static async getUserInfo(): Promise<UserInfo> {
    const res: any = await request({
      url: '/app/v1/user',
      method: 'POST'
    });
    return res.data || res;
  }

  static async getReferralInfo(): Promise<any> {
    const res: any = await request({
      url: '/app/parties/referral-info',
      method: 'GET'
    });
    return res.data || res;
  }
  
  static async checkSession(): Promise<boolean> {
      try {
          await this.getUserInfo();
          return true;
      } catch (e) {
          return false;
      }
  }

  static async logout(): Promise<void> {
    try {
      await request({
        url: '/app/v1/auth/logout',
        method: 'POST'
      });
    } catch (e) {
      console.error('Logout API failed:', e);
    } finally {
      this.removeToken();
    }
  }
}
