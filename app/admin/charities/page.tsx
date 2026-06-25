import { prisma } from "@/app/lib/prisma";
import { CharityForm } from "./charity-form";
import { DeleteCharityButton } from "./delete-charity-button";
import { EventForm } from "./event-form";
import { DeleteEventButton } from "./delete-event-button";

export default async function AdminCharitiesPage() {
  const charities = await prisma.charity.findMany({
    orderBy: { name: "asc" },
    include: { events: { orderBy: { date: "asc" }, take: 5 } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Charity Management</h1>
      <p className="mt-1 text-gray-500">Add, edit, and manage charities</p>

      <div className="mt-8 max-w-md">
        <h2 className="text-lg font-semibold">New charity</h2>
        <CharityForm />
      </div>

      <div className="mt-10 space-y-8">
        <h2 className="text-lg font-semibold">All charities</h2>
        {charities.length === 0 ? (
          <p className="text-sm text-gray-400">No charities yet.</p>
        ) : (
          charities.map((c) => (
            <div key={c.id} className="rounded-xl border p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.name}</span>
                    {c.featured && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Featured</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{c.description}</p>
                </div>
                <DeleteCharityButton id={c.id} />
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-600">Edit charity</summary>
                <div className="mt-3 border-t pt-3">
                  <CharityForm
                    charity={{
                      id: c.id,
                      name: c.name,
                      description: c.description,
                      imageUrl: c.imageUrl,
                      website: c.website,
                      featured: c.featured,
                    }}
                  />
                </div>
              </details>

              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-medium">Events</h3>
                {c.events.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {c.events.map((e) => (
                      <div key={e.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                        <div>
                          <span className="font-medium">{e.title}</span>
                          <span className="ml-2 text-gray-500">{new Date(e.date).toLocaleDateString()}</span>
                          {e.location && <span className="ml-2 text-gray-400">{e.location}</span>}
                        </div>
                        <DeleteEventButton id={e.id} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-gray-400">No events yet.</p>
                )}
                <div className="mt-3">
                  <EventForm charityId={c.id} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
