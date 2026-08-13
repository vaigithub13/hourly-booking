export function generateVendorApprovalOrRejectionEmail({
  dashboardLink,
  isApproved,
  vendorName,
}: {
  vendorName: string;
  isApproved: boolean;
  dashboardLink: string;
}): string {
  const statusMessage = isApproved
    ? `Congratulations <strong>${vendorName}</strong>, your account has been approved!`
    : `Hello <strong>${vendorName}</strong>, we regret to inform you that your application has been rejected.`;

  const extraMessage = isApproved
    ? `You can now access your dashboard using the button below.`
    : `You may contact our support team for more information.`;

  const buttonHtml = isApproved
    ? `<a href="${dashboardLink}" class="button" target="_blank">Go to Dashboard</a>`
    : "";

  return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Vendor Application Status</title>
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
              color: ${isApproved ? "#28a745" : "#dc3545"};
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
            <h2>${isApproved ? "Approval" : "Rejection"} Notice</h2>
            <p>${statusMessage}</p>
            <p>${extraMessage}</p>
            ${buttonHtml}
            <div class="footer">
              <p>This is an automated message. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
}
