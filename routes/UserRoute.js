import express from "express";
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    approveUser,
    getPendingUsers

} from "../controllers/Users.js";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/users/pending', verifyUser, adminOnly,getPendingUsers);
router.put('/users/approve/:userId', verifyUser, adminOnly,approveUser);
router.get('/users', verifyUser,adminOnly,getUsers);
router.get('/users/:id', verifyUser, adminOnly, getUserById);
router.post('/users',verifyUser, adminOnly, createUser);
router.patch('/users/:id', verifyUser, adminOnly, updateUser);
router.delete('/users/:id', verifyUser, adminOnly, deleteUser);

export default router;