const invoiceItems = document.getElementById('invoice_items');
const totalTd = document.getElementById('total');
const currencySelect = document.getElementById("currency");
let currencySymbol = "$";

// Currency change
currencySelect.addEventListener("change", () => {
  currencySymbol = currencySelect.value;
  calculateTotals();
});

// Calculate single row
function calculateRowTotal(row){
  const qty = row.querySelector('.item_qty').valueAsNumber || 0;
  const price = row.querySelector('.item_price').valueAsNumber || 0;
  const taxRate = row.querySelector('.item_tax').valueAsNumber || 0;
  const subtotal = qty * price;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  row.querySelector('.item_total').textContent = `${currencySymbol}${total.toFixed(2)}`;
  return {subtotal, tax, total};
}

// Calculate totals
function calculateTotals(){
  let total = 0;
  invoiceItems.querySelectorAll('tr').forEach(row=>{
    const rowData = calculateRowTotal(row);
    total += rowData.total;
  });
  if(totalTd) totalTd.textContent = `${currencySymbol}${total.toFixed(2)}`;
}

invoiceItems.addEventListener('input', calculateTotals);

// Add Item
document.getElementById("add_item").addEventListener("click", () => {
  const rowCount = invoiceItems.rows.length + 1;
  const row = document.createElement("tr");
  row.innerHTML = `
<td>${rowCount}</td>
<td><input type="text" class="item_desc"></td>
<td><input type="number" class="item_qty" value="1"></td>
<td><input type="number" class="item_price" value="0"></td>
<td><input type="number" class="item_tax" value="0"></td>
<td class="item_total">${currencySymbol}0.00</td>
<td><button class="remove_item">X</button></td>
`;
  invoiceItems.appendChild(row);
});

// Remove Item
invoiceItems.addEventListener("click", e => {
  if (e.target.classList.contains("remove_item")) {
    e.target.closest("tr").remove();
    calculateTotals();
  }
});

// New Invoice
document.getElementById("new_invoice").addEventListener("click", () => location.reload());

// Auto Date & Invoice No
const invoiceDateInput = document.getElementById("invoice_date");
if(invoiceDateInput) invoiceDateInput.value = new Date().toISOString().split("T")[0];

const invoiceNoInput = document.getElementById("invoice_no");
if(invoiceNoInput) invoiceNoInput.value = Math.floor(Math.random() * 90000) + 10000;

// Logo Upload
const logoUpload = document.getElementById("logo_upload");
const companyLogo = document.getElementById("company_logo");
logoUpload.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      companyLogo.src = e.target.result;
      companyLogo.style.display = "block";
    }
    reader.readAsDataURL(file);
  }
});

// Copy Invoice
document.getElementById("copy_invoice").addEventListener("click", () => {
  let text = "INVOICE\n\n";
  text += "Customer: " + document.getElementById("customer_name").value + "\n";
  text += "Invoice No: " + document.getElementById("invoice_no").value + "\n";
  text += "Date: " + document.getElementById("invoice_date").value + "\n\n";
  invoiceItems.querySelectorAll("tr").forEach(row => {
    const desc = row.querySelector(".item_desc").value;
    const qty = row.querySelector(".item_qty").value;
    const price = row.querySelector(".item_price").value;
    const tax = row.querySelector(".item_tax").value;
    const total = row.querySelector(".item_total").textContent;
    text += `${desc} | Qty:${qty} | Price:${price} | Tax:${tax}% | Total:${total}\n`;
  });
  text += "\nTotal: " + totalTd.textContent;
  navigator.clipboard.writeText(text);
  alert("Invoice copied!");
});

// Share Invoice
document.getElementById("share_invoice").addEventListener("click", () => {
  const data = {
    customer: document.getElementById("customer_name").value,
    invoice: document.getElementById("invoice_no").value,
    date: document.getElementById("invoice_date").value,
    currency: currencySymbol,
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
  const encoded = encodeURIComponent(JSON.stringify(data));
  const link = location.origin + location.pathname + "?data=" + encoded;
  navigator.clipboard.writeText(link);
  alert("Share link copied!");
});

// Load invoice from link
const params = new URLSearchParams(window.location.search);
if(params.has("data")){
  const data = JSON.parse(decodeURIComponent(params.get("data")));
  document.getElementById("customer_name").value = data.customer;
  document.getElementById("invoice_no").value = data.invoice;
  document.getElementById("invoice_date").value = data.date;
  invoiceItems.innerHTML = "";
  data.items.forEach((item,index)=>{
    const row = document.createElement("tr");
    row.innerHTML = `
<td>${index+1}</td>
<td><input type="text" class="item_desc" value="${item.desc}"></td>
<td><input type="number" class="item_qty" value="${item.qty}"></td>
<td><input type="number" class="item_price" value="${item.price}"></td>
<td><input type="number" class="item_tax" value="${item.tax}"></td>
<td class="item_total">${currencySymbol}0.00</td>
<td><button class="remove_item">X</button></td>
`;
    invoiceItems.appendChild(row);
  });
  calculateTotals();
}

// Initial calculation
calculateTotals();