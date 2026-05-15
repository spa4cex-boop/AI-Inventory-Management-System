import { Card } from '../../components/ui/card'
import { Sidebar } from '../../components/sidebar'

const metrics = [
  { title: 'Total products', value: '1,248', delta: '+8.2%' },
  { title: 'Low stock', value: '42', delta: '-4.5%' },
  { title: 'Monthly revenue', value: '$82,400', delta: '+12.1%' },
  { title: 'AI recommendations', value: '5 pending', delta: '+2' },
]

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto py-10">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <Sidebar />
          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Dashboard</p>
                  <h1 className="mt-3 text-3xl font-semibold text-white">Inventory analytics overview</h1>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <Card key={metric.title} title={metric.title}>
                  <div className="mt-3 flex items-baseline gap-2 text-3xl font-bold text-white">
                    {metric.value}
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{metric.delta}</p>
                </Card>
              ))}
            </div>
            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <Card title="Sales trend">
                <div className="mt-4 h-72 rounded-3xl bg-slate-950/60 p-6 text-slate-300">Chart placeholder for Recharts graph</div>
              </Card>
              <Card title="AI recommendations">
                <div className="mt-4 space-y-4 text-slate-300">
                  <p>Reorder 120 units of premium screws before next month.</p>
                  <p>Monitor expired goods in warehouse B and adjust pricing.</p>
                </div>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
