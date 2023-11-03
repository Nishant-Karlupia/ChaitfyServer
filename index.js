const express=require("express");
const cors=require("cors");
const mongoose=require("mongoose");
const userRoutes=require("./routes/userRoutes");
const messagesRoute=require("./routes/messagesRoute");
const socket=require("socket.io");
const app=express();
const PORT=process.env.PORT || 5000 

require("dotenv").config();

app.use(cors());
app.use(cors({
    origin: 'https://chatifyuser.netlify.app',
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

const server=app.listen(process.env.PORT,()=>{
    console.log(`Server started on PORT ${process.env.PORT}`);
});

const io=socket(server,{
    cors:{
        origin:"https://chatifyserver-qv99.onrender.com",
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