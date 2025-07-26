import { CalendarGrid } from './components/CalendarGrid'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Scheduler</h1>
            </div>
            <div className="text-sm text-gray-600">
              Book meetings seamlessly
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <CalendarGrid />
      </main>

      <Toaster />
    </div>
  )
}

export default App