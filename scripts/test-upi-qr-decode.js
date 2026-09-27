const QRCode = require("qrcode");
const jsQR = require("jsqr");

// Inlined logic matching src/lib/upi.ts for standalone verification
const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9]{2,64}$/;

function cleanUpiId(raw) {
  if (!raw) return "";
  let cleaned = raw.trim();
  if (cleaned.toLowerCase().startsWith("upi://pay?pa=")) {
    const match = cleaned.match(/pa=([^&]+)/);
    if (match && match[1]) {
      cleaned = decodeURIComponent(match[1]);
    }
  }
  return cleaned;
}

function isValidUpiId(upiId) {
  if (!upiId || typeof upiId !== "string") return false;
  return UPI_ID_REGEX.test(cleanUpiId(upiId));
}

function generateUpiUri({ upiId, displayName }) {
  const cleanId = cleanUpiId(upiId);
  if (!cleanId) return "";
  const name = (displayName && displayName.trim().length > 0) ? displayName.trim() : "Creator";
  const encodedName = encodeURIComponent(name);
  return `upi://pay?pa=${cleanId}&pn=${encodedName}&cu=INR`;
}

async function verifyUpiQrDecode() {
  console.log("=== STEP 1: VALIDATION CHECKS ===");
  const testCases = [
    { id: "alexcreator@okhdfcbank", valid: true },
    { id: "pratikparmar@paytm", valid: true },
    { id: "store.official@icici", valid: true },
    { id: "user_name-123@oksbi", valid: true },
    { id: "invalid-vpa-without-at", valid: false },
    { id: "@nohandle", valid: false },
    { id: "handle@", valid: false },
  ];

  for (const tc of testCases) {
    const result = isValidUpiId(tc.id);
    console.log(`Validation for "${tc.id}": ${result === tc.valid ? "PASSED" : "FAILED"}`);
    if (result !== tc.valid) {
      throw new Error(`Validation check failed for ${tc.id}`);
    }
  }

  console.log("\n=== STEP 2: URI GENERATION ===");
  const testUpi = "alexcreator@okhdfcbank";
  const testName = "Alex Creator & Co.";
  const expectedUri = `upi://pay?pa=${testUpi}&pn=${encodeURIComponent(testName)}&cu=INR`;
  const generatedUri = generateUpiUri({ upiId: testUpi, displayName: testName });

  console.log("Generated URI:", generatedUri);
  console.log("Expected URI: ", expectedUri);
  if (generatedUri !== expectedUri) {
    throw new Error(`URI mismatch!\nExpected: ${expectedUri}\nGot: ${generatedUri}`);
  }

  console.log("\n=== STEP 3: QR ENCODING & DECODING ===");
  // Generate QR matrix using QRCode library
  const qr = QRCode.create(generatedUri, { errorCorrectionLevel: "H" });
  const size = qr.modules.size;
  const scale = 4; // 4px per QR module
  const width = size * scale;
  const height = size * scale;

  // Build RGBA buffer
  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isDark = qr.modules.get(r, c);
      const color = isDark ? 0 : 255;
      for (let y = 0; y < scale; y++) {
        for (let x = 0; x < scale; x++) {
          const px = (r * scale + y) * width + (c * scale + x);
          rgba[px * 4 + 0] = color;
          rgba[px * 4 + 1] = color;
          rgba[px * 4 + 2] = color;
          rgba[px * 4 + 3] = 255;
        }
      }
    }
  }

  // Decode with jsQR
  const decoded = jsQR(rgba, width, height);

  if (!decoded) {
    throw new Error("jsQR failed to decode the generated QR code!");
  }

  console.log("Decoded QR payload:", decoded.data);

  if (decoded.data !== generatedUri) {
    throw new Error(
      `Decoded payload mismatch!\nExpected: ${generatedUri}\nGot: ${decoded.data}`
    );
  }

  console.log("\nSUCCESS: The generated QR code accurately decodes to the exact dynamic UPI URI!");
  console.log("Verified URI:", decoded.data);
}

verifyUpiQrDecode()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Verification failed:", err);
    process.exit(1);
  });
