/**
 * Sita Ram Operating System — Synthetic Menu Catalog Fixtures (M0.5)
 *
 * Implements `MenuItemDTO` and `CategoryDTO` from `@sitaram/core-contracts`.
 * All prices strictly in integer minor units (paise / INR).
 */

export const CATEGORIES_FIXTURE = [
  {
    id: 'cat_sweets_01',
    outletId: 'outlet_bareilly_civil_lines',
    name: 'Traditional Indian Sweets (Mithai)',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat_dairy_02',
    outletId: 'outlet_bareilly_civil_lines',
    name: 'Fresh Dairy & Paneer',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat_bakery_03',
    outletId: 'outlet_bareilly_station_rd',
    name: 'Artisanal Bakery & Biscuits',
    sortOrder: 1,
    isActive: true,
  },
];

export const MENU_ITEMS_FIXTURE = [
  {
    id: 'item_gulab_jamun_01',
    orgId: 'org_gangaram_01',
    brandId: 'brand_gangaram_sweets',
    outletId: 'outlet_bareilly_civil_lines',
    categoryId: 'cat_sweets_01',
    name: 'Desi Ghee Gulab Jamun (Box of 4)',
    description: 'Freshly prepared soft mawa dumplings soaked in cardamom saffron syrup.',
    basePricePaise: 16000, // ₹160.00
    dietaryTag: 'VEG',
    isAvailable: true,
    imageUrl: 'http://127.0.0.1:9199/placeholder/gulab-jamun.jpg',
    modifierGroups: [
      {
        id: 'mod_packaging_01',
        name: 'Packaging Type',
        minSelections: 1,
        maxSelections: 1,
        options: [
          {
            id: 'opt_std_box',
            name: 'Standard Eco Box',
            priceDeltaPaise: 0,
            isAvailable: true,
          },
          {
            id: 'opt_gift_tin',
            name: 'Royal Gift Tin Packaging',
            priceDeltaPaise: 3000, // +₹30.00
            isAvailable: true,
          },
        ],
      },
    ],
  },
  {
    id: 'item_kaju_katli_02',
    orgId: 'org_gangaram_01',
    brandId: 'brand_gangaram_sweets',
    outletId: 'outlet_bareilly_civil_lines',
    categoryId: 'cat_sweets_01',
    name: 'Silver Leaf Kaju Katli (500g)',
    description: 'Diamond shaped cashew fudge made with premium Goan cashews.',
    basePricePaise: 48000, // ₹480.00
    dietaryTag: 'VEG',
    isAvailable: true,
    imageUrl: 'http://127.0.0.1:9199/placeholder/kaju-katli.jpg',
  },
  {
    id: 'item_rasgulla_03',
    orgId: 'org_gangaram_01',
    brandId: 'brand_gangaram_sweets',
    outletId: 'outlet_bareilly_civil_lines',
    categoryId: 'cat_sweets_01',
    name: 'Kolkata Spongy Rasgulla (Box of 4)',
    description: 'Spongy cottage cheese balls in pure light sugar syrup.',
    basePricePaise: 14000, // ₹140.00
    dietaryTag: 'VEG',
    isAvailable: true,
    imageUrl: 'http://127.0.0.1:9199/placeholder/rasgulla.jpg',
  },
  {
    id: 'item_malai_paneer_04',
    orgId: 'org_gangaram_01',
    brandId: 'brand_gangaram_sweets',
    outletId: 'outlet_bareilly_civil_lines',
    categoryId: 'cat_dairy_02',
    name: 'Fresh Malai Paneer (500g)',
    description: 'Farm fresh soft cow milk cottage cheese vacuum sealed.',
    basePricePaise: 24000, // ₹240.00
    dietaryTag: 'VEG',
    isAvailable: true,
    imageUrl: 'http://127.0.0.1:9199/placeholder/paneer.jpg',
  },
  {
    id: 'item_fresh_dahi_05',
    orgId: 'org_gangaram_01',
    brandId: 'brand_gangaram_sweets',
    outletId: 'outlet_bareilly_civil_lines',
    categoryId: 'cat_dairy_02',
    name: 'Set Sweetened Dahi (Misti Doi 400g)',
    description: 'Traditional earthen pot set caramelized sweet curd.',
    basePricePaise: 9000, // ₹90.00
    dietaryTag: 'VEG',
    isAvailable: true,
    imageUrl: 'http://127.0.0.1:9199/placeholder/dahi.jpg',
  },
  {
    id: 'item_almond_cookies_06',
    orgId: 'org_gangaram_01',
    brandId: 'brand_gangaram_bakery',
    outletId: 'outlet_bareilly_station_rd',
    categoryId: 'cat_bakery_03',
    name: 'Handcrafted Almond Butter Cookies (300g)',
    description: 'Crisp baked pure butter cookies with roasted almonds.',
    basePricePaise: 18000, // ₹180.00
    dietaryTag: 'VEG',
    isAvailable: true,
    imageUrl: 'http://127.0.0.1:9199/placeholder/cookies.jpg',
  },
];
