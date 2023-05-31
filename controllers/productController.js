const {
	Type,
	Product,
	ProductInfo,
	Brand,
	Sizes,
	ProductSize,
	Rating,
} = require('../models/models');
const { v4: uuidv4 } = require('uuid');
const apiError = require('../error/apiError');
const path = require('path');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const { group } = require('console');
const cloudinary = require('cloudinary').v2;

class productController {
	async edit(req, res, next) {
		try {
			const { productId ,name, price, typeId, info } = req.body;

			const product = await Product.findOne({
				where: {
					id: productId
				}
			});
			product.name = name;
			product.price = price;
			product.typeId = typeId;

			await product.save();

			if (info) {
				await ProductInfo.destroy({
					where: {
						productId: product.id,
					},
				});

				const parsedInfo = JSON.parse(info);
				parsedInfo.forEach(infoEl => {
					ProductInfo.create({
						title: infoEl.title,
						description: infoEl.description,
						productId: product.id,
					});
				});
			}

			return res.json(product);
		} catch (error) {
			console.log(error);
			next(apiError.badRequest(error.message));
		}
	}
	async create(req, res, next) {
		try {
			const { name, price, typeId, info } = req.body;
			 const { img } = req.files;

			 let fileName = uuidv4() + '.jpg'; // generate uniq filename
			 img.mv(path.resolve(__dirname, '..', 'static', fileName)); // move file in a static folder, * __dirname - current loication, next params - path to static folder *

			const product = await Product.create({
				name,
				price,
				typeId,
				img: fileName,
			});

			if (info) {
				const parcedInfo = JSON.parse(info); // form data not auto-parcing in json
				parcedInfo.forEach(infoEl => {
					ProductInfo.create({
						title: infoEl.title,
						description: infoEl.description,
						productId: product.id,
					});
				});
			}

			return res.json(product);
		} catch (error) {
			console.log(error);
			next(apiError.badRequest(error.message));
		}
	}

	async getAllByTextSearch(req, res) {
		try {
			let { query } = req.query;

			query = query.toLowerCase();


			const products = await Product.findAll({
				where: {
					name: Sequelize.where(
						Sequelize.fn('LOWER', Sequelize.col('product.name')),
						'LIKE',
						'%' + query + '%',
					),
				},
				include: [{ model: Type }, { model: Brand }, { model: ProductInfo, as: 'info' },],
			});

			return res.json(products);
		} catch (error) {
			console.log(error);
		}
	}

	async getAllProducts(req, res, next) {
		const products = await Product.findAll({
			include: [
				{ model: Type },
				{ model: ProductInfo, as: 'info' },
			],
		});

		return res.json({rows: products});
	}

	async getAll(req, res, next) {
		try {
			let {
				brandId,
				typeId,
				minPrice,
				maxPrice,
				order,
			} = req.query;

			minPrice = minPrice || 0;
			maxPrice = maxPrice || 100000;
			order = order || 'priceDESC';

			let products;

			if (!brandId && !typeId) {
				products = await Product.findAndCountAll({
					distinct: 'id',
					order: [
						order === 'priceDESC'
							? ['price', 'DESC']
							: order === 'priceASC'
							? ['price', 'ASC']
							: order === 'ratingDESC'
							? ['rating', 'DESC']
							: order === 'ratingASC' && ['rating', 'ASC'],
					],
					include: [
						{ model: Type },
						{ model: ProductInfo, as: 'info' },
					],
					where: {
						price: {
							[Op.between]: [minPrice, maxPrice],
						},
					},
				});
			}

			if (brandId && !typeId) {
				products = await Product.findAndCountAll({
					where: {
						brandId,
						price: {
							[Op.between]: [minPrice, maxPrice],
						},
					},
					order: [
						order === 'priceDESC'
							? ['price', 'DESC']
							: order === 'priceASC'
							? ['price', 'ASC']
							: order === 'ratingDESC'
							? ['rating', 'DESC']
							: order === 'ratingASC' && ['rating', 'ASC'],
					],
					include: [
						{ model: Type },
						{ model: ProductInfo, as: 'info' },
					],
					distinct: 'id',
				});
			}

			if (!brandId && typeId) {
				products = await Product.findAndCountAll({
					where: {
						typeId,
						price: {
							[Op.between]: [minPrice, maxPrice],
						},
					},
					order: [
						order === 'priceDESC'
							? ['price', 'DESC']
							: order === 'priceASC'
							? ['price', 'ASC']
							: order === 'ratingDESC'
							? ['rating', 'DESC']
							: order === 'ratingASC' && ['rating', 'ASC'],
					],
					include: [
						{ model: Type },
						{ model: ProductInfo, as: 'info' },
					],
					distinct: 'id',
				});
			}

			if (brandId && typeId) {
				products = await Product.findAndCountAll({
					where: {
						typeId,
						brandId,
						price: {
							[Op.between]: [minPrice, maxPrice],
						},
					},
					order: [
						order === 'priceDESC'
							? ['price', 'DESC']
							: order === 'priceASC'
							? ['price', 'ASC']
							: order === 'ratingDESC'
							? ['rating', 'DESC']
							: order === 'ratingASC' && ['rating', 'ASC'],
					],
					include: [
						{ model: Type },
						{ model: ProductInfo, as: 'info' },
					],
					distinct: 'id',
				});
			}

			return res.json(products);
		} catch (error) {
			next(apiError.badRequest(error.message));
			console.log(error);
		}
	}

	async checkRatingAccess(req, res, next) {
		try {
			const { productId } = req.params;

			const candidate = await Rating.findOne({
				where: {
					userId: req.user.id,
					productId,
				},
			});

			if (candidate) {
				return next(apiError.internal('Оценка уже поставлена'));
			}

			return res.json('ok');
		} catch (error) {
			next(apiError.badRequest(error.message));
		}
	}

	async getOne(req, res, next) {
		try {
			const { id } = req.params;

			const product = await Product.findOne({
				where: { id },
				include: [
					{ model: ProductInfo, as: 'info' },
					{
						model: ProductSize,
						as: 'sizes',
						include: {
							model: Sizes,
						},
					},
					{ model: Type },
					{ model: Brand },
				], //left join
			});

			return res.json(product);
		} catch (error) {
			next(apiError.badRequest(error.message));
		}
	}

	async uploadImage(req, res, next) {
		try {
			const { img } = req.files;

			let fileName = uuidv4() + '.jpg';
			img.mv(path.resolve(__dirname, '..', 'static', fileName));

			return fileName
		} catch (error) {
			console.log(error)
			return next(apiError.internal(error));

		}
	}

	async updateImage(req, res, next) {
		try {
			const { productId, fileName } = req.body;

			const product = await Product.update(
				{
					img: fileName,
				},
				{
					where: {
						id: productId,
					},
				},
			);

			return res.json(product);
		} catch (error) {
			console.log(error);
			next(apiError.badRequest(error.message));
		}
	}

	async getProductInfo(req, res, next) {
		try {
			const {productId} = req.body;

			const productInfo = await ProductInfo.findAll({
				where: { productId },
			});

			return res.json(productInfo);
		} catch (error) {
			return next(apiError.internal(error));
		}
	}

	async deleteProduct(req, res, next) {
		try {
			const { productId } = req.body;

			const status = await Product.destroy({ where: { id: productId } });

			if (status != 1) {
				return next(apiError.internal('Ошибка'));
			}

			return res.json({ message: 'Успешно' });
		} catch (error) {
			return next(apiError.internal(error));
		}
	}
}

module.exports = new productController();
