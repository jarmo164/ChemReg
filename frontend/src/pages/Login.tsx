import { useState, FormEvent, ChangeEvent } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ChemRegButton from '../components/ChemRegButton';
import Input from '../components/Input';
import { setAuthSession } from '../auth/auth';
import { login } from '../api/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await login(email, password);

      if (response.authenticated && response.user && response.accessToken && response.refreshToken) {
        setAuthSession({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          tokenType: response.tokenType || 'Bearer',
          accessTokenExpiresAt: response.accessTokenExpiresAt,
          user: {
            id: response.user.id,
            tenantId: response.user.tenantId,
            email: response.user.email,
            name: response.user.name,
            role: response.user.role,
            status: response.user.status,
          },
        });
        const from = (location.state as any)?.from?.pathname;
        navigate(from || '/dashboard', { replace: true });
      } else {
        setError(response.message || 'Login failed');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Sign In
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {(location.state as any)?.message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {(location.state as any).message}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-blue-500 hover:underline">
              Forgot password?
            </Link>
          </div>

          <ChemRegButton type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </ChemRegButton>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;