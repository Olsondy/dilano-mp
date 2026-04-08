import assert from 'node:assert/strict';
import test from 'node:test';

function mockWx() {
  const storage = {
    access_token: 'stale-token',
  };
  const requests = [];
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
    login({ success }) {
      success({ code: 'login-code' });
    },
    request(options) {
      const path = options.url.replace(/^https?:\/\/[^/]+/, '');
      requests.push({
        path,
        authorization: options.header?.Authorization,
      });

      if (path === '/app/v1/auth/silent-login') {
        setTimeout(() => {
          options.success({
            statusCode: 200,
            data: {
              code: 200,
              msg: '操作成功',
              data: {
                status: 'SUCCESS',
                businessBound: false,
                access_token: 'fresh-token',
                expire_in: 2592000,
              },
            },
          });
        }, 10);
        return;
      }

      if (path === '/app/parties/customer-projects') {
        if (options.header?.Authorization === 'Bearer fresh-token') {
          options.success({
            statusCode: 200,
            data: {
              code: 200,
              msg: '操作成功',
              data: {
                partyInfo: {},
                projectList: [],
              },
            },
          });
          return;
        }

        options.success({
          statusCode: 200,
          data: {
            code: 500,
            msg: '会话过期, 请重新登录',
            data: null,
          },
        });
        return;
      }

      throw new Error(`Unexpected request: ${options.url}`);
    },
    showToast(options) {
      toasts.push(options);
    },
  };

  return { requests, storage, toasts };
}

test('authenticated requests wait for launch silent login before using the token', async () => {
  const { requests, storage, toasts } = mockWx();
  const { AuthService } = await import('../miniprogram/utils/auth.ts');
  const { request } = await import('../miniprogram/utils/request.ts');

  const bootstrapPromise = AuthService.bootstrapSession();
  const projectsPromise = request({
    url: '/app/parties/customer-projects',
    method: 'GET',
  });

  const projects = await projectsPromise;
  await bootstrapPromise;

  assert.deepEqual(projects, {
    code: 200,
    msg: '操作成功',
    data: {
      partyInfo: {},
      projectList: [],
    },
  });
  assert.equal(storage.access_token, 'fresh-token');
  assert.equal(requests.length, 2);
  assert.deepEqual(
    requests.map((item) => item.path),
    ['/app/v1/auth/silent-login', '/app/parties/customer-projects'],
  );
  assert.equal(requests[1].authorization, 'Bearer fresh-token');
  assert.deepEqual(toasts, []);
});
