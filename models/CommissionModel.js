const { DataTypes } = require("sequelize");
const db = require("../db");

const Commission = db.define("commission", {
	commissionNumber: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	nameOnCommission: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	commissionExpireDate: {
		type: DataTypes.DATE,
		allowNull: false,
	},
	commissionState: {
		type: DataTypes.CHAR(2),
		allowNull: false,
	},
	countyOfResidence: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

module.exports = Commission;
