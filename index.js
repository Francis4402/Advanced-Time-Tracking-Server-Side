const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const {decode} = require('jsonwebtoken')
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.cefd8nv.mongodb.net/?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());

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


const userCollection = client.db('ATT').collection('users');
const employeeJointimeCollection = client.db('ATT').collection('EmployeeJoinTime');
const projectCollection = client.db('ATT').collection('AllProjectList')

app.get('/', (req, res) => {
    res.send('server started')
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


app.get('/users', async (req, res) => {
    const email = req.query.email;
    const query = {email: email}
    const result = await userCollection.find(query).toArray();
    res.send(result);
})

app.post('/users', async (req, res) => {
    const users = req.body;
    const query = {email: users.email}
    const existingUser = await userCollection.findOne(query);
    if(existingUser){
        return res.send({message: 'user already exists', insertedId: null})
    }
    const result = await userCollection.insertOne(users);
    res.send(result);
})


app.get('/getTimebyData', async (req, res) => {
    const email = req.query.email;
    const query = {email: email}
    const timeEntries = await employeeJointimeCollection.find(query).toArray();
    res.send(timeEntries);
})

app.get('/saveTime/:id', async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await employeeJointimeCollection.findOne(query);
    res.send(result);
})
app.post('/saveTime', async (req, res) => {
    const timer = req.body;
    const result = await employeeJointimeCollection.insertOne(timer);
    res.send(result);
})

app.get('/allprojects', async (req, res) => {
    const email = req.query.email;
    const query = {email: email}
    const result = await projectCollection.find(query).toArray();
    res.send(result);
})

app.get('/allprojects/:id', async (req, res) => {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await projectCollection.findOne(query);
    res.send(result);
})


app.post('/allprojects', async (req, res) => {
    const timer = req.body;
    const result = await projectCollection.insertOne(timer);
    res.send(result);
})

app.put('/allprojects/:id', async (req, res) => {
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = {upsert: true};
    const item = req.body;
    const update = {
        $set: {
            name: item.name,
            email: item.email,
            description: item.description,
            associatedtasks: item.associatedtasks,
        }
    }
    const result = await projectCollection.updateOne(filter, update, options)
    res.send(result);
})

app.delete('/allprojects/:id', async (req, res) =>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await projectCollection.deleteOne(query);
    res.send(result);
})



app.listen(port, () => {
    console.log(`server started, ${port}`)
})