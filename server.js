const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NOME
})

db.connect(err => {
    if (err) {
        console.error(
            'Erro ao conectar com o banco de dados', err)
        return;
    }
    console.log('Conectado ao banco de dados');
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false}
}));

const authenticateSession = (req, res, next) =>{
    if(!req.session.userId){
        return res.status(401).send("Acesso negado, faça login para continuar")
    }
    next();
}

app.post('/login', req, res => {
    const { cbf, senha } = req.body;

    db.query('SELECT * FROM usuarios WHERE cpf = ?', [cbf], async (err, results) => {

   if(err) return res.statusCode(500).send('Server com erro');
   if(results.length === 0) return res.status(500).send(
    'CPF ou senhas não encontrado');

    const usuarios = results[0];
    const senhaCorreta = await bcrypt.compare(
        senha, usuarios.senha)
        if (!senhaCorreta) return res.status(500).send('CPF ou senha incorreta ')

            req.session.userId = usuarios.IdUsuarios;
            console.log('idUsario:', usuarios.IdUsuarios);
            res.json({ message: 'Login bem-sucedido'})
})

    })




    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(
        'servidor rodando nesta porta'));
