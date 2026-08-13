export const EmailDescriptions = {
  OrderConfirmation: `Thanks for your order! We’ll get it to your doorstep as soon as possible! You'll get a shipping notification once your order has left our shop and is on the way to you!`,
};

export function generateVendorOrderEmail({
  orderId,
  orderLink,
  userName,
}: {
  orderId: string;
  orderLink: string;
  userName: string;
}): string {
  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>New Order Notification</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              background-color: #ffffff;
              margin: 30px auto;
              padding: 20px;
              border-radius: 10px;
              max-width: 600px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            h2 {
              color: #333333;
            }
            p {
              color: #555555;
            }
            .button {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 24px;
              background-color: #b3934f;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #999999;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>New Order Received</h2>
            <p>Hello Vendor,</p>
            <p><strong>${userName}</strong> has placed a new order with the ID <strong>${orderId}</strong>.</p>
            <p>You can view the order details by clicking the button below:</p>
            <a href="${orderLink}" class="button" target="_blank">View Order</a>
            <div class="footer">
              <p>This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
}
