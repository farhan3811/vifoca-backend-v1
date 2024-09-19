import express from "express";
import {
    getPenilaian,
    getPenilaianById,
    createPenilaian,
    updatePenilaian,
    deletePenilaian
} from "../controllers/Penilaian.js";
import { verifyUser } from "../middleware/AuthUser.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get('/api/Penilaian',verifyUser, getPenilaian);
router.get('/api/Penilaian/:id',verifyUser, getPenilaianById);
router.post('/api/Penilaian',verifyUser,upload.single('foto_Penilaian'), createPenilaian);
router.patch('/api/Penilaian/:id',verifyUser,upload.single('foto_Penilaian'), updatePenilaian);
router.delete('/api/Penilaian/:id',verifyUser, deletePenilaian);

export default router;