const invoiceItems = document.getElementById('invoice_items');
const subtotalTd = document.getElementById('subtotal');
const taxTd = document.getElementById('tax');
const totalTd = document.getElementById('total');
const currencySelect = document.getElementById("currency");
let currencySymbol="$";

// تغيير العملة
currencySelect.addEventListener("change",()=> {
  currencySymbol = currencySelect.value;
  calculateTotals();
});

// حساب صف واحد
function calculateRowTotal(row){
  const qty = row.querySelector('.item_qty').valueAsNumber || 0;
  const price = row.querySelector('.item_price').valueAsNumber || 0;
  const total = qty * price;
  row.querySelector('.item_total').textContent = `${currencySymbol}${total.toFixed(2)}`;
  return total;
}

// حساب الكل
function calculateTotals(){
  let subtotal = 0;
  invoiceItems.querySelectorAll('tr').forEach(row=>{
    subtotal += calculateRowTotal(row);
  });
  const tax = subtotal*0.15;
  const total = subtotal + tax;
  subtotalTd.textContent = `${currencySymbol}${subtotal.toFixed(2)}`;
  taxTd.textContent = `${currencySymbol}${tax.toFixed(2)}`;
  totalTd.textContent = `${currencySymbol}${total.toFixed(2)}`;
}

invoiceItems.addEventListener('input', calculateTotals);

// إضافة صف جديد
document.getElementById("add_item").addEventListener("click",()=>{
  const rowCount = invoiceItems.rows.length + 1;
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${rowCount}</td>
    <td><input type="text" class="item_desc"></td>
    <td><input type="number" class="item_qty" value="1"></td>
    <td><input type="number" class="item_price" value="0"></td>
    <td class="item_total">${currencySymbol}0.00</td>
    <td><button class="remove_item">X</button></td>
  `;
  invoiceItems.appendChild(row);
});

// إزالة صف
invoiceItems.addEventListener("click", e=>{
  if(e.target.classList.contains("remove_item")){
    e.target.closest("tr").remove();
    calculateTotals();
  }
});

// New Invoice
document.getElementById("new_invoice").addEventListener("click",()=>location.reload());

// التاريخ التلقائي
document.getElementById("invoice_date").value = new Date().toISOString().split("T")[0];

// رقم فاتورة تلقائي
document.getElementById("invoice_no").value = Math.floor(Math.random()*90000)+10000;

// رفع الشعار
const logoUpload = document.getElementById("logo_upload");
const companyLogo = document.getElementById("company_logo");
logoUpload.addEventListener("change", function(){
  const file = this.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = function(e){
      companyLogo.src = e.target.result;
      companyLogo.style.display = "block";
    }
    reader.readAsDataURL(file);
  }
});



// الحساب الأولي
calculateTotals();