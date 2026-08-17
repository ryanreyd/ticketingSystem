const express = require('express');
const router = express.Router();
const { register, login, setup } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/setup', setup);

module.exports = router;
