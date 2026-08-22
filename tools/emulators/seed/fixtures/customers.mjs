/**
 * Sita Ram Operating System — Synthetic Customer Profile Fixtures (M0.5)
 *
 * Implements `CustomerProfileDTO` from `@sitaram/core-contracts`.
 */

export const CUSTOMERS_FIXTURE = [
  {
    id: 'cust_ananya_01',
    phone: '+919999900001',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@sitaram.local',
    defaultAddress: {
      street: 'Flat 402, Royal Palms Residency',
      landmark: 'Near Gandhi Udyan',
      city: 'Bareilly',
      postalCode: '243001',
      latitude: 28.3685,
      longitude: 79.432,
      formattedAddress: 'Flat 402, Royal Palms Residency, Near Gandhi Udyan, Bareilly, UP 243001',
    },
  },
  {
    id: 'cust_rahul_02',
    phone: '+919999900002',
    name: 'Rahul Verma',
    email: 'rahul.verma@sitaram.local',
    defaultAddress: {
      street: '12-B Model Town Extension',
      landmark: 'Opposite City Hospital',
      city: 'Bareilly',
      postalCode: '243005',
      latitude: 28.375,
      longitude: 79.441,
      formattedAddress: '12-B Model Town Extension, Bareilly, UP 243005',
    },
  },
];
