const UserModel = require("./UserModel");
const CustomerModel = require("./CustomerModel");
const AddressModel = require("./AddressModel");

/*
    Model Associations
*/

// 1:Many - User has many addresses
UserModel.hasMany(AddressModel, {foreignKey: {name: "userId"}});
AddressModel.belongsTo(UserModel);
// 1:Many - Customer has many addresses
CustomerModel.hasMany(AddressModel, {foreignKey: {name: "customerId"}});
AddressModel.belongsTo(CustomerModel);


module.exports = {UserModel, CustomerModel, AddressModel};