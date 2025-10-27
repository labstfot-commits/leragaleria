// Данные о картинах
const paintings = {
    1: {
        title: "Силуэт свободы",
        description: "Эта работа исследует границы телесности и свободы самовыражения. Художница использует драматичный контраст красного и чёрного, чтобы передать силу эмоции.",
        technique: "2024, акрил, 80×100 см",
        price: "45 000 ₽",
        image: "linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)"
    },
    2: {
        title: "Танцующее тело",
        description: "Динамичная композиция, посвящённая движению и пластике человеческого тела. Золотые оттенки создают ощущение внутреннего света.",
        technique: "2024, коллаж, 60×80 см",
        price: "35 000 ₽",
        image: "linear-gradient(135deg, #ffd93d 0%, #f59f00 100%)"
    },
    3: {
        title: "Зелёный взгляд",
        description: "Работа о силе взгляда и его способности преображать мир вокруг нас. Зелёный цвет символизирует рост и обновление.",
        technique: "2024, акрил, 70×90 см",
        price: "38 000 ₽",
        image: "linear-gradient(135deg, #a8e063 0%, #6bcf7f 100%)"
    },
    4: {
        title: "Голубая грусть",
        description: "Эмоционально насыщенная картина о том, как грусть может быть прекрасной и возвышенной. Смешанная техника придаёт глубину и объём.",
        technique: "2024, смешанная техника, 90×110 см",
        price: "50 000 ₽",
        image: "linear-gradient(135deg, #4ecdc4 0%, #26a69a 100%)"
    },
    5: {
        title: "Цветок страсти",
        description: "Яркая инсталляция, воплощающая страсть и чувственность. Работа требует особого внимания зрителя.",
        technique: "2024, инсталляция, 100×120 см",
        price: "55 000 ₽",
        image: "linear-gradient(135deg, #95e1d3 0%, #f38181 100%)"
    },
    6: {
        title: "Розовый закат",
        description: "Нежное исследование момента перехода дня в ночь. Розовые и коралловые оттенки создают атмосферу умиротворения.",
        technique: "2024, акрил, 65×85 см",
        price: "32 000 ₽",
        image: "linear-gradient(135deg, #ffa07a 0%, #ff7f50 100%)"
    },
    7: {
        title: "Фиолетовая мечта",
        description: "Мистическая композиция о границе между реальностью и мечтой. Фиолетовый цвет ассоциируется с творчеством и магией.",
        technique: "2024, смешанная техника, 75×95 см",
        price: "42 000 ₽",
        image: "linear-gradient(135deg, #c44569 0%, #9a3a54 100%)"
    },
    8: {
        title: "Золотой час",
        description: "Работа о том уникальном времени суток, когда свет становится особым. Коллаж из различных материалов создаёт текстуру и объём.",
        technique: "2024, коллаж, 80×100 см",
        price: "48 000 ₽",
        image: "linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)"
    },
    9: {
        title: "Синий ритм",
        description: "Абстрактная композиция, передающая ритмы города и внутренние переживания. Синий цвет создаёт ощущение глубины и спокойствия.",
        technique: "2024, акрил, 70×90 см",
        price: "40 000 ₽",
        image: "linear-gradient(135deg, #6c5ce7 0%, #4834d4 100%)"
    }
};

// Получаем элементы
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close');
const galleryItems = document.querySelectorAll('.gallery-item');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalTechnique = document.getElementById('modal-technique');
const modalPrice = document.getElementById('modal-price');
const modalImage = document.getElementById('modal-image');
const modalBuy = document.getElementById('modal-buy');
const modalArBtn = document.getElementById('modal-ar-btn');

// Открытие модального окна
galleryItems.forEach(item => {
    item.addEventListener('click', function() {
        const paintingId = this.getAttribute('data-painting');
        const painting = paintings[paintingId];
        
        if (painting) {
            modalTitle.textContent = painting.title;
            modalDescription.textContent = painting.description;
            modalTechnique.textContent = painting.technique;
            modalPrice.textContent = painting.price;
            modalImage.style.background = painting.image;
            
            // Ссылка на покупку с текстом о картине
            modalBuy.href = `https://t.me/artist_profile?text=Здравствуйте! Меня интересует картина "${painting.title}" (${painting.price})`;
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Подготовка AR — передаём данные текущей картины
            currentAR.painting = painting;
            updateAROverlay();
        }
    });
});

// Закрытие модального окна
closeBtn.addEventListener('click', function() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Плавная прокрутка для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Анимация появления элементов при скролле
const sharedObsCallback = (entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            obs.unobserve(entry.target);
        }
    });
};

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};
const observer = new IntersectionObserver(sharedObsCallback, observerOptions);

function addScrollAnimation(selector) {
    document.querySelectorAll(selector).forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Добавляем анимацию для элементов
addScrollAnimation('.gallery-item');
addScrollAnimation('.about-content');
addScrollAnimation('.purchase-item');

// Добавляем hover-эффект на кнопки
document.querySelectorAll('.btn-primary, .btn-buy').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// =============================
// AR ПРИМЕРКА
// =============================
const arModal = document.getElementById('ar-modal');
const arVideo = document.getElementById('ar-video');
const arOverlay = document.getElementById('ar-overlay');
const arClose = document.getElementById('ar-close');
const arReset = document.getElementById('ar-reset');
const arFlip = document.getElementById('ar-flip');
const arSnap = document.getElementById('ar-snap');
const arCanvas = document.getElementById('ar-canvas');

const currentAR = {
    painting: null,
    stream: null,
    facingMode: 'environment', // предпочтительно задняя камера
    scale: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0,
    startDistance: 0,
    startAngle: 0,
    lastTouches: []
};

function updateAROverlay() {
    if (!currentAR.painting) return;
    // Используем те же градиенты/изображения, что и в модалке
    arOverlay.style.background = currentAR.painting.image;
}

async function startARCamera() {
    try {
        if (currentAR.stream) {
            currentAR.stream.getTracks().forEach(t => t.stop());
        }
        const constraints = {
            audio: false,
            video: {
                facingMode: { ideal: currentAR.facingMode },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        currentAR.stream = stream;
        arVideo.srcObject = stream;
        await arVideo.play();
        // Зеркалим видео только для user (front)
        arVideo.style.transform = currentAR.facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)';
    } catch (e) {
        alert('Не удалось получить доступ к камере. Проверьте разрешения.');
        console.error(e);
    }
}

function openAR() {
    if (!currentAR.painting) return;
    resetARTransform();
    updateAROverlay();
    arModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    startARCamera();
}

function closeAR() {
    arModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (currentAR.stream) {
        currentAR.stream.getTracks().forEach(t => t.stop());
        currentAR.stream = null;
    }
}

function resetARTransform() {
    currentAR.scale = 1;
    currentAR.rotation = 0;
    currentAR.translateX = 0;
    currentAR.translateY = 0;
    applyOverlayTransform();
}

function applyOverlayTransform() {
    arOverlay.style.transform = `translate(calc(-50% + ${currentAR.translateX}px), calc(-50% + ${currentAR.translateY}px)) rotate(${currentAR.rotation}deg) scale(${currentAR.scale})`;
}

// Жесты: drag, pinch, rotate
let isDragging = false;
let dragStart = { x: 0, y: 0 };

arOverlay.addEventListener('pointerdown', (e) => {
    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    arOverlay.setPointerCapture(e.pointerId);
});

arOverlay.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    dragStart = { x: e.clientX, y: e.clientY };
    currentAR.translateX += dx;
    currentAR.translateY += dy;
    applyOverlayTransform();
});

arOverlay.addEventListener('pointerup', (e) => {
    isDragging = false;
    arOverlay.releasePointerCapture(e.pointerId);
});

// Мульти-тач для pinch/rotate
const arStage = document.getElementById('ar-stage');
arStage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        currentAR.startDistance = getDistance(e.touches[0], e.touches[1]);
        currentAR.startAngle = getAngle(e.touches[0], e.touches[1]);
    }
});

arStage.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
        const newDistance = getDistance(e.touches[0], e.touches[1]);
        const newAngle = getAngle(e.touches[0], e.touches[1]);
        const scaleDelta = newDistance / (currentAR.startDistance || newDistance);
        const angleDelta = newAngle - (currentAR.startAngle || newAngle);
        currentAR.scale = clamp(currentAR.scale * scaleDelta, 0.3, 3);
        currentAR.rotation += angleDelta;
        currentAR.startDistance = newDistance;
        currentAR.startAngle = newAngle;
        applyOverlayTransform();
        e.preventDefault();
    }
}, { passive: false });

function getDistance(t1, t2) {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.hypot(dx, dy);
}
function getAngle(t1, t2) {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

// Кнопки AR
if (modalArBtn) {
    modalArBtn.addEventListener('click', openAR);
}
arClose.addEventListener('click', closeAR);
arReset.addEventListener('click', resetARTransform);
arFlip.addEventListener('click', async () => {
    currentAR.facingMode = currentAR.facingMode === 'environment' ? 'user' : 'environment';
    await startARCamera();
});
arSnap.addEventListener('click', () => {
    // Снимок текущего кадра с оверлеем
    const rect = arVideo.getBoundingClientRect();
    arCanvas.width = arVideo.videoWidth || 1280;
    arCanvas.height = arVideo.videoHeight || 720;
    const ctx = arCanvas.getContext('2d');
    ctx.save();
    // Рисуем видео
    if (currentAR.facingMode === 'user') {
        ctx.translate(arCanvas.width, 0);
        ctx.scale(-1, 1); // зеркалим для фронтальной
    }
    ctx.drawImage(arVideo, 0, 0, arCanvas.width, arCanvas.height);
    ctx.restore();

    // Рисуем оверлей (приближённо — прямоугольник по центру с трансформациями)
    const overlayW = arCanvas.width * 0.6;
    const overlayH = overlayW * (3/4);
    const centerX = arCanvas.width / 2 + currentAR.translateX * (arCanvas.width / rect.width);
    const centerY = arCanvas.height / 2 + currentAR.translateY * (arCanvas.height / rect.height);
    ctx.translate(centerX, centerY);
    ctx.rotate(currentAR.rotation * Math.PI / 180);
    ctx.scale(currentAR.scale, currentAR.scale);
    // Заливка градиентом (упрощение: рендер без точного CSS-градиента)
    const grad = ctx.createLinearGradient(-overlayW/2, -overlayH/2, overlayW/2, overlayH/2);
    grad.addColorStop(0, '#dc2626');
    grad.addColorStop(1, '#fbbf24');
    ctx.fillStyle = grad;
    ctx.fillRect(-overlayW/2, -overlayH/2, overlayW, overlayH);

    const dataUrl = arCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'ar-preview.png';
    a.click();
});

