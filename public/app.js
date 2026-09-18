const resourceIcons = {
  'Meeting Room 1': '🏢',
  'Meeting Room 2': '🏢',
  Projector: '📽️',
  'Camera Kit': '📷',
  'Demo Laptop': '💻'
};

const state = {
  resources: [],
  bookings: [],
  selectedDate: '',
  formOpen: false,
  currentView: 'dashboard'
};

const resourceList = document.getElementById('resource-list');
const bookingList = document.getElementById('bookings-list');
const bookingDateInput = document.getElementById('booking-date');
const messageBox = document.getElementById('message-box');
const bookingFormPanel = document.getElementById('booking-form-panel');
const bookingForm = document.getElementById('booking-form');
const resourceSelect = document.getElementById('resourceId');
const dashboardDate = document.getElementById('dashboard-date');
const dashboardResourceCount = document.getElementById('dashboard-resource-count');
const dashboardBookingCount = document.getElementById('dashboard-booking-count');
const dashboardConfirmedCount = document.getElementById('dashboard-confirmed-count');
const dashboardMostBooked = document.getElementById('dashboard-most-booked');
const dashboardCancelledCount = document.getElementById('dashboard-cancelled-count');
const dashboardUpcomingCount = document.getElementById('dashboard-upcoming-count');

const api = {
  resources: '/api/resources',
  bookings: '/api/bookings',
  cancel: (id) => `/api/bookings/${id}/cancel`
};

function setMessage(type, text) {
  messageBox.innerHTML = `<div class="${type}-message">${text}</div>`;
}

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function applyDateRestrictions() {
  const minDate = getToday();
  bookingDateInput.min = minDate;
  document.getElementById('date').min = minDate;
}

function getResourceName(resourceId) {
  const resource = state.resources.find((item) => Number(item.id) === Number(resourceId));
  return resource ? resource.name : 'Unknown Resource';
}

function renderDashboard() {
  const confirmedBookings = state.bookings.filter((booking) => booking.status === 'confirmed');
  const cancelledBookings = state.bookings.filter((booking) => booking.status === 'cancelled');
  const bookedResources = new Set(confirmedBookings.map((booking) => Number(booking.resourceId)));
  const resourceUsage = {};

  confirmedBookings.forEach((booking) => {
    const resourceId = Number(booking.resourceId);
    resourceUsage[resourceId] = (resourceUsage[resourceId] || 0) + 1;
  });

  const mostBookedEntry = Object.entries(resourceUsage).sort((a, b) => b[1] - a[1])[0];
  const mostBookedResource = mostBookedEntry ? getResourceName(mostBookedEntry[0]) : 'None';
  const today = getToday();
  const upcomingCount = state.bookings.filter((booking) => booking.status === 'confirmed' && booking.date >= today).length;
  const date = new Date(`${state.selectedDate}T00:00:00`);

  dashboardDate.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  dashboardResourceCount.textContent = state.resources.length;
  dashboardBookingCount.textContent = state.bookings.length;
  dashboardConfirmedCount.textContent = confirmedBookings.length;
  dashboardMostBooked.textContent = mostBookedResource;
  dashboardCancelledCount.textContent = cancelledBookings.length;
  dashboardUpcomingCount.textContent = upcomingCount;
}

async function fetchResources() {
  const response = await fetch(api.resources);
  const data = await response.json();
  state.resources = data;
  populateResourceSelect();
  renderResources();
  renderDashboard();
}

function populateResourceSelect() {
  resourceSelect.innerHTML = '<option value="">Select a resource</option>' +
    state.resources.map((resource) => `<option value="${resource.id}">${resource.name}</option>`).join('');
}

async function fetchBookings(date) {
  const response = await fetch(`${api.bookings}?date=${date}`);
  const data = await response.json();
  state.bookings = response.ok ? data : [];
  renderBookings();
  renderDashboard();
}

function renderResources() {
  resourceList.innerHTML = state.resources.map((resource) => `
    <div class="resource-card">
      <div class="resource-icon">${resourceIcons[resource.name] || '📦'}</div>
      <div>
        <h4>${resource.name}</h4>
        <p>Available for booking</p>
      </div>
      <button type="button" data-resource-id="${resource.id}">Book</button>
    </div>
  `).join('');
}

function renderBookings() {
  if (!state.bookings.length) {
    bookingList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📅</div>
        <h4>No bookings yet</h4>
        <p>There are no bookings for the selected date.</p>
        <button type="button" class="primary-btn" id="empty-booking-btn">Create First Booking</button>
      </div>
    `;

    const emptyBtn = document.getElementById('empty-booking-btn');
    if (emptyBtn) emptyBtn.addEventListener('click', openForm);
    return;
  }

  bookingList.innerHTML = state.bookings.map((booking) => `
    <div class="booking-item ${booking.status === 'cancelled' ? 'cancelled-item' : ''}">
      <div class="booking-main">
        <div class="booking-icon">${resourceIcons[getResourceName(booking.resourceId)] || '📦'}</div>
        <div class="booking-details">
          <h4>${getResourceName(booking.resourceId)}</h4>
          <p>${booking.startTime} - ${booking.endTime}</p>
        </div>
      </div>

      <div class="booking-details">
        <p><strong>Booked by:</strong> ${booking.name}</p>
        <p><strong>Purpose:</strong> ${booking.purpose}</p>
      </div>

      <div class="booking-actions">
        <span class="status-badge ${booking.status}">${booking.status}</span>
        ${booking.status === 'confirmed' ? `<button type="button" class="cancel-booking-btn" data-booking-id="${booking.id}">Cancel Booking</button>` : ''}
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.cancel-booking-btn').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = Number(button.dataset.bookingId);
      const response = await fetch(api.cancel(id), { method: 'PATCH' });
      const data = await response.json();

      if (!response.ok) {
        setMessage('error-message', data.message || 'Unable to cancel booking.');
        return;
      }

      setMessage('success-message', 'Booking cancelled successfully.');
      await fetchBookings(state.selectedDate);
    });
  });
}

function openForm() {
  bookingFormPanel.classList.remove('hidden');
  state.formOpen = true;
  const dateField = document.getElementById('date');
  const today = getToday();
  dateField.min = today;
  if (!dateField.value || dateField.value < today) dateField.value = state.selectedDate || today;
  bookingFormPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeForm() {
  bookingFormPanel.classList.add('hidden');
  state.formOpen = false;
  bookingForm.reset();
  const today = state.selectedDate || getToday();
  document.getElementById('date').value = today;
}

bookingForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = {
    resourceId: Number(document.getElementById('resourceId').value),
    date: document.getElementById('date').value,
    startTime: document.getElementById('startTime').value,
    endTime: document.getElementById('endTime').value,
    name: document.getElementById('name').value,
    purpose: document.getElementById('purpose').value
  };

  if (!formData.resourceId || !formData.date || !formData.startTime || !formData.endTime || !formData.name || !formData.purpose) {
    setMessage('error-message', 'Please fill in all booking fields.');
    return;
  }

  if (formData.startTime >= formData.endTime) {
    setMessage('error-message', 'End time must be later than start time.');
    return;
  }

  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  const data = await response.json();

  if (!response.ok) {
    setMessage('error-message', data.message || 'Unable to create booking.');
    return;
  }

  setMessage('success-message', 'Booking created successfully.');
  closeForm();
  fetchBookings(state.selectedDate);
});

function showView(viewName) {
  state.currentView = viewName;
  document.querySelectorAll('.page-view').forEach((page) => {
    page.classList.toggle('active', page.id === `${viewName}-page`);
  });

  document.querySelectorAll('.nav-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === viewName);
  });

}

document.getElementById('new-booking-btn').addEventListener('click', openForm);
document.getElementById('close-form-btn').addEventListener('click', closeForm);
document.getElementById('cancel-form-btn').addEventListener('click', closeForm);
document.querySelectorAll('.nav-btn').forEach((button) => {
  button.addEventListener('click', () => showView(button.dataset.view));
});

bookingDateInput.addEventListener('change', (event) => {
  state.selectedDate = event.target.value;
  fetchBookings(state.selectedDate);
});

resourceList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-resource-id]');
  if (!button) return;

  const resourceId = Number(button.dataset.resourceId);
  const resource = state.resources.find((item) => Number(item.id) === resourceId);
  if (!resource) return;

  openForm();
  resourceSelect.value = String(resourceId);
  const dateField = document.getElementById('date');
  if (!dateField.value) {
    dateField.value = state.selectedDate || getToday();
  }
});

async function init() {
  state.selectedDate = getToday();
  applyDateRestrictions();
  bookingDateInput.value = state.selectedDate;
  document.getElementById('date').value = state.selectedDate;
  await fetchResources();
  await fetchBookings(state.selectedDate);
  showView(state.currentView);
}

init();
