const RefreshToken = require('../models/RefreshToken');

module.exports = {
  create: (data) => RefreshToken.create(data),
};