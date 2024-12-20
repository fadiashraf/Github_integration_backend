import { connect } from "mongoose";

const connectDB = async () => {
    try {

        const { connection } = await connect(process.env.MONGODB_URL, {})
        console.log(`Mongo DB connected : ${connection.host}`)
    } catch (error) {
        console.error(`Error : ${error.message}`)
        process.exit(1)
    }

}

export default connectDB