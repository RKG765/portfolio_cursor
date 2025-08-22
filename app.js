const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Initialize express app
const app = express();

// Load environment variables
dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio')
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false // Disabled for development, enable in production
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
app.use(cors());
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public', {
    maxAge: '1d' // Cache static files for 1 day
}));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolio',
        ttl: 14 * 24 * 60 * 60 // Session TTL (14 days)
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
    }
}));

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Routes for public HTML files with caching headers
const sendFileWithCaching = (res, filePath) => {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache
    res.sendFile(filePath);
};

app.get('/', (req, res) => {
    sendFileWithCaching(res, path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
    sendFileWithCaching(res, path.join(__dirname, 'public', 'about.html'));
});

app.get('/portfolio', (req, res) => {
    sendFileWithCaching(res, path.join(__dirname, 'public', 'portfolio.html'));
});

app.get('/blog', (req, res) => {
    sendFileWithCaching(res, path.join(__dirname, 'public', 'blog.html'));
});

app.get('/contact', (req, res) => {
    sendFileWithCaching(res, path.join(__dirname, 'public', 'contact.html'));
});

// Contact form route with validation and rate limiting
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5 // limit each IP to 5 form submissions per hour
});

app.post('/submit-form', contactLimiter, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Basic validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Here you would typically save to database and send email
        // For now, just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        res.status(200).json({
            message: 'Form submitted successfully',
            data: { name, email, subject }
        });
    } catch (error) {
        console.error('Form submission error:', error);
        res.status(500).json({ error: 'Error submitting form. Please try again later.' });
    }
});

// API health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start server with graceful shutdown
const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running at http://localhost:${process.env.PORT || 3000}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});
