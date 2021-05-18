const router = require("express").Router();
const { UserModel } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { UniqueConstraintError, ValidationError } = require("sequelize");
const { validateToken } = require("../middleware");
/* 
    Register a user
    Users are registered as a notary by default.
*/
router.post("/register", (req, res) => {
	const {
		email,
		firstName,
		middleName,
		lastName,
		suffix,
		phoneNumber,
		password,
	} = req.body.user;
	// check for missing required fields
	const missingRequiredFields = [];
	if (!email) missingRequiredFields.push("email is required");
	if (!firstName) missingRequiredFields.push("firstName is required");
	if (!lastName) missingRequiredFields.push("lastName is required");
	if (!phoneNumber) missingRequiredFields.push("phoneNumber is required");
	if (!password) missingRequiredFields.push("password is required");
	// if missingRequireFields.length is greater than 0, return a 400 status with the list of missing fields
	if (missingRequiredFields.length > 0)
		return res.status(400).json({ message: missingRequiredFields });
	// create user with required and optional data
	UserModel.create({
		email,
		firstName,
		middleName: middleName ? middleName : null,
		lastName,
		suffix: suffix ? suffix : null,
		phoneNumber,
		password: bcrypt.hashSync(password, 13),
	})
		.then((createdUser) => createdUser.get())
		.then((userData) => {
			return res.status(201).json({
				message: "User Created Successfuly",
				token: jwt.sign({ id: userData.id }, process.env.JWT_SECRET, {
					expiresIn: 60 * 60 * 24,
				}),
			});
		})
		.catch((err) => {
			if (err instanceof UniqueConstraintError) {
				return res.status(409).json({
					message: "UniqueConstraintError",
					error: "Email address already in use.",
				});
			} else if (err instanceof ValidationError) {
				return res
					.status(400)
					.json({ message: "ValidationError", error: err.errors });
			} else {
				return res.status(500).json({ message: "Server Error" });
			}
		});
});
/*
    User Login
    All users can login using this endpoint
*/
router.post("/login", (req, res) => {
	const { email, password } = req.body.user;
	// if no email or password was provided, return a 400 status
	if (!email || !password)
		return res.status(400).json({ message: "email and password required" });
	// locate the user and compare passwords
	UserModel.findOne({ where: { email: email } })
		.then((foundUser) => {
			// if user found, return that user
			if (foundUser) return foundUser.get();
			// return a no user found message
			return res
				.status(404)
				.json({ message: "Invalid email and/or password." });
		})
		.then((user) => {
			// prevent former employees from accesing the portal (isActiveEmployee will be false)
			if (user.isEmployee && !user.isActiveEmployee)
				return res.status(403).json({ message: "Forbidden" });
			// if user is notary && (isEmployee || isSuper), forbidden (this should never happen)
			if (user.isNotary && (user.isEmployee || user.isSuper))
				return res.status(403).json({ message: "Forbidden" });

			// if provided password matches the found password, return a successful status with a token
			if (bcrypt.compare(password, user.password))
				return res.status(200).json({
					message: "User logged in",
					token: jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
						expiresIn: 60 * 60 * 24,
					}),
				});
			// return invalid email/password message
			return res.status(400).json({ message: "Invalid email and/or password" });
		})
		.catch((err) => res.status(500).json({ message: "Server Error" }));
});
/* 
    Update user
    User's can update their own profile.
    Employees can update notary flags only
    Super Employees can update notary and employee flags
*/
router.put("/update", validateToken, async (req, res) => {
	const {
		email,
		firstName,
		middleName,
		lastName,
		suffix,
		phoneNumber,
		password,
		isActiveNotary,
		isActiveEmployee,
		isSuper,
		userId,
	} = req.body.user;

	let userDataToUpdate = {};
	const query = {};

	try {
		if (req.user.isEmployee && userId !== undefined) {
			// set query paramets
			query.where = { id: userId };
			// set the flags to be updated
			userDataToUpdate = {
				isActiveNotary: isActiveNotary ? true : false,
			};
			// only super user can change an employee flag
			if (req.user.isEmployee && req.user.isSuper)
				userDataToUpdate["isActiveEmployee"] = isActiveEmployee ? true : false;
			// only super user can set an employee as a super
			if (req.user.isEmployee && req.user.isSuper && isSuper !== undefined)
				userDataToUpdate["isSuper"] = isSuper ? true : false;
			// update user flags
			const result = await UserModel.update(userDataToUpdate, query);
			if (result > 0)
				return res.status(200).json({ message: "User updated successfully" });
		} else if (req.user.isNotary || req.user.isEmployee) {
			// set query parameters
			query.where = { id: req.user.id };
			// find the saved record
			const foundUserRecord = await UserModel.findOne(query);
			userDataToUpdate = {
				// if provided field value matches the database, change nothing, else change saved value to new value
				email: email === foundUserRecord.email ? foundUserRecord.email : email,
				firstName:
					firstName === foundUserRecord.firstName
						? foundUserRecord.firstName
						: firstName,
				middleName:
					middleName === foundUserRecord.middleName
						? foundUserRecord.middleName
						: middleName !== undefined
						? middleName
						: null,
				lastName:
					lastName === foundUserRecord.lastName
						? foundUserRecord.lastName
						: lastName,
				suffix:
					suffix === foundUserRecord.suffix
						? foundUserRecord.suffix
						: suffix !== undefined
						? suffix
						: null,
				phoneNumber:
					phoneNumber === foundUserRecord.phoneNumber
						? foundUserRecord.phoneNumber
						: phoneNumber,
				password: (await bcrypt.compare(password, foundUserRecord.password))
					? foundUserRecord.password
					: bcrypt.hashSync(password, 13),
			};
			// update the user
			const result = await UserModel.update(userDataToUpdate, query);
			if (result > 0)
				return res.status(200).json({ message: "User updated successfully" });
		}
	} catch (err) {
		if (err instanceof UniqueConstraintError) {
			return res.status(409).json({
				message: "UniqueConstraintError",
				error: "Email address already in use.",
			});
		} else if (err instanceof ValidationError) {
			return res
				.status(400)
				.json({ message: "ValidationError", error: err.errors });
		} else {
			return res.status(500).json({ message: "error updating user record" });
		}
	}
});
/*
    Get user Profile
    User's can pull there own profile
    Only employees can pull another user profile
*/
router.get("/profile", validateToken, (req, res) => {
	const userId = "user" in req.body ? req.body.user.userId : undefined;
	const query = {};
	// if user is an employee and userId has been provided, we are pulling a user record
	// set query to pull that user record
	if (req.user.isEmployee && userId) {
		query.where = { id: userId };
		// if user is a notary, or employee, pull own record
	} else if (req.user.isNotary || req.user.isEmployee) {
		query.where = { id: req.user.id };
	}
	UserModel.findOne(query)
		.then((foundUser) => foundUser.get())
		.then((user) => {
			return res.status(200).json({
				user: {
					id: user.id,
					email: user.email,
					firstName: user.firstName,
					middleName: user.middleName,
					lastName: user.lastName,
					suffix: user.suffix,
					phoneNumber: user.phoneNumber,
					isNotary: user.isNotary,
					isActiveNotary: user.isActiveNotary,
					isEmployee: user.isEmployee,
					isActiveEmployee: user.isActiveEmployee,
					isSuper: user.isSuper,
				},
			});
		})
		.catch((err) =>
			res.status(500).json({ message: "Server error getting user profile" })
		);
});
module.exports = router;
