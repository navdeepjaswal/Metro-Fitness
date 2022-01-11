const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const FoodItem = mongoose.model('FoodItem');
const Meal = mongoose.model('Meal');

const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });

const moment = require('moment');

// Get all Food items when logging
router.get('/', requireAuth, async (req, res) => {
    try {
        const foods = await FoodItem.find()
        if (foods) {
            res.status(200);
            res.send(foods);
        }
    } catch (err) {
        res.send(err)
    }
});

// Create Food Item (postman)
router.post('/create', requireAuth, async (req, res) => {
    const { name, protein, carbs, fats } = req.body
    const food = new FoodItem({
        name,
        protein,
        carbs,
        fats,
        calories: protein * 4 + carbs * 4 + fats * 9
    })

    try {
        const saved = await food.save()
        res.status(200);
        res.json({ message: 'Food item was created!', food: saved });
    } catch (err) {
        res.send(err)
    }
});

// Get Meals history by Date (meal planner)
router.get('/meals/:date', requireAuth, async (req, res) => {
    const { date } = req.params

    const startOfDate = moment(date).startOf('day')
    const endOfDate = moment(startOfDate).endOf('day');

    try {
        const meals = await Meal.find({
            userId: [req.user.id], created_at: {
                $gte: startOfDate.toISOString(),
                $lte: endOfDate.toISOString()
            }
        })
        if (meals) {
            res.status(200);
            res.send(meals);
        }
    } catch (err) {
        res.send(err)
    }
});

// Creating a meal. We use foodId to search for the Food item, then we log it as a Meal
router.post('/log', requireAuth, async (req, res) => {
    const { foodId } = req.body

    try {
        // Use foodId to retrieve the FoodItem from the DB
        const foodItem = await FoodItem.findOne({ _id: foodId })
        // Create a new meal out of the FoodItem
        const meal = new Meal({ 
            userId: req.user.id, 
            name: foodItem.name,
            protein: foodItem.protein,
            carbs: foodItem.carbs,
            fats: foodItem.fats,
            calories: foodItem.calories
        })
        // Stores into Meal collection
        const saved = await meal.save()
        if(saved) {
            res.status(200)
            res.send(saved)
        }

    } catch (err) {
        res.send(err)
    }
});

module.exports = router;