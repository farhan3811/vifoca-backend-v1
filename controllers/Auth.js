import User from "../models/UserModel.js";
import argon2 from "argon2";
import nodemailer from 'nodemailer';
import crypto from 'crypto'; 
import { Op } from 'sequelize';



export const Login = async (req, res) => {
    const nim = req.body.nim;
    if (!/^\d+$/.test(nim)) return res.status(400).json({msg: "NIM harus berupa angka yang valid"});
    const user = await User.findOne({
        where: {
            nim: nim
        }
    });
    if (!user.isApproved) return res.status(403).json({ msg: "Akun Anda belum di-approve oleh admin" });
    if (!user) return res.status(404).json({msg: "User tidak ditemukan"});
    const match = await argon2.verify(user.password, req.body.password);
    if (!match) return res.status(400).json({msg: "Password salah"});
    req.session.userId = user.uuid;
    const uuid = user.uuid;
    const name = user.name;
    const nimUser = user.nim;
    const role = user.role;
    
    res.status(200).json({uuid, name, nim: nimUser, role});
}
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: {
                    [Op.gt]: Date.now() // Token valid jika expiration date > waktu sekarang
                }
            }
        });

        if (!user) {
            return res.status(400).json({ msg: "Token tidak valid atau telah expired" });
        }

        // Hash password baru
        const hashedPassword = await argon2.hash(newPassword);
        user.password = hashedPassword;
        user.resetToken = null; 
        user.resetTokenExpiration = null; 
        await user.save();

        res.status(200).json({ msg: "Password telah direset" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};


export const sendResetEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        // Generate token dan simpan ke user
        const token = crypto.randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // Token berlaku selama 1 jam
        await user.save();

        // Konfigurasi transporter untuk pengiriman email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS,
            }
        });

        // Link reset password
        const resetLink = `http://localhost:3000/reset-password/${token}`;

        // Kirim email ke pengguna
        await transporter.sendMail({
            to: email,
            subject: 'Reset Password',
            html: `<p>Silakan klik link berikut untuk mereset password Anda: <a href="${resetLink}">Reset Password</a></p>`
        });

        res.status(200).json({ msg: "Email reset password telah dikirim" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export const register = async (req, res) => {
    const { name, email,nim, password, role } = req.body;
    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ msg: "Email sudah digunakan" });
    const hashedPassword = await argon2.hash(password);
    try {
      await User.create({
        name,
        email,
        nim,
        password: hashedPassword,
        role,
        isApproved: false
      });
  
      res.status(201).json({ msg: "Registrasi berhasil, tunggu approval dari admin" });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };
export const Me = async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({msg: "Mohon login ke akun Anda!"});
    }

    const user = await User.findOne({
        attributes: ['uuid', 'name', 'nim', 'role', 'avatar'],
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
