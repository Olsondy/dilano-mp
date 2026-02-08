import { request } from './request';
import { AuthService } from './auth';

const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5分钟
const API_URL = '/app/v1/heartbeat'; // 心跳接口地址

export class HeartbeatService {
  private static timer: number | null = null;
  private static lastTime: number = 0;

  /**
   * 启动心跳
   * 在 App.onShow 中调用
   */
  static start() {
    this.stop(); // 防止重复启动

    // 1. 检查是否需要立即发送 (比如刚从后台回来，且距离上次很久了)
    const now = Date.now();
    if (now - this.lastTime > HEARTBEAT_INTERVAL) {
      this.beat();
    }

    // 2. 启动定时器
    this.timer = setInterval(() => {
      this.beat();
    }, HEARTBEAT_INTERVAL);
  }

  /**
   * 停止心跳
   * 在 App.onHide 中调用
   */
  static stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 发送心跳请求
   */
  private static async beat() {
    // 只有登录状态下才发送心跳
    const token = AuthService.getToken();
    if (!token) return;

    try {
      this.lastTime = Date.now();
      await request({
        url: API_URL,
        method: 'GET',
        // 如果需要带参数，可以在这里加
        data: {
          timestamp: this.lastTime
        }
      });
      console.log('[Heartbeat] sent success');
    } catch (error) {
      // 心跳失败通常不需要弹窗打扰用户，静默失败即可
      console.error('[Heartbeat] failed', error);
    }
  }
}
