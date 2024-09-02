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
                        [Op.iLike]: `%${search}%`
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
            order
        };

        const whereClause = req.role === "admin" ? searchConditions : { userId: req.userId, ...searchConditions };
        
        const response = await Tugas.findAndCountAll({
            ...commonOptions,
            where: whereClause
        });

        const totalPages = Math.ceil(response.count / limit);
        res.status(200).json({
            tugas: response.rows,
            totalPages
        });
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ msg: "Failed to fetch tasks" });
    }
};

export const getTugasById = async (req, res) => {
    try {
        const tugas = await Tugas.findOne({
            where: { uuid: req.params.id },
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

        if (req.role === "admin" || req.userId === tugas.userId) {
            res.status(200).json(tugas);
        } else {
            res.status(403).json({ msg: "Akses terlarang" });
        }
    } catch (error) {
        console.error("Error fetching task by ID:", error);
        res.status(500).json({ msg: "Failed to fetch task by ID" });
    }
};

export const createTugas = async (req, res) => {
    const { nama_soal, status_level, ket_assigment, deadline, materi_id } = req.body;
    const foto_tugas = req.file ? req.file.path : null;

    // Validasi input
    if (!materi_id) {
        return res.status(400).json({ msg: "Materi ID is required" });
    }

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
        const data = await Tugas.create(Tugas);
        res.send(data);
        res.status(201).json({ msg: "Tugas berhasil dibuat" });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ msg: "Failed to create task", error: error.message });
    }
    try {
        // Validate request
        if (!req.body.nama_soal || !req.file) {
            return res.status(400).send({
                message: "Nama soal and foto tugas cannot be empty!"
            });
        }

        // Create an Assigment object
        const Tugas = {
            materi_id: req.body.materi_id,
            nama_soal: req.body.nama_soal,
            status_level: req.body.status_level,
            foto_tugas: req.file.path, // Handle file upload
            ket_assigment: req.body.ket_assigment,
            deadline: req.body.deadline ? new Date(req.body.deadline) : null,
            userId: req.userId
        };

        // Save Assigment in the database
        const data = await Assigment.create(assigment);
        res.send(data);
    } catch (err) {
        console.error("Error creating assignment:", err); // Log the error for debugging
        res.status(500).send({
            message: err.message || "Some error occurred while creating the assignment."
        });
    }
};


export const updateTugas = async (req, res) => {
    try {
        const tugas = await Tugas.findOne({
            where: { uuid: req.params.id }
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
                where: { uuid: req.params.id }
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
            where: { uuid: req.params.id }
        });

        if (!tugas) return res.status(404).json({ msg: "Data tidak ditemukan" });

        if (req.role === "admin" || req.userId === tugas.userId) {
            await Tugas.destroy({
                where: { uuid: req.params.id }
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
