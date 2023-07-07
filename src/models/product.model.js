const { model, Schema } = require("mongoose");

const DOCUMENT_NAME = "Product";
const COLLECTION_NAME = "Products";

const productSchema = new Schema(
  {
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
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

const clothingSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
  },
  { timestamps: true, collection: "Clothing" }
);

const electronicSchema = new Schema(
  {
    brand: { type: String, required: true },
    size: String,
    material: String,
  },
  { timestamps: true, collection: "Electronics" }
);

module.exports = {
  product: model(DOCUMENT_NAME, productSchema),
  clothing: model("Clothing", clothingSchema),
  electronic: model("Electronics", electronicSchema),
};