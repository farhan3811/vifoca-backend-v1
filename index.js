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
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

// Mendapatkan __dirname di ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mengatur folder statis untuk mengakses file yang diunggah
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db: db
});
// (async()=>{
//         await db.sync();
//     })();
// Menggunakan session
app.use(session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        secure: 'auto'
    }
}));

// Menggunakan CORS untuk mengizinkan permintaan dari frontend
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));

app.use(express.json());

// Menggunakan route yang diimpor
app.use(UserRoute);
app.use(AuthRoute);
app.use(MateriRoute);
app.use(TugasRoute);

// Menginisialisasi store session (hanya aktifkan jika diperlukan)
// store.sync();

app.listen(process.env.APP_PORT, () => {
    console.log('Server up and running...');
});
