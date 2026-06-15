import nodemailer from "nodemailer";

type OrderEmailAddress = {
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getOrderItems = (orderDetails: any) => {
  const products = Array.isArray(orderDetails.products) ? orderDetails.products : [];

  if (products.length > 0) {
    return products;
  }

  return Array.isArray(orderDetails.lineItems) ? orderDetails.lineItems : [];
};

const formatAddress = (address?: OrderEmailAddress | null) => {
  if (!address) return "N/A";

  return [
    address.fullName,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.pincode,
    address.phone ? `Phone: ${address.phone}` : null,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br />");
};

const getItemImage = (item: any) => {
  const image = item.selectedImg?.images?.[0] || item.image || item.images?.[0];
  return typeof image === "string" ? image : "";
};

export async function sendOrderEmails(
  customerEmail: string | null | undefined,
  sellerEmail: string | null | undefined,
  orderDetails: any,
) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("Order email is not configured. EMAIL_USER and EMAIL_PASS are required.");
  }

  if (!customerEmail) {
    throw new Error("Order email cannot be sent because customer email is missing.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const itemsList = getOrderItems(orderDetails)
    .map((item: any) => {
      const image = getItemImage(item);
      const quantity = item.qty || item.quantity || 1;
      const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
      const lineTotal = Number(item.lineTotal ?? unitPrice * quantity);

      return `
        <li style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #eee;display:flex;gap:14px;align-items:center;">
          ${
            image
              ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(item.name)}" style="width:72px;height:72px;object-fit:cover;border:1px solid #ddd;" />`
              : ""
          }
          <div>
            <strong>${escapeHtml(item.name)}</strong><br />
            <span style="color:#666;">Quantity:</span> ${escapeHtml(quantity)}<br />
            <span style="color:#666;">Price:</span> ${escapeHtml(formatCurrency(unitPrice))}<br />
            <span style="color:#666;">Line total:</span> ${escapeHtml(formatCurrency(lineTotal))}
          </div>
        </li>
      `;
    })
    .join("");

  const orderTotal = Number(orderDetails.grandTotal ?? orderDetails.amount / 100 ?? 0);
  const orderId = orderDetails.id || orderDetails.paymentIntentId;
  const address = formatAddress(orderDetails.savedAddress);
  const brandName = "MTShop";
  const subjectOrderId = orderId ? ` #${orderId}` : "";

  const customerHtml = `
    <div style="font-family:Arial,sans-serif;color:#222;line-height:1.5;">
      <h2 style="margin:0 0 16px;">Thank you for your order</h2>
      <p>Your ${brandName} purchase has been confirmed.</p>
      <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
      <p><strong>Total:</strong> ${escapeHtml(formatCurrency(orderTotal))}</p>
      <p><strong>Status:</strong> ${escapeHtml(orderDetails.status)}</p>
      <h3 style="margin-top:24px;">Delivery Address</h3>
      <p>${address}</p>
      <h3 style="margin-top:24px;">Items Ordered</h3>
      <ul style="list-style:none;padding:0;margin:0;">${itemsList}</ul>
      <p style="margin-top:24px;">We will notify you when your order moves ahead.</p>
    </div>
  `;

  const sellerHtml = `
    <div style="font-family:Arial,sans-serif;color:#222;line-height:1.5;">
      <h2 style="margin:0 0 16px;">New order received</h2>
      <p><strong>Customer:</strong> ${escapeHtml(customerEmail)}</p>
      <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
      <p><strong>Total:</strong> ${escapeHtml(formatCurrency(orderTotal))}</p>
      <h3 style="margin-top:24px;">Delivery Address</h3>
      <p>${address}</p>
      <h3 style="margin-top:24px;">Items Ordered</h3>
      <ul style="list-style:none;padding:0;margin:0;">${itemsList}</ul>
      <p><strong>Status:</strong> ${escapeHtml(orderDetails.status)}</p>
    </div>
  `;

  await Promise.all([
    transporter.sendMail({
      from: `"${brandName}" <${emailUser}>`,
      to: customerEmail,
      subject: `${brandName} order confirmation${subjectOrderId}`,
      html: customerHtml,
    }),
    transporter.sendMail({
      from: `"${brandName}" <${emailUser}>`,
      to: sellerEmail || emailUser,
      subject: `New ${brandName} order${subjectOrderId}`,
      html: sellerHtml,
    }),
  ]);
}

export async function sendOrderEmailsSafely(orderDetails: any) {
  try {
    await sendOrderEmails(
      orderDetails.savedAddress?.email || orderDetails.user?.email,
      process.env.SELLER_EMAIL || process.env.EMAIL_USER,
      orderDetails,
    );
  } catch (error) {
    console.error("Order email failed:", error);
  }
}
