// app.ts
import { AuthService } from './utils/auth';
import { HeartbeatService } from './utils/heartbeat';

App<IAppOption>({
  globalData: {},
  onLaunch() {
    this.checkUpdate();
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // Check session on launch
    // If 401, the request interceptor will handle the redirection to mine page
    AuthService.getUserInfo().catch(err => {
      console.log('Session check failed or user not logged in:', err);
    });
  },

  /**
   * 自动更新检测
   */
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          console.log('>>> New version detected');
        }
      });

      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate();
            }
          }
        });
      });

      updateManager.onUpdateFailed(() => {
        console.error('>>> New version download failed');
      });
    }
  },

  onShow() {
    HeartbeatService.start();
  },
  onHide() {
    HeartbeatService.stop();
  }
})