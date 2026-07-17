import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";

// Enforce Node.js runtime since Prisma requires TCP connections that are standard in Node.js
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    // Generic default template styling
    const defaultTemplate = (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0f19",
          backgroundImage: "linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "72px",
            fontWeight: 900,
            backgroundImage: "linear-gradient(to right, #a855f7, #6366f1)",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: "-0.03em",
          }}
        >
          Linkle
        </div>
        <div style={{ fontSize: "28px", marginTop: "20px", color: "#94a3b8", fontWeight: 500 }}>
          Premium aesthetics for modern bios.
        </div>
      </div>
    );

    if (!username) {
      return new ImageResponse(defaultTemplate, { width: 1200, height: 630 });
    }

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase().trim() },
    });

    if (!user) {
      return new ImageResponse(
        (
          <div
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0b0f19",
              backgroundImage: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
              fontFamily: "sans-serif",
              color: "#ffffff",
            }}
          >
            <div style={{ fontSize: "56px", fontWeight: 800, color: "#f3f4f6" }}>Profile Not Found</div>
            <div style={{ fontSize: "26px", marginTop: "15px", color: "#94a3b8" }}>
              @{username} does not exist on Linkle
            </div>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    const displayName = user.displayName || user.username || "Linkle User";
    const bio = user.bio || "Welcome to my Linkle profile!";
    const rawAvatarUrl = user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

    // Resolve relative avatar pathing to absolute URL (crucial for satori loading)
    let avatarUrl = rawAvatarUrl;
    if (rawAvatarUrl.startsWith("/")) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      avatarUrl = `${appUrl}${rawAvatarUrl}`;
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#0b0f19",
            backgroundImage: "linear-gradient(135deg, #090d16 0%, #111827 50%, #1e1b4b 100%)",
            fontFamily: "sans-serif",
            color: "#ffffff",
            padding: "80px",
            position: "relative",
          }}
        >
          {/* Decorative SVG radial gradients for background styling */}
          <svg
            width="1200"
            height="630"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1,
            }}
          >
            <defs>
              <radialGradient id="glow-top" cx="85%" cy="15%" r="60%">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#0b0f19" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="glow-bottom" cx="15%" cy="85%" r="50%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0b0f19" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="1200" height="630" fill="url(#glow-top)" />
            <rect width="1200" height="630" fill="url(#glow-bottom)" />
          </svg>

          {/* Left panel: Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: "60%",
              height: "100%",
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  padding: "6px 20px",
                  borderRadius: "9999px",
                  background: "linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)",
                  border: "1px solid rgba(168, 85, 247, 0.35)",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#c084fc",
                }}
              >
                linkle.vip
              </span>
            </div>

            <h1
              style={{
                fontSize: "64px",
                fontWeight: 900,
                margin: "0 0 12px 0",
                color: "#ffffff",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              {displayName}
            </h1>

            <p
              style={{
                fontSize: "28px",
                fontWeight: 600,
                backgroundImage: "linear-gradient(to right, #c084fc, #818cf8)",
                backgroundClip: "text",
                color: "transparent",
                margin: "0 0 24px 0",
              }}
            >
              @{user.username}
            </p>

            <p
              style={{
                fontSize: "24px",
                color: "#94a3b8",
                margin: 0,
                lineHeight: 1.5,
                maxHeight: "110px",
                overflow: "hidden",
              }}
            >
              {bio}
            </p>
          </div>

          {/* Right panel: Profile image frame */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "35%",
              height: "100%",
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "8px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                boxShadow: "0 15px 35px rgba(99, 102, 241, 0.25)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={displayName}
                style={{
                  width: "240px",
                  height: "240px",
                  borderRadius: "120px",
                  objectFit: "cover",
                  backgroundColor: "#090d16",
                  border: "6px solid #090d16",
                }}
              />
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG Image generation failed:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
