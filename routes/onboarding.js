const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const User = mongoose.model('User');
const requireAuth = passport.authenticate('jwt', { session: false });

router.post('/', requireAuth, async (req, res, next) => {
    const { name, age, gender, weight, height, activity, userCalorieIntake, goal } = req.body;

    if (!name || !age || !gender || !weight || !height || !activity) {
        res.status(404).json({ error: 'All fields are required to calculate your daily caloric intake' });
    } else {
        try {
            const user = await User.findOne({ _id: req.user.id })
            user.name = name;
            user.age = age;
            user.gender = gender;
            user.weight = weight;
            user.height = height;
            user.activity = activity;
            user.completedMeasurements = true;

            if(!userCalorieIntake) {
                const kg = user.weight / 2.2
                let calorieIntake = 0
                
                if (user.gender === 'Male') {
                    let bmr = 66 + (13.7 * kg) + (5 * user.height) - (6.8 * user.age)
                    switch (user.activity) {
                        case 1:
                            calorieIntake = bmr * 1.1
                        case 2:
                            calorieIntake = bmr * 1.2
                        case 3:
                            calorieIntake = bmr * 1.375
                        case 4:
                            calorieIntake = bmr * 1.483
                    }   
                } else {
                    let bmr = 655 + (9.6 * kg) + (1.8 * user.height) - (4.7 * user.age)
                    switch (user.activity) {
                        case 1:
                            calorieIntake = bmr * 1.1
                        case 2:
                            calorieIntake = bmr * 1.2
                        case 3:
                            calorieIntake = bmr * 1.375
                        case 4:
                            calorieIntake = bmr * 1.483
                    }
                }
    
                user.calorieIntake = Math.round(calorieIntake)
            } else {
                user.calorieIntake = userCalorieIntake
            }

            if(goal && goal === 'lose') {
                user.calorieIntake -= 500
            } else if (goal && goal === 'gain') {
                user.calorieIntake += 500
            }

            const updatedUser = await user.save();
            res.status(200).send(updatedUser);
        } catch (err) {
            next(err)
        }
    }
});

module.exports = router;