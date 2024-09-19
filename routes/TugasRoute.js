import express from "express";
import {
    getTugas,
    getTugasById,
    createTugas,
    updateTugas,
    deleteTugas,
    getTugasByMateri
} from "../controllers/Tugas.js";
import { verifyUser } from "../middleware/AuthUser.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get('/api/materi/:materi_id/tugas',verifyUser, getTugasByMateri);
router.get('/api/tugas',verifyUser, getTugas);
router.get('/api/tugas/:id',verifyUser, getTugasById);
router.post('/api/tugas',verifyUser,upload.single('foto_tugas'), createTugas);
router.patch('/api/tugas/:id',verifyUser,upload.single('foto_tugas'), updateTugas);
router.delete('/api/tugas/:id',verifyUser, deleteTugas);

export default router;