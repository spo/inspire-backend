const functions = require("firebase-functions");
require("dotenv").config();
const {shopify} = require("../../../../../config/config");
const {convertGender} = require("../../../../../utils/convertGender");
const {checkColor} = require("../../../../../utils/color/checkColor");
const {convertNumberToStringWithComma} = require("../../../../../utils/convertNumberToStringWithComma");
const {replaceEmptyString} = require("../../../../../utils/replaceEmptyString");


exports.metafields = (product) => {
  if (!product) {
    functions.logger.warn("No product available to update the private meta fields ", {
      structuredData: true,
    });
  }

  const metafields = [
    {
      key: shopify.privateMetafields.product.bsGender,
      namespace: shopify.privateMetafields.product.namespace,
      type: "string",
      value: convertGender(product.gender),
    },
    {
      key: shopify.privateMetafields.product.bsColor,
      namespace: shopify.privateMetafields.product.namespace,
      type: "string",
      value: checkColor(product.color),
    },
    {
      key: shopify.privateMetafields.product.bsLength,
      namespace: shopify.privateMetafields.product.namespace,
      type: "integer",
      value: convertNumberToStringWithComma(product.length),
    },
    {
      key: shopify.privateMetafields.product.bsWidth,
      namespace: shopify.privateMetafields.product.namespace,
      type: "integer",
      value: convertNumberToStringWithComma(product.width),
    },
    {
      key: shopify.privateMetafields.product.bsHeight,
      namespace: shopify.privateMetafields.product.namespace,
      type: "integer",
      value: convertNumberToStringWithComma(product.height),
    },
  ];


  return metafields;
};

exports.privateMetafields = (product) => {
  if (!product) {
    functions.logger.warn("No product available to update the private meta fields ", {
      structuredData: true,
    });
  }

  const privateMetafields = [
    {
      key: shopify.privateMetafields.product.bsArticleNumber,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.articleNumber),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsType,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.type),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsAssortment,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.assortment),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsSort,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.sort),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsUsedFor,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.usedFor),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsVersion,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.version),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsAdditionalProductInformation,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.additionalProductInformation),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsCategory,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.category),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsDescription,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.description),
        valueType: "STRING",
      },
    },
  ];


  return privateMetafields;
};


