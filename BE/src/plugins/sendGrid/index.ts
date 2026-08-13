import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import sgMail from "@sendgrid/mail";
import { getOtpHtmlContent } from "./templates/otp-template";
import {
  IDynamicTemplateConfirmOrderEmailData,
  ISendVendorOrderNotificationEmail,
  ISgMessage,
} from "./templates/interfaces";
import { getOrderStatusUpdateHtmlContent } from "./templates/order-status-update-template";
import { subscribe } from "diagnostics_channel";
import { generateVendorNotificationEmail } from "./templates/vendor-notification-orders";
import { Order } from "src/modules/order/order.model";

const sendGridPlugin = async (instance: FastifyInstance) => {
  instance.decorate(
    "sendCustomEmail",
    async (data: {
      emailAddress: string;
      htmlTemplate: string;
      subject: string;
    }) => {
      const { emailAddress, htmlTemplate, subject } = data;
      const msg: ISgMessage = {
        to: emailAddress,
        from: instance.configs.sendGrid.sender,
        subject: subject,
        html: htmlTemplate,
      };
      sgMail.setApiKey(instance.configs.sendGrid.apiKey);
      try {
        await sgMail.send(msg);
        return;
      } catch (error) {
        console.log({ error: "happened error while sending" });
        console.error(error);
        return;
      }
    }
  );

  instance.decorate("sendOtpEmail", async (email: string, otp: string) => {
    // email in html format as a string
    const msg: ISgMessage = {
      to: email,
      from: instance.configs.sendGrid.sender,
      subject: "OTP Code",
      html: getOtpHtmlContent(otp, instance.configs.otp.validUntil, email),
    };
    sgMail.setApiKey(instance.configs.sendGrid.apiKey);
    try {
      await sgMail.send(msg);
      return;
    } catch (error) {
      return;
    }
  });

  instance.decorate(
    "sendUpdateOrderStatusEmail",
    async ({
      email,
      status,
      orderId,
    }: {
      email: string;
      status: string;
      orderId: string;
    }) => {
      // email in html format as a string
      const msg: ISgMessage = {
        to: email,
        from: instance.configs.sendGrid.sender,
        subject: "Order Status Update",
        html: getOrderStatusUpdateHtmlContent({ orderId, status }),
      };
      sgMail.setApiKey(instance.configs.sendGrid.apiKey);
      try {
        await sgMail.send(msg);
        return;
      } catch (error) {
        return;
      }
    }
  );

  instance.decorate(
    "sendEmailUsingTemplate",
    async (emailData: IDynamicTemplateConfirmOrderEmailData) => {
      // Calculating the total price of the order
      const { subtotal, shippingCost } = emailData.dynamicTemplateData;
      emailData.dynamicTemplateData.total = subtotal + shippingCost;

      const msg = {
        to: emailData.to,
        from: emailData.from,
        subject: emailData.subject,
        templateId: emailData.templateId,
        dynamicTemplateData: emailData.dynamicTemplateData,
        cc: emailData.cc,
      };

      sgMail.setApiKey(instance.configs.sendGrid.apiKey);
      try {
        await sgMail.send(msg);
        return true;
      } catch (error: any) {
        console.error({
          ...error.response.body.errors,
        });
        return false;
      }
    }
  );

  instance.decorate(
    "sendCancelOrReturnOrderVendorEmail",
    async (emailData: ISendVendorOrderNotificationEmail) => {
      const { from, orderId, subject, to, userName, action } = emailData;
      const msg = {
        to,
        from,
        subject,
        html: generateVendorNotificationEmail(userName, `${orderId}`, action),
      };

      sgMail.setApiKey(instance.configs.sendGrid.apiKey);
      try {
        await sgMail.send(msg);
        return true;
      } catch (error: any) {
        console.error({
          ...error.response.body.errors,
        });
        return false;
      }
    }
  );
};

export default fp(sendGridPlugin, {
  name: "sendGridPlugin",
});
