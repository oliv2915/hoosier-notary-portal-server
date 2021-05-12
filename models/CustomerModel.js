const {DataTypes} = require("sequelize");
const db = require("../db");

const Customer = db.define("customer", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    customerType: {
        type: DataTypes.STRING,
        defaultValue: false
    },
    notes: {
        type: DataTypes.TEXT
    }
});

module.exports = Customer;