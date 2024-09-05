import User from "../models/UserModel.js";
import argon2 from "argon2";
import { Op } from 'sequelize';
import { validationResult } from "express-validator";

export const getUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const sortOrder = req.query.sortOrder || "desc";

    try {
        const validSortOrders = ["asc", "desc"];
        const orderDirection = validSortOrders.includes(sortOrder) ? sortOrder : "desc";
        const order = ["updatedat", orderDirection];
        console.log("Order:", order);

        const response = await User.findAndCountAll({
            limit,
            offset,
            order: [order],
            attributes: ['uuid', 'name', 'prodi', 'nim', 'email', 'avatar', 'createdat', 'updatedat', 'role'],
            where: {
                name: {
                    [Op.iLike]: `%${search}%` // Pencarian berdasarkan nama
                }
            },
        });

        const totalPages = Math.ceil(response.count / limit);
        res.status(200).json({
            users: response.rows,
            totalPages
        });
    } catch (error) {
        console.error("Error fetching users:", error.message); // Log kesalahan ke konsol
        res.status(500).json({ msg: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const response = await User.findOne({
            attributes: ['uuid', 'name', 'prodi', 'nim', 'email', 'avatar', 'createdat', 'updatedat', 'role'],
            where: {
                uuid: req.params.id
            }
        });
        if (!response) return res.status(404).json({ msg: "User tidak ditemukan" });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const createUser = async (req, res) => {
    // Validasi input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, prodi, nim, email, password, role, avatar, biodata_id } = req.body;

    try {
        // Cek apakah NIM sudah ada
        const existingUserNim = await User.findOne({ where: { nim } });
        if (existingUserNim) {
            return res.status(400).json({ msg: "NIM sudah digunakan" });
        }

        // Cek apakah email sudah ada
        const existingUserEmail = await User.findOne({ where: { email } });
        if (existingUserEmail) {
            return res.status(400).json({ msg: "Email sudah digunakan" });
        }

        // Hash password sebelum menyimpan
        const hashedPassword = await argon2.hash(password);

        // Buat pengguna baru
        const newUser = await User.create({
            name,
            prodi,
            nim,
            email,
            password: hashedPassword,
            role,
            avatar,
            biodata_id
        });

        res.status(201).json({ msg: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const updateUser = async (req, res) => {
    const user = await User.findOne({
        where: {
            uuid: req.params.id
        }
    });

    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const { name, prodi, nim, email, password, confPassword, role } = req.body;

    // Validasi bahwa nim adalah angka
    const parsedNim = parseInt(nim, 10);
    if (isNaN(parsedNim)) return res.status(400).json({ msg: "NIM harus berupa angka yang valid" });

    // Validasi bahwa email tidak digunakan oleh pengguna lain
    const existingUserEmail = await User.findOne({
        where: {
            email,
            uuid: {
                [Op.ne]: user.uuid // Pastikan email tidak digunakan oleh pengguna lain, kecuali pengguna yang sedang di-update
            }
        }
    });
    if (existingUserEmail) return res.status(400).json({ msg: "Email sudah digunakan oleh pengguna lain" });

    // Hanya hash password jika password baru diberikan
    if (password && password !== "" && password !== null) {
        if (password !== confPassword) return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });
        hashPassword = await argon2.hash(password); // Hash password baru
    }

    try {
        await User.update({
            name,
            prodi,
            nim: parsedNim,
            email,
            role,
            updatedat: new Date() // Pastikan tanggal pembaruan diupdate
        }, {
            where: {
                uuid: user.uuid
            }
        });
        res.status(200).json({ msg: "User Updated" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};

export const deleteUser = async (req, res) => {
    const user = await User.findOne({
        where: {
            uuid: req.params.id
        }
    });
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    try {
        await User.destroy({
            where: {
                uuid: user.uuid
            }
        });
        res.status(200).json({ msg: "User Deleted" });
    } catch (error) {
        res.status(400).json({ msg: error.message });
    }
};
