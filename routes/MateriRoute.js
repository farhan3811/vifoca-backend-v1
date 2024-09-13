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
router.get('/materi', verifyUser, getMateri);
router.get('/materi/:id', verifyUser, getMateriById);
router.post('/materi', verifyUser, upload.single('img_materi'), createMateri);
router.patch('/materi/:id', verifyUser, upload.single('img_materi'), updateMateri);
router.delete('/materi/:id', verifyUser, deleteMateri);

export default router;
