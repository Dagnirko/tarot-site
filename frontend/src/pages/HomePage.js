import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Moon, Sun, Mail, Send } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = () => {
  const { theme, toggleTheme, settings } = useTheme();
  const [pages, setPages] = useState([]);
  const [services, setServices] = useState([]);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pagesRes, servicesRes] = await Promise.all([
        axios.get(`${API}/pages`),
        axios.get(`${API}/services`)
      ]);
      setPages(pagesRes.data);
      setServices(servicesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleContact = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await axios.post(`${API}/contact`, contactForm);
      toast.success('Сообщение отправлено!');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Ошибка отправки сообщения');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="relative z-10">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg" style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}>
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-accent)' }}>
            {settings?.site_title || 'Таролог-Астролог'}
          </h1>
          <div className="flex items-center gap-6">
            <Link to="/blog" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
              Блог
            </Link>
            {pages.map((page) => (
              <Link key={page.id} to={`/page/${page.slug}`} className="hover:opacity-70 transition-opacity" style={{ color: 'var(--text-primary)' }}>
                {page.title}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:scale-110 transition-transform"
              style={{ background: 'var(--button-bg)', color: 'var(--button-text)' }}
              data-testid="theme-toggle-button"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl text-center fade-in-up">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Откройте Тайны Вселенной
          </h2>
          <p className="text-base sm:text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            {settings?.site_description || 'Профессиональные услуги таролога и астролога. Познайте свою судьбу через древние знания.'}
          </p>
          <Button 
            data-testid="contact-scroll-button"
            onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}
            className="btn-primary text-lg"
          >
            Записаться на консультацию
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl sm:text-4xl font-bold text-center mb-12" style={{ color: 'var(--text-primary)' }}>
            Мои Услуги
          </h3>
          {services.length === 0 ? (
            <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
              <p>Услуги скоро появятся</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, idx) => {
                const IconComponent = LucideIcons[service.icon] || LucideIcons.Star;
                return (
                  <div key={service.id} className="glass-card fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="flex items-center gap-3 mb-3">
                      <IconComponent size={32} style={{ color: 'var(--text-accent)' }} />
                      <h4 className="text-xl font-semibold" style={{ color: 'var(--text-accent)' }}>
                        {service.title}
                      </h4>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>{service.description}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6">
        <div className="container mx-auto max-w-2xl">
          <div className="glass-card">
            <h3 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
              <Mail className="inline mr-2" size={32} />
              Свяжитесь со Мной
            </h3>
            <form onSubmit={handleContact} className="space-y-4" data-testid="contact-form">
              <div>
                <Input
                  data-testid="contact-name-input"
                  placeholder="Ваше имя"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  data-testid="contact-email-input"
                  type="email"
                  placeholder="Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <Textarea
                  data-testid="contact-message-textarea"
                  placeholder="Ваше сообщение"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  rows={5}
                  className="w-full"
                />
              </div>
              <Button 
                data-testid="contact-submit-button"
                type="submit" 
                disabled={sending} 
                className="w-full btn-primary"
              >
                {sending ? 'Отправка...' : (
                  <>
                    <Send className="mr-2" size={18} />
                    Отправить
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="container mx-auto text-center" style={{ color: 'var(--text-secondary)' }}>
          <p>&copy; 2025 {settings?.site_title || 'Таролог-Астролог'}. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;