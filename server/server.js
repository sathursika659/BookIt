const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

const bookingsFile = path.join(__dirname, 'bookings.json')

function getBookings() {
  const data = fs.readFileSync(bookingsFile, 'utf8')
  return JSON.parse(data)
}

// BookIt resources
const resources = [
  {
    id: 1,
    name: 'Meeting Room 1'
  },
  {
    id: 2,
    name: 'Meeting Room 2'
  },
  {
    id: 3,
    name: 'Projector'
  },
  {
    id: 4,
    name: 'Camera Kit'
  },
  {
    id: 5,
    name: 'Demo Laptop'
  }
]

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'BookIt backend is running!'
  })
})

// Resources route
app.get('/api/resources', (req, res) => {
  res.json(resources)
})

// Get bookings for a chosen day
app.get('/api/bookings', (req, res) => {
  const { date } = req.query

  if (!date) {
    return res.status(400).json({
      message: 'Please provide a date to view bookings.'
    })
  }

  const bookings = getBookings()

  const dayBookings = bookings.filter(
    booking => booking.date === date
  )

  res.json(dayBookings)
})

// Create a new booking
app.post('/api/bookings', (req, res) => {
  const {
    resourceId,
    date,
    startTime,
    endTime,
    name,
    purpose
  } = req.body

  // Required fields validation
  if (!resourceId || !date || !startTime || !endTime || !name || !purpose) {
    return res.status(400).json({
      message: 'All booking fields are required.'
    })
  }

  // Resource validation
  const resource = resources.find(
    resource => resource.id === Number(resourceId)
  )

  if (!resource) {
    return res.status(400).json({
      message: 'Selected resource does not exist.'
    })
  }

  // Name validation
  if (!name.trim()) {
    return res.status(400).json({
      message: 'Please enter your name.'
    })
  }

  // Purpose validation
  if (!purpose.trim()) {
    return res.status(400).json({
      message: 'Please enter the booking purpose.'
    })
  }

  // Time validation
  if (startTime >= endTime) {
    return res.status(400).json({
      message: 'End time must be later than start time.'
    })
  }

  const bookings = getBookings()

  // Check overlapping bookings
  // NOTE: using <= and >= (not < and >) because a booking that ends
  // exactly when another starts is still treated as a clash (see DECISIONS.md)
  const overlappingBooking = bookings.find(
    booking =>
      Number(booking.resourceId) === Number(resourceId) &&
      booking.date === date &&
      booking.status === 'confirmed' &&
      startTime <= booking.endTime &&
      endTime >= booking.startTime
  )

  if (overlappingBooking) {
    return res.status(409).json({
      message: `${resource.name} is already booked on ${date} from ${overlappingBooking.startTime} to ${overlappingBooking.endTime}.`
    })
  }

  // Create booking
  const newBooking = {
    id: Date.now(),
    resourceId,
    date,
    startTime,
    endTime,
    name: name.trim(),
    purpose: purpose.trim(),
    status: 'confirmed'
  }

  bookings.push(newBooking)

  fs.writeFileSync(
    bookingsFile,
    JSON.stringify(bookings, null, 2)
  )

  res.status(201).json(newBooking)
})

// Cancel a booking
app.patch('/api/bookings/:id/cancel', (req, res) => {
  const bookingId = Number(req.params.id)
  const bookings = getBookings()

  const booking = bookings.find(
    booking => booking.id === bookingId
  )

  if (!booking) {
    return res.status(404).json({
      message: 'Booking not found.'
    })
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({
      message: 'This booking is already cancelled.'
    })
  }

  booking.status = 'cancelled'

  fs.writeFileSync(
    bookingsFile,
    JSON.stringify(bookings, null, 2)
  )

  res.json({
    message: 'Booking cancelled successfully.',
    booking
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`BookIt server running on http://localhost:${PORT}`)
})