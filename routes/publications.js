const express = require('express');
const router = express.Router();
const multer = require('multer');

const supabase = require('../../config/supabase');

// ⚠️ Adjust this import to match your actual admin-auth middleware
// (from your existing role-based CMS auth work).
const requireAdmin = require('../../middleware/requireAdmin');

// Files are held in memory just long enough to stream to Supabase Storage.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB per file
});


// -------------------------------------------------------------
// Helper: upload a single file buffer to the "publications" bucket
// -------------------------------------------------------------
async function uploadToStorage(file, folder) {
    if (!file) return null;

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${folder}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
        .from('publications')
        .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });

    if (error) {
        throw new Error(`Upload failed for ${file.originalname}: ${error.message}`);
    }

    return storagePath;
}

// -------------------------------------------------------------
// Helper: delete a file from storage (used on record delete/replace)
// -------------------------------------------------------------
async function removeFromStorage(storagePath) {
    if (!storagePath) return;
    await supabase.storage.from('publications').remove([storagePath]);
}


// ===============================================================
// LIST — all publications, any status
// ===============================================================
router.get('/', requireAdmin, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('publications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const decorated = (data || []).map(pub => ({
            ...pub,
            cover_url: pub.cover_path
                ? supabase.storage.from('publications').getPublicUrl(pub.cover_path).data.publicUrl
                : '/images/logo.jpg'
        }));

        res.render('admin/publications/index', {
            publications: decorated,
            flash: req.query.flash || null
        });

    } catch (err) {
        console.error('Admin publications list error:', err);
        res.status(500).send('Could not load publications.');
    }
});


// ===============================================================
// NEW — upload form
// ===============================================================
router.get('/new', requireAdmin, (req, res) => {
    res.render('admin/publications/form', {
        publication: null,
        formAction: '/admin/publications',
        formTitle: 'Upload Magazine'
    });
});


// ===============================================================
// CREATE — handle the upload
// ===============================================================
router.post(
    '/',
    requireAdmin,
    upload.fields([
        { name: 'cover', maxCount: 1 },
        { name: 'document', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { title, description, year, status } = req.body;

            if (!title || !title.trim()) {
                return res.status(400).send('Title is required.');
            }

            const coverFile = req.files?.cover?.[0] || null;
            const documentFile = req.files?.document?.[0] || null;

            const cover_path = await uploadToStorage(coverFile, 'covers');
            const document_path = await uploadToStorage(documentFile, 'documents');

            const { error } = await supabase
                .from('publications')
                .insert({
                    title: title.trim(),
                    description: description?.trim() || null,
                    year: year ? parseInt(year, 10) : null,
                    status: status === 'published' ? 'published' : 'draft',
                    cover_path,
                    document_path
                });

            if (error) throw error;

            res.redirect('/admin/publications?flash=Publication+uploaded');

        } catch (err) {
            console.error('Admin publication create error:', err);
            res.status(500).send('Could not save the publication: ' + err.message);
        }
    }
);


// ===============================================================
// EDIT — form pre-filled with existing data
// ===============================================================
router.get('/:id/edit', requireAdmin, async (req, res) => {
    try {
        const { data: publication, error } = await supabase
            .from('publications')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error || !publication) {
            return res.status(404).send('Publication not found.');
        }

        res.render('admin/publications/form', {
            publication,
            formAction: `/admin/publications/${publication.id}`,
            formTitle: 'Edit Magazine'
        });

    } catch (err) {
        console.error('Admin publication edit-load error:', err);
        res.status(500).send('Could not load the publication.');
    }
});


// ===============================================================
// UPDATE — title/description/year, and optionally replace files
// ===============================================================
router.post(
    '/:id',
    requireAdmin,
    upload.fields([
        { name: 'cover', maxCount: 1 },
        { name: 'document', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { title, description, year } = req.body;

            const { data: existing, error: fetchError } = await supabase
                .from('publications')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError || !existing) {
                return res.status(404).send('Publication not found.');
            }

            const updates = {
                title: title?.trim() || existing.title,
                description: description?.trim() || null,
                year: year ? parseInt(year, 10) : null
            };

            const coverFile = req.files?.cover?.[0] || null;
            const documentFile = req.files?.document?.[0] || null;

            if (coverFile) {
                updates.cover_path = await uploadToStorage(coverFile, 'covers');
                await removeFromStorage(existing.cover_path);
            }

            if (documentFile) {
                updates.document_path = await uploadToStorage(documentFile, 'documents');
                await removeFromStorage(existing.document_path);
            }

            const { error: updateError } = await supabase
                .from('publications')
                .update(updates)
                .eq('id', id);

            if (updateError) throw updateError;

            res.redirect('/admin/publications?flash=Publication+updated');

        } catch (err) {
            console.error('Admin publication update error:', err);
            res.status(500).send('Could not update the publication: ' + err.message);
        }
    }
);


// ===============================================================
// PUBLISH
// ===============================================================
router.post('/:id/publish', requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase
            .from('publications')
            .update({ status: 'published' })
            .eq('id', req.params.id);

        if (error) throw error;

        res.redirect('/admin/publications?flash=Publication+published');

    } catch (err) {
        console.error('Admin publication publish error:', err);
        res.status(500).send('Could not publish the publication.');
    }
});


// ===============================================================
// MOVE TO DRAFT
// ===============================================================
router.post('/:id/draft', requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase
            .from('publications')
            .update({ status: 'draft' })
            .eq('id', req.params.id);

        if (error) throw error;

        res.redirect('/admin/publications?flash=Moved+to+draft');

    } catch (err) {
        console.error('Admin publication draft error:', err);
        res.status(500).send('Could not move the publication to draft.');
    }
});


// ===============================================================
// DELETE — removes the DB row and its storage files
// ===============================================================
router.post('/:id/delete', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        const { data: existing, error: fetchError } = await supabase
            .from('publications')
            .select('cover_path, document_path')
            .eq('id', id)
            .single();

        if (fetchError || !existing) {
            return res.status(404).send('Publication not found.');
        }

        await removeFromStorage(existing.cover_path);
        await removeFromStorage(existing.document_path);

        const { error: deleteError } = await supabase
            .from('publications')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        res.redirect('/admin/publications?flash=Publication+deleted');

    } catch (err) {
        console.error('Admin publication delete error:', err);
        res.status(500).send('Could not delete the publication.');
    }
});


module.exports = router;