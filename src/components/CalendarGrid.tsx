import { useState, useEffect, useCallback } from 'react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TimeSlotCard } from './TimeSlotCard'
import { BookingModal } from './BookingModal'
import { TimeSlot, Booking } from '@/types/scheduler'
import { blink } from '@/blink/client'
import { useToast } from '@/hooks/use-toast'

interface CalendarGridProps {
  isOwner?: boolean
}

export function CalendarGrid({ isOwner = false }: CalendarGridProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()

  // Get week days
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [])

  const loadTimeSlots = useCallback(async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      
      // Sample time slots for demo
      const timeSlotTemplates = [
        { startTime: '09:00', endTime: '10:00' },
        { startTime: '10:00', endTime: '11:00' },
        { startTime: '11:00', endTime: '12:00' },
        { startTime: '14:00', endTime: '15:00' },
        { startTime: '15:00', endTime: '16:00' },
        { startTime: '16:00', endTime: '17:00' }
      ]
      
      // Generate mock slots for the current week
      const mockSlots: TimeSlot[] = []
      
      weekDays.forEach(day => {
        // Skip weekends for demo
        if (day.getDay() === 0 || day.getDay() === 6) return
        
        timeSlotTemplates.forEach((template) => {
          const slotId = `${format(day, 'yyyy-MM-dd')}-${template.startTime}`
          mockSlots.push({
            id: slotId,
            date: format(day, 'yyyy-MM-dd'),
            startTime: template.startTime,
            endTime: template.endTime,
            isAvailable: Math.random() > 0.3, // Random availability for demo
            isBooked: Math.random() > 0.8, // Some random bookings
            userId: user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          })
        })
      })
      
      setTimeSlots(mockSlots)
    } catch (error) {
      console.error('Error loading time slots:', error)
      toast({
        title: 'Error',
        description: 'Failed to load time slots',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, weekDays, toast])

  useEffect(() => {
    loadTimeSlots()
  }, [loadTimeSlots])

  const handleBookSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setIsBookingModalOpen(true)
  }

  const handleConfirmBooking = async (bookingData: {
    guestName: string
    guestEmail: string
    meetingTitle: string
    meetingDescription?: string
  }) => {
    if (!selectedSlot) return

    try {
      setIsLoading(true)

      // Create booking record
      const booking: Booking = {
        id: `booking_${Date.now()}`,
        slotId: selectedSlot.id,
        guestName: bookingData.guestName,
        guestEmail: bookingData.guestEmail,
        meetingTitle: bookingData.meetingTitle,
        meetingDescription: bookingData.meetingDescription,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Update slot to booked
      setTimeSlots(prev => prev.map(slot => 
        slot.id === selectedSlot.id 
          ? { ...slot, isBooked: true }
          : slot
      ))

      // Send confirmation email (mock for now)
      console.log('Sending confirmation email to:', bookingData.guestEmail)
      console.log('Booking details:', booking)

      toast({
        title: 'Booking Confirmed!',
        description: `Meeting scheduled for ${selectedSlot.startTime} - ${selectedSlot.endTime}`,
      })

      setIsBookingModalOpen(false)
      setSelectedSlot(null)
    } catch (error) {
      console.error('Error creating booking:', error)
      toast({
        title: 'Booking Failed',
        description: 'There was an error creating your booking. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAvailability = async (slot: TimeSlot) => {
    try {
      setTimeSlots(prev => prev.map(s => 
        s.id === slot.id 
          ? { ...s, isAvailable: !s.isAvailable }
          : s
      ))

      toast({
        title: 'Availability Updated',
        description: `Slot ${slot.isAvailable ? 'marked unavailable' : 'marked available'}`,
      })
    } catch (error) {
      console.error('Error updating availability:', error)
      toast({
        title: 'Update Failed',
        description: 'Failed to update availability',
        variant: 'destructive'
      })
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => addDays(prev, direction === 'next' ? 7 : -7))
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Scheduler</h2>
          <p className="text-gray-600">Please sign in to continue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              {isOwner ? 'Manage Your Availability' : 'Book a Meeting'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-4">
                {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d, yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {weekDays.slice(0, 5).map(day => { // Show weekdays only
              const daySlots = timeSlots.filter(slot => 
                isSameDay(new Date(slot.date), day)
              )
              
              return (
                <div key={day.toISOString()} className="space-y-3">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {format(day, 'EEEE')}
                    </div>
                    <div className="text-lg font-semibold text-blue-600">
                      {format(day, 'MMM d')}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {daySlots.length > 0 ? (
                      daySlots.map(slot => (
                        <TimeSlotCard
                          key={slot.id}
                          slot={slot}
                          onBook={handleBookSlot}
                          isOwner={isOwner}
                          onToggleAvailability={handleToggleAvailability}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No slots available</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false)
          setSelectedSlot(null)
        }}
        slot={selectedSlot}
        onConfirm={handleConfirmBooking}
        isLoading={isLoading}
      />
    </div>
  )
}