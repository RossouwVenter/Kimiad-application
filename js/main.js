/* ===================================================
   Kimiad Golf & Leisure — Main JavaScript
   Booking form, navigation, and interactive features
   =================================================== */

(function () {
    'use strict';

    // --- Navigation scroll effect ---
    var nav = document.getElementById('nav');
    if (nav) {
        window.addEventListener('scroll', function () {
            nav.classList.toggle('nav--scrolled', window.scrollY > 50);
        });
    }

    // --- Mobile nav toggle ---
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            var isOpen = navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isOpen);
        });

        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // --- Populate tee time options (7:00 AM to 4:00 PM, 10-min intervals) ---
    var timeSelect = document.getElementById('bookTime');
    if (timeSelect) {
        for (var h = 7; h <= 16; h++) {
            for (var m = 0; m < 60; m += 10) {
                if (h === 16 && m > 0) break;
                var hour = h.toString().padStart(2, '0');
                var min = m.toString().padStart(2, '0');
                var timeValue = hour + ':' + min;

                var displayHour = h > 12 ? h - 12 : h;
                var ampm = h >= 12 ? 'PM' : 'AM';
                var displayTime = displayHour + ':' + min + ' ' + ampm;

                var option = document.createElement('option');
                option.value = timeValue;
                option.textContent = displayTime;
                timeSelect.appendChild(option);
            }
        }
    }

    // --- Set minimum date to today ---
    var dateInput = document.getElementById('bookDate');
    if (dateInput) {
        var today = new Date();
        var yyyy = today.getFullYear();
        var mm = (today.getMonth() + 1).toString().padStart(2, '0');
        var dd = today.getDate().toString().padStart(2, '0');
        dateInput.setAttribute('min', yyyy + '-' + mm + '-' + dd);
    }

    // --- Auth-aware navigation ---
    var navAuth = document.getElementById('navAuth');
    if (navAuth) {
        fetch('/api/me')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data.user) {
                    navAuth.innerHTML =
                        '<a href="/my-bookings" style="margin-right:0.75rem;">My Bookings</a>' +
                        '<a href="#" id="logoutNav">Log Out</a>';
                    document.getElementById('logoutNav').addEventListener('click', function (e) {
                        e.preventDefault();
                        fetch('/api/logout', { method: 'POST' }).then(function () { location.reload(); });
                    });
                    // Auto-fill booking form from profile
                    var nameField = document.getElementById('bookName');
                    var emailField = document.getElementById('bookEmail');
                    if (nameField && !nameField.value) nameField.value = data.user.name || '';
                    if (emailField && !emailField.value) emailField.value = data.user.email || '';
                } else {
                    navAuth.innerHTML = '<a href="/login">Login</a>';
                }
            })
            .catch(function () {
                navAuth.innerHTML = '<a href="/login">Login</a>';
            });
    }

    // --- Booking form handling ---
    var bookingForm = document.getElementById('bookingForm');
    var bookingConfirmation = document.getElementById('bookingConfirmation');

    if (bookingForm && bookingConfirmation) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Clear previous errors
            bookingForm.querySelectorAll('.error').forEach(function (el) {
                el.classList.remove('error');
            });

            // Validate required fields
            var isValid = true;
            var requiredFields = bookingForm.querySelectorAll('[required]');

            requiredFields.forEach(function (field) {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                }
            });

            // Validate email format
            var emailField = document.getElementById('bookEmail');
            if (emailField && emailField.value) {
                var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(emailField.value)) {
                    emailField.classList.add('error');
                    isValid = false;
                }
            }

            if (!isValid) return;

            // Collect form data
            var formData = {
                name: document.getElementById('bookName').value.trim(),
                email: document.getElementById('bookEmail').value.trim(),
                phone: document.getElementById('bookPhone').value.trim(),
                course: document.getElementById('bookCourse').value,
                date: document.getElementById('bookDate').value,
                time: document.getElementById('bookTime').value,
                players: document.getElementById('bookPlayers').value,
                notes: document.getElementById('bookNotes').value.trim()
            };

            // Send booking to API
            fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                bookingForm.hidden = true;
                bookingConfirmation.hidden = false;
            })
            .catch(function () {
                alert('Could not complete booking. Please try again.');
            });
        });
    }

    // --- Book another button ---
    var bookAnotherBtn = document.getElementById('bookAnother');
    if (bookAnotherBtn && bookingForm && bookingConfirmation) {
        bookAnotherBtn.addEventListener('click', function () {
            bookingForm.reset();
            bookingForm.hidden = false;
            bookingConfirmation.hidden = true;
        });
    }

    // --- Hero image slideshow ---
    var heroSlides = document.querySelectorAll('.hero__slide');
    if (heroSlides.length > 1) {
        var currentSlide = 0;
        setInterval(function () {
            heroSlides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % heroSlides.length;
            heroSlides[currentSlide].classList.add('active');
        }, 5000);
    }

    // --- Footer year ---
    var yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var navHeight = nav ? nav.offsetHeight : 0;
                var targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

})();
