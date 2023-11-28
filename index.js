const express = require("express")
const cors = require("cors")
const stripe = require("stripe")("sk_test_51K7EeJSAZSYJA0jhezXoAUTcmj5XN8oU4IPhUQzMS9IAbVWjW7MQGO3xDdvnzNTQFrdkhh2JNLSuV5DOozM8PZDr00uBKw51EW")
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
    const TechSalary = client.db("Hero-J-Tech").collection("salary")
    const TechWorks = client.db("Hero-J-Tech").collection("works")

    //all eplooyes

    app.get('/employee', async(req, res)=>{
      let query = {}
      if (req.query?.email) {
        query = {email:req.query.email}
      }
      if (req.query?.role) {
        query = {role:req.query.role}
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
        $set:updateData
      }
      const result = await TechEmployeeList.updateOne(filter, employeeData, option)
      res.send(result)
    })

    //Salary data:
    app.get("/salary", async(req, res)=>{
      let query = ""
      console.log(req.query.data);
      if (req.query?.email) {
        query = {email:req.query.email}
      }
      if (req.query?.data) {
        query = {payedMonth:req.query.data}
      }
      const salary = TechSalary.find(query)
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      const result = await salary
      .skip(page *size)
      .limit(size)
      .toArray()
      res.send(result)
    })

    app.post("/salary", async(req, res)=>{
      const data = req.body;
      const result = await TechSalary.insertOne(data)
      res.send(result)
    })

    // work Api

    app.get("/work", async(req, res)=>{
      let query = {}
      if (req.query?.email && req.query?.month) {
        query = { email: req.query.email, month: req.query.month };
      } else if (req.query?.email) {
        query = { email: req.query.email };
      } else if (req.query?.month) {
        query = { month: req.query.month };
      }
      const page = parseInt(req.query.page)
      const size = parseInt(req.query.size)
      const data = TechWorks.find(query)
      const result = await data
      .skip(page*size)
      .limit(size)
      .toArray()
      res.send(result)
    })

    app.post("/work", async(req, res)=>{
      const data = req.body
      const result = await TechWorks.insertOne(data)
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

// checkout API
// app.post("/checkout", async(req, res)=>{
//   try{
//     // console.log(req.body);
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types:["card"],
//       mode:"payment",
//       line_items:req.body.map(salary=>{
//         console.log(req.body)
//         return{
//           price_data:{
//             currency:"usd",
//             product_Data:{
//               name:salary.name
//             },
//             unit_Amounts: parseInt((salary.salarytoPay)) *100,
//           },
//           quantity: salary.quantity
//         }
//       }),
//       success_url:"http://localhost:5173/employee-list",
//       cancel_url:"http://localhost:5173/employee-list"
//     })
//     res.json({url:session.url})
//   }
//   catch(error){
//     res.status(500).json({error:error.message})
//   }

// })

// checkout Api 2

app.post("/chackout", async(req, res)=>{
  const salary = req.body
  console.log(salary);
  const lineItmes ={
    price_data:{
      currency:"bdt",
      product_data:{
        name: salary.name
      },
      unit_amount: salary.salarytoPay * 100,
    },
    quantity: 1
  };
  const session = await stripe.checkout.sessions.create({
    payment_method_types:["card"],
    line_items: [lineItmes] ,
    mode: 'payment',
    // success_url: `http://localhost:5173/employee-list`,
    // cancel_url: `http://localhost:5173/employee-list`,
    success_url: `https://hero-j-tech.web.app/Dashboard/employee-list`,
    cancel_url: `https://hero-j-tech.web.app/Dashboard/employee-list`,
  })

  res.json({id:session.id})

})



app.get('/',(req, res)=>{
    res.send("i am a server")
})

app.listen(port, ()=>console.log(port))