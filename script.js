// ====================================
// DATX - نظام إدارة البوابة التعليمية
// داتكس لخدمات علوم البيانات
// ====================================

// ========== الإعدادات الأساسية ==========
// ⚠️ ضع رابط CSV من Google Sheets هنا
const SHEET_CSV_URL = src="https://docs.google.com/spreadsheets/d/e/2PACX-1vS2GO8qxgiiP84_ovwWnPBQzK2DkrQTUZ6q6P6f2LTSbDEsa1ZaWXl8JZw-i6sW5NfBCRg4BuQbtRQo/pubhtml?widget=true&amp;headers=false"

// ========== جلب البيانات من Google Sheets ==========
async function fetchDashboard() {
    try {
        // عرض حالة التحميل
        updateStatusText('جاري الاتصال بلوحة التحكم...', 'loading');
        
        // جلب البيانات
        const response = await fetch(SHEET_CSV_URL);
        if (!response.ok) {
            throw new Error('فشل الاتصال بالخادم');
        }
        
        const data = await response.text();
        
        // تحويل CSV إلى كائن JavaScript
        parseCSVData(data);
        
        // تحديث واجهة المستخدم
        updateUI();
        
        // تحديث حالة النجاح
        updateStatusText('تم التحديث ✅', 'success');
        
    } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
        updateStatusText('خطأ في الاتصال! ⚠️', 'error');
        
        // إظهار الواجهة حتى مع وجود خطأ
        hideLoader();
        showContainer('home');
    }
}

// ========== تحليل بيانات CSV ==========
function parseCSVData(csvText) {
    const rows = csvText.split('\n');
    
    rows.forEach(row => {
        // تقسيم الصف إلى أعمدة
        const cols = row.split(',');
        
        if (cols.length >= 2) {
            // تنظيف المفتاح والقيمة من علامات التنصيص والمسافات
            const key = cols[0].replace(/"/g, '').trim();
            // دمج باقي الأعمدة في حال وجود فواصل في الرابط
            const value = cols.slice(1).join(',').replace(/"/g, '').trim();
            
            // تخزين البيانات
            if (key && value) {
                appData[key] = value;
            }
        }
    });
}

// ========== تحديث واجهة المستخدم ==========
function updateUI() {
    // إخفاء شاشة التحميل
    hideLoader();
    
    // إظهار الصفحة الرئيسية
    showContainer('home');
    
    // تحديث الإعلانات
    updateAnnouncement();
    
    // تحديث حالة الحضور
    updateAttendanceStatus();
    
    // تحديث روابط الخدمات
    updateServiceLinks();
}

// ========== تحديث الإعلانات ==========
function updateAnnouncement() {
    const announcementBox = document.getElementById('announcement');
    const announcementText = appData['announcement_text'];
    
    if (announcementText && announcementText !== 'لا توجد إعلانات حالياً') {
        announcementBox.innerHTML = '📢 ' + announcementText;
        announcementBox.classList.add('show');
    } else {
        announcementBox.classList.remove('show');
    }
}

// ========== تحديث حالة الحضور ==========
function updateAttendanceStatus() {
    const attendBtn = document.getElementById('btn-attendance');
    const attendMsg = document.getElementById('attend-msg');
    const attendanceStatus = appData['attendance_status'];
    const attendanceLink = appData['attendance_link'];
    
    if (attendanceStatus === 'OPEN' && attendanceLink) {
        // الحضور مفتوح
        attendBtn.classList.remove('closed');
        attendBtn.innerHTML = '🚀 سجّل حضورك الآن';
        attendBtn.href = attendanceLink;
        attendMsg.innerHTML = '<span class="status-indicator open"></span> البوابة مفتوحة';
    } else {
        // الحضور مغلق
        attendBtn.classList.add('closed');
        attendBtn.innerHTML = '🔒 التحضير مغلق';
        attendBtn.href = '#';
        attendMsg.innerHTML = '<span class="status-indicator closed"></span> البوابة مغلقة حالياً';
    }
}

// ========== تحديث روابط الخدمات ==========
function updateServiceLinks() {
    // رابط الواجبات
    const assignmentLink = appData['assignment_link'];
    if (assignmentLink) {
        document.getElementById('btn-assignment').href = assignmentLink;
    }
    
    // رابط الشهادات
    const certificateLink = appData['certificate_link'];
    if (certificateLink) {
        document.getElementById('btn-cert').href = certificateLink;
    }
    
    // رابط Power BI
    const powerbiLink = appData['powerbi_link'];
    if (powerbiLink) {
        document.getElementById('btn-powerbi').href = powerbiLink;
    }
}

// ========== دوال مساعدة للواجهة ==========
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

function showContainer(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.classList.add('active');
    }
}

function updateStatusText(text, status = 'normal') {
    const statusElement = document.getElementById('status-text');
    if (statusElement) {
        statusElement.textContent = text;
    }
}

// ========== التنقل بين الصفحات ==========
function switchTab(tabId, element) {
    // إخفاء جميع الحاويات
    document.querySelectorAll('.container').forEach(container => {
        container.classList.remove('active');
    });
    
    // إظهار الحاوية المطلوبة
    const targetContainer = document.getElementById(tabId);
    if (targetContainer) {
        targetContainer.classList.add('active');
    }
    
    // تحديث حالة عناصر التنقل
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    if (element) {
        element.classList.add('active');
    }
}

// ========== تهيئة التطبيق ==========
function initializeApp() {
    console.log('🚀 تم تشغيل بوابة DATX');
    
    // جلب البيانات من Google Sheets
    fetchDashboard();
    
    // تحديث البيانات كل 5 دقائق
    setInterval(fetchDashboard, 5 * 60 * 1000);
}

// ========== بدء التطبيق عند تحميل الصفحة ==========
document.addEventListener('DOMContentLoaded', initializeApp);

// يمكن أيضاً استخدام هذا للتوافق مع المتصفحات القديمة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
