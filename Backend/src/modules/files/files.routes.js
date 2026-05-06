const express  = require('express');
const router   = express.Router();
const { getPresignedUrl } = require('../../utils/s3');
const { authenticate } = require('../../middlewares/auth.middleware'); // use your actual auth middleware name

router.get('/view', authenticate, async (req, res, next) => {
  try {
    const { key } = req.query;
    if (!key) return res.status(400).json({ success: false, message: 'File key is required.' });
    const url = await getPresignedUrl(key, 3600);
    return res.json({ success: true, url });
  } catch (err) {
    next(err);
  }
});

module.exports = router;