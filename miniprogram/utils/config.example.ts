/**
 * Open-source safe template configuration.
 *
 * Copy this file to `config.ts` for local development and deployment.
 * Do not commit real production baseUrl/clientId values.
 */
const envConfig = {
  develop: {
    baseUrl: 'http://127.0.0.1:8081',
    clientId: 'REPLACE_WITH_DEV_CLIENT_ID',
  },
  trial: {
    baseUrl: 'https://example.com/wechat-api',
    clientId: 'REPLACE_WITH_TRIAL_CLIENT_ID',
  },
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
