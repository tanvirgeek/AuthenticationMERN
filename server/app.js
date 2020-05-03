const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

//set up express
const app = express();
app.use(express.json());
app.use(cors());

//server
const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server running on port ${port}`);
});

//mongo setup
mongoose.connect(process.env.MONGO_URL,{ useNewUrlParser: true, useUnifiedTopology: true }, (err)=>{
    if (err) throw err;
    console.log("Mongodb connection established");
});

//set up routes
app.use("/users", require('./routes/userRouter'));