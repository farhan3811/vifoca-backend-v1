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

router.get('/Penilaian',verifyUser, getPenilaian);
router.get('/Penilaian/:id',verifyUser, getPenilaianById);
router.post('/Penilaian',verifyUser,upload.single('foto_Penilaian'), createPenilaian);
router.patch('/Penilaian/:id',verifyUser,upload.single('foto_Penilaian'), updatePenilaian);
router.delete('/Penilaian/:id',verifyUser, deletePenilaian);

export default router;