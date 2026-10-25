import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/email";
import { saveOrderToSheet } from "@/lib/google-sheets";
import { orderInputSchema, type OrderRecord } from "@/lib/order-schema";
import { calculateOrder, PRODUCT } from "@/lib/product";

export const runtime = "nodejs";

function allowedOrigin(request: NextRequest) {
  const configured = process.env.FRONTEND_URL?.replace(/\/$/, "");
  const origin = request.headers.get("origin")?.replace(/\/$/, "");
  return !configured || !origin || configured === origin;
}

function createdAtKathmandu() {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kathmandu",
    year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(new Date());
}

export async function POST(request: NextRequest) {
  if (!allowedOrigin(request)) return NextResponse.json({ error: "This order request came from an unauthorized website." }, { status: 403 });

  let orderId = "unknown";
  try {
    const body = await request.json();
    const parsed = orderInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Please check your order details." }, { status: 400 });
    }
    if (parsed.data.website) return NextResponse.json({ error: "Invalid order request." }, { status: 400 });

    const input = parsed.data;
    orderId = `BIS-${createHash("sha256").update(input.idempotencyKey).digest("hex").slice(0, 10).toUpperCase()}`;
    const totals = calculateOrder(input.quantity, input.deliveryZone);
    const deliveryZone = input.deliveryZone === "inside_valley" ? "Inside Kathmandu Valley" : "Outside Kathmandu Valley";
    const order: OrderRecord = {
      orderId,
      createdAt: createdAtKathmandu(),
      customerName: input.fullName,
      phone: input.phone,
      email: input.email,
      location: input.location,
      productName: `${PRODUCT.name} (${PRODUCT.weight})`,
      quantity: input.quantity,
      pricePerPiece: PRODUCT.price,
      subtotal: totals.subtotal,
      deliveryZone,
      deliveryFee: totals.deliveryFee,
      totalPrice: totals.total,
      paymentMethod: "Cash On Delivery",
      orderStatus: "New Order",
      notes: "",
    };

    const sheetResult = await saveOrderToSheet(order);
    if (!sheetResult.alreadySaved) await sendOrderEmails(order);

    return NextResponse.json({
      success: true,
      order: { orderId, productName: order.productName, quantity: order.quantity, totalPrice: order.totalPrice, paymentMethod: order.paymentMethod },
    });
  } catch (error) {
    console.error(`Order submission failed [${orderId}]`, error instanceof Error ? error.message : "Unknown error");
    const configurationError = error instanceof Error && error.message.startsWith("Missing required environment variable");
    return NextResponse.json({ error: configurationError ? "The order system is not configured yet. Please contact support." : "We could not complete every order step. Please try again or contact support." }, { status: 500 });
  }
}
