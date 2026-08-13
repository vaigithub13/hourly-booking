import { myDayjs } from "src/utils/dayjs/my-dayjs";

export const getOrderStatusUpdateHtmlContent = (data: {
  status: string;
  orderId: string;
}) => {
  const { status, orderId } = data;
  const currentYear = myDayjs().year();
  return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="background-color: rgb(192,157,76); color: #ffffff; padding: 20px; text-align: center; font-size: 24px; font-weight: bold;"> Order Status Updated </td>
              </tr>
              <tr>
                <td style="padding: 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                  <p>Dear Customer,</p>
                  <p>We are writing to inform you that the status of your order which its ID: ${orderId} has been updated to:</p>
                  <p style="text-align: center; font-size: 20px; font-weight: bold; color: rgb(192,157,76);"> ${status} </p>
                  <p>If you have any questions or need further assistance, please don't hesitate to contact us.</p>
                </td>
              </tr>
              <tr></tr>
              <tr>
                <td style="background-color: #f4f4f4; color: #777777; padding: 10px; text-align: center; font-size: 12px;"> © ${currentYear} APP QA. All rights reserved. </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
};
