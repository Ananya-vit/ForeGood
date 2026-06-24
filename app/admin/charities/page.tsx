import { prisma } from "@/app/lib/prisma";
import { CharityForm } from "./charity-form";
import { DeleteCharityButton } from "./delete-charity-button";

export default async function AdminCharitiesPage() {
  const charities = await prisma.charity.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold">Charity Management</h1>
      <p className="mt-1 text-gray-500">Add, edit, and manage charities</p>

      <div className="mt-8 max-w-md">
        <h2 className="text-lg font-semibold">New charity</h2>
        <CharityForm />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">All charities</h2>
        {charities.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">No charities yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {charities.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <span className="font-medium">{c.name}</span>
                  {c.featured && (
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Featured
                    </span>
                  )}
                  <p className="text-sm text-gray-500">{c.description}</p>
                </div>
                <DeleteCharityButton id={c.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
