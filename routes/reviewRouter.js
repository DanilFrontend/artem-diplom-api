const Router = require('express')
const router = new Router
const reviewController = require('../controllers/reviewController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/create', authMiddleware, reviewController.createReview);
router.get('/get-all', reviewController.getAllReviews)
router.delete('/delete', reviewController.deleteReview)

module.exports = router;