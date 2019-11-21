const express = require('express');

const router = express.Router();

router.use('/version', require('./version'));
router.use('/sidetree', require('./sidetree'));
router.use('/sidetree-v2', require('./sidetree-v2'));

module.exports = router;
