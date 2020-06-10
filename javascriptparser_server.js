//In order to create the docker manually
//docker build -t dockerjsdev .
//docker run -p 49161:8081 -d dockerjsdev

'use strict';

const express = require("express");
const acorn = require('acorn-loose');
const multer  = require('multer');
const upload = multer();
const compression = require('compression');
const os = require("os")
const cluster = require("cluster")

// Constants
const PORT = process.env.PORT || 8082; //This allows dynamic assignation in execution time
const HOST = '0.0.0.0';

const cpus =  os.cpus().length;
const clusterWorkerSize = cpus * 4;


var currentDate = new Date();
currentDate.getDate();
console.log(`Starting Javascript Parser with ${cpus} cpus and a total of ${clusterWorkerSize} workers on http://${HOST}:${PORT} at ${currentDate}`);

if (clusterWorkerSize > 1) {
  if (cluster.isMaster) {
    for (let i=0; i < clusterWorkerSize; i++) {
      cluster.fork()
    }
 
    cluster.on("exit", function(worker) {
    console.log("Worker", worker.id, " has exitted.")
    })
  } else {
	StartListener();
  }
  
} else {
	StartListener();
}

function StartListener()
{
	const app = express()
    app.use(compression());
	
    app.post('/', upload.single('javascriptfile'), function (req, res, next) 
	{  
		Post(req, res, process.pid);
	});
	  
	app.get("/hc", (req, res, next) => 
	{   
		res.sendStatus(200);
		res.end();
	});
 
    app.listen(PORT, HOST, function () {
		console.log(`Javascript Parser ExpressJS server listening on port ${PORT} with the single worker ${process.pid}`)
	});
}

function Post(req, res, processpid)
{
	try 
	{        
		req.connection.setTimeout(600000);
		res.setHeader("Content-Type", "multipart/form-data");   
		
		var result = Parse(req.file.buffer, req.query.fileName, req.query.parseMode, processpid);		
		res.send(result);
	} 
	catch (e) 
	{
		res.status(400).send(e.message);
		res.end();
	}	
}

function Parse(data, fileName, parseMode, worker)
{     	
	
	var currentDate = new Date();
	currentDate.getDate();
	console.log(`Starting parse of ${fileName} at ${currentDate} using worker ${worker}`);
	
	var comments = [], tokens = [];
	
	var acornModuleOptions = {locations:true, sourceType: "module", ranges: "true", onComment: comments, onToken: tokens};
	var acornScriptOptions = {locations:true, sourceType: "script", ranges: "true", onComment: comments, onToken: tokens};
	
	var a=0;
    var b=0;

	if (data != null)
	{
		var parsed = '';
		switch (parseMode)
		{
			case 'script':   		
				parsed = acorn.parse(data , acornScriptOptions);
				
				break;
			case 'module':
				parsed = acorn.parse(data , acornModuleOptions);
				
				break;
			default:
				console.log('Parse Mode not defined, use script or module');
				
				break;s
		}
	}        
    
    currentDate.getDate();
	console.log(`Finished parse of ${fileName} at ${currentDate} using worker ${worker}`);
	return { parsed, tokens, comments};
}