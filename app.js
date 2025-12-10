import express from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import session from 'express-session';
import { body } from 'express-validator';
import AuthRouter from './Routes/auth.js';
import OAuthRouter from './Routes/oauth.js';
import { errorHandler } from "./utils/errorHandler.js";
import passport from './controller/oauth.js';

const app = express();

// MIDDLEWARE
app.use(morgan('combined'));
app.use(cors());
app.use(compression());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(slowDown({ windowMs: 15 * 60 * 1000, delayAfter: 50 }));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(hpp());

// Session (needed for Passport OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard-cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true } // change secure:true in prod with HTTPS
}));

// Body validation
app.use(body('*').escape());

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.get('/', (req, res) => res.send('Hello Zenvia User'));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

// Auth routes
app.use('/api/auth', AuthRouter); // email/password login & registration
app.use('/api/auth', OAuthRouter); // OAuth login routes

// You can add other routers like product, categories, orders, payment, admin
// Example: app.use('/api/product', ProductRouter);

app.use('*', (req, res) => res.status(404).json({ message: "Route not found" }));
app.use(errorHandler);

export default app;
