const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

const BUCKET = 'hero-images';

function publicUrl(storagePath) {
  if (!storagePath) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// GET /admin/hero - list all uploaded hero images
exports.listHero = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    const images = (data || []).map((img) => ({
      ...img,
      image_url: publicUrl(img.storage_path),
    }));

    res.render('admin/hero', { images });
  } catch (error) {
    next(error);
  }
};

// POST /admin/hero/upload
exports.uploadHero = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded');

    const { title, alt_text } = req.body;
    const ext = req.file.originalname.split('.').pop();
    const storagePath = `${uuidv4()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, req.file.buffer, { contentType: req.file.mimetype });

    if (uploadError) throw uploadError;

    const { error: dbError } = await supabase.from('hero_images').insert({
      title: title || null,
      alt_text: alt_text || null,
      storage_path: storagePath,
      status: 'draft',
    });

    if (dbError) throw dbError;
    res.redirect('/admin/hero');
  } catch (error) {
    next(error);
  }
};

// POST /admin/hero/:id/publish
exports.publishHero = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('hero_images')
      .update({ status: 'published', updated_at: new Date() })
      .eq('id', req.params.id);

    if (error) throw error;
    res.redirect('/admin/hero');
  } catch (error) {
    next(error);
  }
};

// POST /admin/hero/:id/draft
exports.setDraftHero = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('hero_images')
      .update({ status: 'draft', updated_at: new Date() })
      .eq('id', req.params.id);

    if (error) throw error;
    res.redirect('/admin/hero');
  } catch (error) {
    next(error);
  }
};

// used by the public homepage
exports.getPublishedHero = async () => {
  const { data, error } = await supabase
    .from('hero_images')
    .select('*')
    .eq('status', 'published')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map((img) => ({
    ...img,
    image_url: publicUrl(img.storage_path),
  }));
};