const http = require('node:http');
const fs = require('node:fs');
const path = require("path")

const getAllFiles = function(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath)

  arrayOfFiles = arrayOfFiles || []

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file))
    }
  })

  return arrayOfFiles
}

const hostname = '127.0.0.1';
const port = 3000;

const servableFiles = [
    "/page.js",
    "/node_modules/three/build/three.module.js",
    "/node_modules/three/examples/jsm/Addons.js"
];
getAllFiles('./node_modules/three/examples/').forEach(file => {
    servableFiles.push('/' + file.replaceAll('\\', "/"));
});
console.log(servableFiles);

const server = http.createServer((req, res) => {
    const url = req.url;
    if (servableFiles.includes(url)) {
        fs.readFile("." + servableFiles[servableFiles.indexOf(url)], 'utf8', (err, data) => {
            if (err) {
                console.log(err);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end();
            } else {
                res.statusCode = 200;
                if (url.includes('.js')) {
                    res.setHeader('Content-Type', 'text/javascript');
                } else if (url.includes('.json')) {
                    res.setHeader('Content-Type', 'application/json');
                } else {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end();
                }
                res.end(data);
            }
        });
    } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>My first three.js app</title>
            <style>
                body { margin: 0; }
            </style>
        </head>
        <body>
            <script type="importmap">
            {
                "imports": {
                    "three": "./node_modules/three/build/three.module.js",
                    "addons": "./node_modules/three/examples/jsm/Addons.js"
                }
            }
            </script>
            <script type="module" src="page.js"></script>
        </body>
        </html>
        `);
    }
});

server.listen(port);
