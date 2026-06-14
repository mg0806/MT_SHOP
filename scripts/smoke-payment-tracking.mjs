import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = new Set(process.argv.slice(2));
const getArgValue = (name) => {
  const prefix = `${name}=`;
  const match = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
};

const loadEnvFile = () => {
  const envPath = resolve(process.cwd(), ".env");

  try {
    const envFile = readFileSync(envPath, "utf8");

    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^["']|["']$/g, "");

      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    console.warn("No .env file found. Falling back to process environment.");
  }
};

const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const mask = (value) => {
  if (!value) return "missing";
  if (value.length <= 8) return "set";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
};

const authHeader = (username, password) => {
  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
};

const createRazorpayOrder = async () => {
  const keyId = requireEnv("RAZORPAY_KEY_ID");
  const secret = requireEnv("RAZORPAY_SECRET");
  const amount = Number(getArgValue("--amount-paise") || process.env.SMOKE_RAZORPAY_AMOUNT_PAISE || 100);

  if (!keyId.startsWith("rzp_test_") && process.env.ALLOW_LIVE_RAZORPAY_SMOKE !== "1") {
    console.log("Razorpay: skipped because key is not a test key. Set ALLOW_LIVE_RAZORPAY_SMOKE=1 to create a live order object.");
    return;
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader(keyId, secret),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "INR",
      receipt: `smoke_${Date.now()}`,
      notes: {
        purpose: "MandlaStore smoke test",
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Razorpay order creation failed: ${JSON.stringify(data)}`);
  }

  console.log(`Razorpay: created order ${data.id} for ${data.amount} paise (${data.status}).`);
};

const getShiprocketToken = async () => {
  const email = requireEnv("SHIPROCKET_EMAIL");
  const password = requireEnv("SHIPROCKET_PASSWORD");

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok || !data.token) {
    throw new Error(`Shiprocket auth failed: ${JSON.stringify(data)}`);
  }

  return data.token;
};

const verifyShiprocketAuth = async () => {
  await getShiprocketToken();
  console.log("Shiprocket: authentication succeeded.");
};

const trackAwb = async () => {
  const awb = getArgValue("--awb") || process.env.TEST_SHIPROCKET_AWB;
  if (!awb) {
    console.log("Shiprocket tracking: skipped. Pass --awb=YOUR_AWB or set TEST_SHIPROCKET_AWB in .env.");
    return;
  }

  const token = await getShiprocketToken();
  const response = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(awb)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Shiprocket AWB tracking failed: ${JSON.stringify(data)}`);
  }

  const shipmentTrack = data?.tracking_data?.shipment_track;
  const shipment = Array.isArray(shipmentTrack) ? shipmentTrack[0] : shipmentTrack;
  const status = shipment?.current_status || "unknown";
  const courier = shipment?.courier_name || "unknown courier";

  console.log(`Shiprocket tracking: AWB ${awb} is ${status} via ${courier}.`);
};

const main = async () => {
  loadEnvFile();

  console.log("Smoke environment:");
  console.log(`- RAZORPAY_KEY_ID: ${mask(process.env.RAZORPAY_KEY_ID)}`);
  console.log(`- SHIPROCKET_EMAIL: ${mask(process.env.SHIPROCKET_EMAIL)}`);

  const runAll = args.size === 0 || args.has("--all");

  if (runAll || args.has("--razorpay")) {
    await createRazorpayOrder();
  }

  if (runAll || args.has("--shiprocket-auth")) {
    await verifyShiprocketAuth();
  }

  if (runAll || args.has("--track-awb") || getArgValue("--awb")) {
    await trackAwb();
  }

  console.log("Smoke test complete.");
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
