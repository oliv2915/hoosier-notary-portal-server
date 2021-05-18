const router = require("express").Router();
const { AddressModel } = require("../models");
const { UniqueConstraintError, ValidationError } = require("sequelize");
const { validateToken } = require("../middleware");
/* 
    Add Address
    Notaries can add there own addresses only
    Employees can add addressees for a customer only
*/
router.post("/add", validateToken, (req, res) => {
	const { streetOne, streetTwo, city, state, zipCode, type, customerId } =
		req.body.address;
	// check for missing required fields
	const missingRequiredFields = [];
	if (!streetOne) missingRequiredFields.push("streetOne is required");
	if (!city) missingRequiredFields.push("city is required");
	if (!state) missingRequiredFields.push("state is required");
	if (!zipCode) missingRequiredFields.push("zipCode is required");
	if (!type) missingRequiredFields.push("type is required");
	// if user is an employee and customerId is undefined, add to missing required fields
	if (req.user.isEmployee && customerId === undefined)
		missingRequiredFields.push("customerId is required");
	// if missing fields array is greater than 0, we are missing fields, return a 400 status
	if (missingRequiredFields.length > 0)
		return res.status(400).json({ message: missingRequiredFields });

	const addressToBeCreated = {
		streetOne,
		streetTwo: streetTwo !== undefined ? streetTwo : null,
		city,
		state,
		zipCode,
		type,
	};
	// if notary, add user.id to addressToBeCreated obj
	if (req.user.isNotary) addressToBeCreated.userId = req.user.id;
	// if employee, add customerId to addressToBeCreated obj
	if (req.user.isEmployee) addressToBeCreated.customerId = customerId;

	AddressModel.create(addressToBeCreated)
		.then((savedAddress) => savedAddress.get())
		.then(res.status(201).json({ message: "Address created successfully" }))
		.catch((err) => {
			if (err instanceof ValidationError) {
				return res.status(400).json({
					message: "ValidationError",
					error: err.errors,
				});
			} else {
				return res.status(500).json({ message: "Error adding address" });
			}
		});
});
/*
    Update Address
    Notary users can update there own address only
    Employees can update update a customer address only
*/
router.put("/update", validateToken, async (req, res) => {
	const {
		streetOne,
		streetTwo,
		city,
		state,
		zipCode,
		type,
		addressId,
		customerId,
	} = req.body.address;
	// check for missing required fields
	const missingRequiredFields = [];
	if (!addressId) missingRequiredFields.push("addressId is required");
	if (req.user.isEmployee && !customerId)
		missingRequiredFields.push("customerId is required");
	if (missingRequiredFields.length > 0)
		return res.status(400).json({ message: missingRequiredFields });

	const query = {
		where: { id: addressId },
	};

	try {
		// if notary, add userId to query
		if (req.user.isNotary) query.where.userId = req.user.id;
		// if employee, add customerId to query
		if (req.user.isEmployee) query.where.customerId = customerId;
		// locate saved address
		const foundAddress = await AddressModel.findOne(query).then((address) =>
			address.get()
		);
		// only update if values have changed
		const updateResult = await AddressModel.update(
			{
				streetOne:
					streetOne === foundAddress.streetOne
						? foundAddress.streetOne
						: streetOne,
				streetTwo:
					streetTwo === foundAddress.streetTwo
						? foundAddress.streetTwo
						: streetTwo !== undefined
						? streetTwo
						: null,
				city: city === foundAddress.city ? foundAddress.city : city,
				state: state === foundAddress.state ? foundAddress.state : state,
				zipCode:
					zipCode === foundAddress.zipCode ? foundAddress.zipCode : zipCode,
				type: type === foundAddress.type ? foundAddress.type : type,
			},
			query
		);
		// if update successful, return a 200 status
		if (updateResult > 0)
			return res.status(200).json({ message: "Address updated successfully" });
	} catch (err) {
		if (err instanceof ValidationError) {
			return res.status(400).json({
				message: "ValidationError",
				error: err.errors,
			});
		} else {
			return res.status(500).json({ message: "Error updating address" });
		}
	}
});
/*
    Get Address
    Notary can get own address only
    Employee can get customer address only
*/
router.get("/", validateToken, (req, res) => {
	const { addressId, customerId } = req.body.address;
	// check for missing required fields
	const missingRequiredFields = [];
	if (!addressId) missingRequiredFields.push("addressId is required");
	if (req.user.isEmployee && !customerId)
		missingRequiredFields.push("customerId is required");
	if (missingRequiredFields.length > 0)
		return res.status(400).json({ message: missingRequiredFields });

	const query = {
		where: { id: addressId },
	};

	// if notary, add userId to query
	if (req.user.isNotary) query.where.userId = req.user.id;
	// if employee, add customerId to query
	if (req.user.isEmployee) query.where.customerId = customerId;
	// locate address
	AddressModel.findOne(query)
		.then((foundAddress) => foundAddress.get())
		.then((address) => {
			return res.status(200).json({
				message: "Address found",
				address: {
					id: address.id,
					streetOne: address.streetOne,
					streetTwo: address.streetTwo,
					city: address.city,
					state: address.state,
					zipCode: address.zipCode,
					type: address.type,
				},
			});
		})
		.catch((err) => res.status(500).json({ message: "Error getting address" }));
});
/* 
    Delete Address
    Notary can delete own address only
    Employee can delete customer address only
*/
router.delete("/delete", validateToken, (req, res) => {
	const { addressId, customerId } = req.body.address;
	// check for missing required fields
	const missingRequiredFields = [];
	if (!addressId) missingRequiredFields.push("addressId is required");
	if (req.user.isEmployee && !customerId)
		missingRequiredFields.push("customerId is required");
	if (missingRequiredFields.length > 0)
		return res.status(400).json({ message: missingRequiredFields });

	const query = {
		where: { id: addressId },
	};

	// if notary, add userId to query
	if (req.user.isNotary) query.where.userId = req.user.id;
	// if employee, add customerId to query
	if (req.user.isEmployee) query.where.customerId = customerId;
	// delete record
	AddressModel.destroy(query)
		.then((result) => {
			if (result === 0)
				return res.status(200).json({ message: "No address found to delete" });
			if (result === 1)
				return res
					.status(200)
					.json({ message: "Address removed successfully" });
		})
		.catch((err) =>
			res.status(500).json({ message: "Error deleting address" })
		);
});

module.exports = router;
