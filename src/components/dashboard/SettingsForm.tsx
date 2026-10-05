"use client";

import { useRouter } from "next/navigation";
import { AccountProfileSection } from "./settings/AccountProfileSection";
import { AccountSecuritySection } from "./settings/AccountSecuritySection";
import { DangerZoneSection } from "./settings/DangerZoneSection";

interface UserSettingsData {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
  createdAt: Date | string;
  emailVerified: boolean;
  hasPassword: boolean;
  providers: string[];
  hasActiveSubscription: boolean;
}

export default function SettingsForm({ user }: { user: UserSettingsData }) {
  const router = useRouter();

  const handleProfileSaved = () => {
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Profile & Username Identity */}
      <section aria-labelledby="profile-heading">
        <AccountProfileSection
          user={{
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
          }}
          onSaveSuccess={handleProfileSaved}
        />
      </section>

      {/* Security & Authentication */}
      <section aria-labelledby="security-heading">
        <AccountSecuritySection
          email={user.email}
          emailVerified={user.emailVerified}
          hasPassword={user.hasPassword}
          providers={user.providers}
        />
      </section>

      {/* Danger Zone */}
      <section aria-labelledby="danger-heading">
        <DangerZoneSection
          hasActiveSubscription={user.hasActiveSubscription}
        />
      </section>

      {/* Account metadata footer */}
      <div className="pt-2 text-center text-xs text-gray-400 dark:text-gray-500">
        Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </div>
    </div>
  );
}
