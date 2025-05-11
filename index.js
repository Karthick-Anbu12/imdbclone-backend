const express = require('express')
const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv")
const cors = require("cors")
const { MongoClient, ObjectId } = require("mongodb")
const app=express();
const URL="mongodb+srv://karthickleo2121:0oKLqrjqxeby6EVE@imdb.mymenvx.mongodb.net/?retryWrites=true&w=majority&appName=User"
const secretkey="ajksdnhuagyt26562"
app.use(cors({
    origin: '*'
}))
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})
mongoose.connect(URL).then(() => {
    console.log("Database connected successfully.");
    app.listen(3000, () => {
        console.log(`Server is running on port 3000`);
    });
});
const users = mongoose.model("users", userSchema);
app.use(express.json())
let authenticate = (req, res, next) => {
    if (!req.headers.authorization) {
        res.status(401).json({ message: "unauthorized user" })
    }
    else {
        jwt.verify(req.headers.authorization, secretkey, (error, data) => {
            if (error) {
                res.status(401).json({ message: "unauthorized" })
            }
            req.userid = data.id
            next();
        })
    }
}
//login
app.post("/login", async (req, res) => {
    const client = new MongoClient(URL);
    try {
        await client.connect();
        const collection = client.db().collection("users");
        const user = await collection.findOne({ email: req.body.email })
        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" })
        }
        const passwordcorrect = await bcrypt.compare(req.body.password, user.password)
        if (!passwordcorrect) {
            return res.status(401).json({ message: "Invalid credentials" })
        }
        const token = jwt.sign({ id: user._id }, secretkey)
        res.json({ message: token })
    } catch (error) {
        console.error("Error fetching data: ", error);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
})
app.get("/getmovie/:id" , async (req, res) => {
    const client = new MongoClient(URL);

    try {
        await client.connect();

        const collection = client.db().collection("movies");

        const result = await collection.findOne({_id:new ObjectId(`${req.params.id}`)});
        res.json(result)
    } catch (error) {
        console.error("Error fetching data: ", error);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
})
//Getting user data
app.get("/getdata" , async (req, res) => {
    const client = new MongoClient(URL);

    try {
        await client.connect();

        const collection = client.db().collection("users");

        const result = await collection.find().toArray();
        res.json(result)
    } catch (error) {
        console.error("Error fetching data: ", error);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
})

app.post("/putdata", async (req, res) => {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(req.body.password, salt)
    req.body.password = hash;
    let data = new users(req.body);
    const result = await data.save();
    res.send(result);
})
//get movies
app.get("/listmovies",async(req,res)=>{
     const client = new MongoClient(URL);

    try {
        await client.connect();

        const collection = client.db().collection("movies");

        const result = await collection.find().toArray();
        res.json(result)
    } catch (error) {
        console.error("Error fetching data: ", error);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
})
app.post("/addactor", async (req, res) => {
  const client = new MongoClient(URL);
  try {
    await client.connect();

    const collection = client.db().collection("Actor");

    const result = await collection.insertOne(req.body);
    res.json(result)

    // console.log("Fetched data: ", result);
  } catch (error) {
    console.error("Error fetching data: ", error);
  } finally {
    // Close the connection to the MongoDB cluster
    await client.close();
  }
})
app.post("/addproducer", async (req, res) => {
  const client = new MongoClient(URL);
  try {
    await client.connect();

    const collection = client.db().collection("Producer");

    const result = await collection.insertOne(req.body);
    res.json(result)

    // console.log("Fetched data: ", result);
  } catch (error) {
    console.error("Error fetching data: ", error);
  } finally {
    // Close the connection to the MongoDB cluster
    await client.close();
  }
})

