import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save, Home, Plus, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SortableSection = ({ id, section, onUpdate, onDelete, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="glass-card mb-4">
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="p-2 cursor-move hover:bg-opacity-20 hover:bg-gray-500 rounded">
          <GripVertical size={20} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div className="flex-1">
          {children}
        </div>
        <button 
          onClick={onDelete} 
          className="p-2 hover:bg-red-500 hover:bg-opacity-20 rounded"
        >
          <Trash2 size={20} style={{ color: '#ef4444' }} />
        </button>
      </div>
    </div>
  );
};

const AdminHomePage = () => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState({
    hero_title: 'Добро пожаловать',
    hero_subtitle: '',
    hero_image: '',
    sections: []
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API}/home-content`);
      setContent(response.data);
    } catch (error) {
      console.error('Failed to fetch home content:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`${API}/admin/home-content`, content);
      toast.success('Главная страница обновлена');
    } catch (error) {
      toast.error('Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: '',
      content: '',
      image: '',
      type: 'text' // text, image-text, cards
    };
    setContent({ ...content, sections: [...content.sections, newSection] });
  };

  const updateSection = (sectionId, updates) => {
    setContent({
      ...content,
      sections: content.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    });
  };

  const deleteSection = (sectionId) => {
    setContent({
      ...content,
      sections: content.sections.filter(section => section.id !== sectionId)
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = content.sections.findIndex(s => s.id === active.id);
      const newIndex = content.sections.findIndex(s => s.id === over.id);
      const reordered = arrayMove(content.sections, oldIndex, newIndex);
      setContent({ ...content, sections: reordered });
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              <Home className="inline mr-2" size={36} />
              Редактирование Главной Страницы
            </h1>
          </div>
          <Button onClick={handleSave} disabled={loading} className="btn-primary" data-testid="save-home-content">
            <Save className="mr-2" size={18} />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Hero Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle style={{ color: 'var(--text-primary)' }}>Hero Секция</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  Главный Заголовок
                </label>
                <Input
                  data-testid="hero-title-input"
                  value={content.hero_title}
                  onChange={(e) => setContent({ ...content, hero_title: e.target.value })}
                  placeholder="Добро пожаловать"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  Подзаголовок
                </label>
                <Textarea
                  data-testid="hero-subtitle-input"
                  value={content.hero_subtitle}
                  onChange={(e) => setContent({ ...content, hero_subtitle: e.target.value })}
                  placeholder="Краткое описание"
                  rows={3}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
                  URL Изображения Hero
                </label>
                <Input
                  data-testid="hero-image-input"
                  value={content.hero_image}
                  onChange={(e) => setContent({ ...content, hero_image: e.target.value })}
                  placeholder="https://example.com/hero-image.jpg"
                />
                {content.hero_image && (
                  <img 
                    src={content.hero_image} 
                    alt="Hero preview" 
                    className="mt-3 w-full max-h-64 object-cover rounded-lg"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Sections */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle style={{ color: 'var(--text-primary)' }}>Контентные Секции</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={addSection} 
                variant="outline" 
                className="mb-4"
                data-testid="add-section-button"
              >
                <Plus className="mr-2" size={18} />
                Добавить Секцию
              </Button>

              {content.sections.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }} className="text-center py-8">
                  Нет секций. Добавьте первую!
                </p>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={content.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    {content.sections.map((section) => (
                      <SortableSection
                        key={section.id}
                        id={section.id}
                        section={section}
                        onUpdate={updateSection}
                        onDelete={() => deleteSection(section.id)}
                      >
                        <div className="space-y-3">
                          <Input
                            data-testid={`section-title-${section.id}`}
                            placeholder="Заголовок секции"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, { title: e.target.value })}
                          />
                          <Textarea
                            data-testid={`section-content-${section.id}`}
                            placeholder="Содержание секции"
                            value={section.content}
                            onChange={(e) => updateSection(section.id, { content: e.target.value })}
                            rows={4}
                          />
                          <Input
                            data-testid={`section-image-${section.id}`}
                            placeholder="URL изображения (необязательно)"
                            value={section.image || ''}
                            onChange={(e) => updateSection(section.id, { image: e.target.value })}
                          />
                          {section.image && (
                            <img 
                              src={section.image} 
                              alt="Section preview" 
                              className="w-full max-h-48 object-cover rounded"
                            />
                          )}
                        </div>
                      </SortableSection>
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
