/**
 * Open-source safe template configuration.
 *
 * IMPORTANT:
 * - Do not commit real production baseUrl/clientId into public repository.
 * - Replace placeholders locally before real deployment.
 */
const envConfig = {
  // 开发环境 (本地调试示例)
  develop: {
    baseUrl: 'http://127.0.0.1:8081',
    clientId: 'REPLACE_WITH_DEV_CLIENT_ID',
  },
  // 体验环境 (示例占位)
  trial: {
    baseUrl: 'https://example.com/wechat-api',
    clientId: 'REPLACE_WITH_TRIAL_CLIENT_ID',
  },
  // 正式环境 (示例占位)
  release: {
    baseUrl: 'https://example.com/wechat-api',
    clientId: 'REPLACE_WITH_RELEASE_CLIENT_ID',
  },
};

const getEnv = () => {
  try {
    const accountInfo = wx.getAccountInfoSync();
    return accountInfo.miniProgram.envVersion || 'develop';
  } catch (_e) {
    return 'develop';
  }
};

const currentEnv = getEnv() as keyof typeof envConfig;
const activeConfig = envConfig[currentEnv];
const isPlaceholderConfig =
  activeConfig.baseUrl.includes('example.com') ||
  activeConfig.clientId.startsWith('REPLACE_WITH_');

if (isPlaceholderConfig) {
  console.warn(
    `[config] Placeholder config is active for env "${currentEnv}". Update baseUrl/clientId before production use.`,
  );
}

export const config = {
  baseUrl: activeConfig.baseUrl,
  clientId: activeConfig.clientId,
  grantType: 'phone',
};
