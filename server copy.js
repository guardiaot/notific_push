// initialize express server
var express = require("express");
let bodyparser  = require('body-parser');
var cors = require('cors')
var app = express();
const { Interface } = require("readline");


const { connect } = require("http2");


async function database(){

    if(global.connection && global.connection !== 'disconnected')
        return global.connection;

    const mysql = require('mysql2/promise');
    var connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "dataseguros"
    });

    global.connection = connection;
    return connection;
}


app.use(cors())
app.use(bodyparser.json())
// create http server from express instance
var http = require("http").createServer(app);
 
// include socket IO
var socketIO = require("socket.io")(http, {
    cors: {
        "origin": "*",
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
    }
});
 

var socketCount = 0
const aviso = [];
let clientSocketIds = [];
let connectedUsers = [];


function getSocketByUserId(userId) {
   
    let socket = '';
    for(let i = 0; i<clientSocketIds.length; i++) {
        if(clientSocketIds[i].userId == userId) {
            socket = clientSocketIds[i].socket;
            break;
        }
    }
    return socket;
}

// start the HTTP server at port 3000
http.listen(process.env.PORT || 3000, function () {
    console.log("Server started running...");
 
    // an array to save all connected users IDs
    var ConectdUsers = [];
    
    // called when the io() is called from client

    socketIO.on("connection", function (socket) { 
        console.log("Conexao detectada....");

        socket.on('join-request', async data => {
                socket.username = data.chat_user;
           
                const verifica = await verificaUsuario(data);
                console.log(data);

                if(verifica != ''){
                    ativaUsuario(verifica)  
                    clientSocketIds.push({socket: socket, userId: verifica.id_user_to});
                    connectedUsers = connectedUsers.filter(item => item.id_user_to != verifica.id_user_to);                   
                    connectedUsers.push({...verifica, socketId: socket.id})                   
                    socketIO.emit('updateUserList', connectedUsers)

                    const usuarios = await buscaUsuario();
                    socketIO.emit('usuariosOn', usuarios);
                    
                    console.log(connectedUsers);

                    console.log(clientSocketIds);

                }else{
                    const dados = cadastraUsuario(data);
                    socket.broadcast.emit('lista-update', {
                        novo: dados,
                        list: ConectdUsers
                    }); 
                };
            
        });

        socket.on('saveMensagem', function(data) {

            socket.emit('retornoConversa', retorno);
            console.log(retorno);
           
        });

        socket.on('create', function(data) {
            socket.join(data.room);
            let withSocket = getSocketByUserId(data.withUserId);          
            socket.broadcast.to(withSocket.id).emit("invite",{room:data})
        });

        socket.on('joinRoom', function(data) {
            socket.join(data.room.room);
        });

        socket.on('lista-de-usuario', async data => {            
            var usuarioSuporte = buscaUsuarioSuporte();           
            socket.broadcast.emit('suporte', usuarioSuporte);
            const usuarios = await buscaUsuario();
            socketIO.emit('usuariosOn', usuarios);
            
        });

        socket.on('message', async function(data) {
      
            if(data.chat_message == "/teste"){
                console.log("TESTE")
            } else{    
           // socket.broadcast.to(data.room).emit('message', data);
           socketIO.sockets.socket(data).emit('msg_user_found', check_key(id));
            console.log(data)
            let retorno = await salvaMensagem(data); 
            socketIO.emit('retornoConversa', retorno);
            console.log(retorno);
            }
        })

        socket.on('usuario-admin', data => {
            var usuarioSuporte = buscaUsuarioSuporte();           
            socket.broadcast.emit('suporte', usuarioSuporte);
        });

        socket.on('UsuarioFinanceiro', data => {
            var UsuarioFinanceiro = buscaUsuarioFinanceiro();
            socket.emit('Suporte', UsuarioFinanceiro);
        });

        socket.on('UsuarioAtendimento', data => {
            var UsuarioAtendimento = buscaUsuarioAtendimento();
            socket.emit('Suporte', UsuarioAtendimento);
        })

        async function salvaMensagem(data){
            const conn = await database();
            const sql  = "INSERT INTO chat ( nome, mensagem, id_user_from, id_user_to, lido) VALUES( ?, ?, ?, ?, ?)";
            const value = [data.usuario, data.chat_message, data.id_user_from, data.id_user_to, 0];
            await conn.query(sql, value);

            return data;

        }
        
        async function verificaUsuario(data){
           
            const conn = await database();
            const sql  = 'SELECT * FROM chat_usuarios where usuario_id = ?';
            const value = [data.id_user_from];
            const [rows] = await conn.query(sql, value);
        
            return await rows[0];
           
        }

        async function ativaUsuario(data){
            const conn = await database();
                      
            const sql  = "UPDATE chat_usuarios SET online= '1' WHERE usuario_id = ?";
            const value = [data.id_user_from];
            const [rows] = await conn.query(sql, value);
            return rows;
        }
        
        async function cadastraUsuario(data){
            const conn = await database();

            const sql  = "INSERT INTO chat_usuarios ( usuario, usuario_id, online, tipo_usuario) VALUES( ?, ?, ?, ?)";
            const value = [data.chat_user, data.chat_user_id, 1, data.tipo_usuario];
            await conn.query(sql, value);

            return {
                usuario: data.chat_user,
                id_user_from: data.chat_user_id,
                id_user_to: 0,
                online: 1,
                tipo_usuario: data.tipo_usuario
            }

        
        }
        
        async function buscaUsuario(){
            const conn = await database();
            const sql  = 'SELECT * FROM chat_usuarios where tipo_usuario = ?';
            const value = ['u'];
            const [rows] = await conn.query(sql, value);
            
            return rows;
        }

        async function buscaUsuarioSuporte(){
            const conn = await database();
            const sql  = 'SELECT * FROM chat_usuarios where tipo_usuario = ?';
            const value = ['s'];
            const [rows] = await conn.query(sql, value);
            
            return rows;
        }
        
        async function buscaUsuarioFinanceiro(){
           const conn = await database();
           const sql  = 'SELECT * FROM chat_usuarios where tipo_usuario = ?';
           const value = ['f'];
           const [rows] = await conn.query(sql, value);

           return rows; 
        }
        
        async function buscaUsuarioAtendimento(){
            const conn = await database();
            const sql  = 'SELECT * FROM chat_usuarios where tipo_usuario = ?';
            const value = ['a'];
            const [rows] = await conn.query(sql, value);

            return rows;
        }

        


    });

   
});