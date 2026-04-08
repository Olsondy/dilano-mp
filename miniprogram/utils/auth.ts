import * as authApi from '../api/auth';
import * as userApi from '../api/user';
import {
  getAuthBootstrapPromise,
  getToken,
  removeToken,
  setAuthBootstrapPromise,
  setToken,
} from './auth-state';
import { config } from './config';

export type SilentLoginResult = authApi.SilentLoginResult;
export type SilentLoginStatus = authApi.SilentLoginStatus;
export type UserInfo = userApi.UserInfo;

export const AuthService = {
  getToken,

  setToken,

  removeToken,

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
    const res = await authApi.silentLogin({
      loginCode,
      clientId: config.clientId,
      grantType: config.grantType,
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
    const currentPromise = getAuthBootstrapPromise();
    if (currentPromise) {
      return currentPromise as Promise<SilentLoginResult | null>;
    }

    const bootstrapPromise = AuthService.silentLogin().catch((error) => {
      console.error('AuthService silent login error:', error);
      return null;
    });
    setAuthBootstrapPromise(bootstrapPromise);
    return bootstrapPromise;
  },

  async login(phoneCode: string): Promise<any> {
    try {
      const loginCode = await AuthService.getLoginCode();
      const res: any = await authApi.oneClickLogin({
        loginCode,
        phoneCode,
        clientId: config.clientId,
        grantType: config.grantType,
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

  async checkSession(): Promise<boolean> {
    try {
      await userApi.getUserInfo();
      return true;
    } catch (_e) {
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch (e) {
      console.error('Logout API failed:', e);
    } finally {
      AuthService.removeToken();
    }
  },

  async deleteAccount(): Promise<any> {
    try {
      const res = await userApi.cancelAccount();
      return res;
    } finally {
      AuthService.removeToken();
    }
  },
};
