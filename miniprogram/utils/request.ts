import { config } from './config';

const TOKEN_KEY = 'access_token';

interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: any;
  header?: any;
}

export const request = <T>(options: RequestOptions): Promise<T> => {
  const token = wx.getStorageSync(TOKEN_KEY);
  
  const header = {
    'Content-Type': 'application/json',
    ...options.header,
  };

  if (token) {
    header['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${config.baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header,
      success: (res: any) => {
        const isHttp401 = res.statusCode === 401;
        const isBusiness401 = res.data && res.data.code === 401;

        if (isHttp401 || isBusiness401) {
          // Token 过期或未登录
          wx.removeStorageSync(TOKEN_KEY);
          
          // 获取当前页面栈
          const pages = getCurrentPages();
          const currentPage = pages[pages.length - 1];
          const route = currentPage ? currentPage.route : '';

          // 标记需要弹窗
          wx.setStorageSync('auth_redirect', true);

          // 避免在已经是 mine 页面时重复跳转
          if (route !== 'pages/my/mine') {
             wx.switchTab({
                url: '/pages/my/mine'
             });
          } else {
             // 如果已经在 mine 页面，手动刷新一下状态或调用显示方法
             const page = getCurrentPages().pop();
             if (page) page.onShow();
          }
          reject({ code: 401, message: 'Unauthorized' });
          return;
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data || { message: 'Network Error' });
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};
