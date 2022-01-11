const mongoose = require('mongoose');
const { Schema } = mongoose;

const Meal = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
    calories: { type: Number }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = Meal;