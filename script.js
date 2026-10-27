const products = [
  {id:1,name:"Maçã vermelha",category:"Frutas",emoji:"🍎",description:"Unidade • selecionada",price:2.49},
  {id:2,name:"Banana",category:"Frutas",emoji:"🍌",description:"Dúzia • madura",price:6.99},
  {id:3,name:"Laranja",category:"Frutas",emoji:"🍊",description:"Quilo • fresca",price:4.79},
  {id:4,name:"Brócolis",category:"Verduras",emoji:"🥦",description:"Maço • fresquinho",price:5.49},
  {id:5,name:"Alface",category:"Verduras",emoji:"🥬",description:"Unidade • colhida hoje",price:3.29},
  {id:6,name:"Cenoura",category:"Verduras",emoji:"🥕",description:"Quilo • selecionada",price:4.19},
  {id:7,name:"Arroz",category:"Mercearia",emoji:"🍚",description:"Pacote de 1 kg",price:7.89},
  {id:8,name:"Pão",category:"Mercearia",emoji:"🍞",description:"Pacote • macio",price:8.49},
  {id:9,name:"Leite",category:"Bebidas",emoji:"🥛",description:"Caixa de 1 litro",price:5.19},
  {id:10,name:"Suco de laranja",category:"Bebidas",emoji:"🧃",description:"Caixa de 1 litro",price:6.59},
  {id:11,name:"Morango",category:"Frutas",emoji:"🍓",description:"Bandeja • doce",price:8.99},
  {id:12,name:"Milho",category:"Mercearia",emoji:"🌽",description:"Unidade • selecionado",price:3.79}
];
let cart = {};
let currentCategory = "Todos";
let orders = [];
let authMode = "login";

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if (id === "carrinho") renderCart();
  if (id === "pedidos") renderOrders();
  window.scrollTo({top:0,behavior:"smooth"});
}
function money(value) {
  return value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
}
function renderProducts() {
  const query = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const visible = products.filter(p => (currentCategory === "Todos" || p.category === currentCategory) && p.name.toLowerCase().includes(query));
  const grid = document.getElementById("productGrid");
  if (!visible.length) {
    grid.innerHTML = '<div class="empty-products">Nenhum produto encontrado. Tente outra busca.</div>';
    return;
  }
  grid.innerHTML = visible.map(p => `<article class="product-card">
    <div class="product-visual">${p.emoji}</div><span class="tag">${p.category.toUpperCase()}</span>
    <h3>${p.name}</h3><p>${p.description}</p>
    <div class="product-bottom"><div class="price">${money(p.price)}</div><button class="add-btn" aria-label="Adicionar ${p.name}" onclick="addToCart(${p.id})">+</button></div>
  </article>`).join("");
}
function setCategory(category, button) {
  currentCategory = category;
  document.querySelectorAll(".category").forEach(b => b.classList.remove("active"));
  button.classList.add("active");
  renderProducts();
}
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCartCount();
  showToast("Produto adicionado ao carrinho!");
}
function updateCartCount() {
  document.getElementById("cartCount").textContent = Object.values(cart).reduce((a,b)=>a+b,0);
}
function renderCart() {
  const entries = Object.entries(cart).filter(([id,qty])=>qty>0);
  const container = document.getElementById("cartItems");
  if (!entries.length) {
    container.innerHTML = '<div class="empty-state"><span>🛍️</span><h2>Seu carrinho está vazio</h2><p>Adicione alguns produtos para começar sua compra.</p><button class="btn primary" onclick="showScreen(&quot;mercado&quot;)">Ver produtos</button></div>';
  } else {
    container.innerHTML = entries.map(([id,qty]) => {
      const p = products.find(x=>x.id===Number(id));
      return `<article class="cart-row"><div class="cart-emoji">${p.emoji}</div><div><h3>${p.name}</h3><p>${money(p.price)} por unidade</p><div class="quantity"><button onclick="changeQty(${id},-1)">−</button><b>${qty}</b><button onclick="changeQty(${id},1)">+</button></div></div><div class="cart-price">${money(p.price*qty)}<br><button class="remove" onclick="removeFromCart(${id})">Remover</button></div></article>`;
    }).join("");
  }
  const subtotal = entries.reduce((sum,[id,qty])=>sum+products.find(p=>p.id===Number(id)).price*qty,0);
  document.getElementById("subtotal").textContent = money(subtotal);
  document.getElementById("delivery").textContent = money(subtotal ? 7 : 0);
  document.getElementById("total").textContent = money(subtotal + (subtotal ? 7 : 0));
}
function changeQty(id, amount) {
  cart[id] = (cart[id] || 0) + amount;
  if (cart[id] <= 0) delete cart[id];
  updateCartCount(); renderCart();
}
function removeFromCart(id) {
  delete cart[id]; updateCartCount(); renderCart(); showToast("Produto removido.");
}
function setAuthMode(mode) {
  authMode = mode;
  document.getElementById("loginTab").classList.toggle("active",mode==="login");
  document.getElementById("registerTab").classList.toggle("active",mode==="register");
  document.getElementById("nome").required = mode==="register";
  document.getElementById("nameOptional").textContent = mode==="register" ? "(obrigatório)" : "(opcional para entrar)";
  document.getElementById("nome").style.display = "block";
  document.querySelector('label[for="nome"]').style.display = "block";
  document.getElementById("authSubmit").textContent = mode==="login" ? "Entrar" : "Criar minha conta";
  document.getElementById("authMessage").textContent = mode==="login" ? "Demonstração: os dados não são enviados para um servidor." : "Cadastro demonstrativo: nenhuma informação será salva online.";
}
function handleAuth(event) {
  event.preventDefault();
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  if (authMode==="register" && !nome) return showToast("Digite seu nome para criar o cadastro.");
  showToast(authMode==="login" ? `Bem-vindo${nome ? ", "+nome : ""}!` : `Cadastro demonstrativo criado, ${nome}!`);
  showScreen("mercado");
}
function finishOrder() {
  const entries = Object.entries(cart).filter(([id,qty])=>qty>0);
  if (!entries.length) return showToast("Adicione produtos ao carrinho antes de finalizar.");
  const endereco = document.getElementById("endereco").value.trim();
  if (!endereco) { document.getElementById("endereco").focus(); return showToast("Informe o endereço de entrega."); }
  const subtotal = entries.reduce((sum,[id,qty])=>sum+products.find(p=>p.id===Number(id)).price*qty,0);
  orders.unshift({number:Date.now().toString().slice(-6),date:new Date().toLocaleDateString("pt-BR"),items:entries.reduce((s,[id,q])=>s+q,0),total:subtotal+7,payment:document.getElementById("pagamento").value,address:endereco});
  cart = {}; updateCartCount(); renderCart(); showToast("Pedido finalizado na demonstração!");
  showScreen("pedidos");
}
function renderOrders() {
  const container = document.getElementById("ordersList");
  if (!orders.length) {
    container.innerHTML = '<div class="empty-state"><span>📦</span><h2>Nenhum pedido ainda</h2><p>Quando você finalizar uma compra, ela aparecerá aqui.</p><button class="btn primary" onclick="showScreen(&quot;mercado&quot;)">Explorar produtos</button></div>';
    return;
  }
  container.innerHTML = orders.map(o=>`<article class="order-card"><div><h3>Pedido #${o.number}</h3><p>${o.date} • ${o.items} item(ns) • ${o.payment}</p><p>Entrega: ${o.address}</p></div><div><span class="status">✓ Pedido recebido</span><h3 style="text-align:right;margin-top:12px">${money(o.total)}</h3></div></article>`).join("");
}
let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>toast.classList.remove("show"),2600);
}
renderProducts();
