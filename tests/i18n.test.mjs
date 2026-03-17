import assert from 'node:assert/strict';
import test from 'node:test';

import commonI18n from '../miniprogram/locales/common.ts';
import {
  getCurrentLang,
  getI18nText,
  normalizeLang,
  setCurrentLang,
} from '../miniprogram/utils/i18n.ts';

function mockWx({ storage = {}, systemLanguage = 'en-US' } = {}) {
  const state = { ...storage };
  const writes = [];

  globalThis.wx = {
    getStorageSync(key) {
      return state[key];
    },
    setStorageSync(key, value) {
      state[key] = value;
      writes.push([key, value]);
    },
    getSystemInfoSync() {
      return { language: systemLanguage };
    },
  };

  return { state, writes };
}

test('normalizeLang maps zh variants to zh and defaults others to en', () => {
  assert.equal(normalizeLang('zh-CN'), 'zh');
  assert.equal(normalizeLang('zh'), 'zh');
  assert.equal(normalizeLang('en-US'), 'en');
  assert.equal(normalizeLang(undefined), 'en');
});

test('getCurrentLang returns stored language when present', () => {
  const { writes } = mockWx({ storage: { user_lang: 'zh' }, systemLanguage: 'en-US' });

  assert.equal(getCurrentLang(), 'zh');
  assert.deepEqual(writes, []);
});

test('getCurrentLang detects system language and persists it when storage is empty', () => {
  const { state, writes } = mockWx({ systemLanguage: 'zh-Hans' });

  assert.equal(getCurrentLang(), 'zh');
  assert.equal(state.user_lang, 'zh');
  assert.deepEqual(writes, [['user_lang', 'zh']]);
});

test('setCurrentLang normalizes and persists the selected language', () => {
  const { state, writes } = mockWx();

  assert.equal(setCurrentLang('zh'), 'zh');
  assert.equal(state.user_lang, 'zh');
  assert.deepEqual(writes, [['user_lang', 'zh']]);
});

test('getI18nText merges common and page copy for the target language', () => {
  const text = getI18nText(
    {
      en: {
        pageTitle: 'Account',
        confirmTitle: 'Page Notice',
      },
      zh: {
        pageTitle: '个人中心',
        confirmTitle: '页面提示',
      },
    },
    'en',
  );

  assert.equal(text.pageTitle, 'Account');
  assert.equal(text.guestName, commonI18n.en.guestName);
  assert.equal(text.confirmTitle, 'Page Notice');
});
