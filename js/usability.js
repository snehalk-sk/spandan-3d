(() => {
    const admin = Boolean(document.querySelector('.admin-page'));
    const menu = document.getElementById(admin ? 'sidebar' : 'mainNav');
    const toggle = document.getElementById(admin ? 'menuButton' : 'mobileMenuBtn');
    if (menu && toggle) {
        toggle.setAttribute('aria-controls', menu.id);
        toggle.setAttribute('aria-label', 'Open navigation');
        const sync = () => {
            const open = menu.classList.contains('open');
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        };
        new MutationObserver(sync).observe(menu, {attributes:true,attributeFilter:['class']}); sync();
        document.addEventListener('keydown', e => {
            if (e.key !== 'Escape' || !menu.classList.contains('open')) return;
            menu.classList.remove('open'); document.body.classList.remove('menu-open');
            document.getElementById('sidebarOverlay')?.classList.remove('show'); toggle.focus();
        });
    }
    const main = document.querySelector('main');
    if (main) {
        main.id ||= 'main-content'; main.tabIndex = -1;
        const skip = document.createElement('a');skip.className='skip-link';skip.href='#'+main.id;skip.textContent='Skip to content';
        if (!admin) document.body.prepend(skip);
    }
    document.querySelectorAll('a[target="_blank"]').forEach(a => a.rel='noopener noreferrer');
    document.addEventListener('error', e => {
        if (!(e.target instanceof HTMLImageElement)) return;
        e.target.classList.add('photo-error');
        e.target.alt = admin ? 'Photo unavailable — upload a replacement' : 'Product photo unavailable';
    }, true);
    for (const id of ['toast','adminMessage']) document.getElementById(id)?.setAttribute('role','status');
    document.querySelectorAll('input[type="email"]').forEach(e=>e.autocomplete='email');
    document.querySelectorAll('input[type="tel"]').forEach(e=>{e.autocomplete='tel';e.inputMode='tel';});
    document.querySelectorAll('input[name="pinCode"], input[name="pincode"]').forEach(e=>{e.inputMode='numeric';e.autocomplete='postal-code';e.pattern='[0-9]{6}';e.maxLength=6;});
    if (admin) {
        const form = document.getElementById('productForm');
        window.spandanProductDirty = false;
        form?.addEventListener('input',()=>window.spandanProductDirty=true);
        form?.addEventListener('change',()=>window.spandanProductDirty=true);
        form?.addEventListener('click',e=>{
            if(e.target.closest('[data-remove-main-image], [data-remove-gallery-type], [data-remove-product-video], .product-color-row button, #addProductColor')) window.spandanProductDirty=true;
        },true);
        form?.addEventListener('reset',()=>window.spandanProductDirty=false);
        window.addEventListener('beforeunload',e=>{if(window.spandanProductDirty){e.preventDefault();e.returnValue='';}});
    }
})();
