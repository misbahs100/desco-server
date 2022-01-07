const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const ObjectId = require("mongodb").ObjectId;
const { registerValidation, loginValidation } = require('./validation/authValidation')
const bcrypt = require('bcryptjs')
const env = require('dotenv')
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
require('dotenv').config()

const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://descoUser:JyWe6vWUcNVKY0Dg@cluster0.lqubf.mongodb.net/desco?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect(err => {
      const userCollection = client.db("desco").collection("users");
      const billCollection = client.db("desco").collection("bills");
      // perform actions on the collection object


      app.get("/allUser", (req, res) => {
        console.log("hello");
       
        const result = userCollection.find({});
        res.send(result)
      })

      // get all the bills
      app.get("/billing-list", async (req, res) => {
        const page = req.query.page;
        const size = Number(req.query.size);
        console.log("nothing");
        const result = billCollection.find({});

        let bills;
        const count = await result.count();
        if (page) {
          bills = await result
            .skip(page * size)
            .limit(size)
            .toArray();
        } else {
          bills = await result.toArray();
        }

        res.send({ count, bills });
      });

      // add bill data to the database
      app.post("/api/add-billing", async (req, res) => {
        console.log(req.body);
        const userData = req.body;
        const result = await billCollection.insertOne(userData);
        if(result.acknowledged) {
          res.send({
            success: true,
            msg: "Insertion successful"
          });
        }
        
      });

      // add user data to the database
      //  app.post("/api/registration", (req, res) => {
      //    console.log(req.body);
      //   const userData = req.body;
      //   const result =  userCollection.insertOne(userData);
      //   res.send(result);
      // });

      //new register-----------------------------------------------
      app.post('/api/registration', async (req, res) => {

        // validation before making user
        console.log(req.body)
        // if(req.body == undefined){console.log("req is not defined");}
        const error =  registerValidation(req.body)
        if (error) return res.status(400).send({ 
            success: false,
            msg: error.details[0].message
        })

        // checking if the user's email exists in the db
        const emailExist = await userCollection.findOne({ email: req.body.email })
        if (emailExist) return res.status(409).send({
          success: false,
          msg: "User is already registered"
        })

        // hashing password
        // const salt = await bcrypt.genSalt(10)
        // const hashedPassword = await bcrypt.hash(req.body.password, salt)
        console.log("testing...");
        // adding user
        // const user = req.body;
        try {
          console.log(process.env.TOKEN_SECRET);

          const token = jwt.sign({ email: req.body.email}, process.env.TOKEN_SECRET)
          // console.log("token",token);

          const userData = req.body;
          const result = userCollection.insertOne(userData);
          res.send({
            user: req.body,
            success: true,
           msg: "Registration successful",
           token,
            
          })
        } catch (err) {

          res.status(400).send({

            success: false,
            msg: "Something went wrong. Please try again.",


          })
        }
      })

      //login
      app.post('/api/login', async (req, res) => { 

        // validation before making user
        const error = loginValidation(req.body)
        if (error) return res.status(400).send({ 
            success: false,
            msg: error.details[0].message
        })
    
        // checking if the user's email exists in the db
        const user = await userCollection.findOne({ email: req.body.email })
        console.log(user);
        if (!user) return res.status(409).send({
            success: false,
            msg: "User not found" 
        })
    
        // password checking
        // const validPass = await bcrypt.compare(req.body.password, user.password)
        // if(!validPass) return res.status(400).send({
        //     success: false,
        //     msg: "Incorrect Password"
        // })
    
        // create and assign a token
        const token = jwt.sign({ email: user.email}, process.env.TOKEN_SECRET)
        // res.header('auth-token', token).send(user)
        // delete user._doc.password

        
        res.send({
            success: true,
            msg: "Login successful",
            user, 
            token
        })
        
        // successful login
        // res.send({msg: 'Logged in'})
    })




      //delete bill
      app.delete('/delete-billing/:id', (req, res) => {
        billCollection.deleteOne({ _id: ObjectId(req.params.id) })
          .then(result => {
            console.log(result);
            res.send(result.deletedCount > 0);
          })
      })


      // update a (matched id) bill
      app.post('/update-billing', (req, res) => {
        console.log(req.body)
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const paidAmount = req.body.paidAmount;
        billCollection.updateOne({ _id: ObjectId(req.body.id) },
          { $set: { name: name, email: email, phone: phone, paidAmount: paidAmount } }
        )
          .then(result => {
            console.log(result);
            res.send(result.modifiedCount > 0);
          })
      })

    });
  }
  finally {

  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Desco!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});