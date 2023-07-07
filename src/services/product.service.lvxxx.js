const {
  product,
  clothing,
  electronic,
  furniture,
} = require("../models/product.model");
const { BadRequestError } = require("../core/error.response");

class ProductFactory {
  static productRegistry = {};

  static registerProductType(type, classRef) {
    ProductFactory.productRegistry[type] = classRef;
  }

  static async createProduct(type, payload) {
    const productClass = ProductFactory.productRegistry[type];
    if (!productClass)
      throw new BadRequestError(`Invalid product type::: ${type}`);

    return new productClass(payload).createProduct();
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
    if (!newElectronic)
      throw new BadRequestError("Create new electronic error");
    const newProduct = await super.createProduct(newElectronic._id);
    if (!newProduct) throw new BadRequestError("Create new product error");
    return newProduct;
  }
}

class Furniture extends Product {
  async createProduct() {
    const newFurniture = await furniture.create({
      ...this.pro_attr,
      pro_shop: this.pro_shop,
    });
    if (!newFurniture) throw new BadRequestError("Create new furniture error");
    const newProduct = await super.createProduct(newFurniture._id);
    if (!newProduct) throw new BadRequestError("Create new product error");
    return newProduct;
  }
}

ProductFactory.registerProductType("Electronics", Electronic);
ProductFactory.registerProductType("Clothing", Clothing);
ProductFactory.registerProductType("Furniture", Furniture);

module.exports = ProductFactory;
