const {MongoClient} = require('mongodb')
require("dotenv").config();
const url= process.env.DB_CONNECT;
const databaseName='e-comm'
const client= new MongoClient(url);

async function dbConnect()
{
    let result = await client.connect();
    db= result.db(databaseName);
    return db.collection('products');
  
}
module.exports= dbConnect;