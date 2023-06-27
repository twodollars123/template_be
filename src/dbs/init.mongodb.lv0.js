const mongoose = require("mongoose");

const connectStr = `mongodb://127.0.0.1:27017/eCommerce`;

mongoose
  .connect(connectStr)
  .then(() => console.log(`Connected MongoDB Success`))
  .catch((err) => console.log(`error connect`));

//dev
if (1 === 1) {
  mongoose.set("debug", true), mongoose.set("debug", { color: true });
}

module.exports = mongoose;
