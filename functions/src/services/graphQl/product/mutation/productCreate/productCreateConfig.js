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
      key: shopify.privateMetafields.product.bs.gender,
      namespace: shopify.privateMetafields.product.namespace,
      type: "string",
      value: convertGender(product.gender),
    },
    {
      key: shopify.privateMetafields.product.bs.color,
      namespace: shopify.privateMetafields.product.namespace,
      type: "string",
      value: checkColor(product.color),
    },
    {
      key: shopify.privateMetafields.product.bs.length,
      namespace: shopify.privateMetafields.product.namespace,
      type: "integer",
      value: convertNumberToStringWithComma(product.length),
    },
    {
      key: shopify.privateMetafields.product.bs.width,
      namespace: shopify.privateMetafields.product.namespace,
      type: "integer",
      value: convertNumberToStringWithComma(product.width),
    },
    {
      key: shopify.privateMetafields.product.bs.height,
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
      key: shopify.privateMetafields.product.bs.articleNumber,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.articleNumber),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bs.type,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.type),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bs.assortment,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.assortment),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bs.sort,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.sort),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bs.usedFor,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.usedFor),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bs.version,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.version),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bs.edition,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.edition),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bs.additionalProductInformation,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.additionalProductInformation),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bs.category,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.category),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bs.description,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.description),
        valueType: "STRING",
      },
    },
  ];


  return privateMetafields;
};


