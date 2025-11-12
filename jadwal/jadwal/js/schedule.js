let currentEditingSchedule = null;
let dateTimeSlotCount = 0;

// Inisialisasi modal untuk membuat dan mengedit jadwal
function initModal() {
    const modal = document.getElementById('scheduleModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const newScheduleBtn = document.getElementById('newScheduleBtn');
    const multipleCheckbox = document.querySelector('#singleDateTime input[type="checkbox"]');
    const scheduleForm = document.getElementById('scheduleForm');
    
    // Buka modal untuk jadwal baru
    newScheduleBtn.addEventListener('click', () => {
        openModal();
    });
    
    // Menutup modal
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Menutup modal jika klik di luar modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Mengaktifkan pengaturan untuk banyak jadwal
    const actualCheckbox = document.getElementById('multipleDateTime');
    if (actualCheckbox && actualCheckbox.tagName === 'INPUT') {
        actualCheckbox.addEventListener('change', function() {
            toggleMultipleMode(this.checked);
        });
    } else {
        // Find checkbox in the form
        const checkbox = document.querySelector('input[type="checkbox"]#multipleDateTime');
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                toggleMultipleMode(this.checked);
            });
        }
    }
    
    // Tombol untuk menambah slot waktu
    document.getElementById('addDateTimeSlot').addEventListener('click', addDateTimeSlot);
    
    // Handle form submit (menyimpan jadwal)
    scheduleForm.addEventListener('submit', handleScheduleSubmit);
}

// Toggle between single and multiple schedule mode
function toggleMultipleMode(isMultiple) {
    const singleSection = document.getElementById('singleDateTime');
    const multipleSection = document.getElementById('multipleDateTimeSection');
    
    if (isMultiple) {
        singleSection.style.display = 'none';
        if (multipleSection) {
            multipleSection.style.display = 'block';
        }
        
        // Hapus required pada input single jika berulang
        document.getElementById('singleDate').removeAttribute('required');
        document.getElementById('singleTimeStart').removeAttribute('required');
        document.getElementById('singleTimeEnd').removeAttribute('required');
        
        // Tambahkan slot waktu pertama jika belum ada
        if (dateTimeSlotCount === 0) {
            addDateTimeSlot();
        }
    } else {
        singleSection.style.display = 'block';
        if (multipleSection) {
            multipleSection.style.display = 'none';
        }
        
        // Kembalikan required pada input single
        document.getElementById('singleDate').setAttribute('required', 'required');
        document.getElementById('singleTimeStart').setAttribute('required', 'required');
        document.getElementById('singleTimeEnd').setAttribute('required', 'required');
    }
}

// Buka modal untuk membuat atau mengedit jadwal
function openModal(schedule = null) {
    const modal = document.getElementById('scheduleModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('scheduleForm');
    
    // Reset form
    form.reset();
    currentEditingSchedule = schedule;
    
    if (schedule) {
        modalTitle.textContent = 'Edit Jadwal';
        document.getElementById('submitBtn').textContent = 'Update Jadwal';
        
        // Isi form dengan data jadwal yang dipilih
        document.getElementById('subject').value = schedule.subject;
        document.getElementById('priority').value = schedule.priority;
        document.getElementById('description').value = schedule.description || '';
        document.getElementById('singleDate').value = schedule.date;
        document.getElementById('singleTimeStart').value = schedule.timeStart;
        document.getElementById('singleTimeEnd').value = schedule.timeEnd;
    } else {
        modalTitle.textContent = 'Buat Jadwal Baru';
        document.getElementById('submitBtn').textContent = 'Simpan Jadwal';
        
        // Set tanggal hari ini sebagai default
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('singleDate').value = today;
    }
    
    // Clear multiple date/time slots
    const slotsContainer = document.getElementById('dateTimeSlots');
    if (slotsContainer) {
        slotsContainer.innerHTML = '';
    }
    dateTimeSlotCount = 0;
    
    // Reset checkbox
    const checkbox = document.querySelector('input[type="checkbox"]#multipleDateTime') || 
                     document.querySelector('#singleDateTime input[type="checkbox"]');
    if (checkbox) {
        checkbox.checked = false;
    }
    
    // Show single mode
    document.getElementById('singleDateTime').style.display = 'block';
    const multipleSection = document.getElementById('multipleDateTimeSection');
    if (multipleSection) {
        multipleSection.style.display = 'none';
    }
    
    modal.classList.add('active');
}

// Menutup modal
function closeModal() {
    const modal = document.getElementById('scheduleModal');
    modal.classList.remove('active');
    currentEditingSchedule = null;
}

// Menambahkan slot tanggal dan waktu
function addDateTimeSlot() {
    dateTimeSlotCount++;
    const container = document.getElementById('dateTimeSlots');
    const today = new Date().toISOString().split('T')[0];
    
    const slotHTML = `
        <div class="datetime-slot" data-slot="${dateTimeSlotCount}">
            <div class="form-group">
                <label>Tanggal</label>
                <input type="date" class="slot-date" value="${today}" required>
            </div>
            <div class="form-group">
                <label>Waktu Mulai</label>
                <input type="time" class="slot-time-start" required>
            </div>
            <div class="form-group">
                <label>Waktu Selesai</label>
                <input type="time" class="slot-time-end" required>
            </div>
            <button type="button" class="btn-remove-slot" onclick="removeDateTimeSlot(${dateTimeSlotCount})">
                ✕
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', slotHTML);
}

// Menghapus slot tanggal dan waktu
function removeDateTimeSlot(slotId) {
    const slot = document.querySelector(`[data-slot="${slotId}"]`);
    if (slot) {
        slot.remove();
        dateTimeSlotCount--;
        
        // If no slots left, uncheck multiple mode
        const remainingSlots = document.querySelectorAll('.datetime-slot');
        if (remainingSlots.length === 0) {
            const checkbox = document.querySelector('input[type="checkbox"]#multipleDateTime') || 
                           document.querySelector('#singleDateTime input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = false;
                toggleMultipleMode(false);
            }
        }
    }
}

// Handle submit untuk membuat atau memperbarui jadwal
async function handleScheduleSubmit(e) {
    e.preventDefault();
    
    const user = getCurrentUser();
    const subject = document.getElementById('subject').value.trim();
    const priority = document.getElementById('priority').value;
    const description = document.getElementById('description').value.trim();
    
    // Check if multiple mode is active
    const checkbox = document.querySelector('input[type="checkbox"]#multipleDateTime') || 
                     document.querySelector('#singleDateTime input[type="checkbox"]');
    const isMultiple = checkbox ? checkbox.checked : false;
    
    if (currentEditingSchedule) {
        // Update jadwal yang sudah ada
        const updatedData = {
            subject: subject,
            priority: priority,
            description: description,
            date: document.getElementById('singleDate').value,
            timeStart: document.getElementById('singleTimeStart').value,
            timeEnd: document.getElementById('singleTimeEnd').value,
            updatedAt: new Date().toISOString()
        };
        
        updateSchedule(currentEditingSchedule.id, updatedData);
        showNotification('Jadwal berhasil diperbarui!', 'success');
        closeModal();
        loadSchedules();
    } else {
        // Membuat jadwal baru
        if (isMultiple) {
            // Jadwal berulang (multiple slots)
            const slots = document.querySelectorAll('.datetime-slot');
            
            if (slots.length === 0) {
                showNotification('Tambahkan minimal satu waktu untuk jadwal berulang!', 'error');
                return;
            }
            
            // Validate all slots
            let isValid = true;
            slots.forEach(slot => {
                const date = slot.querySelector('.slot-date').value;
                const timeStart = slot.querySelector('.slot-time-start').value;
                const timeEnd = slot.querySelector('.slot-time-end').value;
                
                if (!date || !timeStart || !timeEnd) {
                    isValid = false;
                }
                
                if (timeStart >= timeEnd) {
                    isValid = false;
                    showNotification('Waktu mulai harus lebih awal dari waktu selesai!', 'error');
                }
            });
            
            if (!isValid) {
                showNotification('Lengkapi semua slot waktu dengan benar!', 'error');
                return;
            }
            
            // Confirm before creating multiple schedules
            const confirmed = await confirmAction(
                `Anda akan membuat ${slots.length} jadwal sekaligus. Lanjutkan?`,
                'Buat Jadwal Berulang',
                'warning'
            );
            
            if (!confirmed) return;
            
            // Create all schedules
            let successCount = 0;
            slots.forEach(slot => {
                const schedule = {
                    id: generateId(),
                    userId: user.id,
                    subject: subject,
                    priority: priority,
                    description: description,
                    date: slot.querySelector('.slot-date').value,
                    timeStart: slot.querySelector('.slot-time-start').value,
                    timeEnd: slot.querySelector('.slot-time-end').value,
                    completed: false,
                    createdAt: new Date().toISOString()
                };
                
                saveSchedule(schedule);
                successCount++;
            });
            
            showNotification(`${successCount} jadwal berhasil dibuat!`, 'success');
            closeModal();
            loadSchedules();
        } else {
            // Jadwal tunggal
            const date = document.getElementById('singleDate').value;
            const timeStart = document.getElementById('singleTimeStart').value;
            const timeEnd = document.getElementById('singleTimeEnd').value;
            
            // Validate time
            if (timeStart >= timeEnd) {
                showNotification('Waktu mulai harus lebih awal dari waktu selesai!', 'error');
                return;
            }
            
            const schedule = {
                id: generateId(),
                userId: user.id,
                subject: subject,
                priority: priority,
                description: description,
                date: date,
                timeStart: timeStart,
                timeEnd: timeEnd,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            saveSchedule(schedule);
            showNotification('Jadwal berhasil dibuat!', 'success');
            closeModal();
            loadSchedules();
        }
    }
}

// Make functions global
window.removeDateTimeSlot = removeDateTimeSlot;
window.initModal = initModal;
window.openModal = openModal;