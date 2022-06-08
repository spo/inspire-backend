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
      key: shopify.privateMetafields.product.bsGender.key,
      namespace: shopify.privateMetafields.product.namespace,
      type: "string",
      value: convertGender(product.gender),
    },
    {
      key: shopify.privateMetafields.product.bsColor.key,
      namespace: shopify.privateMetafields.product.namespace,
      type: "string",
      value: checkColor(product.color),
    },
    {
      key: shopify.privateMetafields.product.bsLength.key,
      namespace: shopify.privateMetafields.product.namespace,
      type: "integer",
      value: convertNumberToStringWithComma(product.length),
    },
    {
      key: shopify.privateMetafields.product.bsWidth.key,
      namespace: shopify.privateMetafields.product.namespace,
      type: "integer",
      value: convertNumberToStringWithComma(product.width),
    },
    {
      key: shopify.privateMetafields.product.bsHeight.key,
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
      key: shopify.privateMetafields.product.bsArticleNumber.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.articleNumber),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsType.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.type),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsAssortment.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.assortment),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsSort.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.sort),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsUsedFor.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.usedFor),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsVersion.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.version),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsEdition.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.edition),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsAdditionalProductInformation.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.additionalProductInformation),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsCategory.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.category),
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsDescription.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: replaceEmptyString(product.description),
        valueType: "STRING",
      },
    },
  ];


  return privateMetafields;
};


