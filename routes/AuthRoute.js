import express from "express";
import {Login, logOut, Me, register} from "../controllers/Auth.js";

const router = express.Router();

router.post('/register', register);
router.get('/me', Me);
router.post('/login', Login);
router.delete('/logout', logOut);

export default router;