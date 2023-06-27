const express = require("express");
const router = express.Router();
const accessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../helpers/asyncHandler.helper");
const { authentication } = require("../../auth/authUtils");

//login
router.post("/shop/login", asyncHandler(accessController.login));
//signUp
router.post("/shop/signup", asyncHandler(accessController.signUp));
///authentication
router.use(authentication);
//logout
router.post("/shop/logout", asyncHandler(accessController.logout));

module.exports = router;