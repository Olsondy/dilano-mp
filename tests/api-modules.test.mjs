import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AUTH_LOGOUT_URL,
  AUTH_ONE_CLICK_LOGIN_URL,
  AUTH_SILENT_LOGIN_URL,
  HEARTBEAT_URL,
  PARTIES_CUSTOMER_PROJECTS_URL,
  PARTIES_REFERRAL_INFO_URL,
  USER_CANCELLATION_URL,
  USER_INFO_URL,
} from '../miniprogram/api/routes.ts';

function mockWx() {
  const requests = [];
  const storage = {};

  globalThis.wx = {
    getAccountInfoSync() {
      return {
        miniProgram: {
          envVersion: 'develop',
        },
      };
    },
    getStorageSync(key) {
      return storage[key];
    },
    setStorageSync(key, value) {
      storage[key] = value;
    },
    removeStorageSync(key) {
      delete storage[key];
    },
    request(options) {
      const path = options.url.replace(/^https?:\/\/[^/]+/, '');
      requests.push({
        path,
        method: options.method,
        data: options.data,
      });

      options.success({
        statusCode: 200,
        data: {
          code: 200,
          msg: '操作成功',
          data: { path },
        },
      });
    },
  };

  return { requests };
}

test('auth api module owns auth endpoint requests', async () => {
  const { requests } = mockWx();
  const { silentLogin, oneClickLogin, logout } = await import(
    '../miniprogram/api/auth.ts'
  );

  await silentLogin({
    loginCode: 'login-code',
    clientId: 'client-id',
    grantType: 'phone',
  });
  await oneClickLogin({
    loginCode: 'login-code',
    phoneCode: 'phone-code',
    clientId: 'client-id',
    grantType: 'phone',
  });
  await logout();

  assert.deepEqual(requests, [
    {
      path: AUTH_SILENT_LOGIN_URL,
      method: 'POST',
      data: {
        loginCode: 'login-code',
        clientId: 'client-id',
        grantType: 'phone',
      },
    },
    {
      path: AUTH_ONE_CLICK_LOGIN_URL,
      method: 'POST',
      data: {
        loginCode: 'login-code',
        phoneCode: 'phone-code',
        clientId: 'client-id',
        grantType: 'phone',
      },
    },
    {
      path: AUTH_LOGOUT_URL,
      method: 'POST',
      data: undefined,
    },
  ]);
});

test('user api module owns user endpoint requests', async () => {
  const { requests } = mockWx();
  const { getUserInfo, cancelAccount } = await import(
    '../miniprogram/api/user.ts'
  );

  await getUserInfo();
  await cancelAccount();

  assert.deepEqual(requests, [
    {
      path: USER_INFO_URL,
      method: 'POST',
      data: undefined,
    },
    {
      path: USER_CANCELLATION_URL,
      method: 'POST',
      data: undefined,
    },
  ]);
});

test('parties api module owns party endpoint requests', async () => {
  const { requests } = mockWx();
  const { getCustomerProjects, getReferralInfo } = await import(
    '../miniprogram/api/parties.ts'
  );

  await getCustomerProjects();
  await getReferralInfo();

  assert.deepEqual(requests, [
    {
      path: PARTIES_CUSTOMER_PROJECTS_URL,
      method: 'GET',
      data: undefined,
    },
    {
      path: PARTIES_REFERRAL_INFO_URL,
      method: 'GET',
      data: undefined,
    },
  ]);
});

test('heartbeat api module owns heartbeat endpoint requests', async () => {
  const { requests } = mockWx();
  const { sendHeartbeat } = await import('../miniprogram/api/heartbeat.ts');

  await sendHeartbeat(12345);

  assert.deepEqual(requests, [
    {
      path: HEARTBEAT_URL,
      method: 'GET',
      data: {
        timestamp: 12345,
      },
    },
  ]);
});
