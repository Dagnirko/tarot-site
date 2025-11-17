import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Mail, Settings, LayoutDashboard, BookOpen, Home, Sparkles, Moon, Sun, Calendar } from 'lucide-react';
import { useAdminTheme } from '@/contexts/AdminThemeContext';

const AdminDashboard = () => {
  const { adminTheme, toggleAdminTheme } = useAdminTheme();
  
  const menuItems = [
    { title: 'Главная Страница', icon: Home, link: '/admin/home', desc: 'Редактирование главной страницы' },
    { title: 'Услуги', icon: Sparkles, link: '/admin/services', desc: 'Управление услугами на главной странице' },
    { title: 'Блог', icon: BookOpen, link: '/admin/blog', desc: 'Управление постами блога' },
    { title: 'Страницы', icon: FileText, link: '/admin/pages', desc: 'Управление страницами сайта' },
    { title: 'Сообщения', icon: Mail, link: '/admin/contacts', desc: 'Просмотр сообщений' },
    { title: 'Настройки', icon: Settings, link: '/admin/settings', desc: 'Настройки сайта' },
  ];

  return (
    <div className="min-h-screen px-6 py-12 bg-white dark:bg-gray-900 transition-colors">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              <LayoutDashboard className="inline mr-2" size={36} />
              Админ Панель
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Управление сайтом</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={toggleAdminTheme}
              variant="outline"
              className="dark:border-gray-700"
            >
              {adminTheme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </Button>
            <Link to="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Перейти на сайт</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => (
            <Link key={idx} to={item.link}>
              <Card className="hover:scale-105 transition-transform cursor-pointer h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-600 dark:text-blue-400">
                    <item.icon className="mr-2" size={24} />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
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