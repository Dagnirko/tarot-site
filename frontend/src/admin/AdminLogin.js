import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(credentials.username, credentials.password);
      toast.success('Успешный вход!');
      navigate('/admin');
    } catch (error) {
      toast.error('Неверные данные');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-6">
      <Card className="w-full max-w-md glass-card">
        <CardHeader>
          <CardTitle className="text-center text-2xl" style={{ color: 'var(--text-primary)' }}>
            <Lock className="inline mr-2" size={28} />
            Вход в Админку
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="admin-login-form">
            <Input
              data-testid="admin-username-input"
              placeholder="Имя пользователя"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
            <Input
              data-testid="admin-password-input"
              type="password"
              placeholder="Пароль"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
            <Button data-testid="admin-login-button" type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;