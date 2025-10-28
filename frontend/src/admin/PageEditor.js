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
    <div ref={setNodeRef} style={style} className="draggable-block glass-card mb-4">
      <div className="flex items-start gap-2">
        <button {...attributes} {...listeners} className="p-2 cursor-move hover:bg-opacity-20 hover:bg-gray-500 rounded" data-testid={`drag-handle-${id}`}>
          <GripVertical size={20} style={{ color: 'var(--text-secondary)' }} />
        </button>
        <div className="flex-1">
          {children}
        </div>
        <button 
          onClick={onDelete} 
          className="p-2 hover:bg-red-500 hover:bg-opacity-20 rounded"
          data-testid={`delete-block-${id}`}
        >
          <Trash2 size={20} style={{ color: '#ef4444' }} />
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
      default: return {};
    }
  };

  const updateBlock = (blockId, content) => {
    setPageData({
      ...pageData,
      blocks: pageData.blocks.map(block =>
        block.id === blockId ? { ...block, content } : block
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
    switch (block.type) {
      case 'heading':
        return (
          <Input
            data-testid={`heading-input-${block.id}`}
            placeholder="Введите заголовок"
            value={block.content.text || ''}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            className="text-2xl font-bold"
          />
        );
      case 'text':
        return (
          <div data-testid={`text-editor-${block.id}`}>
            <TiptapEditor
              value={block.content.html || ''}
              onChange={(html) => updateBlock(block.id, { html })}
            />
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2" data-testid={`image-editor-${block.id}`}>
            <Input
              placeholder="URL изображения"
              value={block.content.url || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })}
            />
            <Input
              placeholder="Alt текст"
              value={block.content.alt || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
            />
            <Input
              placeholder="Подпись"
              value={block.content.caption || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, caption: e.target.value })}
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
              onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
              rows={3}
            />
            <Input
              placeholder="Автор (необязательно)"
              value={block.content.author || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, author: e.target.value })}
            />
          </div>
        );
      case 'video':
        return (
          <div className="space-y-2" data-testid={`video-editor-${block.id}`}>
            <Input
              placeholder="YouTube embed URL (https://www.youtube.com/embed/...)"
              value={block.content.url || ''}
              onChange={(e) => updateBlock(block.id, { url: e.target.value })}
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
              onChange={(e) => updateBlock(block.id, { code: e.target.value })}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/pages">
              <Button variant="outline" size="icon" data-testid="back-to-pages">
                <ArrowLeft size={18} />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {pageId ? 'Редактировать' : 'Создать'} Страницу
            </h1>
          </div>
          <Button onClick={handleSave} disabled={loading} className="btn-primary" data-testid="save-page-button">
            <Save className="mr-2" size={18} />
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>

        {/* Page Settings */}
        <Card className="glass-card mb-6">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>Название страницы</label>
              <Input
                data-testid="page-title-input"
                placeholder="Например: О мне"
                value={pageData.title}
                onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>Slug (URL)</label>
              <Input
                data-testid="page-slug-input"
                placeholder="Например: about"
                value={pageData.slug}
                onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                data-testid="page-published-switch"
                checked={pageData.published}
                onCheckedChange={(checked) => setPageData({ ...pageData, published: checked })}
              />
              <label style={{ color: 'var(--text-primary)' }}>Опубликовать страницу</label>
            </div>
          </CardContent>
        </Card>

        {/* Add Block Toolbar */}
        <Card className="glass-card mb-6">
          <CardContent className="pt-6">
            <label className="block mb-3 font-medium" style={{ color: 'var(--text-primary)' }}>Добавить блок:</label>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'heading', label: 'Заголовок' },
                { type: 'text', label: 'Текст' },
                { type: 'image', label: 'Изображение' },
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
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <p style={{ color: 'var(--text-secondary)' }}>
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
                      <span className="text-sm font-medium px-2 py-1 rounded" style={{ background: 'var(--button-bg)', color: 'var(--button-text)' }}>
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