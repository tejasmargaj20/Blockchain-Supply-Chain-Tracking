const express = require("express");
const cors = require("cors");
const { hash, compare } = require("bcryptjs");
const db = require("./config/db");

const app = express();

const PORT = 5000;

app.use(express.json());

app.use(cors());

app.get("/", (req, res) => {
    res.send("Blockchain Supply Chain Backend is running");
});

app.post("/api/auth/register", async (req, res) => {

    const { name, email, role, password } = req.body;

    if (!name || !email || !role || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {

        const hashedPassword = await hash(password, 10);

        const sql = `
            INSERT INTO users (name, email, role, password)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [name, email, role, hashedPassword],
            (error, result) => {

                if (error) {

                    if (error.code === "ER_DUP_ENTRY") {
                        return res.status(409).json({
                            message: "Email already registered"
                        });
                    }

                    console.error(error);

                    return res.status(500).json({
                        message: "Registration failed"
                    });
                }

                res.status(201).json({
                    message: "Registration successful",
                    userId: result.insertId
                });
            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});

app.post("/api/auth/login", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql = `
        SELECT id, name, email, role, password
        FROM users
        WHERE email = ?
    `;

    db.query(sql, [email], async (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Login failed"
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = results[0];

        const passwordMatch = await compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    });
});

app.post("/api/products", (req, res) => {

    const {
        product_id,
        product_name,
        category,
        quantity,
        manufacturer_id
    } = req.body;

    if (
        !product_id ||
        !product_name ||
        !category ||
        !quantity ||
        !manufacturer_id
    ) {
        return res.status(400).json({
            message: "All product fields are required"
        });
    }

    const productSql = `
        INSERT INTO products
        (product_id, product_name, category, quantity, manufacturer_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        productSql,
        [
            product_id,
            product_name,
            category,
            quantity,
            manufacturer_id
        ],
        (error, result) => {

            if (error) {

                if (error.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        message: "Product ID already exists"
                    });
                }

                console.error(error);

                return res.status(500).json({
                    message: "Product creation failed"
                });
            }

            const productDatabaseId = result.insertId;

            const inventorySql = `
                INSERT INTO product_inventory
                (product_id, user_id, quantity)
                VALUES (?, ?, ?)
            `;

            db.query(
                inventorySql,
                [
                    productDatabaseId,
                    manufacturer_id,
                    quantity
                ],
                (inventoryError) => {

                    if (inventoryError) {
                        console.error(inventoryError);

                        return res.status(500).json({
                            message: "Product created but inventory creation failed"
                        });
                    }

                    res.status(201).json({
                        message: "Product created successfully",
                        productId: productDatabaseId
                    });
                }
            );
        }
    );
});

app.get("/api/products/manufacturer/:manufacturerId", (req, res) => {

    const { manufacturerId } = req.params;

    const sql = `
        SELECT
            id,
            product_id,
            product_name,
            category,
            quantity,
            status,
            created_at
        FROM products
        WHERE manufacturer_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [manufacturerId], (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Failed to fetch products"
            });
        }

        res.status(200).json(results);
    });
});

app.get("/api/users/distributors", (req, res) => {

    const sql = `
        SELECT id, name, email
        FROM users
        WHERE role = 'distributor'
        ORDER BY name ASC
    `;

    db.query(sql, (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Failed to fetch distributors"
            });
        }

        res.status(200).json(results);
    });
});

app.get("/api/users/retailers", (req, res) => {

    const sql = `
        SELECT id, name, email
        FROM users
        WHERE role = 'retailer'
        ORDER BY name ASC
    `;

    db.query(sql, (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Failed to fetch retailers"
            });
        }

        res.status(200).json(results);
    });
});

app.post("/api/products/transfer", (req, res) => {

    const {
        product_id,
        from_user_id,
        to_user_id,
        quantity
    } = req.body;

    if (!product_id || !from_user_id || !to_user_id || !quantity) {
        return res.status(400).json({
            message: "All transfer fields are required"
        });
    }

    if (quantity <= 0) {
        return res.status(400).json({
            message: "Quantity must be greater than 0"
        });
    }

    const inventorySql = `
        SELECT quantity
        FROM product_inventory
        WHERE product_id = ? AND user_id = ?
    `;

    db.query(
        inventorySql,
        [product_id, from_user_id],
        (error, results) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    message: "Failed to check inventory"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Product not found in your inventory"
                });
            }

            const currentQuantity = results[0].quantity;

            if (currentQuantity < quantity) {
                return res.status(400).json({
                    message: "Insufficient product quantity"
                });
            }

            const transferSql = `
                INSERT INTO product_transfers
                (product_id, from_user_id, to_user_id, quantity, status)
                VALUES (?, ?, ?, ?, 'Completed')
            `;

            db.query(
                transferSql,
                [
                    product_id,
                    from_user_id,
                    to_user_id,
                    quantity
                ],
                (transferError, transferResult) => {

                    if (transferError) {
                        console.error(transferError);

                        return res.status(500).json({
                            message: "Product transfer failed"
                        });
                    }

                    const updateSenderSql = `
                        UPDATE product_inventory
                        SET quantity = quantity - ?
                        WHERE product_id = ? AND user_id = ?
                    `;

                    db.query(
                        updateSenderSql,
                        [
                            quantity,
                            product_id,
                            from_user_id
                        ],
                        (senderError) => {

                            if (senderError) {
                                console.error(senderError);

                                return res.status(500).json({
                                    message: "Sender inventory update failed"
                                });
                            }

                            const updateProductSql = `
                                UPDATE products
                                SET quantity = quantity - ?
                                WHERE id = ?
                            `;

                            db.query(
                                updateProductSql,
                                [
                                    quantity,
                                    product_id
                                ],
                                (productError) => {

                                    if (productError) {
                                        console.error(productError);

                                        return res.status(500).json({
                                            message: "Product quantity update failed"
                                        });
                                    }

                                    const receiverSql = `
                                        SELECT id
                                        FROM product_inventory
                                        WHERE product_id = ? AND user_id = ?
                                    `;

                                    db.query(
                                        receiverSql,
                                        [
                                            product_id,
                                            to_user_id
                                        ],
                                        (receiverError, receiverResults) => {

                                            if (receiverError) {
                                                console.error(receiverError);

                                                return res.status(500).json({
                                                    message: "Failed to check receiver inventory"
                                                });
                                            }

                                            if (receiverResults.length > 0) {

                                                const updateReceiverSql = `
                                                    UPDATE product_inventory
                                                    SET quantity = quantity + ?
                                                    WHERE product_id = ? AND user_id = ?
                                                `;

                                                db.query(
                                                    updateReceiverSql,
                                                    [
                                                        quantity,
                                                        product_id,
                                                        to_user_id
                                                    ],
                                                    (updateError) => {

                                                        if (updateError) {
                                                            console.error(updateError);

                                                            return res.status(500).json({
                                                                message: "Receiver inventory update failed"
                                                            });
                                                        }

                                                        res.status(200).json({
                                                            message: "Product transferred successfully",
                                                            transferId: transferResult.insertId
                                                        });
                                                    }
                                                );

                                            } else {

                                                const insertReceiverSql = `
                                                    INSERT INTO product_inventory
                                                    (product_id, user_id, quantity)
                                                    VALUES (?, ?, ?)
                                                `;

                                                db.query(
                                                    insertReceiverSql,
                                                    [
                                                        product_id,
                                                        to_user_id,
                                                        quantity
                                                    ],
                                                    (insertError) => {

                                                        if (insertError) {
                                                            console.error(insertError);

                                                            return res.status(500).json({
                                                                message: "Receiver inventory creation failed"
                                                            });
                                                        }

                                                        res.status(200).json({
                                                            message: "Product transferred successfully",
                                                            transferId: transferResult.insertId
                                                        });
                                                    }
                                                );
                                            }
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});

app.get("/api/inventory/:userId", (req, res) => {

    const { userId } = req.params;

    const sql = `
        SELECT
            pi.id,
            pi.product_id,
            p.product_id AS product_code,
            p.product_name,
            p.category,
            pi.quantity,
            pi.updated_at
        FROM product_inventory pi
        JOIN products p
            ON pi.product_id = p.id
        WHERE pi.user_id = ?
        ORDER BY pi.updated_at DESC
    `;

    db.query(sql, [userId], (error, results) => {

        if (error) {
            console.error(error);

            return res.status(500).json({
                message: "Failed to fetch inventory"
            });
        }

        res.status(200).json(results);
    });
});


app.get("/api/transfers/user/:userId", (req, res) => {

    const { userId } = req.params;

    const sql = `
        SELECT
            pt.id,
            pt.product_id,
            p.product_id AS product_code,
            p.product_name,
            pt.from_user_id,
            from_user.name AS from_user_name,
            pt.to_user_id,
            to_user.name AS to_user_name,
            pt.quantity,
            pt.status,
            pt.transferred_at
        FROM product_transfers pt
        JOIN products p
            ON pt.product_id = p.id
        JOIN users from_user
            ON pt.from_user_id = from_user.id
        JOIN users to_user
            ON pt.to_user_id = to_user.id
        WHERE pt.from_user_id = ?
           OR pt.to_user_id = ?
        ORDER BY pt.transferred_at DESC
    `;

    db.query(
        sql,
        [userId, userId],
        (error, results) => {

            if (error) {
                console.error(error);

                return res.status(500).json({
                    message: "Failed to fetch transfer history"
                });
            }

            res.status(200).json(results);
        }
    );
});

app.get("/api/auth/test", (req, res) => {

    res.json({
        message: "Authentication API is working"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});