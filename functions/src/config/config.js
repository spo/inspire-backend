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
    options: {
      color: "Farbe",
      selection: "Auswahl",
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
        bsInizialisedle: {key: "bs_inizialised"},
        bsArticleNumber: {key: "bs_articleNumber"},
        bsGender: {key: "bs_gender"},
        bsType: {key: "bs_type"},
        bsAssortment: {key: "bs_assortment"},
        bsSort: {key: "bs_sort"},
        bsUsedFor: {key: "bs_usedFor"},
        bsVersion: {key: "bs_version"},
        bsEdition: {key: "bs_edition"},
        bsColor: {key: "bs_color"},
        bsLength: {key: "bs_length"},
        bsWidth: {key: "bs_width"},
        bsHeight: {key: "bs_height"},
        bsAdditionalProductInformation: {key: "bs_additionalProductInfo"},
        bsCategory: {key: "bs_category"},
        bsDescription: {key: "bs_description"},
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
