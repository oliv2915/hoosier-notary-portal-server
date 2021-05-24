const { DataTypes } = require("sequelize");
const db = require("../db");

const Contact = db.define("contact", {
	name: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	phoneNumber: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

module.exports = Contact;
