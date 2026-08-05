'use client';

import { useState, useEffect } from 'react';
import { Video, VideoFormData } from '@/types/video';
import { isValidDriveUrl, extractDriveFileId } from '@/lib/client-utils';
import VideoEditor from '@/components/VideoEditor';
import ThumbnailPicker from '@/components/ThumbnailPicker';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    drive_url: '',
    category: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'editor' | 'categories'>('dashboard');
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);

  const [stats, setStats] = useState<{
    totalUsers: number;
    activeUsers: number;
    countries: { name: string; count: number }[];
    topVideos: { id: number; title: string; drive_file_id: string; view_count: number; category: string }[];
    mostSearchedTopics: { query: string; count: number }[];
    mostSearchedVideos: { query: string; count: number }[];
    recentSearches: { query: string; results_count: number; created_at: string }[];
    totalPageViews: number;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');

  const fileId = formData.drive_url && isValidDriveUrl(formData.drive_url)
    ? extractDriveFileId(formData.drive_url)
    : null;

  useEffect(() => {
    if (isAuthenticated) {
      fetchVideos();
      fetchCategories();
      fetchStats();
    }
  }, [isAuthenticated]);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        const data = await response.json();
        setAuthError(data.error || 'Invalid credentials');
      }
    } catch {
      setAuthError('Authentication failed');
    }
  }

  async function fetchStats() {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    setCategoryError('');
    setCategorySuccess('');
    if (!newCategoryName.trim()) { setCategoryError('Category name is required'); return; }
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add category');
      }
      setCategorySuccess('Category added!');
      setNewCategoryName('');
      fetchCategories();
    } catch (error) {
      setCategoryError(error instanceof Error ? error.message : 'Failed to add category');
    }
  }

  async function handleDeleteCategory(id: number, name: string) {
    if (!confirm(`Delete category "${name}"? Videos with this category will become uncategorized.`)) return;
    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete category');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  async function fetchVideos() {
    setLoading(true);
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.title.trim()) { setFormError('Title is required'); return; }
    if (!formData.drive_url.trim()) { setFormError('Video link is required'); return; }
    if (!isValidDriveUrl(formData.drive_url)) { setFormError('Please enter a valid video link'); return; }

    try {
      const url = editingId ? `/api/videos/${editingId}` : '/api/videos';
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, thumbnail_url: selectedThumbnail || '', category_ids: selectedCategoryIds }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save video');
      }
      setFormSuccess(editingId ? 'Video updated successfully!' : 'Video added successfully!');
      resetForm();
      fetchVideos();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save video');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this video?')) return;
    try {
      const response = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete video');
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  }

  function handleEdit(video: Video) {
    setEditingId(video.id);
    setFormData({
      title: video.title,
      description: video.description || '',
      drive_url: video.drive_url,
      category: video.category || '',
    });
    setSelectedCategoryIds(video.category_ids || []);
    setSelectedThumbnail(video.thumbnail_url || null);
    setFormError('');
    setFormSuccess('');
    setActiveTab('add');
  }

  function resetForm() {
    setFormData({ title: '', description: '', drive_url: '', category: '' });
    setSelectedCategoryIds([]);
    setEditingId(null);
    setSelectedThumbnail(null);
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen animated-gradient-bg flex items-center justify-center px-4">
        <div className="aurora-container">
          <div className="aurora-blob aurora-blob-1" />
          <div className="aurora-blob aurora-blob-2" />
        </div>
        <div className="relative z-10 w-full max-w-md p-8 glass-card-strong">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo to-cyber rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-abyss" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Admin Login</h2>
            <p className="text-[var(--text-secondary)] text-sm">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter email"
                autoComplete="username"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>
            {authError && (
              <p className="error-message text-center" role="alert">{authError}</p>
            )}
            <button type="submit" className="btn-primary w-full">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-gradient-bg">
      <div className="aurora-container">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-12 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            <span className="gradient-text-animated">Admin</span> Dashboard
          </h1>
          <p className="text-[var(--text-secondary)]">Manage your videos and content</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => { setActiveTab('dashboard'); fetchStats(); }}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'dashboard'
                ? 'bg-indigo text-white shadow-lg shadow-indigo/30'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'add'
                ? 'bg-indigo text-white shadow-lg shadow-indigo/30'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Video
            </span>
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'editor'
                ? 'bg-indigo text-white shadow-lg shadow-indigo/30'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Video Editor
            </span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeTab === 'categories'
                ? 'bg-indigo text-white shadow-lg shadow-indigo/30'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Categories
            </span>
          </button>
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 mb-8">
            {statsLoading ? (
              <div className="glass-card-strong p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo border-t-transparent mx-auto" />
                <p className="text-[var(--text-secondary)] mt-4">Loading analytics...</p>
              </div>
            ) : stats ? (
              <>
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card-strong p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-indigo/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">Total Users</p>
                    </div>
                    <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.totalUsers}</p>
                  </div>
                  <div className="glass-card-strong p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">Active (7d)</p>
                    </div>
                    <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.activeUsers}</p>
                  </div>
                  <div className="glass-card-strong p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-coral/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">Page Views</p>
                    </div>
                    <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.totalPageViews}</p>
                  </div>
                  <div className="glass-card-strong p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-lavender/20 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--text-muted)]">Countries</p>
                    </div>
                    <p className="text-3xl font-bold text-[var(--text-primary)]">{stats.countries.length}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top 5 Most-Viewed Videos */}
                  <div className="glass-card-strong p-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Top 5 Most-Viewed Videos
                    </h3>
                    {stats.topVideos.length === 0 ? (
                      <p className="text-[var(--text-muted)] text-sm">No views yet</p>
                    ) : (
                      <div className="space-y-3">
                        {stats.topVideos.map((v, i) => (
                          <div key={v.id} className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded-xl">
                            <span className="text-lg font-bold text-indigo w-6">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[var(--text-primary)] truncate">{v.title}</p>
                              <p className="text-sm text-[var(--text-muted)]">{v.view_count.toLocaleString()} views</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Most-Searched Topics */}
                  <div className="glass-card-strong p-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Most-Searched Topics
                    </h3>
                    {stats.mostSearchedTopics.length === 0 ? (
                      <p className="text-[var(--text-muted)] text-sm">No searches yet</p>
                    ) : (
                      <div className="space-y-2">
                        {stats.mostSearchedTopics.map((s, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-xl">
                            <span className="font-medium text-[var(--text-primary)] truncate">{s.query}</span>
                            <span className="text-sm text-[var(--text-muted)] ml-2">{s.count}x</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Top 5 Most-Searched Videos */}
                  <div className="glass-card-strong p-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Top 5 Most-Searched Videos
                    </h3>
                    {stats.mostSearchedVideos.length === 0 ? (
                      <p className="text-[var(--text-muted)] text-sm">No searches yet</p>
                    ) : (
                      <div className="space-y-2">
                        {stats.mostSearchedVideos.map((s, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-xl">
                            <span className="font-medium text-[var(--text-primary)] truncate">{s.query}</span>
                            <span className="text-sm text-[var(--text-muted)] ml-2">{s.count} searches</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Countries */}
                  <div className="glass-card-strong p-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Visitor Countries
                    </h3>
                    {stats.countries.length === 0 ? (
                      <p className="text-[var(--text-muted)] text-sm">No country data yet</p>
                    ) : (
                      <div className="space-y-2">
                        {stats.countries.slice(0, 10).map((c, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-xl">
                            <span className="font-medium text-[var(--text-primary)]">{c.name}</span>
                            <span className="text-sm text-[var(--text-muted)]">{c.count} visit{c.count !== 1 ? 's' : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Searches */}
                {stats.recentSearches.length > 0 && (
                  <div className="glass-card-strong p-6">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-cyber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recent Searches
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border)]">
                            <th className="text-left py-2 text-[var(--text-muted)] font-medium">Query</th>
                            <th className="text-right py-2 text-[var(--text-muted)] font-medium">Results</th>
                            <th className="text-right py-2 text-[var(--text-muted)] font-medium">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recentSearches.map((s, i) => (
                            <tr key={i} className="border-b border-[var(--border)] last:border-0">
                              <td className="py-2 text-[var(--text-primary)]">{s.query}</td>
                              <td className="py-2 text-right text-[var(--text-secondary)]">{s.results_count}</td>
                              <td className="py-2 text-right text-[var(--text-muted)]">{new Date(s.created_at).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card-strong p-8 text-center">
                <p className="text-[var(--text-secondary)]">Failed to load analytics data</p>
                <button onClick={fetchStats} className="btn-primary mt-4">Retry</button>
              </div>
            )}
          </div>
        )}

        {/* Add Video Form */}
        {activeTab === 'add' && (
          <div className="glass-card-strong p-8 mb-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              {editingId ? 'Edit Video' : 'Add New Video'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title" className="label">Title <span className="text-coral">*</span></label>
                <input id="title" type="text" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field" placeholder="Enter video title" required />
              </div>

              <div>
                <label htmlFor="drive_url" className="label">Video link <span className="text-coral">*</span></label>
                <input id="drive_url" type="url" value={formData.drive_url}
                  onChange={(e) => setFormData({ ...formData, drive_url: e.target.value })}
                  className="input-field" placeholder="Paste your video share link" required />
                {formData.drive_url && fileId && (
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Valid video link
                  </p>
                )}
                {formData.drive_url && !fileId && (
                  <p className="error-message flex items-center gap-1 mt-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Please enter a valid video link
                  </p>
                )}
                <p className="text-sm text-[var(--text-muted)] mt-2">
                  Paste a video share link. The file must be shared with &quot;Anyone with the link&quot; access.
                </p>
                {fileId && (
                  <div className="mt-4">
                    <ThumbnailPicker fileId={fileId} onSelect={setSelectedThumbnail} selectedUrl={selectedThumbnail} />
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="description" className="label">Description</label>
                <textarea id="description" value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field min-h-[120px]" rows={4}
                  placeholder="Enter video description (optional)" />
              </div>

              <div>
                <label className="label">Categories</label>
                <div className="flex flex-wrap gap-3">
                  {categories.map((cat) => {
                    const videoCount = videos.filter(v => v.category_ids && v.category_ids.includes(cat.id)).length;
                    return (
                    <label key={cat.id} className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] hover:border-[var(--border-hover)] cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategoryIds([...selectedCategoryIds, cat.id]);
                          } else {
                            setSelectedCategoryIds(selectedCategoryIds.filter(id => id !== cat.id));
                          }
                        }}
                        className="w-4 h-4 rounded border-[var(--border)] text-indigo focus:ring-indigo"
                      />
                      <span className="text-sm text-[var(--text-primary)]">{cat.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">({videoCount})</span>
                    </label>
                    );
                  })}
                  {categories.length === 0 && (
                    <p className="text-sm text-[var(--text-muted)]">No categories yet. Add one in the Categories tab.</p>
                  )}
                </div>
              </div>

              {formError && (
                <p className="error-message flex items-center gap-2" role="alert">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {formError}
                </p>
              )}

              {formSuccess && (
                <p className="text-green-400 text-sm flex items-center gap-2" role="status">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {formSuccess}
                </p>
              )}

              <div className="flex gap-4">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Video' : 'Add Video'}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                )}
              </div>
            </form>
          </div>
        )}

        {activeTab === 'editor' && <VideoEditor />}

        {/* Categories Management */}
        {activeTab === 'categories' && (
          <div className="glass-card-strong p-8 mb-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo/20 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              Manage Categories
            </h2>

            <form onSubmit={handleAddCategory} className="flex gap-3 mb-6">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="input-field flex-1"
                placeholder="New category name"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">Add Category</button>
            </form>

            {categoryError && (
              <p className="error-message mb-4">{categoryError}</p>
            )}
            {categorySuccess && (
              <p className="text-green-400 text-sm mb-4">{categorySuccess}</p>
            )}

            {categories.length === 0 ? (
              <p className="text-[var(--text-muted)] text-center py-8">No categories yet. Add one above.</p>
            ) : (
              <div className="space-y-2">
                {categories.map((cat) => {
                  const videoCount = videos.filter(v => v.category_ids && v.category_ids.includes(cat.id)).length;
                  return (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)]">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-indigo" />
                        <span className="font-medium text-[var(--text-primary)]">{cat.name}</span>
                        <span className="text-sm text-[var(--text-muted)]">{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-2 text-[var(--text-muted)] hover:text-coral hover:bg-coral/10 rounded-lg transition-all"
                        aria-label={`Delete ${cat.name}`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Existing Videos */}
        <div className="glass-card-strong p-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            Existing Videos ({videos.length})
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo border-t-transparent mx-auto" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--bg-surface)] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[var(--text-secondary)]">No videos added yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video) => (
                <div key={video.id} className="flex items-center justify-between p-4 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-[var(--bg-card)] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {video.drive_file_id ? (
                        <img
                          src={`https://drive.google.com/thumbnail?id=${video.drive_file_id}&sz=w96`}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-[var(--text-primary)] truncate">{video.title}</h3>
                      <p className="text-sm text-[var(--text-muted)] truncate">
                        {video.category_ids && video.category_ids.length > 0 && (
                          <span className="text-indigo">{video.category_ids.length} categor{video.category_ids.length === 1 ? 'y' : 'ies'}</span>
                        )}
                        {video.category_ids && video.category_ids.length > 0 && ' · '}
                        {new Date(video.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => handleEdit(video)}
                      className="p-2 text-[var(--text-muted)] hover:text-indigo hover:bg-indigo/10 rounded-lg transition-all"
                      aria-label={`Edit ${video.title}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(video.id)}
                      className="p-2 text-[var(--text-muted)] hover:text-coral hover:bg-coral/10 rounded-lg transition-all"
                      aria-label={`Delete ${video.title}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
