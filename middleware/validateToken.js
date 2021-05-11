const jwt = require("jsonwebtoken");
const {UserModel} = require("../models");

const validateToken = (req, res, next) => {
    // ignore preflight checks
    if (req.method === "OPTIONS") return next();
    // if no auth header found, access is Forbidden
    if (!req.headers.authorization) return res.status(403).json({message: "Forbidden"});
    // get authorization header
    const { authorization } = req.headers;
    // verify authorization token is valid, if not, set payload to undefined
    const payload = authorization ? jwt.verify(authorization.includes("Bearer") ? authorization.split(" ")[1] : authorization, process.env.JWT_SECRET) : undefined;
    // if payload is invalid, deny access
    if (!payload) return res.status(401).json({message: "Not Authorized"});

    // locate the user
    UserModel.findOne({
        where: {id: payload.id}
    }).then(foundUser => {
        // if user is found, return that user
        if (foundUser) return foundUser.get();
        // return not authorized
        return res.status(401).json({message: "Not Authorized"});
    })
    .then(user => {
        // prevent former employee access (should never happen)
        if (user.isEmployee && !user.isActiveEmployee) return res.status(403).json({message: "Forbidden"});
       // if user is (notary || customer) && (isEmployee || isSuper), forbidden (this should never happen)
        if (((user.isNotary || user.isCustomer) && (user.isEmployee || user.isSuper))) return res.status(403).json({message: "Forbidden"});

        // set req.user with role flags and user id
        req.user = {
            id: user.id,
            isNotary: user.isNotary,
            isActiveNotary: user.isActiveNotary,
            isCustomer: user.isCustomer,
            isActiveCustomer: user.isActiveCustomer,
            isEmployee: user.isEmployee,
            isActiveEmployee: user.isActiveEmployee,
            isSuper: user.isSuper
        };
        return next();
    })
    .catch(err => {
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({message: "Not Authorized"});
        } else {
            return res.status(500).json({message: "Error"});
        }
    })

}

module.exports = validateToken;