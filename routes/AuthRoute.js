import express from "express";
import {Login, logOut, Me, register, sendResetEmail,resetPassword} from "../controllers/Auth.js";

const router = express.Router();

router.post('/register', register);
router.get('/me', Me);
router.post('/login', Login);
router.delete('/logout', logOut);
router.post('/forgot-password', sendResetEmail);
router.post('/reset-password/:token', resetPassword);


export default router;