import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Settings } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminSettings = () => {
  const { token } = useAuth();
  const { refreshSettings } = useTheme();
  const [loading, setLoading] = useState(false);
  const [settingsData, setSettingsData] = useState({
    theme: 'light',
    site_title: 'Таролог-Астролог',
    site_description: '',
    admin_email: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettingsData(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/admin/settings`, settingsData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await refreshSettings();
      toast.success('Настройки сохранены');
    } catch (error) {
      toast.error('Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              <Settings className="inline mr-2" size={36} />
              Настройки
            </h1>
          </div>
          <Button onClick={handleSave} disabled={loading} className="btn-primary" data-testid="save-settings-button">
            <Save className="mr-2" size={18} />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle style={{ color: 'var(--text-primary)' }}>Основные Настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  Название Сайта
                </label>
                <Input
                  data-testid="site-title-input"
                  value={settingsData.site_title}
                  onChange={(e) => setSettingsData({ ...settingsData, site_title: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  Описание Сайта
                </label>
                <Textarea
                  data-testid="site-description-textarea"
                  value={settingsData.site_description}
                  onChange={(e) => setSettingsData({ ...settingsData, site_description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  Email Администратора (для уведомлений)
                </label>
                <Input
                  data-testid="admin-email-input"
                  type="email"
                  value={settingsData.admin_email || ''}
                  onChange={(e) => setSettingsData({ ...settingsData, admin_email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle style={{ color: 'var(--text-primary)' }}>Тема Оформления</CardTitle>
            </CardHeader>
            <CardContent>
              <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                Выберите тему по умолчанию
              </label>
              <Select value={settingsData.theme} onValueChange={(value) => setSettingsData({ ...settingsData, theme: value })}>
                <SelectTrigger data-testid="theme-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Светлая Тема</SelectItem>
                  <SelectItem value="mystical">Мистическая Тема</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                Пользователи могут переключать темы с помощью кнопки в шапке сайта.
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle style={{ color: 'var(--text-primary)' }}>Настройка Email Уведомлений</CardTitle>
            </CardHeader>
            <CardContent>
              <p style={{ color: 'var(--text-secondary)' }} className="mb-3">
                Для отправки email уведомлений необходимо добавить SendGrid API ключ в .env файл:
              </p>
              <pre className="p-3 rounded text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                SENDGRID_API_KEY=your_sendgrid_api_key{`\n`}
                SENDER_EMAIL=your_verified_email@domain.com
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;