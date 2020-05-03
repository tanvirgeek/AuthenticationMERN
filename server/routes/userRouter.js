const router = require('express').Router();
const UserModel = require("../models/Usermodel");
const bcrypt = require("bcryptjs");

router.post('/register', async (req, res) => {
    try {
        const { email, password, displayName } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Not all fields have been entered" });
        }
        if(!displayName) displayName = email;
        const existingUser = await UserModel.findOne({email:email});
        if(existingUser){
            return res.status(400).json({msg:"an account with that email already exists"})
        }
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password,salt);
        const newUser = new UserModel({
            email,
            password: passwordHash,
            displayName
        });
        const savedUser = await newUser.save();
        res.json(savedUser);
    }catch(err){
        res.status(500).json({error: err})
    }
    
})

module.exports = router;