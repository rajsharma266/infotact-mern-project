const mongoose=require('mongoose')

const dbConnect=()=>{
    mongoose.connect(process.env.MONGO_URL)
   .then(()=>{
    console.log("db connected");
   
   }).catch((error:any)=>{
console.log("error in db");
console.log(error);


   })
}
module.exports=dbConnect;