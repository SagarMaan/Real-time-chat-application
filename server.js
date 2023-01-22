const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require("./utils/messages")
const {userJoin , getCurrentUser , userLeave , getRoomUsers} = require('./utils/users')

const app = express()
const server = http.createServer(app) 
const io = socketio(server)

    //Set static foler explore it by yourself
    app.use(express.static(path.join(__dirname,'Public')))

    const botName = 'ChatCord Bot'

    // run when client connects
    io.on('connection', (socket) => {
        socket.on('joinRoom', ({username,room}) => {
        const user = userJoin(socket.id , username,room)
         socket.join(user.room)

    // welcome current user
    socket.emit('message',formatMessage(botName,'Welcome to ChatCord!'))

    //broadcast when a user connects
    socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has join the chat`))

    //send user and room info
    io.to(user.room).emit('roomUsers',{room:user.room, users:getRoomUsers(user.room)})
        })

    // Listen for chat message
    socket.on('chatMessage',(msg) =>{
    constuser = getCurrentUser(socket.id)
     io.to(user.room).emit('message',formatMessage(user.username,msg))
    })
    
    //run when client disconnect
    socket.on('disconnect',() => {
        const user = userLeave(socket.id)
        if(user){
            io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`))

             //send user and room info
            io.to(user.room).emit('roomUsers',{room:user.room, users:getRoomUsers(user.room)})

        }
    })
})

const PORT = process.env.PORT || 3000
server.listen(PORT , () => {
    console.log(`Server is running on ${PORT}`)
})