const ipfsClient = require('ipfs-http-client')
const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const JSONdb = require('simple-json-db');
const { post } = require('ipfs-utils/src/http')
const db = new JSONdb('./database.json');

const ipfs = new ipfsClient({host:'localhost',port:'5001',protocol:'http'})
const app = express()

app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:true}))
app.use(fileUpload())



function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

let posts = [];

    // for(var i=0;i<5;i++){
    //     posts.push({
    //         title:"Title"+i,
    //         text:"this is a test article"
    //     })
    // }

    posts.push({
        views:getRandomInt(1000),
        title:"Guillermo Lasso",
        text:"Guillermo Alberto Santiago Lasso Mendoza born 16 November 1955) is an Ecuadorian businessman and politician who is the president-elect of Ecuador."
    })

    posts.push({
        views:getRandomInt(1000),
        title:"Hideki Matsuyama",
        text:"Hideki Matsuyama is a Japanese professional golfer who plays on the PGA Tour. He is the first-ever Japanese professional golfer to win a men's major golf championship – the 2021 Masters Tournament."
    })

    posts.push({
        views:getRandomInt(1000),
        title:"Minella Times",
        text:"Minella Times (foaled 4 March 2013) is an Irish-bred Thoroughbred racehorse who competes in National Hunt racing. In 2021, he won the Grand National under Rachael Blackmore, becoming the first horse ridden by a female jockey to win the race."
    })

    posts.push({
        views:getRandomInt(1000),
        title:"2021 Myanmar protests",
        text:"Protests in Myanmar, known locally as the Spring Revolution, began in early 2021 in opposition to the coup d'état on 1 February, staged by Min Aung Hlaing, the commander-in-chief of the country's armed forces, the Tatmadaw. As of 16 April 2021, at least 728 protesters and bystanders, of which at least 44 were children, have been killed by military or police forces and at least 3,141 people detained."
    })


app.get('/',(req,res)=>{
    // db.set('test', 'name');
    
    

    res.render('home',{posts:posts})
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
    
    res.render('feed',{posts:posts})
    
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