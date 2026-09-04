require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");


// =====================================================
// SUPABASE
// =====================================================

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


// =====================================================
// ORDERS FILE
// =====================================================

const ordersFile =
    path.join(
        __dirname,
        "orders.json"
    );


// =====================================================
// MIGRATION
// =====================================================

async function migrateOrders() {

    try {

        if (
            !fs.existsSync(
                ordersFile
            )
        ) {

            console.log(
                "orders.json not found."
            );

            return;

        }


        const fileContent =
            fs.readFileSync(
                ordersFile,
                "utf8"
            );


        const orders =
            JSON.parse(
                fileContent
            );


        if (
            !Array.isArray(
                orders
            ) ||
            orders.length === 0
        ) {

            console.log(
                "No orders found in orders.json."
            );

            return;

        }


        console.log(
            `Found ${orders.length} order(s).`
        );


        const rows =
            orders.map(
                order => {

                    const customer =
                        order.customer ||
                        {};


                    const customerName =
                        customer.name ||
                        [
                            customer.firstName,
                            customer.lastName
                        ]
                            .filter(Boolean)
                            .join(" ")
                            .trim() ||
                        order.customerName ||
                        "Customer";


                    return {

                        id:
                            Number(
                                order.id
                            ),

                        order_number:
                            order.orderNumber ||
                            `SP${order.id}`,

                        customer_name:
                            customerName,

                        phone:
                            customer.phone ||
                            order.phone ||
                            "",

                        email:
                            customer.email ||
                            order.email ||
                            "",

                        address:
                            customer.address ||
                            order.address ||
                            "",

                        city:
                            customer.city ||
                            order.city ||
                            "",

                        pin_code:
                            customer.pinCode ||
                            customer.pincode ||
                            order.pinCode ||
                            order.pincode ||
                            "",

                        state:
                            customer.state ||
                            order.state ||
                            "",

                        country:
                            customer.country ||
                            order.country ||
                            "India",

                        items:
                            Array.isArray(
                                order.items
                            )
                                ? order.items
                                : [],

                        subtotal:
                            Number(
                                order.subtotal ??
                                order.total ??
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

                        payment_method:
                            order.paymentMethod ||
                            "Online Payment",

                        payment_status:
                            order.paymentStatus ||
                            "Pending",

                        order_status:
                            order.orderStatus ||
                            "Pending",

                        order_type:
                            order.orderType ||
                            "Product",

                        custom_print_id:
                            order.customPrintId ??
                            null,

                        custom_request_number:
                            order.customRequestNumber ||
                            "",

                        created_at:
                            order.createdAt ||
                            new Date()
                                .toISOString(),

                        updated_at:
                            order.updatedAt ||
                            order.createdAt ||
                            new Date()
                                .toISOString()

                    };

                }
            );


        const {
            data,
            error
        } =
            await supabase
                .from(
                    "orders"
                )
                .upsert(
                    rows,
                    {
                        onConflict:
                            "id"
                    }
                )
                .select();


        if (
            error
        ) {

            console.error(
                "Order migration failed:"
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
            "Orders migrated successfully!"
        );

        console.log(
            `${data.length} order(s) saved to Supabase.`
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


migrateOrders();