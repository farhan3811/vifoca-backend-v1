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

router.get('/materi/:materi_id/tugas',verifyUser, getTugasByMateri);
router.get('/tugas',verifyUser, getTugas);
router.get('/tugas/:id',verifyUser, getTugasById);
router.post('/tugas',verifyUser,upload.single('foto_tugas'), createTugas);
router.patch('/tugas/:id',verifyUser,upload.single('foto_tugas'), updateTugas);
router.delete('/tugas/:id',verifyUser, deleteTugas);

export default router;