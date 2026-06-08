import React, { useState } from 'react';
import { Triangle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import './Login.css';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<{ error: string | null }>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await onLogin(email, password);

    if (authError) {
      setError(authError);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      {/* Top left branding */}
      <div className="login-brand">
        <Triangle size={24} fill="var(--accent-primary)" color="var(--accent-primary)" className="brand-icon" />
        <span className="brand-text">Loterra</span>
      </div>

      {/* Centered Login Card */}
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Loterra</h1>
          <p className="login-subtitle">Sales Administration</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="login-label">Correo Electrónico</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                id="login-email"
                placeholder="nombre@loterra.com"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group mt-4">
            <label className="login-label">Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                placeholder="••••••••"
                className="login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="icon-btn-right"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="login-options mt-4">
            <label className="remember-me">
              <input type="checkbox" id="remember-me" />
              <span>Recordarme</span>
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary login-btn"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;
