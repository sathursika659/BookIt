import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

const publicDir = path.join(__dirname, 'public');
const bookingsFile = path.join(__dirname, 'server', 'bookings.json');

const resources = [
  { id: 1, name: 'Meeting Room 1' },
  { id: 2, name: 'Meeting Room 2' },
  { id: 3, name: 'Projector' },
  { id: 4, name: 'Camera Kit' },
  { id: 5, name: 'Demo Laptop' }
];

function getBookings() {
  const data = fs.readFileSync(bookingsFile, 'utf8');
  return JSON.parse(data);
}

app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BookIt backend is running!' });
});

app.get('/api/resources', (req, res) => {
  res.json(resources);
});

app.get('/api/bookings', (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ message: 'Please provide a date to view bookings.' });
  }

  const bookings = getBookings();
  const dayBookings = bookings.filter((booking) => booking.date === date);
  res.json(dayBookings);
});

app.post('/api/bookings', (req, res) => {
  const { resourceId, date, startTime, endTime, name, purpose } = req.body;

  if (!resourceId || !date || !startTime || !endTime || !name || !purpose) {
    return res.status(400).json({ message: 'All booking fields are required.' });
  }

  const resource = resources.find((item) => item.id === Number(resourceId));
  if (!resource) {
    return res.status(400).json({ message: 'Selected resource does not exist.' });
  }

  if (!name.trim()) {
    return res.status(400).json({ message: 'Please enter your name.' });
  }

  if (!purpose.trim()) {
    return res.status(400).json({ message: 'Please enter the booking purpose.' });
  }

  if (startTime >= endTime) {
    return res.status(400).json({ message: 'End time must be later than start time.' });
  }

  const bookings = getBookings();

  const overlappingBooking = bookings.find((booking) =>
    Number(booking.resourceId) === Number(resourceId) &&
    booking.date === date &&
    booking.status === 'confirmed' &&
    startTime <= booking.endTime &&
    endTime >= booking.startTime
  );

  if (overlappingBooking) {
    return res.status(409).json({
      message: `${resource.name} is already booked on ${date} from ${overlappingBooking.startTime} to ${overlappingBooking.endTime}.`
    });
  }

  const newBooking = {
    id: Date.now(),
    resourceId: Number(resourceId),
    date,
    startTime,
    endTime,
    name: name.trim(),
    purpose: purpose.trim(),
    status: 'confirmed'
  };

  bookings.push(newBooking);
  fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));

  res.status(201).json(newBooking);
});

app.patch('/api/bookings/:id/cancel', (req, res) => {
  const bookingId = Number(req.params.id);
  const bookings = getBookings();
  const booking = bookings.find((item) => item.id === bookingId);

  if (!booking) {
    return res.status(404).json({ message: 'Booking not found.' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ message: 'This booking is already cancelled.' });
  }

  booking.status = 'cancelled';
  fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));

  res.json({ message: 'Booking cancelled successfully.', booking });
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`BookIt server running on http://localhost:${PORT}`);
});
