const express = require('express');

const router = express.Router();

router.use('/version', require('./version'));

router.use('/.well-known', require('./.well-known/'));

router.use('/sidetree', require('./sidetree'));

module.exports = router;
