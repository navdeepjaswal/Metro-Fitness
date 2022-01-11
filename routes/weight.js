const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Weight = mongoose.model('Weight');

// Passport is a library used to authenticate your endpoints
// the requireAuth middleware will help you get the current user's ID
// it also adds security to your routes by requiring you to be logged in
const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });

// get user weight
router.get('/', requireAuth, async (req, res) => {
    try {
        const weights = await Weight.find({ userId: req.user.id }).limit(10)
        if (weights) {
            res.status(200);
            res.send(weights);
        }
    } catch (err) {
        res.send(err)
    }
});
// post user weight
router.post('/log', requireAuth, async (req, res) => {
    const { weight, date } = req.body
    const weightLog = new Weight({ userId: req.user.id, weight, date })

    try {
        const savedWeight = await weightLog.save()
        res.status(200);
        res.send(savedWeight);
    } catch (err) {
        res.send(err)
    }
});

module.exports = router;