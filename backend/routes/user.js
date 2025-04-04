const { Router } = require("express");
const userRouter = Router();
const { userModel, eventModel, announcementModel } = require("../db");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const jwt = require("jsonwebtoken");
const { JWT_USER_SECRET } = require("../config");
const { userMiddleware } = require("../middlewares/user");

// User Apply (Registration)
userRouter.post("/apply", async (req, res) => {
    try {
        const reqBody = z.object({
            email: z.string().email(),
            password: z.string().min(3),
            name: z.string().min(1),
            industry: z.string().min(1),
            fundingStage: z.enum(["Ideation", "Pre-Seed", "Seed", "Series A", "Series B", "Growth"]),
            revenue: z.number().nonnegative(),
            teamSize: z.number().int().nonnegative()
        });

        const parsed = reqBody.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid request body", error: parsed.error.issues });
        }

        const { email, password, name, industry, fundingStage, revenue, teamSize } = parsed.data;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userModel.create({ email, password: hashedPassword, name, industry, fundingStage, revenue, teamSize });

        res.status(201).json({ message: "User created successfully", user: { email: newUser.email, name: newUser.name } });
    } catch (err) {
        res.status(500).json({ message: "Error creating user", error: err.message });
    }
});

// User Login
userRouter.post("/login", async (req, res) => {
    try {
        const reqBody = z.object({
            email: z.string().email(),
            password: z.string().min(3)
        });

        const parsed = reqBody.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid request body", error: parsed.error.issues });
        }

        const { email, password } = parsed.data;

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if(!user.isApproved){
            res.status(401).json({message: "User not approved"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const token = jwt.sign({ email, id: user._id }, JWT_USER_SECRET, { expiresIn: "1h" });

        res.status(200).json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
});

userRouter.get('/profile', userMiddleware, async (req, res) => {
    try {
        const { userId } = req; 
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
userRouter.get('/events', async (req, res) => {
    try {
        const events = await eventModel.find({});
        res.json({events});
    } 
    catch(err){
        res.status(500).json({message: "Error fetching events"})
    }
});

userRouter.get('/announcements', async (req, res) => {
    try {
        const announcements = await announcementModel.find({});
        res.json({announcements});
    }    
    catch(err){
        res.status(500).json({message: "Error fetching announcements"})
    }
});


module.exports = {
    userRouter
};
