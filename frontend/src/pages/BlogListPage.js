import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun, ArrowLeft, Calendar, Tag } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BlogListPage = () => {
  const { theme, toggleTheme, settings } = useTheme();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, pagesRes] = await Promise.all([
        axios.get(`${API}/blog`),
        axios.get(`${API}/pages`)
      ]);
      setPosts(postsRes.data);
      setPages(pagesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
        <div className="container mx-auto max-w-5xl">
          {/* Back Button */}
          <Button 
            onClick={() => navigate('/')}
            variant="ghost"
            className="mb-8"
          >
            <ArrowLeft className="mr-2" size={18} />
            Вернуться на главную
          </Button>

          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Блог
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Статьи о таро, астрологии и духовном развитии
            </p>
          </div>

          {/* Blog Posts Grid */}
          {loading ? (
            <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>
              Загрузка...
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl" style={{ color: 'var(--text-secondary)' }}>
                Пока нет опубликованных постов
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="glass-card hover:scale-105 transition-transform duration-300"
                >
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-t-lg mb-4"
                    />
                  )}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span className="flex items-center gap-1">
                        <Calendar size={16} />
                        {formatDate(post.created_at)}
                      </span>
                      {post.tags && post.tags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Tag size={16} />
                          {post.tags.slice(0, 2).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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

export default BlogListPage;
