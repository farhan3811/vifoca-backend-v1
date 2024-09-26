import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import db from "./config/Database.js";
import SequelizeStore from "connect-session-sequelize";
import UserRoute from "./routes/UserRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import MateriRoute from "./routes/MateriRoute.js";
import TugasRoute from "./routes/TugasRoute.js";
import PenilaianRoute from "./routes/PenilaianRoute.js";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Tambahkan batas ukuran payload di sini
const payloadLimit = '10mb'; // Misalnya, atur menjadi 10 megabyte
app.use(express.json({ limit: payloadLimit }));
app.use(express.urlencoded({ extended: true, limit: payloadLimit }));

const sessionStore = SequelizeStore(session.Store);
const store = new sessionStore({
    db: db
});

(async () => {
    await db.sync();
})();

app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: false
    }
}));

const corsOptions = {
    credentials: true,
    origin: (origin, callback) => {
        console.log('CORS origin received:', origin);
        if (process.env.NODE_ENV === 'production') {
            if (origin === process.env.CORS_ORIGIN_PROD) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS Prod'));
            }
        } else {
            if (origin === process.env.CORS_ORIGIN_LOCAL || !origin) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    }
};

app.use(cors(corsOptions));

app.use('/api',UserRoute);
app.use('/api',AuthRoute);
app.use('/api',MateriRoute);
app.use('/api',TugasRoute);
app.use('/api',PenilaianRoute);

app.listen(process.env.APP_PORT, () => {
    console.log('Server up and running on port', process.env.APP_PORT);
});
