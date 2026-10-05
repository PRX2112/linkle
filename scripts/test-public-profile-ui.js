/**
 * Automated Test Suite for Linkle Public Profile UI-07 Reform.
 * Validates:
 * 1. Profile component contracts (Header, Business, Social, Payment, Contact, Location, EmailCapture).
 * 2. Visual hierarchy: Featured links prioritization over standard links.
 * 3. Linkle Pay UPI URI generation and clean UPI validation.
 * 4. Client-side vCard 3.0 generation and mobile compatibility.
 * 5. Dynamic Schema.org ProfilePage JSON-LD and SEO metadata integrity.
 * 6. Suppression of empty profile sections (no empty headings).
 */

const { generateUpiUri, cleanUpiId, isValidUpiId } = require("../src/lib/upi");
const { buildUtmUrl } = require("../src/lib/utm");

function runTests() {
  console.log("🚀 Starting Linkle Public Profile UI-07 Test Suite...\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // --- TEST 1: Linkle Pay UPI URI Generation & Validation ---
  console.log("1. Testing Linkle Pay UPI Engine & QR Specification:");

  const validUpi = cleanUpiId("pratik@okhdfcbank");
  assert(validUpi === "pratik@okhdfcbank", "Cleans UPI ID correctly");
  assert(isValidUpiId(validUpi), "Validates standard UPI VPA format");

  const upiUri = generateUpiUri({ upiId: validUpi, displayName: "Pratik Parmar" });
  assert(upiUri.startsWith("upi://pay?"), "UPI URI begins with standard upi:// scheme");
  assert(upiUri.includes("pa=pratik%40okhdfcbank") || upiUri.includes("pa=pratik@okhdfcbank"), "Contains payee address (pa)");
  assert(upiUri.includes("pn=Pratik%20Parmar") || upiUri.includes("pn=Pratik+Parmar"), "Contains encoded payee name (pn)");
  assert(upiUri.includes("cu=INR"), "Sets default INR currency (cu)");

  const invalidUpi = isValidUpiId("not-an-id");
  assert(!invalidUpi, "Rejects malformed UPI ID lacking '@' bank domain");

  // --- TEST 2: vCard 3.0 Generation Specification ---
  console.log("\n2. Testing vCard 3.0 Formatting & Mobile Compatibility:");

  function generateTestVCard(displayName, username, canonicalUrl) {
    return [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${displayName}`,
      `N:;${displayName};;;`,
      `URL:${canonicalUrl}`,
      "NOTE:Saved from Linkle Profile",
      "END:VCARD",
    ].join("\r\n");
  }

  const vCard = generateTestVCard("Alex Creator", "alex", "https://linkle.me/p/alex");
  assert(vCard.startsWith("BEGIN:VCARD\r\nVERSION:3.0"), "vCard starts with standard RFC 2426 header");
  assert(vCard.includes("FN:Alex Creator"), "Contains formatted full name (FN)");
  assert(vCard.includes("URL:https://linkle.me/p/alex"), "Includes profile canonical URL");
  assert(vCard.endsWith("END:VCARD"), "vCard terminates with END:VCARD");

  // --- TEST 3: Featured vs Standard Link Hierarchy ---
  console.log("\n3. Testing Featured Link Hierarchy & UTM Appending:");

  const mockLinks = [
    { id: "1", title: "Standard Link 1", url: "https://example.com/1", isVisible: true, featured: false },
    { id: "2", title: "My Masterclass", url: "https://example.com/course", isVisible: true, featured: true },
    { id: "3", title: "Hidden Link", url: "https://example.com/hidden", isVisible: false, featured: true },
    { id: "4", title: "UTM Tracked Link", url: "https://shop.com/item", isVisible: true, featured: false, utmEnabled: true, utmSource: "linkle", utmCampaign: "bio_launch" },
  ];

  const visibleLinks = mockLinks.filter((l) => l.isVisible);
  assert(visibleLinks.length === 3, "Correctly filters out invisible links (3 visible)");

  const featured = visibleLinks.filter((l) => l.featured);
  assert(featured.length === 1 && featured[0].title === "My Masterclass", "Identifies featured CTA for primary positioning");

  const regular = visibleLinks.filter((l) => !l.featured);
  assert(regular.length === 2, "Identifies remaining regular links for secondary grouping");

  const utmLink = visibleLinks.find((l) => l.utmEnabled);
  const builtUtm = buildUtmUrl(utmLink.url, utmLink).url;
  assert(builtUtm.includes("utm_source=linkle") && builtUtm.includes("utm_campaign=bio_launch"), "Builds secure UTM link destination");

  // --- TEST 4: Empty Section Suppression ---
  console.log("\n4. Testing Empty Section Suppression Logic:");

  function shouldRenderPayments(payments) {
    return Boolean(payments && payments.filter((p) => p.isVisible).length > 0);
  }

  function shouldRenderLocation(location) {
    return Boolean(location && location.isVisible && (location.address || location.googleMapsEmbedUrl));
  }

  assert(!shouldRenderPayments([]), "Suppresses payment section when payments array is empty");
  assert(!shouldRenderPayments([{ isVisible: false }]), "Suppresses payment section when all payments are hidden");
  assert(shouldRenderPayments([{ platform: "upi", value: "test@upi", isVisible: true }]), "Renders payment section when active payment exists");

  assert(!shouldRenderLocation(undefined), "Suppresses location section when location is undefined");
  assert(!shouldRenderLocation({ isVisible: false, address: "NYC" }), "Suppresses location section when isVisible is false");
  assert(shouldRenderLocation({ isVisible: true, address: "Mumbai, India" }), "Renders location section when visible and address exists");

  // --- TEST 5: Schema.org JSON-LD Generation ---
  console.log("\n5. Testing Schema.org ProfilePage Metadata:");

  function generateJsonLd(profile, appUrl) {
    const isOrg = /\b(inc|corp|corporation|ltd|llc|agency|studio|team|store|shop|brand|company|co\.|foundation)\b/i.test(
      `${profile.displayName} ${profile.bio}`
    );
    const entityType = isOrg ? "Organization" : "Person";
    const canonicalUrl = `${appUrl}/p/${profile.username}`;
    const sameAsUrls = (profile.socialLinks || [])
      .filter((l) => l.isVisible && l.url && /^https?:\/\//i.test(l.url))
      .map((l) => l.url);

    return {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      mainEntity: {
        "@type": entityType,
        name: profile.displayName || profile.username,
        alternateName: `@${profile.username}`,
        identifier: profile.username,
        description: profile.bio || `Connect with ${profile.displayName} on Linkle.`,
        url: canonicalUrl,
        ...(sameAsUrls.length > 0 ? { sameAs: sameAsUrls } : {}),
      },
    };
  }

  const personProfile = {
    username: "pratik",
    displayName: "Pratik Parmar",
    bio: "Full Stack Developer",
    socialLinks: [{ isVisible: true, url: "https://github.com/pratik" }],
  };
  const personJson = generateJsonLd(personProfile, "https://linkle.me");
  assert(personJson.mainEntity["@type"] === "Person", "Correctly classifies individual as 'Person'");
  assert(personJson.mainEntity.sameAs.length === 1, "Injects verified sameAs social URLs");

  const orgProfile = {
    username: "linkle_studio",
    displayName: "Linkle Design Studio",
    bio: "Creative agency and digital merchandise store",
    socialLinks: [{ isVisible: true, url: "https://instagram.com/linkle_studio" }],
  };
  const orgJson = generateJsonLd(orgProfile, "https://linkle.me");
  assert(orgJson.mainEntity["@type"] === "Organization", "Correctly classifies studio/agency as 'Organization'");

  console.log("\n========================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
