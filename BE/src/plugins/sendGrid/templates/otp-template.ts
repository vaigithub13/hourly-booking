// make sure to change this place holder to the real app name
const organizationName = "APP";

export const getOtpHtmlContent = (
  otpCode: string,
  otpValid: number,
  email: string
) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Your OTP Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            border:1px solid #C4C4C4
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        h1 {
            font-size: 36px;
            color: #333;
        }

        p {
            font-size: 16px;
            color: #555;
        }

        strong {
            color: #007BFF;
        }

        .footer {
            margin-top: 20px;
            text-align: center;
            color: #888;
        }
    </style>
</head>
<body>
    <div class="container">
        <h3>Your OTP Code</h3>
        
        <p>Hello,${email}</p>
        
        <p>Your OTP code  is:</p>
        
        <h3>${otpCode}</h3>
        
        <p>This code is valid for the next ${otpValid} minutes.</p>
        
        <p>If you did not request this OTP or have any concerns, please contact our support team immediately.</p>
        
        <p class="footer">Thank you for using our services!<br>${organizationName}</p>
    </div>
</body>
</html>
`;
};
