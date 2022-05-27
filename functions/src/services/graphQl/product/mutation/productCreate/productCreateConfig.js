require("dotenv").config();
const {shopify} = require("../../../../../config/config");
const {convertGender} = require("../../../../../utils/convertGender");
const {checkColor} = require("../../../../../utils/checkColor");
const {convertNumberToStringWithComma} = require("../../../../../utils/convertNumberToStringWithComma");

exports.metafields = (product) => {
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
  const privateMetafields = [
    {
      key: shopify.privateMetafields.product.bsArticleNumber.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.articleNumber,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsConcern.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.concern,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsType.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.type,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsAssortment.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.assortment,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsSort.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.sort,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsUsedFor.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.usedFor,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsVersion.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.version,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsEdition.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.edition,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsStockType.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.stockType,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsAdditionalProductInformation.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.additionalProductInformation,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsCategory.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.category,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsDescription.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.description,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsCategoryDescription.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.categoryDescription,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsProductDescription.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.productDescription,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsProductSortDescription.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.productSortDescription,
        valueType: "STRING",
      },
    },
    {
      key: shopify.privateMetafields.product.bsExtendedDescription.key,
      namespace: shopify.privateMetafields.product.namespace,
      valueInput: {
        value: product.extendedDescription,
        valueType: "STRING",
      },
    },
  ];


  return privateMetafields;
};


