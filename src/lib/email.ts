import nodemailer from "nodemailer";
import type { OrderRecord } from "@/lib/order-schema";
import { formatNpr } from "@/lib/product";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function shell(content: string, brand: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f0e5;font-family:Arial,sans-serif;color:#183626"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border-radius:18px;overflow:hidden;border:1px solid #e6dfcf"><tr><td style="background:#153f27;padding:24px 28px;color:#fff;font-size:24px;font-weight:800">${escapeHtml(brand)}</td></tr><tr><td style="padding:30px 28px">${content}</td></tr><tr><td style="background:#faf7ef;padding:18px 28px;color:#6c746e;font-size:12px">This email was sent for a Cash On Delivery order placed on the ${escapeHtml(brand)} website.</td></tr></table></td></tr></table></body></html>`;
}

function row(label: string, value: string | number) {
  return `<tr><td style="padding:9px 0;color:#6a736d;font-size:14px">${escapeHtml(label)}</td><td style="padding:9px 0;text-align:right;font-size:14px;font-weight:700">${escapeHtml(value)}</td></tr>`;
}

function adminEmail(order: OrderRecord, brand: string) {
  return shell(`<div style="font-size:12px;font-weight:800;color:#c4661b;text-transform:uppercase;letter-spacing:1px">New order received</div><h1 style="margin:8px 0 10px;font-size:28px;color:#153f27">A new COD order is ready to confirm</h1><p style="margin:0 0 22px;color:#606b64;line-height:1.6">Order <strong>${escapeHtml(order.orderId)}</strong> was received on ${escapeHtml(order.createdAt)}.</p><div style="background:#fff4dc;border-left:4px solid #e88b2c;padding:14px 16px;margin:0 0 24px;font-weight:700;color:#6d4015">Please call the customer soon to confirm this order.</div><h2 style="font-size:17px;margin:0 0 8px">Customer details</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row("Name", order.customerName)}${row("Phone", order.phone)}${row("Email", order.email)}${row("Exact location", order.location)}</table><hr style="border:0;border-top:1px solid #eee7d8;margin:22px 0"><h2 style="font-size:17px;margin:0 0 8px">Order details</h2><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row("Product", order.productName)}${row("Quantity", order.quantity)}${row("Price per jar", formatNpr(order.pricePerPiece))}${row("Delivery", `${order.deliveryZone} — ${formatNpr(order.deliveryFee)}`)}${row("Total", formatNpr(order.totalPrice))}${row("Payment", order.paymentMethod)}${row("Status", order.orderStatus)}</table>`, brand);
}

function customerEmail(order: OrderRecord, brand: string, supportEmail: string) {
  return shell(`<div style="font-size:12px;font-weight:800;color:#c4661b;text-transform:uppercase;letter-spacing:1px">Order received</div><h1 style="margin:8px 0 10px;font-size:28px;color:#153f27">Thank you for your order!</h1><p style="color:#4e5b53;line-height:1.7">Hi ${escapeHtml(order.customerName)},</p><p style="color:#4e5b53;line-height:1.7">We have received your order successfully. Our sales representative will call you soon to confirm your order.</p><div style="background:#f8f5ec;border-radius:14px;padding:18px;margin:22px 0"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row("Order ID", order.orderId)}${row("Product", order.productName)}${row("Quantity", order.quantity)}${row("Delivery fee", formatNpr(order.deliveryFee))}${row("Total price", formatNpr(order.totalPrice))}${row("Payment method", order.paymentMethod)}</table></div><p style="color:#4e5b53;line-height:1.7">Questions? Reply to this email or contact <a href="mailto:${escapeHtml(supportEmail)}" style="color:#17603a">${escapeHtml(supportEmail)}</a>.</p><p style="margin:22px 0 0;color:#4e5b53">Thank you,<br><strong>${escapeHtml(brand)}</strong></p>`, brand);
}

function adminText(order: OrderRecord) {
  return [
    "New COD order received",
    `Order ID: ${order.orderId}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    `Email: ${order.email}`,
    `Location: ${order.location}`,
    `Product: ${order.productName}`,
    `Quantity: ${order.quantity}`,
    `Delivery: ${order.deliveryZone} (${formatNpr(order.deliveryFee)})`,
    `Total: ${formatNpr(order.totalPrice)}`,
    `Payment: ${order.paymentMethod}`,
    "Please call the customer to confirm the order.",
  ].join("\n");
}

function customerText(order: OrderRecord, brand: string, supportEmail: string) {
  return [
    `Hi ${order.customerName},`,
    "",
    "Thank you. We received your order successfully. Our representative will call you soon to confirm it.",
    `Order ID: ${order.orderId}`,
    `Product: ${order.productName}`,
    `Quantity: ${order.quantity}`,
    `Delivery fee: ${formatNpr(order.deliveryFee)}`,
    `Total: ${formatNpr(order.totalPrice)}`,
    `Payment: ${order.paymentMethod}`,
    "",
    `Questions? Reply to this email or contact ${supportEmail}.`,
    `— ${brand}`,
  ].join("\n");
}

export async function sendOrderEmails(order: OrderRecord) {
  const port = Number(required("SMTP_PORT"));
  const businessEmail = required("BUSINESS_EMAIL");
  const brand = process.env.BRAND_NAME || "Biswas";
  const transporter = nodemailer.createTransport({
    host: required("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: { user: required("SMTP_USER"), pass: required("SMTP_PASS") },
  });
  const from = required("EMAIL_FROM");

  await Promise.all([
    transporter.sendMail({
      from,
      to: businessEmail,
      replyTo: order.email,
      subject: `New COD order — ${order.orderId}`,
      text: adminText(order),
      html: adminEmail(order, brand),
    }),
    transporter.sendMail({
      from,
      to: order.email,
      replyTo: businessEmail,
      subject: `Order confirmation — ${order.orderId} | ${brand}`,
      text: customerText(order, brand, businessEmail),
      html: customerEmail(order, brand, businessEmail),
    }),
  ]);
}
