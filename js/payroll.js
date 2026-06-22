// payroll.js – Complete with OT & Undertime, Cached, No Auto-Update on Refresh

let currentPayrollData = null;

function formatDateForAPI(year, month, period) {
    let startDay = (period === '1-15') ? '01' : '16';
    let endDay = (period === '1-15') ? '15' : '30';
    let startDate = year + '-' + month + '-' + startDay;
    let endDate = year + '-' + month + '-' + endDay;
    return { startDate, endDate };
}

function savePayrollData(data, period, monthYear, startDate, endDate) {
    const payload = {
        period,
        monthYear,
        startDate,
        endDate,
        employees: data,
        timestamp: Date.now()
    };
    localStorage.setItem('payrollCache', JSON.stringify(payload));
}

function loadCachedPayroll() {
    const cached = localStorage.getItem('payrollCache');
    if (!cached) return null;
    try {
        return JSON.parse(cached);
    } catch (e) {
        return null;
    }
}

function renderPayroll(payrollData, period, monthYear, startDate, endDate) {
    let totalGross = 0, totalSSS = 0, totalPhil = 0, totalPag = 0, totalWT = 0, totalNet = 0;
    let totalOTPay = 0, totalUndertimeDed = 0;
    let payrollRows = '';

    for (const emp of payrollData) {
        let dailyRate = parseFloat(emp.daily_rate) || 0;
        totalGross += emp.gross;
        totalSSS += emp.sss;
        totalPhil += emp.philhealth;
        totalPag += emp.pagibig;
        totalWT += emp.withholding_tax;
        totalNet += emp.net;
        totalOTPay += emp.ot_pay || 0;
        totalUndertimeDed += emp.undertime_deduction || 0;

        payrollRows += `<tr>
            <td>${emp.name}</td>
            <td>₱${dailyRate.toFixed(2)}</td>
            <td>${emp.days_present}</td>
            <td>₱${emp.gross.toFixed(2)}</td>
            <td>₱${emp.sss.toFixed(2)}</td>
            <td>₱${emp.philhealth.toFixed(2)}</td>
            <td>₱${emp.pagibig.toFixed(2)}</td>
            <td>₱${emp.withholding_tax.toFixed(2)}</td>
            <td>${emp.ot_hours || 0}</td>
            <td>₱${(emp.ot_pay || 0).toFixed(2)}</td>
            <td>${emp.undertime_hours || 0}</td>
            <td>₱${(emp.undertime_deduction || 0).toFixed(2)}</td>
            <td>₱${emp.net.toFixed(2)}</td>
            <td><button class="btn-payslip" data-name="${emp.name}" data-daily="${dailyRate}" data-days="${emp.days_present}" data-gross="${emp.gross}" data-sss="${emp.sss}" data-phil="${emp.philhealth}" data-pag="${emp.pagibig}" data-wt="${emp.withholding_tax}" data-net="${emp.net}" data-ot="${emp.ot_hours}" data-otpay="${emp.ot_pay}" data-undertime="${emp.undertime_hours}" data-undertime-ded="${emp.undertime_deduction}">View Payslip</button></td>
        </tr>`;
    }

    const summaryHtml = `
        <div class="summary-cards">
            <div class="summary-card"><h4>Total Gross</h4><div class="summary-number">₱${totalGross.toFixed(2)}</div></div>
            <div class="summary-card"><h4>Total SSS (5%)</h4><div class="summary-number">₱${totalSSS.toFixed(2)}</div></div>
            <div class="summary-card"><h4>Total PhilHealth (2.5%)</h4><div class="summary-number">₱${totalPhil.toFixed(2)}</div></div>
            <div class="summary-card"><h4>Total Pag-IBIG (2%)</h4><div class="summary-number">₱${totalPag.toFixed(2)}</div></div>
            <div class="summary-card"><h4>Total Withholding Tax</h4><div class="summary-number">₱${totalWT.toFixed(2)}</div></div>
            <div class="summary-card"><h4>Total OT Pay</h4><div class="summary-number">₱${totalOTPay.toFixed(2)}</div></div>
            <div class="summary-card"><h4>Total Undertime Deduction</h4><div class="summary-number">-₱${totalUndertimeDed.toFixed(2)}</div></div>
            <div class="summary-card"><h4>Total Net Pay</h4><div class="summary-number">₱${totalNet.toFixed(2)}</div></div>
            <div class="summary-card"><h4>Employees</h4><div class="summary-number">${payrollData.length}</div></div>
        </div>
        <div style="overflow-x: auto;">
            <table>
                <thead><tr>
                    <th>Employee</th>
                    <th>Daily Rate</th>
                    <th>Days Present</th>
                    <th>Gross Pay</th>
                    <th>SSS (5%)</th>
                    <th>PhilHealth (2.5%)</th>
                    <th>Pag-IBIG (2%)</th>
                    <th>Withholding Tax</th>
                    <th>OT Hours</th>
                    <th>OT Pay</th>
                    <th>Undertime Hours</th>
                    <th>Undertime Deduct</th>
                    <th>Net Pay</th>
                    <th>Action</th>
                </tr></thead>
                <tbody>${payrollRows}</tbody>
            </table>
        </div>
    `;

    document.getElementById('payrollResults').innerHTML = summaryHtml;

    // Payslip button listeners
    document.querySelectorAll('.btn-payslip').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const daily = btn.dataset.daily;
            const days = btn.dataset.days;
            const gross = parseFloat(btn.dataset.gross);
            const sss = parseFloat(btn.dataset.sss);
            const phil = parseFloat(btn.dataset.phil);
            const pag = parseFloat(btn.dataset.pag);
            const wt = parseFloat(btn.dataset.wt);
            const net = parseFloat(btn.dataset.net);
            const ot = btn.dataset.ot || 0;
            const otpay = parseFloat(btn.dataset.otpay) || 0;
            const undertime = btn.dataset.undertime || 0;
            const undertimeDed = parseFloat(btn.dataset.undertimeDed) || 0;
            alert(`Payslip for ${name}\nDaily Rate: ₱${daily}\nDays Present: ${days}\nGross: ₱${gross.toFixed(2)}\nDeductions:\n  SSS (5%): ₱${sss.toFixed(2)}\n  PhilHealth (2.5%): ₱${phil.toFixed(2)}\n  Pag-IBIG (2%): ₱${pag.toFixed(2)}\n  Withholding Tax: ₱${wt.toFixed(2)}\nOT Hours: ${ot}\nOT Pay: ₱${otpay.toFixed(2)}\nUndertime Hours: ${undertime}\nUndertime Deduction: ₱${undertimeDed.toFixed(2)}\nNet Pay: ₱${net.toFixed(2)}`);
        });
    });

    currentPayrollData = { period, monthYear, startDate, endDate, employees: payrollData };
}

async function computePayroll() {
    console.log("computePayroll() called – fetching fresh data");

    const period = document.getElementById('payPeriod').value;
    const monthYear = document.getElementById('payMonth').value;
    const [year, month] = monthYear.split('-');
    const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' });
    const { startDate, endDate } = formatDateForAPI(year, month, period);

    try {
        const res = await fetch(API_BASE + 'get_attendance_summary.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ start_date: startDate, end_date: endDate })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        const payrollData = data.data;
        savePayrollData(payrollData, period, monthYear, startDate, endDate);
        renderPayroll(payrollData, period, monthYear, startDate, endDate);

    } catch (err) {
        document.getElementById('payrollResults').innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
        alert('Error: ' + err.message);
    }
}

async function finalizePayroll() {
    if (!currentPayrollData) {
        alert('Compute payroll first.');
        return;
    }
    try {
        const res = await fetch(API_BASE + 'finalize_payroll.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                period_start: currentPayrollData.startDate,
                period_end: currentPayrollData.endDate,
                data: currentPayrollData.employees
            })
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        alert('Payroll finalized and saved to database!');
        // No badge added
    } catch (err) {
        alert('Error: ' + err.message);
    }
}

function generateBulkPayslips() {
    if (!currentPayrollData) {
        alert('Compute payroll first.');
        return;
    }
    const zip = new JSZip();
    for (let emp of currentPayrollData.employees) {
        const content = `========================================
PAYSLIP
========================================
Employee: ${emp.name}
Daily Rate: ₱${emp.daily_rate}
Period: ${currentPayrollData.monthYear} (${currentPayrollData.period})
Days Present: ${emp.days_present}
----------------------------------------
Gross Pay: ₱${emp.gross.toFixed(2)}
Deductions:
  SSS (5%): ₱${emp.sss.toFixed(2)}
  PhilHealth (2.5%): ₱${emp.philhealth.toFixed(2)}
  Pag-IBIG (2%): ₱${emp.pagibig.toFixed(2)}
  Withholding Tax: ₱${emp.withholding_tax.toFixed(2)}
----------------------------------------
OT Hours: ${emp.ot_hours || 0}
OT Pay: ₱${(emp.ot_pay || 0).toFixed(2)}
Undertime Hours: ${emp.undertime_hours || 0}
Undertime Deduction: ₱${(emp.undertime_deduction || 0).toFixed(2)}
----------------------------------------
Net Pay: ₱${emp.net.toFixed(2)}
========================================
Generated by CKL HRMS on ${new Date().toLocaleString()}`;
        zip.file(`Payslip_${emp.name.replace(/ /g, '_')}.txt`, content);
    }
    zip.generateAsync({ type: 'blob' }).then(function(blob) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `Payslips_${currentPayrollData.monthYear}_${currentPayrollData.period}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('Bulk payslips downloaded as ZIP file.');
    });
}

// ---- Make functions global ----
window.computePayroll = computePayroll;
window.finalizePayroll = finalizePayroll;
window.generateBulkPayslips = generateBulkPayslips;

// ---- On load: show cached data ----
document.addEventListener('DOMContentLoaded', function() {
    console.log("Payroll page loaded – loading cached data...");
    const cached = loadCachedPayroll();
    if (cached) {
        renderPayroll(cached.employees, cached.period, cached.monthYear, cached.startDate, cached.endDate);
        console.log("Cached data displayed.");
    } else {
        document.getElementById('payrollResults').innerHTML = `<p style="text-align:center; color:#888; padding:20px;">No payroll data found. Click <strong>Compute Payroll</strong> to generate.</p>`;
    }
});

console.log("payroll.js loaded successfully");