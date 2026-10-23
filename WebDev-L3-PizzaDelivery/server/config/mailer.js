const nodemailer = require("nodemailer");

const createTransporter = () => {
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const secure = process.env.EMAIL_SECURE === "true";
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass || user.includes("your_email@gmail.com")) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const from =
    process.env.EMAIL_FROM || '"SliceCraft Pizza" <no-reply@slicecraft.com>';

  if (!transporter) {
    console.log(
      "\n================== [DEV EMAIL SIMULATOR] ==================",
    );
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text || html}`);
    console.log(
      "===========================================================\n",
    );
    return { simulated: true, success: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
    console.log(`[Email Sent] Message ID: ${info.messageId} to ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(
      `[Email Error] Failed to send email to ${to}: ${error.message}`,
    );
    console.log("\n--- [Fallback Email Output in Console] ---");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text || html}`);
    console.log("-------------------------------------------\n");
    return { success: false, error: error.message };
  }
};

const sendVerificationEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #ea580c; text-align: center;">Welcome to SliceCraft Artisan Pizza! 🍕</h2>
      <p>Thank you for registering. Please verify your email address to complete your account setup and start ordering delicious handcrafted pizzas.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="font-size: 13px; color: #64748b;">Or copy and paste this link into your browser:</p>
      <p style="font-size: 13px; color: #ea580c; word-break: break-all;">${verifyUrl}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">This link will expire in 24 hours. If you did not create an account, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Verify Your Email - SliceCraft Pizza",
    html,
    text: `Verify your email by visiting: ${verifyUrl}`,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #ea580c; text-align: center;">Password Reset Request 🔐</h2>
      <p>We received a request to reset your password for your SliceCraft account. Click the button below to choose a new password.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 13px; color: #64748b;">Or copy and paste this link into your browser:</p>
      <p style="font-size: 13px; color: #ea580c; word-break: break-all;">${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">This link is valid for 1 hour. If you did not request a password reset, please secure your account immediately.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password - SliceCraft Pizza",
    html,
    text: `Reset your password by visiting: ${resetUrl}`,
  });
};

const sendLowStockAlertEmail = async (adminEmail, lowStockItems) => {
  const itemsHtml = lowStockItems
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: 600;">${item.name}</td>
        <td style="padding: 10px; text-transform: capitalize; color: #64748b;">${item.category}</td>
        <td style="padding: 10px; color: #dc2626; font-weight: bold;">${item.stock} left</td>
        <td style="padding: 10px; color: #475569;">${item.threshold} units</td>
      </tr>
    `,
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; border: 1px solid #fecaca; background: #fffaf0; border-radius: 8px;">
      <h2 style="color: #dc2626; margin-top: 0;">⚠️ Low Stock Inventory Alert - SliceCraft</h2>
      <p>The automated inventory monitor detected that one or more ingredients have fallen below their safety threshold:</p>
      <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; margin: 20px 0;">
        <thead>
          <tr style="background-color: #fee2e2; text-align: left;">
            <th style="padding: 10px; color: #991b1b;">Item Name</th>
            <th style="padding: 10px; color: #991b1b;">Category</th>
            <th style="padding: 10px; color: #991b1b;">Current Stock</th>
            <th style="padding: 10px; color: #991b1b;">Threshold</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      <p style="color: #334155;">Please log into the Admin Dashboard immediately to replenish stock and prevent custom order disruptions.</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/admin/dashboard" style="background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Open Admin Inventory
        </a>
      </div>
      <p style="font-size: 11px; color: #94a3b8; text-align: center;">Automated notification generated by SliceCraft Node-Cron Sentinel.</p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `🚨 URGENT: Low Stock Alert (${lowStockItems.length} items below threshold)`,
    html,
    text: `Low stock alert: ${lowStockItems.map((i) => `${i.name} (${i.stock} left, threshold: ${i.threshold})`).join(", ")}`,
  });
};

const sendOrderConfirmationEmail = async (email, order) => {
  const itemsList = order.items
    .map(
      (item) => `
      <li style="margin-bottom: 8px;">
        <strong>${item.name}</strong> x ${item.quantity} - ₹${item.price * item.quantity}
      </li>
    `,
    )
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #16a34a; text-align: center;">Order Confirmed! 🍕🎉</h2>
      <p>Thank you for choosing SliceCraft. Your order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> has been successfully placed and is now in our kitchen.</p>
      
      <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h4 style="margin-top: 0; color: #334155;">Order Details:</h4>
        <ul style="padding-left: 20px; color: #475569;">
          ${itemsList}
        </ul>
        <p style="font-size: 16px; font-weight: bold; color: #0f172a; margin-bottom: 0;">Total Paid: ₹${order.totalAmount}</p>
      </div>

      <div style="text-align: center; margin: 25px 0;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Track Live Order Status
        </a>
      </div>
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Live tracking is powered by WebSockets / Socket.io.</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Order Confirmed #${order._id.toString().slice(-6).toUpperCase()} - SliceCraft Pizza`,
    html,
    text: `Your order #${order._id} for ₹${order.totalAmount} has been confirmed!`,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLowStockAlertEmail,
  sendOrderConfirmationEmail,
};
