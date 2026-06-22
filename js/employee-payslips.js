// employee-payslips.js – uses global API_BASE from utils.js
// Dropdown and user name are handled by auth.js – do NOT duplicate here.

const empId = localStorage.getItem('employee_id');

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    str = String(str);
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatCurrency(amount) {
    return '₱' + parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

async function loadPayslips() {
    const tbody = document.getElementById('payrollBody');

    if (!empId) {
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No employee ID found.</td></tr>';
        return;
    }

    try {
        const res = await fetch(API_BASE + 'get_payroll.php?employee_id=' + encodeURIComponent(empId), {
            credentials: 'include'
        });
        const data = await res.json();

        if (!data.success) throw new Error(data.message);

        if (data.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-message">No payslip records found.</td></tr>';
            return;
        }

        let html = '';
        for (let record of data.data) {
            html += `<tr>
                <td>${escapeHtml(record.pay_period)}</td>
                <td>${escapeHtml(record.days_present || 0)}</td>
                <td>${formatCurrency(record.gross_pay)}</td>
                <td>${formatCurrency(record.net_pay)}</td>
                <td>
                    <button class="btn-view" onclick="alert('Payslip details for ${escapeHtml(record.pay_period)}:\nGross: ${formatCurrency(record.gross_pay)}\nSSS: ${formatCurrency(record.sss)}\nPhilHealth: ${formatCurrency(record.philhealth)}\nPag-IBIG: ${formatCurrency(record.pagbig)}\nWithholding Tax: ${formatCurrency(record.withholding_tax)}')">View</button>
                </td>
            </tr>`;
        }
        tbody.innerHTML = html;

    } catch (error) {
        console.error('Error loading payslips:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="empty-message">Error loading payslips. Please try again.</td></tr>';
    }
}

// Load payslips on page load
loadPayslips();