import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ImageUploader = ({ onImageUploaded, currentImageUrl = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);
  const [useUrl, setUseUrl] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Размер файла не должен превышать 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/admin/upload-file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = `${process.env.REACT_APP_BACKEND_URL}${response.data.url}`;
      setImageUrl(uploadedUrl);
      onImageUploaded(uploadedUrl);
      toast.success('Изображение загружено!');
    } catch (error) {
      toast.error('Ошибка загрузки изображения');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      onImageUploaded(imageUrl.trim());
      toast.success('URL изображения сохранен');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Button
          type="button"
          variant={!useUrl ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUseUrl(false)}
        >
          <Upload className="mr-2" size={16} />
          Загрузить файл
        </Button>
        <Button
          type="button"
          variant={useUrl ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUseUrl(true)}
        >
          <ImageIcon className="mr-2" size={16} />
          Указать URL
        </Button>
      </div>

      {!useUrl ? (
        <div className="space-y-2">
          <label
            htmlFor="image-upload"
            className="flex items-center justify-center w-full h-32 px-4 transition border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400"
            style={{
              borderColor: 'var(--admin-border)',
              background: 'var(--admin-input-bg)',
            }}
          >
            <div className="space-y-2 text-center">
              {uploading ? (
                <>
                  <Loader2 className="mx-auto animate-spin" size={32} style={{ color: 'var(--admin-text-secondary)' }} />
                  <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                    Загрузка...
                  </p>
                </>
              ) : (
                <>
                  <Upload className="mx-auto" size={32} style={{ color: 'var(--admin-text-secondary)' }} />
                  <p className="text-sm" style={{ color: 'var(--admin-text-secondary)' }}>
                    Нажмите или перетащите изображение
                  </p>
                  <p className="text-xs" style={{ color: 'var(--admin-text-tertiary)' }}>
                    PNG, JPG, WEBP до 5MB
                  </p>
                </>
              )}
            </div>
            <input
              id="image-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="admin-input"
          />
          <Button
            type="button"
            onClick={handleUrlSubmit}
            className="admin-button"
            size="sm"
          >
            Сохранить URL
          </Button>
        </div>
      )}

      {(imageUrl || currentImageUrl) && (
        <div className="mt-4">
          <p className="text-sm mb-2" style={{ color: 'var(--admin-text-secondary)' }}>Превью:</p>
          <img
            src={imageUrl || currentImageUrl}
            alt="Preview"
            className="w-full max-h-64 object-cover rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              toast.error('Ошибка загрузки изображения');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
