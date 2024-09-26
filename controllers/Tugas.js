import Tugas from "../models/TugasModel.js";
import Users from "../models/UserModel.js";
import Materis from "../models/MateriModel.js";
import { Op } from "sequelize";

export const getTugas = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 50); // Max limit to 50
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const sortOrder = req.query.sortOrder || 'desc';
    const order = [['updatedat', sortOrder]];
    
    try {
        const searchConditions = {
            [Op.or]: [
                {
                    nama_soal: {
                        [Op.like]: `%${search}%`
                    }
                }
            ]
        };
        
        const commonOptions = {
            include: [
                {
                    model: Users,
                    attributes: ['name', 'email']
                },
                {
                    model: Materis,
                    attributes: ['name_materi', 'ket_materi']
                }
            ],
            limit,
            offset,
            order,
            attributes: { include: ['userId'] }
        };

        const whereClause = req.role === "admin" ? searchConditions : { userId: req.userId, ...searchConditions };
        
        const response = await Tugas.findAndCountAll({
            ...commonOptions,
            where: whereClause
        });

        const totalPages = Math.ceil(response.count / limit);
        res.status(200).json({
            tugas: response.rows.map(tugas => ({
                ...tugas.toJSON(),
                userId: tugas.userId
            })),
            totalPages
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ msg: "Failed to fetch tasks" });
    }
};

export const getTugasByMateri = async (req, res) => {
    const { materi_id } = req.params;
    try {
        const materi = await Materis.findByPk(materi_id);
        if (!materi) {
            return res.status(404).json({ message: "Materi not found" });
        }

        const tugas = await Tugas.findAll({
            where: { materi_id },
            include: [
                {
                    model: Users,
                    attributes: ['name', 'email']
                }
            ]
        });

        res.status(200).json({ tugas });
    } catch (error) {
        console.error("Error fetching tasks for the selected materi:", error);
        res.status(500).json({ message: "Failed to fetch tasks for the selected materi" });
    }
};


export const getTugasById = async (req, res) => {
    try {
        const tugas = await Tugas.findOne({
            where: { id: req.params.id }, 
            include: [
                {
                    model: Users,
                    attributes: ['name', 'email']
                },
                {
                    model: Materis,
                    attributes: ['name_materi', 'ket_materi']
                }
            ]
        });

        if (!tugas) return res.status(404).json({ msg: "Data tidak ditemukan" });

        res.status(200).json({
            ...tugas.toJSON(),
            userId: tugas.userId
        });
    } catch (error) {
        console.error("Error fetching task by ID:", error);
        res.status(500).json({ msg: "Failed to fetch task by ID" });
    }
};


export const createTugas = async (req, res) => {
    const { nama_soal, status_level, ket_assigment, deadline, materi_id } = req.body;
    const foto_tugas = req.file ? req.file.path : null;


    try {
        await Tugas.create({
            nama_soal,
            status_level,
            foto_tugas,
            ket_assigment,
            deadline,
            userId: req.userId,
            materi_id
        });
        res.status(201).json({ msg: "Tugas berhasil dibuat" });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ msg: "Failed to create task", error: error.message });
    }
};

export const updateTugas = async (req, res) => {
    try {
        const tugas = await Tugas.findOne({
            where: { id: req.params.id }  // Menggunakan id
        });

        if (!tugas) return res.status(404).json({ msg: "Data tidak ditemukan" });

        const { nama_soal, status_level, ket_assigment, deadline, materi_id } = req.body;
        const foto_tugas = req.file ? req.file.path : tugas.foto_tugas;

        if (req.role === "admin" || req.userId === tugas.userId) {
            await Tugas.update({
                nama_soal,
                status_level,
                foto_tugas,
                ket_assigment,
                deadline,
                materi_id
            }, {
                where: { id: req.params.id }  // Menggunakan id
            });
            res.status(200).json({ msg: "Tugas berhasil diperbarui" });
        } else {
            res.status(403).json({ msg: "Akses terlarang" });
        }
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ msg: "Failed to update task" });
    }
};

export const deleteTugas = async (req, res) => {
    try {
        const tugas = await Tugas.findOne({
            where: { id: req.params.id } 
        });

        if (!tugas) return res.status(404).json({ msg: "Data tidak ditemukan" });

        if (req.role === "admin" || req.userId === tugas.userId) {
            await Tugas.destroy({
                where: { id: req.params.id }  // Menggunakan id
            });
            res.status(200).json({ msg: "Tugas berhasil dihapus" });
        } else {
            res.status(403).json({ msg: "Akses terlarang" });
        }
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ msg: "Failed to delete task" });
    }
};
