const express = require('express');
const path = require('path');
const http = require('http');
const Socketio = require('socket.io');7 
const formatmessage = require("./utils/messages");
const  {userJoin, getCurrentUser, getRoomUser, userleave} = require("./utils/users");
const app = express();

//for the server connect
const server = http.createServer(app);
const io = Socketio(server);

const botName = "Fixten";

// Set atatic folder
app.use(express.static(path.join(__dirname,'public')))

// run when the client connect
io.on('connection', socket=>{
    //For the
    socket.on('joinRoom', ({username, room}) =>{
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
     
        //For the Welcome
        socket.emit('message', formatmessage(botName,'Welcome to Fixten Chat'));

        //When connect
        socket.broadcast.to(user.room).emit('message', formatmessage(botName,  `${user.username} is joined to chat`));
        io.to(user.room).emit('roomUsers', {
            room:user.room,
            users:getRoomUser(user.room)
            
        })
       
    });   
    
    //Listen from server
    socket.on('chatMessage',msg=>{
        const user = getCurrentUser(socket.id);
        
        io.to(user.room).emit('message',formatmessage(user.username,msg));
        
    }) 

    // All
    // io.emit();
    socket.on('disconnect', ()=>{
        const user = userleave(socket.id); 
        if(user){
            io.to(user.room).emit("message", formatmessage(botName,`${user.username} has left the chat.`));
            io.to(user.room).emit('roomUsers', {
                room:user.room,
                users:getRoomUser(user.room)
                
            })
            console.log(user.room, getCurrentUser(user.room));

        }

    });

   

});



// For the port
const PORT = 3500 || process.env.PORT;


server.listen(PORT, () => console.log(`Server is running ${PORT}`));


