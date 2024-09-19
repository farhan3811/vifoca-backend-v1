import express from "express";
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser

} from "../controllers/Users.js";
import { verifyUser, adminOnly } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/api/users', verifyUser,adminOnly,getUsers);
router.get('/api/users/:id', verifyUser, adminOnly, getUserById);
router.post('/api/users',verifyUser, adminOnly, createUser);
router.patch('/api/users/:id', verifyUser, adminOnly, updateUser);
router.delete('/api/users/:id', verifyUser, adminOnly, deleteUser);

export default router;