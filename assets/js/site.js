const SiteData = {
    content: null,
    doctors: null,
    reviews: null,
    loaded: false,

    async load() {
        if (this.loaded) {
            return this;
        }

        const paths = [
            'data/site_content.json',
            'data/doctors.json',
            'data/reviews.json'
        ];

        const responses = await Promise.all(paths.map(path => fetch(path)));
        this.content = await responses[0].json();
        this.doctors = await responses[1].json();
        this.reviews = await responses[2].json();
        this.loaded = true;
        return this;
    },

    get(key, fallback = '') {
        return this.content && this.content[key] !== undefined ? this.content[key] : fallback;
    },

    escapeHtml(text) {
        if (text === undefined || text === null) {
            return '';
        }
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    setText(selector, value) {
        const el = document.querySelector(selector);
        if (el) el.textContent = value;
    },

    setHTML(selector, html) {
        const el = document.querySelector(selector);
        if (el) el.innerHTML = html;
    },

    applyContentBindings() {
        document.querySelectorAll('[data-content-key]').forEach((element) => {
            const key = element.dataset.contentKey;
            if (!key) return;
            const value = this.get(key, '');
            if (element.dataset.contentHtml === 'true') {
                element.innerHTML = value;
            } else {
                element.textContent = value;
            }
        });
        document.querySelectorAll('[data-content-href]').forEach((element) => {
            const key = element.dataset.contentKey;
            const attr = element.dataset.contentHref;
            if (!key || !attr) return;
            const value = this.get(key, '');
            element.setAttribute(attr, value);
        });
    },

    renderStars(rating) {
        const count = parseInt(rating, 10) || 0;
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += i <= count
                ? '<i class="fas fa-star text-warning"></i>'
                : '<i class="far fa-star text-warning"></i>';
        }
        return html;
    },

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    initPage(pageName) {
        this.load()
            .then(() => {
                this.applyContentBindings();
                const pageInit = this[`init${pageName.charAt(0).toUpperCase() + pageName.slice(1)}`];
                if (typeof pageInit === 'function') {
                    pageInit();
                }
            })
            .catch((error) => {
                console.error('Unable to load site data:', error);
            });
    },

    initIndex() {
        this.setText('#heroClinicName', this.get('clinic_name'));
        this.setText('#heroTagline', this.get('clinic_tagline'));
        this.setText('#heroIntro', this.get('clinic_intro'));
        this.setText('#aboutPreviewText', this.get('clinic_intro').slice(0, 300) + '...');
        this.setText('#statPatients', this.get('happy_patients', '5000'));
        this.setText('#statYears', this.get('years_experience', '15'));
        this.setText('#statConsultations', this.get('successful_consultations', '12000'));

        const doctorList = document.querySelector('#homeDoctorsList');
        if (doctorList && Array.isArray(this.doctors)) {
            doctorList.innerHTML = this.doctors.slice(0, 2).map((doctor) => {
                return `
                    <div class="col-lg-6" data-aos="fade-up">
                        <div class="doctor-card">
                            <div class="doctor-card-img">
                                <img src="assets/images/${doctor.photo || 'default-doctor.svg'}" alt="${this.escapeHtml(doctor.name)}" loading="lazy">
                                <span class="experience-badge">${this.escapeHtml(doctor.experience)}</span>
                            </div>
                            <div class="doctor-card-body">
                                <span class="specialty-badge">${this.escapeHtml(doctor.specialization)}</span>
                                <h4>${this.escapeHtml(doctor.name)}</h4>
                                <p class="doctor-schedule"><i class="fas fa-clock"></i> ${this.escapeHtml(doctor.schedule_days)} | ${this.escapeHtml(doctor.schedule_time)}</p>
                                <a href="doctors.html" class="btn btn-outline-primary btn-sm">View Profile</a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        const reviewCarousel = document.querySelector('#homeReviewCarousel');
        if (reviewCarousel && Array.isArray(this.reviews)) {
            reviewCarousel.innerHTML = this.reviews.slice(0, 4).map((review, index) => {
                return `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                        <div class="testimonial-card">
                            <div class="quote-icon"><i class="fas fa-quote-left"></i></div>
                            <div class="testimonial-rating">${this.renderStars(review.rating)}</div>
                            <p class="testimonial-text">"${this.escapeHtml(review.comment)}"</p>
                            <div class="testimonial-author">
                                <div class="author-avatar"><i class="fas fa-user"></i></div>
                                <div>
                                    <h5>${this.escapeHtml(review.reviewer_name)}</h5>
                                    <span>${this.formatDate(review.review_date)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    },

    initAbout() {
        this.setText('#aboutHistory', this.get('clinic_history'));
        this.setText('#aboutMission', this.get('clinic_mission'));
        this.setText('#aboutVision', this.get('clinic_vision'));
        this.setText('#aboutWhyChoose', this.get('clinic_why_choose'));
        this.setText('#aboutFacilities', this.get('clinic_facilities'));
        this.setText('#aboutPatientCentered', this.get('clinic_patient_centered'));
    },

    initServices() {
        this.setText('#servicePediatricTitle', this.get('pediatric_title', 'Pediatric Services'));
        this.setText('#servicePediatricDescription', this.get('pediatric_description', 'Comprehensive healthcare for infants, children, and adolescents.'));
        this.setText('#serviceObgynTitle', this.get('obgyn_title', 'OB-GYN Services'));
        this.setText('#serviceObgynDescription', this.get('obgyn_description', 'Specialized women\'s healthcare and maternal services.'));

        const pediatricServices = (this.get('pediatric_services') || '').split(/\r?\n/).filter(Boolean);
        const obgynServices = (this.get('obgyn_services') || '').split(/\r?\n/).filter(Boolean);

        const pediatricList = document.querySelector('#pediatricServiceList');
        if (pediatricList) {
            pediatricList.innerHTML = pediatricServices.map(item => `<li><i class="fas fa-check-circle"></i> ${this.escapeHtml(item)}</li>`).join('');
        }

        const obgynList = document.querySelector('#obgynServiceList');
        if (obgynList) {
            obgynList.innerHTML = obgynServices.map(item => `<li><i class="fas fa-check-circle"></i> ${this.escapeHtml(item)}</li>`).join('');
        }
    },

    initDoctors() {
        const doctorsContainer = document.querySelector('#doctorsList');
        const searchInput = document.querySelector('#doctorSearch');
        const filterSelect = document.querySelector('#specializationFilter');

        if (!doctorsContainer) return;

        const render = () => {
            const query = searchInput?.value.trim().toLowerCase() || '';
            const specialization = filterSelect?.value || '';
            const filtered = this.doctors.filter((doctor) => {
                const matchesSearch = query === '' || doctor.name.toLowerCase().includes(query) || doctor.specialization.toLowerCase().includes(query);
                const matchesSpec = specialization === '' || doctor.specialization === specialization;
                return matchesSearch && matchesSpec;
            });

            doctorsContainer.innerHTML = filtered.map((doctor, index) => {
                const services = (doctor.services || '').split(',').map(item => `<li>${this.escapeHtml(item.trim())}</li>`).join('');
                const education = (doctor.education || '').split(/\r?\n/).filter(Boolean).map(item => `<li>${this.escapeHtml(item.trim())}</li>`).join('');
                return `
                    <div class="doctor-profile-card mb-5" data-aos="fade-up" data-aos-delay="${index * 100}">
                        <div class="row g-0">
                            <div class="col-lg-4">
                                <div class="doctor-profile-img">
                                    <img src="assets/images/${doctor.photo || 'default-doctor.svg'}" alt="${this.escapeHtml(doctor.name)}" loading="lazy">
                                    <div class="doctor-badges">
                                        <span class="badge bg-primary">${this.escapeHtml(doctor.specialization)}</span>
                                        <span class="badge bg-success">${this.escapeHtml(doctor.experience)}</span>
                                    </div>
                                    <span class="status-badge status-${doctor.status}">${this.escapeHtml(doctor.status.replace(/_/g, ' '))}</span>
                                </div>
                            </div>
                            <div class="col-lg-8">
                                <div class="doctor-profile-body">
                                    <h2>${this.escapeHtml(doctor.name)}</h2>
                                    <p class="specialization"><i class="fas fa-stethoscope"></i> ${this.escapeHtml(doctor.specialization)}</p>
                                    <div class="profile-section">
                                        <h5><i class="fas fa-graduation-cap"></i> Education</h5>
                                        <ul>${education}</ul>
                                    </div>
                                    <div class="profile-section">
                                        <h5><i class="fas fa-briefcase"></i> Professional Background</h5>
                                        <p>${this.escapeHtml(doctor.profile_description)}</p>
                                    </div>
                                    <div class="profile-section">
                                        <h5><i class="fas fa-shield-alt"></i> Why Patients Trust This Doctor</h5>
                                        <ul class="trust-list">${(doctor.credibility_description || '').split(/\r?\n/).filter(Boolean).map(item => `<li><i class="fas fa-check-circle text-success"></i> ${this.escapeHtml(item.trim())}</li>`).join('')}</ul>
                                    </div>
                                    <div class="row g-3 mt-2">
                                        <div class="col-md-6">
                                            <div class="info-box">
                                                <h6><i class="fas fa-clock"></i> Availability</h6>
                                                <p>${this.escapeHtml(doctor.schedule_days)}</p>
                                                <p class="text-primary fw-bold">${this.escapeHtml(doctor.schedule_time)}</p>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="info-box">
                                                <h6><i class="fas fa-list"></i> Services</h6>
                                                <ul class="services-list">${services}</ul>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="satisfaction-indicator mt-3">
                                        <i class="fas fa-star text-warning"></i>
                                        <span>High Patient Satisfaction</span>
                                    </div>
                                    <a href="appointment.html?doctor=${doctor.id}" class="btn btn-primary mt-3">
                                        <i class="fas fa-calendar-check me-2"></i>Book with ${this.escapeHtml(doctor.name.split(' ').slice(-1)[0] || doctor.name)}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        };

        const specializations = Array.from(new Set(this.doctors.map(d => d.specialization))).sort();
        if (filterSelect) {
            filterSelect.innerHTML = `<option value="">All Specialties</option>${specializations.map(spec => `<option value="${this.escapeHtml(spec)}">${this.escapeHtml(spec)}</option>`).join('')}`;
            filterSelect.addEventListener('change', render);
        }
        if (searchInput) {
            searchInput.addEventListener('input', render);
        }

        render();
    },

    initAppointment() {
        const doctorSelect = document.querySelector('#doctorSelect');
        const appointmentDate = document.querySelector('#appointmentDate');
        const appointmentTime = document.querySelector('#appointmentTime');
        const doctorScheduleInfo = document.querySelector('#doctorScheduleInfo');
        const dateHint = document.querySelector('#dateHint');
        const previewName = document.querySelector('#previewName');
        const previewContact = document.querySelector('#previewContact');
        const previewEmail = document.querySelector('#previewEmail');
        const previewDoctor = document.querySelector('#previewDoctor');
        const previewDate = document.querySelector('#previewDate');
        const previewTime = document.querySelector('#previewTime');
        const previewReason = document.querySelector('#previewReason');
        const form = document.querySelector('#appointmentForm');

        const queryParams = new URLSearchParams(window.location.search);
        const preselectedDoctorId = queryParams.get('doctor');

        if (!doctorSelect) return;

        const availableDoctors = this.doctors.filter(doctor => doctor.status === 'available');
        doctorSelect.innerHTML = `<option value="">Choose a doctor...</option>${availableDoctors.map((doctor) => `
            <option value="${doctor.id}" data-days="${this.escapeHtml(doctor.schedule_days)}" data-time="${this.escapeHtml(doctor.schedule_time)}">
                ${this.escapeHtml(doctor.name)} - ${this.escapeHtml(doctor.specialization)}
            </option>
        `).join('')}`;

        if (preselectedDoctorId) {
            doctorSelect.value = preselectedDoctorId;
        }

        function updateDoctorInfo() {
            const selectedOption = doctorSelect.selectedOptions[0];
            if (!selectedOption || !selectedOption.value) {
                if (doctorScheduleInfo) doctorScheduleInfo.textContent = '';
                if (dateHint) dateHint.textContent = 'Select a doctor to view available schedule.';
                if (appointmentTime) {
                    appointmentTime.innerHTML = '<option value="">Select doctor and date first...</option>';
                    appointmentTime.disabled = true;
                }
                return;
            }
            const days = selectedOption.dataset.days || '';
            const time = selectedOption.dataset.time || '';
            if (doctorScheduleInfo) {
                doctorScheduleInfo.innerHTML = `<i class="fas fa-info-circle"></i> Available: ${SiteData.escapeHtml(days)} | Hours: ${SiteData.escapeHtml(time)}`;
            }
            if (dateHint) {
                dateHint.textContent = `Available on: ${days}`;
                dateHint.className = 'text-muted';
            }
            updateAvailableTimes();
        }

        function updateAvailableTimes() {
            if (!appointmentDate || !appointmentTime) return;
            const selectedOption = doctorSelect.selectedOptions[0];
            if (!selectedOption || !selectedOption.value) {
                appointmentTime.innerHTML = '<option value="">Select doctor first...</option>';
                appointmentTime.disabled = true;
                return;
            }

            if (!appointmentDate.value) {
                appointmentTime.innerHTML = '<option value="">Select a date first...</option>';
                appointmentTime.disabled = true;
                return;
            }

            const selectedDate = new Date(appointmentDate.value);
            const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
            const availableDays = (selectedOption.dataset.days || '').split(',').map(day => day.trim());
            if (!availableDays.includes(dayName)) {
                if (dateHint) {
                    dateHint.textContent = `Warning: ${selectedOption.textContent.trim().split(' - ')[0]} may not be available on ${dayName}.`;
                    dateHint.className = 'text-danger';
                }
            } else if (dateHint) {
                dateHint.textContent = `Available on: ${availableDays.join(', ')}`;
                dateHint.className = 'text-muted';
            }

            const timeSlots = generateTimeSlots(selectedOption.dataset.time || '');
            appointmentTime.innerHTML = timeSlots.length > 0 ? '<option value="">Select a time...</option>' : '<option value="">No slots available</option>';
            timeSlots.forEach((slot) => {
                const option = document.createElement('option');
                option.value = slot;
                option.textContent = slot;
                appointmentTime.appendChild(option);
            });
            appointmentTime.disabled = timeSlots.length === 0;
        }

        function updatePreview() {
            if (!form) return;
            if (previewName) previewName.textContent = form.patient_name?.value || '-';
            if (previewContact) previewContact.textContent = form.contact_number?.value || '-';
            if (previewEmail) previewEmail.textContent = form.email?.value || '-';
            if (previewDoctor) previewDoctor.textContent = doctorSelect.selectedOptions[0]?.textContent?.trim() || '-';
            if (previewDate) previewDate.textContent = appointmentDate?.value || '-';
            if (previewTime) previewTime.textContent = appointmentTime?.value || '-';
            if (previewReason) previewReason.textContent = form.reason?.value || '-';
        }

        function generateTimeSlots(timeRange) {
            const matches = timeRange.match(/(\d{1,2}:\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}:\d{2})\s*(AM|PM)/i);
            if (!matches) return [];
            const start = parseTime(`${matches[1]} ${matches[2]}`);
            const end = parseTime(`${matches[3]} ${matches[4]}`);
            const slots = [];
            let current = start;
            while (current < end) {
                slots.push(formatTime(current));
                current += 30 * 60 * 1000;
            }
            return slots;
        }

        function parseTime(value) {
            const matches = value.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (!matches) return 0;
            let hour = Number(matches[1]);
            const minute = Number(matches[2]);
            const period = matches[3].toUpperCase();
            if (period === 'PM' && hour !== 12) hour += 12;
            if (period === 'AM' && hour === 12) hour = 0;
            return hour * 60 * 60 * 1000 + minute * 60 * 1000;
        }

        function formatTime(ms) {
            const totalMinutes = Math.floor(ms / 60000);
            let hour = Math.floor(totalMinutes / 60);
            const minute = totalMinutes % 60;
            const period = hour >= 12 ? 'PM' : 'AM';
            if (hour === 0) hour = 12;
            if (hour > 12) hour -= 12;
            return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
        }

        if (doctorSelect) {
            doctorSelect.addEventListener('change', () => {
                updateDoctorInfo();
                updatePreview();
            });
        }
        if (appointmentDate) {
            appointmentDate.addEventListener('change', () => {
                updateDoctorInfo();
                updatePreview();
            });
        }
        if (appointmentTime) {
            appointmentTime.addEventListener('change', updatePreview);
        }

        document.querySelectorAll('.next-step').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const current = document.querySelector('.form-step.active');
                const next = current?.nextElementSibling;
                if (current && next && next.classList.contains('form-step')) {
                    current.classList.remove('active');
                    next.classList.add('active');
                }
                if (next?.id === 'step3') updatePreview();
            });
        });

        document.querySelectorAll('.prev-step').forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                const current = document.querySelector('.form-step.active');
                const prev = current?.previousElementSibling;
                if (current && prev && prev.classList.contains('form-step')) {
                    current.classList.remove('active');
                    prev.classList.add('active');
                }
            });
        });

        if (form) {
            const draft = localStorage.getItem('appointmentDraft');
            if (draft) {
                try {
                    const values = JSON.parse(draft);
                    if (values.patientName) form.patient_name.value = values.patientName;
                    if (values.contactNumber) form.contact_number.value = values.contactNumber;
                    if (values.email) form.email.value = values.email;
                    if (values.doctorId) doctorSelect.value = values.doctorId;
                    if (values.appointmentDate) appointmentDate.value = values.appointmentDate;
                    if (values.appointmentTime) appointmentTime.value = values.appointmentTime;
                    if (values.reason) form.reason.value = values.reason;
                } catch (error) {
                    console.warn('Failed to load appointment draft:', error);
                }
            }
            form.addEventListener('submit', () => {
                localStorage.setItem('appointmentDraft', JSON.stringify({
                    patientName: form.patient_name?.value,
                    contactNumber: form.contact_number?.value,
                    email: form.email?.value,
                    doctorId: doctorSelect.value,
                    appointmentDate: appointmentDate?.value,
                    appointmentTime: appointmentTime?.value,
                    reason: form.reason?.value
                }));
            });
        }

        updateDoctorInfo();
        updatePreview();
    },

    initSchedule() {
        const tableBody = document.querySelector('#scheduleTableBody');
        const cardsContainer = document.querySelector('#scheduleCards');
        const statusFilter = document.querySelector('#scheduleStatusFilter');

        const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        const render = () => {
            const filter = statusFilter?.value || 'all';
            const filtered = filter === 'all' ? this.doctors : this.doctors.filter(d => d.status === filter);

            if (tableBody) {
                tableBody.innerHTML = filtered.map((doctor) => {
                    return `
                        <tr>
                            <td>
                                <div class="doctor-cell">
                                    <img src="assets/images/${doctor.photo || 'default-doctor.svg'}" alt="${this.escapeHtml(doctor.name)}" loading="lazy">
                                    <div>
                                        <strong>${this.escapeHtml(doctor.name)}</strong>
                                        <small>${this.escapeHtml(doctor.specialization)}</small>
                                    </div>
                                </div>
                            </td>
                            <td>${this.escapeHtml(doctor.schedule_days)}</td>
                            <td><span class="time-badge">${this.escapeHtml(doctor.schedule_time)}</span></td>
                            <td><span class="status-chip status-${doctor.status}">${this.escapeHtml(doctor.status.replace(/_/g, ' '))}</span></td>
                        </tr>
                    `;
                }).join('');
            }

            if (cardsContainer) {
                cardsContainer.innerHTML = filtered.map((doctor, index) => {
                    const days = doctor.schedule_days.split(',').map(day => day.trim());
                    const statusClass = doctor.status === 'available' ? 'available' : (doctor.status === 'fully_booked' ? 'booked' : 'leave');
                    return `
                        <div class="col-lg-6" data-aos="fade-up" data-aos-delay="${index * 100}">
                            <div class="schedule-card schedule-${statusClass}">
                                <div class="schedule-card-header">
                                    <img src="assets/images/${doctor.photo || 'default-doctor.svg'}" alt="${this.escapeHtml(doctor.name)}" loading="lazy">
                                    <div>
                                        <h4>${this.escapeHtml(doctor.name)}</h4>
                                        <span>${this.escapeHtml(doctor.specialization)}</span>
                                    </div>
                                    <span class="status-chip status-${doctor.status}">${this.escapeHtml(doctor.status.replace(/_/g, ' '))}</span>
                                </div>
                                <div class="schedule-card-body">
                                    <div class="schedule-time-display"><i class="fas fa-clock"></i><span>${this.escapeHtml(doctor.schedule_time)}</span></div>
                                    <div class="schedule-days">
                                        ${allDays.map(day => `<span class="day-pill ${days.includes(day) ? 'active' : ''}">${day.slice(0, 3)}</span>`).join('')}
                                    </div>
                                </div>
                                <div class="schedule-card-footer">
                                    <a href="appointment.html?doctor=${doctor.id}" class="btn btn-primary btn-sm">Book Appointment</a>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        };

        const statuses = ['all', ...Array.from(new Set(this.doctors.map(d => d.status)))];
        if (statusFilter) {
            statusFilter.innerHTML = statuses.map(status => `<option value="${this.escapeHtml(status)}">${status === 'all' ? 'All Statuses' : this.escapeHtml(status.replace(/_/g, ' '))}</option>`).join('');
            statusFilter.addEventListener('change', render);
        }

        render();
    },

    initReviews() {
        const reviewList = document.querySelector('#reviewCards');
        const reviewSort = document.querySelector('#reviewSort');
        const reviewSearch = document.querySelector('#reviewSearch');
        const averageRatingEl = document.querySelector('#averageRating');
        const totalReviewsEl = document.querySelector('#totalReviews');
        const ratingSummary = document.querySelector('#ratingSummary');

        const renderSummary = () => {
            const total = this.reviews.length;
            const average = total === 0 ? 0 : (this.reviews.reduce((sum, review) => sum + Number(review.rating), 0) / total).toFixed(1);
            if (averageRatingEl) averageRatingEl.textContent = average;
            if (totalReviewsEl) totalReviewsEl.textContent = total;
            if (ratingSummary) ratingSummary.innerHTML = this.renderStars(Math.round(average));
        };

        const renderReviews = () => {
            const query = reviewSearch?.value.trim().toLowerCase() || '';
            const sort = reviewSort?.value || 'newest';
            let filtered = [...this.reviews];

            if (query) {
                filtered = filtered.filter((review) => review.reviewer_name.toLowerCase().includes(query) || review.comment.toLowerCase().includes(query));
            }

            if (sort === 'rating_desc') {
                filtered.sort((a, b) => b.rating - a.rating);
            } else if (sort === 'rating_asc') {
                filtered.sort((a, b) => a.rating - b.rating);
            } else {
                filtered.sort((a, b) => new Date(b.review_date) - new Date(a.review_date));
            }

            if (reviewList) {
                reviewList.innerHTML = filtered.map((review) => {
                    return `
                        <div class="col-md-6" data-aos="fade-up">
                            <div class="review-card">
                                <div class="review-card-header">
                                    <div class="author-avatar"><i class="fas fa-user"></i></div>
                                    <div>
                                        <h5>${this.escapeHtml(review.reviewer_name)}</h5>
                                        <span class="review-date">${this.formatDate(review.review_date)}</span>
                                    </div>
                                </div>
                                <div class="review-rating">${this.renderStars(review.rating)}</div>
                                <p class="review-comment">"${this.escapeHtml(review.comment)}"</p>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        };

        if (reviewSort) reviewSort.addEventListener('change', renderReviews);
        if (reviewSearch) reviewSearch.addEventListener('input', renderReviews);

        renderSummary();
        renderReviews();
    },

    initContact() {
        const mapWrapper = document.querySelector('#mapEmbed');
        if (mapWrapper) {
            const mapSrc = this.get('map_embed', 'https://maps.google.com/maps?q=Bontoc+Southern+Leyte&hl=en&z=15&output=embed');
            mapWrapper.innerHTML = `<iframe src="${this.escapeHtml(mapSrc)}" width="100%" height="400" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    if (page) {
        SiteData.initPage(page);
    }
});
