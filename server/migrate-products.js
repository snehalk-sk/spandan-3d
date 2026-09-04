require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");


const supabaseUrl =
    process.env.SUPABASE_URL;

const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY;


if (
    !supabaseUrl ||
    !supabaseSecretKey
) {

    console.error(
        "Supabase environment variables are missing."
    );

    process.exit(1);

}


const supabase =
    createClient(
        supabaseUrl,
        supabaseSecretKey
    );


const productsFile =
    path.join(
        __dirname,
        "products.json"
    );


async function migrateProducts() {

    try {

        if (
            !fs.existsSync(productsFile)
        ) {

            console.log(
                "products.json not found."
            );

            return;

        }


        const fileContent =
            fs.readFileSync(
                productsFile,
                "utf8"
            );


        const products =
            JSON.parse(
                fileContent
            );


        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            console.log(
                "No products found in products.json."
            );

            return;

        }


        console.log(
            `Found ${products.length} product(s).`
        );


        const rows =
            products.map(
                product => ({

                    id:
                        Number(product.id),

                    name:
                        product.name ||
                        "Untitled Product",

                    category:
                        product.category ||
                        "Idols",

                    short_description:
                        product.shortDescription ||
                        "",

                    description:
                        product.description ||
                        "",

                    price:
                        Number(
                            product.price ||
                            0
                        ),

                    mrp:
                        product.oldPrice
                            ? Number(
                                product.oldPrice
                            )
                            : null,

                    stock:
                        Number(
                            product.stock ||
                            0
                        ),

                    material:
                        product.material ||
                        "",

                    colors:
                        Array.isArray(
                            product.colors
                        )
                            ? product.colors
                            : [],

                    dimensions:
                        product.dimensions ||
                        "",

                    weight:
                        product.weight ||
                        "",

                    print_time:
                        product.printTime ||
                        "",

                    main_image:
                        product.mainImage ||
                        "",

                    gallery:
                        Array.isArray(
                            product.galleryImages
                        )
                            ? product.galleryImages
                            : [],

                    product_video:
                        product.productVideo ||
                        "",

                    customizable:
                        Boolean(
                            product.customizable
                        ),

                    is_new:
                        Boolean(
                            product.isNew
                        ),

                    best_seller:
                        Boolean(
                            product.bestSeller
                        ),

                    featured:
                        Boolean(
                            product.featured
                        ),

                    published:
                        product.published !==
                        false,

                    tags:
                        Array.isArray(
                            product.tags
                        )
                            ? product.tags
                            : [],

                    shipping_info:
                        product.shippingInfo ||
                        "",

                    care_info:
                        product.careInfo ||
                        "",

                    created_at:
                        product.createdAt ||
                        new Date().toISOString(),

                    updated_at:
                        product.updatedAt ||
                        new Date().toISOString()

                })
            );


        const {
            data,
            error
        } =
            await supabase
                .from("products")
                .upsert(
                    rows,
                    {
                        onConflict: "id"
                    }
                )
                .select();


        if (
            error
        ) {

            console.error(
                "Migration failed:"
            );

            console.error(
                error
            );

            return;

        }


        console.log(
            "--------------------------------"
        );

        console.log(
            "Products migrated successfully!"
        );

        console.log(
            `${data.length} product(s) saved to Supabase.`
        );

        console.log(
            "--------------------------------"
        );

    }

    catch (error) {

        console.error(
            "Migration error:",
            error
        );

    }

}


migrateProducts();
