const apiError = require('../error/apiError');
const {Review, User} = require('../models/models')

class reviewController {
    async createReview(req, res, next) {
        try {
            const {value, userId} = req.body
            const response = Review.create({
                value,
                userId
            })
            return response;
        } catch (e) {
            next(apiError(e))
        }
    }

    async getAllReviews(req, res, next) {
        try {
            const review = await Review.findAll(
                {
                    include: [{
                        model: User,
                    }],
                }
            )
            return res.json(review)
        } catch (e) {
            next(apiError)
        }
    }

    async deleteReview(req, res, next) {
        try {
            const {id} = req.body
            const review = Review.destroy({
                where: {
                    id,
                },
            });
        } catch (e) {
            next(apiError)
        }
    }
}

module.exports = new reviewController();