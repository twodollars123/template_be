const { product, clothing, electronic } = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");

class ProductFactory {
  static async createProduct(type, payload) {
    switch (type) {
      case "Electronics":
        return new Electronic(payload).createProduct();
      case "Clothing":
        return new Clothing(payload).createProduct();
      default:
        throw new BadRequestError(`Invalid product type::: ${type}`);
    }
  }
}
/*
pro_name: { type: String, required: true },
    pro_thumb: { type: String, required: true },
    pro_desc: String,
    pro_price: { type: Number, required: true },
    pro_quantity: { type: Number, required: true },
    pro_type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Furniture"],
    },
    pro_shop: { type: Schema.Types.ObjectId, ref: "Shop" },
    pro_attr: { type: Schema.Types.Mixed, required: true },
*/

class Product {
  constructor({
    pro_name,
    pro_thumb,
    pro_desc,
    pro_price,
    pro_quantity,
    pro_type,
    pro_shop,
    pro_attr,
  }) {
    this.pro_name = pro_name;
    this.pro_thumb = pro_thumb;
    this.pro_desc = pro_desc;
    this.pro_price = pro_price;
    this.pro_quantity = pro_quantity;
    this.pro_type = pro_type;
    this.pro_shop = pro_shop;
    this.pro_attr = pro_attr;
  }

  async createProduct() {
    return await product.create(this);
  }
}

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create(this.pro_attr);
    if (!newClothing) throw new BadRequestError("Create new clothing error");
    const newProduct = await super.createProduct();
    if (!newProduct) throw new BadRequestError("Create new product error");
    return newProduct;
  }
}

class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create(this.pro_attr);
    if (!newElectronic) throw new BadRequestError("Create new clothing error");
    const newProduct = await super.createProduct();
    if (!newProduct) throw new BadRequestError("Create new product error");
    return newProduct;
  }
}

module.exports = ProductFactory;
