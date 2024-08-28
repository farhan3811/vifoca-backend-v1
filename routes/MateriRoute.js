import express from "express";
import {
    getMateri,
    getMateriById,
    createMateri,
    updateMateri,
    deleteMateri
} from "../controllers/Materi.js";
import { verifyUser } from "../middleware/AuthUser.js";
import upload from "../middleware/upload.js";

const router = express.Router();
router.get('/Materi', verifyUser, getMateri);
router.get('/Materi/:id', verifyUser, getMateriById);
router.post('/Materi', verifyUser, upload.single('img_materi'), createMateri);
router.patch('/Materi/:id', verifyUser, upload.single('img_materi'), updateMateri);
router.delete('/Materi/:id', verifyUser, deleteMateri);

export default router;
