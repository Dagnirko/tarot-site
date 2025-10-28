import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/sonner';
import HomePage from '@/pages/HomePage';
import DynamicPage from '@/pages/DynamicPage';
import AdminDashboard from '@/admin/AdminDashboard';
import AdminPages from '@/admin/AdminPages';
import PageEditor from '@/admin/PageEditor';
import AdminContacts from '@/admin/AdminContacts';
import AdminSettings from '@/admin/AdminSettings';
import AdminBlog from '@/admin/AdminBlog';
import BlogEditor from '@/admin/BlogEditor';
import AdminHomePage from '@/admin/AdminHomePage';
import '@/App.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/page/:slug" element={<DynamicPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/pages" element={<AdminPages />} />
          <Route path="/admin/pages/new" element={<PageEditor />} />
          <Route path="/admin/pages/edit/:pageId" element={<PageEditor />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/blog/new" element={<BlogEditor />} />
          <Route path="/admin/blog/edit/:postId" element={<BlogEditor />} />
          <Route path="/admin/home" element={<AdminHomePage />} />
          <Route path="/admin/contacts" element={<AdminContacts />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;