import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000/api'

const resourceIcons = {
  'Meeting Room 1': '🏢',
  'Meeting Room 2': '🏢',
  'Projector': '📽️',
  'Camera Kit': '📷',
  'Demo Laptop': '💻',
}

function App() {
  const [resources, setResources] = useState([])
  const [bookings, setBookings] = useState([])

  const [showForm, setShowForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')

  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    name: '',
    purpose: '',
  })

  // Get today's date
  const getToday = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
  }

  // Load resources from backend
  useEffect(() => {
    fetchResources()

    const today = getToday()
    setSelectedDate(today)

    setFormData((previous) => ({
      ...previous,
      date: today,
    }))
  }, [])

  // Load bookings whenever selected date changes
  useEffect(() => {
    if (selectedDate) {
      fetchBookings(selectedDate)
    }
  }, [selectedDate])

  const fetchResources = async () => {
    try {
      const response = await fetch(`${API_URL}/resources`)

      if (!response.ok) {
        throw new Error('Unable to load resources.')
      }

      const data = await response.json()
      setResources(data)
    } catch (err) {
      setError('Unable to load resources. Please make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async (date) => {
    try {
      setError('')

      const response = await fetch(
        `${API_URL}/bookings?date=${date}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load bookings.')
      }

      setBookings(data)
    } catch (err) {
      setError(err.message)
      setBookings([])
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })

    setError('')
    setMessage('')
  }

  const handleDateChange = (e) => {
    const date = e.target.value

    setSelectedDate(date)

    setFormData({
      ...formData,
      date,
    })

    setError('')
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setMessage('')

    // Frontend validation
    if (
      !formData.resourceId ||
      !formData.date ||
      !formData.startTime ||
      !formData.endTime ||
      !formData.name.trim() ||
      !formData.purpose.trim()
    ) {
      setError('Please fill in all booking fields.')
      return
    }

    if (formData.startTime >= formData.endTime) {
      setError('End time must be later than start time.')
      return
    }

    try {
      setBookingLoading(true)

      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId: Number(formData.resourceId),
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          name: formData.name.trim(),
          purpose: formData.purpose.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Unable to create booking.')
        return
      }

      setMessage('Booking created successfully.')

      setFormData({
        resourceId: '',
        date: selectedDate,
        startTime: '',
        endTime: '',
        name: '',
        purpose: '',
      })

      setShowForm(false)

      // Refresh bookings
      await fetchBookings(selectedDate)
    } catch (err) {
      setError(
        'Unable to create booking. Please make sure the server is running.'
      )
    } finally {
      setBookingLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this booking?'
    )

    if (!confirmCancel) {
      return
    }

    try {
      setError('')
      setMessage('')

      const response = await fetch(
        `${API_URL}/bookings/${bookingId}/cancel`,
        {
          method: 'PATCH',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Unable to cancel booking.')
        return
      }

      setMessage('Booking cancelled successfully.')

      await fetchBookings(selectedDate)
    } catch (err) {
      setError(
        'Unable to cancel booking. Please make sure the server is running.'
      )
    }
  }

  const openBookingForm = () => {
    setError('')
    setMessage('')

    setFormData({
      resourceId: '',
      date: selectedDate,
      startTime: '',
      endTime: '',
      name: '',
      purpose: '',
    })

    setShowForm(true)
  }

  const getResourceName = (resourceId) => {
    const resource = resources.find(
      (item) => Number(item.id) === Number(resourceId)
    )

    return resource ? resource.name : 'Unknown Resource'
  }

  return (
    <div className="app">

      {/* Header */}
      <header className="header">
        <div>
          <h1>BookIt</h1>
          <p>Shared Resource Booking</p>
        </div>

        <button
          className="primary-btn"
          onClick={openBookingForm}
        >
          + New Booking
        </button>
      </header>

      <main className="container">

        {/* Welcome */}
        <section className="welcome">
          <div>
            <h2>Manage your shared resources</h2>
            <p>
              Book meeting rooms and equipment without double-booking.
            </p>
          </div>
        </section>

        {/* Messages */}
        {message && (
          <div className="success-message">
            {message}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Booking Form */}
        {showForm && (
          <section className="booking-form-card">

            <div className="form-header">
              <div>
                <h2>Create New Booking</h2>
                <p>Enter the booking details below.</p>
              </div>

              <button
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                {/* Resource */}
                <div className="form-group">
                  <label>Resource</label>

                  <select
                    name="resourceId"
                    value={formData.resourceId}
                    onChange={handleChange}
                  >
                    <option value="">Select a resource</option>

                    {resources.map((resource) => (
                      <option
                        key={resource.id}
                        value={resource.id}
                      >
                        {resource.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="form-group">
                  <label>Date</label>

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>

                {/* Start Time */}
                <div className="form-group">
                  <label>Start Time</label>

                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                  />
                </div>

                {/* End Time */}
                <div className="form-group">
                  <label>End Time</label>

                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                  />
                </div>

                {/* Name */}
                <div className="form-group">
                  <label>Your Name</label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                {/* Purpose */}
                <div className="form-group">
                  <label>Purpose</label>

                  <input
                    type="text"
                    name="purpose"
                    placeholder="Meeting, presentation..."
                    value={formData.purpose}
                    onChange={handleChange}
                  />
                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={bookingLoading}
                >
                  {bookingLoading
                    ? 'Creating...'
                    : 'Create Booking'}
                </button>

              </div>

            </form>
          </section>
        )}

        {/* Resources */}
        <section className="section">

          <div className="section-header">
            <div>
              <h2>Available Resources</h2>
              <p>Select a resource to view its bookings.</p>
            </div>
          </div>

          <div className="resource-grid">

            {loading ? (
              <p>Loading resources...</p>
            ) : (
              resources.map((resource) => (
                <div
                  className="resource-card"
                  key={resource.id}
                >

                  <div className="resource-icon">
                    {resourceIcons[resource.name] || '📦'}
                  </div>

                  <div>
                    <h3>{resource.name}</h3>
                    <p>Available for booking</p>
                  </div>

                  <button
                    className="view-btn"
                    onClick={() => {
                      setError('')
                      setMessage('')
                    }}
                  >
                    View
                  </button>

                </div>
              ))
            )}

          </div>

        </section>

        {/* Bookings */}
        <section className="section">

          <div className="section-header">

            <div>
              <h2>Bookings</h2>
              <p>Check scheduled bookings for the selected date.</p>
            </div>

            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={handleDateChange}
            />

          </div>

          {bookings.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">📅</div>

              <h3>No bookings yet</h3>

              <p>
                There are no bookings for the selected date.
              </p>

              <button
                className="primary-btn"
                onClick={openBookingForm}
              >
                Create First Booking
              </button>

            </div>

          ) : (

            <div className="bookings-list">

              {bookings.map((booking) => (

                <div
                  className={`booking-card ${
                    booking.status === 'cancelled'
                      ? 'booking-cancelled'
                      : ''
                  }`}
                  key={booking.id}
                >

                  <div className="booking-info">

                    <div className="booking-resource">
                      <span className="booking-icon">
                        {resourceIcons[
                          getResourceName(booking.resourceId)
                        ] || '📦'}
                      </span>

                      <div>
                        <h3>
                          {getResourceName(booking.resourceId)}
                        </h3>

                        <p>
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="booking-details">
                      <p>
                        <strong>Booked by:</strong> {booking.name}
                      </p>

                      <p>
                        <strong>Purpose:</strong> {booking.purpose}
                      </p>
                    </div>

                  </div>

                  <div className="booking-actions">

                    <span
                      className={`status-badge ${
                        booking.status === 'cancelled'
                          ? 'cancelled'
                          : 'confirmed'
                      }`}
                    >
                      {booking.status}
                    </span>

                    {booking.status === 'confirmed' && (
                      <button
                        className="cancel-booking-btn"
                        onClick={() =>
                          handleCancelBooking(booking.id)
                        }
                      >
                        Cancel Booking
                      </button>
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  )
}

export default App