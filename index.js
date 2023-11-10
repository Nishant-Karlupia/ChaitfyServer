const express=require("express");
const cors=require("cors");
const mongoose=require("mongoose");
const userRoutes=require("./routes/userRoutes");
const messagesRoute=require("./routes/messagesRoute");
const socket=require("socket.io");
const app=express();
require("dotenv").config();

const PORT=process.env.PORT || 5000 
const ORIGIN=process.env.ORIGIN;

console.log(ORIGIN);


app.use(cors());
app.use(cors({
    origin:ORIGIN,
}));
app.use(express.json());

app.use("/api/auth",userRoutes);
app.use("/api/messages",messagesRoute);

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log("db connected successfully")
})
.catch((err)=>{
    console.log(err.message)
})

const server=app.listen(PORT,()=>{
    console.log(`Server started on PORT ${PORT}`);
});

const io=socket(server,{
    cors:{
        origin:ORIGIN,
        credentials:true,
    },
})

global.onlineUsers=new Map();
io.on("connection",(socket)=>{
    global.chatSocket=socket;
    socket.on("add-user",(userId)=>{
        onlineUsers.set(userId,socket.id);
    });

    socket.on("send-msg",(data)=>{
        const sendUserSocket=onlineUsers.get(data.to);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("msg-receive",data.message);
        }
    })
})