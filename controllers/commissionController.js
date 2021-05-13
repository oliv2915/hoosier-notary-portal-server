const router = require("express").Router();
const {CommissionModel} = require("../models");
const {UniqueConstraintError, ValidationError} = require("sequelize");
const {validateToken} = require("../middleware");
/*
    Add commission (Notary only)
*/
router.post("/add", validateToken, (req, res) => {
    if (!req.user.isNotary) return res.status(401).json({message: "Not Authorized"});
    const {commissionNumber, nameOnCommission, commissionExpireDate, commissionState, countyOfResidence} = req.body.commission;
    // check for missing required fields
    const missingRequiredFields = [];
    if (!commissionNumber) missingRequiredFields.push("commissionNumber is required");
    if (!nameOnCommission) missingRequiredFields.push("nameOnCommission is required");
    if (!commissionExpireDate) missingRequiredFields.push("commissionExpireDate is required");
    if (!commissionState) missingRequiredFields.push("commissionState is required");
    if (!countyOfResidence) missingRequiredFields.push("countyOfresidence is required");
    if (missingRequiredFields.length > 0) return res.status(400).json({message: missingRequiredFields});

    // create commission
    CommissionModel.create({
        commissionNumber,
        nameOnCommission,
        commissionExpireDate,
        commissionState,
        countyOfResidence,
        userId: req.user.id
    })
    .then(savedCommission => savedCommission.get())
    .then(commission => res.status(201).json({message: "Commission created successfully"}))
    .catch(err => {
        if (err instanceof UniqueConstraintError) {
            return res.status(400).json({message: "UniqueConstraintError", error: "Commission Number already in use"})
        } else if (err instanceof ValidationError) {
            return res.status(400).json({
                message: "ValidationError",
                error: err.errors
            });
        } else {
            return res.status(500).json({message: "Error adding commission"})
        }
    })
});
/*
    Update Commission (Notary Only)
*/
router.put("/update", validateToken, (req, res) => {
    if (!req.user.isNotary) return res.status(401).json({message: "Not Authorized"});
    const {commissionNumber, nameOnCommission, commissionExpireDate, commissionState, countyOfResidence, commissionId} = req.body.commission;

    CommissionModel.update({
        commissionNumber,
        nameOnCommission,
        commissionExpireDate,
        commissionState,
        countyOfResidence
    }, {
        where : {
            id: commissionId,
            userId: req.user.id
        }
    })
    .then(result => res.status(200).json({message: "Commission updated"}))
    .catch(err => res.status(500).json({message: "Error updating commission"}))
});
/*
    Get Commission (Notary Only)
*/
router.get("/", validateToken, (req, res) => {
    if (!req.user.isNotary) return res.status(401).json({message: "Not Authorized"});
    const {commissionId} = req.body.commission;

    CommissionModel.findOne({
        where: {
            id: commissionId,
            userId: req.user.id
        }
    })
    .then(foundCommission => foundCommission.get())
    .then(commission => {
        return res.status(200).json({
            message: "Commission Found",
            commission: {
                id: commission.id,
                commissionNumber: commission.commissionNumber,
                nameOnCommission: commission.nameOnCommission,
                commissionExpireDate: commission.commissionExpireDate,
                commissionState: commission.commissionState,
                countyOfResidence: commission.countyOfResidence
            }
        })
    })
    .catch(err => res.status(500).json({message: "Error getting comission"}))
});
module.exports = router;