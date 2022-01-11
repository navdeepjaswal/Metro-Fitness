const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const User = new Schema({
	email: { type: String, unique: true, required: true },
	password: { type: String, unique: true, required: true },
	name: { type: String },
	age: { type: Number },
	activity: { type: Number },
	goal: { type: String },
	calorieIntake: { type: Number },
	gender: { type: String },
	weight: { type: Number },
	height: { type: Number },
	completedMeasurements: { type: Boolean, default: false },
	isAdmin: { type: Boolean, default: false }
});

User.pre('save', async function (next) {
	const user = this;

	if (this.isModified('password') || this.isNew) {
		try {
			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(user.password, salt);
			user.password = hash;
		} catch (err) {
			next(err);
		}

		next();
	}
})

User.methods.isProperPassword = function (clientPassword) {
	return new Promise(async (resolve, reject) => {
		try {
			const isMatch = await bcrypt.compare(clientPassword, this.password);
			resolve(isMatch);
		} catch (err) {
			console.log(err, 'Error in BCrypt Password Comparison');
			reject(err);
		}
	})
}

module.exports = User;