const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const { Server } = require('socket.io');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = require('http').createServer(app);
const io = new Server(server);

// Configure multer for file uploads
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
    },
  },
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MongoDB connection (optional)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    // Removed deprecated options
  }).catch(err => console.log('MongoDB connection failed, running without database'));
} else {
  console.log('No MongoDB URI provided, running without database');
}

// Models
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

const PaintingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technique: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  isUploaded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paintings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Painting' }],
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const Painting = mongoose.model('Painting', PaintingSchema);
const Order = mongoose.model('Order', OrderSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key');
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/paintings', async (req, res) => {
  try {
    let paintings = [];
    if (mongoose.connection.readyState === 1) {
      paintings = await Painting.find();
    }
    // If no database, return fallback paintings
    if (paintings.length === 0) {
      paintings = [
        {
          _id: "1",
          title: "Силуэт свободы",
          description: "Эта работа исследует границы телесности и свободы самовыражения. Художница использует драматичный контраст красного и чёрного, чтобы передать силу эмоции.",
          technique: "2024, акрил, 80×100 см",
          price: 45000,
          image: "linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)",
          isUploaded: false
        },
        {
          _id: "2",
          title: "Танцующее тело",
          description: "Динамичная композиция, посвящённая движению и пластике человеческого тела. Золотые оттенки создают ощущение внутреннего света.",
          technique: "2024, коллаж, 60×80 см",
          price: 35000,
          image: "linear-gradient(135deg, #ffd93d 0%, #f59f00 100%)"
        },
        {
          _id: "3",
          title: "Зелёный взгляд",
          description: "Работа о силе взгляда и его способности преображать мир вокруг нас. Зелёный цвет символизирует рост и обновление.",
          technique: "2024, акрил, 70×90 см",
          price: 38000,
          image: "linear-gradient(135deg, #a8e063 0%, #6bcf7f 100%)"
        },
        {
          _id: "4",
          title: "Голубая грусть",
          description: "Эмоционально насыщенная картина о том, как грусть может быть прекрасной и возвышенной. Смешанная техника придаёт глубину и объём.",
          technique: "2024, смешанная техника, 90×110 см",
          price: 50000,
          image: "linear-gradient(135deg, #4ecdc4 0%, #26a69a 100%)"
        },
        {
          _id: "5",
          title: "Цветок страсти",
          description: "Яркая инсталляция, воплощающая страсть и чувственность. Работа требует особого внимания зрителя.",
          technique: "2024, инсталляция, 100×120 см",
          price: 55000,
          image: "linear-gradient(135deg, #95e1d3 0%, #f38181 100%)"
        },
        {
          _id: "6",
          title: "Розовый закат",
          description: "Нежное исследование момента перехода дня в ночь. Розовые и коралловые оттенки создают атмосферу умиротворения.",
          technique: "2024, акрил, 65×85 см",
          price: 32000,
          image: "linear-gradient(135deg, #ffa07a 0%, #ff7f50 100%)"
        },
        {
          _id: "7",
          title: "Фиолетовая мечта",
          description: "Мистическая композиция о границе между реальностью и мечтой. Фиолетовый цвет ассоциируется с творчеством и магией.",
          technique: "2024, смешанная техника, 75×95 см",
          price: 42000,
          image: "linear-gradient(135deg, #c44569 0%, #9a3a54 100%)"
        },
        {
          _id: "8",
          title: "Золотой час",
          description: "Работа о том уникальном времени суток, когда свет становится особым. Коллаж из различных материалов создаёт текстуру и объём.",
          technique: "2024, коллаж, 80×100 см",
          price: 48000,
          image: "linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)"
        },
        {
          _id: "9",
          title: "Синий ритм",
          description: "Абстрактная композиция, передающая ритмы города и внутренние переживания. Синий цвет создаёт ощущение глубины и спокойствия.",
          technique: "2024, акрил, 70×90 см",
          price: 40000,
          image: "linear-gradient(135deg, #6c5ce7 0%, #4834d4 100%)",
          isUploaded: false
        }
      ];
    }
    res.json(paintings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/paintings', authenticateToken, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  try {
    const paintingData = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : req.body.image
    };
    const painting = new Painting(paintingData);
    await painting.save();
    res.status(201).json(painting);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!stripe) {
      return res.status(500).json({ message: 'Stripe not configured' });
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in cents
      currency: 'rub',
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { paintings } = req.body;
    const paintingsData = await Painting.find({ _id: { $in: paintings } });
    const total = paintingsData.reduce((sum, p) => sum + p.price, 0);
    const order = new Order({ user: req.user.id, paintings, total });
    await order.save();

    // Send email notification (optional)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: req.body.email,
        subject: 'Order Confirmation',
        text: `Your order has been placed. Total: ${total} RUB`,
      });
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.to).emit('receiveMessage', data);
  });
});

// Serve static files
app.use(express.static(__dirname));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});