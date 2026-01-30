import { useActionState, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginForm() {
  const { loginAction, loginWithProvider, isPending } = useAuth();
  
  // Wrap loginAction to match useActionState signature (prevState, formData) => newState
  const wrappedLoginAction = async (_prevState: { error: string | null; success: boolean }, formData: FormData) => {
    return await loginAction(formData);
  };
  
  const [state, formAction, pending] = useActionState(wrappedLoginAction, { error: null, success: false });
  const [rememberMe, setRememberMe] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleProviderLogin = (provider: string) => {
    loginWithProvider(provider.toLowerCase());
  };

  const isLoading = pending || isPending;

  return (
    <div className="bg-brand-900 font-sans min-h-screen flex w-full">
      {/* Left Side: Branding/Background */}
      <div className="hidden lg:flex w-1/2 bg-brand-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        
        {/* Abstract SVG Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="none" stroke="white" strokeWidth="0.5" />
            <path d="M0 0 C 50 100 80 100 100 0 Z" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="20" cy="50" r="1" fill="white" />
            <circle cx="80" cy="20" r="1" fill="white" />
            <circle cx="50" cy="80" r="1" fill="white" />
            <line x1="20" y1="50" x2="80" y2="20" stroke="white" strokeWidth="0.2" strokeDasharray="1 1" />
            <line x1="80" y1="20" x2="50" y2="80" stroke="white" strokeWidth="0.2" strokeDasharray="1 1" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
            <i className="fa-solid fa-truck-fast text-white text-lg"></i>
          </div>
          <span className="text-2xl font-bold tracking-tight">Smart Delivery</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold mb-4 leading-tight">Optimizing routes in real-time.</h2>
          <p className="text-slate-400 text-lg">Manage your entire fleet, track deliveries, and analyze performance from a single centralized dashboard.</p>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          &copy; 2026 SmartLogistics Inc. System v4.0
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-600">
              Access your dispatch command center
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-8">
            <button 
              type="button" 
              onClick={() => handleProviderLogin('google')}
              disabled={isLoading}
              className="cursor-pointer flex items-center justify-center w-full px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-2" alt="Google" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Google</span>
            </button>

            <button 
              type="button" 
              onClick={() => handleProviderLogin('facebook')}
              disabled={isLoading}
              className="cursor-pointer flex items-center justify-center w-full px-4 py-3 bg-[#1877F2] text-white rounded-xl hover:bg-[#166fe5] transition-all duration-200 shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fa-brands fa-facebook-f mr-2"></i>
              <span className="text-sm font-medium">Facebook</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          <form className="mt-8 space-y-6" action={formAction}>
            {state.error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-start">
                <i className="fa-solid fa-circle-exclamation mt-0.5 mr-2"></i>
                <div className="flex-1">
                  <p className="text-sm font-medium">{state.error}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <i className="fa-regular fa-envelope"></i>
                  </div>
                  <input 
                    id="username"
                    name="username"
                    type="text" 
                    autoComplete="username"
                    required
                    disabled={isLoading}
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="username" 
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-brand-600 hover:text-brand-500">Forgot password?</a>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <i className="fa-solid fa-lock"></i>
                  </div>
                  <input 
                    id="password" 
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    disabled={isLoading}
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent sm:text-sm transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••" 
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input 
                id="remember-me" 
                name="remember-me" 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded" 
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                Keep me logged in
              </label>
            </div>

            <div>
              <button 
                type="submit" 
                disabled={isLoading || !credentials.username || !credentials.password}
                className="cursor-pointer group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-200 shadow-lg shadow-brand-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-600"
              >
                {isLoading ? (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <i className="fa-solid fa-spinner fa-spin text-brand-400"></i>
                    </span>
                    Logging In...
                  </>
                ) : (
                  <>
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      <i className="fa-solid fa-arrow-right-to-bracket text-brand-500 group-hover:text-brand-400 transition-colors"></i>
                    </span>
                    Log In to Dashboard
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-2 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-brand-600 hover:text-brand-500">Request access</a>
          </p>
        </div>
      </div>
    </div>
  );
}