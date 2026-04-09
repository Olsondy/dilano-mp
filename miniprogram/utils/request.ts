import { AUTH_ONE_CLICK_LOGIN_URL, AUTH_SILENT_LOGIN_URL } from '../api/routes';
import { getAuthBootstrapPromise, getToken, removeToken } from './auth-state';
import { config } from './config';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
  requiresAuth?: boolean;
  showBusinessErrorToast?: boolean;
}

const PUBLIC_AUTH_URLS = new Set([
  AUTH_SILENT_LOGIN_URL,
  AUTH_ONE_CLICK_LOGIN_URL,
]);

function redirectToLogin() {
  removeToken();

  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const route = currentPage ? currentPage.route : '';

  wx.setStorageSync('auth_redirect', true);

  if (route !== 'pages/my/mine') {
    wx.switchTab({
      url: '/pages/my/mine',
    });
    return;
  }

  const page = getCurrentPages().pop();
  if (page?.onShow) {
    page.onShow();
  }
}

export const request = async <T>(options: RequestOptions): Promise<T> => {
  const authBootstrapPromise = getAuthBootstrapPromise();
  if (authBootstrapPromise && options.url !== AUTH_SILENT_LOGIN_URL) {
    await authBootstrapPromise;
  }

  const requiresAuth =
    options.requiresAuth ?? !PUBLIC_AUTH_URLS.has(options.url);
  const token = getToken();
  if (requiresAuth && !token) {
    redirectToLogin();
    throw { code: 401, message: 'Unauthorized' };
  }

  const header: Record<string, any> = {
    'Content-Type': 'application/json',
    ...options.header,
  };

  if (token) {
    header.Authorization = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${config.baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res: any) => {
        const isHttp401 = res.statusCode === 401;
        const code = res.data ? res.data.code : 0;
        const isBusiness401 = code === 401;
        const isUserNotExist = code === 90400 || code === 90500; // Handle specific user errors as auth errors
        const isUserDisabled = code === 90600; // Account explicitly deleted/forbidden

        if (isUserDisabled) {
          wx.showModal({
            title: '账号状态提示',
            content:
              res.data.msg || '您的账号已注销或禁用，如需恢复请联系客服。',
            showCancel: false,
            confirmText: '确定',
          });
          reject({ code: 90600, message: 'Account Disabled' });
          return;
        }

        if (isHttp401 || isBusiness401 || isUserNotExist) {
          // Token 过期或未登录
          redirectToLogin();

          // Show specific message for user errors if needed, or just standard Unauthorized
          const msg = isUserNotExist
            ? res.data.msg || '请重新登录'
            : 'Unauthorized';
          reject({ code: code || 401, message: msg });
          return;
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Check business code
          const data = res.data as any;
          if (data?.code && data.code !== 200) {
            // Business Error
            if (options.showBusinessErrorToast !== false) {
              wx.showToast({
                title: data.msg || '请求失败',
                icon: 'none',
                duration: 2000,
              });
            }
            reject(data);
          } else {
            // Success
            resolve(res.data);
          }
        } else {
          reject(res.data || { message: 'Network Error' });
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};
