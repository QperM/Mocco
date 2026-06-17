import { AuthApiError } from '@supabase/supabase-js';

/** 将 Supabase Auth 错误转为用户可读中文 */
export function formatAuthError(error: unknown): string {
  if (error instanceof AuthApiError) {
    const code = error.code ?? '';
    const msg = error.message.toLowerCase();

    if (code === 'over_email_send_rate_limit' || msg.includes('rate limit')) {
      return (
        '注册/验证邮件发送过于频繁（Supabase 免费版约 3 封/小时）。\n\n' +
        '请稍等 1 小时再试，或在 Dashboard 关闭「Confirm email」后重试。'
      );
    }
    if (code === 'user_already_registered' || msg.includes('already registered')) {
      return '该邮箱已注册，请直接登录';
    }
    if (code === 'invalid_credentials' || msg.includes('invalid login')) {
      return '邮箱或密码错误';
    }
    if (code === 'email_not_confirmed') {
      return '邮箱尚未验证，请查收验证邮件或联系管理员关闭邮件验证';
    }
    if (code === 'signup_disabled') {
      return '邮箱注册未开启，请在 Supabase → Authentication → Providers → Email 中启用';
    }

    return error.message;
  }

  if (error instanceof Error) return error.message;
  return '请稍后重试';
}
