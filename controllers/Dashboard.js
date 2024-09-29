import Tugas from "../models/TugasModel.js";
import Users from "../models/UserModel.js";
import Materis from "../models/MateriModel.js";
import Penilaian from "../models/PenilaianModel.js";
import db from "../config/Database.js";

export const getDashboardData = async (req, res) => {
    try {
      const totalTugas =
        req.role === "admin"
          ? await Tugas.count()
          : await Tugas.count({ where: { userId: req.userId } });
      const totalMateri =
        req.role === "admin"
          ? await Materis.count()
          : await Materis.count({ where: { userId: req.userId } });
      const totalPenilaian =
        req.role === "admin"
          ? await Penilaian.count()
          : await Penilaian.count({ where: { userId: req.userId } });
  
      const totalUser = await Users.count();
  
      let tugasDetails = [];
      if (req.role === "admin") {
        tugasDetails = await Tugas.findAll({
          include: [
            {
              model: Users,
              attributes: ["name", "email"],
            },
            {
              model: Materis,
              attributes: ["name_materi", "ket_materi"],
            },
          ],
        });
      } else {
        tugasDetails = await Tugas.findAll({
          where: { userId: req.userId },
          include: [
            {
              model: Users,
              attributes: ["name", "email"],
            },
            {
              model: Materis,
              attributes: ["name_materi", "ket_materi"],
            },
          ],
        });
      }
      const tugasPerHari = await Tugas.findAll({
        attributes: [
          [db.fn("DATE", db.col("createdat")), "tanggal"],
          [db.fn("COUNT", db.col("id")), "jumlah_tugas"],
        ],
        where: req.role === "admin" ? {} : { userId: req.userId },
        group: ["tanggal"],
        order: [[db.fn("DATE", db.col("createdat")), "ASC"]],
      });
      res.status(200).json({
        totalTugas,
        totalMateri,
        totalPenilaian,
        totalUser,
        tugasDetails,
        tugasPerHari,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: error.message });
    }
  };
  
