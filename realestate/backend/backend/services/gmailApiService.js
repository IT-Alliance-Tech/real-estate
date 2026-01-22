const https = require("https");
require("dotenv").config();

/**
 * Sends an email using the Gmail REST API.
 * This is more robust than SMTP when using OAuth2 with restricted scopes.
 */
class GmailApiService {
  constructor() {
    this.clientId = process.env.GMAIL_CLIENT_ID;
    this.clientSecret = process.env.GMAIL_CLIENT_SECRET;
    this.refreshToken = process.env.GMAIL_REFRESH_TOKEN;
    this.user = process.env.GMAIL_USER;
    this.accessToken = null;
  }

  async getNewAccessToken() {
    return new Promise((resolve, reject) => {
      const data = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: this.refreshToken,
        grant_type: "refresh_token",
      }).toString();

      const options = {
        hostname: "oauth2.googleapis.com",
        port: 443,
        path: "/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(data),
        },
      };

      const req = https.request(options, (res) => {
        let body = "";
        res.on("data", (d) => (body += d));
        res.on("end", () => {
          const parsed = JSON.parse(body);
          if (parsed.access_token) {
            this.accessToken = parsed.access_token;
            resolve(this.accessToken);
          } else {
            reject(new Error("Failed to refresh access token: " + body));
          }
        });
      });

      req.on("error", reject);
      req.write(data);
      req.end();
    });
  }

  async sendMail({ to, subject, text, html, fromName }) {
    if (!this.accessToken) {
      await this.getNewAccessToken();
    }

    const from = fromName ? `${fromName} <${this.user}>` : this.user;

    // Construct the email in RFC 822 format
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString("base64")}?=`;
    const emailLines = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${utf8Subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: multipart/alternative; boundary="boundary-example"`,
      "",
      "--boundary-example",
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      Buffer.from(text).toString("base64"),
      "",
      "--boundary-example",
      'Content-Type: text/html; charset="UTF-8"',
      "Content-Transfer-Encoding: base64",
      "",
      Buffer.from(html).toString("base64"),
      "",
      "--boundary-example--",
    ];

    const rawEmail = Buffer.from(emailLines.join("\r\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    return new Promise((resolve, reject) => {
      const data = JSON.stringify({ raw: rawEmail });

      const options = {
        hostname: "gmail.googleapis.com",
        port: 443,
        path: `/gmail/v1/users/${this.user}/messages/send`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      };

      const req = https.request(options, (res) => {
        let body = "";
        res.on("data", (d) => (body += d));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(body));
          } else if (res.statusCode === 401) {
            // Token might be expired, try once more
            this.accessToken = null;
            this.sendMail({ to, subject, text, html, fromName })
              .then(resolve)
              .catch(reject);
          } else {
            reject(new Error(`Gmail API error (${res.statusCode}): ${body}`));
          }
        });
      });

      req.on("error", reject);
      req.write(data);
      req.end();
    });
  }
}

module.exports = new GmailApiService();
