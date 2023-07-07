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

  async createProduct(product_id) {
    return await product.create({ ...this, _id: product_id });
  }
}

class Clothing extends Product {
  async createProduct() {
    const newClothing = await clothing.create({
      ...this.pro_attr,
      pro_shop: this.pro_shop,
    });
    if (!newClothing) throw new BadRequestError("Create new clothing error");
    const newProduct = await super.createProduct(newClothing._id);
    if (!newProduct) throw new BadRequestError("Create new product error");
    return newProduct;
  }
}

class Electronic extends Product {
  async createProduct() {
    const newElectronic = await electronic.create({
      ...this.pro_attr,
      pro_shop: this.pro_shop,
    });
    if (!newElectronic) throw new BadRequestError("Create new clothing error");
    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError("Create new product error");
    return newProduct;
  }
}

module.exports = ProductFactory;
