/**
 * 环境配置
 */
const envConfig = {
  // 开发环境 (本地)
  develop: {
    baseUrl: 'http://192.168.31.82:8090',
    clientId: '428a8310cd442757ae699df5d894f052'
  },
  // 体验环境 (测试/体验版)
  trial: {
    baseUrl: 'https://dilano.cloud/wechat-api',
    clientId: '428a8310cd442757ae699df5d894f052'
  },
  // 正式环境 (线上发布)
  release: {
    baseUrl: 'https://dilano.cloud/wechat-api',
    clientId: '428a8310cd442757ae699df5d894f052'
  }
};

const getEnv = () => {
  try {
    const accountInfo = wx.getAccountInfoSync();
    return accountInfo.miniProgram.envVersion || 'develop';
  } catch (e) {
    return 'develop';
  }
};

const currentEnv = getEnv() as keyof typeof envConfig;
const activeConfig = envConfig[currentEnv];

export const config = {
  baseUrl: activeConfig.baseUrl,
  clientId: activeConfig.clientId,
  grantType: 'phone'
};
