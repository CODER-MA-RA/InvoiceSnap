const invoiceItems = document.getElementById('invoice_items');
const totalTd = document.getElementById('total');
const currencySelect = document.getElementById("currency");
let currencySymbol = "$";

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    if (invoiceItems.rows.length === 0) addItem(); 
    
    if(!document.getElementById("invoice_date").value) {
        document.getElementById("invoice_date").value = new Date().toISOString().split("T")[0];
    }
    if(!document.getElementById("invoice_no").value) {
        document.getElementById("invoice_no").value = 'INV-' + Math.floor(1000 + Math.random() * 9000);
    }
    calculateTotals();
});

// Add Row Function
function addItem(desc = "", qty = 1, price = 0, tax = 0) {
    const row = document.createElement("tr");
    row.style.animation = "fadeIn 0.4s easeOut forwards";
    row.innerHTML = `
        <td class="row_num"></td>
        <td><input type="text" class="item_desc" value="${desc}" placeholder="Item description"></td>
        <td><input type="number" class="item_qty" value="${qty}" min="0"></td>
        <td><input type="number" class="item_price" value="${price}" min="0"></td>
        <td><input type="number" class="item_tax" value="${tax}" min="0"></td>
        <td class="item_total">0.00</td>
        <td><button class="remove_item">✕</button></td>
    `;
    invoiceItems.appendChild(row);
    updateRowNumbers();

    // [تتبع]: إرسال حدث عند إضافة بند جديد
    if (typeof gtag === 'function') {
        gtag('event', 'add_item', { 'event_category': 'engagement' });
    }
}

// Global Event Listeners
document.getElementById("add_item").addEventListener("click", () => addItem());

invoiceItems.addEventListener("click", e => {
    if (e.target.classList.contains("remove_item")) {
        e.target.closest("tr").remove();
        calculateTotals();
        updateRowNumbers();
        saveToLocalStorage();
        
        // [تتبع]: إرسال حدث عند حذف بند
        if (typeof gtag === 'function') {
            gtag('event', 'remove_item', { 'event_category': 'engagement' });
        }
    }
});

invoiceItems.addEventListener('input', () => {
    calculateTotals();
    saveToLocalStorage();
});

currencySelect.addEventListener("change", () => {
    currencySymbol = currencySelect.value;
    calculateTotals();
    saveToLocalStorage();
});

// Calculation Logic
function calculateTotals() {
    let grandTotal = 0;
    invoiceItems.querySelectorAll('tr').forEach(row => {
        const qty = parseFloat(row.querySelector('.item_qty').value) || 0;
        const price = parseFloat(row.querySelector('.item_price').value) || 0;
        const taxRate = parseFloat(row.querySelector('.item_tax').value) || 0;
        
        const subtotal = qty * price;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + taxAmount;
        
        row.querySelector('.item_total').textContent = `${currencySymbol}${total.toFixed(2)}`;
        grandTotal += total;
    });
    
    totalTd.textContent = `${currencySymbol}${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    
    totalTd.style.transform = "scale(1.05)";
    setTimeout(() => totalTd.style.transform = "scale(1)", 100);
}

function updateRowNumbers() {
    invoiceItems.querySelectorAll('tr').forEach((row, i) => {
        row.querySelector('.row_num').textContent = i + 1;
    });
}

// Toast Notification
function notify(msg) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = msg;
    toast.style.cssText = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#1e293b; color:white; padding:12px 24px; border-radius:30px; font-size:14px; z-index:9999;";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Local Storage Support
function saveToLocalStorage() {
    const data = {
        customer: document.getElementById("customer_name").value,
        no: document.getElementById("invoice_no").value,
        date: document.getElementById("invoice_date").value,
        currency: currencySelect.value,
        items: []
    };
    invoiceItems.querySelectorAll("tr").forEach(row => {
        data.items.push({
            desc: row.querySelector(".item_desc").value,
            qty: row.querySelector(".item_qty").value,
            price: row.querySelector(".item_price").value,
            tax: row.querySelector(".item_tax").value
        });
    });
    localStorage.setItem("invoiceSnap_data", JSON.stringify(data));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem("invoiceSnap_data");
    if (!saved) return;
    const data = JSON.parse(saved);
    document.getElementById("customer_name").value = data.customer;
    document.getElementById("invoice_no").value = data.no;
    document.getElementById("invoice_date").value = data.date;
    currencySelect.value = data.currency;
    currencySymbol = data.currency;
    
    invoiceItems.innerHTML = "";
    data.items.forEach(item => addItem(item.desc, item.qty, item.price, item.tax));
}

document.getElementById("new_invoice").addEventListener("click", () => {
    if(confirm("Are you sure? This will delete the current draft.")) {
        // [تتبع]: إرسال حدث عند تصفير البيانات
        if (typeof gtag === 'function') {
            gtag('event', 'clear_invoice_draft', { 'event_category': 'action' });
        }
        localStorage.removeItem("invoiceSnap_data");
        location.reload();
    }
});

// Share Logic
document.getElementById("copy_invoice").addEventListener("click", () => {
    const total = totalTd.textContent;
    const client = document.getElementById("customer_name").value || "Valued Client";
    const msg = `Invoice from InvoiceSnap\nClient: ${client}\nTotal: ${total}\nGenerated via Web App.`;
    
    // [تتبع]: إرسال حدث "التحويل الرئيسي" عند نسخ الفاتورة
    if (typeof gtag === 'function') {
        gtag('event', 'share_invoice', {
            'event_category': 'conversion',
            'event_label': 'Copy Clipboard',
            'value': parseFloat(total.replace(/[^0-9.-]+/g,"")) || 0,
            'currency': currencySelect.value || 'USD'
        });
    }

    navigator.clipboard.writeText(msg);
    notify("Invoice Summary Copied! 📋");
});