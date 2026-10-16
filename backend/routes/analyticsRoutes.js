const express = require("express");
const contract = require("../blockchain/contract");

const router = express.Router();

// Get basic supply chain analytics
router.get("/summary", async (req, res) => {

    try {

        // Get all product IDs from blockchain
        const productIds = await contract.getAllProductIds();

        let totalTransfers = 0;
        let productAnalytics = [];

        // Get transfer history for every product
        for (const productId of productIds) {

            const history = await contract.getHistory(productId);

            totalTransfers += history.length;

            productAnalytics.push({
                productId: productId,
                transferCount: history.length
            });
        }

        // Find unique participants
        const participants = new Set();

        for (const productId of productIds) {

            const history = await contract.getHistory(productId);

            for (const transfer of history) {
                participants.add(transfer.from.toLowerCase());
                participants.add(transfer.to.toLowerCase());
            }
        }

        res.json({
            totalProducts: productIds.length,
            totalTransfers: totalTransfers,
            uniqueParticipants: participants.size,
            products: productAnalytics
        });

    } catch (error) {

        console.error("Analytics error:", error);

        res.status(500).json({
            message: "Failed to fetch supply chain analytics",
            error: error.message
        });
    }

});

module.exports = router;