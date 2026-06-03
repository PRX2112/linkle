import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting workspace analytics seed script...");
  
  // Find the first user
  let user = await prisma.user.findFirst({
    include: {
      socialLinks: true,
      businessLinks: true,
    }
  });

    if (!user) {
      // Create a dummy user
      const created = await prisma.user.create({
        data: {
          email: "dummy@example.com",
          username: "dummyuser",
          name: "Dummy User",
        },
      });
      // Refetch with relations
      user = await prisma.user.findUnique({
        where: { id: created.id },
        include: { socialLinks: true, businessLinks: true },
      });
    }
  if (!user) {
    console.error("Failed to obtain user");
    return;
  }
  console.log(`Found user: ${user.email} (ID: ${user.id}, Username: ${user.username})`);

  // Clear existing views and clicks for clean state
  await prisma.profileView.deleteMany({ where: { userId: user.id } });
  await prisma.clickEvent.deleteMany({ where: { userId: user.id } });
  console.log("Cleared existing analytics data.");

  const countries = ["India", "United States", "United Kingdom", "Canada", "Germany"];
  const devices = ["Mobile", "Desktop", "Tablet"];
  const referrers = ["Instagram", "Twitter", "LinkedIn", "Direct", "Google"];

  // Generate views & clicks for the last 14 days
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() - i);
    
    // Number of views for this day (simulate nice traffic distribution)
    const dailyViewsCount = Math.floor(Math.random() * 25) + 5;
    console.log(`Generating ${dailyViewsCount} views for ${targetDate.toDateString()}...`);

    for (let j = 0; j < dailyViewsCount; j++) {
      const visitorNum = Math.floor(Math.random() * 10);
      await prisma.profileView.create({
        data: {
          userId: user.id,
          visitorId: `vis_sim_${visitorNum}`,
          referrer: referrers[Math.floor(Math.random() * referrers.length)],
          device: devices[Math.floor(Math.random() * devices.length)],
          country: countries[Math.floor(Math.random() * countries.length)],
          createdAt: targetDate,
        }
      });
    }

    // Number of clicks for this day
    const dailyClicksCount = Math.floor(Math.random() * 12) + 2;
    console.log(`Generating ${dailyClicksCount} clicks for ${targetDate.toDateString()}...`);

    for (let k = 0; k < dailyClicksCount; k++) {
      let linkId = "link_1";
      let linkTitle = "Portfolio";
      let linkType = "business";
      let url = "https://myportfolio.com";

      if (user.socialLinks.length > 0 && Math.random() > 0.5) {
        const link = user.socialLinks[Math.floor(Math.random() * user.socialLinks.length)];
        linkId = link.id;
        linkTitle = link.platform;
        linkType = "social";
        url = link.url;
      } else if (user.businessLinks.length > 0) {
        const link = user.businessLinks[Math.floor(Math.random() * user.businessLinks.length)];
        linkId = link.id;
        linkTitle = link.title;
        linkType = "business";
        url = link.url;
      }

      await prisma.clickEvent.create({
        data: {
          userId: user.id,
          linkId,
          linkType,
          linkTitle,
          url,
          referrer: referrers[Math.floor(Math.random() * referrers.length)],
          device: devices[Math.floor(Math.random() * devices.length)],
          country: countries[Math.floor(Math.random() * countries.length)],
          createdAt: targetDate,
        }
      });
    }
  }

  console.log("Analytics seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
