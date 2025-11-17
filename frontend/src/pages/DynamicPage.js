import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
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

const DynamicPage = () => {
  const { slug } = useParams();
  const { settings } = useTheme();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchPage();
    fetchServices();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const response = await axios.get(`${API}/pages/${slug}`);
      setPage(response.data);
    } catch (error) {
      console.error('Failed to fetch page:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const getBlockGridClass = (block) => {
    // Используем column_span для определения ширины в grid системе
    const span = block.column_span || 3;
    switch (span) {
      case 1:
        return 'col-span-12 md:col-span-4'; // 33% на desktop
      case 2:
        return 'col-span-12 md:col-span-8'; // 66% на desktop
      case 3:
      default:
        return 'col-span-12'; // 100%
    }
  };

  const renderBlock = (block) => {
    const gridClass = getBlockGridClass(block);
    
    let content = null;

    switch (block.type) {
      case 'heading':
        content = (
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {block.content.text}
          </h2>
        );
        break;
      case 'text':
        content = (
          <div className="prose prose-lg mb-6" style={{ color: 'var(--text-primary)' }} dangerouslySetInnerHTML={{ __html: block.content.html }} />
        );
        break;
      case 'image':
        content = (
          <div className="mb-6">
            <img src={block.content.url} alt={block.content.alt || ''} className="w-full rounded-lg shadow-lg" />
            {block.content.caption && (
              <p className="text-center mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{block.content.caption}</p>
            )}
          </div>
        );
        break;
      case 'quote':
        content = (
          <blockquote className="border-l-4 pl-4 italic mb-6" style={{ borderColor: 'var(--text-accent)', color: 'var(--text-secondary)' }}>
            <p className="text-lg">{block.content.text}</p>
            {block.content.author && (
              <footer className="mt-2" style={{ color: 'var(--text-accent)' }}>— {block.content.author}</footer>
            )}
          </blockquote>
        );
        break;
      case 'video':
        content = (
          <div className="mb-6 aspect-video">
            <iframe
              src={block.content.url}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
        break;
      case 'html':
        content = (
          <div className="mb-6" dangerouslySetInnerHTML={{ __html: block.content.code }} />
        );
        break;
      case 'button':
        content = (
          <div className="mb-6 text-center">
            <a
              href={block.content.url || '#'}
              className={`btn-primary inline-block ${block.content.style === 'outline' ? 'border-2' : ''}`}
              style={
                block.content.style === 'outline'
                  ? { background: 'transparent', border: `2px solid var(--button-bg)`, color: 'var(--button-bg)' }
                  : block.content.style === 'secondary'
                  ? { background: 'var(--bg-secondary)', color: 'var(--text-primary)' }
                  : {}
              }
            >
              {block.content.text || 'Кнопка'}
            </a>
          </div>
        );
        break;
      case 'divider':
        content = (
          <hr 
            className="my-8" 
            style={{ 
              borderStyle: block.content.style || 'solid',
              borderColor: 'var(--border-color)',
              borderWidth: '1px'
            }} 
          />
        );
        break;
      case 'cards':
        content = (
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {(block.content.items || []).map((card, idx) => {
              const IconComponent = LucideIcons[card.icon] || LucideIcons.Star;
              return (
                <div key={idx} className="glass-card">
                  <div className="flex items-center gap-3 mb-3">
                    <IconComponent size={28} style={{ color: 'var(--text-accent)' }} />
                    <h4 className="text-lg font-semibold" style={{ color: 'var(--text-accent)' }}>
                      {card.title}
                    </h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>{card.text}</p>
                </div>
              );
            })}
          </div>
        );
        break;
      case 'accordion':
        content = (
          <div className="space-y-3 mb-6">
            {(block.content.items || []).map((item, idx) => (
              <details key={idx} className="glass-card">
                <summary className="font-semibold cursor-pointer" style={{ color: 'var(--text-accent)' }}>
                  {item.title}
                </summary>
                <p className="mt-3" style={{ color: 'var(--text-secondary)' }}>{item.content}</p>
              </details>
            ))}
          </div>
        );
        break;
      case 'contact_info':
        content = (
          <div className="glass-card mb-6">
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Контактная информация</h3>
            <div className="space-y-3">
              {block.content.phone && (
                <div className="flex items-center gap-3">
                  <LucideIcons.Phone size={20} style={{ color: 'var(--text-accent)' }} />
                  <a href={`tel:${block.content.phone}`} style={{ color: 'var(--text-secondary)' }}>{block.content.phone}</a>
                </div>
              )}
              {block.content.email && (
                <div className="flex items-center gap-3">
                  <LucideIcons.Mail size={20} style={{ color: 'var(--text-accent)' }} />
                  <a href={`mailto:${block.content.email}`} style={{ color: 'var(--text-secondary)' }}>{block.content.email}</a>
                </div>
              )}
              {block.content.address && (
                <div className="flex items-center gap-3">
                  <LucideIcons.MapPin size={20} style={{ color: 'var(--text-accent)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{block.content.address}</span>
                </div>
              )}
            </div>
          </div>
        );
        break;
      case 'tarot_card':
        content = (
          <div className="glass-card mb-6 text-center">
            <LucideIcons.Sparkles size={48} className="mx-auto mb-4" style={{ color: 'var(--text-accent)' }} />
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              {block.content.card_name || 'Карта Таро'}
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>{block.content.description}</p>
          </div>
        );
        break;
      case 'astro_widget':
        content = (
          <div className="glass-card mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <LucideIcons.Star size={24} style={{ color: 'var(--text-accent)' }} />
              {block.content.widget_type === 'moon_phase' && 'Фаза Луны'}
              {block.content.widget_type === 'zodiac_signs' && 'Знаки Зодиака'}
              {block.content.widget_type === 'planetary_hours' && 'Планетарные Часы'}
            </h3>
            <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
              <p>Астрологическая информация будет отображаться здесь</p>
            </div>
          </div>
        );
        break;
      case 'calendar':
        content = (
          <div className="glass-card mb-6">
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {block.content.title || 'Запись на консультацию'}
            </h3>
            <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
              <LucideIcons.Calendar size={48} className="mx-auto mb-4" style={{ color: 'var(--text-accent)' }} />
              <p>Календарь для записи будет здесь</p>
            </div>
          </div>
        );
        break;
      case 'services':
        content = (
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
              Наши Услуги
            </h3>
            {services.length === 0 ? (
              <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
                <p>Услуги скоро появятся</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {services.map((service) => {
                  const IconComponent = LucideIcons[service.icon] || LucideIcons.Star;
                  return (
                    <div 
                      key={service.id} 
                      className="glass-card cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setSelectedService(service)}
                      data-testid={`service-card-${service.id}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <IconComponent size={28} style={{ color: 'var(--text-accent)' }} />
                        <h4 className="text-lg font-semibold" style={{ color: 'var(--text-accent)' }}>
                          {service.title}
                        </h4>
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

    return (
      <div key={block.id} className={gridClass}>
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

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Страница не найдена</h1>
        <Link to="/">
          <Button className="btn-primary">
            <ArrowLeft className="mr-2" size={18} />
            На главную
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg" style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}>
        <nav className="container mx-auto px-6 py-4">
          <Link to="/" className="text-2xl font-bold" style={{ color: 'var(--text-accent)' }}>
            {settings?.site_title || 'Таролог-Астролог'}
          </Link>
        </nav>
      </header>

      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <Link to="/" className="inline-flex items-center mb-8 hover:opacity-70 transition-opacity" style={{ color: 'var(--text-accent)' }}>
            <ArrowLeft className="mr-2" size={18} />
            Назад
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
            {page.title}
          </h1>
          <div className="space-y-6">
            {page.blocks.sort((a, b) => a.order - b.order).map(renderBlock)}
          </div>
        </div>
      </main>

      {/* Service Modal */}
      {selectedService && (
        <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />
      )}
    </div>
  );
};

export default DynamicPage;