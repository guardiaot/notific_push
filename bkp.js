async function contaAlerta(usuario_id) {

    const conn = await database();
    const sql = `
                        SELECT 
                        chat.id,
                        chat.nome,
                        chat.pessoa,
                        chat.orcamento,
                        chat.lido_por_mim,
                        chat.id_referencia,
                        chat.parceiro_id
                        FROM  
                            chat  
                        WHERE 
                            chat.lido_por_mim = '0'
                            AND chat.tipo = '0'
                            AND chat.parceiro_id = ?
                        GROUP BY 
                            chat.orcamento
                        `;
    const value = [usuario_id];
    const [rows] = await conn.query(sql, value);

    return await rows;


}

async function desatviaUsuario(data) {

    const conn = await database();
    const sql1 = 'SELECT chat_usuarios.id, chat_usuarios.usuario, chat_usuarios.usuario_id FROM chat_usuarios WHERE usuario = ?'
    const value1 = [data];
    const [row] = await conn.query(sql1, value1);

    const sql = "UPDATE chat_usuarios SET online= '0', chat_id = '0' WHERE usuario = ?";
    const value = [data];
    const [rows] = await conn.query(sql, value);

    return row[0];
}

async function conta_pessoa_id(id) {

    const conn = await database();
    const sql = `
                        SELECT 
                            chat.id,
                            chat.nome,
                            chat.pessoa,
                            chat.orcamento,
                            chat.lido_por_mim,
                            chat.id_referencia,
                            chat.parceiro_id
                        FROM  
                            chat  
                        WHERE 
                            chat.lido_por_mim = '0'
                            AND chat.parceiro_id <> '2'
                            AND chat.id_referencia <> '0'
                            AND chat.orcamento = ?
                        GROUP BY 
                            chat.id_referencia
                     `;
    const value = [id];
    const [rows] = await conn.query(sql, value);

    return await rows;


}

async function buscaUsuarioSuporte() {
    const conn = await database();
    const sql = 'SELECT * FROM chat_usuarios where tipo_usuario = ?';
    const value = ['s'];
    const [rows] = await conn.query(sql, value);

    return rows;
}

async function buscaUsuarioFinanceiro() {
    const conn = await database();
    const sql = 'SELECT * FROM chat_usuarios where tipo_usuario = ?';
    const value = ['f'];
    const [rows] = await conn.query(sql, value);

    return rows;
}

async function buscaUsuarioAtendimento() {
    const conn = await database();
    const sql = 'SELECT * FROM chat_usuarios where tipo_usuario = ?';
    const value = ['a'];
    const [rows] = await conn.query(sql, value);

    return rows;
}

async function salvaMensagem(data) {
    const conn = await database();
    const sql = "INSERT INTO chat ( nome, mensagem, parceiro_id, pessoa, meu_id, orcamento, tipo, id_referencia, lido_por_mim, data_now, recebido) VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const value = [data.usuario, data.chat_message, data.meu_id, data.pessoa, data.parceiro_id, data.orcamento, data.tipo, data.id_referencia, 0, 'now()', 1];
    await conn.query(sql, value);

    return data;

}

async function buscaHistorico(data) {
    const conn = await database();
    const sql = `  
                    SELECT tabela.* from (
                        SELECT  
                            chat.id
                            , chat.nome
                            , chat.mensagem
                            , chat.meu_id
                            , chat.parceiro_id
                            , chat.lido_por_mim
                            , DATE_FORMAT(chat.data_now,'%d/%m/%Y %H:%i:%s') as data_now
                            , chat.orcamento
                            , chat.id_referencia 
                        FROM 
                            chat  
                        WHERE 
                            chat.orcamento = ? 
                            AND chat.id_referencia = ?
                        ORDER BY 
                            chat.id DESC  LIMIT 10 ) 
                    tabela ORDER BY 1 ASC`;
    const value = [data.orcamento, data.id_referencia]
    const [rows] = await conn.query(sql, value);

    return rows;

}

async function buscarAssunto(data) {
    const conn = await database();
    const sql = `
                    SELECT 
                          chat.nome
                        , chat.pessoa
                        , chat.meu_id
                        , chat.parceiro_id
                        , chat.orcamento
                        , chat.lido_por_mim
                        , chat.lido_pelo_parceiro
                        , chat.tipo
                        , chat.recebido
                        , chat.id_referencia
                        , chat.status
                        , chat.id
                        , chat.pessoa 
                    FROM
                        chat
                    WHERE 
                        chat.pessoa like ?  
                        AND chat.orcamento = ?                         
                        AND chat.lido_por_mim = '0'
                        AND chat.tipo in (3,4,5,6,7,8)
                       
                    `;

    const value = [data.pessoa, data.orcamento]
    const [rows] = await conn.query(sql, value);

    return rows;
}

async function conta_assunto_id(orcamento) {

    const conn = await database();
    const sql = `
                        SELECT 
                            chat.id,
                            chat.nome,
                            chat.pessoa,
                            chat.orcamento,
                            chat.lido_por_mim,
                            chat.id_referencia,
                            chat.parceiro_id
                        FROM  
                            chat  
                        WHERE 
                                chat.lido_por_mim = '0'
                            AND chat.parceiro_id <> '2' 
                                          
                            AND chat.id_referencia = ?
                        GROUP BY 
                            chat.id_referencia
                     `;
    const value = [orcamento];
    const [rows] = await conn.query(sql, value);

    return await rows;


}

async function buscachaveParceiro(id) {

    const conn = await database();
    const sql = ` 
                        SELECT 
                              chat.id
                            , chat.nome
                            , chat.pessoa 
                            , chat.mensagem
                            , chat.orcamento
                            , chat.meu_id
                            , chat.parceiro_id
                            , chat.lido_por_mim
                            , DATE_FORMAT(chat.data_now,'%d/%m/%Y %H:%i:%s') as data_now
                            , chat.tipo 
                        FROM 
                            chat  
                        WHERE  
                            chat.tipo <> '0' 
                            AND parceiro_id = '${id}'
                        GROUP BY 
                            chat.orcamento
                     `;
    //const value = [id];
    const [rows] = await conn.query(sql);

    return rows;
}