const mongoose = require('mongoose');
const { Schema } = mongoose;

const Activity = new Schema({
    userId: { type: String, required: true },
    burnt: { type: Number, required: true },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
}
);

module.exports = Activity;