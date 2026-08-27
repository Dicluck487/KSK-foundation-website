// controllers/alumniController.js

const supabase = require('../config/supabase');


// =========================================================
// GET /admin/alumni
// Display all alumni
// =========================================================

async function listAlumni(req, res) {
  try {
    const { data: alumni, error } = await supabase
      .from('alumni')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading alumni:', error.message);

      return res.status(500).render('admin/error', {
        title: 'Alumni Error',
        message: error.message,
      });
    }

    const alumniWithUrls = (alumni || []).map((person) => {
      let public_url = null;

      if (person.photo_path) {
        const { data } = supabase
          .storage
          .from('alumni')
          .getPublicUrl(person.photo_path);

        public_url = data.publicUrl;
      }

      return {
        ...person,
        public_url,
      };
    });

    res.render('admin/alumni', {
      alumni: alumniWithUrls,
    });

  } catch (error) {
    console.error('Alumni controller error:', error);

    res.status(500).render('admin/error', {
      title: 'Alumni Error',
      message: 'Unable to load alumni.',
    });
  }
}


// =========================================================
// POST /admin/alumni
// Create alumni record
// =========================================================

async function createAlumni(req, res) {
  try {
    const {
      name,
      cohort,
      program,
      testimonial,
      photo_path,
      status,
    } = req.body;

    if (!name || !cohort || !program) {
      return res.status(400).render('admin/error', {
        title: 'Invalid Alumni',
        message: 'Name, cohort and program are required.',
      });
    }

    const { error } = await supabase
      .from('alumni')
      .insert({
        name,
        cohort,
        program,
        testimonial: testimonial || null,
        photo_path: photo_path || null,
        status: status || 'published',
      });

    if (error) {
      console.error('Error creating alumni:', error.message);

      return res.status(500).render('admin/error', {
        title: 'Alumni Error',
        message: error.message,
      });
    }

    res.redirect('/admin/alumni');

  } catch (error) {
    console.error('Create alumni error:', error);

    res.status(500).render('admin/error', {
      title: 'Alumni Error',
      message: 'Unable to create alumni record.',
    });
  }
}


// =========================================================
// POST /admin/alumni/:id/status
// Publish / Draft
// =========================================================

async function updateAlumniStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['published', 'draft'].includes(status)) {
      return res.redirect('/admin/alumni');
    }

    const { error } = await supabase
      .from('alumni')
      .update({
        status,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating alumni status:', error.message);
    }

    res.redirect('/admin/alumni');

  } catch (error) {
    console.error('Update alumni status error:', error);

    res.redirect('/admin/alumni');
  }
}


// =========================================================
// POST /admin/alumni/:id/delete
// Delete alumni record
// =========================================================

async function deleteAlumni(req, res) {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('alumni')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting alumni:', error.message);
    }

    res.redirect('/admin/alumni');

  } catch (error) {
    console.error('Delete alumni error:', error);

    res.redirect('/admin/alumni');
  }
}


module.exports = {
  listAlumni,
  createAlumni,
  updateAlumniStatus,
  deleteAlumni,
};