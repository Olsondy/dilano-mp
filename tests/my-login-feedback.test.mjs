import assert from 'node:assert/strict';
import test from 'node:test';

test('41010 login errors are presented with a blocking confirm modal', async () => {
  const events = [];
  const {
    presentLoginError,
    getLoginErrorMessage,
  } = await import('../miniprogram/pages/my/login-feedback.ts');

  assert.equal(
    getLoginErrorMessage(
      {
        code: 41010,
        msg: '授权手机号与账号绑定手机号不一致，请使用绑定号码授权或联系客服',
      },
      '登录失败',
    ),
    '授权手机号与账号绑定手机号不一致，请使用绑定号码授权或联系客服',
  );

  presentLoginError(
    {
      code: 41010,
      msg: '授权手机号与账号绑定手机号不一致，请使用绑定号码授权或联系客服',
    },
    {
      confirmTitle: '提示',
      fallbackMessage: '登录失败',
      showConfirm(message, title) {
        events.push({ type: 'confirm', message, title });
      },
      showToast(message) {
        events.push({ type: 'toast', message });
      },
    },
  );

  assert.deepEqual(events, [
    {
      type: 'confirm',
      message: '授权手机号与账号绑定手机号不一致，请使用绑定号码授权或联系客服',
      title: '提示',
    },
  ]);
});

test('non-41010 login errors still use toast messaging', async () => {
  const events = [];
  const { presentLoginError } = await import(
    '../miniprogram/pages/my/login-feedback.ts'
  );

  presentLoginError(
    {
      code: 500,
      message: '登录失败，请稍后重试',
    },
    {
      confirmTitle: '提示',
      fallbackMessage: '登录失败',
      showConfirm(message, title) {
        events.push({ type: 'confirm', message, title });
      },
      showToast(message) {
        events.push({ type: 'toast', message });
      },
    },
  );

  assert.deepEqual(events, [
    {
      type: 'toast',
      message: '登录失败，请稍后重试',
    },
  ]);
});
