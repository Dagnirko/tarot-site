import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, ArrowLeft, Calendar, Tag } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BlogPostPage = () => {
  const { postId } = useParams();
  const { theme, toggleTheme, settings } = useTheme();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [postId]);

  const fetchData = async () => {
    try {
      const [postRes, pagesRes] = await Promise.all([
        axios.get(`${API}/blog/${postId}`),
        axios.get(`${API}/pages`)
      ]);
      setPost(postRes.data);
      setPages(pagesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Пост не найден');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p style={{ color: 'var(--text-secondary)' }}>Загрузка...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
          <Button onClick={() => navigate('/blog')}>
            Вернуться к блогу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg" style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}>
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 
            className="text-2xl font-bold cursor-pointer" 
            style={{ color: 'var(--text-accent)' }}
            onClick={() => navigate('/')}
          >
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
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Button 
            onClick={() => navigate('/blog')}
            variant="ghost"
            className="mb-8"
          >
            <ArrowLeft className="mr-2" size={18} />
            Вернуться к блогу
          </Button>

          {/* Post Header */}
          <article className="glass-card">
            {post.image_url && (
              <img 
                src={post.image_url} 
                alt={post.title}
                className="w-full h-96 object-cover rounded-t-lg mb-8"
              />
            )}
            
            <div className="p-8">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                <span className="flex items-center gap-2">
                  <Calendar size={18} />
                  {formatDate(post.created_at)}
                </span>
                {post.tags && post.tags.length > 0 && (
                  <span className="flex items-center gap-2">
                    <Tag size={18} />
                    {post.tags.join(', ')}
                  </span>
                )}
              </div>

              {/* Post Content */}
              <div 
                className="prose prose-lg max-w-none"
                style={{ color: 'var(--text-primary)' }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
        <div className="container mx-auto text-center" style={{ color: 'var(--text-secondary)' }}>
          <p>&copy; 2025 {settings?.site_title || 'Таролог-Астролог'}. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default BlogPostPage;
