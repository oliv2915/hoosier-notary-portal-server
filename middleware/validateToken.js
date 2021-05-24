const jwt = require("jsonwebtoken");
const { UserModel } = require("../models");

const validateToken = (req, res, next) => {
	// ignore preflight checks
	if (req.method === "OPTIONS") return next();
	// if no auth header found, access is Forbidden
	if (!req.headers.authorization)
		return res.status(403).json({ message: "Forbidden" });
	// get authorization header
	const { authorization } = req.headers;
	// verify authorization token is valid, if not, set payload to undefined
	const payload = authorization
		? jwt.verify(
				authorization.includes("Bearer")
					? authorization.split(" ")[1]
					: authorization,
				process.env.JWT_SECRET
		  )
		: undefined;
	// if payload is invalid, deny access
	if (!payload) return res.status(401).json({ message: "Not Authorized" });

	// locate the user
	UserModel.findOne({
		where: { id: payload.id },
	})
		.then((foundUser) => foundUser.get())
		.then((user) => {
			// set req.user with role flags and user id
			req.user = {
				id: user.id,
				isNotary: user.isNotary,
				isActiveNotary: user.isActiveNotary,
				isEmployee: user.isEmployee,
				isActiveEmployee: user.isActiveEmployee,
				isSuper: user.isSuper,
			};
			return next();
		})
		.catch((err) => {
			if (err instanceof jwt.TokenExpiredError) {
				return res.status(401).json({ message: "Not Authorized" });
			} else {
				return res.status(500).json({ message: "Error" });
			}
		});
};

module.exports = validateToken;
