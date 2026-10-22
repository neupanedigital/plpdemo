export const PRODUCT = {
  id: "biswas-20-item-mixed-dry-fruits-1kg",
  brand: "Biswas",
  name: "20-Item Mixed Dry Fruits",
  weight: "1 kg jar",
  regularPrice: 1999,
  price: 1599,
  currency: "NPR",
  images: [
    "/images/mixed-dry-fruits-white.png",
    "/images/mixed-dry-fruits-shop.png",
    "/images/mixed-dry-fruits-jar.png",
    "/images/mixed-dry-fruits-closeup.png",
  ],
  deliveryFees: {
    inside_valley: 100,
    outside_valley: 200,
  },
} as const;

export type DeliveryZone = keyof typeof PRODUCT.deliveryFees;

export function formatNpr(value: number) {
  return `NPR ${new Intl.NumberFormat("en-NP").format(value)}`;
}

export function calculateOrder(quantity: number, zone: DeliveryZone) {
  const subtotal = PRODUCT.price * quantity;
  const deliveryFee = PRODUCT.deliveryFees[zone];
  return { subtotal, deliveryFee, total: subtotal + deliveryFee };
}
