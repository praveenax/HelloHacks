const ipfsClient = require('ipfs-http-client')
const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const JSONdb = require('simple-json-db');
const db = new JSONdb('./database.json');

const ipfs = new ipfsClient({host:'localhost',port:'5001',protocol:'http'})
const app = express()

app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}))
app.use(fileUpload())

app.get('/',(req,res)=>{
    // db.set('test', 'name');
    res.render('home')
})

app.get('/save',(req,res)=>{
    db.set('test', 'name');
    res.render('home')
})

app.get('/savepost',(req,res)=>{
    // res.render('home')
    fetchStatus()
    res.json({status:'success'})
})

app.post('/upload',(req,res)=>{
    // res.render('home')
    const file = req.files.file
    const filename = req.body.filename;
    const filePath = 'files/'+filename;
    file.mv(filePath,async (err)=>{
        if(err){
            console.log('Error: failed to download')
            return res.status(500).send(err)
        }
        const fileHash = await addFile(filename,filePath)
        fs.unlink(filePath,(err)=>{
            if(err) console.log(err)
        })

        const data = await getFile(fileHash)

        res.render('upload',{filename,fileHash})
    })
})

app.get('/feed',(req,res)=>{
    res.render('feed')
    
})


app.get('/connection',(req,res)=>{
    res.render('connection')
    
})

//QmXKsFjFnTX3d7wjqbdotq1hko5LcQhE6K2pLweGzAnJ3R
const addFile = async (filename,filePath) => {
    const file = fs.readFileSync(filePath)
    const fileAdded = await ipfs.add({path:filename,content:file})
    console.log(fileAdded)
    const fileHash = fileAdded.cid;
    return fileHash
}

const getFile = async (hash) => {
    // const stream = node.cat('QmXKsFjFnTX3d7wjqbdotq1hko5LcQhE6K2pLweGzAnJ3R')
    const stream = ipfs.cat(hash)
    let data = ''

    for await (const chunk of stream) {
    // chunks of data are returned as a Buffer, convert it back to a string
    data += chunk.toString()
    }

    console.log(data)
}

const fetchStatus = async () => { 
    var data = db.get('key');
    const fileAdded = await ipfs.add({path:'saveprav',content:data})
    console.log(fileAdded)
}

app.listen(3002,()=>{
    console.log('Server is listening to 3002!')
})