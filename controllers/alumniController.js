const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const BUCKET = 'alumni';

function publicUrl(storagePath) {
  if (!storagePath) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// GET /admin/alumni
exports.listAlumni = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('alumni')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const alumni = (data || []).map((a) => ({
      ...a,
      image_url: publicUrl(a.photo_path),
    }));

    res.render('admin/alumni', { alumni });
  } catch (error) {
    next(error);
  }
};

// POST /admin/alumni/upload
exports.uploadAlumni = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded');

    const { name, year, program, testimonial } = req.body;
    const ext = req.file.originalname.split('.').pop();
    const photoPath = `${uuidv4()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(photoPath, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) throw uploadError;

    const { error: dbError } = await supabase.from('alumni').insert({
      name,
      year: year || null,
      program: program || null,
      testimonial: testimonial || null,
      photo_path: photoPath,
      status: 'draft',
    });

    if (dbError) throw dbError;
    res.redirect('/admin/alumni');
  } catch (error) {
    next(error);
  }
};

// POST /admin/alumni/:id/publish
exports.publishAlumni = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('alumni')
      .update({ status: 'published' })
      .eq('id', req.params.id);

    if (error) throw error;
    res.redirect('/admin/alumni');
  } catch (error) {
    next(error);
  }
};

// POST /admin/alumni/:id/draft
exports.setDraftAlumni = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('alumni')
      .update({ status: 'draft' })
      .eq('id', req.params.id);

    if (error) throw error;
    res.redirect('/admin/alumni');
  } catch (error) {
    next(error);
  }
};

// used by the public homepage — 3 most recent PUBLISHED
exports.getRecentAlumni = async () => {
  const { data, error } = await supabase
    .from('alumni')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) throw error;
  return (data || []).map((a) => ({
    ...a,
    image_url: publicUrl(a.photo_path),
  }));
};

// used by the /alumni page — published, excluding the 3 most recent
exports.getOlderAlumni = async () => {
  const { data, error } = await supabase
    .from('alumni')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(3, 999);

  if (error) throw error;
  return (data || []).map((a) => ({
    ...a,
    image_url: publicUrl(a.photo_path),
  }));
};