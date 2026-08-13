export function generateNewVendorRegistrationNotificationEmail({
  dashboardLink,
  vendorName,
}: {
  vendorName: string;
  dashboardLink: string;
}): string {
  return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>New Vendor Registration</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
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
            font-size: 16px;
          }
          .highlight {
            font-weight: bold;
            color: #b3934f;
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
          <h2>New Vendor Registration</h2>
          <p>A new vendor named <span class="highlight">${vendorName}</span> has just registered and is awaiting approval.</p>
          <p>Please review and take action from the admin dashboard.</p>
          <a href="${dashboardLink}" class="button" target="_blank">Go to Admin Dashboard</a>
          <div class="footer">
            <p>This is an automated notification. Please follow up as needed.</p>
          </div>
        </div>
      </body>
    </html>`;
}
