export enum SignUpEmailErrorCode {
  InvalidEmailLink,
  EmailNotFound,
}

export function getSignUpEmailErrorMessage(code: SignUpEmailErrorCode) {
  switch (code) {
    case SignUpEmailErrorCode.InvalidEmailLink:
      return "邮箱绑定链接不正确或已失效";
    case SignUpEmailErrorCode.EmailNotFound:
      return "该邮箱未注册";
  }
}

export enum SignInErrorCode {
  UserNotFound,
  IncorrectPassword,
  UserMissingPassword,
  EmailNotVerified,
}

export function getSignInErrorMessage(code: SignInErrorCode) {
  switch (code) {
    case SignInErrorCode.UserNotFound:
      return "该邮箱未注册";
    case SignInErrorCode.EmailNotVerified:
      return "邮箱未验证";
    case SignInErrorCode.IncorrectPassword:
      return "密码错误";
    case SignInErrorCode.UserMissingPassword:
      return "用户未设置密码";
  }
}