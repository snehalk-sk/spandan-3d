// =====================================================
// SPANDAN 3D - ADMIN JAVASCRIPT
// =====================================================

const API_URL = "https://spandan-3d.onrender.com";

let orders = [];
let products = [];
let customPrints = [];


// =====================================================
// PRODUCT MEDIA STATE
// =====================================================

let currentProductMedia = {
    mainImage: "",
    galleryImages: [],
    productVideo: ""
};

let pendingProductMedia = {
    mainImageFile: null,
    galleryFiles: [],
    productVideoFile: null
};

let previewObjectURLs = [];


// =====================================================
// HELPERS
// =====================================================

function money(value) {

    return (
        "₹" +
        Number(value || 0)
            .toLocaleString("en-IN")
    );

}


function showMessage(message) {

    const box =
        document.getElementById(
            "adminMessage"
        );

    if (!box) {
        return;
    }

    box.textContent =
        message;

    box.classList.add(
        "show"
    );

    clearTimeout(
        window.messageTimer
    );

    window.messageTimer =
        setTimeout(
            () => {

                box.classList.remove(
                    "show"
                );

            },
            2000
        );

}


// =====================================================
// SIDEBAR
// =====================================================

const sidebar =
    document.getElementById(
        "sidebar"
    );

const overlay =
    document.getElementById(
        "sidebarOverlay"
    );

const menuButton =
    document.getElementById(
        "menuButton"
    );

const closeSidebarButton =
    document.getElementById(
        "closeSidebar"
    );


menuButton?.addEventListener(
    "click",
    () => {

        sidebar?.classList.add(
            "open"
        );

        overlay?.classList.add(
            "show"
        );

    }
);


function closeSidebar() {

    sidebar?.classList.remove(
        "open"
    );

    overlay?.classList.remove(
        "show"
    );

}


closeSidebarButton
    ?.addEventListener(
        "click",
        closeSidebar
    );


overlay
    ?.addEventListener(
        "click",
        closeSidebar
    );


// =====================================================
// PAGE NAVIGATION
// =====================================================

function openPage(pageName) {

    document
        .querySelectorAll(
            ".admin-page"
        )
        .forEach(
            page => {

                page.classList.remove(
                    "active-page"
                );

            }
        );


    document
        .querySelectorAll(
            ".nav-link"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    document
        .getElementById(
            `${pageName}Page`
        )
        ?.classList
        .add(
            "active-page"
        );


    document
        .querySelector(
            `.nav-link[data-page="${pageName}"]`
        )
        ?.classList
        .add(
            "active"
        );


    closeSidebar();

}


document
    .querySelectorAll(
        ".nav-link"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openPage(
                        button.dataset.page
                    );

                }
            );

        }
    );


document
    .querySelectorAll(
        "[data-open-page]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openPage(
                        button.dataset.openPage
                    );

                }
            );

        }
    );


// =====================================================
// ORDERS
// =====================================================

async function loadOrders() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/orders`
            );


        if (!response.ok) {

            throw new Error(
                "Could not load orders"
            );

        }


        orders =
            await response.json();


        updateStats();

        renderRecentOrders();

        renderOrders();

        renderCustomers(); const d=document.getElementById("dashboardCustomersCount"); if(d){d.textContent=buildCustomersFromOrders().length;}

    }

    catch (error) {

        console.error(
            "Orders error:",
            error
        );

    }

}


// =====================================================
// DASHBOARD STATS
// =====================================================

function updateStats() {

    const totalRevenue =
        orders
            .filter(
                order =>
                    String(
                        order.paymentStatus || ""
                    ).toLowerCase() === "paid"
            )
            .reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    Number(
                        order.total || 0
                    ),
                0
            );


    const pending =
        orders.filter(
            order =>
                order.orderStatus ===
                "Pending"
        ).length;


    const delivered =
        orders.filter(
            order =>
                order.orderStatus ===
                "Delivered"
        ).length;


    const totalOrdersElement =
        document.getElementById(
            "totalOrders"
        );

    const totalRevenueElement =
        document.getElementById(
            "totalRevenue"
        );

    const pendingElement =
        document.getElementById(
            "pendingOrders"
        );

    const deliveredElement =
        document.getElementById(
            "deliveredOrders"
        );


    if (totalOrdersElement) {

        totalOrdersElement.textContent =
            orders.length;

    }


    if (totalRevenueElement) {

        totalRevenueElement.textContent =
            money(
                totalRevenue
            );

    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }


    if (deliveredElement) {

        deliveredElement.textContent =
            delivered;

    }

}


// =====================================================
// ORDER OPTIONS
// =====================================================

function statusOptions(selected) {

    const statuses = [
        "Pending",
        "Confirmed",
        "Printing",
        "Ready",
        "Shipped",
        "Delivered",
        "Cancelled"
    ];


    return statuses
        .map(
            status => `

                <option
                    value="${status}"
                    ${
                        status === selected
                            ? "selected"
                            : ""
                    }
                >
                    ${status}
                </option>

            `
        )
        .join("");

}


function paymentOptions(selected) {

    const statuses = [
        "Pending",
        "Paid",
        "Failed",
        "Refunded"
    ];


    return statuses
        .map(
            status => `

                <option
                    value="${status}"
                    ${
                        status === selected
                            ? "selected"
                            : ""
                    }
                >
                    ${status}
                </option>

            `
        )
        .join("");

}


// =====================================================
// ORDER ROW
// =====================================================

function createOrderRow(order) {

    const customerName =
        `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`
            .trim() ||
        "Customer";


    const productNames =
        (
            order.items ||
            []
        )
            .map(
                item =>
                    `${item.name} Ã— ${item.quantity}`
            )
            .join("<br>");


    return `

        <tr>
            <td>
                <input
                    type="checkbox"
                    class="order-select-checkbox"
                    data-order-select="${order.id}"
                >
            </td>

            <td>

                <strong>
                    #${order.orderNumber}
                </strong>

            </td>


            <td>

                <div class="customer-name">
                    ${customerName}
                </div>

                <div class="small-text">
                    ${order.customer?.phone || ""}
                </div>

            </td>


            <td>
                ${productNames}
            </td>


            <td>

                <strong>
                    ${money(order.total)}
                </strong>

            </td>


            <td>

                <select
                    class="payment-select"
                    data-order-id="${order.id}"
                >

                    ${paymentOptions(
                        order.paymentStatus
                    )}

                </select>

            </td>


            <td>

                <select
                    class="status-select"
                    data-order-id="${order.id}"
                >

                    ${statusOptions(
                        order.orderStatus
                    )}

                </select>

            </td>


            <td>

                <button
                    class="delete-order-btn"
                    data-delete-order="${order.id}"
                >
                    Delete
                </button>

            </td>

        </tr>

    `;

}


// =====================================================
// RECENT ORDERS
// =====================================================

function renderRecentOrders() {

    const table =
        document.getElementById(
            "recentOrdersTable"
        );


    if (!table) {
        return;
    }


    const recent =
        [...orders]
            .reverse()
            .slice(
                0,
                5
            );


    if (!recent.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-state"
                >
                    No orders yet.
                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        recent
            .map(
                createOrderRow
            )
            .join("");

}


// =====================================================
// ALL ORDERS
// =====================================================

function renderOrders() {
    setTimeout(setupBulkOrderControls, 50);

    const table =
        document.getElementById(
            "ordersTable"
        );


    if (!table) {
        return;
    }


    const search =
        (
            document.getElementById(
                "orderSearch"
            )?.value ||
            ""
        )
            .toLowerCase();


    const filter =
        document.getElementById(
            "orderFilter"
        )?.value ||
        "All";


    const filtered =
        orders.filter(
            order => {

                const customerName =
                    `${order.customer?.firstName || ""} ${order.customer?.lastName || ""}`
                        .toLowerCase();


                const orderNumber =
                    String(
                        order.orderNumber ||
                        ""
                    )
                        .toLowerCase();


                const matchesSearch =
                    customerName.includes(
                        search
                    ) ||
                    orderNumber.includes(
                        search
                    );


                const matchesFilter =
                    filter === "All" ||
                    order.orderStatus ===
                        filter;


                return (
                    matchesSearch &&
                    matchesFilter
                );

            }
        );


    table.innerHTML =
        filtered.length
            ? [...filtered]
                .reverse()
                .map(
                    createOrderRow
                )
                .join("")
            : `

                <tr>

                    <td
                        colspan="7"
                        class="empty-state"
                    >
                        No orders found.
                    </td>

                </tr>

            `;

}


document
    .getElementById(
        "orderSearch"
    )
    ?.addEventListener(
        "input",
        renderOrders
    );


document
    .getElementById(
        "orderFilter"
    )
    ?.addEventListener(
        "change",
        renderOrders
    );


// =====================================================
// UPDATE ORDER / PAYMENT
// =====================================================

document.addEventListener(
    "change",
    async event => {

        if (
            event.target.classList.contains(
                "status-select"
            )
        ) {

            const orderId =
                event.target.dataset.orderId;


            const orderStatus =
                event.target.value;


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/orders/${orderId}/status`,
                        {

                            method:
                                "PATCH",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({
                                    orderStatus
                                })

                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Could not update order"
                    );

                }


                showMessage(
                    "Order status updated"
                );


                await loadOrders();

            }

            catch (error) {

                alert(
                    error.message ||
                    "Could not update order"
                );

            }

        }


        if (
            event.target.classList.contains(
                "payment-select"
            )
        ) {

            const orderId =
                event.target.dataset.orderId;


            const paymentStatus =
                event.target.value;


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/orders/${orderId}/payment`,
                        {

                            method:
                                "PATCH",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({
                                    paymentStatus
                                })

                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Could not update payment"
                    );

                }


                showMessage(
                    `Payment changed to ${paymentStatus}`
                );


                await loadOrders();

            }

            catch (error) {

                alert(
                    error.message ||
                    "Could not update payment status"
                );

            }

        }

    }
);



// =====================================================
// BULK ORDER DELETE
// =====================================================

function setupBulkOrderControls() {
    const table =
        document.getElementById("ordersTable");

    if (!table) return;

    const headRow =
        table.closest("table")
            ?.querySelector("thead tr");

    if (
        headRow &&
        !headRow.querySelector(".order-select-all")
    ) {
        const th =
            document.createElement("th");

        th.innerHTML =
            '<input type="checkbox" class="order-select-all" title="Select all orders">';

        headRow.prepend(th);
    }

    let toolbar =
        document.getElementById(
            "bulkOrderToolbar"
        );

    if (!toolbar) {
        toolbar =
            document.createElement("div");

        toolbar.id =
            "bulkOrderToolbar";

        toolbar.style.display =
            "flex";
        toolbar.style.alignItems =
            "center";
        toolbar.style.gap =
            "12px";
        toolbar.style.margin =
            "0 0 16px";

        toolbar.innerHTML = `
            <button
                type="button"
                id="deleteSelectedOrders"
                style="
                    border:0;
                    background:#ff5a43;
                    color:#fff;
                    padding:10px 16px;
                    border-radius:10px;
                    font-weight:700;
                    cursor:pointer;
                "
            >
                Delete Selected
            </button>

            <span id="selectedOrderCount">
                0 selected
            </span>
        `;

        const wrapper =
            table.closest("table")
                ?.parentElement;

        if (wrapper) {
            wrapper.parentElement
                ?.insertBefore(
                    toolbar,
                    wrapper
                );
        }
    }

    updateSelectedOrderCount();
}

function updateSelectedOrderCount() {
    const selected =
        document.querySelectorAll(
            ".order-select-checkbox:checked"
        ).length;

    const counter =
        document.getElementById(
            "selectedOrderCount"
        );

    if (counter) {
        counter.textContent =
            `${selected} selected`;
    }
}

document.addEventListener(
    "change",
    event => {
        if (
            event.target.matches(
                ".order-select-all"
            )
        ) {
            const checked =
                event.target.checked;

            document
                .querySelectorAll(
                    ".order-select-checkbox"
                )
                .forEach(box => {
                    box.checked = checked;
                });

            updateSelectedOrderCount();
        }

        if (
            event.target.matches(
                ".order-select-checkbox"
            )
        ) {
            updateSelectedOrderCount();
        }
    }
);

document.addEventListener(
    "click",
    async event => {
        const button =
            event.target.closest(
                "#deleteSelectedOrders"
            );

        if (!button) return;

        const selected =
            Array.from(
                document.querySelectorAll(
                    ".order-select-checkbox:checked"
                )
            );

        if (!selected.length) {
            alert(
                "Select at least one order."
            );
            return;
        }

        if (
            !confirm(
                `Delete ${selected.length} selected order(s)? This cannot be undone.`
            )
        ) {
            return;
        }

        button.disabled = true;
        button.textContent =
            "Deleting...";

        try {
            for (const box of selected) {
                const response =
                    await fetch(
                        `${API_URL}/api/orders/${box.dataset.orderSelect}`,
                        {
                            method: "DELETE"
                        }
                    );

                if (!response.ok) {
                    throw new Error(
                        "Could not delete one of the selected orders."
                    );
                }
            }

            showMessage(
                `${selected.length} order(s) deleted`
            );

            await loadOrders();

            setTimeout(
                setupBulkOrderControls,
                50
            );

        } catch (error) {
            alert(
                error.message ||
                "Could not delete selected orders"
            );
        } finally {
            button.disabled = false;
            button.textContent =
                "Delete Selected";
        }
    }
);


// =====================================================
// DELETE ORDER
// =====================================================

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "[data-delete-order]"
            );


        if (!button) {
            return;
        }


        if (
            !confirm(
                "Delete this order?"
            )
        ) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/orders/${button.dataset.deleteOrder}`,
                    {
                        method:
                            "DELETE"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Could not delete order"
                );

            }


            showMessage(
                "Order deleted"
            );


            await loadOrders();

        }

        catch (error) {

            alert(
                error.message ||
                "Could not delete order"
            );

        }

    }
);

// =====================================================
// CUSTOMERS FROM ORDERS
// =====================================================

function buildCustomersFromOrders() {

    const customerMap = new Map();


    orders.forEach(order => {

        const name =
            order.customerName ||
            order.name ||
            order.customer?.name ||
            "Unknown Customer";

        const phone =
            order.phone ||
            order.customerPhone ||
            order.customer?.phone ||
            "";

        const email =
            order.email ||
            order.customerEmail ||
            order.customer?.email ||
            "";

        /*
            Use phone first because it is the most reliable
            identifier for repeat customers.

            If phone is missing, use email.
            If both are missing, use customer name.
        */

        const customerKey =
            phone.trim() ||
            email.trim().toLowerCase() ||
            name.trim().toLowerCase();


        if (!customerMap.has(customerKey)) {

            customerMap.set(
                customerKey,
                {
                    key: customerKey,
                    name: name,
                    phone: phone,
                    email: email,

                    totalOrders: 0,
                    totalSpent: 0,

                    lastOrderDate: null,

                    orders: []
                }
            );
        }


        const customer =
            customerMap.get(customerKey);


        customer.totalOrders += 1;


        const orderTotal =
            Number(
                order.total ||
                order.totalAmount ||
                order.grandTotal ||
                0
            );

        customer.totalSpent += orderTotal;


        customer.orders.push(order);


        const orderDate =
            new Date(
                order.createdAt ||
                order.date ||
                order.orderDate ||
                0
            );


        if (
            !customer.lastOrderDate ||
            orderDate > customer.lastOrderDate
        ) {

            customer.lastOrderDate =
                orderDate;
        }

    });


    return Array.from(
        customerMap.values()
    ).sort(
        (a, b) =>
            (b.lastOrderDate || 0) -
            (a.lastOrderDate || 0)
    );
}


// =====================================================
// RENDER CUSTOMERS
// =====================================================

function renderCustomers() {

    const table =
        document.getElementById(
            "customersTable"
        );

    if (!table) return;


    const customers =
        buildCustomersFromOrders();


    const search =
        String(
            document.getElementById(
                "customerSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const filteredCustomers =
        customers.filter(customer => {

            const searchable =
                [
                    customer.name,
                    customer.phone,
                    customer.email
                ]
                .join(" ")
                .toLowerCase();


            return searchable.includes(search);
        });






    // =================================================
// CUSTOMER STATS
// =================================================

const totalCustomersCount =
    document.getElementById("totalCustomersCount");

const repeatCustomersCount =
    document.getElementById("repeatCustomersCount");

const customerOrdersCount =
    document.getElementById("customerOrdersCount");


// Total unique customers
if (totalCustomersCount) {

    totalCustomersCount.textContent =
        customers.length;
}


// Customers who ordered more than once
if (repeatCustomersCount) {

    const repeatCustomers =
        customers.filter(
            customer =>
                Number(customer.totalOrders) > 1
        );

    repeatCustomersCount.textContent =
        repeatCustomers.length;
}


// Total number of orders from all customers
if (customerOrdersCount) {

    const totalCustomerOrders =
        customers.reduce(
            (total, customer) =>
                total +
                Number(
                    customer.totalOrders || 0
                ),
            0
        );

    customerOrdersCount.textContent =
        totalCustomerOrders;
}
    // =================================================
    // EMPTY STATE
    // =================================================

    if (!filteredCustomers.length) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    No customers found.
                </td>
            </tr>
        `;

        return;
    }


    // =================================================
    // CUSTOMER ROWS
    // =================================================

    table.innerHTML =
        filteredCustomers
        .map(customer => {

            const lastOrder =
                customer.lastOrderDate &&
                !Number.isNaN(
                    customer.lastOrderDate.getTime()
                )
                    ? customer.lastOrderDate
                        .toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        )
                    : "â€”";


            const whatsappPhone =
                String(customer.phone || "")
                    .replace(/\D/g, "");


            return `
                <tr>

                    <td>

                        <strong>
                            ${escapeCustomerHTML(
                                customer.name
                            )}
                        </strong>

                    </td>


                    <td>

                        ${
                            customer.phone
                                ? `
                                    <a
                                        href="https://wa.me/${
                                            whatsappPhone.startsWith("91")
                                                ? whatsappPhone
                                                : "91" + whatsappPhone
                                        }"
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        ${escapeCustomerHTML(
                                            customer.phone
                                        )}
                                    </a>
                                `
                                : "â€”"
                        }

                    </td>


                    <td>

                        ${
                            customer.email
                                ? escapeCustomerHTML(
                                    customer.email
                                )
                                : "â€”"
                        }

                    </td>


                    <td>

                        <strong>
                            ${customer.totalOrders}
                        </strong>

                    </td>


                    <td>

                        <strong>
                            ₹${customer.totalSpent
                                .toLocaleString(
                                    "en-IN"
                                )}
                        </strong>

                    </td>


                    <td>
                        ${lastOrder}
                    </td>


                    <td>

                        <button
                            type="button"
                            class="admin-action-btn"
                            onclick="openCustomerDetails(
                                '${encodeURIComponent(
                                    customer.key
                                )}'
                            )"
                        >
                            View
                        </button>

                    </td>

                </tr>
            `;

        })
        .join("");
}


// =====================================================
// CUSTOMER DETAILS
// =====================================================

function openCustomerDetails(
    encodedKey
) {

    const key =
        decodeURIComponent(
            encodedKey
        );


    const customers =
        buildCustomersFromOrders();


    const customer =
        customers.find(
            item =>
                item.key === key
        );


    if (!customer) {

        alert(
            "Customer not found."
        );

        return;
    }


    let modal =
        document.getElementById(
            "customerDetailsModal"
        );


    if (!modal) {

        modal =
            document.createElement(
                "div"
            );

        modal.id =
            "customerDetailsModal";

        modal.className =
            "custom-modal";


        modal.innerHTML = `

            <div
                class="custom-modal-backdrop"
                onclick="closeCustomerDetails()"
            ></div>


            <div class="custom-modal-panel">

                <div class="custom-modal-top">

                    <div>

                        <p class="page-label">
                            CUSTOMER
                        </p>

                        <h2>
                            Customer Details
                        </h2>

                    </div>


                    <button
                        type="button"
                        class="custom-modal-close"
                        onclick="closeCustomerDetails()"
                    >
                        Ã—
                    </button>

                </div>


                <div
                    class="custom-modal-content"
                    id="customerDetailsContent"
                ></div>

            </div>
        `;


        document.body.appendChild(
            modal
        );
    }


    const content =
        document.getElementById(
            "customerDetailsContent"
        );


    content.innerHTML =
        customerDetailsHTML(
            customer
        );


    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "custom-modal-open"
    );
}


// =====================================================
// CUSTOMER DETAIL HTML
// =====================================================

function customerDetailsHTML(
    customer
) {

    const whatsappPhone =
        String(customer.phone || "")
            .replace(/\D/g, "");


    const whatsappURL =
        whatsappPhone
            ? `https://wa.me/${
                whatsappPhone.startsWith("91")
                    ? whatsappPhone
                    : "91" + whatsappPhone
              }`
            : "";


    const orderRows =
        customer.orders
        .slice()
        .reverse()
        .map(order => {

            const orderNumber =
                order.orderNumber ||
                order.id ||
                "Order";


            const status =
                order.status ||
                "Pending";


            const total =
                Number(
                    order.total ||
                    order.totalAmount ||
                    order.grandTotal ||
                    0
                );


            const orderDate =
                new Date(
                    order.createdAt ||
                    order.date ||
                    order.orderDate ||
                    0
                );


            const formattedDate =
                !Number.isNaN(
                    orderDate.getTime()
                )
                    ? orderDate
                        .toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        )
                    : "â€”";


            return `
                <tr>

                    <td>
                        ${escapeCustomerHTML(
                            String(
                                orderNumber
                            )
                        )}
                    </td>

                    <td>
                        ${formattedDate}
                    </td>

                    <td>
                        ₹${total.toLocaleString(
                            "en-IN"
                        )}
                    </td>

                    <td>
                        ${escapeCustomerHTML(
                            status
                        )}
                    </td>

                </tr>
            `;

        })
        .join("");


    return `

        <section
            class="custom-request-section"
        >

            <h4>
                Customer Information
            </h4>


            <div
                class="custom-customer-grid"
            >

                <div>

                    <span>
                        Name
                    </span>

                    <strong>
                        ${escapeCustomerHTML(
                            customer.name
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Phone
                    </span>

                    <strong>
                        ${escapeCustomerHTML(
                            customer.phone ||
                            "â€”"
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Email
                    </span>

                    <strong>
                        ${escapeCustomerHTML(
                            customer.email ||
                            "â€”"
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Total Orders
                    </span>

                    <strong>
                        ${customer.totalOrders}
                    </strong>

                </div>


                <div>

                    <span>
                        Total Spent
                    </span>

                    <strong>
                        ₹${customer.totalSpent
                            .toLocaleString(
                                "en-IN"
                            )}
                    </strong>

                </div>

            </div>


            ${
                whatsappURL
                    ? `
                        <a
                            class="custom-whatsapp-btn"
                            href="${whatsappURL}"
                            target="_blank"
                            rel="noopener"
                        >
                            WhatsApp Customer
                        </a>
                    `
                    : ""
            }

        </section>


        <section
            class="custom-request-section"
        >

            <h4>
                Order History
            </h4>


            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>

                            <th>
                                Order
                            </th>

                            <th>
                                Date
                            </th>

                            <th>
                                Amount
                            </th>

                            <th>
                                Status
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${orderRows}

                    </tbody>

                </table>

            </div>

        </section>
    `;
}


// =====================================================
// CLOSE CUSTOMER DETAILS
// =====================================================

function closeCustomerDetails() {

    document
        .getElementById(
            "customerDetailsModal"
        )
        ?.classList
        .remove("show");


    document.body.classList.remove(
        "custom-modal-open"
    );
}


// =====================================================
// CUSTOMER HTML ESCAPE
// =====================================================

function escapeCustomerHTML(
    value
) {

    return String(
        value ?? ""
    )
    .replaceAll(
        "&",
        "&amp;"
    )
    .replaceAll(
        "<",
        "&lt;"
    )
    .replaceAll(
        ">",
        "&gt;"
    )
    .replaceAll(
        '"',
        "&quot;"
    )
    .replaceAll(
        "'",
        "&#039;"
    );
}


// =====================================================
// CUSTOMER SEARCH
// =====================================================

document
    .getElementById(
        "customerSearch"
    )
    ?.addEventListener(
        "input",
        renderCustomers
    );

// =====================================================
// CUSTOMERS
// =====================================================

function renderCustomers() {

    const table =
        document.getElementById(
            "customersTable"
        );


    if (!table) {
        return;
    }


    const customerMap =
        {};


    orders.forEach(
        order => {

            const key =
                order.customer?.phone ||
                order.customer?.email ||
                order.id;


            if (
                !customerMap[key]
            ) {

                customerMap[key] = {

                    firstName:
                        order.customer?.firstName ||
                        "",

                    lastName:
                        order.customer?.lastName ||
                        "",

                    phone:
                        order.customer?.phone ||
                        "",

                    email:
                        order.customer?.email ||
                        "",

                    orders:
                        0,

                    spent:
                        0

                };

            }


            customerMap[key].orders++;


            customerMap[key].spent +=
                Number(
                    order.total ||
                    0
                );

        }
    );


    const customers =
        Object.values(
            customerMap
        );


    table.innerHTML =
        customers.length
            ? customers
                .map(
                    customer => `

                        <tr>

                            <td>

                                <strong>
                                    ${customer.firstName}
                                    ${customer.lastName}
                                </strong>

                            </td>

                            <td>
                                ${customer.phone || "â€”"}
                            </td>

                            <td>
                                ${customer.email || "â€”"}
                            </td>

                            <td>
                                ${customer.orders}
                            </td>

                            <td>

                                <strong>
                                    ${money(customer.spent)}
                                </strong>

                            </td>

                        </tr>

                    `
                )
                .join("")
            : `

                <tr>

                    <td
                        colspan="5"
                        class="empty-state"
                    >
                        No customers yet.
                    </td>

                </tr>

            `;

}


// =====================================================
// PRODUCTS
// =====================================================

async function loadProducts() {

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


        products =
            await response.json();


        renderProducts();

    }

    catch (error) {

        console.error(
            "Products error:",
            error
        );

    }

}


// =====================================================
// PRODUCT TABLE
// =====================================================

function renderProducts() {

    const table =
        document.getElementById(
            "productsTable"
        );


    if (!table) {
        return;
    }


    if (!products.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-state"
                >
                    No products added yet.
                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        products
            .map(
                product => `

                    <tr>

                        <td>

                            ${
                                product.mainImage
                                    ? `

                                        <img
                                            src="${product.mainImage}"
                                            class="admin-product-thumbnail"
                                            alt="${product.name}"
                                        >

                                    `
                                    : `

                                        <div class="admin-product-placeholder">
                                            3D
                                        </div>

                                    `
                            }

                        </td>


                        <td>

                            <strong>
                                ${product.name}
                            </strong>

                        </td>


                        <td>
                            ${product.category || "â€”"}
                        </td>


                        <td>

                            <strong>
                                ${money(product.price)}
                            </strong>


                            ${
                                product.oldPrice
                                    ? `

                                        <div class="small-text">
                                            MRP ${money(product.oldPrice)}
                                        </div>

                                    `
                                    : ""
                            }

                        </td>


                        <td>

                            ${
                                Number(
                                    product.stock
                                ) > 0

                                    ? `

                                        <span class="stock-good">
                                            ${product.stock} in stock
                                        </span>

                                    `

                                    : `

                                        <span class="stock-out">
                                            Out of stock
                                        </span>

                                    `
                            }

                        </td>


                        <td>

                            ${
                                product.published !== false

                                    ? `

                                        <span class="published-badge">
                                            Published
                                        </span>

                                    `

                                    : `

                                        <span class="hidden-badge">
                                            Hidden
                                        </span>

                                    `
                            }

                        </td>


                        <td>

                            <button
                                class="edit-product-btn"
                                data-edit-product="${product.id}"
                            >
                                Edit
                            </button>


                            <button
                                class="delete-product-btn"
                                data-delete-product="${product.id}"
                            >
                                Delete
                            </button>

                        </td>

                    </tr>

                `
            )
            .join("");

}


// =====================================================
// PRODUCT FORM
// =====================================================

const productForm =
    document.getElementById(
        "productForm"
    );


const productFormCard =
    document.getElementById(
        "productFormCard"
    );


// =====================================================
// PRODUCT MEDIA HELPERS
// =====================================================

function revokePreviewURLs() {

    previewObjectURLs
        .forEach(
            url => {

                URL.revokeObjectURL(
                    url
                );

            }
        );


    previewObjectURLs =
        [];

}


function makePreviewURL(file) {

    const url =
        URL.createObjectURL(
            file
        );


    previewObjectURLs.push(
        url
    );


    return url;

}


function resetPendingMedia() {

    pendingProductMedia = {

        mainImageFile:
            null,

        galleryFiles:
            [],

        productVideoFile:
            null

    };


    const mainInput =
        document.getElementById(
            "mainImageInput"
        );


    const galleryInput =
        document.getElementById(
            "galleryImagesInput"
        );


    const videoInput =
        document.getElementById(
            "productVideoInput"
        );


    if (mainInput) {
        mainInput.value = "";
    }


    if (galleryInput) {
        galleryInput.value = "";
    }


    if (videoInput) {
        videoInput.value = "";
    }

}


function resetProductMedia() {

    revokePreviewURLs();


    currentProductMedia = {

        mainImage:
            "",

        galleryImages:
            [],

        productVideo:
            ""

    };


    resetPendingMedia();


    renderMediaPreview();

}


// =====================================================
// SHOW / HIDE PRODUCT FORM
// =====================================================

function showProductForm() {

    productFormCard
        ?.classList
        .remove(
            "hidden"
        );


    productFormCard
        ?.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

}


function hideProductForm() {

    productFormCard
        ?.classList
        .add(
            "hidden"
        );


    productForm
        ?.reset();


    if (
        productForm?.elements.id
    ) {

        productForm.elements.id.value =
            "";

    }


    if (
        productForm?.elements.published
    ) {

        productForm.elements.published.checked =
            true;

    }


    const title =
        document.getElementById(
            "productFormTitle"
        );


    if (title) {

        title.textContent =
            "Add Product";

    }


    resetProductMedia();

}


document
    .getElementById(
        "showProductForm"
    )
    ?.addEventListener(
        "click",
        () => {

            hideProductForm();

            showProductForm();

        }
    );


document
    .getElementById(
        "closeProductForm"
    )
    ?.addEventListener(
        "click",
        hideProductForm
    );


document
    .getElementById(
        "cancelProduct"
    )
    ?.addEventListener(
        "click",
        hideProductForm
    );


// =====================================================
// MEDIA PREVIEW
// =====================================================

function renderMediaPreview() {

    const container =
        document.getElementById(
            "mediaPreview"
        );


    if (!container) {
        return;
    }


    revokePreviewURLs();


    const mainPreview =
        pendingProductMedia.mainImageFile

            ? makePreviewURL(
                pendingProductMedia.mainImageFile
            )

            : currentProductMedia.mainImage;


    const galleryItems = [

        ...currentProductMedia
            .galleryImages
            .map(
                (
                    url,
                    index
                ) => ({

                    type:
                        "existing",

                    index:
                        index,

                    url:
                        url

                })
            ),


        ...pendingProductMedia
            .galleryFiles
            .map(
                (
                    file,
                    index
                ) => ({

                    type:
                        "pending",

                    index:
                        index,

                    url:
                        makePreviewURL(
                            file
                        )

                })
            )

    ];


    const videoPreview =
        pendingProductMedia.productVideoFile

            ? makePreviewURL(
                pendingProductMedia.productVideoFile
            )

            : currentProductMedia.productVideo;


    container.innerHTML = `

        <div class="media-preview-group">

            <div class="media-preview-heading">

                <strong>
                    Main Image
                </strong>

            </div>


            ${
                mainPreview
                    ? `

                        <div
                            class="
                                media-preview-card
                                media-preview-main
                            "
                        >

                            <img
                                src="${mainPreview}"
                                alt="Main product preview"
                            >


                            <button
                                type="button"
                                class="media-remove-button"
                                data-remove-main-image
                            >
                                âœ•
                            </button>

                        </div>

                    `
                    : `

                        <div class="media-empty-preview">
                            No main image selected
                        </div>

                    `
            }

        </div>


        <div class="media-preview-group">

            <div class="media-preview-heading">

                <strong>
                    Gallery
                </strong>

                <span>
                    ${galleryItems.length}/8
                </span>

            </div>


            <div class="gallery-preview-grid">

                ${
                    galleryItems.length

                        ? galleryItems
                            .map(
                                item => `

                                    <div
                                        class="
                                            media-preview-card
                                            gallery-preview-card
                                        "
                                    >

                                        <img
                                            src="${item.url}"
                                            alt="Gallery preview"
                                        >


                                        <button
                                            type="button"
                                            class="media-remove-button"

                                            data-remove-gallery-type="${item.type}"

                                            data-remove-gallery-index="${item.index}"
                                        >
                                            âœ•
                                        </button>

                                    </div>

                                `
                            )
                            .join("")

                        : `

                            <div class="media-empty-preview">
                                No gallery images selected
                            </div>

                        `
                }

            </div>

        </div>


        <div class="media-preview-group">

            <div class="media-preview-heading">

                <strong>
                    Video
                </strong>

            </div>


            ${
                videoPreview
                    ? `

                        <div
                            class="
                                media-preview-card
                                media-preview-video
                            "
                        >

                            <video
                                src="${videoPreview}"
                                controls
                                preload="metadata"
                            ></video>


                            <button
                                type="button"
                                class="media-remove-button"
                                data-remove-product-video
                            >
                                âœ•
                            </button>

                        </div>

                    `
                    : `

                        <div class="media-empty-preview">
                            No video selected
                        </div>

                    `
            }

        </div>

    `;

}


// =====================================================
// MAIN IMAGE SELECT
// =====================================================

document
    .getElementById(
        "mainImageInput"
    )
    ?.addEventListener(
        "change",
        event => {

            pendingProductMedia.mainImageFile =
                event.target.files?.[0] ||
                null;


            renderMediaPreview();

        }
    );


// =====================================================
// GALLERY SELECT
// =====================================================

document
    .getElementById(
        "galleryImagesInput"
    )
    ?.addEventListener(
        "change",
        event => {

            const selectedFiles =
                [
                    ...(
                        event.target.files ||
                        []
                    )
                ]
                    .filter(
                        file =>
                            file.type.startsWith(
                                "image/"
                            )
                    );


            const existingCount =
                currentProductMedia
                    .galleryImages
                    .length;


            const availableSlots =
                Math.max(
                    0,
                    8 - existingCount
                );


            pendingProductMedia.galleryFiles =
                selectedFiles.slice(
                    0,
                    availableSlots
                );


            if (
                selectedFiles.length >
                availableSlots
            ) {

                showMessage(
                    `Only ${availableSlots} more gallery image(s) can be added`
                );

            }


            renderMediaPreview();

        }
    );


// =====================================================
// VIDEO SELECT
// =====================================================

document
    .getElementById(
        "productVideoInput"
    )
    ?.addEventListener(
        "change",
        event => {

            pendingProductMedia.productVideoFile =
                event.target.files?.[0] ||
                null;


            renderMediaPreview();

        }
    );


// =====================================================
// REMOVE MEDIA FROM PREVIEW
// =====================================================

document.addEventListener(
    "click",
    event => {

        const removeMain =
            event.target.closest(
                "[data-remove-main-image]"
            );


        if (removeMain) {

            pendingProductMedia.mainImageFile =
                null;


            currentProductMedia.mainImage =
                "";


            const input =
                document.getElementById(
                    "mainImageInput"
                );


            if (input) {

                input.value =
                    "";

            }


            renderMediaPreview();

            return;

        }


        const galleryRemove =
            event.target.closest(
                "[data-remove-gallery-type]"
            );


        if (galleryRemove) {

            const type =
                galleryRemove.dataset
                    .removeGalleryType;


            const index =
                Number(
                    galleryRemove.dataset
                        .removeGalleryIndex
                );


            if (
                type === "existing"
            ) {

                currentProductMedia
                    .galleryImages
                    .splice(
                        index,
                        1
                    );

            }


            if (
                type === "pending"
            ) {

                pendingProductMedia
                    .galleryFiles
                    .splice(
                        index,
                        1
                    );

            }


            renderMediaPreview();

            return;

        }


        const removeVideo =
            event.target.closest(
                "[data-remove-product-video]"
            );


        if (removeVideo) {

            pendingProductMedia.productVideoFile =
                null;


            currentProductMedia.productVideo =
                "";


            const input =
                document.getElementById(
                    "productVideoInput"
                );


            if (input) {

                input.value =
                    "";

            }


            renderMediaPreview();

        }

    }
);


// =====================================================
// UPLOAD PRODUCT MEDIA
// =====================================================

async function uploadProductMedia() {

    const hasMain =
        Boolean(
            pendingProductMedia
                .mainImageFile
        );


    const hasGallery =
        pendingProductMedia
            .galleryFiles
            .length > 0;


    const hasVideo =
        Boolean(
            pendingProductMedia
                .productVideoFile
        );


    if (
        !hasMain &&
        !hasGallery &&
        !hasVideo
    ) {

        return currentProductMedia;

    }


    const mediaData =
        new FormData();


    if (hasMain) {

        mediaData.append(
            "mainImage",
            pendingProductMedia
                .mainImageFile
        );

    }


    if (hasGallery) {

        pendingProductMedia
            .galleryFiles
            .forEach(
                file => {

                    mediaData.append(
                        "galleryImages",
                        file
                    );

                }
            );

    }


    if (hasVideo) {

        mediaData.append(
            "productVideo",
            pendingProductMedia
                .productVideoFile
        );

    }


    const response =
        await fetch(
            `${API_URL}/api/products/upload`,
            {

                method:
                    "POST",

                body:
                    mediaData

            }
        );


    const result =
        await response.json();


    if (!response.ok) {

        throw new Error(
            result.message ||
            "Media upload failed"
        );

    }


    if (
        result.mainImage
    ) {

        currentProductMedia.mainImage =
            result.mainImage;

    }


    if (
        result.galleryImages?.length
    ) {

        currentProductMedia.galleryImages =
            [
                ...currentProductMedia
                    .galleryImages,

                ...result.galleryImages
            ]
                .slice(
                    0,
                    8
                );

    }


    if (
        result.productVideo
    ) {

        currentProductMedia.productVideo =
            result.productVideo;

    }


    resetPendingMedia();


    return currentProductMedia;

}


// =====================================================
// SAVE PRODUCT
// =====================================================

productForm
    ?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const button =
                document.getElementById(
                    "saveProductButton"
                );


            const oldButtonText =
                button?.textContent ||
                "Save Product";


            try {

                if (button) {

                    button.disabled =
                        true;

                    button.textContent =
                        "Uploading & Saving...";

                }


                // Upload selected media first.

                await uploadProductMedia();


                const formData =
                    new FormData(
                        productForm
                    );


                const existingId =
                    formData.get(
                        "id"
                    );


                const colors =
                    String(
                        formData.get(
                            "colors"
                        ) ||
                        ""
                    )
                        .split(",")
                        .map(
                            value =>
                                value.trim()
                        )
                        .filter(Boolean);


                const tags =
                    String(
                        formData.get(
                            "tags"
                        ) ||
                        ""
                    )
                        .split(",")
                        .map(
                            value =>
                                value.trim()
                        )
                        .filter(Boolean);


                const productData = {

                    name:
                        formData.get(
                            "name"
                        ),

                    category:
                        formData.get(
                            "category"
                        ),

                    shortDescription:
                        formData.get(
                            "shortDescription"
                        ),

                    description:
                        formData.get(
                            "description"
                        ),

                    price:
                        Number(
                            formData.get(
                                "price"
                            )
                        ),

                    oldPrice:
                        formData.get(
                            "oldPrice"
                        )
                            ? Number(
                                formData.get(
                                    "oldPrice"
                                )
                            )
                            : null,

                    stock:
                        Number(
                            formData.get(
                                "stock"
                            ) ||
                            0
                        ),

                    material:
                        formData.get(
                            "material"
                        ),

                    colors:
                        colors,

                    dimensions:
                        formData.get(
                            "dimensions"
                        ),

                    weight:
                        formData.get(
                            "weight"
                        ),

                    printTime:
                        formData.get(
                            "printTime"
                        ),

                    shippingInfo:
                        formData.get(
                            "shippingInfo"
                        ),

                    careInfo:
                        formData.get(
                            "careInfo"
                        ),

                    tags:
                        tags,

                    customizable:
                        formData.has(
                            "customizable"
                        ),

                    isNew:
                        formData.has(
                            "isNew"
                        ),

                    bestSeller:
                        formData.has(
                            "bestSeller"
                        ),

                    featured:
                        formData.has(
                            "featured"
                        ),

                    published:
                        formData.has(
                            "published"
                        ),

                    mainImage:
                        currentProductMedia
                            .mainImage,

                    galleryImages:
                        currentProductMedia
                            .galleryImages,

                    productVideo:
                        currentProductMedia
                            .productVideo

                };


                const response =
                    await fetch(

                        existingId

                            ? `${API_URL}/api/products/${existingId}`

                            : `${API_URL}/api/products`,

                        {

                            method:
                                existingId
                                    ? "PUT"
                                    : "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    productData
                                )

                        }

                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Could not save product"
                    );

                }


                showMessage(
                    existingId
                        ? "Product updated"
                        : "Product created"
                );


                hideProductForm();


                await loadProducts();

            }

            catch (error) {

                console.error(
                    "Product save error:",
                    error
                );


                alert(
                    "Product could not be saved: " +
                    error.message
                );

            }

            finally {

                if (button) {

                    button.disabled =
                        false;

                    button.textContent =
                        oldButtonText;

                }

            }

        }
    );


// =====================================================
// EDIT PRODUCT
// =====================================================

document.addEventListener(
    "click",
    event => {

        const editButton =
            event.target.closest(
                "[data-edit-product]"
            );


        if (!editButton) {
            return;
        }


        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(
                        editButton.dataset
                            .editProduct
                    )
            );


        if (
            !product ||
            !productForm
        ) {

            return;

        }


        productForm.reset();

        resetPendingMedia();


        productForm.elements.id.value =
            product.id;


        productForm.elements.name.value =
            product.name ||
            "";


        productForm.elements.category.value =
            product.category ||
            "Other";


        productForm.elements.shortDescription.value =
            product.shortDescription ||
            "";


        productForm.elements.description.value =
            product.description ||
            "";


        productForm.elements.price.value =
            product.price ??
            "";


        productForm.elements.oldPrice.value =
            product.oldPrice ??
            "";


        productForm.elements.stock.value =
            product.stock ??
            0;


        productForm.elements.material.value =
            product.material ||
            "";


        productForm.elements.colors.value =
            Array.isArray(
                product.colors
            )
                ? product.colors.join(
                    ", "
                )
                : "";


        productForm.elements.dimensions.value =
            product.dimensions ||
            "";


        productForm.elements.weight.value =
            product.weight ||
            "";


        productForm.elements.printTime.value =
            product.printTime ||
            "";


        productForm.elements.shippingInfo.value =
            product.shippingInfo ||
            "";


        productForm.elements.careInfo.value =
            product.careInfo ||
            "";


        productForm.elements.tags.value =
            Array.isArray(
                product.tags
            )
                ? product.tags.join(
                    ", "
                )
                : "";


        productForm.elements.customizable.checked =
            Boolean(
                product.customizable
            );


        productForm.elements.isNew.checked =
            Boolean(
                product.isNew
            );


        productForm.elements.bestSeller.checked =
            Boolean(
                product.bestSeller
            );


        productForm.elements.featured.checked =
            Boolean(
                product.featured
            );


        productForm.elements.published.checked =
            product.published !== false;


        // Existing uploaded media.

        currentProductMedia = {

            mainImage:
                product.mainImage ||
                "",

            galleryImages:
                Array.isArray(
                    product.galleryImages
                )
                    ? [
                        ...product.galleryImages
                    ]
                    : [],

            productVideo:
                product.productVideo ||
                ""

        };


        renderMediaPreview();


        const title =
            document.getElementById(
                "productFormTitle"
            );


        if (title) {

            title.textContent =
                "Edit Product";

        }


        showProductForm();

    }
);


// =====================================================
// DELETE PRODUCT
// =====================================================

document.addEventListener(
    "click",
    async event => {

        const deleteButton =
            event.target.closest(
                "[data-delete-product]"
            );


        if (!deleteButton) {
            return;
        }


        if (
            !confirm(
                "Delete this product?"
            )
        ) {

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/api/products/${deleteButton.dataset.deleteProduct}`,
                    {

                        method:
                            "DELETE"

                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    result.message ||
                    "Could not delete product"
                );

            }


            showMessage(
                "Product deleted"
            );


            await loadProducts();

        }

        catch (error) {

            alert(
                error.message ||
                "Could not delete product"
            );

        }

    }
);

// =====================================================
// CUSTOM PRINTS
// =====================================================

async function loadCustomPrints() {

    const container = document.getElementById("customPrintsList");

    if (container) {
        container.innerHTML = `
            <div class="custom-empty-state">
                Loading custom print requests...
            </div>
        `;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/custom-prints`
        );

        if (!response.ok) {
            throw new Error(
                "Could not load custom print requests"
            );
        }

        const data = await response.json();

        customPrints = Array.isArray(data)
            ? data
            : [];

        customPrints.sort(
            (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
        );

        renderCustomPrintStats();
        renderCustomPrints();

    } catch (error) {

        console.error(
            "Custom prints error:",
            error
        );

        customPrints = [];

        renderCustomPrintStats();

        if (container) {
            container.innerHTML = `
                <div class="custom-empty-state">
                    <strong>
                        Could not load custom print requests.
                    </strong>

                    <span>
                        Make sure the backend is running on localhost:5000.
                    </span>
                </div>
            `;
        }
    }
}


// =====================================================
// CUSTOM PRINT STATISTICS
// =====================================================

function renderCustomPrintStats() {

    const values = {

        customTotalCount:
            customPrints.length,

        customNewCount:
            customPrints.filter(
                request =>
                    request.status === "New"
            ).length,

        customQuotedCount:
            customPrints.filter(
                request =>
                    request.status === "Quoted"
            ).length,

        customPrintingCount:
            customPrints.filter(
                request =>
                    request.status === "Printing"
            ).length,

        customCompletedCount:
            customPrints.filter(
                request =>
                    request.status === "Completed"
            ).length

    };

    Object.entries(values).forEach(
        ([id, value]) => {

            const element =
                document.getElementById(id);

            if (element) {
                element.textContent = value;
            }
        }
    );
}


// =====================================================
// CUSTOM PRINT HELPERS
// =====================================================

function customPrintDate(dateString) {

    if (!dateString) {
        return "â€”";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "â€”";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function escapeCustomHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function customStatusClass(status) {

    return String(status || "New")
        .toLowerCase()
        .replace(/\s+/g, "-");
}


function customWhatsAppLink(phone) {

    const digits =
        String(phone || "")
            .replace(/\D/g, "");

    if (!digits) {
        return "#";
    }

    const number =
        digits.length === 10
            ? `91${digits}`
            : digits;

    return `https://wa.me/${number}`;
}


// =====================================================
// RENDER CUSTOM PRINT REQUESTS
// =====================================================
// =====================================================
// RENDER CUSTOM PRINT REQUEST LIST
// =====================================================

function renderCustomPrints() {

    const container =
        document.getElementById(
            "customPrintsList"
        );

    if (!container) {
        return;
    }


    const search =
        String(
            document.getElementById(
                "customPrintSearch"
            )?.value || ""
        )
            .trim()
            .toLowerCase();


    const statusFilter =
        document.getElementById(
            "customPrintStatusFilter"
        )?.value || "all";


    let filtered =
        [...customPrints];


    if (statusFilter !== "all") {

        filtered =
            filtered.filter(
                request =>
                    request.status ===
                    statusFilter
            );
    }


    if (search) {

        filtered =
            filtered.filter(
                request => {

                    const searchable = [
                        request.requestNumber,
                        request.name,
                        request.phone,
                        request.email,
                        request.material,
                        request.color,
                        request.details
                    ]
                        .join(" ")
                        .toLowerCase();


                    return searchable.includes(
                        search
                    );
                }
            );
    }


    if (!filtered.length) {

        container.innerHTML = `
            <div class="custom-empty-state">

                <strong>
                    No custom print requests found.
                </strong>

                <span>
                    New custom print requests will appear here.
                </span>

            </div>
        `;

        return;
    }


    container.innerHTML = `

        <div class="custom-list-header">

            <div>Request</div>

            <div>Customer</div>

            <div>Material</div>

            <div>Quote</div>

            <div>Status</div>

            <div>Action</div>

        </div>


        <div class="custom-list-body">

            ${filtered
                .map(
                    request =>
                        customPrintListItemHTML(
                            request
                        )
                )
                .join("")}

        </div>
    `;
}


// =====================================================
// ONE CUSTOM PRINT LIST ITEM
// =====================================================

function customPrintListItemHTML(request) {

    const requestNumber =
        escapeCustomHTML(
            request.requestNumber ||
            "Custom Request"
        );


    const name =
        escapeCustomHTML(
            request.name ||
            "Customer"
        );


    const phone =
        escapeCustomHTML(
            request.phone ||
            "No phone"
        );


    const material =
        escapeCustomHTML(
            request.material ||
            "Not specified"
        );


    const status =
        request.status ||
        "New";


    const quote =
        request.quote !== null &&
        request.quote !== undefined &&
        request.quote !== ""

            ? `₹${Number(
                request.quote
            ).toLocaleString("en-IN")}`

            : "Not quoted";


    return `

        <article
            class="custom-list-item"
        >

            <div
                class="custom-list-request"
                data-label="Request"
            >

                <strong>
                    ${requestNumber}
                </strong>

                <span>
                    ${customPrintDate(
                        request.createdAt
                    )}
                </span>

            </div>


            <div
                class="custom-list-customer"
                data-label="Customer"
            >

                <strong>
                    ${name}
                </strong>

                <span>
                    ${phone}
                </span>

            </div>


            <div
                class="custom-list-material"
                data-label="Material"
            >

                ${material}

            </div>


            <div
                class="custom-list-quote"
                data-label="Quote"
            >

                <strong>
                    ${quote}
                </strong>

            </div>


<div
    class="custom-list-status"
    data-label="Status"
>

    <select
        class="custom-list-status-select"
        onchange="changeCustomPrintStatus('${request.id}', this.value)"
    >

        <option
            value="New"
            ${status === "New" ? "selected" : ""}
        >
            New
        </option>

        <option
            value="Reviewing"
            ${status === "Reviewing" ? "selected" : ""}
        >
            Reviewing
        </option>

        <option
            value="Quoted"
            ${status === "Quoted" ? "selected" : ""}
        >
            Quoted
        </option>

        <option
            value="Approved"
            ${status === "Approved" ? "selected" : ""}
        >
            Approved
        </option>

        <option
            value="Printing"
            ${status === "Printing" ? "selected" : ""}
        >
            Printing
        </option>

        <option
            value="Completed"
            ${status === "Completed" ? "selected" : ""}
        >
            Completed
        </option>

        <option
            value="Rejected"
            ${status === "Rejected" ? "selected" : ""}
        >
            Rejected
        </option>

    </select>

</div>


<div
    class="custom-list-action"
    data-label="Action"
>

    <button
        type="button"
        class="custom-view-btn"
        onclick="openCustomPrintDetails('${request.id}')"
    >
        View
    </button>

    <button
        type="button"
        class="custom-list-delete-btn"
        onclick="deleteCustomPrintRequest('${request.id}')"
        title="Delete request"
    >
        Delete
    </button>

</div>

        </article>
    `;
}


// =====================================================
// CREATE DETAILS MODAL
// =====================================================

function ensureCustomPrintModal() {

    let modal =
        document.getElementById(
            "customPrintModal"
        );


    if (modal) {
        return modal;
    }


    modal =
        document.createElement(
            "div"
        );


    modal.id =
        "customPrintModal";


    modal.className =
        "custom-modal";


    modal.innerHTML = `

        <div
            class="custom-modal-backdrop"
            onclick="closeCustomPrintDetails()"
        ></div>


        <div class="custom-modal-panel">

            <div class="custom-modal-top">

                <div>

                    <p class="page-label">
                        CUSTOM PRINT REQUEST
                    </p>

                    <h2>
                        Request Details
                    </h2>

                </div>


                <button
                    type="button"
                    class="custom-modal-close"
                    onclick="closeCustomPrintDetails()"
                >
                    Ã—
                </button>

            </div>


            <div
                class="custom-modal-content"
                id="customModalContent"
            ></div>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    return modal;
}


// =====================================================
// OPEN DETAILS
// =====================================================

function openCustomPrintDetails(id) {

    const request =
        customPrints.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!request) {

        alert(
            "Custom print request not found."
        );

        return;
    }


    const modal =
        ensureCustomPrintModal();


    const content =
        document.getElementById(
            "customModalContent"
        );


    if (!content) {
        return;
    }


    content.innerHTML =
        customPrintDetailsHTML(
            request
        );


    modal.classList.add(
        "show"
    );


    document.body.classList.add(
        "custom-modal-open"
    );
}


// =====================================================
// CLOSE DETAILS
// =====================================================

function closeCustomPrintDetails() {

    const modal =
        document.getElementById(
            "customPrintModal"
        );


    modal?.classList.remove(
        "show"
    );


    document.body.classList.remove(
        "custom-modal-open"
    );
}


// =====================================================
// FULL REQUEST DETAILS
// =====================================================

function customPrintDetailsHTML(request) {

    const requestNumber =
        escapeCustomHTML(
            request.requestNumber ||
            "Custom Request"
        );


    const customerName =
        escapeCustomHTML(
            request.name ||
            "Unknown Customer"
        );


    const phone =
        escapeCustomHTML(
            request.phone ||
            ""
        );


    const email =
        escapeCustomHTML(
            request.email ||
            ""
        );


    const details =
        escapeCustomHTML(
            request.details ||
            request.message ||
            "No description provided."
        );


    const quantity =
        Number(
            request.quantity ||
            1
        );


    const size =
        escapeCustomHTML(
            request.size ||
            "Not specified"
        );


    const material =
        escapeCustomHTML(
            request.material ||
            "Not specified"
        );


    const color =
        escapeCustomHTML(
            request.color ||
            "Not specified"
        );


    const requiredBy =
        request.requiredBy

            ? escapeCustomHTML(
                request.requiredBy
            )

            : "Not specified";


    const reference =
        String(
            request.reference ||
            request.referenceLink ||
            ""
        ).trim();


    const quote =
        request.quote !== null &&
        request.quote !== undefined

            ? request.quote

            : "";


    const status =
        request.status ||
        "New";


    const notes =
        escapeCustomHTML(
            request.adminNotes ||
            ""
        );


    const model =
        request.modelFile;


    const images =
        Array.isArray(
            request.referenceImages
        )

            ? request.referenceImages

            : [];


    const statuses = [
        "New",
        "Reviewing",
        "Quoted",
        "Approved",
        "Printing",
        "Completed",
        "Rejected"
    ];


    const modelHTML =
        model?.url

            ? `

                <a
                    class="custom-model-file"
                    href="${escapeCustomHTML(model.url)}"
                    target="_blank"
                    rel="noopener"
                >

                    <div class="custom-model-icon">
                        â—ˆ
                    </div>


                    <div>

                        <strong>
                            ${escapeCustomHTML(
                                model.originalName ||
                                "3D Model"
                            )}
                        </strong>

                        <span>
                            Open / Download Model
                        </span>

                    </div>

                </a>
            `

            : `

                <div class="custom-no-file">
                    No 3D model uploaded
                </div>
            `;


    const imagesHTML =
        images.length

            ? `

                <div class="custom-reference-images">

                    ${images
                        .map(
                            image => `

                                <a
                                    href="${escapeCustomHTML(image.url)}"
                                    target="_blank"
                                    rel="noopener"
                                    class="custom-reference-image"
                                >

                                    <img
                                        src="${escapeCustomHTML(image.url)}"
                                        alt="Reference image"
                                    >

                                </a>

                            `
                        )
                        .join("")}

                </div>
            `

            : `

                <div class="custom-no-file">
                    No reference images
                </div>
            `;


    return `

        <div class="custom-detail-top">

            <div>

                <span class="custom-request-number">
                    ${requestNumber}
                </span>

                <h2>
                    ${customerName}
                </h2>

                <span class="custom-request-date">
                    ${customPrintDate(
                        request.createdAt
                    )}
                </span>

            </div>


            <span
                class="
                    custom-status-badge
                    custom-status-${customStatusClass(status)}
                "
            >
                ${escapeCustomHTML(status)}
            </span>

        </div>


        <section class="custom-request-section">

            <h4>
                Customer Information
            </h4>


            <div class="custom-customer-grid">

                <div>

                    <span>
                        Phone / WhatsApp
                    </span>

                    <strong>
                        ${phone || "â€”"}
                    </strong>

                </div>


                <div>

                    <span>
                        Email
                    </span>

                    <strong>
                        ${email || "â€”"}
                    </strong>

                </div>

            </div>


            ${
                request.phone

                    ? `

                        <a
                            class="custom-whatsapp-btn"
                            href="${customWhatsAppLink(
                                request.phone
                            )}"
                            target="_blank"
                            rel="noopener"
                        >
                            WhatsApp Customer
                        </a>
                    `

                    : ""
            }

        </section>


        <section class="custom-request-section">

            <h4>
                Customer Requirement
            </h4>


            <p class="custom-request-description">
                ${details}
            </p>


            <div class="custom-detail-grid">

                <div>

                    <span>
                        Quantity
                    </span>

                    <strong>
                        ${quantity}
                    </strong>

                </div>


                <div>

                    <span>
                        Size
                    </span>

                    <strong>
                        ${size}
                    </strong>

                </div>


                <div>

                    <span>
                        Material
                    </span>

                    <strong>
                        ${material}
                    </strong>

                </div>


                <div>

                    <span>
                        Color
                    </span>

                    <strong>
                        ${color}
                    </strong>

                </div>


                <div>

                    <span>
                        Required By
                    </span>

                    <strong>
                        ${requiredBy}
                    </strong>

                </div>

            </div>


            ${
                reference

                    ? `

                        <a
                            class="custom-reference-link"
                            href="${escapeCustomHTML(reference)}"
                            target="_blank"
                            rel="noopener"
                        >
                            â†— Open Reference Link
                        </a>
                    `

                    : ""
            }

        </section>


        <section class="custom-request-section">

            <h4>
                Uploaded Files
            </h4>


            <div class="custom-file-layout">

                <div>

                    <span class="custom-mini-heading">
                        3D Model
                    </span>

                    ${modelHTML}

                </div>


                <div>

                    <span class="custom-mini-heading">
                        Reference Images
                    </span>

                    ${imagesHTML}

                </div>

            </div>

        </section>


        <section
            class="
                custom-request-section
                custom-admin-section
            "
        >

            <h4>
                Manage Request
            </h4>


            <div class="custom-admin-grid">

                <label>

                    Quote Amount

                    <div class="custom-price-input">

                        <span>
                            ₹
                        </span>

                        <input
                            type="number"
                            min="0"
                            step="1"
                            id="customQuote-${request.id}"
                            value="${quote}"
                            placeholder="Enter quote"
                        >

                    </div>

                </label>


                <label>

                    Status

                    <select
                        id="customStatus-${request.id}"
                    >

                        ${statuses
                            .map(
                                item => `

                                    <option
                                        value="${item}"
                                        ${
                                            item === status
                                                ? "selected"
                                                : ""
                                        }
                                    >
                                        ${item}
                                    </option>
                                `
                            )
                            .join("")}

                    </select>

                </label>


                <label class="custom-notes-field">

                    Admin Notes

                    <textarea
                        id="customNotes-${request.id}"
                        rows="4"
                        placeholder="Add print settings, customer discussion or delivery notes..."
                    >${notes}</textarea>

                </label>

            </div>


<div class="custom-request-actions">

    <button
        class="admin-action-btn primary"
        type="button"
        onclick="saveCustomPrintRequest('${request.id}')"
    >
        Save Changes
    </button>

    <button
        class="admin-action-btn convert"
        type="button"
        onclick="convertCustomPrintToOrder('${request.id}')"
    >
        Convert to Order
    </button>

    <button
        class="admin-action-btn danger"
        type="button"
        onclick="deleteCustomPrintRequest('${request.id}')"
    >
        Delete Request
    </button>

</div>

        </section>
    `;
}


// =====================================================
// CLOSE MODAL USING ESC KEY
// =====================================================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeCustomPrintDetails();
        }
    }
);
// =====================================================
// QUICK CHANGE CUSTOM PRINT STATUS
// =====================================================

async function changeCustomPrintStatus(id, newStatus) {

    const request =
        customPrints.find(
            item =>
                String(item.id) === String(id)
        );

    const oldStatus =
        request?.status || "New";

    try {

        const response =
            await fetch(
                `${API_URL}/api/custom-prints/${id}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Could not update status"
            );
        }


        if (request) {
            request.status = newStatus;
        }


        renderCustomPrintStats();

        showMessage(
            `Status changed to ${newStatus}`
        );


        await loadCustomPrints();

    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        if (request) {
            request.status = oldStatus;
        }


        alert(
            error.message ||
            "Could not change status"
        );


        await loadCustomPrints();
    }
}

// =====================================================
// CONVERT CUSTOM PRINT TO ORDER
// =====================================================
// =====================================================
// CONVERT CUSTOM PRINT TO ORDER
// =====================================================

async function convertCustomPrintToOrder(id) {

    const request = customPrints.find(
        item => String(item.id) === String(id)
    );

    if (!request) {
        showMessage("Custom print request not found");
        return;
    }


    // Get current values directly from the open panel
    const quoteInput =
        document.getElementById(`customQuote-${id}`);

    const statusInput =
        document.getElementById(`customStatus-${id}`);

    const notesInput =
        document.getElementById(`customNotes-${id}`);


    const quote =
        Number(quoteInput?.value || request.quote || 0);

    const adminNotes =
        notesInput?.value || request.adminNotes || "";


    // Quote is required to create an order
    if (quote <= 0) {

        if (quoteInput) {
            quoteInput.focus();
        }

        showMessage("Enter a quote amount first");

        return;
    }


    try {

        // =================================================
        // 1. SAVE CURRENT CUSTOM PRINT DETAILS
        // =================================================

        const saveResponse = await fetch(
            `${API_URL}/api/custom-prints/${id}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    quote: quote,
                    adminNotes: adminNotes,
                    status: "Approved"
                })
            }
        );


        const savedRequest =
            await saveResponse.json();


        if (!saveResponse.ok) {
            throw new Error(
                savedRequest.message ||
                "Could not save custom print"
            );
        }


        // =================================================
        // 2. CREATE NORMAL ORDER
        // =================================================

        const orderData = {

            customerName:
                request.name || "",

            phone:
                request.phone || "",

            email:
                request.email || "",

            total:
                quote,

            subtotal:
                quote,

            paymentStatus:
                "Pending",

            status:
                "Confirmed",

            orderType:
                "Custom Print",

            customPrintId:
                request.id,

            customPrintRequestNumber:
                request.requestNumber || "",

            items: [
                {
                    name:
                        `Custom Print - ${
                            request.requestNumber ||
                            "Request"
                        }`,

                    quantity:
                        Number(request.quantity || 1),

                    price:
                        quote,

                    material:
                        request.material || "",

                    color:
                        request.color || "",

                    size:
                        request.size || "",

                    custom:
                        true
                }
            ],

            notes:
                adminNotes ||
                request.details ||
                ""
        };


        const response = await fetch(
            `${API_URL}/api/orders`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify(orderData)
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


        // =================================================
        // 3. UPDATE LOCAL DATA
        // =================================================

        request.quote = quote;
        request.adminNotes = adminNotes;
        request.status = "Approved";


        // =================================================
        // 4. FINISH
        // =================================================

        showMessage(
            `${request.requestNumber} converted to order`
        );


        closeCustomPrintDetails();


        await loadCustomPrints();

        await loadOrders();


        showAdminPage("orders");


    } catch (error) {

        console.error(
            "Convert to order error:",
            error
        );

        showMessage(
            error.message ||
            "Could not convert to order"
        );
    }
}
// =====================================================
// SAVE CUSTOM PRINT REQUEST
// =====================================================

async function saveCustomPrintRequest(id) {

    const quoteInput =
        document.getElementById(
            `customQuote-${id}`
        );

    const statusInput =
        document.getElementById(
            `customStatus-${id}`
        );

    const notesInput =
        document.getElementById(
            `customNotes-${id}`
        );

    const quoteValue =
        quoteInput?.value?.trim();


    const payload = {

        status:
            statusInput?.value ||
            "New",

        adminNotes:
            notesInput?.value ||
            ""

    };


    if (quoteValue !== "") {

        payload.quote =
            Number(quoteValue);
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/custom-prints/${id}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Could not save request"
            );
        }


        showMessage(
            "Custom print request updated"
        );
        closeCustomPrintDetails();
        await loadCustomPrints();

    } catch (error) {

        console.error(
            "Save custom print error:",
            error
        );


        alert(
            error.message ||
            "Could not update request"
        );
    }
}


// =====================================================
// DELETE CUSTOM PRINT REQUEST
// =====================================================

async function deleteCustomPrintRequest(id) {

    const request =
        customPrints.find(
            item =>
                String(item.id) ===
                String(id)
        );


    const requestName =
        request?.requestNumber ||
        "this request";


    if (
        !confirm(
            `Delete ${requestName}? This cannot be undone.`
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/custom-prints/${id}`,
                {
                    method: "DELETE"
                }
            );


        let result = {};


        try {

            result =
                await response.json();

        } catch {

            result = {};
        }


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Could not delete request"
            );
        }


        showMessage(
            "Custom print request deleted"
        );
        closeCustomPrintDetails();



        await loadCustomPrints();

    } catch (error) {

        console.error(
            "Delete custom print error:",
            error
        );


        alert(
            error.message ||
            "Could not delete request"
        );
    }
}


// =====================================================
// CUSTOM PRINT SEARCH / FILTER
// =====================================================

document
    .getElementById(
        "customPrintSearch"
    )
    ?.addEventListener(
        "input",
        renderCustomPrints
    );


document
    .getElementById(
        "customPrintStatusFilter"
    )
    ?.addEventListener(
        "change",
        renderCustomPrints
    );
    
// =====================================================
// SETTINGS
// =====================================================

const settingsForm =
    document.getElementById(
        "settingsForm"
    );


function loadSettings() {

    if (!settingsForm) {
        return;
    }


    const settings =
        JSON.parse(
            localStorage.getItem(
                "spandan-settings"
            ) ||
            "{}"
        );


    Object.keys(
        settings
    )
        .forEach(
            key => {

                if (
                    settingsForm
                        .elements[key]
                ) {

                    settingsForm
                        .elements[key]
                        .value =
                            settings[key];

                }

            }
        );

}


settingsForm
    ?.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const settings =
                Object.fromEntries(
                    new FormData(
                        settingsForm
                    )
                        .entries()
                );


            localStorage.setItem(
                "spandan-settings",
                JSON.stringify(
                    settings
                )
            );


            showMessage(
                "Settings saved"
            );

        }
    );


// =====================================================
// START ADMIN
// =====================================================

resetProductMedia();

loadOrders();

loadProducts();

loadCustomPrints();

loadSettings();
