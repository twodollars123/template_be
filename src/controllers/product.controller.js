const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.lvxxx");
const { SuccessResponse } = require("../core/success.response");

class ProductController {
  createProduct = async (req, res, next) => {
    // new SuccessResponse({
    //   message: `Create product success`,
    //   metadata: await ProductService.createProduct(req.body.pro_type, {
    //     ...req.body,
    //     pro_shop: req.user.userId,
    //   }),
    // }).send(res);
    new SuccessResponse({
      message: `Create product success`,
      metadata: await ProductServiceV2.createProduct(req.body.pro_type, {
        ...req.body,
        pro_shop: req.user.userId,
      }),
    }).send(res);
  };
}

module.exports = new ProductController();
