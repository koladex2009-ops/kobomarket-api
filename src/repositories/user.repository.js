const User = require('../models/User');

module.exports = {
    findByEmail: (email) => ({ email }),
    create: (data) => User.create(data),
};