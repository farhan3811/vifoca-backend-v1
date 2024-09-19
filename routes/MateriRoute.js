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
router.get('/api/materi', verifyUser, getMateri);
router.get('/api/materi/:id', verifyUser, getMateriById);
router.post('/api/materi', verifyUser, upload.single('img_materi'), createMateri);
router.patch('/api/materi/:id', verifyUser, upload.single('img_materi'), updateMateri);
router.delete('/api/materi/:id', verifyUser, deleteMateri);

export default router;
