import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Mail, Settings, LogOut, LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
  const { logout, user } = useAuth();

  const menuItems = [
    { title: 'Страницы', icon: FileText, link: '/admin/pages', desc: 'Управление страницами сайта' },
    { title: 'Сообщения', icon: Mail, link: '/admin/contacts', desc: 'Просмотр сообщений' },
    { title: 'Настройки', icon: Settings, link: '/admin/settings', desc: 'Настройки сайта' },
  ];

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              <LayoutDashboard className="inline mr-2" size={36} />
              Админ Панель
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>Добро пожаловать, {user?.username}!</p>
          </div>
          <div className="flex gap-4">
            <Link to="/">
              <Button className="btn-primary">Перейти на сайт</Button>
            </Link>
            <Button onClick={logout} variant="outline" data-testid="logout-button">
              <LogOut className="mr-2" size={18} />
              Выйти
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => (
            <Link key={idx} to={item.link}>
              <Card className="glass-card hover:scale-105 transition-transform cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center" style={{ color: 'var(--text-accent)' }}>
                    <item.icon className="mr-2" size={24} />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;