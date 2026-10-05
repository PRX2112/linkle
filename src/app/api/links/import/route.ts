import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { ImportParseSchema, ImportCommitSchema } from "@/lib/validation";
import { parseProfileUrls, commitImportedLinks } from "@/lib/importer/service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // 1. Handle Parse Action
    if (body.action === "parse") {
      const validation = ImportParseSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.issues[0].message },
          { status: 400 }
        );
      }

      const input = validation.data.rawText || validation.data.urls || "";

      // Fetch user's existing links for duplicate cross-referencing
      const existingUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          socialLinks: { select: { platform: true, url: true } },
          businessLinks: { select: { url: true } },
        },
      });

      const existingRefs = [
        ...(existingUser?.socialLinks || []),
        ...(existingUser?.businessLinks || []).map((b) => ({ url: b.url })),
      ];

      const parseResult = parseProfileUrls(input, existingRefs);

      return NextResponse.json({
        success: true,
        result: parseResult,
      });
    }

    // 2. Handle Commit Action (User Confirmed Suggestions)
    if (body.action === "commit") {
      const validation = ImportCommitSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: validation.error.issues[0].message },
          { status: 400 }
        );
      }

      const result = await commitImportedLinks(
        session.user.id,
        validation.data.items
      );

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${result.addedSocialCount + result.addedBusinessCount} links`,
        ...result,
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: 'parse', 'commit'" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Profile import error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process profile import" },
      { status: 500 }
    );
  }
}
