const {
  OkResponse,
  CreatedResponse,
  SuccessResponse,
} = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  handlerRefreshToken = async (req, res, next) => {
    new SuccessResponse({
      message: "Get tokens success!",
      metadata: await AccessService.handleRefreshToken(req.body.refreshToken),
    }).send(res);
  };
  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logout success!",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };
  login = async (req, res, next) => {
    new CreatedResponse({
      message: "Login success",
      metadata: await AccessService.login(req.body),
    }).send(res);
  };
  signUp = async (req, res, next) => {
    // try {
    console.log(`[P]::signUp`, req.body);
    new CreatedResponse({
      message: "Register Success!",
      metadata: await AccessService.signUp(req.body),
      options: { limit: 10 },
    }).send(res);
    // return res.status(200).json(await AccessService.signUp(req.body));
    // } catch (error) {
    //   next(error);
    // }
  };
}

module.exports = new AccessController();
