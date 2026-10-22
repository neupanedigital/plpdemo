import { JWT } from "google-auth-library";
import type { OrderRecord } from "@/lib/order-schema";

const HEADERS = [
  "Order ID",
  "Date & Time",
  "Customer Name",
  "Phone Number",
  "Email Address",
  "Exact Location",
  "Product Name",
  "Quantity",
  "Price Per Piece",
  "Delivery Zone",
  "Delivery Fee",
  "Total Price",
  "Payment Method",
  "Order Status",
  "Notes",
];

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function escapeSheetName(name: string) {
  return `'${name.replace(/'/g, "''")}'`;
}

async function getContext() {
  const spreadsheetId = required("GOOGLE_SHEET_ID");
  const tabName = process.env.GOOGLE_SHEET_TAB_NAME || "Orders";
  const auth = new JWT({
    email: required("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    key: required("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const credentials = await auth.authorize();
  if (!credentials.access_token) throw new Error("Google authentication did not return an access token.");
  return { token: credentials.access_token, spreadsheetId, tabName };
}

async function googleRequest<T>(token: string, url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Google Sheets request failed (${response.status}): ${details.slice(0, 300)}`);
  }
  return response.json() as Promise<T>;
}

async function ensureSheetReady() {
  const context = await getContext();
  const { token, spreadsheetId, tabName } = context;
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`;
  const spreadsheet = await googleRequest<{ sheets?: Array<{ properties?: { sheetId?: number; title?: string } }> }>(token, `${base}?fields=sheets.properties(sheetId,title)`);
  const tab = spreadsheet.sheets?.find((sheet) => sheet.properties?.title === tabName);
  const sheetId = tab?.properties?.sheetId;
  if (sheetId === undefined) {
    throw new Error(`Google Sheet tab "${tabName}" was not found.`);
  }

  const headerRange = `${escapeSheetName(tabName)}!A1:O1`;
  const current = await googleRequest<{ values?: string[][] }>(token, `${base}/values/${encodeURIComponent(headerRange)}`);
  const headerIsReady = current.values?.[0]?.join("|") === HEADERS.join("|");

  if (!headerIsReady) {
    await googleRequest(token, `${base}/values/${encodeURIComponent(headerRange)}?valueInputOption=RAW`, {
      method: "PUT",
      body: JSON.stringify({ values: [HEADERS] }),
    });
  }

  await googleRequest(token, `${base}:batchUpdate`, {
    method: "POST",
    body: JSON.stringify({
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
            fields: "gridProperties.frozenRowCount",
          },
        },
        {
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 15 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.08, green: 0.28, blue: 0.16 },
                textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
        {
          setDataValidation: {
            range: { sheetId, startRowIndex: 1, startColumnIndex: 13, endColumnIndex: 14 },
            rule: {
              condition: {
                type: "ONE_OF_LIST",
                values: ["New Order", "Order Confirmed", "Order Ongoing", "Delivered", "Cancelled"].map((userEnteredValue) => ({ userEnteredValue })),
              },
              strict: true,
              showCustomUi: true,
            },
          },
        },
        {
          autoResizeDimensions: {
            dimensions: { sheetId, dimension: "COLUMNS", startIndex: 0, endIndex: 15 },
          },
        },
      ],
    }),
  });

  return context;
}

export async function saveOrderToSheet(order: OrderRecord) {
  const { token, spreadsheetId, tabName } = await ensureSheetReady();
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`;
  const idRange = `${escapeSheetName(tabName)}!A2:A`;
  const existing = await googleRequest<{ values?: string[][] }>(token, `${base}/values/${encodeURIComponent(idRange)}`);
  const alreadySaved = existing.values?.some((row) => row[0] === order.orderId);
  if (alreadySaved) return { alreadySaved: true };

  const appendRange = `${escapeSheetName(tabName)}!A:O`;
  await googleRequest(token, `${base}/values/${encodeURIComponent(appendRange)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
    method: "POST",
    body: JSON.stringify({
      values: [[
        order.orderId,
        order.createdAt,
        order.customerName,
        order.phone,
        order.email,
        order.location,
        order.productName,
        order.quantity,
        order.pricePerPiece,
        order.deliveryZone,
        order.deliveryFee,
        order.totalPrice,
        order.paymentMethod,
        order.orderStatus,
        order.notes,
      ]],
    }),
  });

  return { alreadySaved: false };
}
