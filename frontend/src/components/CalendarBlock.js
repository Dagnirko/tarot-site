import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CalendarBlock = ({ title }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(`${API}/timeslots/available`);
      // Group slots by date
      const groupedSlots = response.data.reduce((acc, slot) => {
        if (!acc[slot.date]) {
          acc[slot.date] = [];
        }
        acc[slot.date].push(slot);
        return acc;
      }, {});
      setAvailableSlots(groupedSlots);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      await axios.post(`${API}/appointments`, {
        slot_id: selectedSlot.id,
        ...formData
      });
      toast.success('Запись успешно создана!');
      setSubmitted(true);
      setShowForm(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
      fetchAvailableSlots(); // Refresh available slots
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка при создании записи');
    }
  };

  if (submitted) {
    return (
      <div className="glass-card text-center py-12">
        <Check size={64} className="mx-auto mb-4" style={{ color: 'var(--text-accent)' }} />
        <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Запись успешно создана!
        </h3>
        <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
          Мы свяжемся с вами для подтверждения записи.
        </p>
        <Button onClick={() => setSubmitted(false)} className="btn-primary">
          Записаться еще раз
        </Button>
      </div>
    );
  }

  if (showForm && selectedSlot) {
    return (
      <div className="glass-card">
        <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          Заполните данные для записи
        </h3>
        <div className="mb-4 p-3 rounded" style={{ background: 'var(--bg-secondary)' }}>
          <p className="flex items-center gap-2" style={{ color: 'var(--text-accent)' }}>
            <Calendar size={18} />
            {new Date(selectedSlot.date).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          <p className="flex items-center gap-2 mt-1" style={{ color: 'var(--text-secondary)' }}>
            <Clock size={18} />
            {selectedSlot.start_time} - {selectedSlot.end_time}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
              Имя *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ваше имя"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
              Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
              Телефон
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (___) ___-__-__"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium" style={{ color: 'var(--text-primary)' }}>
              Сообщение
            </label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Расскажите о причине обращения..."
              rows={4}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="btn-primary">
              Записаться
            </Button>
            <Button type="button" onClick={() => setShowForm(false)} variant="outline">
              Назад
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
        {title || 'Запись на консультацию'}
      </h3>
      
      {Object.keys(availableSlots).length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          <Calendar size={48} className="mx-auto mb-4" style={{ color: 'var(--text-accent)' }} />
          <p>В данный момент нет доступных слотов для записи</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(availableSlots)
            .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
            .map(([date, slots]) => (
              <div key={date}>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  {new Date(date).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot)}
                      className="p-3 rounded border-2 transition-all hover:scale-105"
                      style={{
                        background: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--text-accent)';
                        e.currentTarget.style.background = 'var(--card-bg)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                      }}
                    >
                      <Clock size={16} className="inline mr-1" />
                      {slot.start_time} - {slot.end_time}
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default CalendarBlock;
