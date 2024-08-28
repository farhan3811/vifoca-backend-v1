import Materi from "../models/MateriModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";

export const getMateri = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const sortOrder = req.query.sortOrder || "desc";
    const order = [['updatedat', sortOrder]];

    try {
        let response;
        const userWhereClause = {
            name: {
                [Op.iLike]: `%${search}%`
            }
        };

        if (req.role === "admin") {
            response = await Materi.findAndCountAll({
                limit,
                offset,
                order,
                attributes: ['uuid', 'name_materi', 'img_materi', 'ket_materi', 'vid_materi', 'updatedat'],
                include: [{
                    model: User,
                    attributes: ['name', 'email'],
                    where: userWhereClause
                }]
            });
        } else {
            response = await Materi.findAndCountAll({
                limit,
                offset,
                order,
                attributes: ['uuid', 'name_materi', 'img_materi', 'ket_materi', 'vid_materi', 'updatedat'],
                where: {
                    userId: req.userId
                },
                include: [{
                    model: User,
                    attributes: ['name', 'email']
                }]
            });
        }

        const totalPages = Math.ceil(response.count / limit);
        res.status(200).json({
            materi: response.rows,
            totalPages
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const getMateriById = async (req, res) => {
    try {
        const materi = await Materi.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!materi) return res.status(404).json({ msg: "Data tidak ditemukan" });

        let response;
        if (req.role === "admin") {
            response = await Materi.findOne({
                attributes: ['uuid', 'name_materi', 'img_materi', 'ket_materi', 'vid_materi', 'updatedat'],
                where: {
                    id: materi.id
                },
                include: [{
                    model: User,
                    attributes: ['name', 'email']
                }]
            });
        } else {
            response = await Materi.findOne({
                attributes: ['uuid', 'name_materi', 'img_materi', 'ket_materi', 'vid_materi', 'updatedat'],
                where: {
                    [Op.and]: [{ id: materi.id }, { userId: req.userId }]
                },
                include: [{
                    model: User,
                    attributes: ['name', 'email']
                }]
            });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const createMateri = async (req, res) => {
    const { name_materi, ket_materi, vid_materi } = req.body;
    const img_materi = req.file ? req.file.path : null;  // Mendapatkan path file yang diunggah

    try {
        await Materi.create({
            name_materi,
            img_materi, // Menggunakan variabel img_materi
            ket_materi,
            vid_materi,
            userId: req.userId
        });
        res.status(201).json({ msg: "Materi created successfully" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const updateMateri = async (req, res) => {
    try {
        const materi = await Materi.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!materi) return res.status(404).json({ msg: "Data tidak ditemukan" });

        const { name_materi, ket_materi, vid_materi } = req.body;
        const img_materi = req.file ? req.file.path : materi.img_materi; // Update gambar jika ada

        if (req.role === "admin" || req.userId === materi.userId) {
            await Materi.update({ 
                name_materi, 
                img_materi, 
                ket_materi, 
                vid_materi 
            }, {
                where: {
                    id: materi.id
                }
            });
            res.status(200).json({ msg: "Materi updated successfully" });
        } else {
            res.status(403).json({ msg: "Akses terlarang" });
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const deleteMateri = async (req, res) => {
    try {
        const materi = await Materi.findOne({
            where: {
                uuid: req.params.id
            }
        });
        if (!materi) return res.status(404).json({ msg: "Data tidak ditemukan" });

        if (req.role === "admin" || req.userId === materi.userId) {
            await Materi.destroy({
                where: {
                    id: materi.id
                }
            });
            res.status(200).json({ msg: "Materi deleted successfully" });
        } else {
            res.status(403).json({ msg: "Akses terlarang" });
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
