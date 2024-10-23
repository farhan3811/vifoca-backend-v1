import Materi from "../models/MateriModel.js";
import User from "../models/UserModel.js";
import { Op } from "sequelize";

export const getMateri = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const sortOrder = req.query.sort;

    try {
        const validSortOrders = ['asc', 'desc'];
        const orderDirection = sortOrder && validSortOrders.includes(sortOrder) ? sortOrder : 'desc'; // Default ke 'desc'

        const whereCondition = search ? {
            name_materi: {
                [Op.like]: `%${search}%`
            }
        } : {};

        const response = await Materi.findAndCountAll({
            limit,
            offset,
            order: [['updatedat', orderDirection]],
            attributes: ['id', 'name_materi', 'img_materi', 'ket_materi', 'vid_materi', 'updatedat'],
            include: [{
                model: User,
                attributes: ['name'],
            }],
            where: whereCondition 
        });

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
        const whereClause = req.role === "user" 
            ? { id: req.params.id, userId: req.userId }
            : { id: req.params.id };

        const materi = await Materi.findOne({
            where: whereClause
        });

        if (!materi) return res.status(404).json({ msg: "Data tidak ditemukan" });

        const response = await Materi.findOne({
            attributes: ['id', 'name_materi', 'img_materi', 'ket_materi', 'vid_materi', 'updatedat'],
            where: {
                id: materi.id
            },
            include: [{
                model: User,
                attributes: ['name', 'email']
            }]
        });

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const createMateri = async (req, res) => {
    const { name_materi, ket_materi, vid_materi } = req.body;
    const img_materi = req.file ? req.file.path : null; 

    try {
        const existingMateri = await Materi.findOne({ where: { name_materi } });
        if (existingMateri) {
            return res.status(400).json({ msg: "Materi dengan nama ini sudah ada" });
        }

        await Materi.create({
            name_materi,
            img_materi,
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
                id: req.params.id
            }
        });
        if (!materi) return res.status(404).json({ msg: "Data tidak ditemukan" });

        const { name_materi, ket_materi, vid_materi } = req.body;
        const img_materi = req.file ? req.file.path : materi.img_materi; 
        const existingMateri = await Materi.findOne({ 
            where: { 
                name_materi, 
                id: { [Op.ne]: materi.id } 
            } 
        });
        if (existingMateri) {
            return res.status(400).json({ msg: "Materi dengan nama ini sudah ada" });
        }

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
                id: req.params.id
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
