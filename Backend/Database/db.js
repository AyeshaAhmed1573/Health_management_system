const mongoose= require('mongoose');
const connectToDB=()=>{
   const mogoUrl= process.env.MONGO_URL;
   console.log("CONNECTING TO DB",mogoUrl);
   mongoose.connect(mongoUrl).then(()=>{
    console.log("Connected to DB");
   }).catch((err)=>{
    console.error("Error connecting to DB", err);
   });
}