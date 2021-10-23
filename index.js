/**
 * Required External Modules
 */

const express = require("express");
const path = require("path");
const multer = require('multer');
const fs = require('fs');
const Encryption = require('./encryption.js');

/**
 * App Variables
 */

const app = express();
const encryption = new Encryption();
const key = "seguranca_sistemas";
const port = process.env.PORT || "8000";
const tiposInformacao = {
    "texto": {valor: "texto", descricao: "Texto", selected: true, endpoint: "texto"},
    "midia": {valor: "midia", descricao: "Arquivo de mídia (imagem, documento)", selected: false, endpoint: "midia", tiposMidia: [
        {valor: "pdf", descricao: "PDF", selected: false},
        {valor: "png", descricao: "Imagem", selected: true},
    ]}
};
const render = { 
    title: "Início" , 
    actionCriptografar: `http://localhost:${port}/criptografar`,
    actionDescriptografar: `http://localhost:${port}/descriptografar`,
    tiposCriptografia: [
        // {valor: "idea", descricao: "IDEA", selected: false, data: JSON.stringify([tiposInformacao.texto])},
        {valor: "base64", descricao: "Base64", selected: true, data: JSON.stringify([tiposInformacao.texto, tiposInformacao.midia])},
        {valor: "blowfish", descricao: "Blowfish", selected: false, data: JSON.stringify([tiposInformacao.texto])}
    ]
};

/**
 *  App Configuration
 */

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
  }
});

const upload = multer({ 
    storage,
    limits: { fieldSize: 2 * 1024 * 1024 }
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

app.use(upload.any());


/**
 * Routes Definitions
 */

app.get("/", (req, res) => {
    res.render("index", render);
});

app.post('/criptografar/texto', (req, res) => {
    let result = "";
    if (req.body.tipoCriptografia == 'base64') {
        result = new Buffer(req.body.texto).toString(req.body.tipoCriptografia);
    } else {
        result = encryption.encrypt(req.body.texto, key);
    }

    res.status(200).json({result});
});

app.post('/descriptografar/texto', (req, res) => {
    let result = "";
    if (req.body.tipoCriptografia == 'base64') {
        result = new Buffer(req.body.texto, req.body.tipoCriptografia).toString('ascii');
    } else {
        result = encryption.decrypt(req.body.texto, key);;
    }

    res.status(200).json({result});
});

app.post('/criptografar/midia', upload.single('midia'), function(req, res) {
    let result = "";
    let bitmap = fs.readFileSync(req.files[0].path);
    result = new Buffer(bitmap).toString('base64');

    res.status(200).json({result});
});

app.post('/descriptografar/midia', function(req, res) {
    if (req.body.tipoCriptografia == 'base64') {
        fs.writeFileSync(`public/uploads/image.${req.body.tipoMidia || 'png'}`, new Buffer(req.body.texto, 'base64'));

        res.download(`${__dirname}/public/uploads/image.${req.body.tipoMidia || 'png'}`);
    } else {
        res.status(500).json({result: "Erro ao descriptografar"});
    }
});

/**
 * Server Activation
 */

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});