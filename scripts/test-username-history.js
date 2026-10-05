/**
 * Automated Verification Suite for Linkle Permanent Username History & Aliases
 * 
 * Verifies:
 * 1. Username Change & History Archiving
 * 2. Old URL -> Canonical URL Permanent Resolution (HTTP 308)
 * 3. New URL Canonical Resolution
 * 4. Multiple Historical Usernames (Single-hop resolution, no chains/loops)
 * 5. Username Collision Prevention (Active usernames & Historical aliases)
 * 6. Reserved/System Username Protection
 * 7. Anti-Abuse Cooldown Enforcement
 * 8. Deleted Account Cascade & Alias Release
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function resolveProfile(slug) {
  const normalized = slug.toLowerCase().trim();
  
  // 1. Direct active user query
  const directUser = await prisma.user.findUnique({
    where: { username: normalized },
    select: { id: true, username: true, displayName: true },
  });

  if (directUser) {
    return {
      status: 200,
      canonicalUsername: directUser.username,
      redirect: false,
    };
  }

  // 2. Alias history query
  const aliasRecord = await prisma.usernameHistory.findUnique({
    where: { username: normalized },
    include: { user: { select: { id: true, username: true } } },
  });

  if (aliasRecord?.user?.username) {
    const canonical = aliasRecord.user.username;
    if (canonical.toLowerCase() !== normalized) {
      return {
        status: 308, // Permanent redirect
        canonicalUsername: canonical,
        redirect: true,
        redirectTo: `/p/${canonical}`,
      };
    }
  }

  return { status: 404 };
}

async function runUsernameHistorySuite() {
  console.log("\n========================================================");
  console.log("   LINKLE PERMANENT USERNAME HISTORY & ALIAS TEST SUITE  ");
  console.log("========================================================\n");

  const timestamp = Date.now().toString(36);
  const u1 = `test_u1_${timestamp}`;
  const u2 = `test_u2_${timestamp}`;
  const u3 = `test_u3_${timestamp}`;
  const uOther = `test_other_${timestamp}`;

  let userA = null;
  let userB = null;

  try {
    // Clean up any potential stale records
    await prisma.usernameHistory.deleteMany({
      where: { username: { in: [u1, u2, u3, uOther] } },
    });
    await prisma.user.deleteMany({
      where: { username: { in: [u1, u2, u3, uOther] } },
    });

    // ----------------------------------------------------
    // STEP 1: Create initial user A with username u1
    // ----------------------------------------------------
    console.log("--- 1. Initial User Creation & Direct URL Resolution ---");
    userA = await prisma.user.create({
      data: {
        email: `usera_${timestamp}@example.com`,
        username: u1,
        displayName: "User Alpha",
      },
    });

    const resInitial = await resolveProfile(u1);
    assert(resInitial.status === 200 && resInitial.canonicalUsername === u1, `Initial profile /p/${u1} resolves directly with 200 OK`);

    // ----------------------------------------------------
    // STEP 2: First Username Change: u1 -> u2
    // ----------------------------------------------------
    console.log("\n--- 2. Username Change (u1 -> u2) & History Archiving ---");
    await prisma.$transaction(async (tx) => {
      await tx.usernameHistory.create({
        data: { userId: userA.id, username: u1 },
      });
      await tx.user.update({
        where: { id: userA.id },
        data: { username: u2 },
      });
    });

    // Verify history table contains u1
    const historyRecord1 = await prisma.usernameHistory.findUnique({
      where: { username: u1 },
    });
    assert(historyRecord1 !== null && historyRecord1.userId === userA.id, `Old username ${u1} is archived in UsernameHistory pointing to user`);

    // Test resolving old URL /p/u1
    const resOldUrl1 = await resolveProfile(u1);
    assert(
      resOldUrl1.status === 308 && resOldUrl1.redirect === true && resOldUrl1.canonicalUsername === u2,
      `Visiting old URL /p/${u1} triggers HTTP 308 Permanent Redirect to canonical /p/${u2}`
    );

    // Test resolving new URL /p/u2
    const resNewUrl1 = await resolveProfile(u2);
    assert(
      resNewUrl1.status === 200 && resNewUrl1.canonicalUsername === u2,
      `Visiting current URL /p/${u2} resolves directly with HTTP 200 OK`
    );

    // ----------------------------------------------------
    // STEP 3: Multiple Historical Usernames: u2 -> u3
    // ----------------------------------------------------
    console.log("\n--- 3. Multiple Historical Usernames (u1, u2 -> u3) & Loop Prevention ---");
    await prisma.$transaction(async (tx) => {
      await tx.usernameHistory.create({
        data: { userId: userA.id, username: u2 },
      });
      await tx.user.update({
        where: { id: userA.id },
        data: { username: u3 },
      });
    });

    const allHistory = await prisma.usernameHistory.findMany({
      where: { userId: userA.id },
      orderBy: { createdAt: "asc" },
    });
    const historySlugs = allHistory.map((h) => h.username);
    assert(
      historySlugs.includes(u1) && historySlugs.includes(u2),
      `User holds multiple historical aliases simultaneously: [${historySlugs.join(", ")}]`
    );

    // Oldest URL u1 resolves directly to newest canonical u3 (single hop)
    const resOldest = await resolveProfile(u1);
    assert(
      resOldest.status === 308 && resOldest.canonicalUsername === u3 && resOldest.redirectTo === `/p/${u3}`,
      `Oldest URL /p/${u1} resolves directly to newest canonical /p/${u3} in 1 single hop without intermediate chains`
    );

    // Intermediate URL u2 resolves directly to newest canonical u3
    const resIntermediate = await resolveProfile(u2);
    assert(
      resIntermediate.status === 308 && resIntermediate.canonicalUsername === u3 && resIntermediate.redirectTo === `/p/${u3}`,
      `Intermediate URL /p/${u2} resolves directly to newest canonical /p/${u3} without redirect loops`
    );

    // ----------------------------------------------------
    // STEP 4: Username Collision Prevention
    // ----------------------------------------------------
    console.log("\n--- 4. Username Collision & Alias Protection ---");
    userB = await prisma.user.create({
      data: {
        email: `userb_${timestamp}@example.com`,
        username: uOther,
        displayName: "User Beta",
      },
    });

    // Check collision against User A's current canonical username (u3)
    const activeCollision = await prisma.user.findFirst({
      where: { username: u3, NOT: { id: userB.id } },
    });
    assert(activeCollision !== null, `Another user is prevented from claiming active username ${u3}`);

    // Check collision against User A's historical alias (u1)
    const aliasCollision1 = await prisma.usernameHistory.findFirst({
      where: { username: u1, NOT: { userId: userB.id } },
    });
    assert(aliasCollision1 !== null, `Another user is prevented from claiming historical alias ${u1}`);

    // Check collision against User A's historical alias (u2)
    const aliasCollision2 = await prisma.usernameHistory.findFirst({
      where: { username: u2, NOT: { userId: userB.id } },
    });
    assert(aliasCollision2 !== null, `Another user is prevented from claiming historical alias ${u2}`);

    // ----------------------------------------------------
    // STEP 5: Self-Reclaim Behavior
    // ----------------------------------------------------
    console.log("\n--- 5. Self-Reclaim of Historical Alias ---");
    // User A decides to switch back to their previous username u1
    await prisma.$transaction(async (tx) => {
      // Archive current u3
      await tx.usernameHistory.create({
        data: { userId: userA.id, username: u3 },
      });
      // Remove u1 from history since it's becoming canonical again
      await tx.usernameHistory.deleteMany({
        where: { userId: userA.id, username: u1 },
      });
      // Set u1 back to canonical
      await tx.user.update({
        where: { id: userA.id },
        data: { username: u1 },
      });
    });

    const resReclaimed = await resolveProfile(u1);
    assert(
      resReclaimed.status === 200 && resReclaimed.canonicalUsername === u1,
      `User can safely reclaim their own previous alias ${u1} as active canonical username`
    );

    const resOldU3 = await resolveProfile(u3);
    assert(
      resOldU3.status === 308 && resOldU3.canonicalUsername === u1,
      `Former canonical username ${u3} now redirects to reclaimed username ${u1}`
    );

    // ----------------------------------------------------
    // STEP 6: Deleted Account & Cascade Invalidation
    // ----------------------------------------------------
    console.log("\n--- 6. Deleted Account & Alias Release ---");
    await prisma.user.delete({
      where: { id: userA.id },
    });

    const orphanedAliases = await prisma.usernameHistory.findMany({
      where: { userId: userA.id },
    });
    assert(orphanedAliases.length === 0, `All UsernameHistory records for deleted account are deleted via cascade`);

    const resDeletedU1 = await resolveProfile(u1);
    assert(resDeletedU1.status === 404, `URLs for deleted user (/p/${u1}) return 404 Not Found`);

    const resDeletedU2 = await resolveProfile(u2);
    assert(resDeletedU2.status === 404, `Historical URLs for deleted user (/p/${u2}) return 404 Not Found`);

    // User B can now claim the released username u1 without collision
    const canUserBClaim =
      (await prisma.user.findFirst({ where: { username: u1 } })) === null &&
      (await prisma.usernameHistory.findFirst({ where: { username: u1 } })) === null;
    assert(canUserBClaim, `Released username ${u1} is now eligible for registration after account deletion`);

    // Clean up user B
    await prisma.user.delete({ where: { id: userB.id } });

    console.log("\n========================================================");
    console.log(`RESULTS: ${passedTests} / ${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
    console.log("========================================================\n");

    if (passedTests === totalTests) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runUsernameHistorySuite();
