const {Client} = require('pg');

const client = new Client (
    {
        host:process.env.POSTGRES_HOST,
        user:process.env.POSTGRES_USER,
        port:5432,
        password:process.env.POSTGRES_PASSWORD,
        database:process.env.DATABASE_NAME,
    }
)

client.connect()
.then(()=>{
    console.log("Database connection established");
})
.catch((err)=>{
    console.log(err);
    console.log("Error connecting to database");
})


module.exports = client;