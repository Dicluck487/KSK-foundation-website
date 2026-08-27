// controllers/heroController.js

const supabase = require('../config/supabase');

/**
 * GET /admin/hero-images
 *
 * Display all hero images.
 */
async function listHeroImages(req, res) {
  try {
    const { data: heroImages, error } = await supabase
      .from('hero_images')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error loading hero images:', error);
      return res.status(500).render('admin/error', {
        title: 'Hero Images Error',
        message: error.message,
      });
    }

    const images = (heroImages || []).map((image) => {
      const { data } = supabase
        .storage
        .from('hero-images')
        .getPublicUrl(image.storage_path);

      return {
        ...image,
        public_url: data.publicUrl,
      };
    });

    res.render('admin/hero', {
      heroImages: images,
    });

  } catch (error) {
    console.error('Hero images controller error:', error);

    res.status(500).render('admin/error', {
      title: 'Hero Images Error',
      message: 'Unable to load hero images.',
    });
  }
}


/**
 * POST /admin/hero-images
 *
 * Create a new hero image database record.
 *
 * This version assumes the image has already been uploaded
 * to Supabase Storage.
 */
async function createHeroImage(req, res) {
  try {
    const {
      title,
      storage_path,
      alt_text,
      display_order,
      status,
    } = req.body;

    if (!storage_path) {
      return res.status(400).send('Storage path is required.');
    }

    const { error } = await supabase
      .from('hero_images')
      .insert({
        title: title || null,
        storage_path,
        alt_text: alt_text || null,
        display_order: Number(display_order) || 0,
        status: status || 'published',
      });

    if (error) {
      console.error('Error creating hero image:', error);
      return res.status(500).render('admin/error', {
        title: 'Hero Image Error',
        message: error.message,
      });
    }

    res.redirect('/admin/hero-images');

  } catch (error) {
    console.error('Create hero image error:', error);

    res.status(500).render('admin/error', {
      title: 'Hero Image Error',
      message: 'Unable to create hero image.',
    });
  }
}


/**
 * POST /admin/hero-images/:id/status
 *
 * Change hero image status.
 */
async function updateHeroStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['published', 'draft'].includes(status)) {
      return res.redirect('/admin/hero-images');
    }

    const { error } = await supabase
      .from('hero_images')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating hero status:', error);
    }

    res.redirect('/admin/hero-images');

  } catch (error) {
    console.error('Update hero status error:', error);
    res.redirect('/admin/hero-images');
  }
}


/**
 * POST /admin/hero-images/:id/delete
 *
 * Delete the database record.
 *
 * We intentionally do NOT delete the Storage file yet.
 * That keeps the actual image safe while testing.
 */
async function deleteHeroImage(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('hero_images')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting hero image:', error);
    }

    res.redirect('/admin/hero-images');

  } catch (error) {
    console.error('Delete hero image error:', error);
    res.redirect('/admin/hero-images');
  }
}


module.exports = {
  listHeroImages,
  createHeroImage,
  updateHeroStatus,
  deleteHeroImage,
};