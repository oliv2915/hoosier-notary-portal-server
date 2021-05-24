const router = require("express").Router();
const { CustomerModel, ContactModel, AddressModel } = require("../models");
const { UniqueConstraintError, ValidationError } = require("sequelize");
const { validateToken } = require("../middleware");
/* 
    Add Customer (Employee Only)
    Customer must be approved by a staff member before entry
*/
router.post("/add", validateToken, (req, res) => {
	// only employees have access
	if (!req.user.isEmployee)
		return res.status(401).json({ message: "Not Authorized" });

	const { name, phoneNumber, email, customerType, notes } = req.body.customer;
	// check for missing required fields
	const missingRequiredFields = [];
	if (!name) missingRequiredFields.push("name is required");
	if (!phoneNumber) missingRequiredFields.push("phoneNumber is required");
	if (!email) missingRequiredFields.push("email is required");
	if (!customerType) missingRequiredFields.push("customerType is required");
	if (missingRequiredFields.length > 0)
		return res.status(400).json({ message: missingRequiredFields });

	// create customer record
	CustomerModel.create({
		name,
		phoneNumber,
		email,
		customerType,
		notes: notes ? notes : null,
	})
		.then((newCustomer) => newCustomer.get())
		.then((customer) => {
			return res.status(201).json({
				customer,
			});
		})
		.catch((err) => {
			if (err instanceof UniqueConstraintError) {
				return res.status(409).json({
					message: "UniqueConstraintError",
					error: "Email address already in use",
				});
			} else if (err instanceof ValidationError) {
				return res.status(400).json({
					message: "ValidationError",
					error: err.errors,
				});
			} else {
				return res.status(500).json({ message: "Error" });
			}
		});
});
/*
    Update Customer (Employee Only)
*/
router.put("/update", validateToken, async (req, res) => {
	// only employees have access
	if (!req.user.isEmployee)
		return res.status(401).json({ message: "Not Authorized" });

	const { name, phoneNumber, email, customerType, notes, id } =
		req.body.customer;
	// check to see if id has been provided
	if (!id) return res.status(400).json({ message: "id is required" });

	const query = {
		where: { id: id },
	};
	try {
		// locate the currently saved customer record
		const foundCustomer = await CustomerModel.findOne(query).then((data) =>
			data.get()
		);
		// update customer fields that have changes
		const updateResult = await CustomerModel.update(
			{
				name: name === foundCustomer.name ? foundCustomer.name : name,
				phoneNumber:
					phoneNumber === foundCustomer.phoneNumber
						? foundCustomer.phoneNumber
						: phoneNumber,
				email: email === foundCustomer.email ? foundCustomer.email : email,
				customerType:
					customerType === foundCustomer.customerType
						? foundCustomer.customerType
						: customerType,
				notes:
					notes === foundCustomer.notes
						? foundCustomer.notes
						: notes !== undefined
						? notes
						: null,
			},
			query
		);
		// if update successful, return a message
		if (updateResult > 0)
			return res.status(200).json({ message: "Customer update successful" });
	} catch (err) {
		if (err instanceof UniqueConstraintError) {
			return res.status(409).json({
				message: "UniqueConstraintError",
				error: "Email address already in use",
			});
		} else if (err instanceof ValidationError) {
			return res.status(400).json({
				message: "ValidationError",
				error: err.errors,
			});
		} else {
			return res.status(500).json({ message: "Error" });
		}
	}
});
/* 
    Get Customer Profile (Employee Only)
*/
router.get("/profile", validateToken, (req, res) => {
	// only employees have access
	if (!req.user.isEmployee)
		return res.status(401).json({ message: "Not Authorized" });
	const { id } = req.query;
	if (!id) return res.status(400).json({ message: "customerId is required" });
	// locate customer record
	CustomerModel.findOne({
		where: { id: id },
		include: [ContactModel, AddressModel],
	})
		.then((foundCustomer) => foundCustomer.get())
		.then((customer) => {
			return res.status(200).json({
				customer: {
					id: customer.id,
					name: customer.name,
					phoneNumber: customer.phoneNumber,
					email: customer.email,
					customerType: customer.customerType,
					notes: customer.notes,
				},
				contacts: customer.contacts,
				addresses: customer.addresses,
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ message: "Error getting customer profile" });
		});
});
/*
	Get All Customer Records (Employee Only)
*/
router.get("/all", validateToken, (req, res) => {
	if (!req.user.isEmployee)
		return res.status(401).json({ message: "Not Authorized" });
	CustomerModel.findAll()
		.then((foundCustomers) => {
			return res.status(200).json({
				customers: foundCustomers,
			});
		})
		.catch((err) =>
			res.status(500).json({ message: "Error getting customer profiles" })
		);
});
module.exports = router;
