const router = require('express').Router();
const validate = require('../middlewares/validate');
const { registerSchema } = require('../validators/auth.validator');
const controller = require('../controllers/auth.controller');

router.post('/register', validate(registerSchema), controller.register);

module.exports = router;