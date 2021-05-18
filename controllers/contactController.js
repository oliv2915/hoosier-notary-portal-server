const router = require("express").Router();
const { ContactModel } = require("../models");
const { UniqueConstraintError, ValidationError } = require("sequelize");
const { validateToken } = require("../middleware");
/*
    Add Contact (Employee Only)
*/
router.post("/add", validateToken, (req, res) => {
	if (!req.user.isEmployee)
		return res.status(401).json({ message: "Not Authorized" });
	const { name, email, phoneNumber, customerId } = req.body.contact;
	// check for missing required fields
	const missingRequiredFields = [];
	if (!name) missingRequiredFields.push("name is required");
	if (!email) missingRequiredFields.push("email is required");
	if (!phoneNumber) missingRequiredFields.push("phoneNumber is required");
	if (!customerId) missingRequiredFields.push("customerId is required");
	// if missing fields array is greater than 0, return a 400 status
	if (missingRequiredFields.length > 0)
		return res.status(400).json({ message: missingRequiredFields });

	ContactModel.create({
		name,
		email,
		phoneNumber,
		customerId,
	})
		.then((newContact) => newContact.get())
		.then((customer) =>
			res.status(201).json({ message: "Contact created successfully" })
		)
		.catch((err) => {
			if (err instanceof UniqueConstraintError) {
				return res
					.status(409)
					.json({
						message: "UniqueConstraintError",
						error: "Email address already in use",
					});
			} else if (err instanceof ValidationError) {
				return res
					.status(400)
					.json({ message: "ValidationError", error: err.errors });
			} else {
				return res.status(500).json({ message: "Error adding contact" });
			}
		});
});
/*
    Update Contact (Employee Only)
*/
router.put("/update", validateToken, (req, res) => {
	if (!req.user.isEmployee)
		return res.status(401).json({ message: "Not Authorized" });
	const { name, email, phoneNumber, customerId, contactId } = req.body.contact;

	ContactModel.update(
		{
			name,
			email,
			phoneNumber,
		},
		{
			where: {
				id: contactId,
				customerId: customerId,
			},
		}
	)
		.then((result) =>
			res.status(200).json({ message: "Contact updated successfully" })
		)
		.catch((err) =>
			res.status(500).json({ message: "Error updating contact" })
		);
});
/*
    Get Contact (Employee Only)
*/
router.get("/", validateToken, (req, res) => {
	if (!req.user.isEmployee)
		return res.status(401).json({ message: "Not Authorized" });
	const { customerId, contactId } = req.body.contact;

	ContactModel.findOne({
		where: {
			id: contactId,
			customerId: customerId,
		},
	})
		.then((foundContact) => foundContact.get())
		.then((contact) => {
			return res.status(200).json({
				message: "Found Contact",
				contact: {
					id: contact.id,
					name: contact.name,
					email: contact.email,
					phoneNumber: contact.phoneNumber,
				},
			});
		})
		.catch((err) => res.status(500).json({ message: "Error getting contact" }));
});
/*
    Delete Contact (Employee Only)
*/
router.delete("/delete", validateToken, (req, res) => {
	if (!req.user.isEmployee)
		return res.status(401).json({ message: "Not Authorized" });
	const { customerId, contactId } = req.body.contact;

	ContactModel.destroy({
		where: {
			id: contactId,
			customerId: customerId,
		},
	})
		.then((result) => {
			if (result === 0)
				return res.status(200).json({ message: "No contact found to delete" });
			if (result === 1)
				return res
					.status(200)
					.json({ message: "Contact removed successfully" });
		})
		.catch((err) =>
			res.status(500).json({ message: "Error deleting contact" })
		);
});

module.exports = router;
