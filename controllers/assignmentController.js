const router = require("express").Router();
const { AssignmentModel, CustomerModel, UserModel } = require("../models");
const { UniqueConstraintError, ValidationError } = require("sequelize");
const { validateToken } = require("../middleware");
/*
    Add New Assignement (Employee Only)
*/
router.post("/add", validateToken, (req, res) => {
	if (!req.user.isEmployee)
		return res.status(401).json({ message: "Not Authorized" });
	const {
		fileNumber,
		dueDate,
		notes,
		contactName,
		contactPhoneNumber,
		contactEmail,
		meetingAddress,
		rate,
		type,
		status,
		customerId,
	} = req.body.assignment;
	// check for missing required fields
	const missingRequiredFields = [];
	if (!customerId) missingRequiredFields.push("customerId is required");
	if (!fileNumber) missingRequiredFields.push("fileNumber is required");
	if (!dueDate) missingRequiredFields.push("dueDate is required");
	if (!contactName) missingRequiredFields.push("contactName is required");
	if (!contactPhoneNumber)
		missingRequiredFields.push("contactPhoneNumber is required");
	if (!contactEmail) missingRequiredFields.push("contactEmail is required");
	if (!meetingAddress) missingRequiredFields.push("meetingAddress is required");
	if (!rate) missingRequiredFields.push("rate is required");
	if (!type) missingRequiredFields.push("type is required");
	if (!status) missingRequiredFields.push("status is required");
	if (missingRequiredFields.length > 0)
		return res.status(400).json({ message: missingRequiredFields });

	// create assignement
	AssignmentModel.create({
		customerId,
		fileNumber,
		dueDate,
		contactName,
		contactEmail,
		contactPhoneNumber,
		meetingAddress,
		rate,
		type,
		status,
		notes: notes !== undefined ? notes : null,
	})
		.then((createdAssignement) => createdAssignement.get())
		.then((assignment) => {
			return res.status(201).json({
				message: "Assignment created",
				assignment: {
					id: assignment.id,
					fileNumber: assignment.fileNumber,
					dueDate: assignment.dueDate,
					contactName: assignment.contactName,
					contactPhoneNumber: assignment.contactPhoneNumber,
					contactEmail: assignment.contactEmail,
					meetingAddress: assignment.meetingAddress,
					notes: assignment.notes,
					rate: assignment.rate,
					type: assignment.type,
					status: assignment.status,
				},
			});
		})
		.catch((err) =>
			res.status(500).json({ message: "Error adding assignment" })
		);
});
/*
    Update Assignment
    Employee can update all parts of the assignment
    Notary can only update the userId field when they accept the assignment
*/
router.put("/update", validateToken, (req, res) => {
	const {
		fileNumber,
		dueDate,
		notes,
		contactName,
		contactPhoneNumber,
		contactEmail,
		meetingAddress,
		rate,
		type,
		status,
		customerId,
		notaryId,
		assignmentId,
	} = req.body.assignment;
	// check for missing required fields
	const missingRequiredFields = [];
	if (!customerId) missingRequiredFields.push("customerId is required");
	if (!assignmentId) missingRequiredFields.push("assignmentId is required");
	if (missingRequiredFields.length > 0)
		return res.status(400).json({ message: missingRequiredFields });

	const query = {
		where: {
			id: assignmentId,
			customerId: customerId,
		},
	};

	let fieldsToUpdate = {};
	// if notary is accepting assignment and has been approved, update userId field
	if (req.user.isActiveNotary) fieldsToUpdate = { userId: req.user.id };
	// if employee is updating the assignment, update all fields
	if (req.user.isEmployee)
		fieldsToUpdate = {
			fileNumber,
			dueDate,
			contactName,
			contactPhoneNumber,
			contactEmail,
			meetingAddress,
			rate,
			type,
			status,
			userId: notaryId !== undefined ? notaryId : null,
			notes: notes !== undefined ? notes : null,
		};

	AssignmentModel.update(fieldsToUpdate, query)
		.then((result) => res.status(200).json({ message: "Assignment Updated" }))
		.catch((err) =>
			res.status(500).json({ message: "Error updating assignment" })
		);
});
/*
    Get Assignment (Employee and Active Notary)
*/
router.get("/", validateToken, (req, res) => {
	const { assignmentId, customerId } = req.body.assignment;

	const query = {
		where: {
			id: assignmentId,
			customerId: customerId,
		},
		include: [CustomerModel, UserModel],
	};

	AssignmentModel.findOne(query)
		.then((foundAssignment) => {
			const assignment = {
				id: foundAssignment.id,
				fileNumber: foundAssignment.fileNumber,
				dueDate: foundAssignment.dueDate,
				notes: foundAssignment.notes,
				contactName: foundAssignment.contactName,
				contactPhoneNumber: foundAssignment.contactPhoneNumber,
				contactEmail: foundAssignment.contactEmail,
				meetingAddress: foundAssignment.meetingAddress,
				rate: foundAssignment.rate,
				type: foundAssignment.type,
				status: foundAssignment.status,
				customer: {
					customerId: foundAssignment.customer.id,
					name: foundAssignment.customer.name,
					phoneNumber: foundAssignment.customer.phoneNumber,
					email: foundAssignment.customer.email,
				},
				notary: foundAssignment.user
					? {
							id: foundAssignment.user.id,
							firstName: foundAssignment.user.firstName,
							middleName: foundAssignment.user.middleName,
							lastName: foundAssignment.user.lastName,
							suffix: foundAssignment.user.suffix,
							phoneNumber: foundAssignment.user.phoneNumber,
							email: foundAssignment.user.email,
					  }
					: null,
			};
			return res.status(200).json(assignment);
		})
		.catch((err) =>
			res.status(500).json({ message: "Error getting assignment" })
		);
});
module.exports = router;
