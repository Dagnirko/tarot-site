import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, BookOpen } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminBlog = () => {
  const [posts, setPosts] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API}/admin/blog`);
      setPosts(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки постов');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/admin/blog/${deleteId}`);
      toast.success('Пост удален');
      fetchPosts();
    } catch (error) {
      toast.error('Ошибка удаления');
    } finally {
      setDeleteId(null);
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
    <div className="min-h-screen px-6 py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="icon" data-testid="back-to-admin">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              <BookOpen className="inline mr-2" size={36} />
              Управление Блогом
            </h1>
          </div>
          <Link to="/admin/blog/new">
            <Button className="btn-primary" data-testid="create-post-button">
              <Plus className="mr-2" size={18} />
              Создать Пост
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {loading ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <p style={{ color: 'var(--text-secondary)' }}>Загрузка...</p>
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <p style={{ color: 'var(--text-secondary)' }}>Нет постов. Создайте первый!</p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="glass-card" data-testid={`blog-post-${post.id}`}>
                <CardContent className="py-4">
                  <div className="flex gap-4">
                    {post.image_url && (
                      <div className="w-32 h-32 flex-shrink-0">
                        <img 
                          src={post.image_url} 
                          alt={post.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mb-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {formatDate(post.created_at)}
                            </span>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex gap-1">
                                {post.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <div className="flex items-center gap-1" style={{ color: post.published ? '#10b981' : '#ef4444' }}>
                            {post.published ? <Eye size={18} /> : <EyeOff size={18} />}
                            <span className="text-sm">{post.published ? 'Опубликовано' : 'Черновик'}</span>
                          </div>
                          <Link to={`/admin/blog/edit/${post.id}`}>
                            <Button variant="outline" size="icon" data-testid={`edit-post-${post.id}`}>
                              <Edit size={18} />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => setDeleteId(post.id)}
                            data-testid={`delete-post-${post.id}`}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить пост?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBlog;
