const express = require("express")
const cors = require("cors")
const app = express()
require("dotenv").config()
const port = process.env.port || 5000

app.use(cors({
    origin:[
        'http://localhost:5173',
        'https://hero-j-tech.web.app',
        'https://hero-j-tech.firebaseapp.com'
    ]
}))
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.w7xbhfw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const TechEmployeeList = client.db("Hero-J-Tech").collection("employee")

    //all eplooyes

    app.get('/employee', async(req, res)=>{
      let query = {}
      if (req.query?.email) {
        query = {email:req.query.email}
      }
        const employeeData = TechEmployeeList.find(query)
        const result = await employeeData.toArray()
        res.send(result)
    })

    app.get("/employee/:id", async(req, res)=>{
      const id = req.params.id
      const filter = {_id: new ObjectId(id)}
      const result = await TechEmployeeList.findOne(filter)
      res.send(result)
    })

    app.post('/employee', async(req, res)=>{
        const employeeData= req.body
        const result = await TechEmployeeList.insertOne(employeeData)
        res.send(result)
    })

    app.put("/employee/:id", async(req, res)=>{
      const id  = req.params.id
      const filter = {_id: new ObjectId(id)}
      const option = {upsert:true}
      const updateData = req.body
      const employeeData = {
        $set:{
          varification: updateData.varification
        }
      }
      const result = await TechEmployeeList.updateOne(filter, employeeData, option)
      res.send(result)
    })



    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req, res)=>{
    res.send("i am a server")
})

app.listen(port, ()=>console.log(port))