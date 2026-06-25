import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";

export default async function CharityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const charity = await prisma.charity.findUnique({
    where: { id },
    include: { events: { orderBy: { date: "asc" } } },
  });
  if (!charity) notFound();

  const upcoming = charity.events.filter((e) => e.date >= new Date());
  const past = charity.events.filter((e) => e.date < new Date());

  return (
    <div className="mx-auto max-w-2xl px-4 pb-12">
      {charity.imageUrl && (
        <img src={charity.imageUrl} alt={charity.name} className="mb-6 h-56 w-full rounded-xl object-cover" />
      )}

      <h1 className="text-3xl font-bold">{charity.name}</h1>

      {charity.description && (
        <p className="mt-4 text-gray-600 leading-relaxed">{charity.description}</p>
      )}

      {charity.website && (
        <a
          href={charity.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm underline underline-offset-4"
        >
          Visit website →
        </a>
      )}

      {upcoming.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Upcoming events</h2>
          <div className="mt-4 space-y-4">
            {upcoming.map((e) => (
              <div key={e.id} className="rounded-lg border p-4">
                <p className="font-medium">{e.title}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(e.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
                {e.location && <p className="text-sm text-gray-400">{e.location}</p>}
                {e.description && <p className="mt-1 text-sm text-gray-500">{e.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
