let clients = [];
let products = [];
let sales = [];
let currentSale = {
  client: null,
  items: [],
  subtotal: 0,
  igv: 0,
  total: 0
};

const IGV_RATE = 0.18;
let initialStock = {};
let dailyGifts = {
  vaso: 0,
  panPollo: 0,
  panLomito: 0
};

// Navegación entre secciones
function showSection(sectionId) {
  document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
  document.getElementById(sectionId + 'Section').style.display = 'block';
}

// Clientes
function addClient() {
  do {
    const dni = document.getElementById("clientDNI").value.trim();
    const names = document.getElementById("clientNames").value.trim();
    const lastnames = document.getElementById("clientLastnames").value.trim();
    const points = parseInt(document.getElementById("clientPoints").value);

    if (!dni || !names || !lastnames || isNaN(points)) {
      alert("Complete todos los campos correctamente.");
      return;
    }

    if (clients.find(c => c.dni === dni)) {
      alert("El DNI ya está registrado.");
      return;
    }

    clients.push({ dni, names, lastnames, points });
    alert("Cliente registrado.");

    // Limpiar campos
    document.getElementById("clientDNI").value = '';
    document.getElementById("clientNames").value = '';
    document.getElementById("clientLastnames").value = '';
    document.getElementById("clientPoints").value = '0';

    var continuar = prompt("¿Desea ingresar otro cliente? (S/N)").toUpperCase();
    if (continuar !== 'S') break;

  } while (true);
}


function displayClients() {
  const div = document.getElementById("clientList");
  div.innerHTML = "<h3>Lista de Clientes</h3>";

  if (clients.length === 0) {
    div.innerHTML += "<p>No hay clientes registrados.</p>";
  } else {
    clients.forEach(c => {
      div.innerHTML += `<div class='list-item'>
        <strong>${c.dni}</strong> - ${c.names} ${c.lastnames} (Puntos: ${c.points})
      </div>`;
    });
  }
  div.style.display = 'block';
}

// Productos
function addProduct() {
  do {
    const code = document.getElementById("productCode").value.trim();
    const name = document.getElementById("productName").value.trim();
    const category = document.getElementById("productCategory").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const points = parseInt(document.getElementById("productPoints").value);
    const stock = parseInt(document.getElementById("productStock").value);

    if (!code || !name || !category || isNaN(price) || isNaN(points) || isNaN(stock)) {
      alert("Complete todos los campos del producto correctamente.");
      return;
    }

    if (products.find(p => p.code === code)) {
      alert("El código ya está registrado.");
      return;
    }

    products.push({ code, name, category, price, points, stock });
    initialStock[code] = stock;
    alert("Producto registrado.");

    // Limpiar campos
    document.getElementById("productCode").value = '';
    document.getElementById("productName").value = '';
    document.getElementById("productCategory").value = '';
    document.getElementById("productPrice").value = '';
    document.getElementById("productPoints").value = '0';
    document.getElementById("productStock").value = '0';

    var continuar = prompt("¿Desea ingresar otro producto? (S/N)").toUpperCase();
    if (continuar !== 'S') break;

  } while (true);
}


function displayProducts() {
  const div = document.getElementById("productList");
  div.innerHTML = "<h3>Lista de Productos</h3>";

  if (products.length === 0) {
    div.innerHTML += "<p>No hay productos registrados.</p>";
  } else {
    products.forEach(p => {
      div.innerHTML += `<div class='list-item'>
        <strong>${p.code}</strong> - ${p.name} | S/ ${p.price.toFixed(2)} | Stock: ${p.stock}
      </div>`;
    });
  }
  div.style.display = 'block';
}

// Iniciar venta
function startNewSale() {
  currentSale = {
    client: null,
    items: [],
    subtotal: 0,
    igv: 0,
    total: 0
  };

  document.getElementById("salesListContainer").style.display = "none";
  document.getElementById("sellProductContainer").style.display = "block";
  document.getElementById("saleSummaryContainer").style.display = "none";
  document.getElementById("searchClientDNI").value = "";
  document.getElementById("clientSaleInfo").textContent = "";
  document.getElementById("productSelectionSection").style.display = "none";
  updateSaleCartDisplay();
}

function searchClientForSale() {
  const dni = document.getElementById("searchClientDNI").value.trim();
  const client = clients.find(c => c.dni === dni);

  if (!client) {
    document.getElementById("clientSaleInfo").textContent = "Cliente no encontrado.";
    document.getElementById("productSelectionSection").style.display = "none";
    return;
  }

  currentSale.client = client;
  document.getElementById("clientSaleInfo").textContent = `Cliente: ${client.names} ${client.lastnames}`;
  document.getElementById("productSelectionSection").style.display = "block";

  populateProductDropdown();
}

function populateProductDropdown() {
  const select = document.getElementById("saleProductSelect");
  select.innerHTML = '<option value="">Seleccione un producto</option>';
  products.forEach(p => {
    if (p.stock > 0) {
      const option = document.createElement("option");
      option.value = p.code;
      option.textContent = `${p.name} (S/ ${p.price.toFixed(2)})`;
      select.appendChild(option);
    }
  });
}

function displaySelectedProductInfo() {
  const code = document.getElementById("saleProductSelect").value;
  const product = products.find(p => p.code === code);

  if (product) {
    document.getElementById("selectedProductPriceInfo").textContent =
      `Precio: S/ ${product.price.toFixed(2)} | Stock: ${product.stock}`;
  } else {
    document.getElementById("selectedProductPriceInfo").textContent = "";
  }
}

function addProductToSale() {
  const code = document.getElementById("saleProductSelect").value;
  const quantity = parseInt(document.getElementById("productQuantity").value);

  const product = products.find(p => p.code === code);

  if (!product || isNaN(quantity) || quantity <= 0 || quantity > product.stock) {
    alert("Verifique el producto y cantidad.");
    return;
  }

  let existing = currentSale.items.find(i => i.product.code === code);
  if (existing) {
    if (existing.quantity + quantity > product.stock) {
      alert("Stock insuficiente.");
      return;
    }
    existing.quantity += quantity;
  } else {
    currentSale.items.push({ product, quantity });
  }

  updateSaleCartDisplay();
  document.getElementById("productQuantity").value = 1;
  document.getElementById("saleProductSelect").value = "";
  document.getElementById("selectedProductPriceInfo").textContent = "";
}

function updateSaleCartDisplay() {
  const list = document.getElementById("saleCartList");
  list.innerHTML = "";
  let subtotal = 0;

  currentSale.items.forEach(item => {
    const totalItem = item.product.price * item.quantity;
    subtotal += totalItem;

    const li = document.createElement("li");
    li.textContent = `${item.quantity} x ${item.product.name} = S/ ${totalItem.toFixed(2)}`;
    list.appendChild(li);
  });

  currentSale.subtotal = subtotal;
  currentSale.igv = subtotal * IGV_RATE;
  currentSale.total = subtotal + currentSale.igv;

  document.getElementById("currentSaleSubtotal").textContent = subtotal.toFixed(2);
  document.getElementById("currentSaleIGV").textContent = currentSale.igv.toFixed(2);
  document.getElementById("currentSaleTotal").textContent = currentSale.total.toFixed(2);
}

function completeSale(confirmar) {
  if (!currentSale.client || currentSale.items.length === 0) {
    alert("Debe haber cliente y productos en la venta.");
    return;
  }

  if (confirmar && !confirm("¿Desea finalizar la venta?")) return;

  // Descontar stock
  currentSale.items.forEach(item => {
    let producto = products.find(p => p.code === item.product.code);
    producto.stock -= item.quantity;
  });

  // Sumar puntos
  let puntos = 0;
  currentSale.items.forEach(item => {
    puntos += item.product.points * item.quantity;
  });
  currentSale.client.points += puntos;

  // Fecha de venta
  currentSale.date = new Date().toISOString();
  sales.push({ ...currentSale });

  // Obsequios según total
  if (currentSale.total > 20) {
    dailyGifts.panLomito++;
  } else if (currentSale.total > 10) {
    dailyGifts.vaso++;
    dailyGifts.panPollo++;
  }

  generateSaleSummary();

  document.getElementById("sellProductContainer").style.display = "none";
  document.getElementById("saleSummaryContainer").style.display = "block";
  currentSale = {
    client: null,
    items: [],
    subtotal: 0,
    igv: 0,
    total: 0
  };
  populateProductDropdown();
}

function generateSaleSummary() {
  const s = sales[sales.length - 1];
  let resumen = `Fecha: ${new Date(s.date).toLocaleString()}\n`;
  resumen += `Cliente: ${s.client.names} ${s.client.lastnames} (DNI: ${s.client.dni})\n\n`;
  resumen += `Productos:\n`;

  s.items.forEach(i => {
    resumen += ` - ${i.quantity} x ${i.product.name} (S/ ${i.product.price.toFixed(2)})\n`;
  });

  resumen += `\nSubtotal: S/ ${s.subtotal.toFixed(2)}\n`;
  resumen += `IGV: S/ ${s.igv.toFixed(2)}\n`;
  resumen += `Total: S/ ${s.total.toFixed(2)}\n\n`;

  if (s.total > 20) {
    resumen += `Obsequio: Pan con lomito al jugo\n`;
  } else if (s.total > 10) {
    resumen += `Obsequios: Vaso de emoliente + Pan con pollo\n`;
  } else {
    resumen += `Obsequio: Ninguno\n`;
  }

  document.getElementById("saleSummaryContent").textContent = resumen;
}

// Reportes
function showReports() {
  document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
  document.getElementById('reportSection').style.display = 'block';
  document.getElementById('reportResult').innerHTML = '<p>Seleccione una opción de reporte.</p>';
}

function showDailySales() {
  let total = sales.reduce((sum, s) => sum + s.total, 0);
  document.getElementById('reportResult').innerHTML = `<h3>Total de ventas:</h3><p><strong>S/ ${total.toFixed(2)}</strong></p>`;
}

function showDailyGifts() {
  const html = `
    <h3>Obsequios entregados:</h3>
    <ul>
      <li>Vasos adicionales: ${dailyGifts.vaso}</li>
      <li>Panes con pollo: ${dailyGifts.panPollo}</li>
      <li>Panes con lomito al jugo: ${dailyGifts.panLomito}</li>
    </ul>
  `;
  document.getElementById('reportResult').innerHTML = html;
}

function showStockReport() {
  let html = `<h3>Stock inicial vs final</h3><table><tr><th>Producto</th><th>Inicial</th><th>Actual</th></tr>`;
  products.forEach(p => {
    html += `<tr><td>${p.name}</td><td>${initialStock[p.code] ?? 0}</td><td>${p.stock}</td></tr>`;
  });
  html += '</table>';
  document.getElementById('reportResult').innerHTML = html;
}

// Mostrar por defecto sección clientes
document.addEventListener('DOMContentLoaded', () => {
  showSection('clients');
});

function showSalesList() {
  // Oculta otras sub-secciones de ventas
  document.getElementById("sellProductContainer").style.display = "none";
  document.getElementById("saleSummaryContainer").style.display = "none";

  const container = document.getElementById("salesListContainer");
  container.innerHTML = "<h3>Ventas Realizadas</h3>";

  if (sales.length === 0) {
    container.innerHTML += "<p>No hay ventas registradas.</p>";
  } else {
    sales.forEach(s => {
      let html = `<div class='list-item'>
        <strong>Fecha:</strong> ${new Date(s.date).toLocaleString()}<br>
        <strong>Cliente:</strong> ${s.client.names} ${s.client.lastnames} (DNI: ${s.client.dni})<br>
        <strong>Productos:</strong><ul>`;

      s.items.forEach(i => {
        html += `<li>${i.quantity} x ${i.product.name} (S/ ${i.product.price.toFixed(2)})</li>`;
      });

      html += `</ul><strong>Total:</strong> S/ ${s.total.toFixed(2)}</div>`;
      container.innerHTML += html;
    });
  }

  container.style.display = "block";
}

