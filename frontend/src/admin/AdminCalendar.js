import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Calendar as CalendarIcon, Clock } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminCalendar = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSlot, setNewSlot] = useState({
    date: '',
    start_time: '',
    end_time: '',
    available: true
  });

  useEffect(() => {
    fetchTimeSlots();
    fetchAppointments();
  }, []);

  const fetchTimeSlots = async () => {
    try {
      const response = await axios.get(`${API}/admin/timeslots`);
      setTimeSlots(response.data);
    } catch (error) {
      console.error('Failed to fetch time slots:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API}/admin/appointments`);
      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot.date || !newSlot.start_time || !newSlot.end_time) {
      toast.error('Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/admin/timeslots`, newSlot);
      toast.success('Слот добавлен');
      setNewSlot({ date: '', start_time: '', end_time: '', available: true });
      fetchTimeSlots();
    } catch (error) {
      toast.error('Ошибка добавления слота');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Удалить этот временной слот?')) return;

    try {
      await axios.delete(`${API}/admin/timeslots/${slotId}`);
      toast.success('Слот удален');
      fetchTimeSlots();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const handleToggleAvailability = async (slotId, currentAvailability) => {
    try {
      await axios.put(`${API}/admin/timeslots/${slotId}`, {
        available: !currentAvailability
      });
      toast.success('Доступность обновлена');
      fetchTimeSlots();
    } catch (error) {
      toast.error('Ошибка обновления');
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      await axios.put(`${API}/admin/appointments/${appointmentId}`, {
        status: newStatus
      });
      toast.success('Статус обновлен');
      fetchAppointments();
      fetchTimeSlots(); // Refresh slots as well
    } catch (error) {
      toast.error('Ошибка обновления статуса');
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Удалить эту запись?')) return;

    try {
      await axios.delete(`${API}/admin/appointments/${appointmentId}`);
      toast.success('Запись удалена');
      fetchAppointments();
      fetchTimeSlots();
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const getSlotInfo = (slotId) => {
    return timeSlots.find(s => s.id === slotId);
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
              <CalendarIcon className="inline mr-2" size={36} />
              Управление Календарем
            </h1>
          </div>
        </div>

        {/* Add New Time Slot */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>Добавить Временной Слот</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Дата
                </label>
                <Input
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  data-testid="slot-date-input"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Начало
                </label>
                <Input
                  type="time"
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                  data-testid="slot-start-time-input"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Конец
                </label>
                <Input
                  type="time"
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                  data-testid="slot-end-time-input"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddSlot} disabled={loading} className="btn-primary w-full">
                  <Plus className="mr-2" size={18} />
                  Добавить
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots List */}
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>
              Временные Слоты ({timeSlots.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeSlots.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Нет временных слотов</p>
            ) : (
              <div className="space-y-3">
                {timeSlots
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 rounded"
                      style={{
                        background: slot.available ? 'var(--bg-secondary)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${slot.available ? 'var(--border-color)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <CalendarIcon size={20} style={{ color: 'var(--text-accent)' }} />
                        <div>
                          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {new Date(slot.date).toLocaleDateString('ru-RU', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <Clock size={14} className="inline mr-1" />
                            {slot.start_time} - {slot.end_time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleToggleAvailability(slot.id, slot.available)}
                          size="sm"
                          variant={slot.available ? 'outline' : 'default'}
                        >
                          {slot.available ? 'Доступен' : 'Занят'}
                        </Button>
                        <Button
                          onClick={() => handleDeleteSlot(slot.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle style={{ color: 'var(--text-primary)' }}>
              Записи на Консультацию ({appointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>Нет записей</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => {
                  const slot = getSlotInfo(appointment.slot_id);
                  return (
                    <div
                      key={appointment.id}
                      className="p-4 rounded"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                            {appointment.name}
                          </h4>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {appointment.email} {appointment.phone && `• ${appointment.phone}`}
                          </p>
                        </div>
                        <span
                          className="px-3 py-1 rounded text-sm font-medium"
                          style={{
                            background:
                              appointment.status === 'confirmed'
                                ? 'rgba(34, 197, 94, 0.2)'
                                : appointment.status === 'cancelled'
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(250, 204, 21, 0.2)',
                            color:
                              appointment.status === 'confirmed'
                                ? '#16a34a'
                                : appointment.status === 'cancelled'
                                ? '#dc2626'
                                : '#ca8a04'
                          }}
                        >
                          {appointment.status === 'confirmed'
                            ? 'Подтверждено'
                            : appointment.status === 'cancelled'
                            ? 'Отменено'
                            : 'Ожидание'}
                        </span>
                      </div>
                      {slot && (
                        <div className="mb-3 p-2 rounded" style={{ background: 'var(--bg-primary)' }}>
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            <CalendarIcon size={14} className="inline mr-1" />
                            {new Date(slot.date).toLocaleDateString('ru-RU')} • {slot.start_time} - {slot.end_time}
                          </p>
                        </div>
                      )}
                      {appointment.message && (
                        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                          <strong>Сообщение:</strong> {appointment.message}
                        </p>
                      )}
                      <div className="flex gap-2">
                        {appointment.status !== 'confirmed' && (
                          <Button
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'confirmed')}
                            size="sm"
                            style={{ background: '#16a34a' }}
                          >
                            Подтвердить
                          </Button>
                        )}
                        {appointment.status !== 'cancelled' && (
                          <Button
                            onClick={() => handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                            size="sm"
                            variant="outline"
                          >
                            Отменить
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCalendar;
