import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const DynamicPage = () => {
  const { slug } = useParams();
  const { settings } = useTheme();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
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

  const renderBlock = (block) => {
    switch (block.type) {
      case 'heading':
        return (
          <h2 key={block.id} className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {block.content.text}
          </h2>
        );
      case 'text':
        return (
          <div key={block.id} className="prose prose-lg mb-6" style={{ color: 'var(--text-primary)' }} dangerouslySetInnerHTML={{ __html: block.content.html }} />
        );
      case 'image':
        return (
          <div key={block.id} className="mb-6">
            <img src={block.content.url} alt={block.content.alt || ''} className="w-full rounded-lg shadow-lg" />
            {block.content.caption && (
              <p className="text-center mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{block.content.caption}</p>
            )}
          </div>
        );
      case 'quote':
        return (
          <blockquote key={block.id} className="border-l-4 pl-4 italic mb-6" style={{ borderColor: 'var(--text-accent)', color: 'var(--text-secondary)' }}>
            <p className="text-lg">{block.content.text}</p>
            {block.content.author && (
              <footer className="mt-2" style={{ color: 'var(--text-accent)' }}>— {block.content.author}</footer>
            )}
          </blockquote>
        );
      case 'video':
        return (
          <div key={block.id} className="mb-6 aspect-video">
            <iframe
              src={block.content.url}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      case 'html':
        return (
          <div key={block.id} className="mb-6" dangerouslySetInnerHTML={{ __html: block.content.code }} />
        );
      default:
        return null;
    }
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
    </div>
  );
};

export default DynamicPage;