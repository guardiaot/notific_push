


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

//connect();


async function verificaUsuario(data){
    const conn = await connect();
    const [rows] = conn.query('SELECT * FROM chat_usuarios where usuario_id = '+data.chat_user_id)

    return await rows;
    
}

async function ativaUsuario(data){
    var data = JSON.parse(data);
    var datas = data[0];
    
    con.query("UPDATE chat_usuarios SET online= '1' WHERE usuario_id= '"+datas.usuario_id+"'", function (err, result, data){
        if (err) throw err;
    });

}

function cadastraUsuario(data){
   
    con.query("INSERT INTO chat_usuarios ( usuario, usuario_id, online, tipo_usuario) VALUES('"+data.chat_user+"', '"+data.chat_user_id+"', '1', '"+data.tipo_usuario+"')");

    return {
        usuario: data.chat_user,
        usuario_id: data.chat_user_id,
        usuario_id_chat: 0,
        online: 1,
        tipo_usuario: data.tipo_usuario
    }

}

function buscaUsuarioSuporte(){
    var usuarioSuporte = [];
    const [rows]  =  con.query("SELECT * FROM chat_usuarios where tipo_usuario = 's'");
    return rows;
}

function buscaUsuarioFinanceiro(){
   const [rowa] =  con.query("SELECT * FROM chat_usuarios where tipo_usuario = 'f'")
   return rows; 
}

function buscaUsuarioAtendimento(){
    con.query("SELECT * FROM chat_usuarios where tipo_usuario = 'a'")
    .on('result', function(userdata){
        if(userdata){
            return JSON.stringify(userdata);
        }else{
            return [];
        }
        
    })
}


module.exports = {verificaUsuario, ativaUsuario, cadastraUsuario, buscaUsuarioSuporte, buscaUsuarioFinanceiro, buscaUsuarioAtendimento}