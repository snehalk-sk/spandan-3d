const multer = require('multer');
const { randomUUID } = require('crypto');
const slots = ['home-hero', 'home-idols', 'home-custom', 'about-main'];
const bucket = 'website-images';

module.exports = function registerSiteImages(app, supabase) {
    const upload = multer({storage: multer.memoryStorage(), limits: {fileSize: 10 * 1024 * 1024}}).single('image');
    let ready;
    async function storage() {
        if (!supabase) throw new Error('Image storage is not configured');
        if (!ready) ready = (async () => {
            const found = await supabase.storage.getBucket(bucket);
            if (found.error) {
                const created = await supabase.storage.createBucket(bucket, {public: true});
                if (created.error && !/already exists/i.test(created.error.message)) throw created.error;
            }
        })().catch(error => { ready = null; throw error; });
        await ready;
        return supabase.storage.from(bucket);
    }
    const configPath = slot => `settings/${slot}.json`;
    let cached = null;
    let pending = null;
    let generation = 0;
    function invalidate() { generation++; cached = null; pending = null; }
    async function readImages() {
        if (cached && Date.now() - cached.time < 30000) return cached.value;
        if (pending) return pending;
        const version = generation;
        const task = (async () => {
            const store = await storage();
            const entries = await Promise.all(slots.map(async slot => {
                const {data, error} = await store.download(configPath(slot));
                if (error) {
                    if (/not found|does not exist/i.test(error.message) || Number(error.statusCode) === 404) return null;
                    throw error;
                }
                return [slot, JSON.parse(await data.text())];
            }));
            const value = Object.fromEntries(entries.filter(Boolean));
            if (version === generation) cached = {time: Date.now(), value};
            return value;
        })();
        pending = task;
        try { return await task; } finally { if (pending === task) pending = null; }
    }
    app.get('/api/site-images', async (req, res) => {
        try {
            // Browsers revalidate; the server cache is invalidated by edits below.
            res.set('Cache-Control', 'no-cache').json(await readImages());
        } catch (error) { res.status(503).json({message: error.message || 'Could not load website images'}); }
    });
    app.post('/api/site-images/:slot', (req, res, next) => {
        if (!slots.includes(req.params.slot)) return res.status(400).json({message: 'Unknown image location'});
        upload(req, res, next);
    }, async (req, res) => {
        try {
            const file = req.file;
            if (!file) return res.status(400).json({message: 'Choose an image first'});
            const b = file.buffer;
            const type = b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'png'
                : b[0] === 255 && b[1] === 216 && b[2] === 255 ? 'jpg'
                : b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' ? 'webp' : null;
            if (!type) return res.status(400).json({message: 'Use a JPG, PNG or WebP photo'});
            const store = await storage();
            const path = `photos/${randomUUID()}.${type}`;
            const uploaded = await store.upload(path, b, {contentType: type === 'jpg' ? 'image/jpeg' : `image/${type}`});
            if (uploaded.error) throw uploaded.error;
            const record = {url: store.getPublicUrl(path).data.publicUrl, alt: String(req.body.alt || '').trim().slice(0, 200)};
            const saved = await store.upload(configPath(req.params.slot), JSON.stringify(record), {upsert: true, contentType: 'application/json'});
            if (saved.error) { await store.remove([path]); throw saved.error; }
            invalidate();
            res.json(record);
        } catch (error) { res.status(500).json({message: error.message || 'Could not save image'}); }
    });
    app.delete('/api/site-images/:slot', async (req, res) => {
        if (!slots.includes(req.params.slot)) return res.status(400).json({message: 'Unknown image location'});
        try {
            const store = await storage();
            const result = await store.remove([configPath(req.params.slot)]);
            if (result.error) throw result.error;
            invalidate();
            res.json({success: true});
        } catch (error) { res.status(500).json({message: error.message || 'Could not remove image'}); }
    });
};

