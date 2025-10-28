import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
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

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await axios.get(`${API}/admin/pages`);
      setPages(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки страниц');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/admin/pages/${deleteId}`);
      toast.success('Страница удалена');
      fetchPages();
    } catch (error) {
      toast.error('Ошибка удаления');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Управление Страницами
            </h1>
          </div>
          <Link to="/admin/pages/new">
            <Button className="btn-primary" data-testid="create-page-button">
              <Plus className="mr-2" size={18} />
              Создать Страницу
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {pages.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <p style={{ color: 'var(--text-secondary)' }}>Нет страниц. Создайте первую!</p>
              </CardContent>
            </Card>
          ) : (
            pages.map((page) => (
              <Card key={page.id} className="glass-card">
                <CardContent className="py-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {page.title}
                      </h3>
                      <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                        /{page.slug} • {page.blocks?.length || 0} блоков
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1" style={{ color: page.published ? '#10b981' : '#ef4444' }}>
                        {page.published ? <Eye size={18} /> : <EyeOff size={18} />}
                        <span className="text-sm">{page.published ? 'Опубликовано' : 'Черновик'}</span>
                      </div>
                      <Link to={`/admin/pages/edit/${page.id}`}>
                        <Button variant="outline" size="icon" data-testid={`edit-page-${page.id}`}>
                          <Edit size={18} />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setDeleteId(page.id)}
                        data-testid={`delete-page-${page.id}`}
                      >
                        <Trash2 size={18} />
                      </Button>
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
            <AlertDialogTitle>Удалить страницу?</AlertDialogTitle>
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

export default AdminPages;