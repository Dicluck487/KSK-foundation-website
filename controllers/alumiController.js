// controllers/alumniController.js
const supabase = require('../config/supabase');

const BUCKET = 'alumni';

function publicUrl(storagePath) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// GET /admin/alumni
async function listGallery(req, res) {
  const { data: photos } = await supabase
    .from('alumni')
    .select('*')
    .order('created_at', { ascending: false });

  const withUrls = (photos || []).map((p) => ({ ...p, url: publicUrl(p.storage_path) }));
  res.render('admin/alumni', { photos: withUrls });
}

// POST /admin/alumni/upload
async function uploadPhoto(req, res) {
  if (!req.file) {
    return res.redirect('/admin/alumni');
  }
  const { title, description, category, year, alt_text } = req.body;

  const ext = req.file.originalname.split('.').pop();
  const storagePath = `alumni/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, req.file.buffer, { contentType: req.file.mimetype });

  if (uploadErr) {
    return res.render('admin/error', { title: 'Upload failed', message: uploadErr.message });
  }

  await supabase.from('alumni').insert({
    title: title || null,
    description: description || null,
    storage_path: storagePath,
    category: category || null,
    year: year ? Number(year) : null,
    alt_text: alt_text || null,
    status: 'draft',
    uploaded_by: req.session.user.id,
  });

  res.redirect('/admin/alumni');
}

// POST /admin/alumni/:id/status  (publish/unpublish)
async function setPhotoStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  if (!['draft', 'published'].includes(status)) return res.redirect('/admin/alumni');
  await supabase.from('alumni').update({ status }).eq('id', id);
  res.redirect('/admin/alumni');
}

// POST /admin/alumni/:id/delete
async function deletePhoto(req, res) {
  const { id } = req.params;
  const { data: photo } = await supabase.from('alumni').select('storage_path').eq('id', id).single();
  if (photo) {
    await supabase.storage.from(BUCKET).remove([photo.storage_path]);
  }
  await supabase.from('alumni').delete().eq('id', id);
  res.redirect('/admin/');
}alumni

// Used by the PUBLIC alumni.ejs page to show only published photos.
async function getPublishedGallery() {
  const { data: photos } = await supabase
    .from('alumni')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  return (photos || []).map((p) => ({ ...p, url: publicUrl(p.storage_path) }));
}

// Used by the homepage to show a small "recent photos" preview.
async function getRecentGalleryPhotos(limit = 3) {
  const { data: photos } = await supabase
    .from('alumni')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (photos || []).map((p) => ({ ...p, url: publicUrl(p.storage_path) }));
}

module.exports = {
  listGallery,
  uploadPhoto,
  setPhotoStatus,
  deletePhoto,
  getPublishedGallery,
  getRecentGalleryPhotos,
};