const express = require("express");
const db = require("../config/db");

const router = express.Router();

/* =========================
   DASHBOARD SUMMARY
========================= */

router.get("/stats", (req, res) => {

    const queries = {
        products: `
            SELECT COUNT(*) AS total
            FROM products
        `,

        users: `
            SELECT COUNT(*) AS total
            FROM users
        `,

        transfers: `
            SELECT COUNT(*) AS total
            FROM product_transfers
        `,

        inventory: `
            SELECT COALESCE(SUM(quantity), 0) AS total
            FROM product_inventory
        `,

        pending: `
            SELECT COUNT(*) AS total
            FROM product_transfers
            WHERE status = 'Pending'
        `,

        failed: `
            SELECT COUNT(*) AS total
            FROM product_transfers
            WHERE status = 'Failed'
        `
    };

    db.query(queries.products, (err, products) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch product statistics"
            });
        }

        db.query(queries.users, (err, users) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to fetch user statistics"
                });
            }

            db.query(queries.transfers, (err, transfers) => {

                if (err) {
                    return res.status(500).json({
                        message: "Failed to fetch transfer statistics"
                    });
                }

                db.query(queries.inventory, (err, inventory) => {

                    if (err) {
                        return res.status(500).json({
                            message: "Failed to fetch inventory statistics"
                        });
                    }

                    db.query(queries.pending, (err, pending) => {

                        if (err) {
                            return res.status(500).json({
                                message: "Failed to fetch pending transfers"
                            });
                        }

                        db.query(queries.failed, (err, failed) => {

                            if (err) {
                                return res.status(500).json({
                                    message: "Failed to fetch failed transfers"
                                });
                            }

                            res.json({
                                totalProducts: products[0].total,
                                totalUsers: users[0].total,
                                totalTransfers: transfers[0].total,
                                totalInventory: inventory[0].total,
                                pendingTransfers: pending[0].total,
                                failedTransfers: failed[0].total
                            });

                        });
                    });
                });
            });
        });
    });
});


/* =========================
   PRODUCTS BY CATEGORY
========================= */

router.get("/products-by-category", (req, res) => {

    const sql = `
        SELECT
            category,
            COUNT(*) AS total
        FROM products
        GROUP BY category
        ORDER BY total DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch category data"
            });
        }

        res.json(results);
    });
});


/* =========================
   USERS BY ROLE
========================= */

router.get("/users-by-role", (req, res) => {

    const sql = `
        SELECT
            role,
            COUNT(*) AS total
        FROM users
        GROUP BY role
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch role data"
            });
        }

        res.json(results);
    });
});


/* =========================
   TRANSFERS BY STATUS
========================= */

router.get("/transfers-by-status", (req, res) => {

    const sql = `
        SELECT
            status,
            COUNT(*) AS total
        FROM product_transfers
        GROUP BY status
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch transfer status data"
            });
        }

        res.json(results);
    });
});


/* =========================
   PRODUCTS BY STATUS
========================= */

router.get("/products-by-status", (req, res) => {

    const sql = `
        SELECT
            status,
            COUNT(*) AS total
        FROM products
        GROUP BY status
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch product status data"
            });
        }

        res.json(results);
    });
});


/* =========================
   PRODUCTS BY MANUFACTURER
========================= */

router.get("/products-by-manufacturer", (req, res) => {

    const sql = `
        SELECT
            u.name AS manufacturer,
            COUNT(p.id) AS total
        FROM products p
        JOIN users u
            ON p.manufacturer_id = u.id
        WHERE u.role = 'manufacturer'
        GROUP BY u.id, u.name
        ORDER BY total DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch manufacturer data"
            });
        }

        res.json(results);
    });
});


/* =========================
   RECENT TRANSFERS
========================= */

router.get("/recent-transfers", (req, res) => {

    const sql = `
        SELECT
    pt.id,
    p.product_id,
    p.product_name,
    p.category,
    p.status AS product_status,
    u1.name AS from_user,
    u2.name AS to_user,
    pt.quantity,
    pt.status,
    pt.transferred_at
        FROM product_transfers pt

        JOIN products p
            ON pt.product_id = p.id

        JOIN users u1
            ON pt.from_user_id = u1.id

        JOIN users u2
            ON pt.to_user_id = u2.id

        ORDER BY pt.transferred_at DESC
        LIMIT 10
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch recent transfers"
            });
        }

        res.json(results);
    });
});


/* =========================
   INVENTORY BY CATEGORY
========================= */

router.get("/inventory-by-category", (req, res) => {

    const sql = `
        SELECT
            p.category,
            COALESCE(SUM(pi.quantity), 0) AS total_inventory
        FROM products p
        LEFT JOIN product_inventory pi
            ON p.id = pi.product_id
        GROUP BY p.category
        ORDER BY total_inventory DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch inventory by category"
            });
        }

        res.json(results);
    });
});

/* =========================
   TRANSFER ACTIVITY TREND
========================= */

router.get("/transfer-trend", (req, res) => {

    
const sql = `
    SELECT
        DATE_SUB(
            DATE(transferred_at),
            INTERVAL WEEKDAY(transferred_at) DAY
        ) AS transfer_date,
        COUNT(*) AS total_transfers,
        COALESCE(SUM(quantity), 0) AS total_quantity
    FROM product_transfers
    GROUP BY
        DATE_SUB(
            DATE(transferred_at),
            INTERVAL WEEKDAY(transferred_at) DAY
        )
    ORDER BY transfer_date ASC
`;


    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch transfer trend"
            });
        }

        res.json(results);
    });
});

/* =========================
   MANUFACTURER PERFORMANCE
========================= */

router.get("/manufacturer-performance", (req, res) => {

    const sql = `
        SELECT
            u.name AS manufacturer,
            COUNT(DISTINCT p.id) AS products,
            COALESCE(SUM(pi.quantity), 0) AS inventory
        FROM users u

        LEFT JOIN products p
            ON u.id = p.manufacturer_id

        LEFT JOIN product_inventory pi
            ON p.id = pi.product_id

        WHERE u.role = 'manufacturer'

        GROUP BY u.id, u.name

        ORDER BY inventory DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch manufacturer performance"
            });
        }

        res.json(results);
    });
});

/* =========================
   FILTERED DASHBOARD DATA
========================= */

router.get("/filtered", (req, res) => {

    const {
        category,
        productStatus,
        transferStatus
    } = req.query;


    /* =========================
       BUILD FILTER CONDITIONS
    ========================= */

    let productConditions = [];
    let transferConditions = [];

    let productParams = [];
    let transferParams = [];


    /* PRODUCT CATEGORY FILTER */

    if (category && category !== "All") {

        productConditions.push("p.category = ?");
        productParams.push(category);

    }


    /* PRODUCT STATUS FILTER */

    if (productStatus && productStatus !== "All") {

        productConditions.push("p.status = ?");
        productParams.push(productStatus);

    }


    /* TRANSFER STATUS FILTER */

    if (transferStatus && transferStatus !== "All") {

        transferConditions.push("pt.status = ?");
        transferParams.push(transferStatus);

    }


    const productWhere =
        productConditions.length > 0
            ? `WHERE ${productConditions.join(" AND ")}`
            : "";


    const transferWhere =
        transferConditions.length > 0
            ? `WHERE ${transferConditions.join(" AND ")}`
            : "";


    /* =========================
       QUERIES
    ========================= */

    const queries = {

        /* TOTAL PRODUCTS */

        products: `
            SELECT COUNT(*) AS total
            FROM products p
            ${productWhere}
        `,


        /* TOTAL INVENTORY */

        inventory: `
            SELECT COALESCE(SUM(pi.quantity), 0) AS total
            FROM product_inventory pi
            JOIN products p
                ON pi.product_id = p.id
            ${productWhere}
        `,


        /* PRODUCT CATEGORY */

        categories: `
            SELECT
                p.category,
                COUNT(*) AS total
            FROM products p
            ${productWhere}
            GROUP BY p.category
            ORDER BY total DESC
        `,


        /* PRODUCT STATUS */

        productStatuses: `
            SELECT
                p.status,
                COUNT(*) AS total
            FROM products p
            ${productWhere}
            GROUP BY p.status
            ORDER BY total DESC
        `,


        /* TRANSFER STATUS */

        transferStatuses: `
            SELECT
                pt.status,
                COUNT(*) AS total
            FROM product_transfers pt
            JOIN products p
                ON pt.product_id = p.id
            ${productWhere}
            GROUP BY pt.status
            ORDER BY total DESC
        `,


        /* TRANSFER COUNT */

        transfers: `
            SELECT COUNT(*) AS total
            FROM product_transfers pt
            JOIN products p
                ON pt.product_id = p.id
            ${productWhere}
            ${transferStatus && transferStatus !== "All"
                ? (productWhere ? "AND" : "WHERE") + " pt.status = ?"
                : ""}
        `,


        /* PENDING TRANSFERS */

        pending: `
            SELECT COUNT(*) AS total
            FROM product_transfers pt
            JOIN products p
                ON pt.product_id = p.id
            WHERE pt.status = 'Pending'
            ${category && category !== "All"
                ? "AND p.category = ?"
                : ""}
            ${productStatus && productStatus !== "All"
                ? "AND p.status = ?"
                : ""}
        `,


        /* FAILED TRANSFERS */

        failed: `
            SELECT COUNT(*) AS total
            FROM product_transfers pt
            JOIN products p
                ON pt.product_id = p.id
            WHERE pt.status = 'Failed'
            ${category && category !== "All"
                ? "AND p.category = ?"
                : ""}
            ${productStatus && productStatus !== "All"
                ? "AND p.status = ?"
                : ""}
        `,


        /* INVENTORY BY CATEGORY */

        inventoryByCategory: `
            SELECT
                p.category,
                COALESCE(SUM(pi.quantity), 0) AS total_inventory
            FROM products p
            LEFT JOIN product_inventory pi
                ON p.id = pi.product_id
            ${productWhere}
            GROUP BY p.category
            ORDER BY total_inventory DESC
        `,


        
/* TRANSFER TREND */

transferTrend: `
    SELECT
        DATE_SUB(
            DATE(pt.transferred_at),
            INTERVAL WEEKDAY(pt.transferred_at) DAY
        ) AS transfer_date,
        COUNT(*) AS total_transfers
    FROM product_transfers pt
    JOIN products p
        ON pt.product_id = p.id
    ${productWhere}
    ${transferStatus && transferStatus !== "All"
        ? (productWhere ? "AND" : "WHERE") + " pt.status = ?"
        : ""}
    GROUP BY
        DATE_SUB(
            DATE(pt.transferred_at),
            INTERVAL WEEKDAY(pt.transferred_at) DAY
        )
    ORDER BY transfer_date ASC
`,



        /* MANUFACTURER PERFORMANCE */

        manufacturers: `
            SELECT
                u.name AS manufacturer,
                COUNT(DISTINCT p.id) AS products,
                COALESCE(SUM(pi.quantity), 0) AS inventory
            FROM users u

            LEFT JOIN products p
                ON u.id = p.manufacturer_id

            LEFT JOIN product_inventory pi
                ON p.id = pi.product_id

            ${productWhere
                ? productWhere.replace(
                    "WHERE",
                    "WHERE"
                )
                : ""}

            ${productWhere ? "AND" : "WHERE"}
                u.role = 'manufacturer'

            GROUP BY u.id, u.name
            ORDER BY inventory DESC
        `
    };


    /* =========================
       EXECUTE QUERIES
    ========================= */

    const runQuery = (sql, params = []) => {

        return new Promise((resolve, reject) => {

            db.query(
                sql,
                params,
                (err, results) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(results);
                    }

                }
            );

        });

    };


    Promise.all([

        runQuery(
            queries.products,
            productParams
        ),

        runQuery(
            queries.inventory,
            productParams
        ),

        runQuery(
            queries.categories,
            productParams
        ),

        runQuery(
            queries.productStatuses,
            productParams
        ),

        runQuery(
            queries.transferStatuses,
            productParams
        ),

        runQuery(
            queries.transfers,
            transferStatus !== "All" &&
            transferStatus
                ? [
                    ...productParams,
                    transferStatus
                ]
                : productParams
        ),

        runQuery(
            queries.pending,
            [
                ...(category &&
                category !== "All"
                    ? [category]
                    : []),

                ...(productStatus &&
                productStatus !== "All"
                    ? [productStatus]
                    : [])
            ]
        ),

        runQuery(
            queries.failed,
            [
                ...(category &&
                category !== "All"
                    ? [category]
                    : []),

                ...(productStatus &&
                productStatus !== "All"
                    ? [productStatus]
                    : [])
            ]
        ),

        runQuery(
            queries.inventoryByCategory,
            productParams
        ),

        runQuery(
            queries.transferTrend,
            transferStatus !== "All" &&
            transferStatus
                ? [
                    ...productParams,
                    transferStatus
                ]
                : productParams
        ),

        runQuery(
            queries.manufacturers,
            productParams
        )

    ])

    .then(results => {

        const [
            products,
            inventory,
            categories,
            productStatuses,
            transferStatuses,
            transfers,
            pending,
            failed,
            inventoryByCategory,
            transferTrend,
            manufacturers
        ] = results;


        res.json({

            stats: {

                totalProducts:
                    products[0].total,

                totalTransfers:
                    transfers[0].total,

                totalInventory:
                    inventory[0].total,

                pendingTransfers:
                    pending[0].total,

                failedTransfers:
                    failed[0].total

            },

            categories,

            inventoryByCategory,

            transferStatuses,

            productStatuses,

            transferTrend,

            manufacturers

        });

    })

    .catch(error => {

        console.error(
            "Filtered dashboard error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to fetch filtered dashboard data",

            error:
                error.message

        });

    });

});

module.exports = router;