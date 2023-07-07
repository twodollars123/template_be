const ProductService = require("../services/product.service");
const { SuccessResponse } = require("../core/success.response");

class ProductController {
  createProduct = async (req, res, next) => {
    new SuccessResponse({
      message: `Create product success`,
      metadata: await ProductService.createProduct(req.body.pro_type, {
        ...req.body,
        pro_shop: req.user.userId,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
