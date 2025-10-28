import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TiptapEditor from '@/components/TiptapEditor';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SortableBlock = ({ id, block, onUpdate, onDelete, children }) => {
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
    <div ref={setNodeRef} style={style} className="admin-card mb-4">
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="p-2 cursor-move hover:bg-opacity-20 hover:bg-gray-500 rounded" data-testid={`drag-handle-${id}`}>
          <GripVertical size={20} style={{ color: 'var(--admin-text-secondary)' }} />
        </button>
        <div className="flex-1">
          {children}
        </div>
        <button 
          onClick={onDelete} 
          className="p-2 rounded transition-colors"
          style={{ color: 'var(--admin-error)' }}
          data-testid={`delete-block-${id}`}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};

const PageEditor = () => {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState({
    title: '',
    slug: '',
    published: false,
    blocks: []
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (pageId) {
      fetchPage();
    }
  }, [pageId]);

  const fetchPage = async () => {
    try {
      const response = await axios.get(`${API}/admin/pages`);
      const page = response.data.find(p => p.id === pageId);
      if (page) {
        setPageData(page);
      }
    } catch (error) {
      toast.error('Ошибка загрузки страницы');
    }
  };

  const addBlock = (type) => {
    const newBlock = {
      id: `block-${Date.now()}`,
      type,
      order: pageData.blocks.length,
      layout: 'full',  // full, left, right, center
      width: 'normal',  // normal, wide, narrow
      content: getDefaultContent(type)
    };
    setPageData({ ...pageData, blocks: [...pageData.blocks, newBlock] });
  };

  const getDefaultContent = (type) => {
    switch (type) {
      case 'heading': return { text: '' };
      case 'text': return { html: '' };
      case 'image': return { url: '', alt: '', caption: '' };
      case 'quote': return { text: '', author: '' };
      case 'video': return { url: '' };
      case 'html': return { code: '' };
      case 'services': return { display: 'all' }; // Display all services or selected ones
      default: return {};
    }
  };

  const updateBlock = (blockId, updates) => {
    setPageData({
      ...pageData,
      blocks: pageData.blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    });
  };

  const deleteBlock = (blockId) => {
    setPageData({
      ...pageData,
      blocks: pageData.blocks.filter(block => block.id !== blockId)
    });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = pageData.blocks.findIndex(b => b.id === active.id);
      const newIndex = pageData.blocks.findIndex(b => b.id === over.id);
      const reordered = arrayMove(pageData.blocks, oldIndex, newIndex).map((block, idx) => ({
        ...block,
        order: idx
      }));
      setPageData({ ...pageData, blocks: reordered });
    }
  };

  const handleSave = async () => {
    if (!pageData.title || !pageData.slug) {
      toast.error('Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      if (pageId) {
        await axios.put(`${API}/admin/pages/${pageId}`, pageData);
        toast.success('Страница обновлена');
      } else {
        await axios.post(`${API}/admin/pages`, pageData);
        toast.success('Страница создана');
      }
      navigate('/admin/pages');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const renderBlockEditor = (block) => {
    const updateContent = (newContent) => {
      updateBlock(block.id, { content: newContent });
    };

    const updateLayout = (field, value) => {
      updateBlock(block.id, { [field]: value });
    };

    return (
      <div className="space-y-3">
        {/* Layout Controls */}
        <div className="flex gap-4 p-3 rounded" style={{ background: 'var(--admin-bg-tertiary)' }}>
          <div className="flex-1">
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--admin-text-secondary)' }}>Позиция</label>
            <select
              value={block.layout || 'full'}
              onChange={(e) => updateLayout('layout', e.target.value)}
              className="admin-select w-full text-sm"
              style={{ 
                background: 'var(--admin-input-bg)', 
                color: 'var(--admin-input-text)',
                border: `1px solid var(--admin-input-border)`,
                padding: '0.25rem 0.5rem'
              }}
            >
              <option value="full">Во всю ширину</option>
              <option value="left">Слева</option>
              <option value="right">Справа</option>
              <option value="center">По центру</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--admin-text-secondary)' }}>Ширина</label>
            <select
              value={block.width || 'normal'}
              onChange={(e) => updateLayout('width', e.target.value)}
              className="admin-select w-full text-sm"
              style={{ 
                background: 'var(--admin-input-bg)', 
                color: 'var(--admin-input-text)',
                border: `1px solid var(--admin-input-border)`,
                padding: '0.25rem 0.5rem'
              }}
            >
              <option value="narrow">Узкая (50%)</option>
              <option value="normal">Обычная (75%)</option>
              <option value="wide">Широкая (100%)</option>
            </select>
          </div>
        </div>

        {/* Block Content Editor */}
        {(() => {
          switch (block.type) {
            case 'heading':
              return (
                <Input
                  data-testid={`heading-input-${block.id}`}
                  placeholder="Введите заголовок"
                  value={block.content.text || ''}
                  onChange={(e) => updateContent({ text: e.target.value })}
                  className="text-2xl font-bold admin-input"
                />
              );
            case 'text':
              return (
                <div data-testid={`text-editor-${block.id}`}>
                  <TiptapEditor
                    value={block.content.html || ''}
                    onChange={(html) => updateContent({ html })}
                  />
                </div>
              );
            case 'image':
              return (
                <div className="space-y-2" data-testid={`image-editor-${block.id}`}>
                  <Input
                    placeholder="URL изображения"
                    value={block.content.url || ''}
                    onChange={(e) => updateContent({ ...block.content, url: e.target.value })}
                    className="admin-input"
                  />
                  <Input
                    placeholder="Alt текст"
                    value={block.content.alt || ''}
                    onChange={(e) => updateContent({ ...block.content, alt: e.target.value })}
                    className="admin-input"
                  />
                  <Input
                    placeholder="Подпись"
                    value={block.content.caption || ''}
                    onChange={(e) => updateContent({ ...block.content, caption: e.target.value })}
                    className="admin-input"
                  />
                  {block.content.url && (
                    <img src={block.content.url} alt="preview" className="w-full max-h-64 object-cover rounded" />
                  )}
                </div>
              );
            case 'quote':
              return (
                <div className="space-y-2" data-testid={`quote-editor-${block.id}`}>
                  <Textarea
                    placeholder="Текст цитаты"
                    value={block.content.text || ''}
                    onChange={(e) => updateContent({ ...block.content, text: e.target.value })}
                    rows={3}
                    className="admin-textarea"
                  />
                  <Input
                    placeholder="Автор (необязательно)"
                    value={block.content.author || ''}
                    onChange={(e) => updateContent({ ...block.content, author: e.target.value })}
                    className="admin-input"
                  />
                </div>
              );
            case 'video':
              return (
                <div className="space-y-2" data-testid={`video-editor-${block.id}`}>
                  <Input
                    placeholder="YouTube embed URL (https://www.youtube.com/embed/...)"
                    value={block.content.url || ''}
                    onChange={(e) => updateContent({ url: e.target.value })}
                    className="admin-input"
                  />
                  {block.content.url && (
                    <div className="aspect-video">
                      <iframe src={block.content.url} className="w-full h-full rounded" allowFullScreen />
                    </div>
                  )}
                </div>
              );
            case 'html':
              return (
                <div data-testid={`html-editor-${block.id}`}>
                  <Textarea
                    placeholder="HTML код или iframe виджета"
                    value={block.content.code || ''}
                    onChange={(e) => updateContent({ code: e.target.value })}
                    rows={6}
                    className="font-mono text-sm admin-textarea"
                  />
                </div>
              );
            case 'services':
              return (
                <div className="space-y-2" data-testid={`services-editor-${block.id}`}>
                  <p style={{ color: 'var(--admin-text-secondary)' }}>
                    Блок "Услуги" будет отображать все активные услуги с сайта в формате карточек.
                    Пользователи смогут кликнуть на услугу, чтобы увидеть полное описание.
                  </p>
                  <div className="p-4 rounded" style={{ background: 'var(--admin-bg-secondary)', border: '2px dashed var(--admin-border)' }}>
                    <p style={{ color: 'var(--admin-button-primary-bg)', fontWeight: '600' }}>📋 Предпросмотр: Блок Услуги</p>
                    <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                      Здесь будут отображаться все активные услуги из раздела "Управление Услугами"
                    </p>
                  </div>
                </div>
              );
            default:
              return null;
          }
        })()}
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--admin-bg-primary)', color: 'var(--admin-text-primary)' }}>
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/pages">
              <Button variant="outline" size="icon" data-testid="back-to-pages">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--admin-text-primary)' }}>
              {pageId ? 'Редактировать' : 'Создать'} Страницу
            </h1>
          </div>
          <Button onClick={handleSave} disabled={loading} className="admin-button" data-testid="save-page-button">
            <Save className="mr-2" size={18} />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>

        {/* Page Settings */}
        <Card className="admin-card mb-6">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="admin-label">Название страницы</label>
              <Input
                data-testid="page-title-input"
                placeholder="Например: О мне"
                value={pageData.title}
                onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                className="admin-input"
              />
            </div>
            <div>
              <label className="admin-label">Slug (URL)</label>
              <Input
                data-testid="page-slug-input"
                placeholder="Например: about"
                value={pageData.slug}
                onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
                className="admin-input"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                data-testid="page-published-switch"
                checked={pageData.published}
                onCheckedChange={(checked) => setPageData({ ...pageData, published: checked })}
              />
              <label style={{ color: 'var(--admin-text-primary)' }}>Опубликовать страницу</label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                data-testid="page-homepage-switch"
                checked={pageData.is_homepage || false}
                onCheckedChange={(checked) => setPageData({ ...pageData, is_homepage: checked })}
              />
              <label style={{ color: 'var(--admin-text-primary)' }}>Использовать как главную страницу</label>
            </div>
          </CardContent>
        </Card>

        {/* Add Block Toolbar */}
        <Card className="admin-card mb-6">
          <CardContent className="pt-6">
            <label className="admin-label mb-3">Добавить блок:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'heading', label: 'Заголовок' },
                { type: 'text', label: 'Текст' },
                { type: 'image', label: 'Изображение' },
                { type: 'services', label: 'Услуги' },
                { type: 'quote', label: 'Цитата' },
                { type: 'video', label: 'Видео' },
                { type: 'html', label: 'HTML/Виджет' },
              ].map(({ type, label }) => (
                <Button
                  key={type}
                  onClick={() => addBlock(type)}
                  variant="outline"
                  size="sm"
                  data-testid={`add-block-${type}`}
                >
                  <Plus className="mr-1" size={16} />
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blocks Editor */}
        <div className="block-editor">
          {pageData.blocks.length === 0 ? (
            <Card className="admin-card">
              <CardContent className="py-12 text-center">
                <p style={{ color: 'var(--admin-text-secondary)' }}>
                  Нет блоков. Добавьте первый блок выше!
                </p>
              </CardContent>
            </Card>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={pageData.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {pageData.blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    id={block.id}
                    block={block}
                    onUpdate={updateBlock}
                    onDelete={() => deleteBlock(block.id)}
                  >
                    <div className="mb-2">
                      <span className="text-sm font-medium px-2 py-1 rounded" style={{ background: 'var(--admin-button-primary-bg)', color: 'var(--admin-button-primary-text)' }}>
                        {block.type}
                      </span>
                    </div>
                    {renderBlockEditor(block)}
                  </SortableBlock>
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageEditor;