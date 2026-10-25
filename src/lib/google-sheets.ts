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

const STATUS_OPTIONS = ["New Order", "Order Confirmed", "Order Ongoing", "Delivered", "Cancelled"];
const COLUMN_WIDTHS = [150, 155, 165, 125, 210, 280, 255, 85, 120, 185, 110, 120, 155, 145, 240];

type ConditionalFormat = {
  booleanRule?: {
    condition?: { values?: Array<{ userEnteredValue?: string }> };
  };
};

type SheetInfo = {
  properties?: { sheetId?: number; title?: string; gridProperties?: { rowCount?: number } };
  bandedRanges?: Array<{ bandedRangeId?: number }>;
  conditionalFormats?: ConditionalFormat[];
};

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
    throw new Error(`Google Sheets request failed (${response.status}): ${details.slice(0, 500)}`);
  }
  return response.json() as Promise<T>;
}

function conditionalFormatRequests(sheetId: number, rowCount: number) {
  const styles = [
    { status: "New Order", backgroundColor: { red: 1, green: 0.93, blue: 0.78 }, foregroundColor: { red: 0.48, green: 0.27, blue: 0.04 } },
    { status: "Order Confirmed", backgroundColor: { red: 0.86, green: 0.93, blue: 1 }, foregroundColor: { red: 0.08, green: 0.32, blue: 0.55 } },
    { status: "Order Ongoing", backgroundColor: { red: 0.93, green: 0.89, blue: 0.98 }, foregroundColor: { red: 0.35, green: 0.18, blue: 0.52 } },
    { status: "Delivered", backgroundColor: { red: 0.84, green: 0.94, blue: 0.86 }, foregroundColor: { red: 0.08, green: 0.36, blue: 0.18 } },
    { status: "Cancelled", backgroundColor: { red: 0.99, green: 0.86, blue: 0.86 }, foregroundColor: { red: 0.58, green: 0.1, blue: 0.1 } },
  ];

  return styles.map(({ status, backgroundColor, foregroundColor }, index) => ({
    addConditionalFormatRule: {
      index,
      rule: {
        ranges: [{ sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 13, endColumnIndex: 14 }],
        booleanRule: {
          condition: { type: "CUSTOM_FORMULA", values: [{ userEnteredValue: `=$N2="${status}"` }] },
          format: { backgroundColor, textFormat: { foregroundColor, bold: true } },
        },
      },
    },
  }));
}

async function ensureSheetReady() {
  const context = await getContext();
  const { token, spreadsheetId, tabName } = context;
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}`;
  const fields = "sheets(properties(sheetId,title,gridProperties(rowCount)),bandedRanges(bandedRangeId),conditionalFormats(booleanRule(condition(values))))";
  const spreadsheet = await googleRequest<{ sheets?: SheetInfo[] }>(token, `${base}?fields=${encodeURIComponent(fields)}`);
  let tab = spreadsheet.sheets?.find((sheet) => sheet.properties?.title === tabName);

  if (!tab) {
    const created = await googleRequest<{ replies?: Array<{ addSheet?: { properties?: SheetInfo["properties"] } }> }>(token, `${base}:batchUpdate`, {
      method: "POST",
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title: tabName, gridProperties: { rowCount: 1000, columnCount: HEADERS.length, frozenRowCount: 1, hideGridlines: true } } } }],
      }),
    });
    tab = { properties: created.replies?.[0]?.addSheet?.properties };
  }

  const sheetId = tab.properties?.sheetId;
  if (sheetId === undefined) throw new Error(`Google Sheet tab "${tabName}" could not be prepared.`);
  const rowCount = Math.max(1000, tab.properties?.gridProperties?.rowCount || 1000);
  const headerRange = `${escapeSheetName(tabName)}!A1:O1`;
  const current = await googleRequest<{ values?: string[][] }>(token, `${base}/values/${encodeURIComponent(headerRange)}`);

  if (current.values?.[0]?.join("|") !== HEADERS.join("|")) {
    await googleRequest(token, `${base}/values/${encodeURIComponent(headerRange)}?valueInputOption=RAW`, {
      method: "PUT",
      body: JSON.stringify({ values: [HEADERS] }),
    });
  }

  const tableRange = { sheetId, startRowIndex: 0, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: HEADERS.length };
  const bodyRange = { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 0, endColumnIndex: HEADERS.length };
  const banding = {
    range: tableRange,
    rowProperties: {
      headerColor: { red: 0.08, green: 0.28, blue: 0.16 },
      firstBandColor: { red: 0.98, green: 0.97, blue: 0.94 },
      secondBandColor: { red: 1, green: 1, blue: 1 },
    },
  };
  const existingBandingId = tab.bandedRanges?.[0]?.bandedRangeId;
  const hasStatusRules = tab.conditionalFormats?.some((rule) =>
    rule.booleanRule?.condition?.values?.some((value) => value.userEnteredValue?.includes("New Order")),
  );

  const requests: unknown[] = [
    {
      updateSheetProperties: {
        properties: { sheetId, gridProperties: { frozenRowCount: 1, hideGridlines: true } },
        fields: "gridProperties(frozenRowCount,hideGridlines)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: HEADERS.length },
        cell: {
          userEnteredFormat: {
            backgroundColor: { red: 0.08, green: 0.28, blue: 0.16 },
            horizontalAlignment: "CENTER",
            verticalAlignment: "MIDDLE",
            wrapStrategy: "WRAP",
            padding: { top: 8, right: 8, bottom: 8, left: 8 },
            textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontFamily: "Arial", fontSize: 10 },
          },
        },
        fields: "userEnteredFormat",
      },
    },
    {
      repeatCell: {
        range: bodyRange,
        cell: {
          userEnteredFormat: {
            verticalAlignment: "MIDDLE",
            padding: { top: 6, right: 7, bottom: 6, left: 7 },
            textFormat: { foregroundColor: { red: 0.16, green: 0.23, blue: 0.18 }, fontFamily: "Arial", fontSize: 10 },
          },
        },
        fields: "userEnteredFormat(verticalAlignment,padding,textFormat)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 5, endColumnIndex: 7 },
        cell: { userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "TOP" } },
        fields: "userEnteredFormat(wrapStrategy,verticalAlignment)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 14, endColumnIndex: 15 },
        cell: { userEnteredFormat: { wrapStrategy: "WRAP", verticalAlignment: "TOP" } },
        fields: "userEnteredFormat(wrapStrategy,verticalAlignment)",
      },
    },
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 7, endColumnIndex: 8 },
        cell: { userEnteredFormat: { horizontalAlignment: "RIGHT", numberFormat: { type: "NUMBER", pattern: "0" } } },
        fields: "userEnteredFormat(horizontalAlignment,numberFormat)",
      },
    },
    ...[8, 10, 11].map((columnIndex) => ({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: columnIndex, endColumnIndex: columnIndex + 1 },
        cell: { userEnteredFormat: { horizontalAlignment: "RIGHT", numberFormat: { type: "CURRENCY", pattern: '"NPR" #,##0' } } },
        fields: "userEnteredFormat(horizontalAlignment,numberFormat)",
      },
    })),
    {
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 12, endColumnIndex: 14 },
        cell: { userEnteredFormat: { horizontalAlignment: "CENTER" } },
        fields: "userEnteredFormat.horizontalAlignment",
      },
    },
    {
      setDataValidation: {
        range: { sheetId, startRowIndex: 1, endRowIndex: rowCount, startColumnIndex: 13, endColumnIndex: 14 },
        rule: {
          condition: { type: "ONE_OF_LIST", values: STATUS_OPTIONS.map((userEnteredValue) => ({ userEnteredValue })) },
          strict: true,
          showCustomUi: true,
        },
      },
    },
    { setBasicFilter: { filter: { range: tableRange } } },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 0, endIndex: 1 },
        properties: { pixelSize: 44 },
        fields: "pixelSize",
      },
    },
    {
      updateDimensionProperties: {
        range: { sheetId, dimension: "ROWS", startIndex: 1, endIndex: rowCount },
        properties: { pixelSize: 36 },
        fields: "pixelSize",
      },
    },
    ...COLUMN_WIDTHS.map((pixelSize, columnIndex) => ({
      updateDimensionProperties: {
        range: { sheetId, dimension: "COLUMNS", startIndex: columnIndex, endIndex: columnIndex + 1 },
        properties: { pixelSize },
        fields: "pixelSize",
      },
    })),
  ];

  if (existingBandingId === undefined) {
    requests.push({ addBanding: { bandedRange: banding } });
  } else {
    requests.push({ updateBanding: { bandedRange: { bandedRangeId: existingBandingId, ...banding }, fields: "range,rowProperties" } });
  }
  if (!hasStatusRules) requests.push(...conditionalFormatRequests(sheetId, rowCount));

  await googleRequest(token, `${base}:batchUpdate`, { method: "POST", body: JSON.stringify({ requests }) });
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
