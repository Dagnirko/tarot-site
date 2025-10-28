import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, Plus, Edit2, Trash2, Save, X, Eye, EyeOff,
  Star, Sparkles, Wand2, Heart, Moon, Sun as SunIcon, 
  Compass, Target, Zap, Gift, Award
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Популярные иконки для выбора
const ICON_OPTIONS = [
  'Star', 'Sparkles', 'Wand2', 'Heart', 'Moon', 'SunIcon',
  'Compass', 'Target', 'Zap', 'Gift', 'Award', 'Gem',
  'Crown', 'Flame', 'Wind', 'Cloud', 'Rainbow', 'Feather'
];

const AdminServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    full_description: '',
    icon: 'Star',
    order: 0,
    visible: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/admin/services`);
      setServices(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки услуг');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await axios.put(`${API}/admin/services/${editingService.id}`, formData);
        toast.success('Услуга обновлена');
      } else {
        await axios.post(`${API}/admin/services`, formData);
        toast.success('Услуга создана');
      }
      fetchServices();
      resetForm();
    } catch (error) {
      toast.error('Ошибка сохранения услуги');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту услугу?')) return;
    try {
      await axios.delete(`${API}/admin/services/${id}`);
      toast.success('Услуга удалена');
      fetchServices();
    } catch (error) {
      toast.error('Ошибка удаления услуги');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      full_description: service.full_description || '',
      icon: service.icon,
      order: service.order,
      visible: service.visible
    });
    setShowForm(true);
  };

  const toggleVisibility = async (service) => {
    try {
      await axios.put(`${API}/admin/services/${service.id}`, {
        visible: !service.visible
      });
      fetchServices();
      toast.success(service.visible ? 'Услуга скрыта' : 'Услуга показана');
    } catch (error) {
      toast.error('Ошибка обновления видимости');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      full_description: '',
      icon: 'Star',
      order: 0,
      visible: true
    });
    setEditingService(null);
    setShowForm(false);
  };

  const renderIconPreview = (iconName) => {
    const IconComponent = LucideIcons[iconName] || Star;
    return <IconComponent size={24} />;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--admin-bg-primary)' }}>
      <header className="admin-header" style={{ background: 'var(--admin-card-bg)', borderBottom: `1px solid var(--admin-border)` }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/admin')} variant="ghost" size="sm">
              <ArrowLeft size={18} className="mr-2" />
              Назад
            </Button>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--admin-text-primary)' }}>Управление Услугами</h1>
          </div>
          <Button onClick={() => setShowForm(true)} className="admin-button">
            <Plus size={18} className="mr-2" />
            Добавить услугу
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Form */}
        {showForm && (
          <div className="admin-card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--admin-text-primary)' }}>
                {editingService ? 'Редактировать услугу' : 'Новая услуга'}
              </h2>
              <Button onClick={resetForm} variant="ghost" size="sm">
                <X size={18} />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="admin-label">Название</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Например: Таро Расклады"
                  className="admin-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-primary)' }}>Краткое описание</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Краткое описание услуги (отображается на карточке)"
                  rows={2}
                  className="admin-textarea"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--admin-text-primary)' }}>Полное описание</label>
                <Textarea
                  value={formData.full_description}
                  onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                  placeholder="Полное описание услуги (отображается в модальном окне)"
                  rows={6}
                  className="admin-textarea"
                />
              </div>
              <div>
                <label className="admin-label">Иконка</label>
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-lg" style={{ background: 'var(--admin-bg-tertiary)' }}>
                    {renderIconPreview(formData.icon)}
                  </div>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="admin-select flex-1"
                    style={{ 
                      background: 'var(--admin-input-bg)', 
                      color: 'var(--admin-input-text)',
                      border: `1px solid var(--admin-input-border)`
                    }}
                  >
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Порядок</label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="admin-input"
                  />
                </div>
                <div>
                  <label className="admin-label">Видимость</label>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={formData.visible}
                      onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span style={{ color: 'var(--admin-text-secondary)' }}>Показывать на сайте</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="admin-button" style={{ background: 'var(--admin-success)' }}>
                  <Save size={18} className="mr-2" />
                  Сохранить
                </Button>
                <Button type="button" onClick={resetForm} variant="outline">
                  Отмена
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Services List */}
        <div className="admin-card">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto" style={{ borderColor: 'var(--admin-button-primary-bg)' }}></div>
            </div>
          ) : services.length === 0 ? (
            <div className="p-12 text-center" style={{ color: 'var(--admin-text-muted)' }}>
              <p>Нет услуг. Создайте первую услугу.</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--admin-border)' }}>
              {services.map((service) => {
                const IconComponent = LucideIcons[service.icon] || Star;
                return (
                  <div key={service.id} className="p-6 transition-colors" style={{ '&:hover': { background: 'var(--admin-bg-secondary)' } }}>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="p-3 rounded-lg" style={{ background: 'var(--admin-bg-tertiary)' }}>
                          <IconComponent size={32} style={{ color: 'var(--admin-button-primary-bg)' }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold" style={{ color: 'var(--admin-text-primary)' }}>{service.title}</h3>
                            {!service.visible && (
                              <span className="px-2 py-1 text-xs rounded" style={{ background: 'var(--admin-bg-tertiary)', color: 'var(--admin-text-secondary)' }}>
                                Скрыто
                              </span>
                            )}
                            <span className="text-sm" style={{ color: 'var(--admin-text-muted)' }}>
                              Порядок: {service.order}
                            </span>
                          </div>
                          <p style={{ color: 'var(--admin-text-secondary)' }}>{service.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          onClick={() => toggleVisibility(service)}
                          variant="outline"
                          size="sm"
                          title={service.visible ? 'Скрыть' : 'Показать'}
                        >
                          {service.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </Button>
                        <Button
                          onClick={() => handleEdit(service)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          onClick={() => handleDelete(service.id)}
                          variant="outline"
                          size="sm"
                          style={{ color: 'var(--admin-error)' }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {services.length > 0 && (
          <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--admin-bg-secondary)' }}>
            <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
              💡 Совет: Максимум рекомендуется 15 услуг (3 столбца × 5 строк). 
              Используйте поле "Порядок" для сортировки услуг на главной странице.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminServices;
