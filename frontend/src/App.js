import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import HomePage from '@/pages/HomePage';
import DynamicPage from '@/pages/DynamicPage';
import AdminLogin from '@/admin/AdminLogin';
import AdminDashboard from '@/admin/AdminDashboard';
import AdminPages from '@/admin/AdminPages';
import PageEditor from '@/admin/PageEditor';
import AdminContacts from '@/admin/AdminContacts';
import AdminSettings from '@/admin/AdminSettings';
import ProtectedRoute from '@/components/ProtectedRoute';
import '@/App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/page/:slug" element={<DynamicPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/pages" element={<ProtectedRoute><AdminPages /></ProtectedRoute>} />
            <Route path="/admin/pages/new" element={<ProtectedRoute><PageEditor /></ProtectedRoute>} />
            <Route path="/admin/pages/edit/:pageId" element={<ProtectedRoute><PageEditor /></ProtectedRoute>} />
            <Route path="/admin/contacts" element={<ProtectedRoute><AdminContacts /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><AdminSettings /></ProtectedRoute>} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;