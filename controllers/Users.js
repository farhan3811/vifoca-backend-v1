import User from "../models/UserModel.js";
import argon2 from "argon2";
import { Op } from 'sequelize';
import { validationResult } from "express-validator";

export const getUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const sortOrder = req.query.sortOrder || "desc";

    try {
        const validSortOrders = ["asc", "desc"];
        const orderDirection = validSortOrders.includes(sortOrder) ? sortOrder : "desc";
        const order = ["updatedat", orderDirection];
        const response = await User.findAndCountAll({
            limit,
            offset,
            order: [order],
            attributes: ['uuid', 'name', 'prodi', 'nim', 'email','nomorhp','tgllahir', 'avatar', 'createdat', 'updatedat', 'role', 'isApproved'],
            where: {
                name: {
                    [Op.like]: `%${search}%`
                }
            },
        });

        const totalPages = Math.ceil(response.count / limit);
        res.status(200).json({
            users: response.rows,
            totalPages
        });
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ msg: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const response = await User.findOne({
            attributes: ['uuid', 'name', 'prodi', 'nim', 'email','nomorhp','tgllahir', 'avatar', 'createdat', 'updatedat', 'role'],
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, prodi, nim, email, nomorhp, tgllahir, password, role, biodata_id } = req.body;
    const avatar = req.file ? req.file.path : null;

    try {
        const existingUserNim = await User.findOne({ where: { nim } });
        if (existingUserNim) {
            return res.status(400).json({ msg: "NIM sudah digunakan" });
        }
        const existingUserEmail = await User.findOne({ where: { email } });
        if (existingUserEmail) {
            return res.status(400).json({ msg: "Email sudah digunakan" });
        }
        const hashedPassword = await argon2.hash(password);
        const newUser = await User.create({
            name,
            prodi,
            nim,
            email,
            nomorhp,
            tgllahir,
            password: hashedPassword,
            role,
            avatar,
            isApproved: true,
            biodata_id
        });

        res.status(201).json({ msg: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await User.findOne({
            where: { uuid: req.params.id }
        });

        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

        const { name, prodi, nim, email, nomorhp, tgllahir, password, role } = req.body; // Hapus confPassword
        const avatar = req.file ? req.file.path : user.avatar;
        const parsedNim = parseInt(nim, 10);
        const existingUserEmail = await User.findOne({
            where: {
                email,
                uuid: { [Op.ne]: user.uuid }
            }
        });

        if (existingUserEmail) return res.status(400).json({ msg: "Email sudah digunakan oleh pengguna lain" });

        const updateData = {
            name,
            prodi,
            nim: parsedNim,
            email,
            nomorhp,
            tgllahir,
            avatar,
            role,
            updatedat: new Date()
        };
        if (password) {
            updateData.password = await argon2.hash(password);
        }
        await User.update(updateData, {
            where: { uuid: user.uuid }
        });

        res.status(200).json({ msg: "User Updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan saat memperbarui pengguna." });
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
export const approveUser = async (req, res) => {
    const { userId } = req.params;
  
    try {
        const user = await User.findOne({ where: { uuid: userId } }); 
      if (!user) return res.status(404).json({ msg: "Pengguna tidak ditemukan" });
  
      user.isApproved = true;
      await user.save();
  
      res.status(200).json({ msg: "Pengguna berhasil di-approve" });
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ msg: error.message });
    }
  };
  
  export const getPendingUsers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const sortOrder = req.query.sortOrder || "desc";

    try {
        const validSortOrders = ["asc", "desc"];
        const orderDirection = validSortOrders.includes(sortOrder) ? sortOrder : "desc";
        const order = ["updatedat", orderDirection];

        const response = await User.findAndCountAll({
            limit,
            offset,
            order: [order],
            attributes: ['uuid', 'name', 'prodi', 'nim', 'email', 'avatar', 'createdat', 'updatedat', 'role'],
            where: {
                isApproved: false,
                name: {
                    [Op.like]: `%${search}%`
                }
            },
        });

        const totalPages = Math.ceil(response.count / limit);
        res.status(200).json({
            pendingUsers: response.rows,
            totalPages
        });
    } catch (error) {
        console.error("Error fetching pending users:", error.message);
        res.status(500).json({ msg: error.message });
    }
};

  