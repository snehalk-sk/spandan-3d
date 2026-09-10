(async () => {
    const holders = document.querySelectorAll('[data-site-image]');
    if (!holders.length) return;
    try {
        const response = await fetch('https://spandan-3d.onrender.com/api/site-images');
        if (!response.ok) return;
        const images = await response.json();
        for (const holder of holders) {
            const photo = images[holder.dataset.siteImage];
            if (!photo?.url || !/^https:\/\//i.test(photo.url)) continue;
            const img = new Image();
            img.alt = photo.alt || 'Spandan 3D';
            img.onload = () => {
                holder.replaceChildren(img);
                holder.classList.add('has-site-image');
            };
            img.src = photo.url;
        }
    } catch (error) { console.warn('Website images unavailable', error); }
})();
