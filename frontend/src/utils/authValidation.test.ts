import { describe, expect, it } from '@jest/globals';
import {
  validateLoginForm,
  validateRegisterForm,
  loginServerFieldErrors,
  registerServerFieldErrors,
} from './authValidation';

describe('auth validation helpers', () => {
  it('flags invalid login input', () => {
    expect(validateLoginForm({ email: 'bad-email', password: '' })).toEqual({
      email: 'Sisesta korrektne emaili aadress',
      password: 'Parool on kohustuslik',
    });
  });

  it('flags invalid registration input', () => {
    expect(
      validateRegisterForm({
        name: '',
        email: 'chemist',
        password: '123',
        confirmPassword: '456',
      })
    ).toEqual({
      name: 'Nimi on kohustuslik',
      email: 'Sisesta korrektne emaili aadress',
      password: 'Parool peab olema vähemalt 8 tähemärki',
      confirmPassword: 'Paroolid ei kattu',
    });
  });

  it('maps backend validation errors onto login fields', () => {
    expect(
      loginServerFieldErrors({
        validationErrors: ['email: must be a well-formed email address', 'password: must not be blank'],
      })
    ).toEqual({
      email: 'must be a well-formed email address',
      password: 'must not be blank',
    });
  });

  it('maps backend validation errors onto register fields', () => {
    expect(
      registerServerFieldErrors({
        validationErrors: ['name: must not be blank', 'email: must be a well-formed email address'],
      })
    ).toEqual({
      name: 'must not be blank',
      email: 'must be a well-formed email address',
    });
  });
});
