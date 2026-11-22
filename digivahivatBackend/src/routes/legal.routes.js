/**
 * routes/legal.routes.js
 *
 * Public routes for Privacy Policy, Support, and Terms of Service.
 */
const router = require('express').Router();
const {
  getPrivacyPolicy,
  getSupportPage,
  getTermsPage,
} = require('../controllers/legal.controller');

router.get('/privacy-policy', getPrivacyPolicy);
router.get('/privacy',        getPrivacyPolicy);
router.get('/support',        getSupportPage);
router.get('/help',           getSupportPage);
router.get('/terms',          getTermsPage);
router.get('/terms-and-conditions', getTermsPage);

module.exports = router;
