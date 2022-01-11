const mongoose = require('mongoose');
const { Schema } = mongoose;

const FoodItem = new Schema({
    name: { type: String, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
    calories: { type: Number, required: true }
});

module.exports = FoodItem;