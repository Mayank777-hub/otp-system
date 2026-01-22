const http = require("http");
const nodemailer = require("nodemailer");

const server = http.createServer((request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");


  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "POST" && request.url === "/sendotp") {
    let body = "";
    request.on("data", chunk => {
      body += chunk.toString();
    });

    request.on("end", () => {
      const data = JSON.parse(body);
      const { email, otp } = data;


      const auth = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        port: 587,
        auth: {
          user: "mmkumar0622@gmail.com",
          pass: "lyjsvqezjujgziis",
        },
        tls: {
          rejectUnauthorized: false // Disable
        }
      });
  

      const time = new Date();  // remenber we use new for date  and now for others
    const currenttime = time.toLocaleString("en-IN", {
      timeZone: "Asia/kolkata",
      hour12: true,
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",   // time related = "2-digit", related to weekdays and month = "short"
      hour: "2-digit",
      minute: "2-digit"
    });


    const receiver = {
      from: "mmkumar0622@gmail.com",
      to: email,
      subject: " Mangaverse user-device  Verification",
      Date: currenttime,
      html: `
         <p>Hey ${email} A sign in attenmpt  requires further verification . To complete the Sign in, enter the verification code on the unrecognized device.</p>
         <br>
         <p> Verification code : ${otp}</p>
         <p style="color:red;">Remember that the OTP will expire in 2 minutes.</p>`
    };


    auth.sendMail(receiver, (error, info) => {
      if (error) {
        console.log("Failed",error);
        response.writeHead(500, { "Content-Type": "text/plain" });
        response.end("Failed to send otp");
      }
      else {
        console.log(info.response)
        response.writeHead(200,{ "Content-Type": "text/plain" });
        response.end("otp send successfully!!!")
      }
    });
    }); 
  } else if (request.method === "GET" && request.url === "/") {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Backend is running on port 3030");
  }
    else {
      console.log("Not found");
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("Not found");
}
});
server.listen(3030, () => {
  console.log("No problem server run on 3030 port!!!")
});