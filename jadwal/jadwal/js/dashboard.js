// Dashboard Logic

let currentView = 'all';
let currentFilters = {
    priority: 'all',
    date: '',
    view: 'all'
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!checkAuth()) {
        return;
    }
    
    const user = getCurrentUser();
    document.getElementById('userName').textContent = user.name;
    
    // Check and auto-complete overdue schedules on load
    checkAndCompleteOverdueSchedules();
    
    // Initialize modal
    initModal();
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active menu
            document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            
            // Update view
            currentView = this.dataset.view;
            currentFilters.view = currentView;
            
            // Update title
            const titles = {
                'all': 'Semua Jadwal',
                'today': 'Jadwal Hari Ini',
                'priority': 'Prioritas Tinggi',
                'history': 'Riwayat Jadwal'
            };
            
            document.getElementById('viewTitle').textContent = titles[currentView];
            
            loadSchedules();
        });
    });
    
    // Filters
    document.getElementById('priorityFilter').addEventListener('change', function() {
        currentFilters.priority = this.value;
        loadSchedules();
    });
    
    document.getElementById('dateFilter').addEventListener('change', function() {
        currentFilters.date = this.value;
        loadSchedules();
    });
    
    // Load schedules
    loadSchedules();
    
    // Auto-check for overdue schedules every minute
    setInterval(() => {
        checkAndCompleteOverdueSchedules();
        loadSchedules();
    }, 60000);
});

// Load and display schedules
function loadSchedules() {
    const user = getCurrentUser();
    let schedules = getUserSchedules(user.id);
    
    // Apply filters
    schedules = filterSchedules(schedules, currentFilters);
    
    // Sort schedules
    schedules = sortSchedules(schedules);
    
    // Update statistics
    updateStatistics(getUserSchedules(user.id));
    
    // Display schedules
    displaySchedules(schedules);
}

// Display schedules
function displaySchedules(schedules) {
    const container = document.getElementById('scheduleList');
    
    if (schedules.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>📭 Tidak ada jadwal</h3>
                <p>Mulai buat jadwal belajar Anda!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = schedules.map(schedule => createScheduleCard(schedule)).join('');
}

// Create schedule card HTML
function createScheduleCard(schedule) {
    const isCompleted = schedule.completed;
    const isOverdue = !isCompleted && isPast(schedule.date, schedule.timeEnd);
    
    return `
        <div class="schedule-card ${isCompleted ? 'schedule-completed' : ''} ${isOverdue ? 'overdue' : ''}" data-id="${schedule.id}">
            <div class="schedule-priority ${getPriorityColorClass(schedule.priority)}"></div>
            <div class="schedule-content">
                <div class="schedule-header">
                    <h3 class="schedule-subject">${schedule.subject}</h3>
                    <span class="schedule-badge ${isOverdue ? 'badge-overdue' : getPriorityClass(schedule.priority)}">
                        ${isOverdue ? '⏰ Terlewat' : schedule.priority === 'high' ? 'Tinggi' : schedule.priority === 'medium' ? 'Sedang' : 'Rendah'}
                    </span>
                </div>
                ${schedule.description ? `<p class="schedule-description">${schedule.description}</p>` : ''}
                <div class="schedule-info">
                    <span>📅 ${formatDate(schedule.date)}</span>
                    <span>🕐 ${formatTime(schedule.timeStart)} - ${formatTime(schedule.timeEnd)}</span>
                    ${isCompleted ? `<span>✓ ${schedule.autoCompleted ? 'Otomatis' : 'Selesai'}</span>` : ''}
                </div>
                <div class="schedule-actions">
                    ${!isCompleted ? `
                        <button class="btn-action btn-complete" onclick="completeSchedule('${schedule.id}')">
                            ✓ Selesai
                        </button>
                        <button class="btn-action btn-edit" onclick="editSchedule('${schedule.id}')">
                            ✏️ Edit
                        </button>
                    ` : `
                        <button class="btn-action btn-restore" onclick="restoreSchedule('${schedule.id}')">
                            ↻ Pulihkan
                        </button>
                    `}
                    <button class="btn-action btn-delete" onclick="removeSchedule('${schedule.id}')">
                        🗑️ Hapus
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Update statistics
function updateStatistics(schedules) {
    const total = schedules.length;
    const completed = schedules.filter(s => s.completed).length;
    
    document.getElementById('totalSchedules').textContent = total;
    document.getElementById('completedSchedules').textContent = completed;
}

// Complete schedule
async function completeSchedule(scheduleId) {
    const confirmed = await confirmAction(
        'Tandai jadwal ini sebagai selesai?',
        'Selesaikan Jadwal',
        'success'
    );
    
    if (confirmed) {
        updateSchedule(scheduleId, { 
            completed: true,
            completedAt: new Date().toISOString(),
            autoCompleted: false
        });
        showNotification('Jadwal ditandai selesai!', 'success');
        loadSchedules();
    }
}

// Restore schedule
async function restoreSchedule(scheduleId) {
    const confirmed = await confirmAction(
        'Pulihkan jadwal ini agar aktif kembali?',
        'Pulihkan Jadwal',
        'warning'
    );
    
    if (confirmed) {
        updateSchedule(scheduleId, { 
            completed: false,
            completedAt: null,
            autoCompleted: false
        });
        showNotification('Jadwal berhasil dipulihkan!', 'success');
        loadSchedules();
    }
}

// Edit schedule
function editSchedule(scheduleId) {
    const schedule = getScheduleById(scheduleId);
    if (schedule) {
        openModal(schedule);
    }
}

// Remove schedule
async function removeSchedule(scheduleId) {
    const confirmed = await confirmAction(
        'Jadwal yang dihapus tidak dapat dikembalikan. Lanjutkan?',
        'Hapus Jadwal',
        'danger'
    );
    
    if (confirmed) {
        deleteSchedule(scheduleId);
        showNotification('Jadwal berhasil dihapus!', 'success');
        loadSchedules();
    }
}

// Make functions global
window.completeSchedule = completeSchedule;
window.restoreSchedule = restoreSchedule;
window.editSchedule = editSchedule;
window.removeSchedule = removeSchedule;
window.loadSchedules = loadSchedules;