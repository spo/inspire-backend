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
        initialised: "inizialised",
        bs: {
          articleNumber: "bs_articleNumber",
          gender: "bs_gender",
          type: "bs_type",
          assortment: "bs_assortment",
          sort: "bs_sort",
          usedFor: "bs_usedFor",
          version: "bs_version",
          edition: "bs_edition",
          color: "bs_color",
          length: "bs_length",
          width: "bs_width",
          height: "bs_height",
          additionalProductInformation: "bs_additionalProductInfo",
          category: "bs_category",
          description: "bs_description",
        },
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
