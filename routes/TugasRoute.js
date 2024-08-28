import express from "express";
import {
    getTugas,
    getTugasById,
    createTugas,
    updateTugas,
    deleteTugas
} from "../controllers/Tugas.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/tugas',verifyUser, getTugas);
router.get('/tugas/:id',verifyUser, getTugasById);
router.post('/tugas',verifyUser, createTugas);
router.patch('/tugas/:id',verifyUser, updateTugas);
router.delete('/tugas/:id',verifyUser, deleteTugas);

export default router;