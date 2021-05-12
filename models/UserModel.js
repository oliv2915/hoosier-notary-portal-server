const {DataTypes} = require("sequelize");
const db = require("../db");

const User = db.define("user", {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    middleName: {
        type: DataTypes.STRING,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    suffix: {
        type: DataTypes.STRING
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isNotary: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isActiveNotary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isEmployee: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isActiveEmployee: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isSuper: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
},);

module.exports = User;