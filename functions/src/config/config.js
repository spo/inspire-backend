require("dotenv").config();

const {
  API_KEY_SHOPIFY,
  API_SECRET_KEY_SHOPIFY,
  HOST_SHOPIFY,
  API_VERSION_SHOPIFY} = process.env;

// TODO: use shopify node lib
module.exports = {
  shopify: {
    endpoint: `https://${API_KEY_SHOPIFY}:${API_SECRET_KEY_SHOPIFY}@${HOST_SHOPIFY}/admin/api/${API_VERSION_SHOPIFY}/graphql.json`,
    location: {
      FUE: {id: "gid://shopify/Location/66785018045"},
      BSI: {id: "gid://shopify/Location/66974318781"},
    },
    privateMetafields: {
      product: {
        namespace: "product",
        // bs -> B&S International (supplier)
        bsInizialisedle: {key: "product_bs_inizialised"},
        bsArticleNumber: {key: "product_bs_articleNumber"},
        bsConcern: {key: "product_bs_concern"},
        bsGender: {key: "product_bs_gender"},
        bsType: {key: "product_bs_type"},
        bsAssortment: {key: "product_bs_assortment"},
        bsSort: {key: "product_bs_sort"},
        bsUsedFor: {key: "product_bs_usedFor"},
        bsVersion: {key: "product_bs_version"},
        bsEdition: {key: "product_bs_edition"},
        bsColor: {key: "product_bs_color"},
        bsLength: {key: "product_bs_length"},
        bsWidth: {key: "product_bs_width"},
        bsHeight: {key: "product_bs_height"},
        bsStockType: {key: "product_bs_stockType"},
        bsAdditionalProductInformation: {key: "product_bs_additionalProductInformation"},
        bsCategory: {key: "product_bs_category"},
        bsDescription: {key: "product_bs_description"},
        bsCategoryDescription: {key: "product_bs_categoryDescription"},
        bsProductDescription: {key: "product_bs_productDescription"},
        bsProductSortDescription: {key: "product_bs_productSortDescription"},
        bsExtendedDescription: {key: "product_bs_extendedDescription"},
      },
    },
  },
  bs: {
    gender: {
      male: "H",
      female: "D",
      unisex: "U",
    },
    unitOfMeasurement: {
      piece: "stuk",
      bottle: "fles",
      gram: "gr",
      liter: "liter",
      ml: "ml",
    },

  },
};
