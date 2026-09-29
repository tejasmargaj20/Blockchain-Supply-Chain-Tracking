const express = require("express");
const contract = require("../blockchain/contract");
const db = require("../config/db");

const router = express.Router();


// Create product
router.post("/", async (req, res) => {

    try {

        const {
            productId,
            productName,
            category,
            batchNumber,
            quantity,
            unit,
            manufacturerId
        } = req.body;

        if (
            !productId ||
            !productName ||
            !category ||
            !batchNumber ||
            !quantity ||
            !unit ||
            !manufacturerId
        ) {
            return res.status(400).json({
                message: "All product details are required"
            });
        }

        // Create product on blockchain
        const transaction = await contract.createProduct(
            productId,
            productName
        );

        await transaction.wait();

        // Save product in MySQL
        const sql = `
            INSERT INTO products
            (
                product_code,
                product_name,
                category,
                batch_number,
                quantity,
                unit,
                manufacturer_id,
                current_owner_id,
                blockchain_product_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            productId,
            productName,
            category,
            batchNumber,
            quantity,
            unit,
            manufacturerId,
            manufacturerId,
            productId
        ];

        db.query(sql, values, (error, result) => {

            if (error) {

                console.error("MySQL error:");
                console.error(error.message);

                return res.status(500).json({
                    message: "Product created on blockchain but failed to save in MySQL",
                    transactionHash: transaction.hash,
                    error: error.message
                });

            }

            res.status(201).json({
                message: "Product created successfully",
                productId: productId,
                productName: productName,
                mysqlProductId: result.insertId,
                transactionHash: transaction.hash
            });

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to create product",
            error: error.message
        });

    }

});


// Get product details
router.get("/:productId", async (req, res) => {

    try {

        const productId = req.params.productId;

        const product = await contract.getProduct(productId);

        res.json({
            productId: product[0],
            productName: product[1],
            manufacturer: product[2],
            currentOwner: product[3],
            createdAt: product[4].toString(),
            exists: product[5]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to get product",
            error: error.message
        });

    }

});


// Get product transfer history
router.get("/:productId/history", async (req, res) => {

    try {

        const productId = req.params.productId;

        const history = await contract.getHistory(productId);

        const formattedHistory = history.map((transfer) => ({
            from: transfer.from,
            to: transfer.to,
            timestamp: transfer.timestamp.toString()
        }));

        res.json({
            productId: productId,
            history: formattedHistory
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to get product history",
            error: error.message
        });

    }

});


module.exports = router;