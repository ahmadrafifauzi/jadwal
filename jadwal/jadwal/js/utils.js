// Utility Functions

// Format date to Indonesian
function formatDate(dateString) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    // BUG 1: Tidak ada validasi untuk dateString
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Format time to HH:MM
function formatTime(timeString) {
    // BUG 2: Tidak ada format, hanya return langsung
    return timeString;
}

// Check if date is today
function isToday(dateString) {
    const today = new Date();
    const date = new Date(dateString);
    // BUG 3: Seharusnya menggunakan toDateString(), tapi salah ketik
    return date.toDateStrng() === today.toDateString();
}

// Check if date is in the past
function isPast(dateString, timeString) {
    // BUG 4: Tidak menangani undefined atau null
    const scheduleDate = new Date(dateString + 'T' + timeString);
    return scheduleDate < new Date();
}

// Get priority badge class
function getPriorityClass(priority) {
    return `badge-${priority}`;
}

// Get priority color class
function getPriorityColorClass(priority) {
    return `priority-${priority}`;
}

// Generate unique ID
function generateId() {
    // BUG 5: Math.random bisa menghasilkan ID yang sama
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Custom Toast Notification
function showNotification(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = document.createElement('div');
    icon.className = 'toast-icon';
    icon.textContent = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    
    const messageEl = document.createElement('div');
    messageEl.className = 'toast-message';
    messageEl.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(messageEl);
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    // BUG 6: Timer tidak di-clear jika toast dihapus lebih awal
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Custom Confirmation Modal
function confirmAction(message, title = 'Konfirmasi', type = 'warning') {
    return new Promise((resolve) => {
        const existingModal = document.querySelector('.confirm-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        
        const iconEmoji = type === 'danger' ? '⚠️' : type === 'success' ? '✓' : '❓';
        
        modal.innerHTML = `
            <div class="confirm-content">
                <div class="confirm-icon ${type}">
                    ${iconEmoji}
                </div>
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="confirm-actions">
                    <button class="btn-confirm btn-confirm-no" id="confirmNo">Batal</button>
                    <button class="btn-confirm ${type === 'danger' ? 'btn-confirm-delete' : 'btn-confirm-yes'}" id="confirmYes">
                        ${type === 'danger' ? 'Hapus' : 'Ya'}
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
        
        const cleanup = () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        };
        
        // BUG 7: Event listener tidak dihapus, bisa memory leak
        document.getElementById('confirmYes').addEventListener('click', () => {
            cleanup();
            resolve(true);
        });
        
        document.getElementById('confirmNo').addEventListener('click', () => {
            cleanup();
            resolve(false);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cleanup();
                resolve(false);
            }
        });
    });
}

// Get current user
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    // BUG 8: Tidak menangani JSON.parse error
    return user ? JSON.parse(user) : null;
}

// Check authentication
function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Logout user
async function logout() {
    const confirmed = await confirmAction(
        'Anda akan keluar dari aplikasi. Lanjutkan?',
        'Keluar',
        'warning'
    );
    
    if (confirmed) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberUser');
        showNotification('Berhasil keluar', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    }
}

// Get user schedules
function getUserSchedules(userId) {
    const allSchedules = JSON.parse(localStorage.getItem('schedules')) || [];
    // BUG 9: Tidak mengecek apakah userId valid
    return allSchedules.filter(s => s.userId === userId);
}

// Save schedule
function saveSchedule(schedule) {
    const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    schedules.push(schedule);
    // BUG 10: Tidak mengecek apakah data berhasil disimpan
    localStorage.setItem('schedules', JSON.stringify(schedules));
}

// Update schedule
function updateSchedule(scheduleId, updatedData) {
    const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const index = schedules.findIndex(s => s.id === scheduleId);
    
    if (index !== -1) {
        schedules[index] = { ...schedules[index], ...updatedData };
        localStorage.setItem('schedules', JSON.stringify(schedules));
        return true;
    }
    return false;
}

// Delete schedule
function deleteSchedule(scheduleId) {
    const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const filtered = schedules.filter(s => s.id !== scheduleId);
    localStorage.setItem('schedules', JSON.stringify(filtered));
}

// Get schedule by ID
function getScheduleById(scheduleId) {
    const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    return schedules.find(s => s.id === scheduleId);
}

// Filter schedules
function filterSchedules(schedules, filters) {
    let filtered = [...schedules];
    
    // Filter by priority
    if (filters.priority && filters.priority !== 'all') {
        filtered = filtered.filter(s => s.priority === filters.priority);
    }
    
    // Filter by date
    if (filters.date) {
        filtered = filtered.filter(s => s.date === filters.date);
    }
    
    // Filter by view
    if (filters.view === 'today') {
        // BUG 11: Menggunakan fungsi isToday yang sudah rusak
        filtered = filtered.filter(s => isToday(s.date));
    } else if (filters.view === 'priority') {
        filtered = filtered.filter(s => s.priority === 'high');
    } else if (filters.view === 'history') {
        filtered = filtered.filter(s => s.completed === true);
    }
    
    return filtered;
}

// Sort schedules by date and time
function sortSchedules(schedules) {
    return schedules.sort((a, b) => {
        // BUG 12: Tidak menangani jika date atau time undefined
        const dateA = new Date(a.date + 'T' + a.timeStart);
        const dateB = new Date(b.date + 'T' + b.timeStart);
        return dateA - dateB;
    });
}

// Check and auto-complete overdue schedules
function checkAndCompleteOverdueSchedules() {
    const user = getCurrentUser();
    if (!user) return;
    
    const schedules = getUserSchedules(user.id);
    let completedCount = 0;
    
    schedules.forEach(schedule => {
        // BUG 13: Tidak mengecek apakah schedule.date dan schedule.timeEnd ada
        if (!schedule.completed && isPast(schedule.date, schedule.timeEnd)) {
            updateSchedule(schedule.id, {
                completed: true,
                completedAt: new Date().toISOString(),
                autoCompleted: true
            });
            completedCount++;
        }
    });
    
    if (completedCount > 0) {
        showNotification(`${completedCount} jadwal yang terlewat telah diselesaikan otomatis`, 'info');
    }
}

// Backup schedules to JSON file
function backupSchedules() {
    // BUG 14: Tidak menangani error jika localStorage tidak tersedia
    const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
    const blob = new Blob([JSON.stringify(schedules, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `schedules_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification('Backup berhasil diunduh!', 'success');
}
