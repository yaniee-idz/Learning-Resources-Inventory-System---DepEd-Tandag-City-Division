// DOM Elements
// This section is now initialized in the DOMContentLoaded event
const navLinks = document.querySelectorAll('.nav a');
const menuItems = document.querySelectorAll('.menu-item');
const sections = document.querySelectorAll('section[id]');
const searchInput = document.querySelector('.search-box input');
const filterSelects = document.querySelectorAll('.filters select');

window.selectedSchool = null;

// Navigation functionality
function showSection(sectionId) {
    // Hide all sections
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    // Update navigation active states
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    
    // Update sidebar active states
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Find corresponding menu item and activate it
    const menuItemMap = {
        'dashboard': 0,
        'school': 1,
        'items': 2,
        'resources': 3,
        'records': 4,
        'settings': 5
    };
    
    if (menuItemMap[sectionId] !== undefined) {
        menuItems[menuItemMap[sectionId]].classList.add('active');
    }
    
    // Initialize specific section functionality
    if (sectionId === 'items') {
        console.log('Items section selected, initializing...');
        setTimeout(() => {
            console.log('Calling initializeItems...');
            initializeItems();
        }, 100);
    } else if (sectionId === 'resources') {
        setTimeout(() => {
            initializeResources();
        }, 100);
    } else if (sectionId === 'school') {
        setTimeout(() => {
            initializeSchoolSection();
        }, 100);
    } else if (sectionId === 'records') {
        setTimeout(() => {
            initializeRecordsSection();
        }, 100);
    }
}

// Event listeners for navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('href').substring(1);
        showSection(sectionId);
    });
});

const menuItemMap = {
    'dashboard': 0,
    'school': 1,
    'items': 2,
    'resources': 3,
    'records': 4,
    'settings': 5
};
const sectionMap = ['dashboard', 'school', 'items', 'resources', 'records', 'settings'];

menuItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        const sectionId = sectionMap[index];
        showSection(sectionId);
        // Update URL hash
        window.location.hash = sectionId;
    });
});


// Stats update functionality
function updateStats() {
    const tableRows = document.querySelectorAll('.inventory-table tbody tr');
    let totalBooks = 0;
    let totalEquipment = 0;
    
    tableRows.forEach(row => {
        const category = row.children[1].textContent;
        const quantity = parseInt(row.children[2].textContent);
        
        if (category === 'Books') {
            totalBooks += quantity;
        } else if (category === 'Equipment') {
            totalEquipment += quantity;
        }
    });
    
    // Update stats display
    const bookStat = document.querySelector('.stat-card:nth-child(1) .stat-number');
    const equipmentStat = document.querySelector('.stat-card:nth-child(2) .stat-number');
    
    if (bookStat) bookStat.textContent = totalBooks;
    if (equipmentStat) equipmentStat.textContent = totalEquipment;
}

// Activity tracking system
let activities = [];

// Activity types and their icons
const activityTypes = {
    'school_added': { icon: 'fas fa-plus', color: '#10b981' },
    'school_updated': { icon: 'fas fa-edit', color: '#3b82f6' },
    'school_deleted': { icon: 'fas fa-trash', color: '#ef4444' },
    'resource_added': { icon: 'fas fa-book', color: '#8b5cf6' },
    'resource_updated': { icon: 'fas fa-edit', color: '#3b82f6' },
    'resource_deleted': { icon: 'fas fa-trash', color: '#ef4444' },
    'subject_added': { icon: 'fas fa-book-open', color: '#10b981' },
    'subject_updated': { icon: 'fas fa-edit', color: '#3b82f6' },
    'subject_deleted': { icon: 'fas fa-trash', color: '#ef4444' },
    'data_exported': { icon: 'fas fa-download', color: '#06b6d4' },
    'data_imported': { icon: 'fas fa-upload', color: '#84cc16' }
};

// Add new activity
function addActivity(type, title, description) {
    const activity = {
        id: Date.now(),
        type: type,
        title: title,
        description: description,
        timestamp: new Date(),
        timeAgo: 'Just now'
    };
    
    // Add to beginning of array
    activities.unshift(activity);
    
    // Keep only last 20 activities for storage
    if (activities.length > 20) {
        activities = activities.slice(0, 20);
    }
    
    // Update display
    updateActivityDisplay();
    
    // Store in localStorage for persistence
    localStorage.setItem('lris_activities', JSON.stringify(activities));
}

// Update activity display
function updateActivityDisplay() {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    // Show only first 5 activities by default
    const activitiesToShow = activities.slice(0, 5);
    
    activitiesToShow.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.style.animation = 'fadeIn 0.5s ease-out';
        
        const activityType = activityTypes[activity.type] || { icon: 'fas fa-info-circle', color: '#64748b' };
        
        activityItem.innerHTML = `
            <div class="activity-icon" style="background: ${activityType.color}20; color: ${activityType.color};">
                <i class="${activityType.icon}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <span class="activity-time">${activity.timeAgo}</span>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
    
    // Update "View All" button text
    const viewAllBtn = document.querySelector('.section-title .btn-secondary');
    if (viewAllBtn) {
        if (activities.length > 5) {
            viewAllBtn.textContent = `View All (${activities.length})`;
            viewAllBtn.style.display = 'block';
        } else {
            viewAllBtn.style.display = 'none';
        }
    }
}

// Toggle between showing all activities and showing only 5
let showingAllActivities = false;

function toggleActivityView() {
    const activityList = document.querySelector('.activity-list');
    const viewAllBtn = document.querySelector('.section-title .btn-secondary');
    
    if (!activityList || !viewAllBtn) return;
    
    showingAllActivities = !showingAllActivities;
    
    if (showingAllActivities) {
        // Show all activities
        activityList.innerHTML = '';
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.style.animation = 'fadeIn 0.5s ease-out';
            
            const activityType = activityTypes[activity.type] || { icon: 'fas fa-info-circle', color: '#64748b' };
            
            activityItem.innerHTML = `
                <div class="activity-icon" style="background: ${activityType.color}20; color: ${activityType.color};">
                    <i class="${activityType.icon}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                    <span class="activity-time">${activity.timeAgo}</span>
                </div>
            `;
            
            activityList.appendChild(activityItem);
        });
        viewAllBtn.textContent = 'Show Less';
    } else {
        // Show only 5 activities
        updateActivityDisplay();
    }
}

// Dashboard stats update functionality
async function updateDashboardStats() {
    try {
        // Get schools data
        const schoolsResponse = await fetch('http://localhost:3000/api/schools');
        const schools = await schoolsResponse.json();
        
        // Get distributed resources data
        const resourcesResponse = await fetch('http://localhost:3000/api/distributed-resources');
        const distributedResources = await resourcesResponse.json();
        
        let totalSchools = schools.length;
        let totalLearners = 0;
        let totalResourcesDistributed = distributedResources.length;
        let totalQuantityDistributed = 0;
        
        // Calculate total learners from schools
        schools.forEach(school => {
            totalLearners += parseInt(school.Enrollees) || 0;
        });
        
        // Calculate total quantity distributed
        distributedResources.forEach(resource => {
            totalQuantityDistributed += parseInt(resource.Quantity) || 0;
        });
        
        // Update dashboard stats
        const schoolStat = document.querySelector('.stat-card:nth-child(1) .stat-number');
        const learnerStat = document.querySelector('.stat-card:nth-child(2) .stat-number');
        const resourcesStat = document.querySelector('.stat-card:nth-child(3) .stat-number');
        
        if (schoolStat) schoolStat.textContent = totalSchools.toLocaleString();
        if (learnerStat) learnerStat.textContent = totalLearners.toLocaleString();
        if (resourcesStat) resourcesStat.textContent = totalQuantityDistributed.toLocaleString();
        
        // Update change indicators
        const schoolChange = document.querySelector('.stat-card:nth-child(1) .stat-change');
        const learnerChange = document.querySelector('.stat-card:nth-child(2) .stat-change');
        const resourcesChange = document.querySelector('.stat-card:nth-child(3) .stat-change');
        
        if (schoolChange) schoolChange.textContent = `+${totalSchools} total schools`;
        if (learnerChange) learnerChange.textContent = `+${totalLearners.toLocaleString()} total learners`;
        if (resourcesChange) resourcesChange.textContent = `+${totalQuantityDistributed.toLocaleString()} total resources distributed`;
        
        console.log('Dashboard stats updated:', {
            schools: totalSchools,
            learners: totalLearners,
            resourcesDistributed: totalQuantityDistributed
        });
        
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
        // Keep default values if there's an error
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add notification styles
    if (!document.querySelector('#notification-styles')) {
        const notificationStyles = document.createElement('style');
        notificationStyles.id = 'notification-styles';
        notificationStyles.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                background: white;
                border-radius: 0.5rem;
                padding: 1rem;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                border-left: 4px solid #3b82f6;
                z-index: 3000;
                animation: slideIn 0.3s ease-out;
            }
            
            .notification-success {
                border-left-color: #10b981;
            }
            
            .notification-error {
                border-left-color: #ef4444;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            
            .notification-content i {
                color: #3b82f6;
            }
            
            .notification-success .notification-content i {
                color: #10b981;
            }
            
            .notification-error .notification-content i {
                color: #ef4444;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(notificationStyles);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Patch showSection to refresh dashboard stats and activities when navigating to dashboard
const originalShowSection = showSection;
showSection = function(sectionId) {
    originalShowSection(sectionId);
    if (sectionId === 'dashboard') {
        updateDashboardStats();
        loadActivities();
    }
    if (sectionId === 'school') {
        const schoolSection = document.getElementById('school');
        if (schoolSection) {
            schoolSection.style.display = 'block';
            console.log('School section forced visible');
        }
        initializeSchoolSection();
        console.log('School section initialized');
    }
};

// Check if server is running
async function checkServerStatus() {
    try {
        const response = await fetch('/test');
        if (response.ok) {
            console.log('✅ Server is running');
        } else {
            console.warn('⚠️ Server responded with error status');
        }
    } catch (error) {
        console.error('❌ Server is not running or not accessible:', error.message);
        showNotification('Warning: Server is not running. Some features may not work.', 'error');
    }
}




// =============================================
// ADMIN MODAL FUNCTIONALITY
// =============================================

// Sample admin data (in a real application, this would come from a database)
let admins = [
    {
        id: 1,
        username: 'admin',
        email: 'admin@deped.gov.ph',
        role: 'super_admin',
        dateCreated: '2024-01-01'
    },
    {
        id: 2,
        username: 'viewer1',
        email: 'viewer1@deped.gov.ph',
        role: 'viewer',
        dateCreated: '2024-01-15'
    }
];

// Test function for admin icon click
function testAdminClick() {
    console.log('Admin icon clicked via onclick!');
    console.log('Admins array:', admins);
    const adminModal = document.getElementById('adminModal');
    console.log('Admin modal element:', adminModal);
    if (adminModal) {
        console.log('Opening admin modal...');
        console.log('Modal current display:', adminModal.style.display);
        loadCurrentAdmins();
        adminModal.style.display = 'flex';
        console.log('Modal display set to flex');
        console.log('Modal final display:', adminModal.style.display);
        
        // Force a repaint
        adminModal.offsetHeight;
        
        // Check if modal is visible
        const rect = adminModal.getBoundingClientRect();
        console.log('Modal position:', rect);
        console.log('Modal visibility:', rect.width > 0 && rect.height > 0);
    } else {
        console.error('Admin modal not found!');
    }
}

// Initialize admin modal functionality
function initializeAdminModal() {
    console.log('Initializing admin modal...');
    
    const adminIcon = document.getElementById('adminIcon');
    const adminModal = document.getElementById('adminModal');
    const closeAdminModal = document.getElementById('closeAdminModal');
    const addAdminBtn = document.getElementById('addAdminBtn');
    const addAdminModal = document.getElementById('addAdminModal');
    const closeAddAdminModal = document.getElementById('closeAddAdminModal');
    const cancelAddAdmin = document.getElementById('cancelAddAdmin');
    const addAdminForm = document.getElementById('addAdminForm');

    console.log('Admin icon found:', adminIcon);
    console.log('Admin modal found:', adminModal);

    // Open admin modal when admin icon is clicked
    if (adminIcon) {
        adminIcon.addEventListener('click', function() {
            console.log('Admin icon clicked!');
            loadCurrentAdmins();
            adminModal.style.display = 'flex';
        });
    } else {
        console.error('Admin icon not found!');
    }

    // Close admin modal when close button is clicked
    if (closeAdminModal) {
        closeAdminModal.addEventListener('click', function() {
            adminModal.style.display = 'none';
        });
    }

    // Handle tab switching
    const tabButtons = document.querySelectorAll('.admin-tabs .tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Handle add admin button
    if (addAdminBtn) {
        addAdminBtn.addEventListener('click', function() {
            showAddAdminForm();
        });
    }

    // Close add admin modal when close button is clicked
    if (closeAddAdminModal) {
        closeAddAdminModal.addEventListener('click', function() {
            addAdminModal.style.display = 'none';
        });
    }

    // Cancel add admin
    if (cancelAddAdmin) {
        cancelAddAdmin.addEventListener('click', function() {
            addAdminModal.style.display = 'none';
        });
    }

    // Handle add admin form submission
    if (addAdminForm) {
        addAdminForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewAdmin();
        });
    }

    // Close modals when clicking outside
    if (adminModal) {
        adminModal.addEventListener('click', function(e) {
            if (e.target === adminModal) {
                adminModal.style.display = 'none';
            }
        });
    }

    if (addAdminModal) {
        addAdminModal.addEventListener('click', function(e) {
            if (e.target === addAdminModal) {
                addAdminModal.style.display = 'none';
            }
        });
    }
}

// Switch between tabs
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Show add admin form
function showAddAdminForm() {
    const addAdminModal = document.getElementById('addAdminModal');
    if (addAdminModal) {
        addAdminModal.style.display = 'flex';
        // Reset form
        document.getElementById('addAdminForm').reset();
    }
}

// Load and display current admins
function loadCurrentAdmins() {
    const adminsList = document.getElementById('currentAdminsList');
    if (!adminsList) return;

    if (admins.length === 0) {
        adminsList.innerHTML = '<p style="color: #64748b; text-align: center; padding: 1rem;">No team members found</p>';
        return;
    }

    let adminsHtml = '';
    admins.forEach(admin => {
        const roleDisplay = admin.role === 'super_admin' ? 'Super Admin' : 
                           admin.role === 'admin' ? 'Administrator' : 'Viewer';
        const initials = admin.username.split(' ').map(name => name[0]).join('').toUpperCase();
        const status = admin.role === 'super_admin' ? 'active' : 'active';
        const addedText = getTimeAgo(admin.dateCreated);
        
        adminsHtml += `
            <div class="team-member">
                <div class="member-avatar">
                    <span>${initials}</span>
                </div>
                <div class="member-info">
                    <div class="member-name">${admin.username}</div>
                    <div class="member-role">${roleDisplay}</div>
                    <div class="member-added">Added ${addedText}</div>
                </div>
                <div class="member-status">
                    <span class="status-badge ${status}">${status.toUpperCase()}</span>
                </div>
                <div class="member-actions">
                    <button class="action-btn edit" onclick="editAdmin(${admin.id})" title="Edit Admin">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteAdmin(${admin.id})" title="Delete Admin">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });

    adminsList.innerHTML = adminsHtml;
}

// Helper function to get time ago
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

// Add new admin
function addNewAdmin() {
    const firstName = document.getElementById('newAdminFirstName').value.trim();
    const lastName = document.getElementById('newAdminLastName').value.trim();
    const email = document.getElementById('newAdminEmail').value.trim();
    const password = document.getElementById('newAdminPassword').value;
    const confirmPassword = document.getElementById('newAdminConfirmPassword').value;
    const role = document.getElementById('newAdminRole').value;

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword || !role) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }

    // Create full name
    const fullName = `${firstName} ${lastName}`;

    // Check if email already exists
    const existingAdmin = admins.find(admin => 
        admin.email === email
    );

    if (existingAdmin) {
        showNotification('Email already exists', 'error');
        return;
    }

    // Create new admin
    const newAdmin = {
        id: admins.length + 1,
        username: fullName,
        email: email,
        role: role,
        dateCreated: new Date().toISOString().split('T')[0]
    };

    // In a real application, you would save this to a database
    admins.push(newAdmin);

    // Show success message
    showNotification('Admin added successfully!', 'success');

    // Reload admins list
    loadCurrentAdmins();

    // Reset form
    resetAddAdminForm();

    // Close add admin modal
    document.getElementById('addAdminModal').style.display = 'none';
}

// Reset add admin form
function resetAddAdminForm() {
    const form = document.getElementById('addAdminForm');
    if (form) {
        form.reset();
    }
}

// Edit admin (placeholder function)
function editAdmin(adminId) {
    const admin = admins.find(a => a.id === adminId);
    if (admin) {
        showNotification(`Edit functionality for ${admin.username} will be implemented here`, 'info');
    }
}

// Delete admin
function deleteAdmin(adminId) {
    const admin = admins.find(a => a.id === adminId);
    if (!admin) return;

    // Prevent deletion of the last super admin
    if (admin.role === 'super_admin') {
        const superAdmins = admins.filter(a => a.role === 'super_admin');
        if (superAdmins.length === 1) {
            showNotification('Cannot delete the last super administrator', 'error');
            return;
        }
    }

    if (confirm(`Are you sure you want to delete admin "${admin.username}"?`)) {
        admins = admins.filter(a => a.id !== adminId);
        loadCurrentAdmins();
        showNotification('Admin deleted successfully', 'success');
    }
}

// Initialize admin modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - initializing admin modal');
    initializeAdminModal();
});


//========================================================
//---------END OF ADMIN FUNCTIONALITIES-------------------
//========================================================


//=========================================
//-------------Item Functions--------------

// Initialize Items Section
function initializeItems() {
    console.log('Initializing Items section...');

    // SLM
    const addSlmBtn = document.getElementById('addSlmBtn');
    if (addSlmBtn) {
        addSlmBtn.onclick = () => {
            document.getElementById('addSlmModal').style.display = 'flex';
        };
    }
    const cancelSlmModal = document.getElementById('cancelSlmModal');
    if (cancelSlmModal) {
        cancelSlmModal.onclick = function() {
            document.getElementById('addSlmModal').style.display = 'none';
        };
    }
    const closeSlmModal = document.getElementById('closeSlmModal');
    if (closeSlmModal) {
        closeSlmModal.onclick = function() {
            document.getElementById('addSlmModal').style.display = 'none';
        };
    }

    // Equipment
    const addEquipmentBtn = document.getElementById('addEquipmentBtn');
    if (addEquipmentBtn) {
        addEquipmentBtn.onclick = () => {
            document.getElementById('addEquipmentModal').style.display = 'flex';
        };
    }
    const cancelEquipmentModal = document.getElementById('cancelEquipmentModal');
    if (cancelEquipmentModal) {
        cancelEquipmentModal.onclick = function() {
            document.getElementById('addEquipmentModal').style.display = 'none';
        };
    }
    const closeEquipmentModal = document.getElementById('closeEquipmentModal');
    if (closeEquipmentModal) {
        closeEquipmentModal.onclick = function() {
            document.getElementById('addEquipmentModal').style.display = 'none';
        };
    }

    // TVL
    const addTvlBtn = document.getElementById('addTvlBtn');
    if (addTvlBtn) {
        addTvlBtn.onclick = () => {
            document.getElementById('addTvlModal').style.display = 'flex';
        };
    }
    const cancelTvlModal = document.getElementById('cancelTvlModal');
    if (cancelTvlModal) {
        cancelTvlModal.onclick = function() {
            document.getElementById('addTvlModal').style.display = 'none';
        };
    }
    const closeTvlModal = document.getElementById('closeTvlModal');
    if (closeTvlModal) {
        closeTvlModal.onclick = function() {
            document.getElementById('addTvlModal').style.display = 'none';
        };
    }

    // Lesson
    const addLessonBtn = document.getElementById('addLessonBtn');
    if (addLessonBtn) {
        addLessonBtn.onclick = () => {
            document.getElementById('addLessonModal').style.display = 'flex';
        };
    }
    const cancelLessonModal = document.getElementById('cancelLessonModal');
    if (cancelLessonModal) {
        cancelLessonModal.onclick = function() {
            document.getElementById('addLessonModal').style.display = 'none';
        };
    }
    const closeLessonModal = document.getElementById('closeLessonModal');
    if (closeLessonModal) {
        closeLessonModal.onclick = function() {
            document.getElementById('addLessonModal').style.display = 'none';
        };
    }
    // Textbook
    const addTextbookBtn = document.getElementById('addTextbookBtn');
    if (addTextbookBtn) {
        addTextbookBtn.onclick = () => {
            document.getElementById('addTextbookModal').style.display = 'flex';
        };
    }
    const cancelTextbookModal = document.getElementById('cancelTextbookModal');
    if (cancelTextbookModal) {
        cancelTextbookModal.onclick = function() {
            document.getElementById('addTextbookModal').style.display = 'none';
        };
    }
    const closeTextbookModal = document.getElementById('closeTextbookModal');
    if (closeTextbookModal) {
        closeTextbookModal.onclick = function() {
            document.getElementById('addTextbookModal').style.display = 'none';
        };
    }   
    // Load initial items
    loadItems();

    // Setup edit modals
    setupSlmEditModal();
    setupEquipmentEditModal();
    setupTvlEditModal();
    setupLessonEditModal();
    setupTextbookEditModal();
}
// Setup Add Item Button Event Listeners (for debugging)
function setupAddItemButtons() {
    console.log('Checking add item buttons...');
    
    // Check if buttons exist
    const addSlmBtn = document.getElementById('addSlmBtn');
    const addEquipmentBtn = document.getElementById('addEquipmentBtn');
    const addTvlBtn = document.getElementById('addTvlBtn');
    const addLessonBtn = document.getElementById('addLessonBtn');
    const addTextbookBtn = document.getElementById('addTextbookBtn');

    console.log('Button existence check:');
    console.log('- addSlmBtn:', !!addSlmBtn);
    console.log('- addEquipmentBtn:', !!addEquipmentBtn);
    console.log('- addTvlBtn:', !!addTvlBtn);
    console.log('- addLessonBtn:', !!addLessonBtn);
    console.log('- addTextbookBtn:', !!addTextbookBtn);
}

setupSlmEditModal();
setupEquipmentEditModal();
setupTvlEditModal();
setupLessonEditModal();
setupTextbookEditModal();

// --- Add Item Form Submission Handlers ---
document.addEventListener('DOMContentLoaded', function() {
    // SLM Add Form
    const addSlmForm = document.getElementById('addSlmForm');
    if (addSlmForm) {
        addSlmForm.onsubmit = async function(e) {
            e.preventDefault();
            const data = {
                title: document.getElementById('slmTitle').value,
                subject: document.getElementById('slmSubject').value,
                gradeLevel: document.getElementById('slmGradeLevel').value,
                quarter: document.getElementById('slmQuarter').value,
                quantity: parseInt(document.getElementById('slmQuantity').value),
                status: document.getElementById('slmStatus').value,
                description: document.getElementById('slmDescription').value
            };
            const res = await fetch('/api/items/slm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                document.getElementById('addSlmModal').style.display = 'none';
                addSlmForm.reset();
                loadItems();
            } else {
                alert('Failed to add SLM item!');
            }
        };
    }

    // Equipment Add Form
    const addEquipmentForm = document.getElementById('addEquipmentForm');
    if (addEquipmentForm) {
        addEquipmentForm.onsubmit = async function(e) {
            e.preventDefault();
            const data = {
                equipmentName: document.getElementById('equipmentName').value,
                equipmentType: document.getElementById('equipmentType').value,
                quantity: parseInt(document.getElementById('equipmentQuantity').value),
                status: document.getElementById('equipmentStatus').value,
                description: document.getElementById('equipmentDescription').value
            };
            const res = await fetch('/api/items/equipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                document.getElementById('addEquipmentModal').style.display = 'none';
                addEquipmentForm.reset();
                loadItems();
            } else {
                alert('Failed to add Equipment item!');
            }
        };
    }

    // TVL Add Form
    const addTvlForm = document.getElementById('addTvlForm');
    if (addTvlForm) {
        addTvlForm.onsubmit = async function(e) {
            e.preventDefault();
            const data = {
                itemName: document.getElementById('tvlName').value,
                track: document.getElementById('tvlTrack').value,
                strand: document.getElementById('tvlStrand').value,
                gradeLevel: document.getElementById('tvlGradeLevel').value,
                quantity: parseInt(document.getElementById('tvlQuantity').value),
                status: document.getElementById('tvlStatus').value,
                description: document.getElementById('tvlDescription').value
            };
            const res = await fetch('/api/items/tvl', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                document.getElementById('addTvlModal').style.display = 'none';
                addTvlForm.reset();
                loadItems();
            } else {
                alert('Failed to add TVL item!');
            }
        };
    }

    // Lesson Add Form
    const addLessonForm = document.getElementById('addLessonForm');
    if (addLessonForm) {
        addLessonForm.onsubmit = async function(e) {
            e.preventDefault();
            const data = {
                lessonTitle: document.getElementById('lessonTitle').value,
                subject: document.getElementById('lessonSubject').value,
                gradeLevel: document.getElementById('lessonGradeLevel').value,
                quarter: document.getElementById('lessonQuarter').value,
                week: document.getElementById('lessonWeek').value,
                status: document.getElementById('lessonStatus').value,
                description: document.getElementById('lessonDescription').value
            };
            const res = await fetch('/api/items/lesson', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                document.getElementById('addLessonModal').style.display = 'none';
                addLessonForm.reset();
                loadItems();
            } else {
                alert('Failed to add Lesson item!');
            }
        };
    }
    // Textbook Add Form
    const addTextbookForm = document.getElementById('addTextbookForm');
    if (addTextbookForm) {
        addTextbookForm.onsubmit = async function(e) {
            e.preventDefault();
            const data = {
                title: document.getElementById('textbookTitle').value,
                subject: document.getElementById('textbookSubject').value,
                grade_level: document.getElementById('textbookGradeLevel').value,
                quantity: parseInt(document.getElementById('textbookQuantity').value),
                status: document.getElementById('textbookStatus').value,
                description: document.getElementById('textbookDescription').value
            };
            const res = await fetch('/api/items/textbooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (res.ok) {
                document.getElementById('addTextbookModal').style.display = 'none';
                addTextbookForm.reset();
                loadItems();
            } else {
                alert('Failed to add Textbook item!');
            }
        };
    }
});
//SLM Edit Form Submission Handler
document.getElementById('editSlmForm').onsubmit = async function(e) {
    e.preventDefault();
    alert('Form submitted!');
    const id = document.getElementById('editSlmId').value;
    const data = {
        title: document.getElementById('editSlmTitle').value,
        subject: document.getElementById('editSlmSubject').value,
        gradeLevel: document.getElementById('editSlmGradeLevel').value,
        quarter: document.getElementById('editSlmQuarter').value,
        quantity: parseInt(document.getElementById('editSlmQuantity').value),
        status: document.getElementById('editSlmStatus').value,
        description: document.getElementById('editSlmDescription').value
    };
    console.log('PUT URL:', `/api/items/slm/${id}`);
    await fetch(`/api/items/slm/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    document.getElementById('editSlmModal').style.display = 'none';
    loadItems();
};

// Equipment Edit Form Submission Handler
document.getElementById('editEquipmentForm').onsubmit = async function(e) {
    e.preventDefault();
    alert('Form submitted!');
    const id = document.getElementById('editEquipmentId').value;
    const data = {
        equipmentName: document.getElementById('editEquipmentName').value,
        equipmentType: document.getElementById('editEquipmentType').value,
        quantity: parseInt(document.getElementById('editEquipmentQuantity').value),
        status: document.getElementById('editEquipmentStatus').value,
        description: document.getElementById('editEquipmentDescription').value
    };
    console.log('PUT URL:', `/api/items/equipment/${id}`);
    await fetch(`/api/items/equipment/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    document.getElementById('editEquipmentModal').style.display = 'none';
    loadItems();
};

// TVL Edit Form Submission Handler
document.getElementById('editTvlForm').onsubmit = async function(e) {
    e.preventDefault();
    alert('Form submitted!');
    const id = document.getElementById('editTvlId').value;
    const data = {
        itemName: document.getElementById('editTvlName').value,
        track: document.getElementById('editTvlTrack').value,
        strand: document.getElementById('editTvlStrand').value,
        gradeLevel: document.getElementById('editTvlGradeLevel').value,
        quantity: parseInt(document.getElementById('editTvlQuantity').value),
        status: document.getElementById('editTvlStatus').value,
        description: document.getElementById('editTvlDescription').value
    };
    console.log('PUT URL:', `/api/items/tvl/${id}`);
    await fetch(`/api/items/tvl/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    document.getElementById('editTvlModal').style.display = 'none';
    loadItems();
};

// Lesson Exemplar Edit Form Submission Handler
document.getElementById('editLessonForm').onsubmit = async function(e) {
    e.preventDefault();
    alert('Form submitted!');
    const id = document.getElementById('editLessonId').value;
    const data = {
        lessonTitle: document.getElementById('editLessonTitle').value,
        subject: document.getElementById('editLessonSubject').value,
        gradeLevel: document.getElementById('editLessonGradeLevel').value,
        quarter: document.getElementById('editLessonQuarter').value,
        week: document.getElementById('editLessonWeek').value,
        status: document.getElementById('editLessonStatus').value,
        description: document.getElementById('editLessonDescription').value
    };
    console.log('PUT URL:', `/api/items/lesson/${id}`);
    await fetch(`/api/items/lesson/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    document.getElementById('editLessonModal').style.display = 'none';
    loadItems();
};  
// Textbook Edit Form Submission Handler
document.getElementById('editTextbookForm').onsubmit = async function(e) {
    e.preventDefault();
    const id = document.getElementById('editTextbookId').value;
    const data = {
        title: document.getElementById('textbookTitle').value,
        subject: document.getElementById('textbookSubject').value,
        grade_level: document.getElementById('textbookGradeLevel').value,
        quantity: parseInt(document.getElementById('textbookQuantity').value),
        status: document.getElementById('textbookStatus').value,
        description: document.getElementById('textbookDescription').value
    };
    console.log('PUT URL:', `/api/items/textbooks/${id}`);
    await fetch(`/api/items/textbooks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    document.getElementById('editTextbookModal').style.display = 'none';
    loadItems();
};
//----------End of Item Functions----------
//=========================================

//RESOURCES SECTION FUNCTIONALITIES
// --- Modern Resources Section Logic ---
document.addEventListener('DOMContentLoaded', () => {
    setupModernResourcesSection();
    setupAddResourceModalDynamicItems();
    setupAddResourceModalClose();
    setupAddResourceFormSubmission();
    setupResourcesNavTabs();
    setupEditResourceModal();
});


function setupAddResourceFormSubmission() {
    const form = document.getElementById('addResourceForm');
    if (!form) return;

    form.onsubmit = async function (e) {
        e.preventDefault();

        // Gather form data
        const SchoolID = document.getElementById('resourceSchool')?.value || (window.selectedSchool && window.selectedSchool.SchoolID) || '';
        const ResourceCategory = document.getElementById('resourceCategory').value;
        const itemDropdown = document.getElementById('resourceItemDropdown');
        const ResourceItemID = itemDropdown.value;
        const ResourceName = itemDropdown.selectedOptions[0]?.textContent || '';
        const Quantity = document.getElementById('resourceQuantity').value;
        const DateDistributed = new Date().toISOString();
        const SchoolYear = document.getElementById('resourceSchoolYear').value;
        const GradeLevel = document.getElementById('resourceGradeLevel').value;

        const payload = {
            SchoolID,
            ResourceCategory,
            ResourceItemID,
            ResourceName,
            Quantity,
            DateDistributed,
            SchoolYear,
            GradeLevel
        };

        try {
            console.log('Submitting payload:', payload);
            const res = await fetch('/api/distributed-resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                document.getElementById('addResourceModal').style.display = 'none';
                alert('Resource added!');
                form.reset();
                
                // Update dashboard stats after adding resource
                await updateDashboardStats();
                
                // REFRESH THE TABLE IMMEDIATELY FOR THE SELECTED SCHOOL
                if (window.selectedSchool && typeof window.loadResourcesForSchool === 'function') {
                    console.log('Refreshing resources for school:', window.selectedSchool);
                    await window.loadResourcesForSchool(window.selectedSchool);
                } else {
                    console.log('Cannot refresh: selectedSchool or loadResourcesForSchool not available');
                }
            } else {
                alert('Failed to add resource.');
            }
        } catch (err) {
            alert('Error: ' + err.message); 
        }
    };
}


function setupModernResourcesSection() {
    const sidebar = document.getElementById('resourcesSchoolsList');
    const filter = document.getElementById('resourcesLevelFilter');
    const search = document.getElementById('resourcesSchoolSearch');
    const breadcrumb = document.getElementById('resourcesBreadcrumb');
    const mainContent = document.getElementById('resourcesMainContent');
    const schoolHeader = document.getElementById('resourcesSchoolHeader');
    const tableBody = document.getElementById('distributedResourcesTableBody');
    let allSchools = [];
    let selectedSchool = null;
    
    // Load all schools from API
    async function loadSchools() {
      try {
        const res = await fetch('/api/schools');
        allSchools = await res.json();
        renderSchoolList();
      } catch (err) {
        sidebar.innerHTML = '<p style="color:red">Failed to load schools.</p>';
      }
    }
    
    // Make loadSchools globally accessible
    window.refreshResourcesSidebar = loadSchools;
  
    // Render the sidebar school list with filter/search
    function renderSchoolList() {
      sidebar.innerHTML = '';
      let filtered = allSchools;
      const level = filter.value;
      const q = search.value.trim().toLowerCase();
      if (level) {
        filtered = filtered.filter(s => (s.Level || '').toLowerCase() === level.toLowerCase());
      }
      if (q) {
        filtered = filtered.filter(s =>
          (s.Name || '').toLowerCase().includes(q) ||
          (s.District || '').toLowerCase().includes(q) ||
          (s.Level || '').toLowerCase().includes(q)
        );
      }
      if (filtered.length === 0) {
        sidebar.innerHTML = '<p style="color:#64748b; text-align:center;">No schools found.</p>';
        return;
      }
      filtered.forEach(school => {
        const card = document.createElement('div');
        card.className = 'resources-school-card' + (selectedSchool && selectedSchool.SchoolID === school.SchoolID ? ' selected' : '');
        card.innerHTML = `
          <div class="resources-school-name">${school.Name}</div>
          <div class="resources-school-meta">${school.Level || ''} &bull; ${school.Enrollees || 0} students &bull; ${school.District || ''}</div>
        `;
        card.onclick = () => selectSchool(school);
        sidebar.appendChild(card);
      });
    }
  
    // Select a school and show its resources
    function selectSchool(school) {
      selectedSchool = school;
      window.selectedSchool = school;
      renderSchoolList();
      renderBreadcrumb();
      renderSchoolHeader();
      loadResourcesForSchool(school);
    }
  
    // Render the breadcrumb
    function renderBreadcrumb() {
      if (!selectedSchool) {
        breadcrumb.innerHTML = 'Resources > All Schools';
      } else {
        breadcrumb.innerHTML = `<a href="#" id="resourcesBackLink">Resources</a> &nbsp;>&nbsp; <a href="#" id="resourcesAllSchoolsLink">All Schools</a> &nbsp;>&nbsp; <span>${selectedSchool.Name}</span>`;
        setTimeout(() => {
          document.getElementById('resourcesBackLink').onclick = (e) => { e.preventDefault(); resetView(); };
          document.getElementById('resourcesAllSchoolsLink').onclick = (e) => { e.preventDefault(); resetView(); };
        }, 0);
      }
    }
  
    // Render the school header (name + Add Resource button)
    function renderSchoolHeader() {
        if (!selectedSchool) {
            schoolHeader.innerHTML = '';
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#64748b;">Select a school to view resources.</td></tr>';
            return;
        }
        schoolHeader.innerHTML = `
            <h2 style="font-size:1.3rem;font-weight:600;color:#1e293b;">${selectedSchool.Name} - Resources</h2>
            <button class="btn-primary" id="addResourceBtn"><i class="fas fa-plus"></i> Add Resource</button>
        `;
        document.getElementById('addResourceBtn').onclick = () => {
            document.getElementById('addResourceModal').style.display = 'flex';
            // Pre-select school in modal
            const schoolSelect = document.getElementById('resourceSchool');
            if (schoolSelect) {
                schoolSelect.value = selectedSchool.SchoolID;
                schoolSelect.disabled = true;
            }
            // Populate grade levels based on school level
            populateGradeLevels(selectedSchool.Level);
        };
    }
  
    // Load resources for the selected school - MAKE THIS GLOBALLY ACCESSIBLE
    async function loadResourcesForSchool(school) {
      const tableBody = document.getElementById('distributedResourcesTableBody');
      if (!tableBody) {
        console.error('Table body not found');
        return;
      }
      
              tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#64748b;">Loading...</td></tr>';
      try {
        const res = await fetch(`/api/distributed-resources/by-school/${encodeURIComponent(school.SchoolID)}?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        console.log('Loaded resources:', data); 
        if (!data.length) {
          tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#64748b;">No resources found for this school.</td></tr>';
          return;
        }
        tableBody.innerHTML = '';
        data.forEach(r => {
          console.log('Resource data:', r); // Debug: log the resource data
          const status = (r.Status || 'active').toLowerCase();
          let statusColor = '#22c55e';
          if (status === 'inactive' || status === 'retired' || status === 'archived' || status === 'out of order') statusColor = '#ef4444';
          else if (status === 'under maintenance' || status === 'under review') statusColor = '#f59e42';
          else if (status === 'in use') statusColor = '#3b82f6';
          tableBody.innerHTML += `
            <tr>
              <td>${r.ResourceName || ''}</td>
              <td>${r.Category || r.ResourceCategory || ''}</td>
              <td>${r.Quantity || '0'}</td>
              <td>${r.SchoolYear || 'N/A'}</td>
              <td>${r.GradeLevel || 'N/A'}</td>
              <td>${r.LastUpdated ? new Date(r.LastUpdated).toLocaleDateString() : (r.DateDistributed ? new Date(r.DateDistributed).toLocaleDateString() : '')}</td>
              <td><span style="background:${statusColor};color:#fff;padding:0.25em 0.7em;border-radius:12px;font-size:0.97em;">${r.Status || 'active'}</span></td>
              <td>
                <button class="btn-icon" onclick="openEditModal(${JSON.stringify(r).replace(/"/g, '&quot;')})" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" onclick="deleteResource(${r.ResourceID || r.id || r.resourceID || r.resource_id})" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          `;
        });
      } catch (err) {
        console.error('Error loading resources:', err);
        tableBody.innerHTML = '<tr><td colspan="8" style="color:red">Failed to load resources.</td></tr>';
      }
    }
    
    // EXPOSE THE FUNCTION GLOBALLY SO IT CAN BE CALLED FROM THE FORM SUBMISSION
    window.loadResourcesForSchool = loadResourcesForSchool;
    
    // Delete resource function
    async function deleteResource(resourceId) {
        console.log('deleteResource called with ID:', resourceId);
        
        if (!resourceId) {
            console.error('No resource ID provided');
            showNotification('No resource ID provided', 'error');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this resource?')) {
            return;
        }
        
        try {
            console.log('Sending DELETE request to:', `/api/distributed-resources/${resourceId}`);
            const response = await fetch(`/api/distributed-resources/${resourceId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
            });
            
            console.log('Response status:', response.status);
            
            if (response.ok) {
                showNotification('Resource deleted successfully!', 'success');
                // Refresh the resources table for the current school
                if (window.selectedSchool) {
                    await loadResourcesForSchool(window.selectedSchool);
                }
            } else {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                showNotification(`Failed to delete resource: ${errorData.error || errorData.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error deleting resource:', error);
            showNotification('Error deleting resource. Please try again.', 'error');
        }
    }
    
    // Expose delete function globally
    window.deleteResource = deleteResource;
  
    // Reset to all schools view
    function resetView() {
      selectedSchool = null;
      renderBreadcrumb();
      renderSchoolHeader();
      tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#64748b;">Select a school to view resources.</td></tr>';
      renderSchoolList();
    }
  
    // Filter/search listeners
    filter.onchange = renderSchoolList;
    search.oninput = renderSchoolList;
  
    // Initial render
    resetView();
    loadSchools();
  }

function setupAddResourceModalDynamicItems() {
    const categorySelect = document.getElementById('resourceCategory');
    const itemDropdown = document.getElementById('resourceItemDropdown');

    if (!categorySelect || !itemDropdown) return;

    // Map category dropdown value to endpoint
    const categoryToEndpoint = {
        'SLM/SLAS': '/api/items/slm',
        'Equipment': '/api/items/equipment',
        'TVL': '/api/items/tvl',
        'Lesson Exemplar(Matatag)': '/api/items/lesson',
        'Textbook': '/api/items/textbooks',
    };

    categorySelect.addEventListener('change', async function() {
        const selectedCategory = categorySelect.value;
        itemDropdown.innerHTML = '<option value="">Loading...</option>';

        if (!selectedCategory || !categoryToEndpoint[selectedCategory]) {
            itemDropdown.innerHTML = '<option value="">Select Item</option>';
            return;
        }

        try {
            const res = await fetch(categoryToEndpoint[selectedCategory]);
            const items = await res.json();

            if (!Array.isArray(items) || items.length === 0) {
                itemDropdown.innerHTML = '<option value="">No items found</option>';
                return;
            }

            // Build options based on category
            let optionsHtml = '<option value="">Select Item</option>';
            items.forEach(item => {
                let value, label;
                if (selectedCategory === 'SLM/SLAS') {
                    value = item.SLMItemID || item.id || item.title;
                    label = item.Title || item.title;
                } else if (selectedCategory === 'Equipment') {
                    value = item.EquipmentID || item.id || item.equipmentName;
                    label = item.EquipmentName || item.equipmentName;
                } else if (selectedCategory === 'TVL') {
                    value = item.TVLItemID || item.id || item.itemName;
                    label = item.ItemName || item.itemName;
                } else if (selectedCategory === 'Lesson Exemplar(Matatag)') {
                    value = item.LessonID || item.id || item.lessonTitle;
                    label = item.LessonTitle || item.lessonTitle;
                } else if (selectedCategory === 'Textbook') {
                    value = item.TextbookID || item.id || item.title;
                    label = item.Title || item.title;
                } else {
                    value = item.id || item.name;
                    label = item.name || item.title;
                }
                optionsHtml += `<option value="${value}">${label}</option>`;
            });
            itemDropdown.innerHTML = optionsHtml;
        } catch (err) {
            itemDropdown.innerHTML = '<option value="">Error loading items</option>';
        }
    });
}

function populateGradeLevels(schoolLevel, selectId = 'resourceGradeLevel') {
    const gradeLevelSelect = document.getElementById(selectId);
    if (!gradeLevelSelect) return;

    let grades = [];
    if (!schoolLevel) {
        gradeLevelSelect.innerHTML = '<option value="">Select Grade Level</option>';
        return;
    }

    const level = schoolLevel.toLowerCase();
    if (level.includes('elementary')) {
        grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
    } else if (level.includes('junior')) {
        grades = ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
    } else if (level.includes('senior')) {
        grades = ['Grade 11', 'Grade 12'];
    } else {
        grades = [
            'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
            'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
        ];
    }

    gradeLevelSelect.innerHTML = '<option value="">Select Grade Level</option>' +
        grades.map(g => `<option value="${g}">${g}</option>`).join('');
}

//  CLOSE THE ADD RESOURCE MODAL
function setupAddResourceModalClose() {
    const modal = document.getElementById('addResourceModal');
    const closeBtn = document.getElementById('closeResourceModal');
    const cancelBtn = document.getElementById('cancelResourceModal');

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            modal.style.display = 'none';
        };
    }
    // Optional: close modal when clicking outside modal content
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}


function setupResourcesNavTabs() {
    const nav = document.getElementById('resourcesNavTabs');
    if (!nav) return;
    const buttons = nav.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
      btn.onclick = function() {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        filterResourcesByTab(tab);
      };
    });
  }
  
  function filterResourcesByTab(tab) {
    const table = document.getElementById('distributedResourcesTableBody');
    if (!table) return;
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      if (tab === 'all') {
        row.style.display = '';
      } else if (tab === 'slm') {
        row.style.display = row.innerText.toLowerCase().includes('slm') ? '' : 'none';
      } else if (tab === 'equipment') {
        row.style.display = row.innerText.toLowerCase().includes('equipment') ? '' : 'none';
      } else if (tab === 'tvl') {
        row.style.display = row.innerText.toLowerCase().includes('tvl') ? '' : 'none';
      } else if (tab === 'lesson') {
        row.style.display = row.innerText.toLowerCase().includes('lesson exemplar') ? '' : 'none';
      } else if (tab === 'textbook') {
        row.style.display = row.innerText.toLowerCase().includes('textbook') ? '' : 'none';
      } else {
        row.style.display = '';
      }
    });
  }
  
  function setupEditResourceModal() {
      const modal = document.getElementById('editResourceModal');
      const closeBtn = document.getElementById('closeEditResourceModal');
      const cancelBtn = document.getElementById('cancelEditResourceModal');
      const form = document.getElementById('editResourceForm');
      const categorySelect = document.getElementById('editResourceCategory');
      const itemDropdown = document.getElementById('editResourceItemDropdown');
  
      if (closeBtn) {
          closeBtn.onclick = () => {
              modal.style.display = 'none';
          };
      }
      if (cancelBtn) {
          cancelBtn.onclick = () => {
              modal.style.display = 'none';
          };
      }
  
      // Close modal when clicking outside
      window.onclick = function(event) {
          if (event.target === modal) {
              modal.style.display = 'none';
          }
      };
  
      // Setup dynamic item loading for edit modal
      if (categorySelect && itemDropdown) {
          const categoryToEndpoint = {
              'SLM/SLAS': '/api/items/slm',
              'Equipment': '/api/items/equipment',
              'TVL': '/api/items/tvl',
              'Lesson Exemplar(Matatag)': '/api/items/lesson',
              'Textbook': '/api/items/textbooks',
          };
  
          categorySelect.addEventListener('change', async function() {
              const selectedCategory = categorySelect.value;
              itemDropdown.innerHTML = '<option value="">Loading...</option>';
  
              if (!selectedCategory || !categoryToEndpoint[selectedCategory]) {
                  itemDropdown.innerHTML = '<option value="">Select Item</option>';
                  return;
              }
  
              try {
                  const res = await fetch(categoryToEndpoint[selectedCategory]);
                  const items = await res.json();
  
                  if (!Array.isArray(items) || items.length === 0) {
                      itemDropdown.innerHTML = '<option value="">No items found</option>';
                      return;
                  }
  
                  // Build options based on category
                  let optionsHtml = '<option value="">Select Item</option>';
                  items.forEach(item => {
                      let value, label;
                      if (selectedCategory === 'SLM/SLAS') {
                          value = item.SLMItemID || item.id || item.title;
                          label = item.Title || item.title;
                      } else if (selectedCategory === 'Equipment') {
                          value = item.EquipmentID || item.id || item.equipmentName;
                          label = item.EquipmentName || item.equipmentName;
                      } else if (selectedCategory === 'TVL') {
                          value = item.TVLItemID || item.id || item.itemName;
                          label = item.ItemName || item.itemName;
                      } else if (selectedCategory === 'Lesson Exemplar(Matatag)') {
                          value = item.LessonID || item.id || item.lessonTitle;
                          label = item.LessonTitle || item.lessonTitle;
                      } else if (selectedCategory === 'Textbook') {
                          value = item.TextbookID || item.id || item.title;
                          label = item.Title || item.title;
                      } else {
                          value = item.id || item.name;
                          label = item.name || item.title;
                      }
                      optionsHtml += `<option value="${value}">${label}</option>`;
                  });
                  itemDropdown.innerHTML = optionsHtml;
              } catch (err) {
                  itemDropdown.innerHTML = '<option value="">Error loading items</option>';
              }
          });
      }
  
      // Setup form submission
      if (form) {
          form.onsubmit = async function(e) {
              e.preventDefault();
              
              // Gather form data
              const formData = {
                  ResourceCategory: document.getElementById('editResourceCategory').value,
                  ResourceItemID: document.getElementById('editResourceItemDropdown').value,
                  Quarter: document.getElementById('editResourceQuarter').value,
                  GradeLevel: document.getElementById('editResourceGradeLevel').value,
                  Quantity: document.getElementById('editResourceQuantity').value,
                  SchoolYear: document.getElementById('editResourceSchoolYear').value
              };
              
              console.log('Edit form data:', formData);
              
              // Handle edit form submission here
              alert('Edit functionality will be implemented here. Form data: ' + JSON.stringify(formData));
              modal.style.display = 'none';
          };
      }
  }
  
  // Function to open edit modal with resource data
function openEditModal(resourceData) {
    const modal = document.getElementById('editResourceModal');
    if (!modal) return;

    console.log('Opening edit modal with resource data:', resourceData);

    // Use the school level from resourceData or window.selectedSchool
    let schoolLevel = resourceData.Level || (window.selectedSchool && window.selectedSchool.Level) || '';
    populateGradeLevels(schoolLevel, 'editResourceGradeLevel'); // <-- Pass the correct select id

    // Populate form fields with resource data
    document.getElementById('editResourceCategory').value = resourceData.ResourceCategory || '';
    document.getElementById('editResourceItemDropdown').value = resourceData.ResourceItemID || '';
    document.getElementById('editResourceQuarter').value = resourceData.Quarter || '';
    document.getElementById('editResourceGradeLevel').value = resourceData.GradeLevel || '';
    document.getElementById('editResourceQuantity').value = resourceData.Quantity || '';
    document.getElementById('editResourceSchoolYear').value = resourceData.SchoolYear || '';

    // Trigger item loading for the selected category
    const categorySelect = document.getElementById('editResourceCategory');
    const itemDropdown = document.getElementById('editResourceItemDropdown');

    if (categorySelect && itemDropdown) {
        // Trigger the change event to load items for the selected category
        const changeEvent = new Event('change', { bubbles: true });
        categorySelect.dispatchEvent(changeEvent);

        // Set the item value after a short delay to ensure items are loaded
        setTimeout(() => {
            document.getElementById('editResourceItemDropdown').value = resourceData.ResourceItemID || '';
        }, 300);
    }

    // Show modal
    modal.style.display = 'flex';
}
  


  // ... existing code ...
//End Of Resources Section Funcionalities


//========================================
// --- School Section Functionality ---
//========================================


// Enhanced search bar design
const schoolSearchInput = document.getElementById('schoolSearchInput');
if (schoolSearchInput) {
    schoolSearchInput.classList.add('enhanced-search');
    schoolSearchInput.placeholder = 'Search schools by name, ID, district, or principal...';
    schoolSearchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const rows = document.querySelectorAll('.school-table tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}


// Delete item functionality
document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-icon') && e.target.closest('.fa-trash')) {
        const row = e.target.closest('tr');
        const tableId = row.closest('table').id || row.closest('table').className;
        if (confirm('Are you sure you want to delete this item?')) {
            // Handle different table types
            if (tableId === 'schoolTableBody' || tableId === 'school-table') {
                // Delete school from backend
                const schoolId = row.querySelector('td:nth-child(2)').textContent; // School ID
                deleteSchool(schoolId, row);
            } else if (tableId === 'resourcesTableBody' || tableId === 'resources-table') {
                // Delete resource (frontend only for now)
                const resourceName = row.querySelector('td:nth-child(1)').textContent;
                const resourceCategory = row.querySelector('td:nth-child(2)').textContent;
                const resourceGradeLevel = row.querySelector('td:nth-child(6)').textContent;
                const resourceSchool = row.querySelector('td:nth-child(7)').textContent;
                row.remove();
                showNotification('Resource deleted successfully!', 'success');
                addActivity('resource_deleted', 'Resource removed', `${resourceName} (${resourceCategory}) - ${resourceGradeLevel} was deleted from ${resourceSchool}`);
                
                // Update dashboard stats after deleting resource
                updateDashboardStats();
            }
            // Remove the generic delete for other tables
        }
    }
});


// Add School Modal Functionality
const addSchoolBtn = document.getElementById('addSchoolBtn');
const addSchoolModal = document.getElementById('addSchoolModal');
const closeSchoolModal = document.getElementById('closeSchoolModal');
const cancelSchoolModal = document.getElementById('cancelSchoolModal');
const addSchoolForm = document.getElementById('addSchoolForm');
const schoolTableBody = document.getElementById('schoolTableBody');

// Fetch and display schools from the backend
async function loadSchoolsForTable() {
    console.log('loadSchoolsForTable called');
    const schoolTableBody = document.getElementById('schoolTableBody');
    console.log('schoolTableBody element:', schoolTableBody);
    if (!schoolTableBody) {
        console.error('School table body not found!');
        return;
    }
    
    try {
        console.log('Attempting to fetch schools from database for table...');
        const response = await fetch('http://localhost:3000/api/schools');
        console.log('Response status:', response.status);
        const schools = await response.json();
        console.log('Fetched schools for table:', schools);
        console.log('Number of schools fetched:', schools.length);
        
        schoolTableBody.innerHTML = '';
        schools.forEach((school, index) => {
            console.log(`Processing school ${index + 1}:`, school);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${school.Name || 'N/A'}</td>
                <td>${school.SchoolID || 'N/A'}</td>
                <td>${school.Enrollees || 'N/A'}</td>
                <td>${school.District || 'N/A'}</td>
                <td>${school.Level || 'N/A'}</td>
                <td>${school.Principal || 'N/A'}</td>
                <td>${school.Contact || 'N/A'}</td>
                <td>${school.Email || 'N/A'}</td>
                <td>
                    <button class="btn-icon"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon"><i class="fas fa-trash"></i></button>
                </td>
            `;
            schoolTableBody.appendChild(tr);
            console.log(`Added school ${index + 1} to table`);
        });
        console.log('Added database schools to table. Total rows:', schoolTableBody.children.length);
    } catch (error) {
        console.error('Error fetching schools for table:', error);
        console.log('Falling back to sample schools for table...');
        
        // Fallback to sample schools
        schoolTableBody.innerHTML = '';
        sampleSchools.forEach(school => {
            console.log('Creating table row for sample school:', school.name);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${school.name}</td>
                <td>${school.schoolId}</td>
                <td>${school.enrollees}</td>
                <td>${school.district}</td>
                <td>${school.level}</td>
                <td>${school.principal}</td>
                <td>${school.contact}</td>
                <td>${school.email}</td>
                <td>
                    <button class="btn-icon"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon"><i class="fas fa-trash"></i></button>
                </td>
            `;
            schoolTableBody.appendChild(tr);
        });
        console.log('Added sample schools to table. Total:', sampleSchools.length);
    }
}


if (addSchoolBtn && addSchoolModal && closeSchoolModal && cancelSchoolModal && addSchoolForm && schoolTableBody) {
    addSchoolBtn.addEventListener('click', () => {
        // Safeguard: Remove any duplicate modals
        document.querySelectorAll('#addSchoolModal').forEach((modal, idx) => {
            if (idx > 0) modal.remove();
        });
        addSchoolModal.style.display = 'flex';
    });
    function hideSchoolModal() {
        addSchoolModal.style.display = 'none';
    }
    closeSchoolModal.addEventListener('click', hideSchoolModal);
    cancelSchoolModal.addEventListener('click', hideSchoolModal);
    addSchoolForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const school = {
            name: document.getElementById('schoolName').value,
            id: document.getElementById('schoolId').value,
            enrollees: document.getElementById('enrollees').value,
            district: document.getElementById('district').value,
            level: document.getElementById('level').value,
            principal: document.getElementById('principal').value,
            contact: document.getElementById('contact').value,
            email: document.getElementById('email').value
        };
        try {
            const response = await fetch('http://localhost:3000/api/schools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(school)
            });
            if (!response.ok) {
                const errorData = await response.json();
                showNotification('Failed to add school: ' + (errorData.error || 'Unknown error'), 'error');
                console.error('Failed to add school:', errorData);
                return;
            }
            hideSchoolModal();
            addSchoolForm.reset();
            showNotification('School added successfully!', 'success');
            try {
                addActivity('school_added', 'New school registered', `${school.name} added to ${school.district}`);
                await loadSchoolsForTable(); // Refresh the table from the backend
                updateDashboardStats(); // Update dashboard stats
                // Refresh the resources sidebar if it exists
                if (typeof window.refreshResourcesSidebar === 'function') {
                    console.log('Refreshing resources sidebar...');
                    window.refreshResourcesSidebar();
                } else {
                    console.log('refreshResourcesSidebar function not available');
                }
            } catch (activityError) {
                console.error('Error in post-add activities:', activityError);
                // Don't show error notification for activity errors
            }
        } catch (err) {
            showNotification('Error adding school: ' + err.message, 'error');
            console.error('Error adding school:', err);
        }
    });
} else {
    console.log('Add School modal or form elements not found on DOMContentLoaded');
}

// Show edit school modal
function showEditSchoolModal(row) {
    const cells = row.children;
    const schoolData = {
        name: cells[0].textContent,
        id: cells[1].textContent,
        enrollees: cells[2].textContent,
        district: cells[3].textContent,
        level: cells[4].textContent,
        principal: cells[5].textContent,
        contact: cells[6].textContent,
        email: cells[7].textContent
    };
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Edit School</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editSchoolForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editSchoolName">School Name</label>
                            <input type="text" id="editSchoolName" value="${schoolData.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="editSchoolId">School ID</label>
                            <input type="text" id="editSchoolId" value="${schoolData.id}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editEnrollees">Number of Enrollees</label>
                            <input type="number" id="editEnrollees" value="${schoolData.enrollees}" min="0" required>
                        </div>
                        <div class="form-group">
                            
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editDistrict">District</label>
                            <select id="editDistrict" required>
                                <option value="District 1" ${schoolData.district === 'District 1' ? 'selected' : ''}>District 1</option>
                                <option value="District 2" ${schoolData.district === 'District 2' ? 'selected' : ''}>District 2</option>
                                <option value="District 3" ${schoolData.district === 'District 3' ? 'selected' : ''}>District 3</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="editLevel">Level</label>
                            <select id="editLevel" required>
                                <option value="Elementary" ${schoolData.level === 'Elementary' ? 'selected' : ''}>Elementary</option>
                                <option value="High School" ${schoolData.level === 'High School' ? 'selected' : ''}>High School</option>
                                <option value="Senior High" ${schoolData.level === 'Senior High' ? 'selected' : ''}>Senior High</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editPrincipal">Principal</label>
                            <input type="text" id="editPrincipal" value="${schoolData.principal}" required>
                        </div>
                        <div class="form-group">
                            <label for="editContact">Contact Number</label>
                            <input type="text" id="editContact" value="${schoolData.contact}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="editEmail">Email Address</label>
                            <input type="email" id="editEmail" value="${schoolData.email}" required>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Update School</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('editSchoolForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const updatedSchool = {
            name: document.getElementById('editSchoolName').value,
            id: document.getElementById('editSchoolId').value,
            enrollees: document.getElementById('editEnrollees').value,
            district: document.getElementById('editDistrict').value,
            level: document.getElementById('editLevel').value,
            principal: document.getElementById('editPrincipal').value,
            contact: document.getElementById('editContact').value,
            email: document.getElementById('editEmail').value
        };
        
        try {
            const response = await fetch(`http://localhost:3000/api/schools/${schoolData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSchool)
            });
            
            if (response.ok) {
                // Update the row in the table
                cells[0].textContent = updatedSchool.name;
                cells[1].textContent = updatedSchool.id;
                cells[2].textContent = updatedSchool.enrollees;
                cells[3].textContent = updatedSchool.district;
                cells[4].textContent = updatedSchool.level;
                cells[5].textContent = updatedSchool.principal;
                cells[6].textContent = updatedSchool.contact;
                cells[7].textContent = updatedSchool.email;
                
                modal.remove();
                showNotification('School updated successfully!', 'success');
                addActivity('school_updated', 'School information updated', `${updatedSchool.name} details were modified`);
            } else {
                const errorData = await response.json();
                showNotification(`Failed to update school: ${errorData.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error updating school:', error);
            showNotification('Error updating school: Network error', 'error');
        }
    });
}

// Do not call showEditSchoolModal for item tables
document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-icon') && e.target.closest('.fa-edit')) {
        const row = e.target.closest('tr');
        const tableId = row.closest('table').id || row.closest('table').className;
        if (tableId === 'schoolTableBody' || tableId === 'school-table') {
            showEditSchoolModal(row);
        } else if (tableId === 'resourcesTableBody' || tableId === 'resources-table') {
            showEditResourceModal(row);
        }
        // Do not handle item tables here
    }
});

// Delete school from backend
async function deleteSchool(schoolId, row) {
    const schoolName = row.querySelector('td:nth-child(1)').textContent;
    
    // First, check if the school has distributed resources
    try {
        const checkResponse = await fetch(`http://localhost:3000/api/distributed-resources/by-school/${encodeURIComponent(schoolId)}`);
        const resources = await checkResponse.json();
        
        if (resources && resources.length > 0) {
            // School has resources - show confirmation dialog
            const confirmDelete = confirm(
                `⚠️ WARNING: "${schoolName}" has ${resources.length} distributed resource(s).\n\n` +
                `Do you want to:\n` +
                `• Delete the school AND all its resources? (Click OK)\n` +
                `• Cancel the deletion? (Click Cancel)\n\n` +
                `This action cannot be undone!`
            );
            
            if (!confirmDelete) {
                return; // User cancelled
            }
            
            // User confirmed - delete with cascade
            console.log('Sending cascade delete request for school:', schoolId);
            const response = await fetch(`http://localhost:3000/api/schools/${schoolId}?cascade=true`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                row.remove();
                showNotification(`School "${schoolName}" and ${resources.length} resource(s) deleted successfully!`, 'success');
                try {
                    addActivity('school_deleted', 'School and resources removed', `${schoolName} and ${resources.length} resources were deleted from the system`);
                    // Update dashboard stats after deleting school
                    updateDashboardStats();
                    // Refresh the resources sidebar if it exists
                    if (typeof window.refreshResourcesSidebar === 'function') {
                        console.log('Refreshing resources sidebar after delete...');
                        window.refreshResourcesSidebar();
                    } else {
                        console.log('refreshResourcesSidebar function not available after delete');
                    }
                } catch (activityError) {
                    console.error('Error in post-delete activities:', activityError);
                }
            } else {
                const errorData = await response.json();
                showNotification(`Failed to delete school: ${errorData.error || 'Unknown error'}`, 'error');
            }
        } else {
            // No resources - safe to delete
            const confirmDelete = confirm(`Are you sure you want to delete "${schoolName}"?`);
            
            if (!confirmDelete) {
                return; // User cancelled
            }
            
            const response = await fetch(`http://localhost:3000/api/schools/${schoolId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                row.remove();
                showNotification(`School "${schoolName}" deleted successfully!`, 'success');
                try {
                    addActivity('school_deleted', 'School removed', `${schoolName} was deleted from the system`);
                    // Update dashboard stats after deleting school
                    updateDashboardStats();
                    // Refresh the resources sidebar if it exists
                    if (typeof window.refreshResourcesSidebar === 'function') {
                        console.log('Refreshing resources sidebar after delete...');
                        window.refreshResourcesSidebar();
                    } else {
                        console.log('refreshResourcesSidebar function not available after delete');
                    }
                } catch (activityError) {
                    console.error('Error in post-delete activities:', activityError);
                }
            } else {
                const errorData = await response.json();
                showNotification(`Failed to delete school: ${errorData.error || 'Unknown error'}`, 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting school:', error);
        showNotification('Error deleting school: Network error', 'error');
    }
}
// Load schools on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - initializing school table');
    
    // Initialize school table
    loadSchoolsForTable();
    
    // Initialize other components
    updateDashboardStats();
    loadActivities(); // Load saved activities
    
    // Initialize resources sidebar if available
    setTimeout(() => {
        if (typeof window.refreshResourcesSidebar === 'function') {
            console.log('Initializing resources sidebar...');
            window.refreshResourcesSidebar();
        }
    }, 100);
    
    // Update activity times every minute
    setInterval(updateActivityTimes, 60000);
});


// Make functions globally available
window.backToSchools = backToSchools;
window.showAddResourceModal = showAddResourceModal;
window.showAddSchoolResourceModal = showAddSchoolResourceModal;
window.loadSchools = loadSchools; // Make loadSchools available globally for testing
window.testDatabaseConnection = async () => {
    console.log('Testing database connection...');
    try {
        const response = await fetch('http://localhost:3000/api/schools');
        const schools = await response.json();
        console.log('Database connection successful! Schools found:', schools.length);
        console.log('First school:', schools[0]);
        return schools;
    } catch (error) {
        console.error('Database connection failed:', error);
        return null;
    }
};


// Event delegation for edit/delete actions in school table
document.addEventListener('DOMContentLoaded', function() {
    const schoolTableBody = document.getElementById('schoolTableBody');
    if (schoolTableBody) {
        console.log('Attaching event delegation to schoolTableBody');
        schoolTableBody.addEventListener('click', function(e) {
            const editBtn = e.target.closest('.btn-icon .fa-edit');
            const deleteBtn = e.target.closest('.btn-icon .fa-trash');
            const row = e.target.closest('tr');
            if (!row) return;
            const schoolId = row.children[1]?.textContent;
            if (editBtn) {
                console.log('Edit button clicked for schoolId:', schoolId);
                showEditSchoolModal(row);
            } else if (deleteBtn) {
                console.log('Delete button clicked for schoolId:', schoolId);
                deleteSchool(schoolId, row);
            }
        });
    } else {
        console.log('schoolTableBody not found on DOMContentLoaded');
    }
});

//==============================================
// --- End School Section Functionality ---
//==============================================




//==============================================
// --- Items Section Functionality ---
//==============================================

// Switch item category function
function switchItemCategory(category) {
    // Get all navigation buttons and content sections
    const itemNavBtns = document.querySelectorAll('.item-nav-btn');
    const itemContents = document.querySelectorAll('.item-content');
            
    // Remove active class from all buttons and contents
    itemNavBtns.forEach(btn => btn.classList.remove('active'));
    itemContents.forEach(content => content.classList.remove('active'));
            
    // Add active class to clicked button and corresponding content
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    const targetContent = document.getElementById(`${category}-content`);
    
    if (activeBtn) activeBtn.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
    loadItems();
}

function loadItems() {
    // Determine active category
    let activeCategory = 'slm';
    const navBtns = document.querySelectorAll('.item-nav-btn');
    navBtns.forEach(btn => {
        if (btn.classList.contains('active')) {
            activeCategory = btn.getAttribute('data-category');
        }
    });

    // Map category to endpoint and table body
    const config = {
        slm: {
            endpoint: '/api/items/slm',
            tableBodyId: 'slmTableBody',
            idField: 'SLMItemID',
            renderRow: item => `
                <td>${item.Title || ''}</td>
                <td>${item.Subject || ''}</td>
                <td>${item.GradeLevel || ''}</td>
                <td>${item.Quarter || ''}</td>
                <td>${item.Quantity || ''}</td>
                <td>${item.Status || ''}</td>
                <td>
                    <button class="btn-icon edit-item" data-id="${item.SLMItemID}"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete-item" data-id="${item.SLMItemID}"><i class="fas fa-trash"></i></button>
                </td>
            `
        },
        equipment: {
            endpoint: '/api/items/equipment',
            tableBodyId: 'equipmentTableBody',
            idField: 'EquipmentID',
            renderRow: item => `
                <td>${item.EquipmentName || ''}</td>
                <td>${item.EquipmentType || ''}</td>
                <td>${item.Quantity || ''}</td>
                <td>${item.Status || ''}</td>
                <td>
                    <button class="btn-icon edit-item" data-id="${item.EquipmentID}"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete-item" data-id="${item.EquipmentID}"><i class="fas fa-trash"></i></button>
                </td>
            `
        },
        tvl: {
            endpoint: '/api/items/tvl',
            tableBodyId: 'tvlTableBody',
            idField: 'TVLItemID',
            renderRow: item => `
                <td>${item.ItemName || ''}</td>
                <td>${item.Track || ''}</td>
                <td>${item.Strand || ''}</td>
                <td>${item.GradeLevel || ''}</td>
                <td>${item.Quantity || ''}</td>
                <td>${item.Status || ''}</td>
                <td>
                    <button class="btn-icon edit-item" data-id="${item.TVLItemID}"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete-item" data-id="${item.TVLItemID}"><i class="fas fa-trash"></i></button>
                </td>
            `
        },
        lesson: {
            endpoint: '/api/items/lesson',
            tableBodyId: 'lessonTableBody',
            idField: 'LessonID',
            renderRow: item => `
                <td>${item.LessonTitle || ''}</td>
                <td>${item.Subject || ''}</td>
                <td>${item.GradeLevel || ''}</td>
                <td>${item.Quarter || ''}</td>
                <td>${item.Week || ''}</td>
                <td>${item.Status || ''}</td>
                <td>
                    <button class="btn-icon edit-item" data-id="${item.LessonID}"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete-item" data-id="${item.LessonID}"><i class="fas fa-trash"></i></button>
                </td>
            `
        },
        textbooks: {
            endpoint: '/api/items/textbooks',
            tableBodyId: 'textbooksTableBody',
            idField: 'id',
            renderRow: item => `
                <td>${item.title || ''}</td>
                <td>${item.subject || ''}</td>
                <td>${item.grade_level || ''}</td>
                <td>${item.quantity || ''}</td>
                <td>${item.status || ''}</td>
                <td>
                    <button class="btn-icon edit-item" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                </td>
            `
        }
    };

    const { endpoint, tableBodyId, renderRow } = config[activeCategory];
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) return;
    tableBody.innerHTML = '<tr><td colspan="7">Loading...</td></tr>';

    fetch(endpoint)
        .then(res => res.json())
        .then(items => {
            tableBody.innerHTML = '';
            if (!items || items.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#888;">No items found.</td></tr>';
                return;
            }
            items.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = renderRow(item);
                tableBody.appendChild(row);
            });
        })
        .catch(err => {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#e53e3e;">Failed to load items.</td></tr>';
            console.error('Error loading items:', err);
        });

    // Attach event delegation for edit/delete
    setTimeout(() => {
        // SLM/SLAS
        if (tableBodyId === 'slmTableBody') {
            tableBody.onclick = async function(e) {
                const editBtn = e.target.closest('.edit-item');
                const deleteBtn = e.target.closest('.delete-item');
                if (editBtn) {
                    const id = editBtn.getAttribute('data-id');
                    // Simple prompt-based edit for demo
                    const row = editBtn.closest('tr');
                    if (title && subject && gradeLevel && quarter && quantity && status) {
                        await fetch(`/api/items/slm/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                Title: title,
                                Subject: subject,
                                GradeLevel: gradeLevel,
                                Quarter: quarter,
                                Quantity: parseInt(quantity),
                                Status: status,
                                Description: description
                            })
                        });
                        loadItems();
                    }
                }
                if (deleteBtn) {
                    const id = deleteBtn.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this item?')) {
                        await fetch(`/api/items/slm/${id}`, { method: 'DELETE' });
                        loadItems();
                    }
                }
            };
        }
        // Equipment
        if (tableBodyId === 'equipmentTableBody') {
            tableBody.onclick = async function(e) {
                const editBtn = e.target.closest('.edit-item');
                const deleteBtn = e.target.closest('.delete-item');
                if (editBtn) {
                    const id = editBtn.getAttribute('data-id');
                    const row = editBtn.closest('tr');
                    if (name && type && quantity && status) {
                        await fetch(`/api/items/equipment/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                EquipmentName: name,
                                EquipmentType: type,
                                Quantity: parseInt(quantity),
                                Status: status,
                                Description: description
                            })
                        });
                        loadItems();
                    }
                }
                if (deleteBtn) {
                    const id = deleteBtn.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this item?')) {
                        await fetch(`/api/items/equipment/${id}`, { method: 'DELETE' });
                        loadItems();
                    }
                }
            };
        }
        // TVL
        if (tableBodyId === 'tvlTableBody') {
            tableBody.onclick = async function(e) {
                const editBtn = e.target.closest('.edit-item');
                const deleteBtn = e.target.closest('.delete-item');
                if (editBtn) {
                    const id = editBtn.getAttribute('data-id');
                    const row = editBtn.closest('tr');
                    if (name && track && strand && gradeLevel && quantity && status) {
                        await fetch(`/api/items/tvl/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ItemName: name,
                                Track: track,
                                Strand: strand,
                                GradeLevel: gradeLevel,
                                Quantity: parseInt(quantity),
                                Status: status,
                                Description: description
                            })
                        });
                    loadItems();
                    }
                }
                if (deleteBtn) {
                    const id = deleteBtn.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this item?')) {
                        await fetch(`/api/items/tvl/${id}`, { method: 'DELETE' });
                        loadItems();
                    }
                }
            };
        }
        // Lesson
        if (tableBodyId === 'lessonTableBody') {
            tableBody.onclick = async function(e) {
                const editBtn = e.target.closest('.edit-item');
                const deleteBtn = e.target.closest('.delete-item');
                if (editBtn) {
                    const id = editBtn.getAttribute('data-id');
                    const row = editBtn.closest('tr');
                    if (title && subject && gradeLevel && quarter && week && status) {
                        await fetch(`/api/items/lesson/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                LessonTitle: title,
                                Subject: subject,
                                GradeLevel: gradeLevel,
                                Quarter: quarter,
                                Week: parseInt(week),
                                Status: status,
                                Description: description
                            })
                        });
                        loadItems();
                    }
                }
                if (deleteBtn) {
                    const id = deleteBtn.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this item?')) {
                        await fetch(`/api/items/lesson/${id}`, { method: 'DELETE' });
                        loadItems();
                    }
                }
            };
        }
        // Textbooks
        if (tableBodyId === 'textbooksTableBody') {
            tableBody.onclick = async function(e) {
                const editBtn = e.target.closest('.edit-item');
                const deleteBtn = e.target.closest('.delete-item');
                if (editBtn) {
                    const id = editBtn.getAttribute('data-id');
                    const row = editBtn.closest('tr');
                    if (title && subject && gradeLevel && quantity && status) {
                        await fetch(`/api/items/textbooks/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                Title: title,
                                Subject: subject,
                                GradeLevel: gradeLevel,
                                Quantity: parseInt(quantity),
                                Status: status,
                                Description: description
                            })
                        });
                        loadItems();
                    }
                }
                if (deleteBtn) {
                    const id = deleteBtn.getAttribute('data-id');
                    if (confirm('Are you sure you want to delete this textbook?')) {
                        await fetch(`/api/items/textbooks/${id}`, { method: 'DELETE' });
                        loadItems();
                    }
                }
            };
        }
    }, 100);
}
// SLM/SLAS Edit Modal Logic

function setupSlmEditModal() {
    const slmTableBody = document.getElementById('slmTableBody');
    if (slmTableBody) {
        slmTableBody.addEventListener('click', function(e) {
            const editBtn = e.target.closest('.edit-item');
            if (editBtn) {
                const row = editBtn.closest('tr');
                document.getElementById('editSlmId').value = editBtn.getAttribute('data-id');
                document.getElementById('editSlmTitle').value = row.children[0].textContent;
                document.getElementById('editSlmSubject').value = row.children[1].textContent;
                document.getElementById('editSlmGradeLevel').value = row.children[2].textContent;
                document.getElementById('editSlmQuarter').value = row.children[3].textContent;
                document.getElementById('editSlmQuantity').value = row.children[4].textContent;
                document.getElementById('editSlmStatus').value = row.children[5].textContent;
                document.getElementById('editSlmDescription').value = '';
                document.getElementById('editSlmModal').style.display = 'flex';
            }
        });
    }
    const closeEditSlmModal = document.getElementById('closeEditSlmModal');
    const cancelEditSlmModal = document.getElementById('cancelEditSlmModal');
    if (closeEditSlmModal) closeEditSlmModal.onclick = function() { document.getElementById('editSlmModal').style.display = 'none'; };
    if (cancelEditSlmModal) cancelEditSlmModal.onclick = function() { document.getElementById('editSlmModal').style.display = 'none'; };
}

// Equipment Edit Modal Logic
function setupEquipmentEditModal() {
    const equipmentTableBody = document.getElementById('equipmentTableBody');
    if (equipmentTableBody) {
        equipmentTableBody.addEventListener('click', function(e) {
            const editBtn = e.target.closest('.edit-item');
            if (editBtn) {
                const row = editBtn.closest('tr');
                document.getElementById('editEquipmentId').value = editBtn.getAttribute('data-id');
                document.getElementById('editEquipmentName').value = row.children[0].textContent;
                document.getElementById('editEquipmentType').value = row.children[1].textContent;
                document.getElementById('editEquipmentQuantity').value = row.children[2].textContent;
                document.getElementById('editEquipmentStatus').value = row.children[3].textContent;
                document.getElementById('editEquipmentDescription').value = '';
                document.getElementById('editEquipmentModal').style.display = 'flex';
            }
        });
    }
    const closeEditEquipmentModal = document.getElementById('closeEditEquipmentModal');
    const cancelEditEquipmentModal = document.getElementById('cancelEditEquipmentModal');
    if (closeEditEquipmentModal) closeEditEquipmentModal.onclick = function() { document.getElementById('editEquipmentModal').style.display = 'none'; };
    if (cancelEditEquipmentModal) cancelEditEquipmentModal.onclick = function() { document.getElementById('editEquipmentModal').style.display = 'none'; };
}

// TVL Edit Modal Logic
function setupTvlEditModal() {
    const tvlTableBody = document.getElementById('tvlTableBody');
    if (tvlTableBody) {
        tvlTableBody.addEventListener('click', function(e) {
            const editBtn = e.target.closest('.edit-item');
            if (editBtn) {
                const row = editBtn.closest('tr');
                document.getElementById('editTvlId').value = editBtn.getAttribute('data-id');
                document.getElementById('editTvlName').value = row.children[0].textContent;
                document.getElementById('editTvlTrack').value = row.children[1].textContent;
                document.getElementById('editTvlStrand').value = row.children[2].textContent;
                document.getElementById('editTvlGradeLevel').value = row.children[3].textContent;
                document.getElementById('editTvlQuantity').value = row.children[4].textContent;
                document.getElementById('editTvlStatus').value = row.children[5].textContent;
                document.getElementById('editTvlDescription').value = '';
                document.getElementById('editTvlModal').style.display = 'flex';
            }
        });
    }
    const closeEditTvlModal = document.getElementById('closeEditTvlModal');
    const cancelEditTvlModal = document.getElementById('cancelEditTvlModal');
    if (closeEditTvlModal) closeEditTvlModal.onclick = function() { document.getElementById('editTvlModal').style.display = 'none'; };
    if (cancelEditTvlModal) cancelEditTvlModal.onclick = function() { document.getElementById('editTvlModal').style.display = 'none'; };
}

// Lesson Exemplar Edit Modal Logic
function setupLessonEditModal() {
    const lessonTableBody = document.getElementById('lessonTableBody');
    if (lessonTableBody) {
        lessonTableBody.addEventListener('click', function(e) {
            const editBtn = e.target.closest('.edit-item');
            if (editBtn) {
                const row = editBtn.closest('tr');
                document.getElementById('editLessonId').value = editBtn.getAttribute('data-id');
                document.getElementById('editLessonTitle').value = row.children[0].textContent;
                document.getElementById('editLessonSubject').value = row.children[1].textContent;
                document.getElementById('editLessonGradeLevel').value = row.children[2].textContent;
                document.getElementById('editLessonQuarter').value = row.children[3].textContent;
                document.getElementById('editLessonWeek').value = row.children[4].textContent;
                document.getElementById('editLessonStatus').value = row.children[5].textContent;
                document.getElementById('editLessonDescription').value = '';
                document.getElementById('editLessonModal').style.display = 'flex';
            }
        });
    }
    const closeEditLessonModal = document.getElementById('closeEditLessonModal');
    const cancelEditLessonModal = document.getElementById('cancelEditLessonModal');
    if (closeEditLessonModal) closeEditLessonModal.onclick = function() { document.getElementById('editLessonModal').style.display = 'none'; };
    if (cancelEditLessonModal) cancelEditLessonModal.onclick = function() { document.getElementById('editLessonModal').style.display = 'none'; };
}
// Textbook Edit Modal Logic
function setupTextbookEditModal() {
    const textbooksTableBody = document.getElementById('textbooksTableBody');
    if (textbooksTableBody) {
        textbooksTableBody.addEventListener('click', function(e) {
            const editBtn = e.target.closest('.edit-item');
            if (editBtn) {
                const row = editBtn.closest('tr');
                document.getElementById('editTextbookId').value = editBtn.getAttribute('data-id');
                document.getElementById('editTextbookTitle').value = row.children[0].textContent;
                document.getElementById('editTextbookSubject').value = row.children[1].textContent;
                document.getElementById('editTextbookGradeLevel').value = row.children[2].textContent;
                document.getElementById('editTextbookQuantity').value = row.children[3].textContent;
                document.getElementById('editTextbookStatus').value = row.children[4].textContent;
                document.getElementById('editTextbookModal').style.display = 'flex';
            }
        });
    }
    const closeEditTextbookModal = document.getElementById('closeEditTextbookModal');
    const cancelEditTextbookModal = document.getElementById('cancelEditTextbookModal');
    if (closeEditTextbookModal) closeEditTextbookModal.onclick = function() { document.getElementById('editTextbookModal').style.display = 'none'; };
    if (cancelEditTextbookModal) cancelEditTextbookModal.onclick = function() { document.getElementById('editTextbookModal').style.display = 'none'; };
}

//==============================================
// ---End of Items Section Functionality ---
//==============================================


//===============================================
//-----------SETTING FUNCTIONALITIES------------
//===============================================
// Settings functionality
function initializeSettings() {
    // System Information Form
    const systemInfoForm = document.getElementById('systemInfoForm');
    if (systemInfoForm) {
        systemInfoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const systemName = document.getElementById('systemName').value;
            const divisionName = document.getElementById('divisionName').value;
            const academicYear = document.getElementById('academicYear').value;
            
            // Update header title
            const headerTitle = document.querySelector('.logo h1');
            if (headerTitle) {
                headerTitle.textContent = systemName;
            }
            
            // Update dashboard header
            const dashboardHeader = document.querySelector('.dashboard-header-bg h2');
            if (dashboardHeader) {
                dashboardHeader.textContent = divisionName;
            }
            
            // Save to localStorage
            localStorage.setItem('systemName', systemName);
            localStorage.setItem('divisionName', divisionName);
            localStorage.setItem('academicYear', academicYear);
            
            showNotification('System information updated successfully!', 'success');
        });
    }
    
    // Logo Upload Form
    const logoUploadForm = document.getElementById('logoUploadForm');
    if (logoUploadForm) {
        logoUploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const fileInput = document.getElementById('newLogo');
            const file = fileInput.files[0];
            
            if (file) {
                if (file.size > 2 * 1024 * 1024) { // 2MB limit
                    showNotification('File size must be less than 2MB', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const logoImg = document.getElementById('currentLogo');
                    const headerLogo = document.querySelector('.logo img');
                    
                    if (logoImg) logoImg.src = e.target.result;
                    if (headerLogo) headerLogo.src = e.target.result;
                    
                    localStorage.setItem('customLogo', e.target.result);
                    showNotification('Logo updated successfully!', 'success');
                };
                reader.readAsDataURL(file);
            } else {
                showNotification('Please select a file', 'error');
            }
        });
    }
    
    // Academic Year Form
    const academicYearForm = document.getElementById('academicYearForm');
    if (academicYearForm) {
        academicYearForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const currentAcademicYear = document.getElementById('currentAcademicYear').value;
            const semester = document.getElementById('semester').value;
            const schoolYearStart = document.getElementById('schoolYearStart').value;
            const schoolYearEnd = document.getElementById('schoolYearEnd').value;
            
            // Save to localStorage
            localStorage.setItem('currentAcademicYear', currentAcademicYear);
            localStorage.setItem('semester', semester);
            localStorage.setItem('schoolYearStart', schoolYearStart);
            localStorage.setItem('schoolYearEnd', schoolYearEnd);
            
            showNotification('Academic year settings updated successfully!', 'success');
        });
    }
    
    // Preferences Form
    const preferencesForm = document.getElementById('preferencesForm');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const autoBackup = document.getElementById('autoBackup').checked;
            const emailNotifications = document.getElementById('emailNotifications').checked;
            const darkMode = document.getElementById('darkMode').checked;
            const itemsPerPage = document.getElementById('itemsPerPage').value;
            
            // Save to localStorage
            localStorage.setItem('autoBackup', autoBackup);
            localStorage.setItem('emailNotifications', emailNotifications);
            localStorage.setItem('darkMode', darkMode);
            localStorage.setItem('itemsPerPage', itemsPerPage);
            
            // Apply dark mode if enabled
            if (darkMode) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
            
            showNotification('Preferences saved successfully!', 'success');
        });
    }
    
    // Database Management Buttons
    const backupDbBtn = document.getElementById('backupDbBtn');
    if (backupDbBtn) {
        backupDbBtn.addEventListener('click', function() {
            // Simulate database backup
            showNotification('Database backup initiated...', 'info');
            setTimeout(() => {
                showNotification('Database backup completed successfully!', 'success');
            }, 2000);
        });
    }
    
    const restoreDbBtn = document.getElementById('restoreDbBtn');
    if (restoreDbBtn) {
        restoreDbBtn.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,.sql';
            input.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    showNotification('Database restore initiated...', 'info');
                    setTimeout(() => {
                        showNotification('Database restored successfully!', 'success');
                    }, 2000);
                }
            };
            input.click();
        });
    }
    
    const exportDataBtn = document.getElementById('exportDataBtn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            // Export data as JSON
            const data = {
                schools: JSON.parse(localStorage.getItem('schools') || '[]'),
                subjects: JSON.parse(localStorage.getItem('subjects') || '[]'),
                resources: JSON.parse(localStorage.getItem('resources') || '[]'),
                settings: {
                    systemName: localStorage.getItem('systemName'),
                    divisionName: localStorage.getItem('divisionName'),
                    academicYear: localStorage.getItem('academicYear')
                }
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lris_data_export.json';
            a.click();
            URL.revokeObjectURL(url);
            
            showNotification('Data exported successfully!', 'success');
        });
    }
    
    const clearDataBtn = document.getElementById('clearDataBtn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                localStorage.clear();
                location.reload();
            }
        });
    }
    
    // Load saved settings on page load
    loadSavedSettings();
}

function loadSavedSettings() {
    // Load system information
    const systemName = localStorage.getItem('systemName');
    const divisionName = localStorage.getItem('divisionName');
    const academicYear = localStorage.getItem('academicYear');
    
    if (systemName) document.getElementById('systemName').value = systemName;
    if (divisionName) document.getElementById('divisionName').value = divisionName;
    if (academicYear) document.getElementById('academicYear').value = academicYear;
    
    // Load academic year settings
    const currentAcademicYear = localStorage.getItem('currentAcademicYear');
    const semester = localStorage.getItem('semester');
    const schoolYearStart = localStorage.getItem('schoolYearStart');
    const schoolYearEnd = localStorage.getItem('schoolYearEnd');
    
    if (currentAcademicYear) document.getElementById('currentAcademicYear').value = currentAcademicYear;
    if (semester) document.getElementById('semester').value = semester;
    if (schoolYearStart) document.getElementById('schoolYearStart').value = schoolYearStart;
    if (schoolYearEnd) document.getElementById('schoolYearEnd').value = schoolYearEnd;
    
    // Load preferences
    const autoBackup = localStorage.getItem('autoBackup');
    const emailNotifications = localStorage.getItem('emailNotifications');
    const darkMode = localStorage.getItem('darkMode');
    const itemsPerPage = localStorage.getItem('itemsPerPage');
    
    if (autoBackup !== null) document.getElementById('autoBackup').checked = autoBackup === 'true';
    if (emailNotifications !== null) document.getElementById('emailNotifications').checked = emailNotifications === 'true';
    if (darkMode !== null) document.getElementById('darkMode').checked = darkMode === 'true';
    if (itemsPerPage) document.getElementById('itemsPerPage').value = itemsPerPage;
    
    // Apply dark mode if enabled
    if (darkMode === 'true') {
        document.body.classList.add('dark-mode');
    }
    
    // Load custom logo
    const customLogo = localStorage.getItem('customLogo');
    if (customLogo) {
        const logoImg = document.getElementById('currentLogo');
        const headerLogo = document.querySelector('.logo img');
        
        if (logoImg) logoImg.src = customLogo;
        if (headerLogo) headerLogo.src = customLogo;
    }
}
//===============================================
//--------END OF SETTING FUNCTIONALITIES---------
//===============================================

//===============================================
//----------LOG OUT FUNCTIONALITIES--------------

// Logout button functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        showNotification('You have been logged out.', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1200);
    });
} 

//-------END OF LOGOUT FUNCTIONALITIES-----------
//===============================================


// Records Section Initialization
function initializeRecordsSection() {
    console.log('Initializing Records section...');
    loadRecordsData();
    setupRecordsFilters();
    setupExportButton();
}

// Load and display records data
async function loadRecordsData(filters = {}) {
    try {
        const tableBody = document.getElementById('schoolListTableBody');
        if (!tableBody) {
            console.error('Records table body not found');
            return;
        }

        // Show loading state
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">Loading records...</td></tr>';

        // Fetch schools and distributed resources
        const [schoolsResponse, resourcesResponse] = await Promise.all([
            fetch('http://localhost:3000/api/schools'),
            fetch('http://localhost:3000/api/distributed-resources')
        ]);

        const schools = await schoolsResponse.json();
        const distributedResources = await resourcesResponse.json();

        // Process and filter data
        const recordsData = processRecordsData(schools, distributedResources, filters);
        
        // Display the data
        displayRecordsData(recordsData, tableBody);

    } catch (error) {
        console.error('Error loading records data:', error);
        const tableBody = document.getElementById('schoolListTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #ef4444;">Error loading records data</td></tr>';
        }
    }
}

// Process schools and distributed resources data
function processRecordsData(schools, distributedResources, filters) {
    const records = [];

    schools.forEach(school => {
        // Get distributed resources for this school
        const schoolResources = distributedResources.filter(resource => 
            resource.SchoolID === school.SchoolID
        );

        // Apply filters
        let filteredResources = schoolResources;
        
        if (filters.year) {
            filteredResources = filteredResources.filter(resource => {
                const resourceYear = new Date(resource.DateDistributed || resource.LastUpdated || Date.now()).getFullYear().toString();
                return resourceYear === filters.year;
            });
        }

        if (filters.category) {
            filteredResources = filteredResources.filter(resource => 
                resource.ResourceCategory === filters.category
            );
        }

        if (filters.yearLevel) {
            filteredResources = filteredResources.filter(resource => {
                const schoolLevel = school.Level || '';
                return schoolLevel.toLowerCase().includes(filters.yearLevel.toLowerCase());
            });
        }

        // Calculate totals
        const totalResources = filteredResources.length;
        const totalQuantity = filteredResources.reduce((sum, resource) => 
            sum + (parseInt(resource.Quantity) || 0), 0
        );

        // Get latest delivery date
        const latestDelivery = filteredResources.length > 0 ? 
            Math.max(...filteredResources.map(r => new Date(r.DateDistributed || r.LastUpdated || 0))) : null;

        records.push({
            school: school,
            totalResources: totalResources,
            totalQuantity: totalQuantity,
            latestDelivery: latestDelivery,
            resources: filteredResources
        });
    });

    return records;
}

// Display records data in the table
function displayRecordsData(records, tableBody) {
    if (records.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No records found matching the current filters</td></tr>';
        return;
    }

    tableBody.innerHTML = '';
    
    records.forEach(record => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${record.school.Name || 'N/A'}</td>
            <td>${record.school.SchoolID || 'N/A'}</td>
            <td>${record.totalResources} (${record.totalQuantity} items)</td>
            <td>${record.school.Enrollees || 'N/A'}</td>
            <td>${record.latestDelivery ? new Date(record.latestDelivery).toLocaleDateString() : 'N/A'}</td>
        `;
        
        // Add click handler to view detailed resources
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', () => {
            showSchoolResourcesModal(record.school, record.resources);
        });
        
        tableBody.appendChild(tr);
    });
}

// Setup filter event listeners
function setupRecordsFilters() {
    const yearFilter = document.getElementById('yearFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const yearLevelFilter = document.getElementById('schoolYearLevelFilter');

    if (yearFilter) {
        yearFilter.addEventListener('change', applyRecordsFilters);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyRecordsFilters);
    }
    if (yearLevelFilter) {
        yearLevelFilter.addEventListener('change', applyRecordsFilters);
    }
}

// Apply filters to records
function applyRecordsFilters() {
    const yearFilter = document.getElementById('yearFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const yearLevelFilter = document.getElementById('schoolYearLevelFilter');

    const filters = {
        year: yearFilter ? yearFilter.value : '',
        category: categoryFilter ? categoryFilter.value : '',
        yearLevel: yearLevelFilter ? yearLevelFilter.value : ''
    };

    console.log('Applying records filters:', filters);
    loadRecordsData(filters);
}

// Show school resources modal
function showSchoolResourcesModal(school, resources) {
    const modal = document.getElementById('schoolResourcesModal');
    const title = document.getElementById('schoolResourcesTitle');
    const tableBody = document.getElementById('schoolResourcesTableBody');

    if (!modal || !title || !tableBody) {
        console.error('School resources modal elements not found');
                    return;
                }

    title.textContent = `Resources Delivered to ${school.Name}`;
    
    if (resources.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 1rem;">No resources found for this school</td></tr>';
                    } else {
        tableBody.innerHTML = '';
        resources.forEach(resource => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${resource.ResourceName || 'N/A'}</td>
                <td>${resource.ResourceCategory || 'N/A'}</td>
                <td>${resource.Subject || 'N/A'}</td>
                <td>${resource.Quantity || '0'}</td>
                <td>${resource.Quarter || 'N/A'}</td>
                <td>${resource.DateDistributed ? new Date(resource.DateDistributed).toLocaleDateString() : 'N/A'}</td>
            `;
            tableBody.appendChild(tr);
        });
    }

    modal.style.display = 'flex';
}

// Setup export button functionality
function setupExportButton() {
    const exportBtn = document.getElementById('exportRecordsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportRecordsData);
    }
}

// Export records data to CSV
async function exportRecordsData() {
    try {
        // Show loading state on export button
        const exportBtn = document.getElementById('exportRecordsBtn');
        const originalText = exportBtn.innerHTML;
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
        exportBtn.disabled = true;

        // Get current filter values
        const yearFilter = document.getElementById('yearFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const yearLevelFilter = document.getElementById('schoolYearLevelFilter');

        const filters = {
            year: yearFilter ? yearFilter.value : '',
            category: categoryFilter ? categoryFilter.value : '',
            yearLevel: yearLevelFilter ? yearLevelFilter.value : ''
        };

        // Fetch data with current filters
        const [schoolsResponse, resourcesResponse] = await Promise.all([
            fetch('http://localhost:3000/api/schools'),
            fetch('http://localhost:3000/api/distributed-resources')
        ]);

        const schools = await schoolsResponse.json();
        const distributedResources = await resourcesResponse.json();

        // Process data with filters
        const recordsData = processRecordsData(schools, distributedResources, filters);

        // Generate CSV content
        const csvContent = generateCSVContent(recordsData);

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `records_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Reset button state
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;

        // Show success notification
        showNotification('Records exported successfully!', 'success');

    } catch (error) {
        console.error('Error exporting records:', error);
        
        // Reset button state
        const exportBtn = document.getElementById('exportRecordsBtn');
        if (exportBtn) {
            exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Records';
            exportBtn.disabled = false;
        }
        
        showNotification('Error exporting records. Please try again.', 'error');
    }
}

// Generate CSV content from records data
function generateCSVContent(recordsData) {
    // CSV headers - exactly matching the table headers
    const headers = [
        'School Name',
        'School ID',
        'Allocated Resources',
        'Total Enrollees',
        'Date of Delivered Resources'
    ];

    // Build CSV content
    let csvContent = headers.join(',') + '\n';

    recordsData.forEach(record => {
        const school = record.school;
        
        // Format allocated resources exactly as displayed in table: "X (Y items)"
        const allocatedResources = `${record.totalResources} (${record.totalQuantity} items)`;
        
        // Format date exactly as displayed in table
        const deliveryDate = record.latestDelivery ? new Date(record.latestDelivery).toLocaleDateString() : 'N/A';

        const row = [
            `"${school.Name || 'N/A'}"`,
            `"${school.SchoolID || 'N/A'}"`,
            `"${allocatedResources}"`,
            school.Enrollees || 'N/A',
            deliveryDate
        ];

        csvContent += row.join(',') + '\n';
    });

    return csvContent;
}

// Close school resources modal
document.addEventListener('DOMContentLoaded', function() {
    const closeModal = document.getElementById('closeSchoolResourcesModal');
    const modal = document.getElementById('schoolResourcesModal');
    
    if (closeModal && modal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
});
