const router = require('express').Router();
const UserModel = require("../models/Usermodel");
const auth = require("../middlewares/auth");
const jwt = require('jsonwebtoken');
const bcrypt = require("bcryptjs");

router.post('/register', async (req, res) => {
    try {
        let { email, password, displayName } = req.body;

        //vallidate
        if (!email || !password) {
            return res.status(400).json({ message: "Not all fields have been entered" });
        }
        if (!displayName) displayName = email;
        const existingUser = await UserModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ msg: "an account with that email already exists" })
        }

        //generate passwordHash
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        //create and save user
        const newUser = new UserModel({
            email,
            password: passwordHash,
            displayName
        });
        const savedUser = await newUser.save();
        res.json(savedUser);

    } catch (err) {
        res.status(500).json({ error: err })
    }

})

//login
router.post("/login", async (req, res) => {
    try {

        const { password, email } = req.body;
        //validate
        if (!email || !password) {
            return res.status(400).json({ message: "Not all fields have been entered" });
        }

        //check if username password exists
        const user = await UserModel.findOne({ email: email })
        if (!user) {
            return res.status(400).json({ msg: "No account with that email address" });
        }
        const ismatch = await bcrypt.compare(password, user.password);
        if (!ismatch)
            return res.status(400).json({ msg: "invalid Credentials" });

        //send jwt token to the client    
        const token = jwt.sign({ id: user._id }, process.env.jwt_SECRET);
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email
            }
        })

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

//delete Account
router.delete('/delete', auth, async (req, res) => {
    try {
        const deletedUser = await UserModel.findByIdAndDelete(req.user);
        res.json(deletedUser);
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// token isValid
router.post("/tokenIsValid", async(req, res)=>{
    try {
        const token = req.header('x-auth-token');
        if(!token) return res.json(false);

        const verified = jwt.verify(token, process.env.jwt_SECRET);
        if(!verified) return res.json(false);

        const user = await UserModel.findById(verified.id);
        if(!user) return res.json(false);

        return  res.json(true);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

module.exports = router;