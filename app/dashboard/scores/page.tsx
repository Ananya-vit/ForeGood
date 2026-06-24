import { getUser } from '@/app/lib/dal'
import { prisma } from '@/app/lib/prisma'
import { ScoreForm } from './score-form'
import { ScoreList } from './score-list'

export default async function ScoresPage() {
  const user = await getUser()
  const scores = await prisma.score.findMany({
    where: { userId: user!.id },
    orderBy: { date: 'desc' },
    take: 5,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold">Scores</h1>
      <p className="mt-1 text-gray-500">Enter and manage your golf scores</p>

      <div className="mt-8 max-w-md">
        <ScoreForm />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Recent scores</h2>
        {scores.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">No scores yet. Add your first one above.</p>
        ) : (
          <ScoreList scores={scores.map(s => ({ id: s.id, score: s.score, date: s.date.toISOString().split('T')[0] }))} />
        )}
      </div>
    </div>
  )
}
