const express = require("express")
const cors = require("cors")
const app = express()
require("dotenv").config()
const port = process.env.port || 5000

app.use(cors({
    origin:[
        'http://localhost:5173'
    ]
}))
app.use(express.json())

app.get('/',(req, res)=>{
    res.send("i am a server")
})

app.listen(port, ()=>console.log(port))