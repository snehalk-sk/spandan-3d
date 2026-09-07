require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const registerRazorpayRoutes = require("./razorpay-routes");


// =====================================================
// APP
// =====================================================

const app = express();

const PORT =
    process.env.PORT || 5000;


// =====================================================
// SUPABASE
// =====================================================

const SUPABASE_URL =
    process.env.SUPABASE_URL;

const SUPABASE_SECRET_KEY =
    process.env.SUPABASE_SECRET_KEY;


let supabase = null;


if (
    SUPABASE_URL &&
    SUPABASE_SECRET_KEY
) {

    supabase = createClient(
        SUPABASE_URL,
        SUPABASE_SECRET_KEY
    );

}


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    cors({
        origin: "*"
    })
);


app.use(
    express.json({
        limit: "20mb"
    })
);


app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// PATHS
// =====================================================

const ordersFile =
    path.join(
        __dirname,
        "orders.json"
    );


const customPrintsFile =
    path.join(
        __dirname,
        "custom-prints.json"
    );


const uploadsFolder =
    path.join(
        __dirname,
        "uploads"
    );


const productUploadsFolder =
    path.join(
        uploadsFolder,
        "products"
    );


const customPrintUploadsFolder =
    path.join(
        uploadsFolder,
        "custom-prints"
    );


// =====================================================
// FILE / FOLDER HELPERS
// =====================================================

function ensureFolder(folder) {

    if (
        !fs.existsSync(folder)
    ) {

        fs.mkdirSync(
            folder,
            {
                recursive: true
            }
        );

    }

}


function ensureJSONFile(file) {

    if (
        !fs.existsSync(file)
    ) {

        fs.writeFileSync(
            file,
            "[]",
            "utf8"
        );

    }

}


ensureFolder(
    uploadsFolder
);

ensureFolder(
    productUploadsFolder
);

ensureFolder(
    customPrintUploadsFolder
);


ensureJSONFile(
    ordersFile
);

ensureJSONFile(
    customPrintsFile
);


// =====================================================
// STATIC UPLOADS
// =====================================================

app.use(
    "/uploads",
    express.static(
        uploadsFolder
    )
);


// =====================================================
// JSON HELPERS
// =====================================================

function readJSON(file) {

    try {

        const text =
            fs.readFileSync(
                file,
                "utf8"
            );


        if (
            !text.trim()
        ) {

            return [];

        }


        const parsed =
            JSON.parse(
                text
            );


        return Array.isArray(parsed)
            ? parsed
            : [];

    }

    catch (error) {

        console.error(
            "JSON read error:",
            error
        );

        return [];

    }

}


function saveJSON(
    file,
    data
) {

    try {

        fs.writeFileSync(
            file,
            JSON.stringify(
                data,
                null,
                2
            ),
            "utf8"
        );

        return true;

    }

    catch (error) {

        console.error(
            "JSON save error:",
            error
        );

        return false;

    }

}


// =====================================================
// ORDER HELPERS
// =====================================================

function readOrders() {

    return readJSON(
        ordersFile
    );

}


function saveOrders(orders) {

    return saveJSON(
        ordersFile,
        orders
    );

}


// =====================================================
// CUSTOM PRINT HELPERS
// =====================================================

function readCustomPrints() {

    return readJSON(
        customPrintsFile
    );

}


function saveCustomPrints(requests) {

    return saveJSON(
        customPrintsFile,
        requests
    );

}


// =====================================================
// SAFE FILE NAME
// =====================================================

function createSafeFileName(
    originalFileName
) {

    const extension =
        path.extname(
            originalFileName
        );


    const baseName =
        path.basename(
            originalFileName,
            extension
        );


    const safeName =
        baseName
            .replace(
                /[^a-zA-Z0-9-_]/g,
                "-"
            )
            .substring(
                0,
                80
            );


    return (
        Date.now() +
        "-" +
        Math.round(
            Math.random() * 1e9
        ) +
        "-" +
        safeName +
        extension.toLowerCase()
    );

}


// =====================================================
// PRODUCT UPLOAD CONFIG
// =====================================================

const productStorage =
    multer.diskStorage({

        destination(
            req,
            file,
            callback
        ) {

            callback(
                null,
                productUploadsFolder
            );

        },


        filename(
            req,
            file,
            callback
        ) {

            callback(
                null,
                createSafeFileName(
                    file.originalname
                )
            );

        }

    });


function productFileFilter(
    req,
    file,
    callback
) {

    const allowedTypes = [

        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/webm"

    ];


    if (
        allowedTypes.includes(
            file.mimetype
        )
    ) {

        return callback(
            null,
            true
        );

    }


    callback(
        new Error(
            "Unsupported product file type. Use JPG, PNG, WebP, GIF, MP4 or WebM."
        ),
        false
    );

}


const productUpload =
    multer({

        storage:
            productStorage,

        fileFilter:
            productFileFilter,

        limits: {

            fileSize:
                50 *
                1024 *
                1024

        }

    });


// =====================================================
// CUSTOM PRINT UPLOAD CONFIG
// =====================================================

const customPrintStorage =
    multer.diskStorage({

        destination(
            req,
            file,
            callback
        ) {

            callback(
                null,
                customPrintUploadsFolder
            );

        },


        filename(
            req,
            file,
            callback
        ) {

            callback(
                null,
                createSafeFileName(
                    file.originalname
                )
            );

        }

    });


function customPrintFileFilter(
    req,
    file,
    callback
) {

    const extension =
        path.extname(
            file.originalname
        )
            .toLowerCase();


    if (
        file.fieldname ===
        "modelFile"
    ) {

        const allowedModels = [

            ".stl",
            ".3mf",
            ".obj"

        ];


        if (
            allowedModels.includes(
                extension
            )
        ) {

            return callback(
                null,
                true
            );

        }


        return callback(
            new Error(
                "3D model must be STL, 3MF or OBJ."
            ),
            false
        );

    }


    if (
        file.fieldname ===
        "referenceImages"
    ) {

        const allowedImages = [

            "image/jpeg",
            "image/png",
            "image/webp"

        ];


        if (
            allowedImages.includes(
                file.mimetype
            )
        ) {

            return callback(
                null,
                true
            );

        }


        return callback(
            new Error(
                "Reference images must be JPG, PNG or WebP."
            ),
            false
        );

    }


    callback(
        new Error(
            "Unsupported upload field."
        ),
        false
    );

}


const customPrintUpload =
    multer({

        storage:
            customPrintStorage,

        fileFilter:
            customPrintFileFilter,

        limits: {

            fileSize:
                100 *
                1024 *
                1024

        }

    });


// =====================================================
// SUPABASE PRODUCT MAPPER
// =====================================================

function formatProduct(product) {

    if (
        !product
    ) {

        return null;

    }


    return {

        id:
            product.id,

        name:
            product.name || "",

        category:
            product.category || "Idols",

        shortDescription:
            product.short_description || "",

        description:
            product.description || "",

        price:
            Number(
                product.price || 0
            ),

        oldPrice:
            product.mrp !== null &&
            product.mrp !== undefined
                ? Number(
                    product.mrp
                )
                : null,

        stock:
            Number(
                product.stock || 0
            ),

        material:
            product.material || "",

        colors:
            Array.isArray(
                product.colors
            )
                ? product.colors
                : [],

        dimensions:
            product.dimensions || "",

        weight:
            product.weight || "",

        printTime:
            product.print_time || "",

        mainImage:
            product.main_image || "",

        galleryImages:
            Array.isArray(
                product.gallery
            )
                ? product.gallery
                : [],

        productVideo:
            product.product_video || "",

        customizable:
            Boolean(
                product.customizable
            ),

        isNew:
            Boolean(
                product.is_new
            ),

        bestSeller:
            Boolean(
                product.best_seller
            ),

        featured:
            Boolean(
                product.featured
            ),

        published:
            product.published !== false,

        tags:
            Array.isArray(
                product.tags
            )
                ? product.tags
                : [],

        shippingInfo:
            product.shipping_info || "",

        careInfo:
            product.care_info || "",

        createdAt:
            product.created_at,

        updatedAt:
            product.updated_at

    };

}


// =====================================================
// CHECK SUPABASE
// =====================================================

function requireSupabase(
    res
) {

    if (
        supabase
    ) {

        return true;

    }


    res
        .status(500)
        .json({

            success:
                false,

            message:
                "Supabase is not configured. Check server/.env."

        });


    return false;

}


// =====================================================
// HOME
// =====================================================

app.get(
    "/",
    (
        req,
        res
    ) => {

        res.json({

            success:
                true,

            message:
                "Spandan 3D backend is working"

        });

    }
);


// =====================================================
// TEST SUPABASE
// =====================================================

app.get(
    "/api/test-supabase",
    async (
        req,
        res
    ) => {

        try {

            if (
                !requireSupabase(
                    res
                )
            ) {

                return;

            }


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "products"
                    )
                    .select(
                        "id, name"
                    )
                    .limit(
                        1
                    );


            if (
                error
            ) {

                return res
                    .status(500)
                    .json({

                        connected:
                            false,

                        error:
                            error.message

                    });

            }


            res.json({

                connected:
                    true,

                message:
                    "Supabase connected successfully",

                data

            });

        }

        catch (error) {

            res
                .status(500)
                .json({

                    connected:
                        false,

                    error:
                        error.message

                });

        }

    }
);


// =====================================================
// PRODUCT MEDIA UPLOAD
// MUST STAY BEFORE /api/products/:id
// =====================================================

app.post(

    "/api/products/upload",

    productUpload.fields([

        {
            name:
                "mainImage",

            maxCount:
                1
        },

        {
            name:
                "galleryImages",

            maxCount:
                8
        },

        {
            name:
                "productVideo",

            maxCount:
                1
        }

    ]),

    (
        req,
        res
    ) => {

        try {

            const baseURL =
                `${req.protocol}://${req.get(
                    "host"
                )}`;


            let mainImage =
                "";

            let galleryImages =
                [];

            let productVideo =
                "";


            if (
                req.files
                    ?.mainImage
                    ?.[0]
            ) {

                mainImage =
                    `${baseURL}/uploads/products/${req.files.mainImage[0].filename}`;

            }


            if (
                req.files
                    ?.galleryImages
            ) {

                galleryImages =
                    req.files
                        .galleryImages
                        .map(
                            file =>
                                `${baseURL}/uploads/products/${file.filename}`
                        );

            }


            if (
                req.files
                    ?.productVideo
                    ?.[0]
            ) {

                productVideo =
                    `${baseURL}/uploads/products/${req.files.productVideo[0].filename}`;

            }


            res.json({

                success:
                    true,

                mainImage,

                galleryImages,

                productVideo

            });

        }

        catch (error) {

            console.error(
                "Product upload error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not upload product media"

                });

        }

    }

);


// =====================================================
// PRODUCTS - GET ALL
// SUPABASE
// =====================================================

app.get(
    "/api/products",
    async (
        req,
        res
    ) => {

        try {

            if (
                !requireSupabase(
                    res
                )
            ) {

                return;

            }


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "products"
                    )
                    .select(
                        "*"
                    )
                    .order(
                        "created_at",
                        {
                            ascending:
                                false
                        }
                    );


            if (
                error
            ) {

                console.error(
                    "Get products error:",
                    error
                );


                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        message:
                            error.message

                    });

            }


            res.json(
                (data || [])
                    .map(
                        formatProduct
                    )
            );

        }

        catch (error) {

            console.error(
                "Get products error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not load products"

                });

        }

    }
);


// =====================================================
// PRODUCTS - GET ONE
// SUPABASE
// =====================================================

app.get(
    "/api/products/:id",
    async (
        req,
        res
    ) => {

        try {

            if (
                !requireSupabase(
                    res
                )
            ) {

                return;

            }


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "products"
                    )
                    .select(
                        "*"
                    )
                    .eq(
                        "id",
                        req.params.id
                    )
                    .maybeSingle();


            if (
                error
            ) {

                console.error(
                    "Get product error:",
                    error
                );


                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        message:
                            error.message

                    });

            }


            if (
                !data
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Product not found"

                    });

            }


            res.json(
                formatProduct(
                    data
                )
            );

        }

        catch (error) {

            console.error(
                "Get product error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not load product"

                });

        }

    }
);


// =====================================================
// PRODUCTS - CREATE
// SUPABASE
// =====================================================

app.post(
    "/api/products",
    async (
        req,
        res
    ) => {

        try {

            if (
                !requireSupabase(
                    res
                )
            ) {

                return;

            }


            const name =
                String(
                    req.body.name ||
                    ""
                )
                    .trim();


            if (
                !name
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Product name is required"

                    });

            }


            if (
                req.body.price ===
                undefined ||
                req.body.price ===
                null ||
                req.body.price ===
                ""
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Product price is required"

                    });

            }


            const row = {

                name,

                category:
                    req.body.category ||
                    "Idols",

                short_description:
                    req.body.shortDescription ||
                    "",

                description:
                    req.body.description ||
                    "",

                price:
                    Number(
                        req.body.price
                    ),

                mrp:
                    req.body.oldPrice !==
                        undefined &&
                    req.body.oldPrice !==
                        null &&
                    req.body.oldPrice !==
                        ""
                        ? Number(
                            req.body.oldPrice
                        )
                        : null,

                stock:
                    Number(
                        req.body.stock ||
                        0
                    ),

                material:
                    req.body.material ||
                    "",

                colors:
                    Array.isArray(
                        req.body.colors
                    )
                        ? req.body.colors
                        : [],

                dimensions:
                    req.body.dimensions ||
                    "",

                weight:
                    req.body.weight ||
                    "",

                print_time:
                    req.body.printTime ||
                    "",

                main_image:
                    req.body.mainImage ||
                    "",

                gallery:
                    Array.isArray(
                        req.body.galleryImages
                    )
                        ? req.body.galleryImages
                        : [],

                product_video:
                    req.body.productVideo ||
                    "",

                customizable:
                    req.body.customizable ===
                    true,

                is_new:
                    req.body.isNew ===
                    true,

                best_seller:
                    req.body.bestSeller ===
                    true,

                featured:
                    req.body.featured ===
                    true,

                published:
                    req.body.published !==
                    false,

                tags:
                    Array.isArray(
                        req.body.tags
                    )
                        ? req.body.tags
                        : [],

                shipping_info:
                    req.body.shippingInfo ||
                    "",

                care_info:
                    req.body.careInfo ||
                    "",

                updated_at:
                    new Date()
                        .toISOString()

            };


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "products"
                    )
                    .insert(
                        row
                    )
                    .select()
                    .single();


            if (
                error
            ) {

                console.error(
                    "Create product error:",
                    error
                );


                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        message:
                            error.message

                    });

            }


            res
                .status(201)
                .json({

                    success:
                        true,

                    message:
                        "Product created successfully",

                    product:
                        formatProduct(
                            data
                        )

                });

        }

        catch (error) {

            console.error(
                "Create product error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not create product"

                });

        }

    }
);


// =====================================================
// PRODUCTS - UPDATE
// SUPABASE
// =====================================================

app.put(
    "/api/products/:id",
    async (
        req,
        res
    ) => {

        try {

            if (
                !requireSupabase(
                    res
                )
            ) {

                return;

            }


            const updates = {

                updated_at:
                    new Date()
                        .toISOString()

            };


            if (
                req.body.name !==
                undefined
            ) {

                updates.name =
                    String(
                        req.body.name
                    )
                        .trim();

            }


            if (
                req.body.category !==
                undefined
            ) {

                updates.category =
                    req.body.category;

            }


            if (
                req.body.shortDescription !==
                undefined
            ) {

                updates.short_description =
                    req.body.shortDescription;

            }


            if (
                req.body.description !==
                undefined
            ) {

                updates.description =
                    req.body.description;

            }


            if (
                req.body.price !==
                undefined
            ) {

                updates.price =
                    Number(
                        req.body.price
                    );

            }


            if (
                req.body.oldPrice !==
                undefined
            ) {

                updates.mrp =
                    req.body.oldPrice !==
                        null &&
                    req.body.oldPrice !==
                        ""
                        ? Number(
                            req.body.oldPrice
                        )
                        : null;

            }


            if (
                req.body.stock !==
                undefined
            ) {

                updates.stock =
                    Number(
                        req.body.stock
                    );

            }


            if (
                req.body.material !==
                undefined
            ) {

                updates.material =
                    req.body.material;

            }


            if (
                req.body.colors !==
                undefined
            ) {

                updates.colors =
                    Array.isArray(
                        req.body.colors
                    )
                        ? req.body.colors
                        : [];

            }


            if (
                req.body.dimensions !==
                undefined
            ) {

                updates.dimensions =
                    req.body.dimensions;

            }


            if (
                req.body.weight !==
                undefined
            ) {

                updates.weight =
                    req.body.weight;

            }


            if (
                req.body.printTime !==
                undefined
            ) {

                updates.print_time =
                    req.body.printTime;

            }


            if (
                req.body.mainImage !==
                undefined
            ) {

                updates.main_image =
                    req.body.mainImage;

            }


            if (
                req.body.galleryImages !==
                undefined
            ) {

                updates.gallery =
                    Array.isArray(
                        req.body.galleryImages
                    )
                        ? req.body.galleryImages
                        : [];

            }


            if (
                req.body.productVideo !==
                undefined
            ) {

                updates.product_video =
                    req.body.productVideo;

            }


            if (
                req.body.customizable !==
                undefined
            ) {

                updates.customizable =
                    req.body.customizable ===
                    true;

            }


            if (
                req.body.isNew !==
                undefined
            ) {

                updates.is_new =
                    req.body.isNew ===
                    true;

            }


            if (
                req.body.bestSeller !==
                undefined
            ) {

                updates.best_seller =
                    req.body.bestSeller ===
                    true;

            }


            if (
                req.body.featured !==
                undefined
            ) {

                updates.featured =
                    req.body.featured ===
                    true;

            }


            if (
                req.body.published !==
                undefined
            ) {

                updates.published =
                    req.body.published ===
                    true;

            }


            if (
                req.body.tags !==
                undefined
            ) {

                updates.tags =
                    Array.isArray(
                        req.body.tags
                    )
                        ? req.body.tags
                        : [];

            }


            if (
                req.body.shippingInfo !==
                undefined
            ) {

                updates.shipping_info =
                    req.body.shippingInfo;

            }


            if (
                req.body.careInfo !==
                undefined
            ) {

                updates.care_info =
                    req.body.careInfo;

            }


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "products"
                    )
                    .update(
                        updates
                    )
                    .eq(
                        "id",
                        req.params.id
                    )
                    .select()
                    .maybeSingle();


            if (
                error
            ) {

                console.error(
                    "Update product error:",
                    error
                );


                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        message:
                            error.message

                    });

            }


            if (
                !data
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Product not found"

                    });

            }


            res.json({

                success:
                    true,

                message:
                    "Product updated successfully",

                product:
                    formatProduct(
                        data
                    )

            });

        }

        catch (error) {

            console.error(
                "Update product error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not update product"

                });

        }

    }
);


// =====================================================
// PRODUCTS - DELETE
// SUPABASE
// =====================================================

app.delete(
    "/api/products/:id",
    async (
        req,
        res
    ) => {

        try {

            if (
                !requireSupabase(
                    res
                )
            ) {

                return;

            }


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "products"
                    )
                    .delete()
                    .eq(
                        "id",
                        req.params.id
                    )
                    .select()
                    .maybeSingle();


            if (
                error
            ) {

                console.error(
                    "Delete product error:",
                    error
                );


                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        message:
                            error.message

                    });

            }


            if (
                !data
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Product not found"

                    });

            }


            res.json({

                success:
                    true,

                message:
                    "Product deleted successfully",

                product:
                    formatProduct(
                        data
                    )

            });

        }

        catch (error) {

            console.error(
                "Delete product error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not delete product"

                });

        }

    }
);

// =====================================================
// ORDER FORMATTER
// SUPABASE -> EXISTING FRONTEND FORMAT
// =====================================================

function formatOrder(order) {

    if (!order) {
        return null;
    }


    const fullName =
        String(
            order.customer_name ||
            ""
        )
            .trim();


    const nameParts =
        fullName.split(/\s+/);


    const firstName =
        nameParts.length > 0
            ? nameParts[0]
            : "";


    const lastName =
        nameParts.length > 1
            ? nameParts
                .slice(1)
                .join(" ")
            : "";


    return {

        id:
            order.id,

        orderNumber:
            order.order_number ||
            "",


        customer: {

            name:
                fullName,

            firstName,

            lastName,

            phone:
                order.phone ||
                "",

            email:
                order.email ||
                "",

            address:
                order.address ||
                "",

            city:
                order.city ||
                "",

            pinCode:
                order.pin_code ||
                "",

            state:
                order.state ||
                "",

            country:
                order.country ||
                "India"

        },


        items:
            Array.isArray(
                order.items
            )
                ? order.items
                : [],


        subtotal:
            Number(
                order.subtotal ||
                0
            ),

        shipping:
            Number(
                order.shipping ||
                0
            ),

        total:
            Number(
                order.total ||
                0
            ),


        paymentMethod:
            order.payment_method ||
            "Online Payment",

        paymentStatus:
            order.payment_status ||
            "Pending",

        orderStatus:
            order.order_status ||
            "Pending",

        orderType:
            order.order_type ||
            "Product",


        customPrintId:
            order.custom_print_id ??
            null,

        customRequestNumber:
            order.custom_request_number ||
            "",


        createdAt:
            order.created_at,

        updatedAt:
            order.updated_at

    };

}


// =====================================================
// ORDERS - GET ALL
// SUPABASE
// =====================================================

app.get(
    "/api/orders",
    async (
        req,
        res
    ) => {

        try {

            if (
                !requireSupabase(
                    res
                )
            ) {
                return;
            }


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "orders"
                    )
                    .select(
                        "*"
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            if (error) {

                console.error(
                    "Get orders error:",
                    error
                );


                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        message:
                            error.message

                    });

            }


            const orders =
                (data || [])
                    .map(
                        formatOrder
                    );


            res.json(
                orders
            );

        }

        catch (error) {

            console.error(
                "Get orders error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not load orders"

                });

        }

    }
);


// =====================================================
// ORDERS - GET ONE
// SUPABASE
// =====================================================

app.get(
    "/api/orders/:id",
    async (
        req,
        res
    ) => {

        try {

            if (
                !requireSupabase(
                    res
                )
            ) {
                return;
            }


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "orders"
                    )
                    .select(
                        "*"
                    )
                    .eq(
                        "id",
                        req.params.id
                    )
                    .maybeSingle();


            if (error) {

                console.error(
                    "Get order error:",
                    error
                );


                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        message:
                            error.message

                    });

            }


            if (!data) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Order not found"

                    });

            }


            res.json(
                formatOrder(
                    data
                )
            );

        }

        catch (error) {

            console.error(
                "Get order error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not load order"

                });

        }

    }
);


// =====================================================
// GET NEXT ORDER NUMBER
// =====================================================

async function getNextOrderNumber() {

    const {
        data,
        error
    } =
        await supabase
            .from(
                "orders"
            )
            .select(
                "order_number"
            );


    if (error) {

        throw error;

    }


    let highest =
        1000;


    (data || [])
        .forEach(
            order => {

                const number =
                    Number(
                        String(
                            order.order_number ||
                            ""
                        )
                            .replace(
                                /\D/g,
                                ""
                            )
                    );


                if (
                    Number.isFinite(
                        number
                    ) &&
                    number > highest
                ) {

                    highest =
                        number;

                }

            }
        );


    return (
        `SP${highest + 1}`
    );

}


// =====================================================
// ORDERS - CREATE
// SUPABASE
// =====================================================

app.post(
    "/api/orders",
    async (
        req,
        res
    ) => {

        try {

            if (
                !requireSupabase(
                    res
                )
            ) {
                return;
            }


            const {
                customer,
                items,
                total
            } =
                req.body;


            if (!customer) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Customer details are required"

                    });

            }


            if (
                !Array.isArray(
                    items
                ) ||
                items.length === 0
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Order must contain products"

                    });

            }


            const customerName =
                String(
                    customer.name ||
                    [
                        customer.firstName,
                        customer.lastName
                    ]
                        .filter(
                            Boolean
                        )
                        .join(" ") ||
                    req.body.customerName ||
                    ""
                )
                    .trim();


            if (!customerName) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Customer name is required"

                    });

            }


            const phone =
                String(
                    customer.phone ||
                    req.body.phone ||
                    ""
                )
                    .trim();


            if (!phone) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Phone number is required"

                    });

            }


            const orderNumber =
                await getNextOrderNumber();


            const now =
                new Date()
                    .toISOString();


            const row = {

                order_number:
                    orderNumber,

                customer_name:
                    customerName,

                phone,

                email:
                    customer.email ||
                    req.body.email ||
                    "",

                address:
                    customer.address ||
                    req.body.address ||
                    "",

                city:
                    customer.city ||
                    req.body.city ||
                    "",

                pin_code:
                    customer.pinCode ||
                    customer.pincode ||
                    req.body.pinCode ||
                    req.body.pincode ||
                    "",

                state:
                    customer.state ||
                    req.body.state ||
                    "",

                country:
                    customer.country ||
                    req.body.country ||
                    "India",


                items,


                subtotal:
                    Number(
                        req.body.subtotal ??
                        total ??
                        0
                    ),

                shipping:
                    Number(
                        req.body.shipping ||
                        0
                    ),

                total:
                    Number(
                        total ||
                        req.body.total ||
                        0
                    ),


                payment_method:
                    req.body.paymentMethod ||
                    "Online Payment",

                payment_status:
                    req.body.paymentStatus ||
                    "Pending",

                order_status:
                    req.body.orderStatus ||
                    "Pending",

                order_type:
                    req.body.orderType ||
                    "Product",


                custom_print_id:
                    req.body.customPrintId ??
                    null,

                custom_request_number:
                    req.body.customRequestNumber ||
                    "",


                created_at:
                    now,

                updated_at:
                    now

            };


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "orders"
                    )
                    .insert(
                        row
                    )
                    .select()
                    .single();


            if (error) {

                console.error(
                    "Create order error:",
                    error
                );


                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        message:
                            error.message

                    });

            }


            res
                .status(201)
                .json({

                    success:
                        true,

                    message:
                        "Order created successfully",

                    order:
                        formatOrder(
                            data
                        )

                });

        }

        catch (error) {

            console.error(
                "Create order error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        error.message ||
                        "Could not create order"

                });

        }

    }
);


// =====================================================
// ORDERS - UPDATE ORDER STATUS
// SUPABASE
// =====================================================

app.patch(
    "/api/orders/:id/status",
    async (
        req,
        res
    ) => {

        try {

            if (
                !requireSupabase(
                    res
                )
            ) {
                return;
            }


            const allowedStatuses = [

                "Pending",
                "Confirmed",
                "Printing",
                "Ready",
                "Shipped",
                "Delivered",
                "Cancelled"

            ];


            const orderStatus =
                req.body.orderStatus;


            if (
                !allowedStatuses.includes(
                    orderStatus
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Invalid order status"

                    });

            }


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "orders"
                    )
                    .update({

                        order_status:
                            orderStatus,

                        updated_at:
                            new Date()
                                .toISOString()

                    })
                    .eq(
                        "id",
                        req.params.id
                    )
                    .select()
                    .maybeSingle();


            if (error) {

                console.error(
                    "Order status error:",
                    error
                );


                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        message:
                            error.message

                    });

            }


            if (!data) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Order not found"

                    });

            }


            res.json({

                success:
                    true,

                message:
                    "Order status updated successfully",

                order:
                    formatOrder(
                        data
                    )

            });

        }

        catch (error) {

            console.error(
                "Order status error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not update order status"

                });

        }

    }
);


// =====================================================
// ORDERS - UPDATE PAYMENT STATUS
// SUPABASE
// =====================================================

app.patch(
    "/api/orders/:id/payment",
    async (
        req,
        res
    ) => {

        try {

            if (
                !requireSupabase(
                    res
                )
            ) {
                return;
            }


            const allowedStatuses = [

                "Pending",
                "Paid",
                "Failed",
                "Refunded"

            ];


            const paymentStatus =
                req.body.paymentStatus;


            if (
                !allowedStatuses.includes(
                    paymentStatus
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Invalid payment status"

                    });

            }


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "orders"
                    )
                    .update({

                        payment_status:
                            paymentStatus,

                        updated_at:
                            new Date()
                                .toISOString()

                    })
                    .eq(
                        "id",
                        req.params.id
                    )
                    .select()
                    .maybeSingle();


            if (error) {

                console.error(
                    "Payment status error:",
                    error
                );


                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        message:
                            error.message

                    });

            }


            if (!data) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Order not found"

                    });

            }


            res.json({

                success:
                    true,

                message:
                    "Payment status updated successfully",

                order:
                    formatOrder(
                        data
                    )

            });

        }

        catch (error) {

            console.error(
                "Payment status error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not update payment status"

                });

        }

    }
);


// =====================================================
// ORDERS - DELETE
// SUPABASE
// =====================================================

app.delete(
    "/api/orders/:id",
    async (
        req,
        res
    ) => {

        try {

            if (
                !requireSupabase(
                    res
                )
            ) {
                return;
            }


            const {
                data,
                error
            } =
                await supabase
                    .from(
                        "orders"
                    )
                    .delete()
                    .eq(
                        "id",
                        req.params.id
                    )
                    .select()
                    .maybeSingle();


            if (error) {

                console.error(
                    "Delete order error:",
                    error
                );


                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        message:
                            error.message

                    });

            }


            if (!data) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Order not found"

                    });

            }


            res.json({

                success:
                    true,

                message:
                    "Order deleted successfully",

                order:
                    formatOrder(
                        data
                    )

            });

        }

        catch (error) {

            console.error(
                "Delete order error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not delete order"

                });

        }

    }
);

// =====================================================
// ORDERS - DELETE
// =====================================================

app.delete(
    "/api/orders/:id",
    (
        req,
        res
    ) => {

        try {

            const orders =
                readOrders();


            const index =
                orders.findIndex(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            req.params.id
                        )
                );


            if (
                index === -1
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Order not found"

                    });

            }


            const deletedOrder =
                orders.splice(
                    index,
                    1
                )[0];


            saveOrders(
                orders
            );


            res.json({

                success:
                    true,

                message:
                    "Order deleted successfully",

                order:
                    deletedOrder

            });

        }

        catch (error) {

            console.error(
                "Delete order error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not delete order"

                });

        }

    }
);


// =====================================================
// CUSTOM PRINTS - GET ALL
// JSON FOR NOW
// =====================================================

app.get(
    "/api/custom-prints",
    (
        req,
        res
    ) => {

        res.json(
            readCustomPrints()
        );

    }
);


// =====================================================
// CUSTOM PRINTS - GET ONE
// =====================================================

app.get(
    "/api/custom-prints/:id",
    (
        req,
        res
    ) => {

        const requests =
            readCustomPrints();


        const request =
            requests.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        req.params.id
                    )
            );


        if (
            !request
        ) {

            return res
                .status(404)
                .json({

                    success:
                        false,

                    message:
                        "Custom print request not found"

                });

        }


        res.json(
            request
        );

    }
);


// =====================================================
// CUSTOM PRINTS - CREATE
// =====================================================

app.post(

    "/api/custom-prints",

    customPrintUpload.fields([

        {
            name:
                "modelFile",

            maxCount:
                1
        },

        {
            name:
                "referenceImages",

            maxCount:
                6
        }

    ]),

    (
        req,
        res
    ) => {

        try {

            const name =
                String(
                    req.body.name ||
                    ""
                )
                    .trim();


            const phone =
                String(
                    req.body.phone ||
                    ""
                )
                    .trim();


            const details =
                String(
                    req.body.details ||
                    ""
                )
                    .trim();


            if (
                !name
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Name is required"

                    });

            }


            if (
                !phone
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Phone / WhatsApp number is required"

                    });

            }


            if (
                !details
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Please describe what you want printed"

                    });

            }


            const requests =
                readCustomPrints();


            const baseURL =
                `${req.protocol}://${req.get(
                    "host"
                )}`;


            let modelFile =
                null;


            if (
                req.files
                    ?.modelFile
                    ?.[0]
            ) {

                const file =
                    req.files.modelFile[0];


                modelFile = {

                    originalName:
                        file.originalname,

                    fileName:
                        file.filename,

                    size:
                        file.size,

                    mimeType:
                        file.mimetype,

                    url:
                        `${baseURL}/uploads/custom-prints/${file.filename}`

                };

            }


            const referenceImages =
                (
                    req.files
                        ?.referenceImages ||
                    []
                )
                    .map(
                        file => ({

                            originalName:
                                file.originalname,

                            fileName:
                                file.filename,

                            size:
                                file.size,

                            mimeType:
                                file.mimetype,

                            url:
                                `${baseURL}/uploads/custom-prints/${file.filename}`

                        })
                    );


            const now =
                new Date()
                    .toISOString();


            const requestNumber =
                `CP${1000 + requests.length + 1}`;


            const newRequest = {

                id:
                    Date.now(),

                requestNumber,

                name,

                phone,

                email:
                    String(
                        req.body.email ||
                        ""
                    )
                        .trim(),

                details,

                quantity:
                    Math.max(
                        1,
                        Number(
                            req.body.quantity ||
                            1
                        )
                    ),

                size:
                    String(
                        req.body.size ||
                        ""
                    )
                        .trim(),

                material:
                    String(
                        req.body.material ||
                        ""
                    )
                        .trim(),

                color:
                    String(
                        req.body.color ||
                        ""
                    )
                        .trim(),

                requiredBy:
                    req.body.requiredBy ||
                    "",

                reference:
                    String(
                        req.body.reference ||
                        ""
                    )
                        .trim(),

                modelFile,

                referenceImages,

                quote:
                    null,

                adminNotes:
                    "",

                status:
                    "New",

                createdAt:
                    now,

                updatedAt:
                    now

            };


            requests.push(
                newRequest
            );


            if (
                !saveCustomPrints(
                    requests
                )
            ) {

                return res
                    .status(500)
                    .json({

                        success:
                            false,

                        message:
                            "Could not save custom print request"

                    });

            }


            res
                .status(201)
                .json({

                    success:
                        true,

                    message:
                        "Custom print request sent successfully",

                    requestNumber,

                    request:
                        newRequest

                });

        }

        catch (error) {

            console.error(
                "Create custom print error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not create custom print request"

                });

        }

    }

);


// =====================================================
// CUSTOM PRINT - STATUS
// =====================================================

app.patch(
    "/api/custom-prints/:id/status",
    (
        req,
        res
    ) => {

        try {

            const requests =
                readCustomPrints();


            const request =
                requests.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            req.params.id
                        )
                );


            if (
                !request
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Custom print request not found"

                    });

            }


            const allowedStatuses = [

                "New",
                "Reviewing",
                "Quoted",
                "Approved",
                "Printing",
                "Completed",
                "Rejected"

            ];


            if (
                !allowedStatuses.includes(
                    req.body.status
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Invalid custom print status"

                    });

            }


            request.status =
                req.body.status;


            request.updatedAt =
                new Date()
                    .toISOString();


            saveCustomPrints(
                requests
            );


            res.json({

                success:
                    true,

                message:
                    "Custom print status updated",

                request

            });

        }

        catch (error) {

            console.error(
                "Custom print status error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not update request status"

                });

        }

    }
);


// =====================================================
// CUSTOM PRINT - QUOTE
// =====================================================

app.patch(
    "/api/custom-prints/:id/quote",
    (
        req,
        res
    ) => {

        try {

            const requests =
                readCustomPrints();


            const request =
                requests.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            req.params.id
                        )
                );


            if (
                !request
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Custom print request not found"

                    });

            }


            const quote =
                Number(
                    req.body.quote
                );


            if (
                Number.isNaN(
                    quote
                ) ||
                quote < 0
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Enter a valid quote amount"

                    });

            }


            request.quote =
                quote;


            if (
                request.status ===
                    "New" ||
                request.status ===
                    "Reviewing"
            ) {

                request.status =
                    "Quoted";

            }


            request.updatedAt =
                new Date()
                    .toISOString();


            saveCustomPrints(
                requests
            );


            res.json({

                success:
                    true,

                message:
                    "Quote saved successfully",

                request

            });

        }

        catch (error) {

            console.error(
                "Custom print quote error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not save quote"

                });

        }

    }
);


// =====================================================
// CUSTOM PRINT - NOTES
// =====================================================

app.patch(
    "/api/custom-prints/:id/notes",
    (
        req,
        res
    ) => {

        try {

            const requests =
                readCustomPrints();


            const request =
                requests.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            req.params.id
                        )
                );


            if (
                !request
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Custom print request not found"

                    });

            }


            request.adminNotes =
                String(
                    req.body.adminNotes ||
                    ""
                );


            request.updatedAt =
                new Date()
                    .toISOString();


            saveCustomPrints(
                requests
            );


            res.json({

                success:
                    true,

                message:
                    "Admin notes saved",

                request

            });

        }

        catch (error) {

            console.error(
                "Custom print notes error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not save admin notes"

                });

        }

    }
);


// =====================================================
// CUSTOM PRINT - GENERIC UPDATE
// =====================================================

app.patch(
    "/api/custom-prints/:id",
    (
        req,
        res
    ) => {

        try {

            const requests =
                readCustomPrints();


            const index =
                requests.findIndex(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            req.params.id
                        )
                );


            if (
                index === -1
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Custom print request not found"

                    });

            }


            const request =
                requests[index];


            if (
                req.body.quote !==
                undefined
            ) {

                const quote =
                    Number(
                        req.body.quote
                    );


                if (
                    !Number.isNaN(
                        quote
                    ) &&
                    quote >= 0
                ) {

                    request.quote =
                        quote;

                }

            }


            if (
                req.body.adminNotes !==
                undefined
            ) {

                request.adminNotes =
                    String(
                        req.body.adminNotes ||
                        ""
                    );

            }


            const allowedStatuses = [

                "New",
                "Reviewing",
                "Quoted",
                "Approved",
                "Printing",
                "Completed",
                "Rejected"

            ];


            if (
                req.body.status &&
                allowedStatuses.includes(
                    req.body.status
                )
            ) {

                request.status =
                    req.body.status;

            }


            request.updatedAt =
                new Date()
                    .toISOString();


            requests[index] =
                request;


            saveCustomPrints(
                requests
            );


            res.json({

                success:
                    true,

                message:
                    "Custom print request updated",

                request

            });

        }

        catch (error) {

            console.error(
                "Update custom print error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not update custom print request"

                });

        }

    }
);


// =====================================================
// CUSTOM PRINT - DELETE
// =====================================================

app.delete(
    "/api/custom-prints/:id",
    (
        req,
        res
    ) => {

        try {

            const requests =
                readCustomPrints();


            const index =
                requests.findIndex(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            req.params.id
                        )
                );


            if (
                index === -1
            ) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Custom print request not found"

                    });

            }


            const deletedRequest =
                requests.splice(
                    index,
                    1
                )[0];


            saveCustomPrints(
                requests
            );


            res.json({

                success:
                    true,

                message:
                    "Custom print request deleted",

                request:
                    deletedRequest

            });

        }

        catch (error) {

            console.error(
                "Delete custom print error:",
                error
            );


            res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Could not delete custom print request"

                });

        }

    }
);


// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        if (
            error instanceof
            multer.MulterError
        ) {

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        error.code ===
                        "LIMIT_FILE_SIZE"
                            ? "Uploaded file is too large."
                            : error.message

                });

        }


        if (
            error
        ) {

            console.error(
                "Server error:",
                error
            );


            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        error.message ||
                        "Server error"

                });

        }


        next();

    }
);


// =====================================================
// API 404
// =====================================================

app.use(
    "/api",
    (
        req,
        res
    ) => {

        res
            .status(404)
            .json({

                success:
                    false,

                message:
                    "API route not found",

                route:
                    `${req.method} ${req.originalUrl}`

            });

    }
);


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    () => {

        console.log(
            "-------------------------------------"
        );

        console.log(
            "Spandan 3D backend started"
        );

        console.log(
            `http://localhost:${PORT}`
        );


        if (
            supabase
        ) {

            console.log(
                "Supabase client configured"
            );

        }

        else {

            console.log(
                "WARNING: Supabase environment variables missing"
            );

        }


        console.log(
            `Supabase Test: http://localhost:${PORT}/api/test-supabase`
        );

        console.log(
            `Products: http://localhost:${PORT}/api/products`
        );

        console.log(
            `Orders: http://localhost:${PORT}/api/orders`
        );

        console.log(
            `Custom Prints: http://localhost:${PORT}/api/custom-prints`
        );

        console.log(
            "-------------------------------------"
        );

    }
);