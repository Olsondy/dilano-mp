import assert from 'node:assert/strict';
import test from 'node:test';

function mockWx({
  token,
  currentRoute = 'pages/index/index',
  requestImpl,
} = {}) {
  const storage = {};
  if (token) {
    storage.access_token = token;
  }

  const requests = [];
  const switchTabs = [];
  const toasts = [];

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
      requests.push(options);
      if (requestImpl) {
        requestImpl(options);
        return;
      }

      throw new Error(`Unexpected request: ${options.url}`);
    },
    switchTab(options) {
      switchTabs.push(options);
    },
    showToast(options) {
      toasts.push(options);
    },
  };

  globalThis.getCurrentPages = () => [
    {
      route: currentRoute,
      onShow() {},
    },
  ];

  return {
    requests,
    storage,
    switchTabs,
    toasts,
  };
}

test('protected requests short-circuit locally when there is no token', async () => {
  const { requests, storage, switchTabs, toasts } = mockWx();
  const { request } = await import('../miniprogram/utils/request.ts');

  await assert.rejects(
    request({
      url: '/app/parties/customer-projects',
      method: 'GET',
      requiresAuth: true,
    }),
    (error) => {
      assert.equal(error.code, 401);
      assert.equal(error.message, 'Unauthorized');
      return true;
    },
  );

  assert.equal(requests.length, 0);
  assert.equal(storage.auth_redirect, true);
  assert.deepEqual(switchTabs, [{ url: '/pages/my/mine' }]);
  assert.deepEqual(toasts, []);
});

test('business errors can skip the default toast when the caller handles the UX', async () => {
  const { toasts } = mockWx({
    requestImpl(options) {
      options.success({
        statusCode: 200,
        data: {
          code: 41010,
          msg: '授权手机号与账号绑定手机号不一致，请使用绑定号码授权或联系客服',
          data: null,
        },
      });
    },
  });
  const { request } = await import('../miniprogram/utils/request.ts');

  await assert.rejects(
    request({
      url: '/app/v1/auth/one-click-login',
      method: 'POST',
      showBusinessErrorToast: false,
    }),
    (error) => {
      assert.equal(error.code, 41010);
      assert.equal(
        error.msg,
        '授权手机号与账号绑定手机号不一致，请使用绑定号码授权或联系客服',
      );
      return true;
    },
  );

  assert.deepEqual(toasts, []);
});
