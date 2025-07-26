import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, Clock, Users, Settings, Plus, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Switch } from './ui/switch'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { useToast } from '../hooks/use-toast'
import { blink } from '../blink/client'
import { TimeSlot, Booking } from '../types/scheduler'
import { format, parseISO, addDays, startOfWeek } from 'date-fns'

export function OwnerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const [settings, setSettings] = useState({
    meetingDuration: 60,
    bufferTime: 15,
    workingHours: { start: '09:00', end: '17:00' },
    autoConfirm: true,
    emailNotifications: true
  })

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Generate mock bookings for demo
      const mockBookings: Booking[] = [
        {
          id: 'booking_1',
          slotId: 'slot_1',
          guestName: 'John Smith',
          guestEmail: 'john@example.com',
          meetingTitle: 'Product Demo',
          meetingDescription: 'Interested in learning more about the product features',
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'booking_2',
          slotId: 'slot_2',
          guestName: 'Sarah Johnson',
          guestEmail: 'sarah@company.com',
          meetingTitle: 'Strategy Discussion',
          meetingDescription: 'Quarterly planning session',
          status: 'confirmed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
      setBookings(mockBookings)

      // Generate mock time slots for the current week
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
      const mockSlots: TimeSlot[] = []
      
      for (let i = 0; i < 5; i++) { // Weekdays only
        const day = addDays(weekStart, i)
        const timeTemplates = [
          { start: '09:00', end: '10:00' },
          { start: '10:00', end: '11:00' },
          { start: '14:00', end: '15:00' },
          { start: '15:00', end: '16:00' }
        ]
        
        timeTemplates.forEach(template => {
          mockSlots.push({
            id: `${format(day, 'yyyy-MM-dd')}-${template.start}`,
            date: format(day, 'yyyy-MM-dd'),
            startTime: template.start,
            endTime: template.end,
            isAvailable: Math.random() > 0.3,
            isBooked: Math.random() > 0.8,
            userId: user?.id || 'demo-user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        })
      }
      setTimeSlots(mockSlots)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [user, toast])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadDashboardData()
      }
    })
    return unsubscribe
  }, [loadDashboardData])

  const toggleSlotAvailability = async (slotId: string, isAvailable: boolean) => {
    try {
      setTimeSlots(prev => prev.map(slot => 
        slot.id === slotId ? { ...slot, isAvailable } : slot
      ))
      toast({
        title: "Success",
        description: `Time slot ${isAvailable ? 'enabled' : 'disabled'}`
      })
    } catch (error) {
      console.error('Error updating slot:', error)
      toast({
        title: "Error",
        description: "Failed to update time slot",
        variant: "destructive"
      })
    }
  }

  const cancelBooking = async (bookingId: string) => {
    try {
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
      ))
      toast({
        title: "Success",
        description: "Booking cancelled successfully"
      })
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive"
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">📅 Bookings</TabsTrigger>
          <TabsTrigger value="availability">⏰ Availability</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Bookings</h3>
            <Badge variant="secondary">{bookings.length} total</Badge>
          </div>
          
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No bookings yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Share your booking link to start receiving meeting requests
                  </p>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{booking.guestName}</h4>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{booking.guestEmail}</p>
                        <p className="font-medium text-blue-600">{booking.meetingTitle}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Today at 2:00 PM
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            60 minutes
                          </span>
                        </div>
                        {booking.meetingDescription && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Notes:</strong> {booking.meetingDescription}
                          </p>
                        )}
                      </div>
                      {booking.status === 'confirmed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Manage Availability</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </div>
          
          <div className="grid gap-3">
            {timeSlots.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No time slots configured</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Add your available time slots to start accepting bookings
                  </p>
                </CardContent>
              </Card>
            ) : (
              timeSlots.map((slot) => (
                <Card key={slot.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {format(new Date(slot.date), 'EEEE, MMM d')}
                          </span>
                          <Badge variant={slot.isAvailable ? 'default' : 'secondary'}>
                            {slot.isAvailable ? 'Available' : 'Unavailable'}
                          </Badge>
                          {slot.isBooked && (
                            <Badge variant="destructive">Booked</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {slot.startTime} - {slot.endTime}
                        </p>
                      </div>
                      <Switch
                        checked={slot.isAvailable}
                        onCheckedChange={(checked) => toggleSlotAvailability(slot.id, checked)}
                        disabled={slot.isBooked}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Meeting Settings</h3>
            
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Default Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={settings.meetingDuration}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      meetingDuration: parseInt(e.target.value)
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buffer">Buffer Time (minutes)</Label>
                  <Input
                    id="buffer"
                    type="number"
                    value={settings.bufferTime}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      bufferTime: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Working Hours Start</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={settings.workingHours.start}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, start: e.target.value }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">Working Hours End</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={settings.workingHours.end}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-confirm bookings</Label>
                    <p className="text-sm text-gray-500">
                      Automatically confirm new bookings without manual approval
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoConfirm}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      autoConfirm: checked
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive email notifications for new bookings
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      emailNotifications: checked
                    }))}
                  />
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={() => {
              toast({
                title: "Settings Saved",
                description: "Your preferences have been updated successfully"
              })
            }}>
              Save Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}