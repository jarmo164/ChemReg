import type { ApiClientError } from '../api/errors';
import { validationErrorsToFieldMap } from '../api/errors';

export type LoginField = 'email' | 'password';
export type RegisterField = 'name' | 'email' | 'password' | 'confirmPassword';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginForm(values: { email: string; password: string }): Partial<Record<LoginField, string>> {
  const errors: Partial<Record<LoginField, string>> = {};

  if (!values.email.trim()) {
    errors.email = 'Email on kohustuslik';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Sisesta korrektne emaili aadress';
  }

  if (!values.password) {
    errors.password = 'Parool on kohustuslik';
  }

  return errors;
}

export function validateRegisterForm(values: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Partial<Record<RegisterField, string>> {
  const errors: Partial<Record<RegisterField, string>> = {};

  if (!values.name.trim()) {
    errors.name = 'Nimi on kohustuslik';
  }

  const loginErrors = validateLoginForm({ email: values.email, password: values.password });
  if (loginErrors.email) {
    errors.email = loginErrors.email;
  }
  if (loginErrors.password) {
    errors.password = loginErrors.password;
  } else if (values.password.length < 8) {
    errors.password = 'Parool peab olema vähemalt 8 tähemärki';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Kinnita parool';
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'Paroolid ei kattu';
  }

  return errors;
}

export function hasFieldErrors<TField extends string>(errors: Partial<Record<TField, string>>): boolean {
  return Object.values(errors).some(Boolean);
}

export function loginServerFieldErrors(error: unknown): Partial<Record<LoginField, string>> {
  return validationErrorsToFieldMap((error as ApiClientError | undefined)?.validationErrors, ['email', 'password']);
}

export function registerServerFieldErrors(error: unknown): Partial<Record<Exclude<RegisterField, 'confirmPassword'>, string>> {
  return validationErrorsToFieldMap((error as ApiClientError | undefined)?.validationErrors, ['name', 'email', 'password']);
}
