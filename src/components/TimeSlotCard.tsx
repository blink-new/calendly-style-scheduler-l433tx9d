import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { TimeSlot } from '@/types/scheduler'

interface TimeSlotCardProps {
  slot: TimeSlot
  onBook: (slot: TimeSlot) => void
  isOwner?: boolean
  onToggleAvailability?: (slot: TimeSlot) => void
}

export function TimeSlotCard({ slot, onBook, isOwner, onToggleAvailability }: TimeSlotCardProps) {
  const getStatusIcon = () => {
    if (slot.isBooked) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (slot.isAvailable) return <Clock className="h-4 w-4 text-blue-600" />
    return <XCircle className="h-4 w-4 text-gray-400" />
  }

  const getStatusText = () => {
    if (slot.isBooked) return 'Booked'
    if (slot.isAvailable) return 'Available'
    return 'Unavailable'
  }

  const getCardStyle = () => {
    if (slot.isBooked) return 'border-green-200 bg-green-50'
    if (slot.isAvailable) return 'border-blue-200 bg-blue-50 hover:bg-blue-100'
    return 'border-gray-200 bg-gray-50'
  }

  return (
    <Card className={`p-4 transition-all duration-200 ${getCardStyle()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-700">
            {getStatusText()}
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {format(new Date(slot.date), 'MMM d')}
        </div>
      </div>
      
      <div className="text-lg font-semibold text-gray-900 mb-3">
        {slot.startTime} - {slot.endTime}
      </div>

      {isOwner ? (
        <Button
          variant={slot.isAvailable ? "outline" : "default"}
          size="sm"
          className="w-full"
          onClick={() => onToggleAvailability?.(slot)}
        >
          {slot.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
        </Button>
      ) : (
        <Button
          variant="default"
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={!slot.isAvailable || slot.isBooked}
          onClick={() => onBook(slot)}
        >
          {slot.isBooked ? 'Booked' : slot.isAvailable ? 'Book Meeting' : 'Unavailable'}
        </Button>
      )}
    </Card>
  )
}