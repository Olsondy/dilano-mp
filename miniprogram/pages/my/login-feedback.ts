export interface LoginErrorLike {
  code?: number;
  message?: string;
  msg?: string;
}

export interface LoginErrorPresenter {
  confirmTitle: string;
  fallbackMessage: string;
  showConfirm(message: string, title: string): void;
  showToast(message: string): void;
}

export function getLoginErrorMessage(
  error: LoginErrorLike | null | undefined,
  fallbackMessage: string,
): string {
  if (error?.message) {
    return error.message;
  }

  if (error?.msg) {
    return error.msg;
  }

  return fallbackMessage;
}

export function presentLoginError(
  error: LoginErrorLike | null | undefined,
  presenter: LoginErrorPresenter,
) {
  const message = getLoginErrorMessage(error, presenter.fallbackMessage);

  if (error?.code === 41010) {
    presenter.showConfirm(message, presenter.confirmTitle);
    return;
  }

  presenter.showToast(message);
}
