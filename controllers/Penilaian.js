import Penilaian from "../models/PenilaianModel.js";
import Users from "../models/UserModel.js";
import Tugas from "../models/TugasModel.js";
import { Op } from "sequelize";

export const getPenilaian = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 5, 50); 
  const offset = (page - 1) * limit;
  const search = req.query.search || '';
  const sortOrder = req.query.sortOrder || 'desc';
  const order = [['updatedat', sortOrder]];

  try {
    const searchConditions = {
      [Op.or]: [
        {
          form_penilaian: {
            [Op.iLike]: `%${search}%`
          }
        },
        {
          ket_penilaian: {
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
          model: Tugas,
          attributes: ['nama_soal', 'ket_assigment', 'materi_id', 'deadline'],
          where: req.role === 'admin' ? {} : { userId: req.userId } // Cek jika user mahasiswa
        }
      ],
      limit,
      offset,
      order,
      attributes: { include: ['userId'] }
    };

    // Jika admin, tampilkan semua penilaian; jika user, tampilkan hanya yang sesuai dengan userId dari tugas
    const whereClause = req.role === "admin" ? searchConditions : { ...searchConditions };

    const response = await Penilaian.findAndCountAll({
      ...commonOptions,
      where: whereClause
    });

    const totalPages = Math.ceil(response.count / limit);
    res.status(200).json({
      penilaian: response.rows.map(penilaian => ({
        ...penilaian.toJSON(),
        userId: penilaian.userId
      })),
      totalPages
    });
  } catch (error) {
    console.error("Error fetching penilaian:", error);
    res.status(500).json({ msg: "Failed to fetch penilaian" });
  }
};
export const getPenilaianById = async (req, res) => {
  try {
    const penilaian = await Penilaian.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Users,
          attributes: ['name', 'email']
        },
        {
          model: Tugas,
          attributes: ['nama_soal', 'ket_assigment', 'materi_id','deadline'],
          where: req.role === 'admin' ? {} : { userId: req.userId } // Cek tugas yang dibuat oleh user
        }
      ]
    });

    if (!penilaian) return res.status(404).json({ msg: "Data tidak ditemukan" });

    if (req.role === "admin" || req.userId === penilaian.Tuga.userId) {
      res.status(200).json(penilaian);
    } else {
      res.status(403).json({ msg: "Akses terlarang" });
    }
  } catch (error) {
    console.error("Error fetching penilaian by ID:", error);
    res.status(500).json({ msg: "Failed to fetch penilaian by ID" });
  }
};


export const createPenilaian = async (req, res) => {
  const { tugas_id, form_penilaian, answer, ket_penilaian } = req.body;

  try {
    const tugas = await Tugas.findByPk(tugas_id);
    if (!tugas) return res.status(404).json({ msg: "Tugas tidak ditemukan" });

    await Penilaian.create({
      tugas_id,
      form_penilaian,
      answer,
      ket_penilaian,
      userId: req.userId // Associate penilaian with the current user
    });

    res.status(201).json({ msg: "Penilaian berhasil dibuat" });
  } catch (error) {
    console.error("Error creating penilaian:", error);
    res.status(500).json({ msg: "Failed to create penilaian", error: error.message });
  }
};

// Update an existing penilaian
export const updatePenilaian = async (req, res) => {
  try {
    const penilaian = await Penilaian.findOne({
      where: { id: req.params.id }
    });

    if (!penilaian) return res.status(404).json({ msg: "Data tidak ditemukan" });

    const { form_penilaian, answer, ket_penilaian } = req.body;

    if (req.role === "admin" || req.userId === penilaian.userId) {
      await Penilaian.update({
        form_penilaian,
        answer,
        ket_penilaian
      }, {
        where: { id: req.params.id }
      });

      res.status(200).json({ msg: "Penilaian berhasil diperbarui" });
    } else {
      res.status(403).json({ msg: "Akses terlarang" });
    }
  } catch (error) {
    console.error("Error updating penilaian:", error);
    res.status(500).json({ msg: "Failed to update penilaian" });
  }
};

// Delete a penilaian
export const deletePenilaian = async (req, res) => {
  try {
    const penilaian = await Penilaian.findOne({
      where: { id: req.params.id }
    });

    if (!penilaian) return res.status(404).json({ msg: "Data tidak ditemukan" });

    if (req.role === "admin" || req.userId === penilaian.userId) {
      await Penilaian.destroy({
        where: { id: req.params.id }
      });

      res.status(200).json({ msg: "Penilaian berhasil dihapus" });
    } else {
      res.status(403).json({ msg: "Akses terlarang" });
    }
  } catch (error) {
    console.error("Error deleting penilaian:", error);
    res.status(500).json({ msg: "Failed to delete penilaian" });
  }
};
