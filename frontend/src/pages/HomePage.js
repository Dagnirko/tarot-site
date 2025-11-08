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
    const getBlockColumnClass = () => {
      const columnSpan = block.column_span || 3;
      return columnSpan === 1 ? 'col-span-1' : columnSpan === 2 ? 'col-span-2' : 'col-span-3';
    };

    let content = null;

    switch (block.type) {
      case 'heading':
        content = <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }} data-testid="block-heading">{block.content.text}</h2>;
        break;
      case 'text':
        content = <div className="prose prose-lg mb-6" style={{ color: 'var(--text-primary)' }} dangerouslySetInnerHTML={{ __html: block.content.html }} data-testid="block-text" />;
        break;
      case 'image':
        content = (
          <div className="mb-6" data-testid="block-image">
            <img src={block.content.url} alt={block.content.alt || ''} className="w-full rounded-lg shadow-lg" />
            {block.content.caption && <p className="text-center mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{block.content.caption}</p>}
          </div>
        );
        break;
      case 'quote':
        content = (
          <blockquote className="border-l-4 pl-4 italic mb-6" style={{ borderColor: 'var(--text-accent)', color: 'var(--text-secondary)' }} data-testid="block-quote">
            <p className="text-lg">{block.content.text}</p>
            {block.content.author && <footer className="mt-2" style={{ color: 'var(--text-accent)' }}>— {block.content.author}</footer>}
          </blockquote>
        );
        break;
      case 'video':
        content = (
          <div className="mb-6 aspect-video" data-testid="block-video">
            <iframe src={block.content.url} className="w-full h-full rounded-lg" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        );
        break;
      case 'html':
        content = <div className="mb-6" dangerouslySetInnerHTML={{ __html: block.content.code }} data-testid="block-html" />;
        break;
      case 'services':
        content = (
          <div className="mb-12" data-testid="block-services">
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

      // New block types
      case 'divider':
        content = (
          <div className="my-8" data-testid="block-divider">
            <hr 
              style={{ 
                borderColor: block.content.color || 'var(--border-color)',
                borderWidth: `${block.content.thickness || 1}px`,
                borderStyle: block.content.style || 'solid'
              }} 
            />
          </div>
        );
        break;

      case 'button':
        content = (
          <div className={`my-6 text-${block.content.align || 'center'}`} data-testid="block-button">
            <a
              href={block.content.link || '#'}
              target={block.content.newTab ? '_blank' : '_self'}
              rel={block.content.newTab ? 'noopener noreferrer' : ''}
              className="inline-block px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              style={{
                background: block.content.bgColor || 'var(--button-bg)',
                color: block.content.textColor || 'var(--button-text)'
              }}
            >
              {block.content.text || 'Кнопка'}
            </a>
          </div>
        );
        break;

      case 'cards':
        content = (
          <div className="my-8" data-testid="block-cards">
            {block.content.title && (
              <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
                {block.content.title}
              </h3>
            )}
            <div className={`grid gap-6 ${block.content.columns === '2' ? 'md:grid-cols-2' : block.content.columns === '4' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              {(block.content.cards || []).map((card, idx) => (
                <div key={idx} className="glass-card">
                  {card.icon && (
                    <div className="text-4xl mb-3">{card.icon}</div>
                  )}
                  {card.title && (
                    <h4 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-accent)' }}>
                      {card.title}
                    </h4>
                  )}
                  {card.description && (
                    <p style={{ color: 'var(--text-secondary)' }}>{card.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        break;

      case 'accordion':
        content = (
          <div className="my-8 space-y-3" data-testid="block-accordion">
            {block.content.title && (
              <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                {block.content.title}
              </h3>
            )}
            {(block.content.items || []).map((item, idx) => (
              <details key={idx} className="glass-card">
                <summary className="cursor-pointer font-semibold p-4" style={{ color: 'var(--text-primary)' }}>
                  {item.title || `Вопрос ${idx + 1}`}
                </summary>
                <div className="px-4 pb-4" style={{ color: 'var(--text-secondary)' }}>
                  {item.content}
                </div>
              </details>
            ))}
          </div>
        );
        break;

      case 'contact_info':
        content = (
          <div className="my-8 glass-card" data-testid="block-contact-info">
            {block.content.title && (
              <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                {block.content.title}
              </h3>
            )}
            <div className="space-y-3">
              {block.content.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📞</span>
                  <a href={`tel:${block.content.phone}`} style={{ color: 'var(--text-accent)' }}>
                    {block.content.phone}
                  </a>
                </div>
              )}
              {block.content.email && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✉️</span>
                  <a href={`mailto:${block.content.email}`} style={{ color: 'var(--text-accent)' }}>
                    {block.content.email}
                  </a>
                </div>
              )}
              {block.content.address && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{block.content.address}</span>
                </div>
              )}
              {block.content.hours && (
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🕒</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{block.content.hours}</span>
                </div>
              )}
            </div>
          </div>
        );
        break;

      case 'tarot_card':
        content = (
          <div className="my-8 glass-card text-center" data-testid="block-tarot">
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {block.content.title || '🔮 Карта Дня'}
            </h3>
            {block.content.cardName && (
              <div className="text-6xl mb-4">{block.content.cardImage || '🃏'}</div>
            )}
            <p className="text-xl font-semibold mb-3" style={{ color: 'var(--text-accent)' }}>
              {block.content.cardName || 'Таро карта дня'}
            </p>
            {block.content.description && (
              <p style={{ color: 'var(--text-secondary)' }}>{block.content.description}</p>
            )}
          </div>
        );
        break;

      case 'astro_widget':
        content = (
          <div className="my-8 glass-card text-center" data-testid="block-astro">
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {block.content.title || '✨ Астрологический Виджет'}
            </h3>
            {block.content.zodiacSign && (
              <div className="mb-4">
                <div className="text-5xl mb-2">{block.content.zodiacIcon || '♈'}</div>
                <p className="text-xl font-semibold" style={{ color: 'var(--text-accent)' }}>
                  {block.content.zodiacSign}
                </p>
              </div>
            )}
            {block.content.horoscope && (
              <p style={{ color: 'var(--text-secondary)' }}>{block.content.horoscope}</p>
            )}
            {block.content.moonPhase && (
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  🌙 Фаза луны: {block.content.moonPhase}
                </p>
              </div>
            )}
          </div>
        );
        break;

      case 'calendar':
        content = (
          <div className="my-8 glass-card" data-testid="block-calendar">
            <h3 className="text-2xl font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
              {block.content.title || '📅 Календарь Записи'}
            </h3>
            {block.content.embedCode ? (
              <div dangerouslySetInnerHTML={{ __html: block.content.embedCode }} />
            ) : (
              <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
                <p>Календарь бронирования будет добавлен позже</p>
                {block.content.bookingLink && (
                  <a 
                    href={block.content.bookingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-4 px-6 py-2 rounded-lg"
                    style={{ background: 'var(--button-bg)', color: 'var(--button-text)' }}
                  >
                    Записаться на консультацию
                  </a>
                )}
              </div>
            )}
          </div>
        );
        break;

      default:
        return null;
    }

    return (
      <div key={block.id} className={`${getBlockColumnClass()} mb-6`} data-testid={`block-${block.type}`}>
        {content}
      </div>
    );
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
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
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