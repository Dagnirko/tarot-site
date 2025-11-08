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
import ImageUploader from '@/components/ImageUploader';

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

  const columnSpanWidth = block.column_span === 1 ? '33.33%' : block.column_span === 2 ? '66.66%' : '100%';

  return (
    <div ref={setNodeRef} style={{ ...style, width: columnSpanWidth, padding: '0.5rem' }} className="inline-block align-top">
      <div className="admin-card h-full">
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
      column_span: 3,
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
      case 'services': return { display: 'all' };
      case 'divider': return { style: 'solid' };
      case 'button': return { text: 'Нажми меня', url: '#', style: 'primary' };
      case 'cards': return { items: [{ title: 'Карточка 1', text: 'Описание', icon: 'Star' }] };
      case 'accordion': return { items: [{ title: 'Вопрос 1', content: 'Ответ 1' }] };
      case 'contact_info': return { phone: '', email: '', address: '', social: {} };
      case 'tarot_card': return { card_name: 'Карта Дня', description: '' };
      case 'astro_widget': return { widget_type: 'moon_phase' };
      case 'calendar': return { title: 'Запись на консультацию' };
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

    const updateColumnSpan = (span) => {
      updateBlock(block.id, { column_span: span });
    };

    return (
      <div className="space-y-3">
        {/* Column Span Control */}
        <div className="flex gap-4 p-3 rounded" style={{ background: 'var(--admin-bg-tertiary)' }}>
          <div className="flex-1">
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--admin-text-secondary)' }}>Ширина столбцов</label>
            <select
              value={block.column_span || 3}
              onChange={(e) => updateColumnSpan(parseInt(e.target.value))}
              className="admin-select w-full text-sm"
              style={{ 
                background: 'var(--admin-input-bg)', 
                color: 'var(--admin-input-text)',
                border: `1px solid var(--admin-input-border)`,
                padding: '0.25rem 0.5rem'
              }}
            >
              <option value="1">1 столбец (33%)</option>
              <option value="2">2 столбца (66%)</option>
              <option value="3">3 столбца (100%)</option>
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
                  <ImageUploader
                    currentImageUrl={block.content.url}
                    onImageUploaded={(url) => updateContent({ ...block.content, url })}
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
                    Блок "Услуги" будет отображать все активные услуги с сайта.
                  </p>
                  <div className="p-4 rounded" style={{ background: 'var(--admin-bg-secondary)', border: '2px dashed var(--admin-border)' }}>
                    <p style={{ color: 'var(--admin-button-primary-bg)', fontWeight: '600' }}>📋 Предпросмотр: Блок Услуги</p>
                  </div>
                </div>
              );
            case 'divider':
              return (
                <div className="space-y-2" data-testid={`divider-editor-${block.id}`}>
                  <label className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>Стиль разделителя</label>
                  <select
                    value={block.content.style || 'solid'}
                    onChange={(e) => updateContent({ style: e.target.value })}
                    className="admin-select w-full"
                  >
                    <option value="solid">Сплошная линия</option>
                    <option value="dashed">Пунктирная линия</option>
                    <option value="dotted">Точечная линия</option>
                  </select>
                  <hr style={{ borderStyle: block.content.style || 'solid' }} className="my-2" />
                </div>
              );
            case 'button':
              return (
                <div className="space-y-2" data-testid={`button-editor-${block.id}`}>
                  <Input
                    placeholder="Текст кнопки"
                    value={block.content.text || ''}
                    onChange={(e) => updateContent({ ...block.content, text: e.target.value })}
                    className="admin-input"
                  />
                  <Input
                    placeholder="URL ссылки"
                    value={block.content.url || ''}
                    onChange={(e) => updateContent({ ...block.content, url: e.target.value })}
                    className="admin-input"
                  />
                  <select
                    value={block.content.style || 'primary'}
                    onChange={(e) => updateContent({ ...block.content, style: e.target.value })}
                    className="admin-select w-full"
                  >
                    <option value="primary">Основная</option>
                    <option value="secondary">Вторичная</option>
                    <option value="outline">Контурная</option>
                  </select>
                </div>
              );
            case 'cards':
              return (
                <div className="space-y-3" data-testid={`cards-editor-${block.id}`}>
                  <p style={{ color: 'var(--admin-text-secondary)' }}>Карточки (JSON формат)</p>
                  <Textarea
                    placeholder={`[{"title": "Заголовок", "text": "Текст", "icon": "Star"}]`}
                    value={JSON.stringify(block.content.items || [], null, 2)}
                    onChange={(e) => {
                      try {
                        const items = JSON.parse(e.target.value);
                        updateContent({ items });
                      } catch {}
                    }}
                    rows={6}
                    className="font-mono text-sm admin-textarea"
                  />
                </div>
              );
            case 'accordion':
              return (
                <div className="space-y-3" data-testid={`accordion-editor-${block.id}`}>
                  <p style={{ color: 'var(--admin-text-secondary)' }}>Аккордеон (JSON формат)</p>
                  <Textarea
                    placeholder={`[{"title": "Вопрос", "content": "Ответ"}]`}
                    value={JSON.stringify(block.content.items || [], null, 2)}
                    onChange={(e) => {
                      try {
                        const items = JSON.parse(e.target.value);
                        updateContent({ items });
                      } catch {}
                    }}
                    rows={6}
                    className="font-mono text-sm admin-textarea"
                  />
                </div>
              );
            case 'contact_info':
              return (
                <div className="space-y-2" data-testid={`contact-info-editor-${block.id}`}>
                  <Input
                    placeholder="Телефон"
                    value={block.content.phone || ''}
                    onChange={(e) => updateContent({ ...block.content, phone: e.target.value })}
                    className="admin-input"
                  />
                  <Input
                    placeholder="Email"
                    value={block.content.email || ''}
                    onChange={(e) => updateContent({ ...block.content, email: e.target.value })}
                    className="admin-input"
                  />
                  <Input
                    placeholder="Адрес"
                    value={block.content.address || ''}
                    onChange={(e) => updateContent({ ...block.content, address: e.target.value })}
                    className="admin-input"
                  />
                </div>
              );
            case 'tarot_card':
              return (
                <div className="space-y-2" data-testid={`tarot-card-editor-${block.id}`}>
                  <Input
                    placeholder="Название карты"
                    value={block.content.card_name || ''}
                    onChange={(e) => updateContent({ ...block.content, card_name: e.target.value })}
                    className="admin-input"
                  />
                  <Textarea
                    placeholder="Описание карты"
                    value={block.content.description || ''}
                    onChange={(e) => updateContent({ ...block.content, description: e.target.value })}
                    rows={3}
                    className="admin-textarea"
                  />
                </div>
              );
            case 'astro_widget':
              return (
                <div className="space-y-2" data-testid={`astro-widget-editor-${block.id}`}>
                  <select
                    value={block.content.widget_type || 'moon_phase'}
                    onChange={(e) => updateContent({ widget_type: e.target.value })}
                    className="admin-select w-full"
                  >
                    <option value="moon_phase">Фаза Луны</option>
                    <option value="zodiac_signs">Знаки Зодиака</option>
                    <option value="planetary_hours">Планетарные Часы</option>
                  </select>
                  <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                    Виджет будет отображать выбранную астрологическую информацию
                  </p>
                </div>
              );
            case 'calendar':
              return (
                <div className="space-y-2" data-testid={`calendar-editor-${block.id}`}>
                  <Input
                    placeholder="Заголовок календаря"
                    value={block.content.title || ''}
                    onChange={(e) => updateContent({ title: e.target.value })}
                    className="admin-input"
                  />
                  <p style={{ color: 'var(--admin-text-secondary)', fontSize: '0.875rem' }}>
                    Отобразит простой календарь для записи на консультацию
                  </p>
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
      <div className="container mx-auto max-w-7xl px-6 py-12">
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
                { type: 'heading', label: '📝 Заголовок', category: 'basic' },
                { type: 'text', label: '📄 Текст', category: 'basic' },
                { type: 'image', label: '🖼️ Изображение', category: 'basic' },
                { type: 'quote', label: '💬 Цитата', category: 'basic' },
                { type: 'video', label: '🎥 Видео', category: 'basic' },
                { type: 'button', label: '🔘 Кнопка', category: 'basic' },
                { type: 'divider', label: '➖ Разделитель', category: 'basic' },
                { type: 'services', label: '💼 Услуги', category: 'content' },
                { type: 'cards', label: '🃏 Карточки', category: 'content' },
                { type: 'accordion', label: '📋 Аккордеон', category: 'content' },
                { type: 'contact_info', label: '📞 Контакты', category: 'content' },
                { type: 'tarot_card', label: '🔮 Таро', category: 'special' },
                { type: 'astro_widget', label: '⭐ Астро', category: 'special' },
                { type: 'calendar', label: '📅 Календарь', category: 'special' },
                { type: 'html', label: '💻 HTML', category: 'advanced' },
              ].map(({ type, label }) => (
                <Button
                  key={type}
                  onClick={() => addBlock(type)}
                  variant="outline"
                  size="sm"
                  data-testid={`add-block-${type}`}
                >
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blocks Editor with 3-column layout preview */}
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
            <div>
              <div className="mb-4 p-3 rounded" style={{ background: 'var(--admin-bg-secondary)' }}>
                <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                  💡 <strong>Система 3 столбцов:</strong> Каждый блок может занимать 1, 2 или 3 столбца. Блоки автоматически выстраиваются в сетку.
                </p>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={pageData.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-wrap" style={{ margin: '-0.5rem' }}>
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
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageEditor;