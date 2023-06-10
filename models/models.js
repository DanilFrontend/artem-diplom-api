const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	email: { type: DataTypes.STRING, allowNull: false, unique: true },
	password: { type: DataTypes.STRING, allowNull: false },
	username: { type: DataTypes.STRING, allowNull: false },
	role: { type: DataTypes.STRING, defaultValue: 'USER' },
});

const Product = sequelize.define('product', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	name: { type: DataTypes.STRING, allowNull: false, unique: true },
	price: { type: DataTypes.INTEGER, allowNull: false },
	rating: { type: DataTypes.REAL, defaultValue: 0 },
	img: { type: DataTypes.STRING },
});

const ProductInfo = sequelize.define('product_info', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	title: { type: DataTypes.STRING, allowNull: false },
	description: { type: DataTypes.TEXT, allowNull: false },
});

const Type = sequelize.define('type', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	name: { type: DataTypes.STRING, unique: false, allowNull: false },
});

const Brand = sequelize.define('brand', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
	name: { type: DataTypes.STRING, unique: false, allowNull: false },
});

const TypeBrand = sequelize.define('type_brand', {
	id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
});

const Review = sequelize.define('review', {
	id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
	value: {type: DataTypes.TEXT, allowNull: false}
})

Type.hasMany(Product);
Product.belongsTo(Type);

Brand.hasMany(Product);
Product.belongsTo(Brand);

Product.hasMany(ProductInfo, { as: 'info' });
Product.belongsTo(ProductInfo);

Type.belongsToMany(Brand, {through: TypeBrand});
Brand.belongsToMany(Type, {through: TypeBrand});

User.hasMany(Review);
Review.belongsTo(User);

module.exports = {
	User,
	Product,
	ProductInfo,
	Type,
	Brand,
	TypeBrand,
	Review
};
