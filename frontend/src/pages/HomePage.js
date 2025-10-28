import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Moon, Sun, Mail, Send, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Service Modal Component
const ServiceModal = ({ service, onClose }) => {
  if (!service) return null;

  const IconComponent = LucideIcons[service.icon] || LucideIcons.Star;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div 
        className="glass-card max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        data-testid="service-modal"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <IconComponent size={40} style={{ color: 'var(--text-accent)' }} />
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {service.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-opacity-20 hover:bg-gray-500 transition"
            data-testid="close-service-modal"
          >
            <X size={24} style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>
        
        <div className="space-y-4">
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            {service.description}
          </p>
          
          {service.full_description && (
            <div 
              className="pt-4 border-t" 
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
            >
              <div dangerouslySetInnerHTML={{ __html: service.full_description.replace(/\n/g, '<br />') }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { theme, toggleTheme, settings } = useTheme();
  const [pages, setPages] = useState([]);
  const [services, setServices] = useState([]);
  const [homeContent, setHomeContent] = useState(null);
  const [homepagePage, setHomepagePage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pagesRes, servicesRes, homeContentRes, homepagePageRes] = await Promise.all([
        axios.get(`${API}/pages`),
        axios.get(`${API}/services`),
        axios.get(`${API}/home-content`),
        axios.get(`${API}/homepage-page`)
      ]);
      setPages(pagesRes.data);
      setServices(servicesRes.data);
      setHomeContent(homeContentRes.data);
      setHomepagePage(homepagePageRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
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

  // Render block from homepage page (if is_homepage is set)
  const renderPageBlock = (block) => {
    const getBlockWrapperStyle = () => {
      const styles = { marginBottom: '2rem' };
      
      switch (block.width) {
        case 'narrow': styles.maxWidth = '50%'; break;
        case 'normal': styles.maxWidth = '75%'; break;
        case 'wide': styles.maxWidth = '100%'; break;
        default: styles.maxWidth = '75%';
      }
      
      switch (block.layout) {
        case 'left': styles.marginLeft = '0'; styles.marginRight = 'auto'; break;
        case 'right': styles.marginLeft = 'auto'; styles.marginRight = '0'; break;
        case 'center': styles.marginLeft = 'auto'; styles.marginRight = 'auto'; break;
        case 'full': styles.maxWidth = '100%'; break;
      }
      
      return styles;
    };

    const blockStyle = getBlockWrapperStyle();
    let content = null;

    switch (block.type) {
      case 'heading':
        content = <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{block.content.text}</h2>;
        break;
      case 'text':
        content = <div className="prose prose-lg mb-6" style={{ color: 'var(--text-primary)' }} dangerouslySetInnerHTML={{ __html: block.content.html }} />;
        break;
      case 'image':
        content = (
          <div className="mb-6">
            <img src={block.content.url} alt={block.content.alt || ''} className="w-full rounded-lg shadow-lg" />
            {block.content.caption && <p className="text-center mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{block.content.caption}</p>}
          </div>
        );
        break;
      case 'quote':
        content = (
          <blockquote className="border-l-4 pl-4 italic mb-6" style={{ borderColor: 'var(--text-accent)', color: 'var(--text-secondary)' }}>
            <p className="text-lg">{block.content.text}</p>
            {block.content.author && <footer className="mt-2" style={{ color: 'var(--text-accent)' }}>— {block.content.author}</footer>}
          </blockquote>
        );
        break;
      case 'video':
        content = (
          <div className="mb-6 aspect-video">
            <iframe src={block.content.url} className="w-full h-full rounded-lg" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        );
        break;
      case 'html':
        content = <div className="mb-6" dangerouslySetInnerHTML={{ __html: block.content.code }} />;
        break;
      case 'services':
        content = (
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>Наши Услуги</h3>
            {services.length === 0 ? (
              <div className="text-center" style={{ color: 'var(--text-secondary)' }}><p>Услуги скоро появятся</p></div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {services.map((service) => {
                  const IconComponent = LucideIcons[service.icon] || LucideIcons.Star;
                  return (
                    <div key={service.id} className="glass-card cursor-pointer hover:scale-105 transition-transform" onClick={() => setSelectedService(service)} data-testid={`service-card-${service.id}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <IconComponent size={28} style={{ color: 'var(--text-accent)' }} />
                        <h4 className="text-lg font-semibold" style={{ color: 'var(--text-accent)' }}>{service.title}</h4>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{service.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
        break;
      default:
        return null;
    }

    return <div key={block.id} style={blockStyle}>{content}</div>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--text-accent)' }}></div>
      </div>
    );
  }

  // If a page is marked as homepage, render it instead
  if (homepagePage) {
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
              <button onClick={toggleTheme} className="p-2 rounded-full hover:scale-110 transition-transform" style={{ background: 'var(--button-bg)', color: 'var(--button-text)' }} data-testid="theme-toggle-button">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
            </div>
          </nav>
        </header>

        {/* Custom Homepage Content */}
        <main className="pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
              {homepagePage.title}
            </h1>
            <div className="space-y-6">
              {homepagePage.blocks.sort((a, b) => a.order - b.order).map(renderPageBlock)}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 px-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="container mx-auto text-center" style={{ color: 'var(--text-secondary)' }}>
            <p>&copy; 2025 {settings?.site_title || 'Таролог-Астролог'}. Все права защищены.</p>
          </div>
        </footer>

        {selectedService && <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />}
      </div>
    );
  }

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
          {homeContent?.hero_image && (
            <img 
              src={homeContent.hero_image} 
              alt="Hero" 
              className="w-full max-h-96 object-cover rounded-lg mb-8 shadow-lg"
            />
          )}
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            {homeContent?.hero_title || 'Откройте Тайны Вселенной'}
          </h2>
          <p className="text-base sm:text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
            {homeContent?.hero_subtitle || settings?.site_description || 'Профессиональные услуги таролога и астролога. Познайте свою судьбу через древние знания.'}
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

      {/* Content Sections from home_page_content */}
      {homeContent?.sections && homeContent.sections.length > 0 && (
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl space-y-16">
            {homeContent.sections.map((section, idx) => (
              <div key={section.id || idx} className="glass-card fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                {section.title && (
                  <h3 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {section.title}
                  </h3>
                )}
                {section.content && (
                  <p className="text-lg mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {section.content}
                  </p>
                )}
                {section.image && (
                  <img 
                    src={section.image} 
                    alt={section.title || 'Section image'} 
                    className="w-full max-h-96 object-cover rounded-lg mt-4"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

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
                  <div 
                    key={service.id} 
                    className="glass-card fade-in-up cursor-pointer hover:scale-105 transition-transform" 
                    style={{ animationDelay: `${idx * 0.1}s` }}
                    onClick={() => setSelectedService(service)}
                    data-testid={`service-card-${service.id}`}
                  >
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

      {/* Service Modal */}
      {selectedService && (
        <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}
    </div>
  );
};

export default HomePage;