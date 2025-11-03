const API_BASE = '/api';
let currentSection = 'paintings';
let token = localStorage.getItem('token');

// Authentication check
if (!token) {
    window.location.href = '/login.html';
}

// DOM elements
const logoutBtn = document.getElementById('logout-btn');
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.admin-section');
const addPaintingBtn = document.getElementById('add-painting-btn');
const paintingsList = document.getElementById('paintings-list');
const ordersList = document.getElementById('orders-list');
const paintingModal = document.getElementById('painting-modal');
const paintingForm = document.getElementById('painting-form');
const modalTitle = document.getElementById('modal-title');
const closeBtn = document.querySelector('.close');

// Event listeners
logoutBtn.addEventListener('click', logout);
navBtns.forEach(btn => btn.addEventListener('click', switchSection));
addPaintingBtn.addEventListener('click', openAddPaintingModal);
closeBtn.addEventListener('click', closeModal);
paintingForm.addEventListener('submit', handlePaintingSubmit);

// Functions
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

function switchSection(e) {
    const section = e.target.dataset.section;
    navBtns.forEach(btn => btn.classList.remove('active'));
    sections.forEach(sec => sec.classList.remove('active'));
    e.target.classList.add('active');
    document.getElementById(`${section}-section`).classList.add('active');
    currentSection = section;
    loadSectionData(section);
}

function openAddPaintingModal() {
    modalTitle.textContent = 'Добавить картину';
    paintingForm.reset();
    paintingModal.classList.add('active');
}

function closeModal() {
    paintingModal.classList.remove('active');
}

async function handlePaintingSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('technique', document.getElementById('technique').value);
    formData.append('price', document.getElementById('price').value);
    formData.append('image', document.getElementById('image').files[0]);

    try {
        const response = await fetch(`${API_BASE}/paintings`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        if (response.ok) {
            closeModal();
            loadSectionData('paintings');
        } else {
            alert('Ошибка при сохранении картины');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadSectionData(section) {
    try {
        switch (section) {
            case 'paintings':
                await loadPaintings();
                break;
            case 'orders':
                await loadOrders();
                break;
            case 'analytics':
                await loadAnalytics();
                break;
        }
    } catch (error) {
        console.error('Error loading section data:', error);
    }
}

async function loadPaintings() {
    const response = await fetch(`${API_BASE}/paintings`);
    const paintings = await response.json();
    paintingsList.innerHTML = '';
    paintings.forEach(painting => {
        const paintingCard = createPaintingCard(painting);
        paintingsList.appendChild(paintingCard);
    });
}

function createPaintingCard(painting) {
    const card = document.createElement('div');
    card.className = 'painting-card';
    card.innerHTML = `
        <img src="${painting.image}" alt="${painting.title}">
        <h3>${painting.title}</h3>
        <p>${painting.technique}</p>
        <p>${painting.price} ₽</p>
        <div class="card-actions">
            <button class="btn-edit" data-id="${painting._id}">Редактировать</button>
            <button class="btn-delete" data-id="${painting._id}">Удалить</button>
        </div>
    `;
    card.querySelector('.btn-edit').addEventListener('click', () => editPainting(painting));
    card.querySelector('.btn-delete').addEventListener('click', () => deletePainting(painting._id));
    return card;
}

function editPainting(painting) {
    modalTitle.textContent = 'Редактировать картину';
    document.getElementById('title').value = painting.title;
    document.getElementById('description').value = painting.description;
    document.getElementById('technique').value = painting.technique;
    document.getElementById('price').value = painting.price;
    paintingModal.classList.add('active');
}

async function deletePainting(id) {
    if (confirm('Вы уверены, что хотите удалить эту картину?')) {
        try {
            const response = await fetch(`${API_BASE}/paintings/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                loadSectionData('paintings');
            }
        } catch (error) {
            console.error('Error deleting painting:', error);
        }
    }
}

async function loadOrders() {
    const response = await fetch(`${API_BASE}/orders`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    const orders = await response.json();
    ordersList.innerHTML = '';
    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersList.appendChild(orderCard);
    });
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
        <h3>Заказ #${order._id.slice(-6)}</h3>
        <p>Пользователь: ${order.user.email}</p>
        <p>Сумма: ${order.total} ₽</p>
        <p>Статус: ${order.status}</p>
        <p>Дата: ${new Date(order.createdAt).toLocaleDateString()}</p>
    `;
    return card;
}

async function loadAnalytics() {
    const [paintingsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE}/paintings`),
        fetch(`${API_BASE}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
    ]);
    const paintings = await paintingsRes.json();
    const orders = await ordersRes.json();

    document.getElementById('total-paintings').textContent = paintings.length;
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-revenue').textContent = orders.reduce((sum, order) => sum + order.total, 0) + ' ₽';
}

// Initialize
loadSectionData('paintings');