// routes/bookOrders.js
const express = require('express');
const router = express.Router();
const BookOrder = require('../models/BookOrder');

// POST a new order
router.post('/', async (req, res) => {
    try {
        const order = new BookOrder(req.body);
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error('POST /api/book-orders error:', error);
        res.status(400).json({
            message: 'Error creating book order',
            error
        });
    }
});

// GET all book orders with optional filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page = 1, limit = 50, search, city, sortBy = 'createdAt', sortOrder = 'desc'
        } = req.query;

        // Build query object
        let query = {};

        if (search) {
            query.$or = [{
                    name: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    email: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    city: {
                        $regex: search,
                        $options: 'i'
                    }
                },
                {
                    mobile: {
                        $regex: search,
                        $options: 'i'
                    }
                }
            ];
        }

        if (city) {
            query.city = {
                $regex: city,
                $options: 'i'
            };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const orders = await BookOrder.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await BookOrder.countDocuments(query);

        res.json({
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('GET /api/book-orders error:', error);
        res.status(500).json({
            message: 'Error fetching book orders',
            error
        });
    }
});

// GET order statistics
router.get('/stats', async (req, res) => {
    try {
        const totalOrders = await BookOrder.countDocuments();
        const totalCopies = await BookOrder.aggregate([{
            $group: {
                _id: null,
                total: {
                    $sum: '$copies'
                }
            }
        }]);

        // Orders from last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentOrders = await BookOrder.countDocuments({
            createdAt: {
                $gte: weekAgo
            }
        });

        // Top cities
        const topCities = await BookOrder.aggregate([{
                $group: {
                    _id: '$city',
                    count: {
                        $sum: 1
                    },
                    copies: {
                        $sum: '$copies'
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            },
            {
                $limit: 10
            }
        ]);

        // Monthly trends
        const monthlyTrends = await BookOrder.aggregate([{
                $group: {
                    _id: {
                        year: {
                            $year: '$createdAt'
                        },
                        month: {
                            $month: '$createdAt'
                        }
                    },
                    orders: {
                        $sum: 1
                    },
                    copies: {
                        $sum: '$copies'
                    }
                }
            },
            {
                $sort: {
                    '_id.year': -1,
                    '_id.month': -1
                }
            },
            {
                $limit: 12
            }
        ]);

        res.json({
            totalOrders,
            totalCopies: totalCopies[0] ?.total || 0,
            recentOrders,
            topCities,
            monthlyTrends
        });
    } catch (error) {
        console.error('GET /api/book-orders/stats error:', error);
        res.status(500).json({
            message: 'Error fetching statistics',
            error
        });
    }
});

// GET single order by ID
router.get('/:id', async (req, res) => {
    try {
        const order = await BookOrder.findById(req.params.id);
        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }
        res.json(order);
    } catch (error) {
        console.error('GET /api/book-orders/:id error:', error);
        res.status(500).json({
            message: 'Error fetching order',
            error
        });
    }
});

// PUT update order by ID
router.put('/:id', async (req, res) => {
    try {
        const order = await BookOrder.findByIdAndUpdate(
            req.params.id,
            req.body, {
                new: true,
                runValidators: true
            }
        );
        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }
        res.json(order);
    } catch (error) {
        console.error('PUT /api/book-orders/:id error:', error);
        res.status(400).json({
            message: 'Error updating order',
            error
        });
    }
});

// DELETE order by ID
router.delete('/:id', async (req, res) => {
    try {
        const order = await BookOrder.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }
        res.json({
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('DELETE /api/book-orders/:id error:', error);
        res.status(500).json({
            message: 'Error deleting order',
            error
        });
    }
});

// GET export data in CSV format
router.get('/export/csv', async (req, res) => {
    try {
        const orders = await BookOrder.find().sort({
            createdAt: -1
        });

        const csvHeaders = 'Name,Email,Mobile,Copies,City,Order Date\n';
        const csvData = orders.map(order =>
            `"${order.name}","${order.email}","${order.mobile}",${order.copies},"${order.city}","${new Date(order.createdAt).toLocaleString()}"`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="book-orders.csv"');
        res.send(csvHeaders + csvData);
    } catch (error) {
        console.error('GET /api/book-orders/export/csv error:', error);
        res.status(500).json({
            message: 'Error exporting data',
            error
        });
    }
});

module.exports = router;