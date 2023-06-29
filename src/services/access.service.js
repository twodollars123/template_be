const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const keyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInforData } = require("../utils");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
  NotFoundError,
} = require("../core/error.response");
const { findByEmail, findByUserId } = require("./shop.service");
const ObjectId = require("mongodb").ObjectId;

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  ADMIN: "ADMIN",
  EDITER: "EDITER",
};

class AccessService {
  //v2
  static handleRefreshTokenV2 = async ({ refreshToken, user, keyStore }) => {
    console.log("user::", user);
    console.log("refreshToken::", refreshToken);
    console.log("keyStore::", keyStore);
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await keyTokenService.deleteKeyByUserId(userId);
      throw new ForbiddenError("Something wrong happen !! Pls relogin");
    }

    if (keyStore.refreshToken !== refreshToken)
      throw new NotFoundError("RefreshToken is not valid");

    const foundShop = await findByUserId(new ObjectId(userId));
    console.log("foundShop::", foundShop);

    if (!foundShop) throw new NotFoundError("userId is not valid");

    //created tokens
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    //update
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });
    return {
      user,
      tokens,
    };
  };
  //v1
  static handleRefreshToken = async (refreshToken) => {
    //check this refresh token is used ??
    const foundToken = await keyTokenService.findByRefreshTokenUsed(
      refreshToken
    );

    if (foundToken) {
      //decode xem ai dang dung refreshToken
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      console.log({ userId, email });
      await keyTokenService.deleteKeyByUserId(userId);
      throw new ForbiddenError("Something wrong happen !! Pls relogin");
    }

    const holderToken = await keyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new NotFoundError("RefreshToken is not valid");

    //verifyToken
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    console.log(`[2] --`, { userId, email });
    //check userId
    const foundShop = await findByUserId(new ObjectId(userId));
    console.log("foundShop::", foundShop);

    if (!foundShop) throw new NotFoundError("userId is not valid");

    //created tokens
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    //update
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken,
      },
    });
    return {
      user: { userId, email },
      tokens,
    };
  };

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
