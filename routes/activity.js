const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Activity = mongoose.model('Activity');

// Passport is a library used to authenticate your endpoints
// the requireAuth middleware will help you get the current user's ID
// it also adds security to your routes by requiring you to be logged in
const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });

const moment = require('moment');

// Get exercise history with the timestamp
router.get('/:date', requireAuth, async (req, res) => {
    const { date } = req.params

    const startOfDate = moment(date).startOf('day')
    const endOfDate = moment(startOfDate).endOf('day');

    try {        
        const activities = await Activity.find({
            userId: [req.user.id], created_at: {
                $gte: startOfDate.toISOString(),
                $lte: endOfDate.toISOString()
            }
        })

        if (activities) {
            res.status(200);
            res.send(activities);
        }
    } catch (err) {
        res.send(err)
    }
});
// log an exercise
router.post('/log', requireAuth, async (req, res) => {
    const { burnt, date } = req.body
    const activity = new Activity({ userId: req.user.id, burnt, date })

    try {
        const saved = await activity.save()
        res.status(200);
        res.json({ message: 'Activity added!', activity: saved });
    } catch (err) {
        res.send(err)
    }
});

module.exports = router;