// API Configuration
const API_BASE_URL = '/api';

// Global State
let currentUser = null;
let authToken = null;
let activeTrip = null;
let countdownInterval = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkBackendConnection();
    checkAuthStatus();
    setupTabSwitching();
    loadContacts();
    checkActiveTrip();
});

// Check if backend is accessible
async function checkBackendConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
            showBackendError('Backend is not responding properly. Please check if the server is running.');
        }
    } catch (error) {
        showBackendError(`Cannot connect to backend at ${API_BASE_URL.replace('/api', '')}. 
            Make sure: 
            1. Flask server is running (cd backend && python app.py)
            2. MongoDB is running
            3. Backend is accessible on port 5000`);
        console.error('Backend connection error:', error);
    }
}

function showBackendError(message) {
    // Create or update error banner
    let errorBanner = document.getElementById('backend-error-banner');
    if (!errorBanner) {
        errorBanner = document.createElement('div');
        errorBanner.id = 'backend-error-banner';
        errorBanner.className = 'backend-error-banner';
        document.body.insertBefore(errorBanner, document.body.firstChild);
    }
    errorBanner.innerHTML = `
        <div class="error-banner-content">
            <strong>⚠️ Backend Connection Error:</strong> ${message}
            <button onclick="this.parentElement.parentElement.style.display='none'" class="error-close">×</button>
        </div>
    `;
    errorBanner.style.display = 'block';
}

// Helper function for better error messages
function getNetworkErrorMessage(error) {
    console.error('Network error:', error);
    if (error.message && error.message.includes('Failed to fetch')) {
        return `Cannot connect to backend server. Please ensure:
        1. Flask backend is running (python backend/app.py)
        2. Backend is accessible at http://localhost:5000
        3. You're opening the frontend through a web server (not file://)`;
    }
    return `Network error: ${error.message || 'Unknown error'}. Please check if the backend is running.`;
}

// ==================== AUTHENTICATION ====================

function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        showMainScreen();
    } else {
        showAuthScreen();
    }
}

function showAuthScreen() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('main-screen').classList.add('hidden');
}

function showMainScreen() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-screen').classList.remove('hidden');
    document.getElementById('user-name').textContent = currentUser.name;
}

function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // Update tab buttons
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update forms
            document.getElementById('login-form').classList.toggle('active', tab === 'login');
            document.getElementById('signup-form').classList.toggle('active', tab === 'signup');
            
            // Clear errors
            document.getElementById('login-error').textContent = '';
            document.getElementById('signup-error').textContent = '';
        });
    });
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    errorDiv.textContent = '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showMainScreen();
            checkActiveTrip();
            loadContacts();
        } else {
            errorDiv.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        errorDiv.textContent = getNetworkErrorMessage(error);
    }
}

async function handleSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const errorDiv = document.getElementById('signup-error');

    errorDiv.textContent = '';

    // Validation
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name || !nameRegex.test(name)) {
        errorDiv.textContent = 'Invalid username: Only letters and spaces allowed.';
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errorDiv.textContent = 'Invalid email: Please enter a valid email address.';
        return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password || !passwordRegex.test(password)) {
        errorDiv.textContent = 'Invalid password: Must be at least 8 characters with uppercase, lowercase, number, and special character.';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            showMainScreen();
            checkActiveTrip();
            loadContacts();
        } else {
            errorDiv.textContent = data.error || 'Signup failed';
        }
    } catch (error) {
        errorDiv.textContent = getNetworkErrorMessage(error);
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
    activeTrip = null;
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    showAuthScreen();
}

// ==================== TRIP MANAGEMENT ====================

async function checkActiveTrip() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/trip/active`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok && data.trip) {
            activeTrip = data.trip;
            showActiveTripView();
            startCountdown();
        } else {
            activeTrip = null;
            showNoTripView();
        }
    } catch (error) {
        console.error('Error checking active trip:', error);
    }
}

async function handleStartTrip(event) {
    event.preventDefault();
    const destination = document.getElementById('trip-destination').value;
    const intervalMinutes = parseInt(document.getElementById('trip-interval').value);
    const errorDiv = document.getElementById('trip-error');
    
    errorDiv.textContent = '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/trip`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ destination, interval_minutes: intervalMinutes })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            activeTrip = data.trip;
            document.getElementById('trip-form').reset();
            showActiveTripView();
            startCountdown();
        } else {
            errorDiv.textContent = data.error || 'Failed to start trip';
        }
    } catch (error) {
        errorDiv.textContent = getNetworkErrorMessage(error);
    }
}

function showNoTripView() {
    document.getElementById('no-trip-view').classList.remove('hidden');
    document.getElementById('active-trip-view').classList.add('hidden');
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function showActiveTripView() {
    document.getElementById('no-trip-view').classList.add('hidden');
    document.getElementById('active-trip-view').classList.remove('hidden');
    
    if (activeTrip) {
        document.getElementById('trip-destination-display').textContent = activeTrip.destination;
        updateNextCheckDue();
    }
}

function updateNextCheckDue() {
    if (!activeTrip) return;
    
    const nextCheckDue = new Date(activeTrip.next_check_due);
    document.getElementById('next-check-due').textContent = formatDateTime(nextCheckDue);
}

function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
        if (!activeTrip) {
            clearInterval(countdownInterval);
            return;
        }
        
        const now = new Date();
        const nextCheckDue = new Date(activeTrip.next_check_due);
        const diff = nextCheckDue - now;
        
        if (diff <= 0) {
            document.getElementById('countdown').textContent = 'OVERDUE!';
            document.getElementById('countdown').classList.add('overdue');
            return;
        }
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        document.getElementById('countdown').textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('countdown').classList.remove('overdue');
    }, 1000);
}

// ==================== CHECK-IN ====================

async function handleCheckin() {
    if (!activeTrip) return;
    
    try {
        // Get user's current location
        const position = await getCurrentPosition();
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        const response = await fetch(`${API_BASE_URL}/checkin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                trip_id: activeTrip._id,
                lat,
                lng
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            // Update active trip with new next_check_due
            activeTrip.next_check_due = data.next_check_due;
            updateNextCheckDue();
            alert('✓ Check-in recorded successfully!');
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Failed to record check-in' }));
            alert('Error: ' + (errorData.error || 'Failed to record check-in'));
        }
    } catch (error) {
        if (error.code === error.PERMISSION_DENIED || error.code === 1) {
            alert('Location permission denied. Please enable location access.');
        } else if (error.message && error.message.includes('Failed to fetch')) {
            alert(getNetworkErrorMessage(error));
        } else {
            alert('Error getting location: ' + error.message);
        }
    }
}

function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser.'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });
    });
}

// ==================== SOS ====================

async function handleSOS() {
    if (!confirm('🚨 Are you sure you want to trigger an EMERGENCY SOS alert?')) {
        return;
    }
    
    try {
        // Get user's current location
        const position = await getCurrentPosition();
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        const response = await fetch(`${API_BASE_URL}/sos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                lat,
                lng,
                reason: 'Emergency SOS triggered by user'
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            showSOSModal(data);
        } else {
            const errorData = await response.json().catch(() => ({ error: 'Failed to send SOS alert' }));
            alert('Error: ' + (errorData.error || 'Failed to send SOS alert'));
        }
    } catch (error) {
        if (error.code === error.PERMISSION_DENIED || error.code === 1) {
            alert('Location permission denied. Please enable location access for SOS to work.');
        } else if (error.message && error.message.includes('Failed to fetch')) {
            alert(getNetworkErrorMessage(error));
        } else {
            alert('Error getting location: ' + error.message);
        }
    }
}

function showSOSModal(data) {
    const modal = document.getElementById('sos-modal');
    const linksDiv = document.getElementById('sos-links');
    
    linksDiv.innerHTML = '';
    
    // Helper function to create status display
    function createStatusDisplay(title, icon, results, enabled, warning, bgColor, borderColor, titleColor) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-display';
        statusDiv.style.marginBottom = '20px';
        statusDiv.style.padding = '15px';
        statusDiv.style.backgroundColor = bgColor;
        statusDiv.style.borderRadius = '8px';
        statusDiv.style.border = `2px solid ${borderColor}`;
        
        const statusTitle = document.createElement('h3');
        statusTitle.textContent = `${icon} ${title}`;
        statusTitle.style.marginTop = '0';
        statusTitle.style.marginBottom = '10px';
        statusTitle.style.color = titleColor;
        statusDiv.appendChild(statusTitle);
        
        if (enabled) {
            if (results && results.length > 0) {
                const successCount = results.filter(r => r.status === 'sent').length;
                const failCount = results.filter(r => r.status === 'failed').length;
                
                const summary = document.createElement('p');
                summary.style.fontWeight = 'bold';
                summary.style.marginBottom = '10px';
                if (successCount > 0) {
                    summary.innerHTML = `✅ ${title} sent to ${successCount} contact(s)`;
                    summary.style.color = '#059669';
                }
                if (failCount > 0) {
                    summary.innerHTML += `<br>❌ Failed to send to ${failCount} contact(s)`;
                    summary.style.color = '#dc2626';
                }
                statusDiv.appendChild(summary);
                
                // Show details for each contact
                const detailsList = document.createElement('ul');
                detailsList.style.listStyle = 'none';
                detailsList.style.padding = '0';
                detailsList.style.margin = '0';
                
                results.forEach(result => {
                    const listItem = document.createElement('li');
                    listItem.style.padding = '5px 0';
                    if (result.status === 'sent') {
                        listItem.innerHTML = `✅ <strong>${result.name}</strong> (${result.phone}) - ${title} sent successfully`;
                        listItem.style.color = '#059669';
                    } else {
                        listItem.innerHTML = `❌ <strong>${result.name}</strong> (${result.phone}) - Failed: ${result.error || 'Unknown error'}`;
                        listItem.style.color = '#dc2626';
                    }
                    detailsList.appendChild(listItem);
                });
                
                statusDiv.appendChild(detailsList);
            } else {
                const noResults = document.createElement('p');
                noResults.textContent = `No contacts to send ${title} to.`;
                noResults.style.color = '#6b7280';
                statusDiv.appendChild(noResults);
            }
        } else if (warning) {
            const warningP = document.createElement('p');
            warningP.innerHTML = `<strong>⚠️ ${title} Not Configured:</strong> ${warning}`;
            warningP.style.color = '#92400e';
            statusDiv.appendChild(warningP);
        }
        
        return statusDiv;
    }
    
    // Show WhatsApp status (most important - automatic sending)
    if (data.whatsapp_enabled || data.whatsapp_warning) {
        const whatsappStatusDiv = createStatusDisplay(
            'WhatsApp Status',
            '💬',
            data.whatsapp_results,
            data.whatsapp_enabled,
            data.whatsapp_warning,
            '#dcfce7',
            '#22c55e',
            '#166534'
        );
        linksDiv.appendChild(whatsappStatusDiv);
    }
    
    // Show SMS status
    if (data.sms_enabled || data.sms_warning) {
        const smsStatusDiv = createStatusDisplay(
            'SMS Status',
            '📱',
            data.sms_results,
            data.sms_enabled,
            data.sms_warning,
            '#f0f9ff',
            '#3b82f6',
            '#1e40af'
        );
        linksDiv.appendChild(smsStatusDiv);
    }
    
    // Show general warning if both are disabled
    if (data.warning) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'general-warning';
        warningDiv.style.marginBottom = '20px';
        warningDiv.style.padding = '15px';
        warningDiv.style.backgroundColor = '#fef3c7';
        warningDiv.style.borderRadius = '8px';
        warningDiv.style.border = '2px solid #f59e0b';
        warningDiv.innerHTML = `<strong>⚠️ Warning:</strong> ${data.warning}`;
        warningDiv.style.color = '#92400e';
        linksDiv.appendChild(warningDiv);
    }
    
    // Google Maps link
    const mapsLink = document.createElement('a');
    mapsLink.href = data.google_maps_link;
    mapsLink.target = '_blank';
    mapsLink.className = 'sos-link';
    mapsLink.textContent = '📍 View Location on Google Maps';
    mapsLink.style.display = 'block';
    mapsLink.style.marginTop = '20px';
    mapsLink.style.marginBottom = '10px';
    linksDiv.appendChild(mapsLink);
    
    // Alternative WhatsApp links (fallback if auto-send not configured)
    if (data.whatsapp_links && data.whatsapp_links.length > 0) {
        const whatsappTitle = document.createElement('h3');
        whatsappTitle.textContent = 'WhatsApp Quick Links (Fallback)';
        whatsappTitle.style.marginTop = '10px';
        whatsappTitle.style.marginBottom = '10px';
        linksDiv.appendChild(whatsappTitle);
        
        data.whatsapp_links.forEach(contact => {
            const whatsappLink = document.createElement('a');
            whatsappLink.href = contact.link;
            whatsappLink.target = '_blank';
            whatsappLink.className = 'sos-link whatsapp';
            whatsappLink.textContent = `Message ${contact.name} on WhatsApp`;
            whatsappLink.style.display = 'block';
            whatsappLink.style.marginBottom = '8px';
            linksDiv.appendChild(whatsappLink);
        });
    }
    
    // Show message if truly no contacts
    if (typeof data.contact_count === 'number' && data.contact_count === 0) {
        const noContacts = document.createElement('p');
        noContacts.textContent = 'No trusted contacts found. Please add contacts first.';
        noContacts.style.color = '#ff6b6b';
        noContacts.style.marginTop = '20px';
        linksDiv.appendChild(noContacts);
    }
    
    modal.classList.remove('hidden');
}

function closeSOSModal() {
    document.getElementById('sos-modal').classList.add('hidden');
}

// ==================== CONTACTS ====================

async function loadContacts() {
    if (!authToken) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/contacts`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayContacts(data.contacts || []);
        }
    } catch (error) {
        console.error('Error loading contacts:', error);
    }
}

function displayContacts(contacts) {
    const contactsList = document.getElementById('contacts-list');
    
    if (contacts.length === 0) {
        contactsList.innerHTML = '<p class="empty-state">No contacts yet. Add your trusted contacts above.</p>';
        return;
    }
    
    contactsList.innerHTML = contacts.map(contact => `
        <div class="contact-item">
            <div class="contact-info">
                <strong>${contact.name}</strong>
                <span>${contact.phone}</span>
                ${contact.email ? `<span class="email">${contact.email}</span>` : ''}
            </div>
            <button onclick="handleDeleteContact('${contact._id}')" class="btn btn-small btn-danger">Delete</button>
        </div>
    `).join('');
}

async function handleAddContact(event) {
    event.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const errorDiv = document.getElementById('contact-error');

    errorDiv.textContent = '';

    // Validation
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!name || !nameRegex.test(name)) {
        errorDiv.textContent = 'Invalid name: Only letters and spaces allowed.';
        return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
        errorDiv.textContent = 'Invalid phone number: Must be exactly 10 digits.';
        return;
    }

    // Prepend +91 to the phone number
    const fullPhone = '+91' + phone;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        errorDiv.textContent = 'Invalid email: Please enter a valid email address.';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name, phone: fullPhone, email })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('contact-form').reset();
            loadContacts();
        } else {
            errorDiv.textContent = data.error || 'Failed to add contact';
        }
    } catch (error) {
        errorDiv.textContent = getNetworkErrorMessage(error);
    }
}

async function handleDeleteContact(contactId) {
    if (!confirm('Are you sure you want to delete this contact?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/contacts/${contactId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.ok) {
            loadContacts();
        } else {
            const data = await response.json();
            alert('Error: ' + (data.error || 'Failed to delete contact'));
        }
    } catch (error) {
        alert(getNetworkErrorMessage(error));
    }
}

// ==================== MISSED CHECK-INS ====================

async function handleScanMissedChecks() {
    if (!authToken) return;
    
    const resultDiv = document.getElementById('missed-checks-result');
    resultDiv.innerHTML = '<p>Scanning...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/scan_missed_checks`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const missedTrips = data.missed_trips || [];
            
            if (missedTrips.length === 0) {
                resultDiv.innerHTML = '<p class="success">✓ No missed check-ins found.</p>';
            } else {
                resultDiv.innerHTML = `
                    <div class="missed-trips">
                        <h3>⚠️ Missed Check-ins Found: ${missedTrips.length}</h3>
                        ${missedTrips.map(trip => `
                            <div class="missed-trip-item">
                                <p><strong>Destination:</strong> ${trip.destination}</p>
                                <p><strong>Overdue:</strong> ${trip.overdue_minutes.toFixed(1)} minutes</p>
                                <p><strong>Next Check Due:</strong> ${formatDateTime(new Date(trip.next_check_due))}</p>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
    } catch (error) {
        resultDiv.innerHTML = '<p class="error">Error scanning for missed check-ins.</p>';
    }
}

// ==================== UTILITY FUNCTIONS ====================

function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Hide loading screen
window.addEventListener('load', () => {
    document.getElementById('loading-screen').style.display = 'none';
});

