const mongoose= require('mongoose');
const connectToDB=()=>{
   const mongoUrl= process.env.MONGO_URL;
   console.log("CONNECTING TO DB",mongoUrl);
   mongoose.connect(mongoUrl).then(()=>{
    console.log("Connected to DB");
   }).catch((err)=>{
    console.error("Error connecting to DB", err);
   });
}
module.exports= connectToDB;