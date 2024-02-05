const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getDB } = require('./db');
require('dotenv').config();
const { authenticateToken } = require('./middlewares');
const { ObjectId } = require('mongodb');

const jwtSecret = process.env.JWT_SECRET;

// Profile route (protected with authentication)
router.get('/profile', authenticateToken, async function(req, res) {
    const userId = req.user.userId;
    const db = getDB();
    const user = await db.collection("users").findOne({
        _id: new ObjectId(userId)
    }, {
        projection: {
            'password': 0
        }
    });

    res.json({
        user
    });
});

// Register user route
router.post('/', async function(req, res) {
    try {
        const db = getDB();  // Make sure to get the db instance
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = {
            username: req.body.username,
            password: hashedPassword
        };
        const results = await db.collection("users").insertOne(newUser);
        res.json({
            results
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login route
router.post('/login', async function(req, res) {
    try {
        const db = getDB();
        const user = await db.collection("users").findOne({ username: req.body.username });
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
