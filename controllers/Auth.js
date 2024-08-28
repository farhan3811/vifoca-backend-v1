import User from "../models/UserModel.js";
import argon2 from "argon2";

export const Login = async (req, res) => {
    // Pastikan nim diterima sebagai string
    const nim = req.body.nim;
    if (!/^\d+$/.test(nim)) return res.status(400).json({msg: "NIM harus berupa angka yang valid"});

    // Temukan pengguna dengan nim yang sesuai
    const user = await User.findOne({
        where: {
            nim: nim
        }
    });
    if (!user) return res.status(404).json({msg: "User tidak ditemukan"});

    // Verifikasi password
    const match = await argon2.verify(user.password, req.body.password);
    if (!match) return res.status(400).json({msg: "Password salah"});

    // Simpan uuid di sesi dan kirim data pengguna
    req.session.userId = user.uuid;
    const uuid = user.uuid;
    const name = user.name;
    const nimUser = user.nim;
    const role = user.role;
    
    res.status(200).json({uuid, name, nim: nimUser, role});
}

export const Me = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({msg: "Mohon login ke akun Anda!"});
    }

    // Temukan pengguna berdasarkan uuid dari sesi
    const user = await User.findOne({
        attributes: ['uuid', 'name', 'nim', 'role'],
        where: {
            uuid: req.session.userId
        }
    });
    if (!user) return res.status(404).json({msg: "User tidak ditemukan"});
    
    res.status(200).json(user);
}

export const logOut = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(400).json({msg: "Tidak dapat logout"});
        res.status(200).json({msg: "Anda telah logout"});
    });
}
