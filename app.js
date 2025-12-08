import express from 'express';
import 'express-async-errors'
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
import AuthRouter from './Routes/auth.js'
import { errorHandler } from "./utils/errorHandler.js";


const app = express();



// CORRECT ORDER - SIMPLIFIED:
app.use(morgan('combined'));                    // 1. Logging first
app.use(cors());                               // 2. CORS early
app.use(compression());                        // 3. Compression
app.use(helmet());                             // 4. Security headers
app.use(rateLimit({ windowMs: 900000, max: 100 })); // 5. Rate limiting
app.use(slowDown({ windowMs: 900000, delayAfter: 50 })); // 6. Speed limiting
app.use(express.json({ limit: '10kb' }));      // 7. Body parsing with limits
app.use(mongoSanitize());                      // 8. NoSQL injection protection
app.use(hpp());                                // 9. Parameter pollution
app.use(session({                              // 10. Session management
  secret: 'keyboard-cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true }
}));
app.use(body('*').escape());    
app.get('/',(req,res)=>res.send('Hello Zenvia User'))
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }));
app.use('/api/auth/',AuthRouter)
app.use('/api/product/',AuthRouter)
app.use('/api/categories/',AuthRouter)
app.use('/api/order/',AuthRouter)
app.use('/api/payment/',AuthRouter)
app.use('/api/admin/',AuthRouter)
// 404 handler (optional)
app.use('*', (req, res) => {
  res.status(404).json({ message: "Route not found" });
});
app.use(errorHandler);
export default app