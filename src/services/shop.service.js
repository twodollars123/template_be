const shopModel = require("../models/shop.model");

const findByEmail = async (
  email,
  select = { email: 1, password: 2, name: 1, status: 1, role: 1 }
) => {
  return await shopModel.findOne({ email }).select(select).lean();
};

const findByUserId = async (userId) => {
  return await shopModel.findOne({ _id: userId });
};

module.exports = { findByEmail, findByUserId };
