const mongoose = require('mongoose');
const { Schema } = mongoose;

const Weight = new Schema({
    userId: { type: String, required: true },
    weight: { type: Number, required: true },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
}
);

module.exports = Weight;