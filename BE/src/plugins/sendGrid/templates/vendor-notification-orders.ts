export const generateVendorNotificationEmail = (
  userName: string,
  orderId: string,
  action: "cancelled" | "returned"
) => {
  const actionCapitalized = action.charAt(0).toUpperCase() + action.slice(1);
  const color = action === "cancelled" ? "#e74c3c" : "#f1c40f";

  return `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: ${color};">${actionCapitalized} Order Notification</h2>
          <p style="font-size: 16px; color: #333333;">
            Hello,
          </p>
          <p style="font-size: 16px; color: #333333;">
            This is to inform you that <strong>${userName}</strong> has <strong>${action}</strong> an order.
          </p>
          <p style="font-size: 16px; color: #333333;">
            <strong>Order ID:</strong> ${orderId}
          </p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eeeeee;">
          <p style="font-size: 14px; color: #888888;">
            Please check your dashboard for more details or contact support if needed.
          </p>
        </div>
      </div>
    `;
};
