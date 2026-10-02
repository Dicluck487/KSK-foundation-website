// controllers/publicationController.js
const supabase = require('../config/supabase');

const BUCKET = 'publications';

function publicUrl(storagePath) {
  if (!storagePath) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function uploadToBucket(file, prefix) {
  const ext = file.originalname.split('.').pop();
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file.buffer, { contentType: file.mimetype });
  if (error) throw error;
  return path;
}

// GET /admin/publications
async function listPublications(req, res) {
  const { data: publications } = await supabase
    .from('publications')
    .select('*')
    .order('created_at', { ascending: false });

  const withUrls = (publications || []).map((p) => ({
    ...p,
    coverUrl: publicUrl(p.cover_path),
    documentUrl: publicUrl(p.document_path),
  }));
  res.render('admin/publications', { publications: withUrls });
}

// POST /admin/publications
// expects multer.fields([{name:'cover'},{name:'document'}])
async function createPublication(req, res) {
  const { title, type, description, year } = req.body;

  if (!title || !type) return res.redirect('/admin/publications');

  let coverPath = null;
  let documentPath = null;

  try {
    if (req.files?.cover?.[0]) {
      coverPath = await uploadToBucket(req.files.cover[0], 'covers');
    }
    if (req.files?.document?.[0]) {
      documentPath = await uploadToBucket(req.files.document[0], 'documents');
    }
  } catch (err) {
    return res.render('admin/error', { title: 'Upload failed', message: err.message });
  }

  await supabase.from('publications').insert({
    title: title.trim(),
    type,
    description: description || null,
    year: year ? Number(year) : null,
    cover_path: coverPath,
    document_path: documentPath,
    status: 'draft',
  });

  res.redirect('/admin/publications');
}

// POST /admin/publications/:id/status
async function setPublicationStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  if (!['draft', 'published'].includes(status)) return res.redirect('/admin/publications');
  await supabase.from('publications').update({ status, updated_at: new Date() }).eq('id', id);
  res.redirect('/admin/publications');
}

// POST /admin/publications/:id/delete
async function deletePublication(req, res) {
  const { id } = req.params;
  const { data: pub } = await supabase
    .from('publications')
    .select('cover_path, document_path')
    .eq('id', id)
    .single();

  if (pub) {
    const toRemove = [pub.cover_path, pub.document_path].filter(Boolean);
    if (toRemove.length) await supabase.storage.from(BUCKET).remove(toRemove);
  }
  await supabase.from('publications').delete().eq('id', id);
  res.redirect('/admin/publications');
}

// Used by the PUBLIC publications.ejs page.
async function getPublishedPublications() {
  const { data } = await supabase
    .from('publications')
    .select('*')
    .eq('status', 'published')
    .order('year', { ascending: false });
  return (data || []).map((p) => ({
    ...p,
    coverUrl: publicUrl(p.cover_path),
    documentUrl: publicUrl(p.document_path),
  }));
}

module.exports = {
  listPublications,
  createPublication,
  setPublicationStatus,
  deletePublication,
  getPublishedPublications,
};
