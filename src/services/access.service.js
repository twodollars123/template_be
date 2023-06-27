const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInforData } = require("../utils");
const { BadRequestError, AuthFailureError } = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  ADMIN: "ADMIN",
  EDITER: "EDITER",
};

class AccessService {
  static logout = async (keyStore) => {
    const delKey = await keyTokenService.removeKeyById(keyStore._id);
    console.log("delKey::", delKey);
    return delKey;
  };

  static login = async ({ email, password, refreshToken = null }) => {
    //check email
    const foundShop = await findByEmail(email);
    if (!foundShop) throw new BadRequestError("shop not register!");
    // match password
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication error");
    //created publicKey and privateKey
    const publicKey = crypto.randomBytes(64).toString("hex");
    const privateKey = crypto.randomBytes(64).toString("hex");
    //generate tokens
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await keyTokenService.createKeyToken({
      userId,
      publicKey,
      privateKey,
      refreshToken: tokens.refreshToken,
    });

    return {
      shop: getInforData({
        fileds: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    try {
      //step1: check email exists?
      const holderShop = await shopModel.findOne({ email }).lean();

      if (holderShop) {
        // return {
        //   code: "xxxx",
        //   message: "Shop already registered!",
        // };
        throw new BadRequestError("Error:: Shop already registered!");
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });

      if (newShop) {
        //create privateKey, publicKey

        //lv security
        // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        //   modulusLength: 4096,
        //   publicKeyEncoding: {
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        //   privateKeyEncoding: {
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        // });

        //lv normal
        const publicKey = crypto.randomBytes(64).toString("hex");
        const privateKey = crypto.randomBytes(64).toString("hex");

        console.log(`privateKey, publicKey:::`, { privateKey, publicKey }); //save collection KeyStore

        const keyStore = await keyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
        });

        if (!keyStore) {
          return {
            code: "xxx",
            message: "keyStore error",
          };
        }

        // const publicKeyObject = crypto.createPublicKey(publicKeyString);
        // console.log(`publicKeyObject::`, publicKeyObject);
        //create token pair
        const tokens = await createTokenPair(
          { userId: newShop._id, email },
          publicKey,
          privateKey
        );

        console.log(`created token success::`, tokens);

        return {
          code: 201,
          metadata: {
            shop: getInforData({
              fileds: ["_id", "name", "email"],
              object: newShop,
            }),
            tokens,
          },
        };
      }

      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
