import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";

export default async function CharityProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const charity = await prisma.charity.findUnique({ where: { id } });
  if (!charity) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
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
    </div>
  );
}
