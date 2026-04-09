import assert from 'node:assert/strict';
import test from 'node:test';

function mockWx({
  storage = {},
  requestImpl,
} = {}) {
  const requests = [];

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
    login({ success }) {
      success({ code: 'login-code' });
    },
    request(options) {
      const path = options.url.replace(/^https?:\/\/[^/]+/, '');
      requests.push(path);
      if (requestImpl) {
        requestImpl(path, options);
        return;
      }

      throw new Error(`Unexpected request: ${options.url}`);
    },
  };

  globalThis.getCurrentPages = () => [
    {
      route: 'pages/my/mine',
      onShow() {},
    },
  ];

  return { storage, requests };
}

test('logout sets a manual logout marker and clears the token', async () => {
  const { storage } = mockWx({
    storage: {
      access_token: 'existing-token',
    },
    requestImpl(path, options) {
      assert.equal(path, '/app/v1/auth/logout');
      options.success({
        statusCode: 200,
        data: {
          code: 200,
          msg: '操作成功',
          data: null,
        },
      });
    },
  });
  const { AuthService } = await import('../miniprogram/utils/auth.ts');

  await AuthService.logout();

  assert.equal(storage.access_token, undefined);
  assert.equal(storage.manual_logout, true);
});

test('bootstrapSession skips silent login after a manual logout', async () => {
  const { requests, storage } = mockWx({
    storage: {
      manual_logout: true,
    },
  });
  const { AuthService } = await import('../miniprogram/utils/auth.ts');

  const result = await AuthService.bootstrapSession();

  assert.equal(result, null);
  assert.deepEqual(requests, []);
  assert.equal(storage.manual_logout, true);
});

test('successful one-click login clears the manual logout marker', async () => {
  const { storage, requests } = mockWx({
    storage: {
      manual_logout: true,
    },
    requestImpl(path, options) {
      if (path !== '/app/v1/auth/one-click-login') {
        throw new Error(`Unexpected request path: ${path}`);
      }

      options.success({
        statusCode: 200,
        data: {
          code: 200,
          msg: '操作成功',
          data: {
            access_token: 'fresh-token',
          },
        },
      });
    },
  });
  const { AuthService } = await import('../miniprogram/utils/auth.ts');

  await AuthService.login('phone-code');

  assert.deepEqual(requests, ['/app/v1/auth/one-click-login']);
  assert.equal(storage.access_token, 'fresh-token');
  assert.equal(storage.manual_logout, undefined);
});
