const crypto = require("crypto");

function randomToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString("hex");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = { randomToken, sha256, randomOtp };
