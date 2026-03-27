import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Spring Boot's OAuth2SuccessHandler redirects here as:
 *   /auth/callback?token=<jwt>
 *
 * We fetch the user profile with that token, then store both
 * via loginWithToken() from AuthContext.
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false); // guard against StrictMode double-fire

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    // Fetch user profile using the new token
    fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch user info');
        return res.json();
      })
      .then((userInfo) => {
        // userInfo = { email, name, role, photo }
        loginWithToken(token, userInfo);
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        navigate('/login?error=oauth_failed', { replace: true });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
      <p>Signing you in…</p>
    </div>
  );
}