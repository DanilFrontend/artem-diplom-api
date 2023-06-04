const {
	Order,
	BasketProduct,
	ProductSize,
	OrderProducts,
	Product,
	Sizes,
	ProductInfo,
	Brand,
	Type,
	Basket,
} = require('../models/models');
const { literal } = require('sequelize');
const apiError = require('../error/apiError');
const nodemailer = require("nodemailer")



class orderController {
	async create(req, res, next) {
		try {
			const {price, address, time} = req.body;
			let transporter = nodemailer.createTransport({
				host: "smtp.yandex.ru",
				port: 465,
				secure: true, // true for 465, false for other ports
				auth: {
					user: "yocky.mai@yandex.ru", // generated ethereal user
					pass: process.env.MAIL_PASS, // generated ethereal password
				},
			});


			// const {date, location, price, products} = req.data;
			const {email} = req.user;

			let info = await transporter.sendMail({
				from: '"Своя компания!" 👻" <yocky.mai@yandex.ru>', // sender address
				to: email, // list of receivers
				subject: "Заказ успешно создан! ✔", // Subject line
				text: `Ваш заказ на сумму ${price}руб. успешно создан! Он будет дожитаться вас на ${address} в ${time}`, // plain text body
			});

			console.log("Message sent: %s", info.messageId);
			// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

			// Preview only available when sending through an Ethereal account
			console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
		} catch (error) {
			console.log(error);
		}
	}

	async get(req, res, next) {
		try {
			const orders = await Order.findAll({
				where: { userId: req.user.id },
				include: [
					{
						model: OrderProducts,

						include: [
							{
								model: Product,
								include: [
									{ model: ProductInfo, as: 'info' },
									{ model: Brand },
									{ model: Type },
								],
							},
							{ model: Sizes },
						],
					},
				],
			});

			return res.json(orders);
		} catch (error) {
			next(apiError.badRequest(error.message));
		}
	}
}

module.exports = new orderController();
