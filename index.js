//IMPORT DA RESTIFY
const restify = require('restify');
const errs = require('restify-errors');

const server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});


//CONFIGURAÇÕES DO BANCO
var knex = require('knex')({
    client: 'mysql',
    connection: {
      host : '10.107.144.29',
      user : 'remoto',
      password : 'bcd127',
      database : 'db_oncreate'
    }
  });

//USANDO A KNEX
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});

/////////////////////////////////////////
//ENDPOINTS DO API, USANDO O FORMATO REST
/////////////////////////////////////////

//SELECT DE TODOS OS PRODUTOS ACABAdDOS
server.get('/brindes', (req, res, next) => {

    //NO WHERE É NECESSÁRIO USAR O '0' E '1' POIS É ASSIM QUE O KNEX TRABALHA
    knex('tbl_brinde')
        .then((dados) => {
            res.send(dados);
        }, function(){
            res.send(new errs.BadRequestError('Infelizmente não conseguimos localizar os produtos'))
        })
});

//SELECT EM APENAS UMA FOTO DE UM PRODUTO
server.get('/foto/brinde/:id', (req, res, next) => {
    
    const { id } = req.params;

    knex('tbl_foto_brinde')
        .where('id_brinde', id)
        .first()
        .then((dados) =>{
            res.send(dados);
        }, function(){
            res.send(new errs.BadRequestError('Foto do produto não encontrada'))
        })
});

//SELECT DE TODAS A FOTOS DE UM PRODUTO
server.get('/fotos/brinde/:id', (req, res, next) => {
    
    const { id } = req.params;

    knex('tbl_foto_brinde')
        .where('id_brinde', id)
        .then((dados) =>{
            res.send(dados);
        }, function(){
            res.send(new errs.BadRequestError('Foto do produto não encontrada'))
        })
});


//SELECT DE UM BRINDE EM ESPECIFICO
server.get('/brinde/:id', (req, res, next) => {

    const { id } = req.params;

    knex('tbl_brinde')
        .where({'tbl_brinde.id_brinde': id, 'tbl_foto_brinde.id_brinde': id})
        .crossJoin('tbl_foto_brinde')
        .then((dados) => {
            res.send(dados);
        }, function(){
            res.send(new errs.BadRequestError('Infelizmente não conseguimos localizar o produto'));
        })
});

//SELECT EM TODOS OS DADOS DE UM CLIENTE FISICO
server.get('/cliente/:id', (req, res, next)=>{

    const {id} = req.params;

    knex('tbl_pessoa_fisica')
        .where({'tbl_pessoa_fisica.id_pessoa_fisica': id, 'tbl_cartao_pessoa_fisica.id_pessoa_fisica': id})
        .crossJoin('tbl_cartao_pessoa_fisica')
        .then((dados)=>{
            res.send(dados);
        }, function(){
            res.send(new errs.BadRequestError('Infelizmente não conseguimos localizar os seus dados'));
        })
});

//INSERIR DE UM CADASTRO NOVO
server.post('/cliente/cadastro', (req, res, next)=>{
    knex('tbl_pessoa_fisica')
        .insert(req.body)
        .then((dados) => {
            res.send({sucesso : true});
        }, function(){
            res.send(new errs.BadRequestError('Falha no cadastro'));
        })
});

//SELECT NAS PROMOÇÕES
server.get('/promocoes', (req, res, next) => {
    knex('tbl_promocao').then((dados) => {
        res.send(dados);
    }, function(){
        res.send(new errs.BadRequestError('Não conseguimos localizar as promoções'));
    })
});

//CADASTRO NA PROMOÇÃO
server.post('/promocao/cadastro', (req, res, next) => {
    knex('tbl_resposta_promocao')
        .insert(req.body)
        .then((dados) => {
            res.send({sucesso : true});        
        }, function(){
            res.send(new errs.BadRequestError('Falha no cadastro'));
        })
});

//SELECT DAS LOJAS
server.get('/lojas', (req, res, next) =>{
    knex('tbl_nossas_lojas').then((dados) =>{
        res.send(dados);
    }, function(){
        res.send(new errs.BadRequestError('Não conseguimos localizar lojas próximas'));
    })
});

//SELECT DE LOGIN - SERÁ EM POST POR SEGURANÇA
server.post('/login', (req, res, next) => {
    const { email, senha} = req.body;

    knex('tbl_pessoa_fisica').where({'email': email, 'senha':senha}).then((dados) =>{
        if(dados[0] == null){
            res.send(new errs.BadRequestError('Dados incorretos'));
        }else{
            res.send(dados);
        }
    }, next)
});

//SELECT DOS POST'S
server.get('/posts', (req, res, next) =>{
    knex('tbl_posts').then((dados) => {
        res.send(dados);
    }, function(){
        res.send(new errs.BadRequestError('Não conseguimos localizar os post'));
    })
});

//SELECT NOS COMENTÁRIOS DO POST
server.get('/comentario/:id', (req, res, next) => {
    const {id} = req.params;
    knex('tbl_comentario')
        .where('id_post', id)
        .then((dados) => {
            res.send(dados);
        }, function(){
            res.send(new errs.BadRequestError('Não conseguimos localizar os comentários desse post'));
        })
});

//INSERIR UM COMENTÁRIO EM UM POST
server.post('/comentario/inserir', (req, res, next) => {

    knex('tbl_comentario')
        .insert(req.body)
        .then((dados) => {
            res.send({sucesso : true})
        }, function (){
            res.send(new errs.BadRequestError('Não foi possível realizar o comentário'));
    })


});

//UPDATE NO CAMPO DE CURTIDA DO POST
server.put('/curtir/:id', (req, res, next) =>{
    const {id} = req.params
    knex('tbl_posts')
    .update(req.body)
    .where('id_post', id)
    .then((dados) => {
        res.send({sucesso : true})
    }, function(){
        res.send(new errs.BadRequestError('Não foi possível curtir o post'));
    })
});

//

////////////////////////////////////////////////////////
