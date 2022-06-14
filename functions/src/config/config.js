require("dotenv").config();

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET_KEY,
  SHOPIFY_HOST,
  SHOPIFY_API_VERSION} = process.env;

module.exports = {
  shopify: {
    endpoint: `https://${SHOPIFY_API_KEY}:${SHOPIFY_API_SECRET_KEY}@${SHOPIFY_HOST}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
    location: {
      FUE: {id: "gid://shopify/Location/66785018045"},
      BSI: {id: "gid://shopify/Location/66974318781"},
    },
    options: {
      color: "Farbe",
      selection: "Auswahl",
      version: "Version",
      unitOfMeasurement: {
        ml: "ml",
        gram: "g",
        piece: "Stück",
      },
      gender: {
        male: "male",
        female: "female",
        unisex: "unisex",
      },
    },
    privateMetafields: {
      product: {
        namespace: "product",
        // bs -> B&S International (supplier)
        bsInitialised: "bs_inizialised",
        bsArticleNumber: "bs_articleNumber",
        bsGender: "bs_gender",
        bsType: "bs_type",
        bsAssortment: "bs_assortment",
        bsSort: "bs_sort",
        bsUsedFor: "bs_usedFor",
        bsVersion: "bs_version",
        bsEdition: "bs_edition",
        bsColor: "bs_color",
        bsLength: "bs_length",
        bsWidth: "bs_width",
        bsHeight: "bs_height",
        bsAdditionalProductInformation: "bs_additionalProductInfo",
        bsCategory: "bs_category",
        bsDescription: "bs_description",
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
