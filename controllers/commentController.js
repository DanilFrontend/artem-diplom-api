const apiError = require('../error/apiError');
const { Comment, User } = require('../models/models');

class CommentController {
	async create(req, res, next) {
		try {
			const { value, productId } = req.body;

			const createdComment = await Comment.create(
				{
					value,
					userId: req.user.id,
					productId,
				},
				{
					include: [
						{ model: User, attributes: { exclude: ['password'] } },
					],
				},
			);

			const comment = await Comment.findOne({
				where: {
					id: createdComment.id,
				},
				include: [
					{ model: User, attributes: { exclude: ['password'] } },
				],
			});

			return res.json(comment);
		} catch (error) {
			next(apiError.badRequest(error.message));
		}
	}

	async getAll(req, res, next) {
		try {
			let { productId } = req.params;

			console.log(productId);

			const comments = await Comment.findAll({
				where: {
					productId,
				},
				include: [
					{ model: User, attributes: { exclude: ['password'] } },
				],
			});

			return res.json(comments);
		} catch (error) {
			next(apiError.badRequest(error.message));
		}
	}
}

module.exports = new CommentController();
