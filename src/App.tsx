import { useState, useEffect } from 'react'
import { CalendarGrid } from './components/CalendarGrid'
import { OwnerDashboard } from './components/OwnerDashboard'
import { Toaster } from './components/ui/toaster'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { blink } from './blink/client'
import { User } from '@blinkdotnew/sdk'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Scheduler Pro</h1>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.email}
                </span>
                <button
                  onClick={() => blink.auth.logout()}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-6">
          <Tabs defaultValue="booking" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto">
              <TabsTrigger value="booking" className="flex items-center gap-2">
                📅 Book Meeting
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                ⚙️ Manage Availability
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="booking" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Schedule a Meeting
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Choose an available time slot that works for you. You'll receive an email confirmation once your booking is confirmed.
                </p>
              </div>
              <CalendarGrid />
            </TabsContent>
            
            <TabsContent value="dashboard" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Manage Your Availability
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Set your available time slots and manage your bookings. Changes are saved automatically.
                </p>
              </div>
              <OwnerDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Toaster />
    </div>
  )
}

export default App