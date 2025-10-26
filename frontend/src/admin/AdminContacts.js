import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Check } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminContacts = () => {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${API}/admin/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data);
    } catch (error) {
      toast.error('Ошибка загрузки сообщений');
    }
  };

  const markAsRead = async (contactId) => {
    try {
      await axios.put(`${API}/admin/contacts/${contactId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContacts();
      toast.success('Отмечено как прочитанное');
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU');
  };

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin">
            <Button variant="outline" size="icon">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <h1 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            <Mail className="inline mr-2" size={36} />
            Сообщения
          </h1>
        </div>

        <div className="space-y-4">
          {contacts.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <p style={{ color: 'var(--text-secondary)' }}>Нет сообщений</p>
              </CardContent>
            </Card>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id} className="glass-card" data-testid={`contact-${contact.id}`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {contact.name}
                      </h3>
                      <p style={{ color: 'var(--text-accent)' }} className="text-sm">{contact.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.read ? (
                        <Badge variant="outline" style={{ borderColor: '#10b981', color: '#10b981' }}>
                          Прочитано
                        </Badge>
                      ) : (
                        <>
                          <Badge variant="outline" style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                            Новое
                          </Badge>
                          <Button 
                            size="sm" 
                            onClick={() => markAsRead(contact.id)}
                            data-testid={`mark-read-${contact.id}`}
                          >
                            <Check className="mr-1" size={16} />
                            Отметить
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-primary)' }} className="mb-2 whitespace-pre-wrap">
                    {contact.message}
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs">
                    {formatDate(contact.created_at)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContacts;