import Tugas from "../models/TugasModel.js";
import Users from "../models/UserModel.js";
import Materis from "../models/MateriModel.js";
import { Op } from "sequelize";

// Fungsi untuk mendapatkan daftar tugas dengan pagination dan pencarian
export const getTugas = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5; // Jumlah item per halaman
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const sortOrder = req.query.sortOrder || 'desc';
    const order = [['updatedat', sortOrder]];

    try {
        const searchConditions = {
            [Op.or]: [
                {
                    nama_soal: {
                        [Op.iLike]: `%${search}%` // Pencarian tidak peka huruf besar/kecil
                    }
                }
            ]
        };

        let response;
        if (req.role === "admin") {
            response = await Tugas.findAndCountAll({
                ...commonOptions,
                where: searchConditions
            });
        } else {
            response = await Tugas.findAndCountAll({
                ...commonOptions,
                where: {
                    userId: req.userId,
                    ...searchConditions
                }
            });
        }

        const totalPages = Math.ceil(response.count / limit);
        res.status(200).json({
            tugas: response.rows,
            totalPages
        });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Fungsi untuk mendapatkan tugas berdasarkan UUID
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
                    attributes: ['judul_materi', 'deskripsi'] // Sesuaikan atribut jika diperlukan
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
        res.status(500).json({ msg: error.message });
    }
};
export const createTugas = async (req, res) => {
    const { nama_soal, status_level, ket_assigment, deadline, materi_id } = req.body;
    const foto_tugas = req.file ? req.file.path : null; // Mendapatkan path file yang diupload

    try {
        await Tugas.create({
            nama_soal,
            status_level,
            foto_tugas,
            ket_assigment,
            deadline,
            userId: req.userId,
            materi_id: BigInt(materi_id) // Pastikan penanganan BIGINT
        });
        res.status(201).json({ msg: "Tugas berhasil dibuat" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Fungsi untuk memperbarui tugas berdasarkan UUID
export const updateTugas = async (req, res) => {
    try {
        const tugas = await Tugas.findOne({
            where: { uuid: req.params.id }
        });

        if (!tugas) return res.status(404).json({ msg: "Data tidak ditemukan" });

        const { nama_soal, status_level, ket_assigment, deadline, materi_id } = req.body;
        const foto_tugas = req.file ? req.file.path : tugas.foto_tugas; // Perbarui gambar jika diberikan

        if (req.role === "admin" || req.userId === tugas.userId) {
            await Tugas.update({
                nama_soal,
                status_level,
                foto_tugas,
                ket_assigment,
                deadline,
                materi_id: materi_id ? BigInt(materi_id) : tugas.materi_id // Perbarui jika diberikan, jika tidak tetap gunakan yang lama
            }, {
                where: { uuid: req.params.id }
            });
            res.status(200).json({ msg: "Tugas berhasil diperbarui" });
        } else {
            res.status(403).json({ msg: "Akses terlarang" });
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Fungsi untuk menghapus tugas berdasarkan UUID
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
        res.status(500).json({ msg: error.message });
    }
};
