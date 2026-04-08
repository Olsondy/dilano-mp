import { sendHeartbeat } from '../api/heartbeat';
import { AuthService } from './auth';

const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5分钟
let timer: number | null = null;
let lastTime = 0;

const beat = async () => {
  // 只有登录状态下才发送心跳
  const token = AuthService.getToken();
  if (!token) return;

  try {
    lastTime = Date.now();
    await sendHeartbeat(lastTime);
    console.log('[Heartbeat] sent success');
  } catch (error) {
    // 心跳失败通常不需要弹窗打扰用户，静默失败即可
    console.error('[Heartbeat] failed', error);
  }
};

export const HeartbeatService = {
  /**
   * 启动心跳
   * 在 App.onShow 中调用
   */
  start() {
    HeartbeatService.stop(); // 防止重复启动

    // 1. 检查是否需要立即发送 (比如刚从后台回来，且距离上次很久了)
    const now = Date.now();
    if (now - lastTime > HEARTBEAT_INTERVAL) {
      beat();
    }

    // 2. 启动定时器
    timer = setInterval(() => {
      beat();
    }, HEARTBEAT_INTERVAL);
  },

  /**
   * 停止心跳
   * 在 App.onHide 中调用
   */
  stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  },
};
