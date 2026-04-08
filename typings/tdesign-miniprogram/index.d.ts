declare module 'tdesign-miniprogram/toast/index' {
  interface ToastOptions {
    context?: any;
    selector?: string;
    message?: string;
    duration?: number;
    icon?: string;
    direction?: string;
    [key: string]: any;
  }

  function Toast(options: ToastOptions): any;
  export default Toast;
}
