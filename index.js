const express = require('express');
const memjs = require('memjs');
const axios = require("axios");
const HashRing = require('node-hashring');

//Setting different servers
const servers = ['memcached:11211','memcached2:11211','memcached3:11211'];
const serverMap = {}
servers.forEach((server, index) => serverMap[server] = index);

const client = memjs.Client.create(servers.join(','));
//const client = memjs.Client.create('memcached:11211');

//Setting the hash ring
const hashRing = new HashRing(servers);

client.getServer = (key) => serverMap[hashRing.findNode(key)];

const responseTime = require("response-time");

const port = 3000;
const app = express();

app.use(responseTime());

app.get("/character/:id", async(req,res,next) =>{
    try {
        var reply = await client.get(req.params.id);
        console.log(reply);
        if(reply.value == null){
            
            const response = await axios.get(
                "https://rickandmortyapi.com/api/character/" + req.params.id
            );
            console.log(response.data);
            await client.set(req.params.id, response.data.name, {expires:600}); 
            console.log("db");
            res.send(response.data.name); 
        }
        else{
            console.log("cache");
            return res.send(reply.value.toString());     
        }
        
    } catch(error){
        console.log(error);
        res.send(error.message);
    }
});

app.listen(port, () =>{
    console.log("Server running on port", port);
});