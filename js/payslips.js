const tbody = document.querySelector('#payslipsTable tbody');
if (tbody) {
    tbody.innerHTML = `
        <tr>
            <td colspan="4" style="text-align:center; color: #5a6e7c; padding: 2rem;">
                Payslips will appear once payroll is processed and finalized by HR.
            </td>
        </tr>
    `;
}