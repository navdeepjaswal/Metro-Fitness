const moment = require('moment');

//middleware. this runs every time we MAKE A REQUEST
const logger = function(req, res, next) {
    console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}: ${moment().format()}`);
    next();
};

module.exports = logger;