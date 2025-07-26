export interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
  isBooked: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  slotId: string
  guestName: string
  guestEmail: string
  meetingTitle: string
  meetingDescription?: string
  status: 'confirmed' | 'pending' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  displayName?: string
}