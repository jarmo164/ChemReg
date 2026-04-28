import { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ChemRegButton from '../components/ChemRegButton';
import Input from '../components/Input';
import { register } from '../api/auth';
import { hasFieldErrors, registerServerFieldErrors, validateRegisterForm, type RegisterField } from '../utils/authValidation';

type RegisterFieldErrors = Partial<Record<RegisterField, string>>;

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const clearFieldError = (field: RegisterField) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const nextFieldErrors = validateRegisterForm({
      name,
      email,
      password,
      confirmPassword,
    });
    setFieldErrors(nextFieldErrors);
    if (hasFieldErrors(nextFieldErrors)) {
      return;
    }

    setIsLoading(true);

    try {
      await register(name.trim(), email.trim(), password);
      navigate('/login', { state: { message: 'Account created successfully. Please sign in.' } });
    } catch (err) {
      const serverFieldErrors = registerServerFieldErrors(err);
      if (hasFieldErrors(serverFieldErrors)) {
        setFieldErrors((current) => ({ ...current, ...serverFieldErrors }));
      }
      const nextError = err as Error;
      setError(nextError.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" role="alert">
              {error}
            </div>
          )}

          <Input
            id="name"
            label="Full Name"
            type="text"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setName(e.target.value);
              clearFieldError('name');
            }}
            placeholder="Enter your full name"
            error={fieldErrors.name}
            required
          />

          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
              clearFieldError('email');
            }}
            placeholder="Enter your email"
            error={fieldErrors.email}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value);
              clearFieldError('password');
            }}
            placeholder="Create a password"
            error={fieldErrors.password}
            helperText="Vähemalt 8 tähemärki."
            required
          />

          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setConfirmPassword(e.target.value);
              clearFieldError('confirmPassword');
            }}
            placeholder="Confirm your password"
            error={fieldErrors.confirmPassword}
            required
          />
          <ChemRegButton type="submit" className="w-full" disabled={isLoading}>
             {isLoading ? 'Creating account...' : 'Sign Up'}
          </ChemRegButton>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
