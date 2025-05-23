// initialize express server
var express = require("express");
let bodyparser = require('body-parser');
var cors = require('cors')
var app = express();
const { Interface } = require("readline");
const { connect } = require("http2");
var http = require('http');

const { type } = require("os");

const socketio = require('socket.io');



const secretKey = 'a3Npc2VndXJvMjAyNA==';




/*
async function database() {
    if (global.connection && global.connection !== 'disconnected')
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
*/

app.use(cors())
app.use(bodyparser.json())
// create http server from express instance
var server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});


var usernames = [];
const myDate = new Date(Date.now()).toLocaleString().split(',')[0];


io.use((socket, next) => {
    const key = socket.handshake.auth.key;
    if (key !== secretKey) {
        return next(new Error('Authentication error'));
    }
    next();
});

io.on('connection', socket => {
    console.log('new user connectado');

    socket.on('usuarios', async function (data) {
        var suporte = await buscaUsuarioSuporte();
        io.emit('user_list', suporte);
    });

    // notificação orvamento
    socket.on('snd_updade', async function (data) {
        io.emit('updatechat', data);
    });

    socket.on('snd_orcamento', async function (data) {

        var retorno = trata_json_essencial(data.text)
        retorno = JSON.parse(retorno)
        io.emit(data.channel, retorno);
    });

    // canal chat
    socket.on('snd_chat', async function (data) {
        io.emit('result_chat', data);
    });

    socket.on('list_user_adm', async function (data) {
        io.emit('result_chat', data);
    });



});


server.listen(5000, () => {
    console.log('Server listening on :5000');
});

/*

async function buscaUsuarioSuporte() {
    const conn = await database();
    const sql = 'SELECT * FROM chat_usuarios where tipo_usuario = ?';
    const value = ['u'];
    const [rows] = await conn.query(sql, value);
    return rows;
}

*/


function trata_json_essencial(json) {

    json = JSON.parse(json);

    if (json) {
        var estado = json['porto_seguro_essencial'];
        var njson = json['porto_seguro_essencial']['result']['ofertas'];
        //console.log(njson)

        var newFAT = new Array();

        var avista_cc = 0;
        var parcela_um_cc = 0
        var ultma_pacela_cc = 0;
        var qtd_pacelas_cc = 0;

        var avista_bca = 0;
        var parcela_um_bca = 0;
        var ultma_pacela_bca = 0;
        var qtd_pacelas_bca = 0;

        var avista_fat = 0;
        var parcela_um_fat = 0
        var ultma_pacela_fat = 0;
        var qtd_pacelas_fat = 0;

        var pagamento = '';

        var forma = '';

        for (var i = 0; i < njson.length; i++) {

            njson[i].formasPagamento.map((val) => {

                if (val.formaPagamento == "CC") {
                    avista_cc = [...val.condicoesPagamento].shift();
                    parcela_um_cc = val.condicoesPagamento[1];
                    ultma_pacela_cc = [...val.condicoesPagamento].pop();
                    qtd_pacelas_cc = val.condicoesPagamento.length;
                    forma = val.formaPagamento;
                }
                if (val.formaPagamento == "BCA") {
                    avista_bca = [...val.condicoesPagamento].shift() ?? 0;
                    parcela_um_bca = val.condicoesPagamento[1] ?? 0;
                    ultma_pacela_bca = [...val.condicoesPagamento].pop() ?? 0;
                    qtd_pacelas_bca = val.condicoesPagamento.length;
                    forma = val.formaPagamento;
                }

                if (val.formaPagamento == "FAT") {
                    avista_fat = [...val.condicoesPagamento].shift();
                    parcela_um_fat = val.condicoesPagamento[1];
                    ultma_pacela_fat = [...val.condicoesPagamento].pop();
                    qtd_pacelas_fat = val.condicoesPagamento.length;
                    forma = val.formaPagamento;
                }


                pagamento = JSON.stringify(val.condicoesPagamento)

            })

            newFAT.push({
                "nomeSeguro": njson[i].nomeSeguro,
                "valor_avista": avista_fat.valorParcela,
                "parcela_inicial": parcela_um_fat.valorParcela,
                "total_parcela": qtd_pacelas_fat,
                "ultima_parcela": ultma_pacela_fat.valorParcela,
                'seguro': njson[i].seguro,
                'forma': forma,
                'avista_cc': avista_cc.valorParcela,
                'parcela_um_cc': parcela_um_cc.valorParcela,
                'ultma_pacela_cc': ultma_pacela_cc.valorParcela,
                'qtd_pacelas_cc': qtd_pacelas_cc,
                'avista_bca': avista_bca.valorParcela,
                'parcela_um_bca': parcela_um_bca.valorParcela,
                'ultma_pacela_bca': ultma_pacela_bca.valorParcela,
                'qtd_pacelas_bca': qtd_pacelas_bca,
                'parcelas': pagamento,
                'status': estado.aprovado,
                'mensagem': estado.message
            });

        }


        //    console.log(newFAT)
        return JSON.stringify(newFAT);

    } else {
        return json = []
    }

}