const mongoose = require('mongoose');
const config = require('./index');

const connectMongo = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB connected');
};

module.exports = connectMongo;