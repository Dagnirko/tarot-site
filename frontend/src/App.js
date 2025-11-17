import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AdminThemeProvider } from '@/contexts/AdminThemeContext';
import { Toaster } from '@/components/ui/sonner';
import HomePage from '@/pages/HomePage';
import DynamicPage from '@/pages/DynamicPage';
import BlogListPage from '@/pages/BlogListPage';
import BlogPostPage from '@/pages/BlogPostPage';
import AdminDashboard from '@/admin/AdminDashboard';
import AdminPages from '@/admin/AdminPages';
import PageEditor from '@/admin/PageEditor';
import AdminContacts from '@/admin/AdminContacts';
import AdminSettings from '@/admin/AdminSettings';
import AdminBlog from '@/admin/AdminBlog';
import BlogEditor from '@/admin/BlogEditor';
import AdminHomePage from '@/admin/AdminHomePage';
import AdminServices from '@/admin/AdminServices';
import AdminCalendar from '@/admin/AdminCalendar';
import '@/App.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AdminThemeProvider>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:postId" element={<BlogPostPage />} />
            <Route path="/page/:slug" element={<DynamicPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/pages" element={<AdminPages />} />
            <Route path="/admin/pages/new" element={<PageEditor />} />
            <Route path="/admin/pages/edit/:pageId" element={<PageEditor />} />
            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/blog/new" element={<BlogEditor />} />
            <Route path="/admin/blog/edit/:postId" element={<BlogEditor />} />
            <Route path="/admin/home" element={<AdminHomePage />} />
            <Route path="/admin/services" element={<AdminServices />} />
            <Route path="/admin/calendar" element={<AdminCalendar />} />
            <Route path="/admin/contacts" element={<AdminContacts />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Routes>
        </AdminThemeProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;