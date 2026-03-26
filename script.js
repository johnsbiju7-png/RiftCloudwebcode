// Orders Storage
let orders = JSON.parse(localStorage.getItem('riftcloud_orders')) || [];
let currentUser = null;

// UPI ID
const UPI_ID = 'johnsbiju@fam';

// Open Payment Modal
function openPayment(service, amount) {
    const modal = document.getElementById('upiModal');
    const modalService = document.getElementById('modalService');
    const modalAmount = document.getElementById('modalAmount');
    
    modalService.textContent = service;
    modalAmount.textContent = amount;
    
    // Generate QR Code
    const upiString = `upi://pay?pa=${UPI_ID}&pn=RiftCloud&am=${amount}&cu=INR`;
    document.getElementById('qrCode').innerHTML = '';
    new QRCode(document.getElementById('qrCode'), {
        text: upiString,
        width: 200,
        height: 200
    });
    
    // Store current order
    window.currentOrder = { service, amount, timestamp: new Date().toISOString() };
    
    modal.style.display = 'block';
}

// Pay with UPI App
function payWithUPI(app) {
    const amount = window.currentOrder.amount;
    let upiLink = '';
    
    switch(app) {
        case 'googlepay':
            upiLink = `https://gpay.app.goo.gl/?pa=${UPI_ID}&pn=RiftCloud&am=${amount}&cu=INR`;
            break;
        case 'phonepe':
            upiLink = `https://phonepe.com/app/upi/${UPI_ID}?amount=${amount}`;
            break;
        case 'paytm':
            upiLink = `https://paytm.com/upi/${UPI_ID}?amount=${amount}`;
            break;
        default:
            upiLink = `upi://pay?pa=${UPI_ID}&pn=RiftCloud&am=${amount}&cu=INR`;
    }
    
    window.open(upiLink, '_blank');
}

// Confirm Payment
function confirmPayment() {
    if (!window.currentOrder) return;
    
    const order = {
        id: 'ORD' + Date.now(),
        service: window.currentOrder.service,
        amount: window.currentOrder.amount,
        status: 'pending',
        customerName: prompt('Enter your Discord username (for delivery):'),
        customerId: prompt('Enter your Discord ID:'),
        timestamp: window.currentOrder.timestamp,
        transactionId: 'TXN' + Math.random().toString(36).substr(2, 8).toUpperCase()
    };
    
    orders.push(order);
    localStorage.setItem('riftcloud_orders', JSON.stringify(orders));
    
    alert(`✅ Order Confirmed!\n\nOrder ID: ${order.id}\nService: ${order.service}\nAmount: ₹${order.amount}\n\nWe'll contact you on Discord within 24 hours.`);
    
    closeModal();
    
    // Reset checkbox
    document.getElementById('paymentConfirmed').checked = false;
    document.getElementById('confirmPaymentBtn').disabled = true;
    window.currentOrder = null;
}

// Checkbox handler
document.getElementById('paymentConfirmed')?.addEventListener('change', (e) => {
    const btn = document.getElementById('confirmPaymentBtn');
    btn.disabled = !e.target.checked;
});

// Close Modals
function closeModal() {
    document.getElementById('upiModal').style.display = 'none';
}

document.querySelectorAll('.close, .close-login, .close-staff').forEach(btn => {
    btn.onclick = function() {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    };
});

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};

// Staff Login
document.getElementById('staffLoginBtn').onclick = () => {
    document.getElementById('loginModal').style.display = 'block';
};

document.getElementById('loginForm').onsubmit = (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Demo credentials
    if ((username === 'admin' && password === 'riftcloud2024') || 
        (username === 'staff' && password === 'staff123')) {
        currentUser = { username, role: 'staff' };
        localStorage.setItem('riftcloud_staff', JSON.stringify(currentUser));
        document.getElementById('loginModal').style.display = 'none';
        openStaffPanel();
    } else {
        alert('Invalid credentials! Use: admin / riftcloud2024');
    }
};

// Open Staff Panel
function openStaffPanel() {
    const panel = document.getElementById('staffPanelModal');
    updateStaffPanel();
    panel.style.display = 'block';
}

// Update Staff Panel
function updateStaffPanel() {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const completed = orders.filter(o => o.status === 'completed').length;
    
    document.getElementById('totalOrders').textContent = total;
    document.getElementById('pendingOrders').textContent = pending;
    document.getElementById('completedOrders').textContent = completed;
    
    const ordersTable = document.getElementById('ordersTable');
    ordersTable.innerHTML = '';
    
    orders.reverse().forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        orderDiv.innerHTML = `
            <div class="order-info">
                <p><strong>${order.service}</strong> - ₹${order.amount}</p>
                <p>Order ID: ${order.id}</p>
                <p>Customer: ${order.customerName || 'N/A'} (${order.customerId || 'N/A'})</p>
                <p>Transaction: ${order.transactionId || 'N/A'}</p>
                <p>Date: ${new Date(order.timestamp).toLocaleString()}</p>
            </div>
            <div>
                <span class="order-status status-${order.status}">${order.status.toUpperCase()}</span>
                ${order.status === 'pending' ? `<button class="complete-btn" onclick="markComplete('${order.id}')">Complete</button>` : ''}
            </div>
        `;
        ordersTable.appendChild(orderDiv);
    });
}

// Mark Order as Complete
function markComplete(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'completed';
        localStorage.setItem('riftcloud_orders', JSON.stringify(orders));
        updateStaffPanel();
        alert(`✅ Order ${orderId} marked as completed!`);
    }
}

// Logout
function logout() {
    currentUser = null;
    localStorage.removeItem('riftcloud_staff');
    document.getElementById('staffPanelModal').style.display = 'none';
    alert('Logged out successfully!');
}

// Check if staff is already logged in
const savedStaff = localStorage.getItem('riftcloud_staff');
if (savedStaff) {
    currentUser = JSON.parse(savedStaff);
}

// Live Stats Animation
let onlinePlayers = 247;
let discordMembers = 1256;
let activeServers = 89;

const onlineElement = document.getElementById('onlinePlayers');
const discordElement = document.getElementById('discordMembers');
const serversElement = document.getElementById('activeServers');

function updateLiveStats() {
    onlinePlayers += Math.floor(Math.random() * 11) - 5;
    discordMembers += Math.floor(Math.random() * 21) - 10;
    activeServers += Math.floor(Math.random() * 5) - 2;
    
    if (onlinePlayers < 100) onlinePlayers = 100;
    if (onlinePlayers > 500) onlinePlayers = 500;
    if (discordMembers < 800) discordMembers = 800;
    if (discordMembers > 2000) discordMembers = 2000;
    if (activeServers < 50) activeServers = 50;
    if (activeServers > 150) activeServers = 150;
    
    if (onlineElement) onlineElement.textContent = onlinePlayers;
    if (discordElement) discordElement.textContent = discordMembers;
    if (serversElement) serversElement.textContent = activeServers;
}

setInterval(updateLiveStats, 8000);

// Smooth scroll for navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Add hover effect for cards
document.querySelectorAll('.crystal-card, .pricing-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

console.log('%c✨ RIFTCLOUD DEVELOPMENT ✨', 'color: #00ffff; font-size: 20px; font-weight: bold;');
console.log('%cUPI ID: johnsbiju@fam', 'color: #ff66ff; font-size: 14px;');
console.log('%cStaff Login: admin / riftcloud2024', 'color: #00ff00; font-size: 12px;');