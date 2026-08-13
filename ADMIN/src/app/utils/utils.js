import { alpha } from "@mui/material";
import { format, getTime, formatDistanceToNow, differenceInSeconds } from "date-fns";

export const convertHexToRGB = (hex) => {
  // check if it's a rgba
  if (hex.match("rgba")) {
    let triplet = hex.slice(5).split(",").slice(0, -1).join(",");
    return triplet;
  }

  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");

    return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",");
  }
};

function currentYPosition(elm) {
  if (!window && !elm) return;

  if (elm) return elm.scrollTop;
  // Firefox, Chrome, Opera, Safari
  if (window.pageYOffset) return window.pageYOffset;
  // Internet Explorer 6 - standards mode
  if (document.documentElement && document.documentElement.scrollTop)
    return document.documentElement.scrollTop;
  // Internet Explorer 6, 7 and 8
  if (document.body.scrollTop) return document.body.scrollTop;
  return 0;
}

function elmYPosition(elm) {
  var y = elm.offsetTop;
  var node = elm;
  while (node.offsetParent && node.offsetParent !== document.body) {
    node = node.offsetParent;
    y += node.offsetTop;
  }
  return y;
}

export function scrollTo(scrollableElement, elmID) {
  var elm = document.getElementById(elmID);

  if (!elmID || !elm) {
    return;
  }

  var startY = currentYPosition(scrollableElement);
  var stopY = elmYPosition(elm);

  var distance = stopY > startY ? stopY - startY : startY - stopY;
  if (distance < 100) {
    scrollTo(0, stopY);
    return;
  }
  var speed = Math.round(distance / 50);
  if (speed >= 20) speed = 20;
  var step = Math.round(distance / 25);
  var leapY = stopY > startY ? startY + step : startY - step;
  var timer = 0;
  if (stopY > startY) {
    for (var i = startY; i < stopY; i += step) {
      setTimeout(
        (function (leapY) {
          return () => {
            scrollableElement.scrollTo(0, leapY);
          };
        })(leapY),
        timer * speed
      );
      leapY += step;
      if (leapY > stopY) leapY = stopY;
      timer++;
    }
    return;
  }
  for (let i = startY; i > stopY; i -= step) {
    setTimeout(
      (function (leapY) {
        return () => {
          scrollableElement.scrollTo(0, leapY);
        };
      })(leapY),
      timer * speed
    );
    leapY -= step;
    if (leapY < stopY) leapY = stopY;
    timer++;
  }
  return false;
}

export function getTimeDifference(date) {
  let difference = differenceInSeconds(new Date(), date);

  if (difference < 60) return `${Math.floor(difference)} sec`;
  else if (difference < 3600) return `${Math.floor(difference / 60)} min`;
  else if (difference < 86400) return `${Math.floor(difference / 3660)} h`;
  else if (difference < 86400 * 30) return `${Math.floor(difference / 86400)} d`;
  else if (difference < 86400 * 30 * 12) return `${Math.floor(difference / 86400 / 30)} mon`;
  else return `${(difference / 86400 / 30 / 12).toFixed(1)} y`;
}

export function fData(inputValue) {
  if (!inputValue) return "";

  if (inputValue === 0) return "0 Bytes";

  const units = ["bytes", "Kb", "Mb", "Gb", "Tb", "Pb", "Eb", "Zb", "Yb"];

  const decimal = 2;

  const baseValue = 1024;

  const number = Number(inputValue);

  const index = Math.floor(Math.log(number) / Math.log(baseValue));

  const fm = `${parseFloat((number / baseValue ** index).toFixed(decimal))} ${units[index]}`;

  return fm;
}

export function fDate(date, newFormat) {
  const fm = newFormat || "dd MMM yyyy";

  return date ? format(new Date(date), fm) : "";
}

export function fTime(date, newFormat) {
  const fm = newFormat || "hh:mm a"; // Default format with AM/PM

  // Format the date using the user's local time zone (no need to pass time zone)
  return date ? format(new Date(date), fm) : "";
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || "dd MMM yyyy hh:mm a"; // Default format with AM/PM

  // Format the date using the user's local time zone (no need to pass time zone)
  return date ? format(new Date(date), fm) : "";
}

export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true
      })
    : "";
}

export function isBetween(inputDate, startDate, endDate) {
  const date = new Date(inputDate);

  const results =
    new Date(date.toDateString()) >= new Date(startDate.toDateString()) &&
    new Date(date.toDateString()) <= new Date(endDate.toDateString());

  return results;
}

export function isAfter(startDate, endDate) {
  const results =
    startDate && endDate ? new Date(startDate).getTime() > new Date(endDate).getTime() : false;

  return results;
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ${remainingMinutes} minute${
      remainingMinutes > 1 ? "s" : ""
    }`;
  }

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  return `${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}`;
};

export function bgGradient(props) {
  const direction = props?.direction || "to bottom";
  const startColor = props?.startColor;
  const endColor = props?.endColor;
  const imgUrl = props?.imgUrl;
  const color = props?.color;

  if (imgUrl) {
    return {
      background: `linear-gradient(${direction}, ${startColor || color}, ${
        endColor || color
      }), url(${imgUrl})`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center center"
    };
  }

  return {
    background: `linear-gradient(${direction}, ${startColor}, ${endColor})`
  };
}

export default async function getCroppedImg(imageSrc, crop) {
  const createImage = (url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous"); // needed to avoid CORS issues
      image.src = url;
    });

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas dimensions to match the crop area
  canvas.width = crop.width;
  canvas.height = crop.height;

  // Draw the cropped image
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(URL.createObjectURL(blob));
    }, "image/jpeg");
  });
}

export const getFileFromBlobUrl = async (blobUrl) => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();

  const file = new File([blob], "cropped-image.jpg", { type: blob.type });
  file.preview = blobUrl;

  // Create a new File object with the blob
  return file;
};

export const isValidDate = (date) => {
  return !isNaN(new Date(date).getTime());
};

export function bgBlur(props) {
  const color = props?.color || "#000000";
  const blur = props?.blur || 6;
  const opacity = props?.opacity || 0.8;
  const imgUrl = props?.imgUrl;

  if (imgUrl) {
    return {
      position: "relative",
      backgroundImage: `url(${imgUrl})`,
      "&:before": {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 9,
        content: '""',
        width: "100%",
        height: "100%",
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: alpha(color, opacity)
      }
    };
  }

  return {
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    backgroundColor: alpha(color, opacity)
  };
}

export const statusColorMap = {
  Placed: "default",
  Confirmed: "secondary",
  "Out For Delivery": "info",
  "Ready To Ship": "primary",
  Delivered: "success",
  Returned: "warning",
  Cancelled: "error"
};

export const ReturnStatusColorMap = {
  Pending: "default",
  Rejected: "error",
  PickUp: "info",
  Complete: "success",
  Approved: "secondary",
  PendingAdmin: "primary",
  OnTheWay: "warning"
};

export const ReturnStatusApi = {
  Approved: "approve",
  Rejected: "reject",
  PickUp: "pick-up",
  Complete: "complete"
};

export const RequestStatusMap = {
  Pending: "default",
  Wallet: "success",
  "Original Payment Method": "info"
};

export const ReturnStatusMap = {
  Pending: "Pending Designer Approval",
  PendingAdmin: "Pending Admin Approval",
  Approved: "Waiting customer to book Driver",
  Rejected: "Rejected by the admin",
  PickUp: "Driver Requested by Customer",
  OnTheWay: "Driver is on the way for PickUp",
  Complete: "Order Returned to Designer"
};
