import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, User, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { TimeSlot } from '@/types/scheduler'

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  slot: TimeSlot | null
  onConfirm: (bookingData: {
    guestName: string
    guestEmail: string
    meetingTitle: string
    meetingDescription?: string
  }) => void
  isLoading?: boolean
}

export function BookingModal({ isOpen, onClose, slot, onConfirm, isLoading }: BookingModalProps) {
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    meetingTitle: '',
    meetingDescription: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.guestName || !formData.guestEmail || !formData.meetingTitle) return
    
    onConfirm(formData)
  }

  const handleClose = () => {
    setFormData({
      guestName: '',
      guestEmail: '',
      meetingTitle: '',
      meetingDescription: ''
    })
    onClose()
  }

  if (!slot) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Book Meeting
          </DialogTitle>
        </DialogHeader>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">
              {format(new Date(slot.date), 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
          <div className="text-blue-700 font-semibold">
            {slot.startTime} - {slot.endTime}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Name *
            </Label>
            <Input
              id="guestName"
              value={formData.guestName}
              onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guestEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address *
            </Label>
            <Input
              id="guestEmail"
              type="email"
              value={formData.guestEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingTitle">
              Meeting Title *
            </Label>
            <Input
              id="meetingTitle"
              value={formData.meetingTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, meetingTitle: e.target.value }))}
              placeholder="What's this meeting about?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meetingDescription">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="meetingDescription"
              value={formData.meetingDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, meetingDescription: e.target.value }))}
              placeholder="Any additional details or agenda items..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !formData.guestName || !formData.guestEmail || !formData.meetingTitle}
            >
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}