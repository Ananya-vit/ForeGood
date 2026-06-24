import { getUser } from "@/app/lib/dal";
import { prisma } from "@/app/lib/prisma";
import { CharitySelector } from "./charity-selector";

export default async function SettingsPage() {
  const user = await getUser();
  const charities = await prisma.charity.findMany({ orderBy: { name: "asc" } });
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user!.id, status: "active" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-gray-500">Manage your profile and preferences</p>

      <div className="mt-8 max-w-md space-y-8">
        <section>
          <h2 className="text-lg font-semibold">Profile</h2>
          <div className="mt-2 text-sm">
            <p><span className="font-medium">Name:</span> {user?.name}</p>
            <p><span className="font-medium">Email:</span> {user?.email}</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Charity selection</h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose a charity to support with your subscription (minimum 10% contribution)
          </p>
          {subscription ? (
            <CharitySelector
              charities={charities.map((c) => ({ id: c.id, name: c.name }))}
              currentCharityId={subscription.charityId}
              currentPct={subscription.charityPct}
            />
          ) : (
            <p className="mt-4 text-sm text-gray-400">
              Subscribe to a plan before selecting a charity.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
