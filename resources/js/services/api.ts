import axios from 'axios';

const api = axios.create({
    baseURL: '/api/v1',
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true, // Crucial for Sanctum cookie-based session auth
});

// Interceptor to attach Bearer token automatically for admin requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Public endpoints
export const cmsApi = {
    getSettings: () => api.get('/public/settings').then(res => res.data),
    getHomeData: () => api.get('/public/cms/home').then(res => res.data),
    getPrograms: () => api.get('/public/programs').then(res => res.data),
    getCurriculumPrograms: () => api.get('/public/curriculum-programs').then(res => res.data),
    getFaqs: () => api.get('/public/cms/faqs').then(res => res.data),
    getNews: (page = 1) => api.get(`/public/cms/news?page=${page}`).then(res => res.data),
    getNewsDetail: (slug: string) => api.get(`/public/cms/news/${slug}`).then(res => res.data),
    getGallery: (category = 'all') => api.get(`/public/cms/gallery?category=${category}`).then(res => res.data),
    submitContact: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) => 
        api.post('/public/contacts', data).then(res => res.data),
    calculateFee: (programId: number) => api.get('/public/admissions/calculate-fee', { params: { program_id: programId } }).then(res => res.data),
};

// Administrative endpoints
export const adminApi = {
    login: (credentials: any) => api.post('/admin/login', credentials).then(res => res.data),
    logout: () => api.post('/admin/logout').then(res => res.data),
    getStats: () => api.get('/admin/dashboard/stats').then(res => res.data),
    getApplicants: (params: any) => api.get('/admin/admissions', { params }).then(res => res.data),
    getApplicantDetail: (id: number) => api.get(`/admin/admissions/${id}`).then(res => res.data),
    updateApplicantStatus: (id: number, status: string, notes: string) => 
        api.put(`/admin/admissions/${id}/status`, { status, notes }).then(res => res.data),
    getDocumentBlob: (docId: number) => 
        api.get(`/admin/admissions/documents/${docId}/file`, { responseType: 'blob' }).then(res => res.data),

    // CMS Profile
    getProfile: () => api.get('/admin/cms/profile').then(res => res.data),
    updateProfile: (data: any) => api.put('/admin/cms/profile', data).then(res => res.data),

    // CMS Programs
    getAdminPrograms: () => api.get('/admin/cms/programs').then(res => res.data),
    createProgram: (data: any) => api.post('/admin/cms/programs', data).then(res => res.data),
    updateProgram: (id: number, data: any) => api.put(`/admin/cms/programs/${id}`, data).then(res => res.data),
    toggleProgram: (id: number) => api.patch(`/admin/cms/programs/${id}/toggle-status`).then(res => res.data),
    deleteProgram: (id: number) => api.delete(`/admin/cms/programs/${id}`).then(res => res.data),

    // CMS Curriculum Programs (5 Categories)
    getCurriculumPrograms: (category?: string) => api.get('/admin/cms/curriculum-programs', { params: { category } }).then(res => res.data),
    createCurriculumProgram: (data: any) => api.post('/admin/cms/curriculum-programs', data).then(res => res.data),
    updateCurriculumProgram: (id: number, data: any) => api.put(`/admin/cms/curriculum-programs/${id}`, data).then(res => res.data),
    toggleCurriculumProgram: (id: number) => api.patch(`/admin/cms/curriculum-programs/${id}/toggle-status`).then(res => res.data),
    deleteCurriculumProgram: (id: number) => api.delete(`/admin/cms/curriculum-programs/${id}`).then(res => res.data),

    // CMS Extracurriculars (KB & TK)
    getExtracurriculars: (level?: string) => api.get('/admin/cms/extracurriculars', { params: { level } }).then(res => res.data),
    createExtracurricular: (data: any) => api.post('/admin/cms/extracurriculars', data).then(res => res.data),
    updateExtracurricular: (id: number, data: any) => api.put(`/admin/cms/extracurriculars/${id}`, data).then(res => res.data),
    toggleExtracurricular: (id: number) => api.patch(`/admin/cms/extracurriculars/${id}/toggle-status`).then(res => res.data),
    deleteExtracurricular: (id: number) => api.delete(`/admin/cms/extracurriculars/${id}`).then(res => res.data),

    // CMS News
    getAdminNews: (page = 1) => api.get(`/admin/cms/news?page=${page}`).then(res => res.data),
    createNews: (data: FormData) => api.post('/admin/cms/news', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
    updateNews: (id: number, data: FormData) => {
        if (!data.has('_method')) data.append('_method', 'PUT');
        return api.post(`/admin/cms/news/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
    },
    deleteNews: (id: number) => api.delete(`/admin/cms/news/${id}`).then(res => res.data),

    // CMS Gallery
    getAdminGallery: () => api.get('/admin/cms/gallery').then(res => res.data),
    createGallery: (data: FormData) => api.post('/admin/cms/gallery', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
    updateGallery: (id: number, data: FormData) => {
        if (!data.has('_method')) data.append('_method', 'PUT');
        return api.post(`/admin/cms/gallery/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
    },
    deleteGallery: (id: number) => api.delete(`/admin/cms/gallery/${id}`).then(res => res.data),

    // CMS FAQ
    getAdminFaqs: (params?: any) => api.get('/admin/cms/faqs', { params }).then(res => res.data),
    createFaq: (data: any) => api.post('/admin/cms/faqs', data).then(res => res.data),
    updateFaq: (id: number, data: any) => api.put(`/admin/cms/faqs/${id}`, data).then(res => res.data),
    deleteFaq: (id: number) => api.delete(`/admin/cms/faqs/${id}`).then(res => res.data),
    
    // PPDB Settings & Waves
    getPpdbSettings: () => api.get('/admin/settings/ppdb').then(res => res.data),
    updatePpdbSettings: (data: any) => api.post('/admin/settings/ppdb', data).then(res => res.data),

    // CMS Home & Hero Sliders
    getHomeCms: () => api.get('/admin/cms/home').then(res => res.data),
    updateHomeSettings: (data: { hero_tagline: string; about_video_url: string }) => 
        api.post('/admin/cms/home/settings', data).then(res => res.data),
    getSliders: () => api.get('/admin/cms/sliders').then(res => res.data),
    createSlider: (data: FormData) => 
        api.post('/admin/cms/sliders', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data),
    updateSlider: (id: number, data: FormData) => {
        if (!data.has('_method')) data.append('_method', 'PUT');
        return api.post(`/admin/cms/sliders/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
    },
    toggleSlider: (id: number) => api.patch(`/admin/cms/sliders/${id}/toggle`).then(res => res.data),
    deleteSlider: (id: number) => api.delete(`/admin/cms/sliders/${id}`).then(res => res.data),
};

export default api;
