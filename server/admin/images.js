(() => {
    const slots = [['home-hero', 'Homepage banner'], ['home-idols', 'Homepage — Idols collection'], ['home-custom', 'Homepage — Custom printing'], ['about-main', 'About page']];
    const grid = document.getElementById('websiteImageGrid');
    const status = document.getElementById('imageManagerStatus');
    let images = {};
    const api = 'https://spandan-3d.onrender.com';
    const el = (tag, text, className) => { const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node; };
    async function request(path, options) {
        const response = await fetch(api + path, options);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not update images');
        return data;
    }
    function render() {
        grid.replaceChildren();
        slots.forEach(([slot, title]) => {
            const form = el('form', null, 'image-manager-card');
            form.append(el('h3', title));
            if (images[slot]?.url) {
                const img = el('img'); img.src = images[slot].url; img.alt = images[slot].alt || title; form.append(img);
            } else form.append(el('div', 'Using the original website illustration', 'image-manager-placeholder'));
            const label = el('label', 'Choose photo (JPG, PNG or WebP, up to 10 MB)');
            const file = el('input'); file.type = 'file'; file.accept = 'image/jpeg,image/png,image/webp'; file.required = true; label.append(file);
            const altLabel = el('label', 'Image description'); const alt = el('input'); alt.value = images[slot]?.alt || ''; alt.maxLength = 200; altLabel.append(alt);
            const save = el('button', images[slot] ? 'Replace image' : 'Add image', 'primary-button'); save.type = 'submit';
            const remove = el('button', 'Remove image', 'secondary-button'); remove.type = 'button'; remove.disabled = !images[slot];
            form.append(label, altLabel, save, remove);
            const busy = value => { save.disabled = value; remove.disabled = value || !images[slot]; };
            form.addEventListener('submit', async event => {
                event.preventDefault(); const selected = file.files[0]; if (!selected) return;
                if (selected.size > 10 * 1024 * 1024) { status.textContent = 'Choose a photo smaller than 10 MB.'; return; }
                busy(true); status.textContent = 'Saving image…';
                try { const body = new FormData(); body.append('image', selected); body.append('alt', alt.value); images[slot] = await request(`/api/site-images/${slot}`, {method: 'POST', body}); render(); status.textContent = 'Image saved. Refresh the website to see it.'; }
                catch (error) { status.textContent = error.message; busy(false); }
            });
            remove.addEventListener('click', async () => {
                busy(true); status.textContent = 'Removing image…';
                try { await request(`/api/site-images/${slot}`, {method: 'DELETE'}); delete images[slot]; render(); status.textContent = 'Image removed. The original illustration will appear.'; }
                catch (error) { status.textContent = error.message; busy(false); }
            });
            grid.append(form);
        });
    }
    async function load() {
        status.textContent = 'Loading website images…';
        try { images = await request('/api/site-images'); render(); status.textContent = ''; }
        catch (error) { status.textContent = error.message + '. Try Refresh images after the server deployment finishes.'; }
        const productsGrid = document.getElementById('imageProducts');
        try {
            const products = await request('/api/products'); productsGrid.replaceChildren();
            products.forEach(product => {
                const card = el('div', null, 'image-manager-card'); card.append(el('h3', product.name));
                if (product.mainImage) { const img = el('img'); img.src = product.mainImage; img.alt = product.name; card.append(img); }
                const edit = el('button', 'Manage product photos', 'secondary-button'); edit.type = 'button';
                edit.dataset.editProduct = product.id;
                edit.addEventListener('click', () => openPage('products'));
                card.append(edit); productsGrid.append(card);
            });
            if (!products.length) productsGrid.append(el('p', 'Add a product first to manage its photos.'));
        } catch (error) { productsGrid.textContent = 'Could not load product photos. Use Refresh images to retry.'; }
    }
    document.getElementById('refreshImages').addEventListener('click', load);
    document.querySelector('[data-page="images"]').addEventListener('click', load);
})();
