const fs = require('fs/promises');
const {randomUUID} = require('crypto');

const BUCKET = 'product-media';
const TYPES = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
    'image/gif': 'gif', 'video/mp4': 'mp4', 'video/webm': 'webm'
};

// Multer stages files on disk; only persistent storage URLs leave this handler.
module.exports = function createProductMediaHandler(supabase) {
    let ready;
    async function storage() {
        if (!supabase) throw new Error('Product storage is not configured');
        if (!ready) ready = (async () => {
            const found = await supabase.storage.getBucket(BUCKET);
            if (found.error) {
                if (Number(found.error.statusCode) !== 404 && !/not found/i.test(found.error.message)) throw found.error;
                const created = await supabase.storage.createBucket(BUCKET, {
                    public: true, fileSizeLimit: 50 * 1024 * 1024,
                    allowedMimeTypes: Object.keys(TYPES)
                });
                if (created.error && !/already exists/i.test(created.error.message)) throw created.error;
            } else if (!found.data?.public) {
                throw new Error('Product media bucket must allow public product photos');
            }
        })().catch(error => { ready = null; throw error; });
        await ready;
        return supabase.storage.from(BUCKET);
    }
    return async function uploadProductMedia(req, res) {
        const files = Object.values(req.files || {}).flat();
        const uploaded = [];
        let store;
        try {
            if (!files.length) return res.status(400).json({success: false, message: 'Choose a product photo or video first'});
            store = await storage();
            const urls = new Map();
            // Sequential uploads bound memory use even for large galleries/videos.
            for (const file of files) {
                const extension = TYPES[file.mimetype];
                if (!extension) throw new Error('Unsupported product media type');
                const key = `uploads/${randomUUID()}.${extension}`;
                const result = await store.upload(key, await fs.readFile(file.path), {
                    contentType: file.mimetype, cacheControl: '31536000', upsert: false
                });
                if (result.error) throw result.error;
                uploaded.push(key);
                const url = store.getPublicUrl(key).data?.publicUrl;
                if (!url || !url.startsWith('https://')) throw new Error('Product storage did not return a secure image URL');
                urls.set(file, url);
            }
            res.json({
                success: true,
                mainImage: urls.get(req.files.mainImage?.[0]) || '',
                galleryImages: (req.files.galleryImages || []).map(file => urls.get(file)),
                productVideo: urls.get(req.files.productVideo?.[0]) || ''
            });
        } catch (error) {
            if (store && uploaded.length) {
                try { await store.remove(uploaded); } catch (cleanupError) { console.error('Product upload cleanup failed', cleanupError); }
            }
            console.error('Persistent product upload failed', error);
            res.status(503).json({success: false, message: 'Photos could not be saved to permanent storage. Please retry; the product has not been saved with these uploads.'});
        } finally {
            await Promise.all(files.map(file => fs.unlink(file.path).catch(() => {})));
        }
    };
};
