const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const {decode} = require('jsonwebtoken')
const cors = require('cors');
require('dotenv').config();


app.use(express.json());
app.use(cors());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.cefd8nv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const dbConnect = async () => {
    try{
        await client.connect()
        console.log('DB Connected Successfully')
    } catch (error){
        console.log(error.name, error.message)
    }
}
dbConnect().then(r => {})

const logger = async (req, res, next) => {
    next();
}


app.get('/', (req, res) => {
    res.send('server started');
})


app.post('/jwt', logger, async (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCRESS_TOKEN_SECRET, {expiresIn: '1h'});
    res.send({token});
})

const verifyToken = async (req, res, next) => {
    // console.log('inside verify token', req.headers.authorization)
    if(!req.headers.authorization){
        return res.status(401).send({message: 'forbidden access'});
    }
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCRESS_TOKEN_SECRET, (err, decoded) => {
        if(err){
            return res.status(401).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
}

app.listen(port, () => {
    console.log(`server started at, ${port}`)
})