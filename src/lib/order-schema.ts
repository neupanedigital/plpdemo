import { z } from "zod";

export const orderInputSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name.").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9][0-9\s-]{6,18}$/, "Please enter a valid phone number."),
  email: z.email("Please enter a valid email address.").max(160),
  location: z.string().trim().min(5, "Kindly share your exact location.").max(300),
  productId: z.literal("biswas-20-item-mixed-dry-fruits-1kg"),
  quantity: z.coerce.number().int().min(1).max(20),
  deliveryZone: z.enum(["inside_valley", "outside_valley"]),
  idempotencyKey: z.uuid(),
  website: z.string().max(0).optional().default(""),
});

export type OrderInput = z.infer<typeof orderInputSchema>;

export type OrderRecord = {
  orderId: string;
  createdAt: string;
  customerName: string;
  phone: string;
  email: string;
  location: string;
  productName: string;
  quantity: number;
  pricePerPiece: number;
  subtotal: number;
  deliveryZone: string;
  deliveryFee: number;
  totalPrice: number;
  paymentMethod: "Cash On Delivery";
  orderStatus: "New Order";
  notes: string;
};
