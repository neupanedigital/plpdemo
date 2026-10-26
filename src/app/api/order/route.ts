import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { sendOrderEmails } from "@/lib/email";
import { saveOrderToSheet } from "@/lib/google-sheets";
import { orderInputSchema, type OrderRecord } from "@/lib/order-schema";
import { calculateOrder, PRODUCT } from "@/lib/product";

export const runtime = "nodejs";

function normalizeOrigin(value: string | null | undefined, defaultProtocol = "https") {
  if (!value) return null;
  try {
    const url = new URL(value.includes("://") ? value : `${defaultProtocol}://${value}`);
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return null;
  }
}

function allowedOrigin(request: NextRequest) {
  const origin = normalizeOrigin(request.headers.get("origin"));
  if (!origin) return true;

  const forwardedHost = (request.headers.get("x-forwarded-host") || request.headers.get("host"))
    ?.split(",")[0]
    .trim();
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || request.nextUrl.protocol.replace(":", "") || "https";
  const requestHostOrigin = normalizeOrigin(forwardedHost, forwardedProtocol);

  // Vercel forwards the public host to the API route. Accepting that exact host
  // keeps same-site checkout requests working across production and preview URLs.
  if (requestHostOrigin === origin) return true;

  const configuredOrigins = [process.env.FRONTEND_URL, process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_URL]
    .flatMap((value) => value?.split(",") || [])
    .map((value) => normalizeOrigin(value.trim()))
    .filter((value): value is string => Boolean(value));

  return configuredOrigins.includes(origin);
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
  let orderStep: "request" | "sheet" | "email" = "request";
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

    orderStep = "sheet";
    const sheetResult = await saveOrderToSheet(order);
    if (!sheetResult.alreadySaved) {
      orderStep = "email";
      await sendOrderEmails(order);
    }

    return NextResponse.json({
      success: true,
      order: { orderId, productName: order.productName, quantity: order.quantity, totalPrice: order.totalPrice, paymentMethod: order.paymentMethod },
    });
  } catch (error) {
    console.error(`Order submission failed [${orderId}] at ${orderStep}`, error instanceof Error ? error.message : "Unknown error");
    const configurationError = error instanceof Error && error.message.startsWith("Missing required environment variable");
    const errorMessage = configurationError
      ? "The order system is not configured yet. Please contact support."
      : orderStep === "sheet"
        ? "We could not save your order. Please contact support."
        : orderStep === "email"
          ? "Your order was saved, but confirmation emails could not be sent. Please contact support."
          : "We could not complete your order. Please try again or contact support.";
    return NextResponse.json({ error: errorMessage, code: `ORDER_${orderStep.toUpperCase()}_FAILED` }, { status: 500 });
  }
}
