const { DataTypes } = require("sequelize");
const db = require("../db");

const Assignment = db.define("assignment", {
	fileNumber: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	dueDate: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	notes: {
		type: DataTypes.TEXT,
	},
	contactName: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	contactPhoneNumber: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	contactEmail: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	meetingAddress: {
		type: DataTypes.TEXT,
		allowNull: false,
	},
	rate: {
		type: DataTypes.DECIMAL,
		allowNull: false,
	},
	type: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	status: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

module.exports = Assignment;
