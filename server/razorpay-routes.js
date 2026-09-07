const Razorpay = require("razorpay");
const crypto = require("crypto");

module.exports = function registerRazorpayRoutes(app, supabase) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const razorpay =
        keyId && keySecret
            ? new Razorpay({
                key_id: keyId,
                key_secret: keySecret
            })
            : null;

    app.get("/api/razorpay/config", (req, res) => {
        if (!keyId) {
            return res.status(500).json({
                success: false,
                message: "Razorpay is not configured"
            });
        }

        res.json({
            success: true,
            keyId
        });
    });

    app.post("/api/razorpay/create-order", async (req, res) => {
        try {
            if (!razorpay) {
                return res.status(500).json({
                    success: false,
                    message: "Razorpay is not configured"
                });
            }

            const amount = Number(req.body.amount);

            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid payment amount"
                });
            }

            const order = await razorpay.orders.create({
                amount: Math.round(amount * 100),
                currency: "INR",
                receipt: String(
                    req.body.receipt || ("spandan_" + Date.now())
                ).slice(0, 40)
            });

            res.json({
                success: true,
                order
            });
        } catch (error) {
            console.error("Razorpay order error:", error);

            res.status(500).json({
                success: false,
                message: error.message || "Could not create Razorpay order"
            });
        }
    });


    app.post("/api/razorpay/sync-payment", async (req, res) => {
        try {
            if (!razorpay) {
                return res.status(500).json({
                    success: false,
                    message: "Razorpay is not configured"
                });
            }

            const {
                razorpayPaymentId,
                spandanOrderId
            } = req.body;

            if (!razorpayPaymentId || !spandanOrderId) {
                return res.status(400).json({
                    success: false,
                    message: "Payment ID and Spandan order ID are required"
                });
            }

            const payment = await razorpay.payments.fetch(
                razorpayPaymentId
            );

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: "Razorpay payment not found"
                });
            }

            if (
                payment.status !== "captured" &&
                payment.status !== "authorized"
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Payment is not successful",
                    paymentStatus: payment.status
                });
            }

            const { data, error } = await supabase
                .from("orders")
                .update({
                    payment_status: "Paid",
                    order_status: "Confirmed",
                    updated_at: new Date().toISOString()
                })
                .eq("id", spandanOrderId)
                .select()
                .maybeSingle();

            if (error) {
                console.error(
                    "Sync payment update error:",
                    error
                );

                return res.status(500).json({
                    success: false,
                    message: "Could not update order"
                });
            }

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Spandan order not found"
                });
            }

            res.json({
                success: true,
                synced: true,
                razorpayStatus: payment.status,
                order: data
            });

        } catch (error) {
            console.error(
                "Sync payment error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Could not sync payment"
            });
        }
    });

    app.post("/api/razorpay/verify", async (req, res) => {
        try {
            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                spandanOrderId
            } = req.body;

            if (
                !razorpay_order_id ||
                !razorpay_payment_id ||
                !razorpay_signature
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Missing payment verification details"
                });
            }

            const expectedSignature = crypto
                .createHmac("sha256", keySecret)
                .update(
                    razorpay_order_id + "|" + razorpay_payment_id
                )
                .digest("hex");

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: "Payment verification failed"
                });
            }

            if (!supabase || !spandanOrderId) {
                return res.status(500).json({
                    success: false,
                    message: "Order could not be linked to payment"
                });
            }

            const { data, error } = await supabase
                .from("orders")
                .update({
                    payment_status: "Paid",
                    order_status: "Confirmed",
                    updated_at: new Date().toISOString()
                })
                .eq("id", spandanOrderId)
                .select()
                .maybeSingle();

            if (error) {
                console.error("Order payment update error:", error);

                return res.status(500).json({
                    success: false,
                    message: "Payment verified but order update failed"
                });
            }

            if (!data) {
                return res.status(404).json({
                    success: false,
                    message: "Payment verified but order was not found"
                });
            }

            res.json({
                success: true,
                verified: true,
                paymentId: razorpay_payment_id
            });
        } catch (error) {
            console.error("Payment verification error:", error);

            res.status(500).json({
                success: false,
                message: "Payment verification failed"
            });
        }
    });
};
