import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Image as ImageIcon, Tag } from 'lucide-react';
import TiptapEditor from '@/components/TiptapEditor';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BlogEditor = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image_url: '',
    tags: [],
    published: false
  });

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await axios.get(`${API}/admin/blog`);
      const post = response.data.find(p => p.id === postId);
      if (post) {
        setPostData(post);
      }
    } catch (error) {
      toast.error('Ошибка загрузки поста');
    }
  };

  const handleSave = async () => {
    if (!postData.title || !postData.content) {
      toast.error('Заполните заголовок и содержание');
      return;
    }

    setLoading(true);
    try {
      if (postId) {
        await axios.put(`${API}/admin/blog/${postId}`, postData);
        toast.success('Пост обновлен');
      } else {
        await axios.post(`${API}/admin/blog`, postData);
        toast.success('Пост создан');
      }
      navigate('/admin/blog');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !postData.tags.includes(tagInput.trim())) {
      setPostData({ ...postData, tags: [...postData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setPostData({ ...postData, tags: postData.tags.filter(tag => tag !== tagToRemove) });
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/blog">
              <Button variant="outline" size="icon" data-testid="back-to-blog">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {postId ? 'Редактировать' : 'Создать'} Пост
            </h1>
          </div>
          <Button onClick={handleSave} disabled={loading} className="btn-primary" data-testid="save-post-button">
            <Save className="mr-2" size={18} />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="glass-card">
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  Заголовок
                </label>
                <Input
                  data-testid="post-title-input"
                  placeholder="Введите заголовок поста"
                  value={postData.title}
                  onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  Краткое описание
                </label>
                <Input
                  data-testid="post-excerpt-input"
                  placeholder="Короткое описание поста (для превью)"
                  value={postData.excerpt}
                  onChange={(e) => setPostData({ ...postData, excerpt: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  <ImageIcon className="inline mr-2" size={18} />
                  URL изображения
                </label>
                <Input
                  data-testid="post-image-input"
                  placeholder="https://example.com/image.jpg"
                  value={postData.image_url}
                  onChange={(e) => setPostData({ ...postData, image_url: e.target.value })}
                />
                {postData.image_url && (
                  <img 
                    src={postData.image_url} 
                    alt="Превью" 
                    className="mt-3 w-full max-h-64 object-cover rounded-lg"
                  />
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  <Tag className="inline mr-2" size={18} />
                  Теги
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    data-testid="tag-input"
                    placeholder="Добавить тег"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button onClick={addTag} variant="outline" data-testid="add-tag-button">
                    Добавить
                  </Button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {postData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm cursor-pointer"
                      style={{ 
                        background: 'var(--button-bg)', 
                        color: 'var(--button-text)' 
                      }}
                      onClick={() => removeTag(tag)}
                      data-testid={`tag-${idx}`}
                    >
                      {tag} ×
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  data-testid="post-published-switch"
                  checked={postData.published}
                  onCheckedChange={(checked) => setPostData({ ...postData, published: checked })}
                />
                <label style={{ color: 'var(--text-primary)' }}>Опубликовать пост</label>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card className="glass-card">
            <CardContent className="pt-6">
              <label className="block mb-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                Содержание
              </label>
              <div data-testid="post-content-editor">
                <ReactQuill
                  value={postData.content}
                  onChange={(content) => setPostData({ ...postData, content })}
                  theme="snow"
                  modules={modules}
                  style={{ minHeight: '400px' }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
