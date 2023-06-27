const mongoose = require("mongoose");

const {
  db: { host, port, name },
} = require("../configs/config.mongodb");

const connectStr = `mongodb://${host}:${port}/${name}`;

class Database {
  constructor() {
    this.connect();
  }

  //connect
  connect(type = "mongodb") {
    if (1 === 1) {
      mongoose.set("debug", true), mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectStr)
      .then(() => console.log(`Connected MongoDB Success Pro`))
      .catch((err) => console.log(`error connect`));
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }

    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();
module.exports = instanceMongodb;
