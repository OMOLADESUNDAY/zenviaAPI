import dotenv from "dotenv";
dotenv.config();  
import app from "./app.js"
import { connectRedis} from "./config/redis.js"
import connectDB from "./config/dbconnect.js"

const startServer=async()=>{

    const port= process.env.PORT||5000
    try {
        //await db connection
        await connectDB()
        //await redis 
        await connectRedis()
        app.listen(port,()=>console.log(`listening on port ${port}`))
    } catch (error) {
        console.log("server fail to start", error)
        process.exit(1)
    }
   
}
startServer()
