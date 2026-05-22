// Reservation Form Handling — Full-Stack API Integration
document.addEventListener('DOMContentLoaded', () => {
    const reservationForm = document.getElementById('reservationForm');
    const successModal = document.getElementById('successModal');

    if (reservationForm) {
        reservationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Show loading state
            const submitBtn = reservationForm.querySelector('.reserve-btn');
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            // Collect selected occasion pills
            const selectedOccasions = [];
            document.querySelectorAll('.occasion-pill.selected').forEach(pill => {
                selectedOccasions.push(pill.textContent.trim());
            });

            // Collect form data
            const data = {
                fullname: document.getElementById('fullname').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                date: document.getElementById('date').value,
                time: document.getElementById('time').value,
                guests: document.getElementById('guests').value,
                seating: document.getElementById('seating').value,
                occasion: selectedOccasions.join(', '),
                comments: document.getElementById('comments').value
            };

            try {
                const response = await fetch('/api/reservations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    // Show success modal
                    if (successModal) {
                        successModal.classList.add('show');
                    } else {
                        alert('Thank you! Your reservation has been received. A confirmation will be sent to your email.');
                    }
                    reservationForm.reset();
                    // Clear selected occasion pills
                    document.querySelectorAll('.occasion-pill.selected').forEach(pill => {
                        pill.classList.remove('selected');
                    });
                } else {
                    alert(result.message || 'Something went wrong. Please try again.');
                }
            } catch (err) {
                console.error('Reservation error:', err);
                alert('Could not submit reservation. Please check your connection and try again.');
            } finally {
                submitBtn.innerHTML = originalBtnContent;
                submitBtn.disabled = false;
            }
        });
    }

    // Contact form handling (fallback — contact.html has its own inline handler)
    const contactForm = document.getElementById('contactForm');
    if (contactForm && !contactForm.dataset.handled) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                fullname: contactForm.querySelector('[name="fullname"]')?.value || '',
                phone: contactForm.querySelector('[name="phone"]')?.value || '',
                email: contactForm.querySelector('[name="email"]')?.value || '',
                topic: document.querySelector('.topic-pill.active')?.textContent || '',
                message: contactForm.querySelector('[name="message"]')?.value || ''
            };

            try {
                const response = await fetch('/api/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                if (result.success) {
                    alert('Your message has been sent. We will get back to you shortly!');
                    contactForm.reset();
                } else {
                    alert('Something went wrong. Please try again.');
                }
            } catch (err) {
                console.error('Contact form error:', err);
                alert('Could not send message. Please try again.');
            }
        });
    }
});
