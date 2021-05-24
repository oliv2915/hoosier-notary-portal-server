const { DataTypes } = require("sequelize");
const db = require("../db");

const Address = db.define("address", {
	streetOne: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	streetTwo: {
		type: DataTypes.STRING,
	},
	city: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	state: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	zipCode: {
		type: DataTypes.INTEGER,
		allowNull: false,
	},
	type: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

module.exports = Address;
