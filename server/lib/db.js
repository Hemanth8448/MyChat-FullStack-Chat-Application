import mongoose from 'mongoose';

//function to connect to the mongodb

export const connectDB = async () => {
    try{
        mongoose.connection.on('connected', ()=>console.log('Data base connected'));
        await mongoose.connect(`${process.env.MONGODB_URI}/chat-app`)
    } catch(error){
        console.log(error);
    }
}
