(() => {
  const API_URL = "https://spandan-3d.onrender.com";

  const form = document.getElementById("checkoutForm");
  const button = document.getElementById("payNowBtn");
  const status = document.getElementById("orderStatus");

  if (!form || !button) return;

  function showStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    status.className = `order-status show ${type}`;
  }

  function getCart() {

    try {
      if (typeof cartItems === "function") {
        const items = cartItems();

        if (Array.isArray(items) && items.length) {
          return items;
        }
      }
    } catch (error) {
      console.warn("cartItems failed:", error);
    }

    try {
      const raw = JSON.parse(
        localStorage.getItem("spandan-cart") || "{}"
      );

      if (
        raw &&
        typeof raw === "object" &&
        typeof products !== "undefined" &&
        Array.isArray(products)
      ) {
        return Object.entries(raw)
          .map(([id, quantity]) => {

            const product = products.find(
              item => String(item.id) === String(id)
            );

            if (!product) return null;

            return {
              ...product,
              qty: Number(quantity) || 1,
              quantity: Number(quantity) || 1
            };
          })
          .filter(Boolean);
      }
    } catch (error) {
      console.warn("Stored cart failed:", error);
    }

    return [];
  }

  function price(item) {
    return Number(item.price ?? item.salePrice ?? item.productPrice ?? 0);
  }

  function qty(item) {
    return Number(item.quantity ?? item.qty ?? 1);
  }

  function name(item) {
    return item.name || item.title || item.productName || "3D Printed Product";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const cart = getCart();

    if (!cart.length) {
      showStatus("Your cart is empty.", "error");
      return;
    }

    if (!form.reportValidity()) return;

    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "Preparing payment...";

    try {
      const fd = new FormData(form);

      const firstName = String(fd.get("firstName") || "").trim();
      const lastName = String(fd.get("lastName") || "").trim();
      const phone = String(fd.get("phone") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const address = String(fd.get("address") || "").trim();
      const city = String(fd.get("city") || "").trim();
      const pinCode = String(fd.get("pinCode") || "").trim();
      const state = String(fd.get("state") || "").trim();
      const country = String(fd.get("country") || "India").trim();

      const total = cart.reduce(
        (sum, item) => sum + price(item) * qty(item),
        0
      );

      const orderData = {
        customer: {
          firstName,
          lastName,
          name: `${firstName} ${lastName}`.trim(),
          phone,
          email,
          address,
          city,
          pinCode,
          state,
          country
        },

        items: cart.map(item => ({
          id: item.id || item.productId || null,
          name: name(item),
          color: item.color || "",
          price: price(item),
          quantity: qty(item),
          subtotal: price(item) * qty(item)
        })),

        subtotal: total,
        shipping: 0,
        total,
        paymentMethod: "Razorpay",
        paymentStatus: "Pending",
        orderStatus: "Pending",
        orderType: "Product"
      };

      button.textContent = "Creating order...";

      const saveResponse = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
      });

      const saved = await saveResponse.json();

      if (!saveResponse.ok || !saved.success) {
        throw new Error(saved.message || "Could not create order.");
      }

      const spandanOrder = saved.order;

      const paymentResponse = await fetch(
        `${API_URL}/api/razorpay/create-order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            amount: total,
            receipt:
              spandanOrder?.orderNumber ||
              `spandan_${Date.now()}`
          })
        }
      );

      const paymentOrder = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentOrder.success) {
        throw new Error(
          paymentOrder.message ||
          "Could not start Razorpay payment."
        );
      }

      const configResponse = await fetch(
        `${API_URL}/api/razorpay/config`
      );

      const config = await configResponse.json();

      if (!config.success) {
        throw new Error("Razorpay configuration unavailable.");
      }

      const options = {
        key: config.keyId,
        amount: paymentOrder.order.amount,
        currency: paymentOrder.order.currency,
        name: "Spandan 3D",
        description: "3D Printed Order",
        order_id: paymentOrder.order.id,

        prefill: {
          name: `${firstName} ${lastName}`.trim(),
          email,
          contact: phone
        },

        theme: {
          color: "#f45d3d"
        },

        handler: async function (response) {
          button.textContent = "Verifying payment...";

          const verifyResponse = await fetch(
            `${API_URL}/api/razorpay/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,

                spandanOrderId:
                  spandanOrder?.id
              })
            }
          );

          const verified = await verifyResponse.json();

          if (!verifyResponse.ok || !verified.verified) {
            throw new Error("Payment verification failed.");
          }

          showStatus(
            `Payment successful. Order ${spandanOrder?.orderNumber || ""} confirmed.`,
            "success"
          );

          localStorage.removeItem("spandan-cart");
          localStorage.removeItem("cart");
          localStorage.removeItem("spandanCart");
          localStorage.removeItem("spandan3dCart");

          button.textContent = "Payment Successful ✓";
          button.disabled = true;

          setTimeout(() => {
            window.location.href = "index.html";
          }, 2500);
        },

        modal: {
          ondismiss: async function () {
            try {
              if (spandanOrder?.id) {
                await fetch(
                  `${API_URL}/api/orders/${spandanOrder.id}/status`,
                  {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      orderStatus: "Cancelled"
                    })
                  }
                );
              }
            } catch (error) {
              console.error("Could not cancel order:", error);
            }

            button.disabled = false;
            button.textContent = originalText;

            showStatus(
              "Payment was cancelled. No order was confirmed.",
              "error"
            );
          }
        }
      };

      const razorpay = new Razorpay(options);

      razorpay.on("payment.failed", async function () {
        try {
          if (spandanOrder?.id) {
            await Promise.all([
              fetch(
                `${API_URL}/api/orders/${spandanOrder.id}/payment`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    paymentStatus: "Failed"
                  })
                }
              ),
              fetch(
                `${API_URL}/api/orders/${spandanOrder.id}/status`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    orderStatus: "Cancelled"
                  })
                }
              )
            ]);
          }
        } catch (error) {
          console.error("Could not mark failed payment:", error);
        }

        showStatus(
          "Payment failed. Your order was not confirmed.",
          "error"
        );

        button.disabled = false;
        button.textContent = originalText;
      });

      button.textContent = "Opening Razorpay...";
      razorpay.open();

    } catch (error) {
      console.error(error);

      showStatus(
        error.message || "Could not start payment.",
        "error"
      );

      button.disabled = false;
      button.textContent = originalText;
    }
  }, true);
})();
