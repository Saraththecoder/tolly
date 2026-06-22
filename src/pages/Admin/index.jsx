import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { 
  Settings, 
  Tv, 
  Globe, 
  Calendar, 
  TrendingUp, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  AlertTriangle,
  Eye
} from 'lucide-react';

const getNextId = (list) => {
  const ids = (list || []).map(item => Number(item.id) || 0);
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dbData, setDbData] = useState(null);
  const [notification, setNotification] = useState(null);

  // Edit / Add States
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields State
  const [popupForm, setPopupForm] = useState({
    active: false,
    title: '',
    imageUrl: '',
    linkUrl: '',
    buttonText: ''
  });

  const [naForm, setNaForm] = useState({
    id: '',
    movieName: '',
    screens: '',
    status: 'Active',
    hourlyGross: '',
    premierGross: '',
    totalGross: '',
    lastUpdated: 'Just now',
    poster: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    id: '',
    movieName: '',
    language: 'Telugu',
    releaseDate: '',
    status: 'Confirmed'
  });

  const [top5Form, setTop5Form] = useState([
    { rank: 1, movieName: '', gross: '', verdict: 'Blockbuster', trend: '▲ Strong' },
    { rank: 2, movieName: '', gross: '', verdict: 'Hit', trend: '▼ Slowing' },
    { rank: 3, movieName: '', gross: '', verdict: 'Hit', trend: '▼ Declining' },
    { rank: 4, movieName: '', gross: '', verdict: 'Average', trend: '▼ Low' },
    { rank: 5, movieName: '', gross: '', verdict: 'New', trend: '▲ Awaited' }
  ]);

  const [scraperStatus, setScraperStatus] = useState('OFFLINE');
  const [scraperMode, setScraperMode] = useState('live');

  // Load Database from Express Backend
  const loadDb = async () => {
    const response = await axios.get('/api/db');
    return response.data;
  };

  useEffect(() => {
    loadDb()
      .then((data) => {
        setDbData(data);
        if (data.popupAd) setPopupForm(data.popupAd);
        if (data.boxOfficeTop5) setTop5Form(data.boxOfficeTop5);
      })
      .catch((err) => {
        console.error('Failed to load database from backend', err);
      });
    
    // Check scraper backend health
    axios.get('/api/health')
      .then(() => setScraperStatus('ONLINE'))
      .catch(() => setScraperStatus('OFFLINE'));

    // Read current mode from server
    axios.get('/api/settings')
      .then((res) => setScraperMode(res.data.scraperMode || 'live'))
      .catch(() => setScraperMode('live'));
  }, []);

  const handleToggleScraperMode = async (mode) => {
    try {
      await axios.post('/api/settings', { scraperMode: mode });
      setScraperMode(mode);
      window.dispatchEvent(new Event('tolly_db_change'));
      triggerNotification(`Data source switched to ${mode === 'live' ? 'Live Crawler' : 'Mock Database'}!`, 'info');
    } catch {
      triggerNotification('Failed to switch data source.', 'warning');
    }
  };

  const triggerNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // -------------------- Popup Ad Save --------------------
  const handleSavePopup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/popup-ad', popupForm);
      const updated = { ...dbData, popupAd: popupForm };
      setDbData(updated);
      window.dispatchEvent(new Event('tolly_db_change'));
      triggerNotification('Popup ad settings saved successfully!');
    } catch {
      triggerNotification('Failed to save popup ad settings.', 'warning');
    }
  };

  const handlePreviewAd = () => {
    // Dispatch a custom event with the ad data to trigger the modal immediately
    const event = new CustomEvent('tolly_ad_preview', { detail: { ad: popupForm } });
    window.dispatchEvent(event);
    triggerNotification('Popup preview triggered!', 'info');
  };

  // -------------------- North America Save / Edit / Delete --------------------
  const handleSaveNaItem = async (e) => {
    e.preventDefault();
    let updatedList = [...(dbData.northAmericaCollections || [])];

    if (editingId) {
      // Editing
      updatedList = updatedList.map(item => item.id === editingId ? { ...naForm, id: editingId } : item);
    } else {
      // Adding
      const newId = getNextId(updatedList);
      updatedList.push({ ...naForm, id: newId });
    }

    try {
      await axios.post('/api/north-america', updatedList);
      const updatedDb = { ...dbData, northAmericaCollections: updatedList };
      setDbData(updatedDb);
      window.dispatchEvent(new Event('tolly_db_change'));
      triggerNotification(editingId ? 'North America entry updated!' : 'New North America entry added!');
      resetNaForm();
    } catch {
      triggerNotification('Failed to save North America entry.', 'warning');
    }
  };

  const handleDeleteNaItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this collection entry?')) {
      const updatedList = (dbData.northAmericaCollections || []).filter(item => item.id !== id);
      try {
        await axios.post('/api/north-america', updatedList);
        const updatedDb = { ...dbData, northAmericaCollections: updatedList };
        setDbData(updatedDb);
        window.dispatchEvent(new Event('tolly_db_change'));
        triggerNotification('Collection entry deleted.', 'warning');
      } catch {
        triggerNotification('Failed to delete collection entry.', 'warning');
      }
    }
  };

  const startEditNa = (item) => {
    setEditingId(item.id);
    setNaForm(item);
    setShowAddForm(true);
  };

  const resetNaForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    setNaForm({
      id: '',
      movieName: '',
      screens: '',
      status: 'Active',
      hourlyGross: '',
      premierGross: '',
      totalGross: '',
      lastUpdated: 'Just now',
      poster: ''
    });
  };

  // -------------------- Upcoming Schedules Save / Edit / Delete --------------------
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    let updatedList = [...(dbData.upcomingSchedules || [])];

    if (editingId) {
      updatedList = updatedList.map(item => item.id === editingId ? { ...scheduleForm, id: editingId } : item);
    } else {
      const newId = getNextId(updatedList);
      updatedList.push({ ...scheduleForm, id: newId });
    }

    try {
      await axios.post('/api/schedules', updatedList);
      const updatedDb = { ...dbData, upcomingSchedules: updatedList };
      setDbData(updatedDb);
      window.dispatchEvent(new Event('tolly_db_change'));
      triggerNotification(editingId ? 'Schedule updated!' : 'New schedule added!');
      resetScheduleForm();
    } catch {
      triggerNotification('Failed to save schedule.', 'warning');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      const updatedList = (dbData.upcomingSchedules || []).filter(item => item.id !== id);
      try {
        await axios.post('/api/schedules', updatedList);
        const updatedDb = { ...dbData, upcomingSchedules: updatedList };
        setDbData(updatedDb);
        window.dispatchEvent(new Event('tolly_db_change'));
        triggerNotification('Schedule deleted.', 'warning');
      } catch {
        triggerNotification('Failed to delete schedule.', 'warning');
      }
    }
  };

  const startEditSchedule = (item) => {
    setEditingId(item.id);
    setScheduleForm(item);
    setShowAddForm(true);
  };

  const resetScheduleForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    setScheduleForm({
      id: '',
      movieName: '',
      language: 'Telugu',
      releaseDate: '',
      status: 'Confirmed'
    });
  };

  // -------------------- Box Office Top 5 Save --------------------
  const handleSaveTop5 = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/box-office-top5', top5Form);
      const updatedDb = { ...dbData, boxOfficeTop5: top5Form };
      setDbData(updatedDb);
      window.dispatchEvent(new Event('tolly_db_change'));
      triggerNotification('Box Office Top 5 updated successfully!');
    } catch {
      triggerNotification('Failed to update Box Office Top 5.', 'warning');
    }
  };

  const handleTop5FieldChange = (index, field, value) => {
    const updatedForm = [...top5Form];
    updatedForm[index] = { ...updatedForm[index], [field]: value };
    setTop5Form(updatedForm);
  };

  // -------------------- Reset DB --------------------
  const handleResetDb = async () => {
    if (window.confirm('WARNING: This will clear all admin customization and restore the default database. Continue?')) {
      try {
        const response = await axios.post('/api/db/reset');
        const data = response.data;
        setDbData(data);
        if (data.popupAd) setPopupForm(data.popupAd);
        if (data.boxOfficeTop5) setTop5Form(data.boxOfficeTop5);
        window.dispatchEvent(new Event('tolly_db_change'));
        triggerNotification('Database reset to static default seeds!', 'warning');
      } catch {
        triggerNotification('Failed to reset database.', 'warning');
      }
    }
  };

  if (!dbData) return <div className="text-center py-20 text-gray-400">Loading Database...</div>;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-6xl">
      <Helmet>
        <title>Admin Dashboard | CHITRAMBHALARE</title>
      </Helmet>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-red/20 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-gray-100 flex items-center gap-2">
            <Settings className="w-8 h-8 text-brand-red animate-spin-slow" />
            Portal Admin Center
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Configure dynamic content widgets, banner sliders, popup advertisements, and box office lists.
          </p>
        </div>
        <button 
          onClick={handleResetDb}
          className="bg-red-950/40 hover:bg-brand-red text-brand-red hover:text-white border border-brand-red/30 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Reset Database
        </button>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div className={`fixed bottom-5 right-5 z-[1000] p-4 rounded-xl shadow-2xl border transition-all duration-300 transform translate-y-0 flex items-center gap-3 font-semibold text-sm ${
          notification.type === 'success' ? 'bg-green-950/90 text-green-400 border-green-500/30' :
          notification.type === 'warning' ? 'bg-red-950/90 text-red-400 border-brand-red/30' :
          'bg-blue-950/90 text-blue-400 border-blue-500/30'
        }`}>
          <Check className="w-4 h-4" />
          {notification.message}
        </div>
      )}

      {/* Admin Tab Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-[25%] flex flex-col gap-1.5 shrink-0">
          <button
            onClick={() => { setActiveTab('overview'); resetNaForm(); resetScheduleForm(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'overview' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" /> Overview Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('popup'); resetNaForm(); resetScheduleForm(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'popup' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <Tv className="w-4 h-4" /> Popup Advertisements
          </button>
          <button
            onClick={() => { setActiveTab('north-america'); resetNaForm(); resetScheduleForm(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'north-america' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" /> North America Collections
          </button>
          <button
            onClick={() => { setActiveTab('schedules'); resetNaForm(); resetScheduleForm(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'schedules' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" /> Upcoming Schedules
          </button>
          <button
            onClick={() => { setActiveTab('top5'); resetNaForm(); resetScheduleForm(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'top5' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Box Office Top 5
          </button>
        </div>

        {/* Tab Content Display Area */}
        <div className="flex-1 bg-brand-gray border border-brand-red/10 rounded-2xl p-6 lg:p-8 min-w-0">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-poppins font-bold text-gray-200 border-b border-gray-800 pb-2">
                Overview &amp; Statistics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-brand-surface/40 p-5 rounded-xl border border-gray-800">
                  <div className="text-xs text-gray-400 uppercase font-bold tracking-wide">Popup Ad Status</div>
                  <div className="text-2xl font-poppins font-bold text-gray-200 mt-2 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${popupForm.active ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
                    {popupForm.active ? 'Active Overlay' : 'Disabled'}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 truncate">{popupForm.title}</div>
                </div>

                <div className="bg-brand-surface/40 p-5 rounded-xl border border-gray-800">
                  <div className="text-xs text-gray-400 uppercase font-bold tracking-wide">North America Movies</div>
                  <div className="text-2xl font-poppins font-bold text-yellow-500 mt-2">
                    {(dbData.northAmericaCollections || []).length} Films
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">Currently live tracking collections</div>
                </div>

                <div className="bg-brand-surface/40 p-5 rounded-xl border border-gray-800">
                  <div className="text-xs text-gray-400 uppercase font-bold tracking-wide">Upcoming Releases</div>
                  <div className="text-2xl font-poppins font-bold text-brand-red mt-2">
                    {(dbData.upcomingSchedules || []).length} Releases
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">Configured upcoming release dates</div>
                </div>
              </div>

              {/* Scraper Status Controls */}
              <div className="bg-brand-surface/30 p-6 rounded-xl border border-brand-red/10 space-y-4">
                <h3 className="text-lg font-poppins font-bold text-gray-200 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand-red" />
                  Live Crawler Backend Config
                </h3>
                <p className="text-xs text-gray-400">
                  Manage the data source for your news articles, reviews, and box office lists. Switch between live scraping tracktollywood.com or loading from your admin-configured database.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Crawler Server Status</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-3.5 h-3.5 rounded-full ${scraperStatus === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></span>
                        <span className={`text-sm font-bold uppercase tracking-wider ${scraperStatus === 'ONLINE' ? 'text-green-500' : 'text-red-500'}`}>
                          {scraperStatus}
                        </span>
                      </div>
                    </div>

                    <div className="border-l border-gray-800 pl-4">
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Active Data Source</div>
                      <div className="text-sm font-bold text-gray-200 mt-1 uppercase tracking-wide">
                        {scraperMode === 'live' ? '🌐 Live Crawler' : '💾 Mock Database'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleScraperMode('live')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        scraperMode === 'live' 
                          ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/15' 
                          : 'bg-brand-surface text-gray-400 border-gray-800 hover:text-gray-200'
                      }`}
                    >
                      Use Live Crawler
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleScraperMode('mock')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        scraperMode === 'mock' 
                          ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/15' 
                          : 'bg-brand-surface text-gray-400 border-gray-800 hover:text-gray-200'
                      }`}
                    >
                      Use Mock DB
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-brand-surface/20 rounded-xl border border-brand-red/10 p-5 mt-4">
                <h3 className="text-md font-poppins font-bold text-gray-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" /> Database Synchronization Notes
                </h3>
                <p className="text-gray-400 text-xs mt-2 leading-relaxed">
                  All adjustments in this administrator module are written instantly into the browser session database. Your client components automatically detect updates using custom event signals, allowing immediate rendering updates without full page reloads. To revert edits, click the "Reset Database" button.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: POPUP ADS */}
          {activeTab === 'popup' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <h2 className="text-xl font-poppins font-bold text-gray-200">
                  Manage Promo Popup Ads
                </h2>
                <button
                  type="button"
                  onClick={handlePreviewAd}
                  className="bg-brand-surface border border-brand-red/20 text-gray-300 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                  title="Trigger the ad modal immediately to preview it"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview Popup
                </button>
              </div>

              <form onSubmit={handleSavePopup} className="space-y-5">
                <div className="flex items-center gap-3 bg-[#18181B]/40 p-4 rounded-xl border border-gray-800">
                  <input
                    type="checkbox"
                    id="popupActive"
                    checked={popupForm.active}
                    onChange={(e) => setPopupForm({ ...popupForm, active: e.target.checked })}
                    className="w-4.5 h-4.5 accent-brand-red cursor-pointer"
                  />
                  <label htmlFor="popupActive" className="text-sm font-bold text-gray-200 cursor-pointer select-none">
                    Enable Promotional Announcement Modal Overlay on Page Load
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Announcement Title</label>
                    <input
                      type="text"
                      value={popupForm.title}
                      onChange={(e) => setPopupForm({ ...popupForm, title: e.target.value })}
                      className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-3 rounded-xl focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-sm"
                      placeholder="e.g. Peddi Success Meet Live Stream!"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Banner Image URL</label>
                    <input
                      type="url"
                      value={popupForm.imageUrl}
                      onChange={(e) => setPopupForm({ ...popupForm, imageUrl: e.target.value })}
                      className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-3 rounded-xl focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-sm"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Button Link URL</label>
                      <input
                        type="text"
                        value={popupForm.linkUrl}
                        onChange={(e) => setPopupForm({ ...popupForm, linkUrl: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-3 rounded-xl focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-sm"
                        placeholder="/movie-news/slug or custom URL"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Button Label Text</label>
                      <input
                        type="text"
                        value={popupForm.buttonText}
                        onChange={(e) => setPopupForm({ ...popupForm, buttonText: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-3 rounded-xl focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-sm"
                        placeholder="e.g. Watch Live, Read More"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="bg-brand-red hover:bg-brand-red/90 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(212,43,43,0.3)]"
                  >
                    Save Popup Configuration
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: NORTH AMERICA COLLECTIONS */}
          {activeTab === 'north-america' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <h2 className="text-xl font-poppins font-bold text-gray-200">
                  Manage USA &amp; Canada Box Office
                </h2>
                {!showAddForm && (
                  <button
                    onClick={() => { resetNaForm(); setShowAddForm(true); }}
                    className="bg-brand-red text-white hover:bg-brand-red/90 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(212,43,43,0.2)]"
                  >
                    <Plus className="w-4 h-4" /> Add Movie
                  </button>
                )}
              </div>

              {showAddForm ? (
                <form onSubmit={handleSaveNaItem} className="space-y-5 bg-[#18181B]/20 p-5 rounded-xl border border-gray-800">
                  <h3 className="font-poppins font-bold text-sm text-brand-red uppercase tracking-wider">
                    {editingId ? 'Edit Movie Details' : 'Add Movie to North America Panel'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Movie Title</label>
                      <input
                        type="text"
                        value={naForm.movieName}
                        onChange={(e) => setNaForm({ ...naForm, movieName: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. Vishwambhara"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Screens Count</label>
                      <input
                        type="text"
                        value={naForm.screens}
                        onChange={(e) => setNaForm({ ...naForm, screens: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. 450"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Hourly Live Gross</label>
                      <input
                        type="text"
                        value={naForm.hourlyGross}
                        onChange={(e) => setNaForm({ ...naForm, hourlyGross: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. $85K"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Premiere Gross</label>
                      <input
                        type="text"
                        value={naForm.premierGross}
                        onChange={(e) => setNaForm({ ...naForm, premierGross: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. $900K"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Total Gross</label>
                      <input
                        type="text"
                        value={naForm.totalGross}
                        onChange={(e) => setNaForm({ ...naForm, totalGross: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. $2.1M"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Tracking Status</label>
                      <select
                        value={naForm.status}
                        onChange={(e) => setNaForm({ ...naForm, status: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                      >
                        <option value="Active">Active</option>
                        <option value="Slowing">Slowing</option>
                        <option value="Rentals">Rentals</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Poster Image URL (optional)</label>
                      <input
                        type="url"
                        value={naForm.poster}
                        onChange={(e) => setNaForm({ ...naForm, poster: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="submit"
                      className="bg-brand-red text-white font-bold px-5 py-2.5 rounded-xl text-sm"
                    >
                      {editingId ? 'Update Movie' : 'Save Movie'}
                    </button>
                    <button
                      type="button"
                      onClick={resetNaForm}
                      className="bg-gray-800 text-gray-300 px-5 py-2.5 rounded-xl text-sm border border-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider font-bold">
                        <th className="pb-3">Movie</th>
                        <th className="pb-3">Hourly</th>
                        <th className="pb-3">Premiere</th>
                        <th className="pb-3">Total</th>
                        <th className="pb-3">Screens</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dbData.northAmericaCollections || []).map((item) => (
                        <tr key={item.id} className="border-b border-gray-800/40 hover:bg-white/5 transition-colors">
                          <td className="py-4 font-bold text-gray-200">{item.movieName}</td>
                          <td className="py-4 text-yellow-500 font-bold">{item.hourlyGross || '—'}</td>
                          <td className="py-4 text-gray-300">{item.premierGross || '—'}</td>
                          <td className="py-4 text-brand-red font-bold">{item.totalGross || '—'}</td>
                          <td className="py-4 text-gray-400">{item.screens || '—'}</td>
                          <td className="py-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEditNa(item)}
                                className="p-2 hover:bg-brand-surface rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteNaItem(item.id)}
                                className="p-2 hover:bg-red-950/20 rounded-lg text-gray-500 hover:text-brand-red transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(dbData.northAmericaCollections || []).length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center py-8 text-gray-500">
                            No films currently configured for North America collections.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: UPCOMING SCHEDULES */}
          {activeTab === 'schedules' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <h2 className="text-xl font-poppins font-bold text-gray-200">
                  Manage Upcoming Release Schedules
                </h2>
                {!showAddForm && (
                  <button
                    onClick={() => { resetScheduleForm(); setShowAddForm(true); }}
                    className="bg-brand-red text-white hover:bg-brand-red/90 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(212,43,43,0.2)]"
                  >
                    <Plus className="w-4 h-4" /> Add Schedule
                  </button>
                )}
              </div>

              {showAddForm ? (
                <form onSubmit={handleSaveSchedule} className="space-y-5 bg-[#18181B]/20 p-5 rounded-xl border border-gray-800">
                  <h3 className="font-poppins font-bold text-sm text-brand-red uppercase tracking-wider">
                    {editingId ? 'Edit Upcoming Release' : 'Add Upcoming Release Film'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Movie Title</label>
                      <input
                        type="text"
                        value={scheduleForm.movieName}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, movieName: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. Spirit"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Release Language / Type</label>
                      <input
                        type="text"
                        value={scheduleForm.language}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, language: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. Telugu, Re-Release"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Release Date (YYYY-MM-DD)</label>
                      <input
                        type="date"
                        value={scheduleForm.releaseDate}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, releaseDate: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Release Status Label</label>
                      <input
                        type="text"
                        value={scheduleForm.status}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. Confirmed, TBA, Summer 2027"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3">
                    <button
                      type="submit"
                      className="bg-brand-red text-white font-bold px-5 py-2.5 rounded-xl text-sm"
                    >
                      {editingId ? 'Update Schedule' : 'Save Schedule'}
                    </button>
                    <button
                      type="button"
                      onClick={resetScheduleForm}
                      className="bg-gray-800 text-gray-300 px-5 py-2.5 rounded-xl text-sm border border-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider font-bold">
                        <th className="pb-3">Movie</th>
                        <th className="pb-3">Language/Type</th>
                        <th className="pb-3">Release Date</th>
                        <th className="pb-3">Status Label</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dbData.upcomingSchedules || []).map((item) => (
                        <tr key={item.id} className="border-b border-gray-800/40 hover:bg-white/5 transition-colors">
                          <td className="py-4 font-bold text-gray-200">{item.movieName}</td>
                          <td className="py-4 text-gray-300">{item.language}</td>
                          <td className="py-4 text-gray-400">
                            {item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : 'TBA'}
                          </td>
                          <td className="py-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red bg-brand-red/10 px-2 py-0.5 rounded border border-brand-red/20">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEditSchedule(item)}
                                className="p-2 hover:bg-brand-surface rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSchedule(item.id)}
                                className="p-2 hover:bg-red-950/20 rounded-lg text-gray-500 hover:text-brand-red transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(dbData.upcomingSchedules || []).length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-gray-500">
                            No upcoming release schedules configured.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BOX OFFICE TOP 5 */}
          {activeTab === 'top5' && (
            <div className="space-y-6">
              <h2 className="text-xl font-poppins font-bold text-gray-200 border-b border-gray-800 pb-2">
                Configure Sidebar Box Office Top 5 Rankings
              </h2>

              <form onSubmit={handleSaveTop5} className="space-y-4">
                <div className="space-y-3.5">
                  {top5Form.map((item, index) => (
                    <div 
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-[#18181B]/30 border border-gray-800/80 rounded-xl items-center"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-poppins font-bold text-lg text-yellow-500 w-6 text-center">
                          #{index + 1}
                        </span>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rank</span>
                      </div>

                      <div className="flex flex-col gap-1 md:col-span-2">
                        <input
                          type="text"
                          value={item.movieName}
                          onChange={(e) => handleTop5FieldChange(index, 'movieName', e.target.value)}
                          className="bg-brand-surface border border-gray-800 text-gray-200 px-3 py-2 rounded-lg text-sm outline-none"
                          placeholder="Movie Name"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <input
                          type="text"
                          value={item.gross}
                          onChange={(e) => handleTop5FieldChange(index, 'gross', e.target.value)}
                          className="bg-brand-surface border border-gray-800 text-gray-200 px-3 py-2 rounded-lg text-sm outline-none"
                          placeholder="WW Gross (e.g. ₹320 Cr)"
                          required
                        />
                      </div>

                      <div className="flex gap-2">
                        <select
                          value={item.verdict}
                          onChange={(e) => handleTop5FieldChange(index, 'verdict', e.target.value)}
                          className="bg-brand-surface border border-gray-800 text-gray-200 px-2 py-2 rounded-lg text-xs outline-none flex-1"
                        >
                          <option value="Blockbuster">Blockbuster</option>
                          <option value="Hit">Hit</option>
                          <option value="Average">Average</option>
                          <option value="Flop">Flop</option>
                          <option value="New">New</option>
                          <option value="Running">Running</option>
                        </select>

                        <select
                          value={item.trend}
                          onChange={(e) => handleTop5FieldChange(index, 'trend', e.target.value)}
                          className="bg-brand-surface border border-gray-800 text-gray-200 px-2 py-2 rounded-lg text-xs outline-none flex-1 font-semibold"
                        >
                          <option value="▲ Strong">▲ Strong</option>
                          <option value="▲ Steady">▲ Steady</option>
                          <option value="▲ Awaited">▲ Awaited</option>
                          <option value="▼ Slowing">▼ Slowing</option>
                          <option value="▼ Declining">▼ Declining</option>
                          <option value="▼ Low">▼ Low</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="bg-brand-red hover:bg-brand-red/90 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(212,43,43,0.3)]"
                  >
                    Save Top 5 Rankings
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
