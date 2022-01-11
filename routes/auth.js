const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const jwt = require('jsonwebtoken');
const { secret } = require('../config');

const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });

function tokenForUser(user) {
	const timestamp = new Date().getTime();
	return jwt.sign({ sub: user._id, iat: timestamp }, secret);
}
// ajax request - sign up 
router.post('/signUp', async (req, res, next) => {
	const { email, password } = req.body;

	const newUser = new User({
		email,
		password,
	});

	if (!email || !password) {
		return res.status(422).send({ error: 'You must fill in all the required fields.' });
	}

	try {
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(422).send({ error: 'Email already in use.' });
		}
	} catch (err) {
		next(err);
	}

	try {
		const saved = await newUser.save();
		res.status(200);
		res.json({ message: 'Your account was registered!', user: saved });
		return true;
	} catch (err) {
		console.log(err);
		console.log(`Internal Server Error, User.save(${JSON.stringify(newUser)})`);
		return false;
	}
});

// ajax request- sign in 
router.post('/signIn', async (req, res, next) => {
	const { email, password } = req.body;

	try {
		const user = await User.findOne({ email })
		if (!user) {
			res.status(404).json({ error: 'Incorrect Email or Password. Please try again.' });
		} else {
			try {
				const isMatch = await user.isProperPassword(password);
				if (isMatch) {
					const token = tokenForUser(user);
					res.json({ token, completedMeasurements: user.completedMeasurements, user });
				} else {
					res.status(401);
					res.json({ error: 'No matching records were found. Please try again.' });
				}
			} catch (err) {
				console.log(err, `Internal Error, User.isProperPassword(${password})`);
				res.status(500);
			}

		}
	} catch (err) {
		console.log(err, `Internal Server Error, User.findOne(${email})`);
		res.status(500);
	}

});

router.get('/current_user', requireAuth, (req, res, next) => {
	res.status(200).send({
		id: req.user.id,
		name: req.user.name,
		age: req.user.age,
		activity: req.user.activity,
		calorieIntake: req.user.calorieIntake,
		gender: req.user.gender,
		weight: req.user.weight,
		height: req.user.height,
		completedMeasurements: req.user.completedMeasurements,
		isAdmin: req.user.isAdmin
	})
});

module.exports = router;