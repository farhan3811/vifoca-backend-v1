import User from "../models/UserModel.js";

export const verifyUser = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
        }

        const user = await User.findOne({
            where: {
                uuid: req.session.userId
            }
        });

        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

        req.userId = user.id;
        req.role = user.role;
        next();
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Middleware untuk akses admin
export const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: {
                uuid: req.session.userId
            }
        });

        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
        if (user.role !== "admin") return res.status(403).json({ msg: "Akses terlarang" });

        next();
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Middleware untuk akses user
export const userOnly = async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: {
                uuid: req.session.userId
            }
        });

        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
        if (user.role !== "user") return res.status(403).json({ msg: "Akses terlarang" });

        next();
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Middleware untuk akses mahasiswa
export const mahasiswaOnly = async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: {
                uuid: req.session.userId
            }
        });

        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
        if (user.role !== "mahasiswa") return res.status(403).json({ msg: "Akses terlarang" });

        next();
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};
