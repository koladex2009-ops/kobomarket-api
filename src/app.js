const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const db = require('./db/knex');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  const mongo = mongoose.connection.readyState === 1;
  let postgres = false;
  try {
    await db.raw('select 1');
    postgres = true;
  } catch (err) {
    postgres = false;
  }
  const ok = mongo && postgres;
  res.status(ok ? 200 : 503).json({ success: ok, mongo, postgres });
});

app.use('/api/v1', require('./routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;