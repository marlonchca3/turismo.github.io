'use strict';

const navToggleBtn = document.querySelector('[data-nav-toggle-btn]');
const header = document.querySelector('[data-header]');
const goTopBtn = document.querySelector('[data-go-top]');
const bookingForm = document.querySelector('#booking-form');
const paymentForm = document.querySelector('#payment-form');
const bookingSuccess = document.querySelector('#booking-success');
const packageSelect = document.querySelector('#package-select');
const travelersInput = document.querySelector('#travelers');
const travelDateInput = document.querySelector('#travel-date');

const packages = {
  4: { name: 'Cusco y Machu Picchu esencial', price: 590 },
  7: { name: 'Cusco y Valle Sagrado', price: 890 },
  10: { name: 'Andes, historia y aventura', price: 1290 },
  14: { name: 'Perú clásico', price: 1790 },
  21: { name: 'Perú de punta a punta', price: 2690 }
};

let currentBooking;

function formatPrice(amount) {
  return `US$ ${new Intl.NumberFormat('es-PE').format(amount)}`;
}

function getBookingDetails() {
  const duration = packageSelect.value;
  const selectedPackage = packages[duration];
  const travelers = Number(travelersInput.value);

  if (!selectedPackage || !Number.isInteger(travelers) || travelers < 1 || travelers > 10) {
    return null;
  }

  return {
    duration,
    packageName: selectedPackage.name,
    travelers,
    total: selectedPackage.price * travelers,
    date: travelDateInput.value,
    name: bookingForm.elements.name.value.trim(),
    email: bookingForm.elements.email.value.trim()
  };
}

function updateBookingSummary() {
  const booking = getBookingDetails();
  const summaryPackage = document.querySelector('#summary-package');
  const summaryTravelers = document.querySelector('#summary-travelers');
  const summaryTotal = document.querySelector('#summary-total');

  if (!booking) {
    summaryPackage.textContent = 'Selecciona un paquete';
    summaryTravelers.textContent = `${travelersInput.value || 0} viajeros`;
    summaryTotal.textContent = formatPrice(0);
    return;
  }

  summaryPackage.textContent = `${booking.packageName} · ${booking.duration} días`;
  summaryTravelers.textContent = `${booking.travelers} ${booking.travelers === 1 ? 'viajero' : 'viajeros'}`;
  summaryTotal.textContent = formatPrice(booking.total);
}

function showBookingForm() {
  bookingSuccess.hidden = true;
  paymentForm.hidden = true;
  bookingForm.hidden = false;
  bookingForm.querySelector('button[type="submit"]').focus();
}

if (navToggleBtn && header) {
  navToggleBtn.addEventListener('click', () => {
    const isOpen = navToggleBtn.classList.toggle('active');
    header.classList.toggle('active', isOpen);
    navToggleBtn.setAttribute('aria-expanded', String(isOpen));
    navToggleBtn.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  header.querySelectorAll('.navbar-link, .header-cta').forEach((link) => {
    link.addEventListener('click', () => {
      navToggleBtn.classList.remove('active');
      header.classList.remove('active');
      navToggleBtn.setAttribute('aria-expanded', 'false');
      navToggleBtn.setAttribute('aria-label', 'Abrir menú');
    });
  });
}

if (goTopBtn) {
  window.addEventListener('scroll', () => {
    goTopBtn.classList.toggle('active', window.scrollY >= 500);
  });
}

if (travelDateInput) {
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  travelDateInput.min = localToday;
}

if (bookingForm && paymentForm && bookingSuccess && packageSelect && travelersInput && travelDateInput) {
  packageSelect.addEventListener('change', updateBookingSummary);
  travelersInput.addEventListener('input', updateBookingSummary);

  document.querySelectorAll('[data-package]').forEach((button) => {
    button.addEventListener('click', () => {
      packageSelect.value = button.dataset.package;
      updateBookingSummary();
      document.querySelector('#reservar').scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => packageSelect.focus(), 350);
    });
  });

  bookingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;

    currentBooking = getBookingDetails();
    if (!currentBooking) {
      updateBookingSummary();
      return;
    }

    if (currentBooking.date < travelDateInput.min) {
      travelDateInput.setCustomValidity('Elige hoy o una fecha posterior.');
      travelDateInput.reportValidity();
      travelDateInput.setCustomValidity('');
      return;
    }

    const date = new Date(`${currentBooking.date}T12:00:00`);
    const formattedDate = new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);

    document.querySelector('#order-summary').textContent =
      `${currentBooking.packageName} · ${currentBooking.duration} días | ${currentBooking.travelers} ${currentBooking.travelers === 1 ? 'viajero' : 'viajeros'} | Inicio: ${formattedDate} | Total referencial: ${formatPrice(currentBooking.total)}`;
    bookingForm.hidden = true;
    paymentForm.hidden = false;
    paymentForm.querySelector('button[type="submit"]').focus();
  });

  paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!currentBooking) {
      showBookingForm();
      return;
    }

    const reference = `DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const paymentMethod = new FormData(paymentForm).get('payment-method');
    document.querySelector('#success-message').textContent =
      `${currentBooking.name}, tu solicitud de prueba para ${currentBooking.packageName} se completó con ${paymentMethod}. Referencia: ${reference}.`;
    paymentForm.hidden = true;
    bookingSuccess.hidden = false;
    bookingSuccess.focus();
  });

  document.querySelector('#back-to-booking').addEventListener('click', () => {
    paymentForm.hidden = true;
    bookingForm.hidden = false;
    packageSelect.focus();
  });

  document.querySelector('#new-booking').addEventListener('click', () => {
    currentBooking = null;
    bookingForm.reset();
    travelersInput.value = '2';
    updateBookingSummary();
    showBookingForm();
  });

  updateBookingSummary();
}

document.querySelector('#current-year').textContent = String(new Date().getFullYear());