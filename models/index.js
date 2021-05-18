const UserModel = require("./UserModel");
const CustomerModel = require("./CustomerModel");
const AddressModel = require("./AddressModel");
const ContactModel = require("./ContactModel");
const CommissionModel = require("./CommissionModel");
const AssignmentModel = require("./AssignmentModel");

/*
    Model Associations
*/
// 1:Many - Notary has many addresses
UserModel.hasMany(AddressModel, { foreignKey: { name: "userId" } });
AddressModel.belongsTo(UserModel);
// 1:Many - Customer has many addresses
CustomerModel.hasMany(AddressModel, { foreignKey: { name: "customerId" } });
AddressModel.belongsTo(CustomerModel);
// 1:Many - Customer has many contacts
CustomerModel.hasMany(ContactModel, {
	foreignKey: { name: "customerId", allowNull: false },
});
ContactModel.belongsTo(CustomerModel);
// 1:Many - Notary has many commissions
UserModel.hasMany(CommissionModel, {
	foreignKey: { name: "userId", allowNull: false },
});
CommissionModel.belongsTo(UserModel);
// 1:Many - Customer has many Assignement
CustomerModel.hasOne(AssignmentModel, {
	foreignKey: { name: "customerId", allowNull: false },
});
AssignmentModel.belongsTo(CustomerModel);
// 1:1 - Notary has one many assignments
UserModel.hasOne(AssignmentModel, { foreignKey: { name: "userId" } });
AssignmentModel.belongsTo(UserModel);

module.exports = {
	UserModel,
	CustomerModel,
	AddressModel,
	ContactModel,
	CommissionModel,
	AssignmentModel,
};
