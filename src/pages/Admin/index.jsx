import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import ImageExtractor from '../ImageExtractor';
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
  Eye,
  Search,
  Image as ImageIcon,
  Loader2,
  X
} from 'lucide-react';

const getNextId = (list) => {
  const ids = (list || []).map(item => Number(item.id) || 0);
  return ids.length > 0 ? Math.max(...ids) + 1 : 1;
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dbData, setDbData] = useState(null);
  const [notification, setNotification] = useState(null);

  // Auth States
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [galleryForm, setGalleryForm] = useState({
    title: '',
    coverImage: '',
    images: [],
    date: ''
  });

  const [articleForm, setArticleForm] = useState({
    id: '',
    slug: '',
    title: '',
    excerpt: '',
    thumbnail: '',
    featuredImage: '',
    category: 'General',
    author: 'Aditya',
    tags: '',
    content: [],
    date: ''
  });

  const [reviewForm, setReviewForm] = useState({
    id: '',
    slug: '',
    movieName: '',
    poster: '',
    rating: '3.5',
    snippet: '',
    story: '',
    performances: '',
    technicalAspects: '',
    verdict: '',
    ottPlatform: 'Theatrical',
    ottReleaseDate: 'In Cinemas Now',
    date: ''
  });

  const [boxOfficeForm, setBoxOfficeForm] = useState({
    id: '',
    slug: '',
    movieName: '',
    director: '',
    cast: '',
    poster: '',
    dayCollection: '',
    worldwideGross: '',
    indiaNet: '',
    indiaGross: '',
    overseas: '',
    verdict: '',
    trend: '',
    days: '',
    languages: '',
    percentage: 0,
    budget: '',
    totalIndiaNet: '',
    usPremieres: '',
    dailyBreakdown: [],
    date: ''
  });

  // Image Extractor Modal trigger states
  const [isExtractorOpen, setIsExtractorOpen] = useState(false);
  const [extractorCallback, setExtractorCallback] = useState(null);

  const openExtractor = (callback) => {
    setExtractorCallback(() => callback);
    setIsExtractorOpen(true);
  };

  const [scraperStatus, setScraperStatus] = useState('OFFLINE');
  const [scraperMode, setScraperMode] = useState('live');


  // Load Database from Express Backend
  const loadDb = async () => {
    const response = await axios.get('/api/db');
    return response.data;
  };

  const checkAuth = async () => {
    // Only attempt silent re-auth if sessionStorage has a token
    const storedCode = sessionStorage.getItem('tolly_admin_passcode');
    if (!storedCode) {
      setIsAuthenticated(false);
      return;
    }

    try {
      // /api/db is already guarded by requireAdminPasscode — 401 if wrong, data if right
      const data = await loadDb();
      setDbData(data);
      if (data.popupAd) setPopupForm(data.popupAd);
      if (data.boxOfficeTop5) setTop5Form(data.boxOfficeTop5);
      setIsAuthenticated(true);

      axios.get('/api/health')
        .then(() => setScraperStatus('ONLINE'))
        .catch(() => setScraperStatus('OFFLINE'));

      axios.get('/api/settings')
        .then((res) => setScraperMode(res.data.scraperMode || 'live'))
        .catch(() => setScraperMode('live'));
    } catch (err) {
      // Bad or expired token — clear and show login
      sessionStorage.removeItem('tolly_admin_passcode');
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setIsSubmitting(true);
    setAuthError('');

    // Store in sessionStorage only (clears on tab close — no localStorage)
    sessionStorage.setItem('tolly_admin_passcode', passcode);

    try {
      // /api/db is already guarded — 401 on wrong passcode, data on right one
      const data = await loadDb();
      setDbData(data);
      if (data.popupAd) setPopupForm(data.popupAd);
      if (data.boxOfficeTop5) setTop5Form(data.boxOfficeTop5);
      setIsAuthenticated(true);

      axios.get('/api/health')
        .then(() => setScraperStatus('ONLINE'))
        .catch(() => setScraperStatus('OFFLINE'));

      axios.get('/api/settings')
        .then((res) => setScraperMode(res.data.scraperMode || 'live'))
        .catch(() => setScraperMode('live'));
    } catch (err) {
      console.error(err);
      setAuthError('Invalid passcode. Access Denied.');
      sessionStorage.removeItem('tolly_admin_passcode');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('tolly_admin_passcode');
    // Do NOT touch localStorage — it was never written to
    setIsAuthenticated(false);
    setDbData(null);
    setPasscode('');
  };

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

  const resetAllForms = () => {
    resetNaForm();
    resetScheduleForm();
    resetGalleryForm();
    resetArticleForm();
    resetReviewForm();
    resetBoxOfficeForm();
  };

  // -------------------- Exclusive Galleries Save / Edit / Delete --------------------
  const handleSaveGallery = async (e) => {
    e.preventDefault();
    let updatedList = [...(dbData.galleries || [])];
    if (editingId) {
      updatedList = updatedList.map(item => item.id === editingId ? { ...galleryForm, id: editingId } : item);
    } else {
      const newId = getNextId(updatedList);
      updatedList.push({ ...galleryForm, id: newId });
    }
    try {
      const response = await axios.post('/api/galleries', updatedList);
      const updatedDb = { ...dbData, galleries: response.data.galleries || updatedList };
      setDbData(updatedDb);
      window.dispatchEvent(new Event('tolly_db_change'));
      triggerNotification(editingId ? 'Gallery updated!' : 'New gallery added!');
      resetGalleryForm();
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to save gallery.', 'warning');
    }
  };

  const handleDeleteGallery = async (id) => {
    if (window.confirm('Are you sure you want to delete this gallery?')) {
      const updatedList = (dbData.galleries || []).filter(item => item.id !== id);
      try {
        await axios.post('/api/galleries', updatedList);
        const updatedDb = { ...dbData, galleries: updatedList };
        setDbData(updatedDb);
        window.dispatchEvent(new Event('tolly_db_change'));
        triggerNotification('Gallery deleted.', 'warning');
      } catch (err) {
        console.error(err);
        triggerNotification('Failed to delete gallery.', 'warning');
      }
    }
  };

  const startEditGallery = (item) => {
    setEditingId(item.id);
    setGalleryForm(item);
    setShowAddForm(true);
  };

  const resetGalleryForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    setGalleryForm({
      title: '',
      coverImage: '',
      images: [],
      date: new Date().toISOString()
    });
  };

  const handleAddImageToGalleryForm = () => {
    setGalleryForm(prev => ({
      ...prev,
      images: [...(prev.images || []), { url: '', caption: '' }]
    }));
  };

  const handleRemoveImageFromGalleryForm = (index) => {
    setGalleryForm(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleGalleryImageChange = (index, field, value) => {
    setGalleryForm(prev => {
      const updatedImages = [...(prev.images || [])];
      updatedImages[index] = { ...updatedImages[index], [field]: value };
      return { ...prev, images: updatedImages };
    });
  };

  // -------------------- Articles Save / Edit / Delete --------------------
  const handleSaveArticle = async (e) => {
    e.preventDefault();
    let updatedList = [...(dbData.articles || [])];
    const tagsArray = typeof articleForm.tags === 'string'
      ? articleForm.tags.split(',').map(t => t.trim()).filter(Boolean)
      : (articleForm.tags || []);
    
    const preparedForm = {
      ...articleForm,
      tags: tagsArray,
      id: articleForm.id || String(getNextId(updatedList))
    };

    if (editingId) {
      updatedList = updatedList.map(item => item.id === editingId ? preparedForm : item);
    } else {
      updatedList.push(preparedForm);
    }

    try {
      const response = await axios.post('/api/articles', updatedList);
      const updatedDb = { ...dbData, articles: response.data.articles || updatedList };
      setDbData(updatedDb);
      window.dispatchEvent(new Event('tolly_db_change'));
      triggerNotification(editingId ? 'Article updated!' : 'New article added!');
      resetArticleForm();
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to save article.', 'warning');
    }
  };

  const handleDeleteArticle = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      const updatedList = (dbData.articles || []).filter(item => item.id !== id);
      try {
        await axios.post('/api/articles', updatedList);
        const updatedDb = { ...dbData, articles: updatedList };
        setDbData(updatedDb);
        window.dispatchEvent(new Event('tolly_db_change'));
        triggerNotification('Article deleted.', 'warning');
      } catch (err) {
        console.error(err);
        triggerNotification('Failed to delete article.', 'warning');
      }
    }
  };

  const startEditArticle = (item) => {
    setEditingId(item.id);
    setArticleForm({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : (item.tags || '')
    });
    setShowAddForm(true);
  };

  const resetArticleForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    setArticleForm({
      id: '',
      slug: '',
      title: '',
      excerpt: '',
      thumbnail: '',
      featuredImage: '',
      category: 'General',
      author: 'Aditya',
      tags: '',
      content: [],
      date: new Date().toISOString()
    });
  };

  const handleAddBlockToArticleForm = (type) => {
    setArticleForm(prev => ({
      ...prev,
      content: [...(prev.content || []), { type, value: '' }]
    }));
  };

  const handleRemoveBlockFromArticleForm = (index) => {
    setArticleForm(prev => ({
      ...prev,
      content: (prev.content || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleArticleBlockChange = (index, value) => {
    setArticleForm(prev => {
      const updatedContent = [...(prev.content || [])];
      updatedContent[index] = { ...updatedContent[index], value };
      return { ...prev, content: updatedContent };
    });
  };

  // -------------------- Reviews Save / Edit / Delete --------------------
  const handleSaveReview = async (e) => {
    e.preventDefault();
    let updatedList = [...(dbData.reviews || [])];
    const preparedForm = {
      ...reviewForm,
      id: reviewForm.id || String(getNextId(updatedList))
    };

    if (editingId) {
      updatedList = updatedList.map(item => item.id === editingId ? preparedForm : item);
    } else {
      updatedList.push(preparedForm);
    }

    try {
      const response = await axios.post('/api/reviews', updatedList);
      const updatedDb = { ...dbData, reviews: response.data.reviews || updatedList };
      setDbData(updatedDb);
      window.dispatchEvent(new Event('tolly_db_change'));
      triggerNotification(editingId ? 'Review updated!' : 'New review added!');
      resetReviewForm();
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to save review.', 'warning');
    }
  };

  const handleDeleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      const updatedList = (dbData.reviews || []).filter(item => item.id !== id);
      try {
        await axios.post('/api/reviews', updatedList);
        const updatedDb = { ...dbData, reviews: updatedList };
        setDbData(updatedDb);
        window.dispatchEvent(new Event('tolly_db_change'));
        triggerNotification('Review deleted.', 'warning');
      } catch (err) {
        console.error(err);
        triggerNotification('Failed to delete review.', 'warning');
      }
    }
  };

  const startEditReview = (item) => {
    setEditingId(item.id);
    setReviewForm(item);
    setShowAddForm(true);
  };

  const resetReviewForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    setReviewForm({
      id: '',
      slug: '',
      movieName: '',
      poster: '',
      rating: '3.5',
      snippet: '',
      story: '',
      performances: '',
      technicalAspects: '',
      verdict: '',
      ottPlatform: 'Theatrical',
      ottReleaseDate: 'In Cinemas Now',
      date: new Date().toISOString()
    });
  };

  // -------------------- Box Office Reports Save / Edit / Delete --------------------
  const handleSaveBoxOfficeItem = async (e) => {
    e.preventDefault();
    let updatedList = [...(dbData.boxOffice || [])];
    const preparedForm = {
      ...boxOfficeForm,
      id: boxOfficeForm.id || String(getNextId(updatedList))
    };

    if (editingId) {
      updatedList = updatedList.map(item => item.id === editingId ? preparedForm : item);
    } else {
      updatedList.push(preparedForm);
    }

    try {
      const response = await axios.post('/api/box-office', updatedList);
      const updatedDb = { ...dbData, boxOffice: response.data.boxOffice || updatedList };
      setDbData(updatedDb);
      window.dispatchEvent(new Event('tolly_db_change'));
      triggerNotification(editingId ? 'Box Office report updated!' : 'New Box Office report added!');
      resetBoxOfficeForm();
    } catch (err) {
      console.error(err);
      triggerNotification('Failed to save Box Office report.', 'warning');
    }
  };

  const handleDeleteBoxOfficeItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this box office report?')) {
      const updatedList = (dbData.boxOffice || []).filter(item => item.id !== id);
      try {
        await axios.post('/api/box-office', updatedList);
        const updatedDb = { ...dbData, boxOffice: updatedList };
        setDbData(updatedDb);
        window.dispatchEvent(new Event('tolly_db_change'));
        triggerNotification('Box Office report deleted.', 'warning');
      } catch (err) {
        console.error(err);
        triggerNotification('Failed to delete Box Office report.', 'warning');
      }
    }
  };

  const startEditBoxOffice = (item) => {
    setEditingId(item.id);
    setBoxOfficeForm(item);
    setShowAddForm(true);
  };

  const resetBoxOfficeForm = () => {
    setEditingId(null);
    setShowAddForm(false);
    setBoxOfficeForm({
      id: '',
      slug: '',
      movieName: '',
      director: '',
      cast: '',
      poster: '',
      dayCollection: '',
      worldwideGross: '',
      indiaNet: '',
      indiaGross: '',
      overseas: '',
      verdict: '',
      trend: '',
      days: '',
      languages: '',
      percentage: 0,
      budget: '',
      totalIndiaNet: '',
      usPremieres: '',
      dailyBreakdown: [],
      date: new Date().toISOString()
    });
  };

  const handleAddDailyBreakdownRow = () => {
    setBoxOfficeForm(prev => ({
      ...prev,
      dailyBreakdown: [...(prev.dailyBreakdown || []), { day: `Day ${ (prev.dailyBreakdown || []).length + 1 }`, gross: '' }]
    }));
  };

  const handleRemoveDailyBreakdownRow = (index) => {
    setBoxOfficeForm(prev => ({
      ...prev,
      dailyBreakdown: (prev.dailyBreakdown || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleDailyBreakdownChange = (index, field, value) => {
    setBoxOfficeForm(prev => {
      const updatedBreakdown = [...(prev.dailyBreakdown || [])];
      updatedBreakdown[index] = { ...updatedBreakdown[index], [field]: value };
      return { ...prev, dailyBreakdown: updatedBreakdown };
    });
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <Helmet>
          <title>Admin Access | CHITRAMBHALARE</title>
        </Helmet>
        
        <div className="w-full max-w-md bg-[#131a2b]/80 backdrop-blur-xl border border-brand-red/20 p-8 rounded-2xl shadow-[0_20px_50px_rgba(212,43,43,0.2)] text-center relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-red/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col items-center mb-6 relative">
            <div className="w-16 h-16 bg-brand-red/10 border border-brand-red/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(212,43,43,0.25)]">
              <Settings className="w-8 h-8 text-brand-red animate-spin-slow" />
            </div>
            <h1 className="text-3xl font-poppins font-bold text-gray-100 mb-2">Portal Security</h1>
            <p className="text-gray-400 text-sm">Please verify the administrator passcode to access configurations.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5 relative">
            {authError && (
              <div className="bg-red-950/40 border border-brand-red/30 text-brand-red text-sm font-semibold p-3.5 rounded-xl flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                {authError}
              </div>
            )}
            
            <div className="flex flex-col text-left gap-2">
              <label htmlFor="adminPasscode" className="text-xs text-gray-400 font-bold uppercase tracking-wider pl-1">Passcode</label>
              <input
                id="adminPasscode"
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-brand-surface border border-gray-800 text-gray-100 px-5 py-3.5 rounded-xl focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none text-base tracking-widest text-center"
                placeholder="••••••••"
                required
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-red hover:bg-brand-red/90 text-white font-bold py-3.5 rounded-xl text-base transition-all shadow-[0_0_20px_rgba(212,43,43,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Verifying...' : 'Authorize Console'}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center gap-3.5 w-full md:w-auto">
          <button 
            onClick={handleResetDb}
            className="bg-red-950/40 hover:bg-brand-red text-brand-red hover:text-white border border-brand-red/30 px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all flex-grow md:flex-grow-0 justify-center"
          >
            <RotateCcw className="w-4 h-4" /> Reset Database
          </button>
          <button 
            onClick={handleLogout}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex-grow md:flex-grow-0 text-center"
          >
            Sign Out
          </button>
        </div>
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
            onClick={() => { setActiveTab('overview'); resetAllForms(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'overview' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <Settings className="w-4 h-4" /> Overview Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('popup'); resetAllForms(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'popup' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <Tv className="w-4 h-4" /> Popup Advertisements
          </button>
          <button
            onClick={() => { setActiveTab('north-america'); resetAllForms(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'north-america' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" /> North America Collections
          </button>
          <button
            onClick={() => { setActiveTab('schedules'); resetAllForms(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'schedules' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" /> Upcoming Schedules
          </button>
          <button
            onClick={() => { setActiveTab('top5'); resetAllForms(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'top5' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Box Office Top 5
          </button>
          <button
            onClick={() => { setActiveTab('galleries'); resetAllForms(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'galleries' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Exclusive Galleries
          </button>
          <button
            onClick={() => { setActiveTab('articles'); resetAllForms(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'articles' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <Tv className="w-4 h-4" /> Latest Movie News
          </button>
          <button
            onClick={() => { setActiveTab('reviews'); resetAllForms(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'reviews' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" /> Detailed Reviews
          </button>
          <button
            onClick={() => { setActiveTab('box-office'); resetAllForms(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'box-office' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Box Office Reports
          </button>
          <button
            onClick={() => { setActiveTab('extractor-tool'); resetAllForms(); }}
            className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
              activeTab === 'extractor-tool' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'bg-brand-gray text-gray-400 hover:bg-brand-surface hover:text-gray-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" /> Image Extractor Tool
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
                  Manage the data source for your news articles, reviews, and box office lists. Switch between live crawling or loading from your admin-configured database.
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
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={popupForm.imageUrl}
                        onChange={(e) => setPopupForm({ ...popupForm, imageUrl: e.target.value })}
                        className="flex-grow bg-brand-surface border border-gray-800 text-gray-200 px-4 py-3 rounded-xl focus:border-brand-red outline-none text-sm"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        onClick={() => openExtractor((url) => setPopupForm(prev => ({ ...prev, imageUrl: url })))}
                        className="bg-brand-surface border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white px-4 py-3 rounded-xl text-xs font-bold transition-all shrink-0"
                      >
                        Extract
                      </button>
                    </div>
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
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={naForm.poster}
                          onChange={(e) => setNaForm({ ...naForm, poster: e.target.value })}
                          className="flex-grow bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                          placeholder="https://..."
                        />
                        <button
                          type="button"
                          onClick={() => openExtractor((url) => setNaForm(prev => ({ ...prev, poster: url })))}
                          className="bg-brand-surface border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0"
                        >
                          Extract
                        </button>
                      </div>
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

          {/* TAB 6: EXCLUSIVE GALLERIES */}
          {activeTab === 'galleries' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <h2 className="text-xl font-poppins font-bold text-gray-200">
                  Manage Exclusive Photo Galleries
                </h2>
                {!showAddForm && (
                  <button
                    onClick={() => { resetGalleryForm(); setShowAddForm(true); }}
                    className="bg-brand-red text-white hover:bg-brand-red/90 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(212,43,43,0.2)]"
                  >
                    <Plus className="w-4 h-4" /> Add Gallery
                  </button>
                )}
              </div>

              {showAddForm ? (
                <form onSubmit={handleSaveGallery} className="space-y-5 bg-[#18181B]/20 p-5 rounded-xl border border-gray-800">
                  <h3 className="font-poppins font-bold text-sm text-brand-red uppercase tracking-wider">
                    {editingId ? 'Edit Gallery Details' : 'Create New Photo Gallery'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Gallery Title</label>
                      <input
                        type="text"
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. Game Changer Set Stills"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Cover Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={galleryForm.coverImage}
                          onChange={(e) => setGalleryForm({ ...galleryForm, coverImage: e.target.value })}
                          className="flex-grow bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                          placeholder="https://..."
                          required
                        />
                        <button
                          type="button"
                          onClick={() => openExtractor((url) => setGalleryForm(prev => ({ ...prev, coverImage: url })))}
                          className="bg-brand-surface border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0"
                        >
                          Extract
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Images List */}
                  <div className="space-y-3.5 border-t border-gray-800 pt-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Gallery Images Collection</label>
                      <button
                        type="button"
                        onClick={handleAddImageToGalleryForm}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-gray-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Image Slide
                      </button>
                    </div>

                    {(galleryForm.images || []).map((img, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-3 p-3.5 bg-[#18181B]/40 border border-gray-850 rounded-xl items-center relative">
                        <span className="text-xs text-gray-500 font-bold">Slide #{idx + 1}</span>
                        
                        <div className="flex-1 w-full flex flex-col gap-1 md:col-span-2">
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={img.url}
                              onChange={(e) => handleGalleryImageChange(idx, 'url', e.target.value)}
                              className="flex-grow bg-brand-surface border border-gray-800 text-gray-200 px-3 py-2 rounded-lg text-xs outline-none"
                              placeholder="Image URL"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => openExtractor((url) => handleGalleryImageChange(idx, 'url', url))}
                              className="bg-brand-surface border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white px-3 py-2 rounded-xl text-[10px] font-bold transition-all shrink-0"
                            >
                              Extract
                            </button>
                          </div>
                        </div>

                        <div className="flex-grow w-full">
                          <input
                            type="text"
                            value={img.caption}
                            onChange={(e) => handleGalleryImageChange(idx, 'caption', e.target.value)}
                            className="w-full bg-brand-surface border border-gray-800 text-gray-200 px-3 py-2 rounded-lg text-xs outline-none"
                            placeholder="Caption (optional)"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveImageFromGalleryForm(idx)}
                          className="p-2 hover:bg-red-950/20 text-gray-500 hover:text-brand-red rounded-lg transition-colors shrink-0"
                          title="Remove Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {(galleryForm.images || []).length === 0 && (
                      <div className="text-center py-6 border border-dashed border-gray-800 rounded-xl text-gray-500 text-xs">
                        No images added in this gallery yet. Click "Add Image Slide" to insert items.
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-gray-800">
                    <button
                      type="submit"
                      className="bg-brand-red text-white font-bold px-5 py-2.5 rounded-xl text-sm"
                    >
                      {editingId ? 'Update Gallery' : 'Save Gallery'}
                    </button>
                    <button
                      type="button"
                      onClick={resetGalleryForm}
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
                        <th className="pb-3">Cover</th>
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Images Count</th>
                        <th className="pb-3">Created Date</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dbData.galleries || []).map((item) => (
                        <tr key={item.id} className="border-b border-gray-800/40 hover:bg-white/5 transition-colors">
                          <td className="py-3">
                            <img 
                              src={item.coverImage} 
                              alt={item.title} 
                              className="w-16 h-10 object-cover rounded-lg border border-gray-800"
                            />
                          </td>
                          <td className="py-3 font-bold text-gray-200">{item.title}</td>
                          <td className="py-3 text-yellow-500 font-bold">
                            {(item.images || []).length} Stills
                          </td>
                          <td className="py-3 text-gray-400">
                            {item.date ? new Date(item.date).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEditGallery(item)}
                                className="p-2 hover:bg-brand-surface rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteGallery(item.id)}
                                className="p-2 hover:bg-red-950/20 rounded-lg text-gray-500 hover:text-brand-red transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(dbData.galleries || []).length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-8 text-gray-500">
                            No exclusive galleries configured yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: LATEST MOVIE NEWS (ARTICLES) */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <h2 className="text-xl font-poppins font-bold text-gray-200">
                  Manage Latest Movie News &amp; Articles
                </h2>
                {!showAddForm && (
                  <button
                    onClick={() => { resetArticleForm(); setShowAddForm(true); }}
                    className="bg-brand-red text-white hover:bg-brand-red/90 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(212,43,43,0.2)]"
                  >
                    <Plus className="w-4 h-4" /> Add Article
                  </button>
                )}
              </div>

              {showAddForm ? (
                <form onSubmit={handleSaveArticle} className="space-y-5 bg-[#18181B]/20 p-5 rounded-xl border border-gray-800">
                  <h3 className="font-poppins font-bold text-sm text-brand-red uppercase tracking-wider">
                    {editingId ? 'Edit Article Details' : 'Compose News Article'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Article Title</label>
                      <input
                        type="text"
                        value={articleForm.title}
                        onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. Mythri Movie Makers sign Prashanth Neel"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">URL Slug (unique-dashed-string)</label>
                      <input
                        type="text"
                        value={articleForm.slug}
                        onChange={(e) => setArticleForm({ ...articleForm, slug: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. mythri-signs-prashanth-neel"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Category</label>
                      <select
                        value={articleForm.category}
                        onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                      >
                        <option value="General">General</option>
                        <option value="News">News</option>
                        <option value="OTT">OTT</option>
                        <option value="Casting">Casting</option>
                        <option value="Production">Production</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Author</label>
                      <input
                        type="text"
                        value={articleForm.author}
                        onChange={(e) => setArticleForm({ ...articleForm, author: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="Aditya"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={articleForm.tags}
                        onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="Mythri, Trending, OTT"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 font-bold">Excerpt Summary</label>
                    <textarea
                      value={articleForm.excerpt}
                      onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                      className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm h-20"
                      placeholder="Short one or two sentence summary..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Thumbnail Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={articleForm.thumbnail}
                          onChange={(e) => setArticleForm({ ...articleForm, thumbnail: e.target.value })}
                          className="flex-grow bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                          placeholder="https://..."
                          required
                        />
                        <button
                          type="button"
                          onClick={() => openExtractor((url) => setArticleForm(prev => ({ ...prev, thumbnail: url })))}
                          className="bg-brand-surface border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0"
                        >
                          Extract
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Featured Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={articleForm.featuredImage}
                          onChange={(e) => setArticleForm({ ...articleForm, featuredImage: e.target.value })}
                          className="flex-grow bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                          placeholder="https://..."
                          required
                        />
                        <button
                          type="button"
                          onClick={() => openExtractor((url) => setArticleForm(prev => ({ ...prev, featuredImage: url })))}
                          className="bg-brand-surface border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0"
                        >
                          Extract
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Article Block Editor */}
                  <div className="space-y-4 border-t border-gray-800 pt-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Article Content Blocks</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddBlockToArticleForm('paragraph')}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-gray-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Paragraph Block
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddBlockToArticleForm('image')}
                          className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-gray-700 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Image Block
                        </button>
                      </div>
                    </div>

                    {(articleForm.content || []).map((block, idx) => (
                      <div key={idx} className="flex flex-col gap-2.5 p-4 bg-[#18181B]/40 border border-gray-850 rounded-xl relative">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red">
                            Block #{idx + 1} - {block.type === 'paragraph' ? '📝 Paragraph text' : '🖼️ Image frame'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBlockFromArticleForm(idx)}
                            className="p-1.5 hover:bg-red-950/20 text-gray-500 hover:text-brand-red rounded-lg transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {block.type === 'paragraph' ? (
                          <textarea
                            value={block.value}
                            onChange={(e) => handleArticleBlockChange(idx, e.target.value)}
                            className="w-full bg-brand-surface border border-gray-800 text-gray-200 px-3.5 py-2.5 rounded-xl outline-none text-xs h-24 leading-relaxed"
                            placeholder="Type paragraph text details..."
                            required
                          />
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="url"
                              value={block.value}
                              onChange={(e) => handleArticleBlockChange(idx, e.target.value)}
                              className="flex-grow bg-brand-surface border border-gray-800 text-gray-200 px-3 py-2 rounded-xl outline-none text-xs"
                              placeholder="Image block URL"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => openExtractor((url) => handleArticleBlockChange(idx, url))}
                              className="bg-brand-surface border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white px-3.5 py-2 rounded-xl text-[10px] font-bold transition-all shrink-0"
                            >
                              Extract
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {(articleForm.content || []).length === 0 && (
                      <div className="text-center py-6 border border-dashed border-gray-800 rounded-xl text-gray-500 text-xs">
                        No content blocks. Create Paragraph or Image blocks to build the article.
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-gray-800">
                    <button
                      type="submit"
                      className="bg-brand-red text-white font-bold px-5 py-2.5 rounded-xl text-sm"
                    >
                      {editingId ? 'Update Article' : 'Publish Article'}
                    </button>
                    <button
                      type="button"
                      onClick={resetArticleForm}
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
                        <th className="pb-3">Thumbnail</th>
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Author</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dbData.articles || []).map((item) => (
                        <tr key={item.id} className="border-b border-gray-800/40 hover:bg-white/5 transition-colors">
                          <td className="py-3">
                            <img 
                              src={item.thumbnail} 
                              alt={item.title} 
                              className="w-14 h-9 object-cover rounded-lg border border-gray-800"
                            />
                          </td>
                          <td className="py-3 font-bold text-gray-200 max-w-xs truncate">{item.title}</td>
                          <td className="py-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 text-gray-300">{item.author || '—'}</td>
                          <td className="py-3 text-gray-400">
                            {item.date ? new Date(item.date).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEditArticle(item)}
                                className="p-2 hover:bg-brand-surface rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(item.id)}
                                className="p-2 hover:bg-red-950/20 rounded-lg text-gray-500 hover:text-brand-red transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(dbData.articles || []).length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-gray-500">
                            No news articles configured yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: DETAILED REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <h2 className="text-xl font-poppins font-bold text-gray-200">
                  Manage Detailed Movie Reviews
                </h2>
                {!showAddForm && (
                  <button
                    onClick={() => { resetReviewForm(); setShowAddForm(true); }}
                    className="bg-brand-red text-white hover:bg-brand-red/90 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(212,43,43,0.2)]"
                  >
                    <Plus className="w-4 h-4" /> Add Review
                  </button>
                )}
              </div>

              {showAddForm ? (
                <form onSubmit={handleSaveReview} className="space-y-5 bg-[#18181B]/20 p-5 rounded-xl border border-gray-800">
                  <h3 className="font-poppins font-bold text-sm text-brand-red uppercase tracking-wider">
                    {editingId ? 'Edit Review Details' : 'Write Movie Review'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Movie Name</label>
                      <input
                        type="text"
                        value={reviewForm.movieName}
                        onChange={(e) => setReviewForm({ ...reviewForm, movieName: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. Devara"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">URL Slug (dashed-lowercase)</label>
                      <input
                        type="text"
                        value={reviewForm.slug}
                        onChange={(e) => setReviewForm({ ...reviewForm, slug: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. devara-movie-review"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Poster Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={reviewForm.poster}
                          onChange={(e) => setReviewForm({ ...reviewForm, poster: e.target.value })}
                          className="flex-grow bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                          placeholder="https://..."
                          required
                        />
                        <button
                          type="button"
                          onClick={() => openExtractor((url) => setReviewForm(prev => ({ ...prev, poster: url })))}
                          className="bg-brand-surface border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0"
                        >
                          Extract
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Rating (out of 5)</label>
                      <select
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                      >
                        <option value="5.0">5.0 (Classic)</option>
                        <option value="4.5">4.5 (Excellent)</option>
                        <option value="4.0">4.0 (Very Good)</option>
                        <option value="3.5">3.5 (Good)</option>
                        <option value="3.0">3.0 (Average)</option>
                        <option value="2.5">2.5 (Below Average)</option>
                        <option value="2.0">2.0 (Poor)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Verdict Summary Label</label>
                      <select
                        value={reviewForm.verdict}
                        onChange={(e) => setReviewForm({ ...reviewForm, verdict: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                      >
                        <option value="Blockbuster">Blockbuster</option>
                        <option value="Hit">Hit</option>
                        <option value="Average">Average</option>
                        <option value="Flop">Flop</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 font-bold">Review Snippet</label>
                    <textarea
                      value={reviewForm.snippet}
                      onChange={(e) => setReviewForm({ ...reviewForm, snippet: e.target.value })}
                      className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm h-16"
                      placeholder="Catchy review summary snippet..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Story &amp; Concept</label>
                      <textarea
                        value={reviewForm.story}
                        onChange={(e) => setReviewForm({ ...reviewForm, story: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm h-28"
                        placeholder="Describe movie story and core concept..."
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Cast Performances</label>
                      <textarea
                        value={reviewForm.performances}
                        onChange={(e) => setReviewForm({ ...reviewForm, performances: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm h-28"
                        placeholder="Performance reviews for key actors..."
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-gray-400 font-bold">Technical Aspects (Cinematography, VFX, Music)</label>
                    <textarea
                      value={reviewForm.technicalAspects}
                      onChange={(e) => setReviewForm({ ...reviewForm, technicalAspects: e.target.value })}
                      className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm h-20"
                      placeholder="Cinematography, VFX, score details..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-850 pt-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">OTT Partner Platform</label>
                      <input
                        type="text"
                        value={reviewForm.ottPlatform}
                        onChange={(e) => setReviewForm({ ...reviewForm, ottPlatform: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. Netflix, Amazon Prime, Theatrical"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">OTT Release Date</label>
                      <input
                        type="text"
                        value={reviewForm.ottReleaseDate}
                        onChange={(e) => setReviewForm({ ...reviewForm, ottReleaseDate: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. June 30, 2026 or In Cinemas"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-gray-800">
                    <button
                      type="submit"
                      className="bg-brand-red text-white font-bold px-5 py-2.5 rounded-xl text-sm"
                    >
                      {editingId ? 'Update Review' : 'Save Review'}
                    </button>
                    <button
                      type="button"
                      onClick={resetReviewForm}
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
                        <th className="pb-3">Poster</th>
                        <th className="pb-3">Movie</th>
                        <th className="pb-3">Rating</th>
                        <th className="pb-3">Verdict</th>
                        <th className="pb-3">OTT platform</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dbData.reviews || []).map((item) => (
                        <tr key={item.id} className="border-b border-gray-800/40 hover:bg-white/5 transition-colors">
                          <td className="py-3">
                            <img 
                              src={item.poster} 
                              alt={item.movieName} 
                              className="w-12 h-14 object-cover rounded-lg border border-gray-800"
                            />
                          </td>
                          <td className="py-3 font-bold text-gray-200">{item.movieName}</td>
                          <td className="py-3 text-yellow-500 font-bold">
                            ⭐ {item.rating} / 5
                          </td>
                          <td className="py-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red bg-brand-red/10 px-2 py-0.5 rounded border border-brand-red/20">
                              {item.verdict}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400">
                            {item.ottPlatform} ({item.ottReleaseDate || 'TBA'})
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEditReview(item)}
                                className="p-2 hover:bg-brand-surface rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(item.id)}
                                className="p-2 hover:bg-red-950/20 rounded-lg text-gray-500 hover:text-brand-red transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(dbData.reviews || []).length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-gray-500">
                            No reviews configured yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: DETAILED BOX OFFICE REPORTS */}
          {activeTab === 'box-office' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <h2 className="text-xl font-poppins font-bold text-gray-200">
                  Manage Detailed Box Office Reports
                </h2>
                {!showAddForm && (
                  <button
                    onClick={() => { resetBoxOfficeForm(); setShowAddForm(true); }}
                    className="bg-brand-red text-white hover:bg-brand-red/90 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(212,43,43,0.2)]"
                  >
                    <Plus className="w-4 h-4" /> Add Report
                  </button>
                )}
              </div>

              {showAddForm ? (
                <form onSubmit={handleSaveBoxOfficeItem} className="space-y-5 bg-[#18181B]/20 p-5 rounded-xl border border-gray-800">
                  <h3 className="font-poppins font-bold text-sm text-brand-red uppercase tracking-wider">
                    {editingId ? 'Edit Box Office Report' : 'Create Box Office Report'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Movie Name</label>
                      <input
                        type="text"
                        value={boxOfficeForm.movieName}
                        onChange={(e) => setBoxOfficeForm({ ...boxOfficeForm, movieName: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. Kalki 2898 AD"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">URL Slug (dashed-lowercase)</label>
                      <input
                        type="text"
                        value={boxOfficeForm.slug}
                        onChange={(e) => setBoxOfficeForm({ ...boxOfficeForm, slug: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. kalki-box-office-report"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Director</label>
                      <input
                        type="text"
                        value={boxOfficeForm.director}
                        onChange={(e) => setBoxOfficeForm({ ...boxOfficeForm, director: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="Nag Ashwin"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Star Cast</label>
                      <input
                        type="text"
                        value={boxOfficeForm.cast}
                        onChange={(e) => setBoxOfficeForm({ ...boxOfficeForm, cast: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="Prabhas, Amitabh Bachchan, Kamal Haasan"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Poster Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={boxOfficeForm.poster}
                          onChange={(e) => setBoxOfficeForm({ ...boxOfficeForm, poster: e.target.value })}
                          className="flex-grow bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                          placeholder="https://..."
                          required
                        />
                        <button
                          type="button"
                          onClick={() => openExtractor((url) => setBoxOfficeForm(prev => ({ ...prev, poster: url })))}
                          className="bg-brand-surface border border-brand-red/20 text-brand-red hover:bg-brand-red hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0"
                        >
                          Extract
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-gray-850 pt-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Day 1 Collection</label>
                      <input
                        type="text"
                        value={boxOfficeForm.dayCollection}
                        onChange={(e) => setBoxOfficeForm({ ...boxOfficeForm, dayCollection: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. ₹180 Cr"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Worldwide Gross</label>
                      <input
                        type="text"
                        value={boxOfficeForm.worldwideGross}
                        onChange={(e) => setBoxOfficeForm({ ...boxOfficeForm, worldwideGross: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. ₹1040 Cr"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">India Net</label>
                      <input
                        type="text"
                        value={boxOfficeForm.indiaNet}
                        onChange={(e) => setBoxOfficeForm({ ...boxOfficeForm, indiaNet: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. ₹640 Cr"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Budget</label>
                      <input
                        type="text"
                        value={boxOfficeForm.budget}
                        onChange={(e) => setBoxOfficeForm({ ...boxOfficeForm, budget: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. ₹600 Cr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Verdict</label>
                      <select
                        value={boxOfficeForm.verdict}
                        onChange={(e) => setBoxOfficeForm({ ...boxOfficeForm, verdict: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                      >
                        <option value="Blockbuster">Blockbuster</option>
                        <option value="Hit">Hit</option>
                        <option value="Average">Average</option>
                        <option value="Flop">Flop</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Trend</label>
                      <select
                        value={boxOfficeForm.trend}
                        onChange={(e) => setBoxOfficeForm({ ...boxOfficeForm, trend: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                      >
                        <option value="Strong">Strong</option>
                        <option value="Steady">Steady</option>
                        <option value="Declining">Declining</option>
                        <option value="Slow">Slow</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Days count tracked</label>
                      <input
                        type="text"
                        value={boxOfficeForm.days}
                        onChange={(e) => setBoxOfficeForm({ ...boxOfficeForm, days: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. 24 Days"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-gray-400 font-bold">Languages</label>
                      <input
                        type="text"
                        value={boxOfficeForm.languages}
                        onChange={(e) => setBoxOfficeForm({ ...boxOfficeForm, languages: e.target.value })}
                        className="bg-brand-surface border border-gray-800 text-gray-200 px-4 py-2.5 rounded-xl outline-none text-sm"
                        placeholder="e.g. Telugu, Tamil, Hindi"
                      />
                    </div>
                  </div>

                  {/* Daily Breakdowns */}
                  <div className="space-y-3.5 border-t border-gray-800 pt-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Daily Collection Breakdown</label>
                      <button
                        type="button"
                        onClick={handleAddDailyBreakdownRow}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border border-gray-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Day
                      </button>
                    </div>

                    {(boxOfficeForm.dailyBreakdown || []).map((row, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-[#18181B]/40 border border-gray-850 rounded-xl items-center">
                        <div className="w-24">
                          <input
                            type="text"
                            value={row.day}
                            onChange={(e) => handleDailyBreakdownChange(idx, 'day', e.target.value)}
                            className="w-full bg-brand-surface border border-gray-800 text-gray-200 px-3 py-2 rounded-lg text-xs outline-none font-bold"
                            placeholder="e.g. Day 1"
                            required
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={row.gross}
                            onChange={(e) => handleDailyBreakdownChange(idx, 'gross', e.target.value)}
                            className="w-full bg-brand-surface border border-gray-800 text-gray-200 px-3 py-2 rounded-lg text-xs outline-none"
                            placeholder="e.g. ₹95.3 Cr"
                            required
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDailyBreakdownRow(idx)}
                          className="p-2 hover:bg-red-950/20 text-gray-500 hover:text-brand-red rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {(boxOfficeForm.dailyBreakdown || []).length === 0 && (
                      <div className="text-center py-6 border border-dashed border-gray-800 rounded-xl text-gray-500 text-xs">
                        No daily breakdown rows added. Click "Add Day" to track collections per day.
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-gray-800">
                    <button
                      type="submit"
                      className="bg-brand-red text-white font-bold px-5 py-2.5 rounded-xl text-sm"
                    >
                      {editingId ? 'Update Report' : 'Save Report'}
                    </button>
                    <button
                      type="button"
                      onClick={resetBoxOfficeForm}
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
                        <th className="pb-3">Poster</th>
                        <th className="pb-3">Movie</th>
                        <th className="pb-3">Worldwide Gross</th>
                        <th className="pb-3">India Net</th>
                        <th className="pb-3">Verdict</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dbData.boxOffice || []).map((item) => (
                        <tr key={item.id} className="border-b border-gray-800/40 hover:bg-white/5 transition-colors">
                          <td className="py-3">
                            <img 
                              src={item.poster} 
                              alt={item.movieName} 
                              className="w-10 h-14 object-cover rounded-lg border border-gray-800"
                            />
                          </td>
                          <td className="py-3 font-bold text-gray-200">{item.movieName}</td>
                          <td className="py-3 text-yellow-500 font-bold">{item.worldwideGross || '—'}</td>
                          <td className="py-3 text-gray-300">{item.indiaNet || '—'}</td>
                          <td className="py-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red bg-brand-red/10 px-2 py-0.5 rounded border border-brand-red/20">
                              {item.verdict}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEditBoxOffice(item)}
                                className="p-2 hover:bg-brand-surface rounded-lg text-gray-400 hover:text-white transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBoxOfficeItem(item.id)}
                                className="p-2 hover:bg-red-950/20 rounded-lg text-gray-500 hover:text-brand-red transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {(dbData.boxOffice || []).length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-gray-500">
                            No box office detailed reports configured yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 10: IMAGE EXTRACTOR TOOL */}
          {activeTab === 'extractor-tool' && (
            <div className="space-y-6">
              <h2 className="text-xl font-poppins font-bold text-gray-200 border-b border-gray-800 pb-2">
                Image Extractor Tool
              </h2>
              <ImageExtractor embedMode={true} />
            </div>
          )}

        </div>
      </div>

      {/* Image Scraper Modal */}
      <ImageExtractorModal 
        isOpen={isExtractorOpen} 
        onClose={() => setIsExtractorOpen(false)} 
        onSelectImage={(url) => { 
          if (extractorCallback) extractorCallback(url); 
          setIsExtractorOpen(false); 
        }} 
      />
    </div>
  );
};

// -------------------- Image Extractor Modal Helper Component --------------------
const ImageExtractorModal = ({ isOpen, onClose, onSelectImage }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);

  if (!isOpen) return null;

  const handleScan = async (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setIsScanning(true);
    setError(null);
    setImages([]);
    try {
      const response = await axios.post('/api/extract-images', { url: urlInput });
      if (response.data.success) {
        setImages(response.data.images || []);
      } else {
        setError(response.data.error || 'Failed to extract images.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'An error occurred while fetching images.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#131a2b] border border-brand-red/30 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden relative shadow-[0_20px_50px_rgba(212,43,43,0.15)]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
          <h3 className="font-poppins font-bold text-gray-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-brand-red" />
            Media Scanner &amp; Injector
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search/URL Scan Form */}
        <div className="p-6 border-b border-gray-850 bg-brand-surface/40">
          <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-[#1a2235] border border-gray-800 text-gray-100 px-4 py-2.5 rounded-xl focus:border-brand-red outline-none text-sm"
              placeholder="Enter web page URL (e.g., https://imdb.com/title/tt... or Tollywood news site)"
              required
            />
            <button
              type="submit"
              disabled={isScanning}
              className="bg-brand-red hover:bg-brand-red/90 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                'Scan Images'
              )}
            </button>
          </form>
          {error && (
            <p className="text-brand-red text-xs mt-2.5 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
        </div>

        {/* Image Grid Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[200px]">
          {isScanning ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-brand-red animate-spin" />
              <p className="text-gray-400 text-sm font-medium">Extracting source tags and media assets...</p>
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => onSelectImage(img.url)}
                  className="bg-brand-surface/40 border border-gray-800 hover:border-brand-red/50 rounded-xl overflow-hidden cursor-pointer relative group aspect-video flex items-center justify-center"
                >
                  <img 
                    src={img.url} 
                    alt={img.alt || 'Extracted'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] bg-brand-red text-white px-2 py-1 rounded font-bold uppercase tracking-wider">
                      Select Image
                    </span>
                  </div>
                  {/* Badge */}
                  <span className="absolute bottom-1.5 right-1.5 bg-black/75 backdrop-blur-sm text-[8px] text-gray-300 px-1.5 py-0.5 rounded font-medium">
                    {img.source}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
              <ImageIcon className="w-10 h-10 mb-2" />
              <p className="text-sm font-medium">Enter a URL above to scrape and select images.</p>
              <p className="text-xs text-gray-600 max-w-xs mt-1">Images scraped can be clicked to directly populate the field.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
