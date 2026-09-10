function normalizeColors(value) {
    const entries = Array.isArray(value) ? value : String(value || "").split(/[,\n\r]+/);
    const seen = new Set();
    return entries.filter(item => typeof item === "string").map(item => item.trim())
        .filter(item => {
            const key = item.toLowerCase();
            if (!item || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

// =====================================================
// SPANDAN 3D - MAIN WEBSITE JAVASCRIPT
// =====================================================

const API_URL = "https://spandan-3d.onrender.com";


// =====================================================
// PRODUCTS
// =====================================================

let products = window.SPANDAN_PRODUCTS || [];


// =====================================================
// HELPERS
// =====================================================

const $ = selector =>
    document.querySelector(selector);

const $$ = selector =>
    [...document.querySelectorAll(selector)];


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// FILE / MEDIA URL
// =====================================================

function mediaURL(value) {

    if (!value) {
        return "";
    }

    if (typeof value === "string") {
        return value;
    }

    if (
        typeof value === "object" &&
        value.url
    ) {
        return value.url;
    }

    return "";

}


// =====================================================
// CART
// =====================================================

let cart =
    JSON.parse(
        localStorage.getItem("spandan-cart") ||
        "{}"
    );


// =====================================================
// MONEY
// =====================================================

function money(value) {

    return (
        "₹" +
        Number(value || 0)
            .toLocaleString("en-IN")
    );

}


// =====================================================
// NORMALIZE PRODUCT
// =====================================================

function normalizeProduct(product) {

    const mainImage =
        mediaURL(
            product.mainImage ||
            product.image
        );


    const galleryImages =
        Array.isArray(product.galleryImages)
            ? product.galleryImages
                .map(mediaURL)
                .filter(Boolean)
            : [];


    const productVideo =
        mediaURL(
            product.productVideo ||
            product.video
        );


    const colors = normalizeColors(product.colors);

    const sellingPrice =
        Number(
            product.price ??
            product.sellingPrice ??
            product.salePrice ??
            0
        );


    const mrpValue =
        product.oldPrice ??
        product.mrp ??
        product.MRP ??
        null;


    return {

        id:
            product.id,

        name:
            product.name ||
            "3D Product",

        price:
            sellingPrice,

        old:
            mrpValue !== null &&
            mrpValue !== "" &&
            Number(mrpValue) > sellingPrice

                ? Number(mrpValue)

                : null,

        category:
            product.category ||
            "",

        shortDescription:
            product.shortDescription ||
            "",

        desc:
            product.description ||
            product.desc ||
            "",

        mainImage,

        image:
            mainImage,

        galleryImages,

        productVideo,

        material:
            product.material ||
            "",

        colors,

        dimensions:
            product.dimensions ||
            "",

        weight:
            product.weight ||
            "",

        printTime:
            product.printTime ||
            "",

        shippingInfo:
            product.shippingInfo ||
            product.shipping ||
            "",

        careInfo:
            product.careInfo ||
            product.care ||
            "",

        tags:
            Array.isArray(product.tags)
                ? product.tags
                : [],

        stock:
            Number(
                product.stock ??
                0
            ),

        customizable:
            Boolean(
                product.customizable
            ),

        isNew:
            Boolean(
                product.isNew
            ),

        bestSeller:
            Boolean(
                product.bestSeller
            ),

        featured:
            Boolean(
                product.featured
            ),

        published:
            product.published !== false,

        tag:
            product.bestSeller
                ? "Best Seller"
                : product.isNew
                    ? "New"
                    : product.tag || "",

        icon:
            product.icon ||
            "3D",

        bg:
            product.bg ||
            "linear-gradient(135deg,#f4f4f4,#e8e8e8)",

        active:
            product.active !== false

    };

}


// =====================================================
// LOAD PRODUCTS
// =====================================================

async function loadProductsFromBackend() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/products`
            );


        if (!response.ok) {

            throw new Error(
                "Could not load products"
            );

        }


        const backendProducts =
            await response.json();


        if (
            Array.isArray(
                backendProducts
            )
        ) {

            products =
                backendProducts
                    .filter(
                        product =>
                            product.active !== false &&
                            product.published !== false
                    )
                    .map(
                        normalizeProduct
                    );

        }

    }

    catch (error) {

        console.warn(
            "Backend products unavailable. Using fallback products.",
            error
        );


        products =
            (
                window.SPANDAN_PRODUCTS ||
                []
            )
                .map(
                    normalizeProduct
                );

    }

}


// =====================================================
// SAVE CART
// =====================================================

function saveCart() {

    localStorage.setItem(
        "spandan-cart",
        JSON.stringify(cart)
    );

    updateCartBadge();

}


// =====================================================
// CART BADGE
// =====================================================

function updateCartBadge() {

    const element =
        $("#cartCount");


    if (!element) {
        return;
    }


    element.textContent =
        Object.values(cart)
            .reduce(
                (total, quantity) =>
                    total +
                    Number(quantity),

                0
            );

}


// =====================================================
// ADD TO CART
// =====================================================

function addToCart(
    id,
    quantity = 1,
    color = ""
) {

    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) {

        toast(
            "Product not found"
        );

        return false;

    }


    const qty =
        Math.max(
            1,
            Number(quantity) || 1
        );


    if (product.colors.length && !color) {
        window.location.href = `product.html?id=${encodeURIComponent(product.id)}`;
        return false;
    }
    if (color && !product.colors.includes(color)) {
        toast("Please choose an available colour");
        return false;
    }
    const key = color ? JSON.stringify([String(id), color]) : String(id);
    cart[key] = Number(cart[key] || 0) + qty;

    saveCart();


    toast(
        qty > 1
            ? `${qty} items added to cart`
            : "Added to cart"
    );


    return true;

}


// =====================================================
// TOAST
// =====================================================

function toast(message) {

    const toastElement =
        $("#toast");


    if (!toastElement) {

        console.log(message);

        return;

    }


    toastElement.textContent =
        message;


    toastElement
        .classList
        .add("show");


    clearTimeout(
        window.__toast
    );


    window.__toast =
        setTimeout(
            () => {

                toastElement
                    .classList
                    .remove("show");

            },
            1800
        );

}

// =====================================================
// PRODUCT CARD
// =====================================================

function cardHTML(product) {

    const image =
        product.mainImage ||
        product.image ||
        "";

    const oldPrice =
        product.old
            ? Number(product.old)
            : 0;

    const sellingPrice =
        Number(product.price || 0);


    // =================================================
    // DISCOUNT
    // =================================================

    let discountHTML = "";

    if (
        oldPrice > sellingPrice &&
        sellingPrice > 0
    ) {

        const discount =
            Math.round(
                (
                    (
                        oldPrice -
                        sellingPrice
                    ) /
                    oldPrice
                ) * 100
            );

        discountHTML = `

            <span class="discount-badge">
                ${discount}% OFF
            </span>

        `;

    }


    // =================================================
    // OLD PRICE
    // =================================================

    const oldPriceHTML =
        oldPrice > sellingPrice

            ? `
                <span class="old-price">
                    ${money(oldPrice)}
                </span>
            `

            : "";


    // =================================================
    // BADGES
    // =================================================

    let badgesHTML = "";


    if (product.isNew) {

        badgesHTML += `

            <span class="product-badge badge-new">
                New
            </span>

        `;

    }


    if (product.bestSeller) {

        badgesHTML += `

            <span class="product-badge badge-best">
                Best Seller
            </span>

        `;

    }


    if (product.customizable) {

        badgesHTML += `

            <span class="product-badge badge-custom">
                Customizable
            </span>

        `;

    }


    // =================================================
    // STOCK
    // =================================================

    let stockHTML = "";


    if (product.stock > 5) {

        stockHTML = `

            <div class="product-stock stock-in">

                <span class="stock-dot"></span>

                In stock

            </div>

        `;

    }

    else if (product.stock > 0) {

        stockHTML = `

            <div class="product-stock stock-low">

                <span class="stock-dot"></span>

                Only ${product.stock} left

            </div>

        `;

    }

    else {

        stockHTML = `

            <div class="product-stock stock-order">

                <span class="stock-dot"></span>

                Made to order

            </div>

        `;

    }


    // =================================================
    // DESCRIPTION
    // =================================================

    const descriptionHTML =
        product.shortDescription

            ? `
                <p class="product-card-description">
                    ${escapeHTML(product.shortDescription)}
                </p>
            `

            : "";


    // =================================================
    // CATEGORY
    // =================================================

    const categoryHTML =
        product.category

            ? `
                <div class="product-card-category">
                    ${escapeHTML(product.category)}
                </div>
            `

            : "";


    // =================================================
    // CARD HTML
    // =================================================

    return `

        <article class="product-card">


            <!-- PRODUCT IMAGE -->

            <div class="product-image-area">


                <a
                    class="product-image-link"
                    href="product.html?id=${encodeURIComponent(product.id)}"
                    aria-label="View ${escapeHTML(product.name)}"
                >

                    ${
                        image

                            ? `
                                <img
                                    src="${escapeHTML(image)}"
                                    alt="${escapeHTML(product.name)}"
                                    loading="lazy"
                                >
                            `

                            : `
                                <div
                                    class="product-shape"
                                    style="
                                        background:
                                        ${product.bg};
                                    "
                                >
                                    ${escapeHTML(product.icon)}
                                </div>
                            `
                    }

                </a>


                ${
                    badgesHTML

                        ? `
                            <div class="product-badges">
                                ${badgesHTML}
                            </div>
                        `

                        : ""
                }


                <!-- QUICK VIEW ON DESKTOP -->

                <a
                    class="product-quick-view"
                    href="product.html?id=${encodeURIComponent(product.id)}"
                >
                    View Product
                </a>


            </div>


            <!-- PRODUCT INFORMATION -->

            <div class="product-card-content">


                ${categoryHTML}


                <h3 class="product-card-title">

                    <a
                        href="product.html?id=${encodeURIComponent(product.id)}"
                    >
                        ${escapeHTML(product.name)}
                    </a>

                </h3>


                ${descriptionHTML}


                <!-- PRICE -->

                <div class="product-card-price">

                    <span class="current-price">
                        ${money(product.price)}
                    </span>

                    ${oldPriceHTML}

                    ${discountHTML}

                </div>


                <!-- STOCK -->

                ${stockHTML}


                <!-- BUTTONS -->

                <div class="product-card-actions">


                    <a
                        class="view-product-button"
                        href="product.html?id=${encodeURIComponent(product.id)}"
                    >
                        View Details
                    </a>


                    <button
                        class="add-to-cart-button"
                        data-add="${escapeHTML(product.id)}"
                        type="button"
                        aria-label="Add ${escapeHTML(product.name)} to cart"
                    >

                        <span class="add-cart-icon">
                            🛒
                        </span>

                        <span>
                            Add to Cart
                        </span>

                    </button>


                </div>


            </div>


        </article>

    `;

}

// =====================================================
// PRODUCT LISTS
// =====================================================

function renderDataLists() {

    $$(
        "[data-product-list]"
    )
        .forEach(
            element => {

                const type =
                    element.dataset.productList;


                let list =
                    [...products];


                if (
                    type === "new"
                ) {

                    list =
                        products.filter(
                            product =>
                                product.isNew
                        );

                }


                if (
                    type === "best"
                ) {

                    list =
                        products.filter(
                            product =>
                                product.bestSeller
                        );

                }


                if (
                    type === "featured"
                ) {

                    list =
                        products.filter(
                            product =>
                                product.featured
                        );

                }


                const limit =
                    Number(
                        element.dataset.limit ||
                        0
                    );


                if (limit) {

                    list =
                        list.slice(
                            0,
                            limit
                        );

                }


                element.innerHTML =
                    list.length

                        ? list
                            .map(cardHTML)
                            .join("")

                        : `
                            <p class="muted">
                                No products available yet.
                            </p>
                        `;

            }
        );

}


// =====================================================
// SHOP PAGE
// =====================================================

function renderShop() {

    const grid =
        $("#shopProducts");


    if (!grid) {
        return;
    }


    const params =
        new URLSearchParams(
            location.search
        );


    let current =
        params.get("category") ||
        "All";


    let search =
        "";


    function setActive() {

        $$(".filter-btn")
            .forEach(
                button => {

                    button
                        .classList
                        .toggle(
                            "active",
                            button.dataset.filter ===
                            current
                        );

                }
            );

    }


    function drawShop() {

        const query =
            search
                .toLowerCase()
                .trim();


        const list =
            products.filter(
                product => {

                    const category =
                        String(
                            product.category ||
                            ""
                        );


                    const name =
                        String(
                            product.name ||
                            ""
                        );


                    const description =
                        String(
                            product.desc ||
                            product.shortDescription ||
                            ""
                        );


                    const categoryMatch =
                        current === "All" ||
                        category.toLowerCase() ===
                        String(current).toLowerCase();


                    const searchMatch =
                        !query ||

                        name
                            .toLowerCase()
                            .includes(query) ||

                        category
                            .toLowerCase()
                            .includes(query) ||

                        description
                            .toLowerCase()
                            .includes(query);


                    return (
                        categoryMatch &&
                        searchMatch
                    );

                }
            );


        grid.innerHTML =
            list.length

                ? list
                    .map(cardHTML)
                    .join("")

                : `
                    <p class="muted">
                        No products found.
                    </p>
                `;

    }


    setActive();

    drawShop();


    $$(".filter-btn")
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        current =
                            button.dataset.filter;


                        setActive();

                        drawShop();

                    }
                );

            }
        );


    $("#shopSearch")
        ?.addEventListener(
            "input",
            event => {

                search =
                    event.target.value;

                drawShop();

            }
        );

}


// =====================================================
// CART ITEMS
// =====================================================

function cartItems() {

    return Object
        .entries(cart)
        .map(
            ([cartKey, quantity]) => {
                let id = cartKey;
                let color = "";
                try {
                    const variant = JSON.parse(cartKey);
                    if (Array.isArray(variant) && variant.length === 2) [id, color] = variant;
                } catch { /* Existing carts use plain product IDs. */ }


                const product =
                    products.find(
                        item =>
                            String(item.id) ===
                            String(id)
                    );


                if (!product) {
                    return null;
                }


                return {

                    ...product,
                    cartKey,
                    color,

                    qty:
                        Number(quantity)

                };

            }
        )
        .filter(Boolean);

}


// =====================================================
// CART PAGE
// =====================================================

function renderCartPage() {

    const wrapper =
        $("#cartPageItems");


    if (!wrapper) {
        return;
    }


    function draw() {

        const items =
            cartItems();


        wrapper.innerHTML =
            items.length

                ? items
                    .map(
                        item => `

                            <div class="cart-line">

                                <div
                                    class="cart-thumb"
                                    style="
                                        background:
                                        ${item.bg}
                                    "
                                >

                                    ${
                                        item.image

                                            ? `
                                                <img
                                                    src="${escapeHTML(item.image)}"
                                                    alt="${escapeHTML(item.name)}${item.color ? " — " + escapeHTML(item.color) : ""}"
                                                >
                                            `

                                            : escapeHTML(item.icon)
                                    }

                                </div>


                                <div class="cart-line-main">

                                    <h3>
                                        ${escapeHTML(item.name)}${item.color ? " — " + escapeHTML(item.color) : ""}
                                    </h3>


                                    <small>
                                        ${money(item.price)}
                                        each
                                    </small>


                                    <div class="qty">

                                        <button
                                            data-dec="${escapeHTML(item.cartKey)}"
                                            type="button"
                                        >
                                            −
                                        </button>

                                        <span>
                                            ${item.qty}
                                        </span>

                                        <button
                                            data-inc="${escapeHTML(item.cartKey)}"
                                            type="button"
                                        >
                                            +
                                        </button>

                                    </div>

                                </div>


                                <strong>

                                    ${money(
                                        item.price *
                                        item.qty
                                    )}

                                </strong>


                                <button
                                    class="remove"
                                    data-remove="${escapeHTML(item.cartKey)}"
                                    type="button"
                                >
                                    ✕
                                </button>

                            </div>

                        `
                    )
                    .join("")

                : `

                    <div class="empty-state">

                        <h2>
                            Your cart is empty
                        </h2>

                        <p>
                            Add something from the shop to continue.
                        </p>

                        <a
                            class="btn btn-dark"
                            href="shop.html"
                        >
                            Go to Shop
                        </a>

                    </div>

                `;


        const subtotal =
            items.reduce(
                (total, item) =>
                    total +
                    item.price *
                    item.qty,

                0
            );


        const subtotalElement =
            $("#cartSubtotal");


        if (subtotalElement) {

            subtotalElement.textContent =
                money(subtotal);

        }

    }


    draw();


    wrapper.addEventListener(
        "click",
        event => {

            const increaseButton =
                event.target.closest(
                    "[data-inc]"
                );


            const decreaseButton =
                event.target.closest(
                    "[data-dec]"
                );


            const removeButton =
                event.target.closest(
                    "[data-remove]"
                );


            if (increaseButton) {

                const id =
                    increaseButton.dataset.inc;


                cart[id] =
                    Number(
                        cart[id] ||
                        0
                    ) + 1;


                saveCart();

                draw();

            }


            if (decreaseButton) {

                const id =
                    decreaseButton.dataset.dec;


                cart[id] =
                    Number(
                        cart[id] ||
                        0
                    ) - 1;


                if (
                    cart[id] <= 0
                ) {

                    delete cart[id];

                }


                saveCart();

                draw();

            }


            if (removeButton) {

                const id =
                    removeButton.dataset.remove;


                delete cart[id];


                saveCart();

                draw();

            }

        }
    );

}


// =====================================================
// CHECKOUT PAGE
// =====================================================

function renderCheckout() {

    const wrapper =
        $("#checkoutItems");


    if (!wrapper) {
        return;
    }


    const items =
        cartItems();


    wrapper.innerHTML =
        items.length

            ? items
                .map(
                    item => `

                        <div class="checkout-item">

                            <span>

                                ${escapeHTML(item.name)}${item.color ? " — " + escapeHTML(item.color) : ""}
                                ×
                                ${item.qty}

                            </span>

                            <strong>

                                ${money(
                                    item.price *
                                    item.qty
                                )}

                            </strong>

                        </div>

                    `
                )
                .join("")

            : `
                <p class="muted">
                    Your cart is empty.
                </p>
            `;


    const total =
        items.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.qty,

            0
        );


    const totalElement =
        $("#checkoutTotal");


    if (totalElement) {

        totalElement.textContent =
            money(total);

    }

}


// =====================================================
// PRODUCT DETAIL PAGE
// =====================================================

function renderProductPage() {

    const holder =
        $("#productDetail");


    if (!holder) {
        return;
    }


    const id =
        new URLSearchParams(
            location.search
        )
            .get("id");


    const product =
        products.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!product) {

        holder.innerHTML = `

            <div class="empty-state">

                <h2>
                    Product not found
                </h2>

                <p>
                    This product may no longer be available.
                </p>

                <a
                    class="btn btn-dark"
                    href="shop.html"
                >
                    Back to Shop
                </a>

            </div>

        `;

        return;

    }


    // =================================================
    // MEDIA
    // =================================================

    const mediaItems = [];


    if (product.mainImage) {

        mediaItems.push({

            type:
                "image",

            url:
                product.mainImage

        });

    }


    product.galleryImages
        .forEach(
            image => {

                if (
                    image &&
                    !mediaItems.some(
                        item =>
                            item.url === image
                    )
                ) {

                    mediaItems.push({

                        type:
                            "image",

                        url:
                            image

                    });

                }

            }
        );


    if (product.productVideo) {

        mediaItems.push({

            type:
                "video",

            url:
                product.productVideo

        });

    }


    // =================================================
    // THUMBNAILS
    // =================================================

    const thumbnailsHTML =
        mediaItems.length > 1

            ? `
                <div class="product-thumbnails">

                    ${mediaItems
                        .map(
                            (
                                media,
                                index
                            ) => {

                                if (
                                    media.type ===
                                    "video"
                                ) {

                                    return `

                                        <button
                                            class="
                                                product-thumbnail
                                                ${index === 0 ? "active" : ""}
                                            "
                                            type="button"
                                            data-media-index="${index}"
                                            aria-label="View product video"
                                        >

                                            <span
                                                style="
                                                    width:100%;
                                                    height:100%;
                                                    display:flex;
                                                    align-items:center;
                                                    justify-content:center;
                                                    font-size:22px;
                                                "
                                            >
                                                ▶
                                            </span>

                                        </button>

                                    `;

                                }


                                return `

                                    <button
                                        class="
                                            product-thumbnail
                                            ${index === 0 ? "active" : ""}
                                        "
                                        type="button"
                                        data-media-index="${index}"
                                        aria-label="View product image"
                                    >

                                        <img
                                            src="${escapeHTML(media.url)}"
                                            alt="${escapeHTML(product.name)}"
                                        >

                                    </button>

                                `;

                            }
                        )
                        .join("")}

                </div>
            `

            : "";


    // =================================================
    // MAIN MEDIA
    // =================================================

    function firstMediaHTML() {

        const first =
            mediaItems[0];


        if (!first) {

            return `

                <div class="product-shape">
                    ${escapeHTML(product.icon)}
                </div>

            `;

        }


        if (
            first.type ===
            "video"
        ) {

            return `

                <video
                    src="${escapeHTML(first.url)}"
                    controls
                    playsinline
                    preload="metadata"
                ></video>

            `;

        }


        return `

            <img
                src="${escapeHTML(first.url)}"
                alt="${escapeHTML(product.name)}"
            >

        `;

    }


    // =================================================
    // PRICE
    // =================================================

    const oldPriceHTML =
        product.old

            ? `
                <span class="product-old-price">
                    ${money(product.old)}
                </span>
            `

            : "";


    let discountHTML = "";


    if (
        product.old &&
        product.old >
        product.price &&
        product.price > 0
    ) {

        const discount =
            Math.round(
                (
                    (
                        product.old -
                        product.price
                    ) /
                    product.old
                ) *
                100
            );


        discountHTML = `

            <span class="product-discount">
                ${discount}% OFF
            </span>

        `;

    }


    // =================================================
    // STOCK
    // =================================================

    const stockHTML =
        product.stock > 0

            ? `
                <div class="stock-row">

                    <span class="stock-dot"></span>

                    <span>
                        In stock
                        ${
                            product.stock <= 5
                                ? `• ${product.stock} left`
                                : ""
                        }
                    </span>

                </div>
            `

            : `
                <div class="stock-row">

                    <span
                        class="stock-dot"
                        style="
                            background:#d98928;
                        "
                    ></span>

                    <span>
                        Made to order
                    </span>

                </div>
            `;


    // =================================================
    // MATERIAL
    // =================================================

    const materialHTML =
        product.material

            ? `
                <div class="option-block">

                    <label>
                        Material
                    </label>

                    <div
                        style="
                            min-height:46px;
                            display:flex;
                            align-items:center;
                            padding:0 13px;
                            border:1px solid #ddd;
                            border-radius:10px;
                            background:#fafafa;
                            font-size:13px;
                        "
                    >
                        ${escapeHTML(product.material)}
                    </div>

                </div>
            `

            : "";


    // =================================================
    // COLORS
    // =================================================

    const colorsHTML =
        product.colors.length

            ? `
                <div class="option-block">

                    <label for="productColor">
                        Available Colour
                    </label>

                    <select
                        class="option-select"
                        id="productColor"
                    >

                        ${product.colors
                            .map(
                                color => `

                                    <option
                                        value="${escapeHTML(color)}"
                                    >
                                        ${escapeHTML(color)}
                                    </option>

                                `
                            )
                            .join("")}

                    </select>

                </div>
            `

            : "";


    // =================================================
    // SPECIFICATIONS
    // =================================================

    const specifications = [];


    if (product.material) {

        specifications.push([
            "Material",
            product.material
        ]);

    }


    if (product.colors.length) {

        specifications.push([
            "Colours",
            product.colors.join(", ")
        ]);

    }


    if (product.dimensions) {

        specifications.push([
            "Dimensions",
            product.dimensions
        ]);

    }


    if (product.weight) {

        specifications.push([
            "Weight",
            product.weight
        ]);

    }


    if (product.printTime) {

        specifications.push([
            "Print Time",
            product.printTime
        ]);

    }


    const specsHTML =
        specifications.length

            ? `
                <div class="product-spec-card">

                    <h2>
                        Product Details
                    </h2>

                    <div class="product-spec-list">

                        ${specifications
                            .map(
                                item => `

                                    <div class="product-spec-row">

                                        <span>
                                            ${escapeHTML(item[0])}
                                        </span>

                                        <strong>
                                            ${escapeHTML(item[1])}
                                        </strong>

                                    </div>

                                `
                            )
                            .join("")}

                    </div>

                </div>
            `

            : "";


    // =================================================
    // DESCRIPTION
    // =================================================

    const descriptionHTML =
        product.desc

            ? `
                <div class="product-description-card">

                    <h2>
                        Description
                    </h2>

                    <p>
                        ${escapeHTML(product.desc)}
                    </p>

                </div>
            `

            : "";


    // =================================================
    // SHIPPING
    // =================================================

    const shippingHTML =
        product.shippingInfo

            ? `
                <div class="product-extra-info">

                    <h3>
                        Shipping Information
                    </h3>

                    <p>
                        ${escapeHTML(product.shippingInfo)}
                    </p>

                </div>
            `

            : "";


    // =================================================
    // CARE
    // =================================================

    const careHTML =
        product.careInfo

            ? `
                <div class="product-extra-info">

                    <h3>
                        Care Instructions
                    </h3>

                    <p>
                        ${escapeHTML(product.careInfo)}
                    </p>

                </div>
            `

            : "";


    // =================================================
    // CUSTOMIZATION
    // =================================================

    const customizationHTML =
        product.customizable

            ? `
                <a
                    class="btn btn-dark"
                    href="custom-print.html"
                    style="
                        margin-top:10px;
                    "
                >
                    Ask for Customization
                </a>
            `

            : "";


    // =================================================
    // PRODUCT HTML
    // =================================================

    holder.innerHTML = `

        <div class="product-detail">


            <!-- LEFT SIDE -->

            <div class="product-gallery">

                ${thumbnailsHTML}


                <div
                    class="product-main-media"
                    id="productMainMedia"
                >

                    ${
                        product.tag

                            ? `
                                <span class="product-badge">
                                    ${escapeHTML(product.tag)}
                                </span>
                            `

                            : ""
                    }


                    ${firstMediaHTML()}

                </div>

            </div>


            <!-- RIGHT SIDE -->

            <div class="product-info">


                ${
                    product.category

                        ? `
                            <p class="product-category">
                                ${escapeHTML(product.category)}
                            </p>
                        `

                        : ""
                }


                <h1 class="product-title">
                    ${escapeHTML(product.name)}
                </h1>


                ${
                    product.shortDescription

                        ? `
                            <p class="product-short-description">
                                ${escapeHTML(product.shortDescription)}
                            </p>
                        `

                        : ""
                }


                <div class="product-price-row">

                    <span class="product-price">
                        ${money(product.price)}
                    </span>

                    ${oldPriceHTML}

                    ${discountHTML}

                </div>


                ${stockHTML}


                ${
                    materialHTML ||
                    colorsHTML

                        ? `
                            <div class="product-options">

                                ${materialHTML}

                                ${colorsHTML}

                            </div>
                        `

                        : ""
                }


                <div class="purchase-row">


                    <div class="quantity-box">

                        <button
                            type="button"
                            id="quantityMinus"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>


                        <input
                            id="productQuantity"
                            type="number"
                            value="1"
                            min="1"
                            max="${
                                product.stock > 0
                                    ? product.stock
                                    : 99
                            }"
                            aria-label="Quantity"
                        >


                        <button
                            type="button"
                            id="quantityPlus"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>

                    </div>


                    <button
                        class="btn btn-primary"
                        data-product-add="${escapeHTML(product.id)}"
                        type="button"
                    >
                        Add to Cart
                    </button>

                </div>


                <button
                    class="btn btn-dark"
                    data-buy-now="${escapeHTML(product.id)}"
                    type="button"
                >
                    Buy Now
                </button>


                ${customizationHTML}


                <div class="product-trust">

                    <div class="product-trust-item">

                        <strong>
                            3D Printed
                        </strong>

                        <span>
                            Made layer by layer
                        </span>

                    </div>


                    <div class="product-trust-item">

                        <strong>
                            Direct Support
                        </strong>

                        <span>
                            WhatsApp assistance
                        </span>

                    </div>


                    <div class="product-trust-item">

                        <strong>
                            Custom Prints
                        </strong>

                        <span>
                            Send your own idea
                        </span>

                    </div>

                </div>


                ${shippingHTML}

                ${careHTML}


            </div>

        </div>


        ${
            descriptionHTML ||
            specsHTML

                ? `
                    <section class="product-extra">

                        ${descriptionHTML}

                        ${specsHTML}

                    </section>
                `

                : ""
        }

    `;


    // =================================================
    // MEDIA SWITCHING
    // =================================================

    const mainMedia =
        $("#productMainMedia");


    const mediaButtons =
        holder.querySelectorAll(
            "[data-media-index]"
        );


    function showMedia(index) {

        const media =
            mediaItems[index];


        if (
            !media ||
            !mainMedia
        ) {
            return;
        }


        const badge =
            product.tag

                ? `
                    <span class="product-badge">
                        ${escapeHTML(product.tag)}
                    </span>
                `

                : "";


        if (
            media.type ===
            "video"
        ) {

            mainMedia.innerHTML = `

                ${badge}

                <video
                    src="${escapeHTML(media.url)}"
                    controls
                    autoplay
                    playsinline
                    preload="metadata"
                ></video>

            `;

        } else {

            mainMedia.innerHTML = `

                ${badge}

                <img
                    src="${escapeHTML(media.url)}"
                    alt="${escapeHTML(product.name)}"
                >

            `;

        }


        mediaButtons
            .forEach(
                button => {

                    button
                        .classList
                        .toggle(
                            "active",
                            Number(
                                button.dataset.mediaIndex
                            ) ===
                            index
                        );

                }
            );

    }


    mediaButtons
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        showMedia(
                            Number(
                                button.dataset.mediaIndex
                            )
                        );

                    }
                );

            }
        );


    // =================================================
    // QUANTITY
    // =================================================

    const quantityInput =
        $("#productQuantity");


    const quantityMinus =
        $("#quantityMinus");


    const quantityPlus =
        $("#quantityPlus");


    function currentQuantity() {

        const max =
            Number(
                quantityInput?.max ||
                99
            );


        const value =
            Math.max(
                1,
                Number(
                    quantityInput?.value ||
                    1
                )
            );


        return Math.min(
            value,
            max
        );

    }


    quantityMinus
        ?.addEventListener(
            "click",
            () => {

                quantityInput.value =
                    Math.max(
                        1,
                        currentQuantity() -
                        1
                    );

            }
        );


    quantityPlus
        ?.addEventListener(
            "click",
            () => {

                const max =
                    Number(
                        quantityInput.max ||
                        99
                    );


                quantityInput.value =
                    Math.min(
                        max,
                        currentQuantity() +
                        1
                    );

            }
        );


    quantityInput
        ?.addEventListener(
            "change",
            () => {

                quantityInput.value =
                    currentQuantity();

            }
        );


    // =================================================
    // PRODUCT ADD TO CART
    // =================================================

    holder
        .querySelector(
            "[data-product-add]"
        )
        ?.addEventListener(
            "click",
            event => {

                addToCart(
                    event.currentTarget
                        .dataset
                        .productAdd,

                    currentQuantity(),
                    holder.querySelector("#productColor")?.value || ""
                );

            }
        );


    // =================================================
    // BUY NOW
    // =================================================

    holder
        .querySelector(
            "[data-buy-now]"
        )
        ?.addEventListener(
            "click",
            event => {

                const productId =
                    event.currentTarget
                        .dataset
                        .buyNow;


                const added =
                    addToCart(
                        productId,
                        currentQuantity(),
                        holder.querySelector("#productColor")?.value || ""
                    );


                if (added) {

                    window.location.href =
                        "checkout.html";

                }

            }
        );

}


// =====================================================
// GLOBAL PRODUCT CARD ADD TO CART
// =====================================================

document.addEventListener(
    "click",
    event => {

        const addButton =
            event.target.closest(
                "[data-add]"
            );


        if (!addButton) {
            return;
        }


        addToCart(
            addButton.dataset.add
        );

    }
);


// =====================================================
// CHECKOUT FORM
// =====================================================

false && $("#checkoutForm")
    ?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const items =
                cartItems();


            if (!items.length) {

                toast(
                    "Your cart is empty"
                );

                return;

            }


            const form =
                event.target;


            const formData =
                new FormData(form);


            const inputs =
                form.querySelectorAll(
                    "input, textarea"
                );


            const customer = {

                firstName:
                    formData.get("firstName") ||
                    inputs[0]?.value ||
                    "",

                lastName:
                    formData.get("lastName") ||
                    inputs[1]?.value ||
                    "",

                phone:
                    formData.get("phone") ||
                    inputs[2]?.value ||
                    "",

                email:
                    formData.get("email") ||
                    inputs[3]?.value ||
                    "",

                address:
                    formData.get("address") ||
                    inputs[4]?.value ||
                    "",

                city:
                    formData.get("city") ||
                    inputs[5]?.value ||
                    "",

                pinCode:
                    formData.get("pinCode") ||
                    inputs[6]?.value ||
                    "",

                state:
                    formData.get("state") ||
                    inputs[7]?.value ||
                    "",

                country:
                    formData.get("country") ||
                    inputs[8]?.value ||
                    "India"

            };


            const orderData = {

                customer,

                items:
                    items.map(
                        item => ({

                            id:
                                item.id,

                            name:
                                item.name,

                            price:
                                item.price,

                            quantity:
                                item.qty,

                            image:
                                item.mainImage ||
                                item.image ||
                                ""

                        })
                    ),

                total:
                    items.reduce(
                        (total, item) =>
                            total +
                            item.price *
                            item.qty,

                        0
                    )

            };


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/orders`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    orderData
                                )

                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Could not create order"
                    );

                }


                alert(
                    `Order placed successfully!\nOrder ID: ${
                        result.order?.orderNumber ||
                        result.orderNumber ||
                        ""
                    }`
                );


                cart = {};


                localStorage.removeItem(
                    "spandan-cart"
                );


                updateCartBadge();


                window.location.href =
                    "index.html";

            }

            catch (error) {

                console.error(
                    "Order error:",
                    error
                );


                alert(
                    error.message ||
                    "Could not place the order. Make sure the backend server is running."
                );

            }

        }
    );


// =====================================================
// START WEBSITE
// =====================================================

async function startWebsite() {

    await loadProductsFromBackend();

    renderDataLists();

    renderShop();

    renderCartPage();

    renderCheckout();

    renderProductPage();

    updateCartBadge();

}


startWebsite();