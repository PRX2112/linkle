import { prisma } from "@/lib/db";
import { revalidateProfile } from "@/lib/cache";
import { PROFILE_TEMPLATES } from "./definitions";
import { OnboardingConfigInput, TemplateId } from "./types";
import { isSafeUrl } from "@/lib/utm";

export async function applyTemplate(userId: string, input: OnboardingConfigInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      bio: true,
      displayName: true,
      onboardingCompleted: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const templateId = input.templateId;
  const template = PROFILE_TEMPLATES[templateId] || PROFILE_TEMPLATES.scratch;

  // Handle "Start from scratch"
  if (templateId === "scratch") {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true,
        selectedTemplate: "scratch",
      },
      include: {
        socialLinks: { orderBy: { order: "asc" } },
        businessLinks: { orderBy: { order: "asc" } },
        paymentLinks: { orderBy: { order: "asc" } },
        contactActions: { orderBy: { order: "asc" } },
      },
    });

    if (user.username) revalidateProfile(user.username);
    return updatedUser;
  }

  // Safe bio: use customized bio if passed, or scaffolding if user had none
  const finalBio = input.bio !== undefined
    ? input.bio.trim()
    : (!user.bio ? template.bioScaffolding : user.bio);

  const finalPrimaryColor = input.themePrimaryColor || template.theme.primaryColor;
  const finalButtonStyle = input.themeButtonStyle || template.theme.buttonStyle;
  const finalFontFamily = template.theme.fontFamily;

  const finalEmailCaptureEnabled = input.emailCaptureEnabled !== undefined
    ? input.emailCaptureEnabled
    : template.emailCapture.enabled;
  const finalEmailCaptureTitle = input.emailCaptureTitle || template.emailCapture.title;
  const finalEmailCapturePlaceholder = input.emailCapturePlaceholder || template.emailCapture.placeholder;

  // Execute in transaction to maintain consistency
  const updatedUser = await prisma.$transaction(async (tx) => {
    // 1. Update user profile and onboarding flags
    const u = await tx.user.update({
      where: { id: userId },
      data: {
        bio: finalBio,
        displayName: input.displayName ? input.displayName.trim() : undefined,
        themePrimaryColor: finalPrimaryColor,
        themeButtonStyle: finalButtonStyle,
        themeFontFamily: finalFontFamily,
        emailCaptureEnabled: finalEmailCaptureEnabled,
        emailCaptureTitle: finalEmailCaptureTitle,
        emailCapturePlaceholder: finalEmailCapturePlaceholder,
        onboardingCompleted: true,
        selectedTemplate: templateId,
      },
    });

    // 2. Add Social Links (if passed or default to template suggested with valid URLs)
    const rawSocials = input.socialLinks ?? template.suggestedSocial.map((s) => ({
      platform: s.platform,
      url: s.urlPrefix,
      label: s.label,
    }));

    if (rawSocials.length > 0) {
      // Find current max order
      const existingCount = await tx.socialLink.count({ where: { userId } });
      const socialCreates = rawSocials
        .filter((s) => s.url && s.url.trim().length > 0 && isSafeUrl(s.url))
        .map((s, idx) => ({
          userId,
          platform: s.platform.toLowerCase(),
          url: s.url.trim(),
          label: s.label?.trim() || null,
          order: existingCount + idx,
          isVisible: true,
        }));

      if (socialCreates.length > 0) {
        await tx.socialLink.createMany({
          data: socialCreates,
        });
      }
    }

    // 3. Add Business Links (CTAs)
    const rawBusiness = input.businessLinks ?? template.suggestedBusinessLinks.map((b) => ({
      title: b.title,
      url: b.defaultUrl,
      description: b.description,
    }));

    if (rawBusiness.length > 0) {
      const existingCount = await tx.businessLink.count({ where: { userId } });
      const businessCreates = rawBusiness
        .filter((b) => b.title && b.title.trim().length > 0 && (!b.url || isSafeUrl(b.url)))
        .map((b, idx) => ({
          userId,
          title: b.title.trim(),
          url: b.url?.trim() || "https://",
          description: b.description?.trim() || null,
          order: existingCount + idx,
          isVisible: true,
        }));

      if (businessCreates.length > 0) {
        await tx.businessLink.createMany({
          data: businessCreates,
        });
      }
    }

    // 4. Add Contact Actions
    const rawContacts = input.contactActions ?? template.suggestedContactActions;
    if (rawContacts && rawContacts.length > 0) {
      const existingCount = await tx.contactAction.count({ where: { userId } });
      const contactCreates = rawContacts
        .filter((c) => c.label && c.label.trim().length > 0)
        .map((c, idx) => ({
          userId,
          type: c.type,
          label: c.label.trim(),
          url: c.url?.trim() || "",
          order: existingCount + idx,
          isVisible: true,
        }));

      if (contactCreates.length > 0) {
        await tx.contactAction.createMany({
          data: contactCreates,
        });
      }
    }

    // 5. Add optional Payment Link if valid value provided
    if (input.paymentValue && input.paymentValue.trim().length > 0) {
      const plat = input.paymentPlatform || "upi";
      await tx.paymentLink.create({
        data: {
          userId,
          platform: plat,
          value: input.paymentValue.trim(),
          isVisible: true,
          order: 0,
        },
      });
    }

    return u;
  });

  if (user.username) revalidateProfile(user.username);

  // Return complete user with populated relations
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      socialLinks: { orderBy: { order: "asc" } },
      businessLinks: { orderBy: { order: "asc" } },
      paymentLinks: { orderBy: { order: "asc" } },
      contactActions: { orderBy: { order: "asc" } },
    },
  });
}

export async function skipOnboarding(userId: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      onboardingCompleted: true,
      selectedTemplate: "scratch",
    },
    include: {
      socialLinks: { orderBy: { order: "asc" } },
      businessLinks: { orderBy: { order: "asc" } },
      paymentLinks: { orderBy: { order: "asc" } },
      contactActions: { orderBy: { order: "asc" } },
    },
  });

  if (user.username) revalidateProfile(user.username);
  return user;
}
