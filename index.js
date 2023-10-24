const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { Long } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hdk1rei.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

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
    await client.connect();

    const productCollection = client.db('productDB').collection('product');

    const userProductCollection = client.db('productDB').collection('userProduct');

    // get data
    app.get('/products', async(req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/products/store', async(req, res) => {
      const cursor = userProductCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // update data to send client side
    app.get('/products/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await productCollection.findOne(query);
      res.send(result)
    })

    app.get('/products/detail/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await productCollection.findOne(query);
      res.send(result)
    })

    // get product category
    app.get('/products/category/:id', async(req, res) => {
      const id = req.params.id;
      const query = {category: id}
      const cursor =  productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    

    // create data
    app.post('/products', async(req, res) => {
      const newProduct = req.body;
      console.log(newProduct);
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    })


    // create data in my cart
    app.post('/products/store', async(req, res) => {
      const newProduct = req.body;
      const id = req.body._id;
      delete newProduct._id;
      const query = {_id: new ObjectId(id)};
      const cursor =  userProductCollection.find(query);
      const userData = await cursor.toArray();
      console.log(id);
      const options = { upsert: true };
      const updateDoc = {
        $set: newProduct
      };
    
      const result = await userProductCollection.updateOne(query, updateDoc, options);
      console.log(result);
      res.send(result);
    });
    

    // update data 
    app.put('/products/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true};
      const updatedProduct = req.body;
      const product = {
        $set: {
          name: updatedProduct.name, 
          category: updatedProduct.category, 
          type: updatedProduct.type, 
          photo: updatedProduct.photo, 
          price: updatedProduct.price, 
          rating: updatedProduct.rating, 
          description: updatedProduct.description
        }
      }
      const result = await productCollection.updateOne(filter, product, options);
      res.send(result)
    })


    // delete data
    app.delete('/products/store/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await userProductCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('MuthoPhone server is running');
})

app.listen(port, () => {
    console.log(`MuthoPhone server is runnig of port: ${port}`);
})