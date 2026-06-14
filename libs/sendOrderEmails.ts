import nodemailer from "nodemailer";

export async function sendOrderEmails(customerEmail: string, sellerEmail: string, orderDetails: any) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // format address string
  const address = orderDetails.address?.set
    ? `${orderDetails.address.set.line1}, ${orderDetails.address.set.line2}, ${orderDetails.address.set.city}, ${orderDetails.address.set.state}, ${orderDetails.address.set.postal_code}, ${orderDetails.address.set.country}`
    : 'N/A';

  const itemsList = orderDetails.products.map((item: any) => `
    <li style="margin-bottom: 15px; display: flex; align-items: center;">
      <img src="${item.selectedImg.images[0]}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; margin-right: 15px; border-radius: 6px; border: 1px solid #ccc;">
      <div>
        <strong>${item.name}</strong><br>
        <span style="color: #555;">Brand:</span> ${item.brand}<br>
        <span style="color: #555;">Category:</span> ${item.category}<br>
        <span style="color: #555;">Quantity:</span> ${item.quantity}<br>
        <span style="color: #555;">Price:</span> ₹${item.price}
        <span style="color: #555;">Weight:</span> ₹${item.weight}
      </div>
    </li>
  `).join("");

  const commonStyles = `
    font-family: Arial, sans-serif;
    color: #333;
  `;

  const customerMailOptions = {
    from: `"Ush Art Store" <${process.env.EMAIL_USER}>`,
    to: customerEmail,
    subject: "🎨 Your Ush Art Store Order Confirmation",
    html: `
      <div style="${commonStyles}">
        <h2 style="color: #4CAF50;">Thank you for your order!</h2>
        <p><strong>Order ID:</strong> ${orderDetails.paymentIntentId}</p>
        <p><strong>Total:</strong> ₹${orderDetails.amount / 100}</p>
        <p><strong>Status:</strong> ${orderDetails.status}</p>
        <h3 style="margin-top: 20px;">Delivery Address:</h3>
        <p>${address}</p>
        <h3 style="margin-top: 20px;">Items Ordered:</h3>
        <ul style="list-style: none; padding: 0;">${itemsList}</ul>
        <p style="margin-top: 30px;">We'll notify you when your order ships. ✨</p>
      </div>
    `,
  };

  const sellerMailOptions = {
    from: `"Ush Art Store" <${process.env.EMAIL_USER}>`,
    to: sellerEmail,
    subject: "🛒 New Order Received on Ush Art Store",
    html: `
      <div style="${commonStyles}">
        <h2 style="color: #FF5722;">New Order Alert!</h2>
        <p><strong>Customer Email:</strong> ${customerEmail}</p>
        <p><strong>Order ID:</strong> ${orderDetails.paymentIntentId}</p>
        <p><strong>Total:</strong> ₹${orderDetails.amount / 100}</p>
        <h3 style="margin-top: 20px;">Delivery Address:</h3>
        <p>${address}</p>
        <h3 style="margin-top: 20px;">Items Ordered:</h3>
        <ul style="list-style: none; padding: 0;">${itemsList}</ul>
        <p><strong>Status:</strong> ${orderDetails.status}</p>
        <p style="margin-top: 20px;">Prepare this order for dispatch 🚚</p>
      </div>
    `,
  };

  await transporter.sendMail(customerMailOptions);
  await transporter.sendMail(sellerMailOptions);
}
