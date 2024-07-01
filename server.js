const { v4: uuidv4 } = require('uuid');
const http = require("http");
const fs = require("fs").promises;
const path = require("path");

const url = require('url');
const querystring = require('querystring');

const mime = require("mime");

const host = "localhost";
const port = 3000;

// const users = [
//   { name: "Oleg", projects: 1, year: 1995 },
//   { name: "Vika", projects: 1, year: 2005 },
// ];

const projects = [
  { id: '1', name: "Valery", title: "GIT" },
  { id: '2', name: "Valery", title: "HTML5" },
  { id: '3', name: "Valery", title: "CSS" },
  { id: '4', name: "Valery", title: "JavaScript" },
  { id: '5', name: "Valery", title: "Node.js" },
];

const requestListener = function (req, res) {
console.log(`сервер запущен URL:http://${host}:${port}`)

  const q = url.parse(req.url, true);

  const params = q.query;
  const reqUrlWithoutParams = trimSlashes(q.pathname);
  
  switch (reqUrlWithoutParams) {
    case "/":
      fs.readFile(path.join(__dirname,"index.html"))  //"public"
        .then((contents) => {
          res.setHeader("Content-Type", "text/html");
          res.writeHead(200);
          res.end(contents);
        })
        .catch((error) => {
          res.writeHead(500);
          res.end(error);
          return;
        });
      break;
    case "/users":
      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(JSON.stringify(users));
      break;
    case "/api/projects":
      res.setHeader("Content-Type", "application/json");
      if(req.method === 'GET'){ 
        if(params.id){
          let project = projects.find(item => item.id === params.id);
          if(project){
            res.writeHead(200);
            res.end(JSON.stringify(project));
          } else {
            res.writeHead(400);
            res.end();
          }
          
        } else {
          res.writeHead(200);
          res.end(JSON.stringify(projects));
        }
        

      } 
      else if(req.method === 'POST'){
        let body = '';
        req.on('data', function(chunk){
          body += chunk;
          // 1e6 === 1 * Math.pow(10, 6) ==~ 1MB
          if(body.length > 1e6){
            res.writeHead(413).end();
            req.connection.destroy();
          }
        });

        req.on('end', function(){
          res.writeHead(200);
          if(body === ''){body = '{}';}
          const params = JSON.parse(body);
          if(params && params.title){
            projects.push({id: uuidv4(), title: params.title});
            res.end(JSON.stringify({result: true, ...params}));
          } else {
            res.end(JSON.stringify({result: false}));
          }
        });
      } else if(req.method === 'DELETE'){
        if(params.id){
          let project = projects.find(item => item.id === params.id);
          if(project){
            const index = projects.map(item => item.id).indexOf(params.id);
            if(index !== -1){
              projects.splice(index, 1);
            }

            res.writeHead(204);
            res.end();
          } else {
            res.writeHead(400);
            res.end();
          }
        } else {
          res.writeHead(400);
          res.end();
        }
      }
      else if(req.method === 'PUT'){
        let body = '';
        req.on('data', function(chunk){
          body += chunk;
          if(body.length > 1e6){
            res.writeHead(413).end();
            req.connection.destroy();
          }
        });

        req.on('end', function(){
          if(body === ''){body = '{}';}
          const paramsBody = JSON.parse(body);
          if(paramsBody && params.id){
            if(isProjectExists(projects, params.id)){
              const index = getProjectIndex(projects, params.id);
              if(index !== -1){
                projects[index] = {
                  id: params.id,
                  ...paramsBody,
                };
              }
              res.writeHead(204);
              res.end();
            } else {
              projects.push({
                id: params.id,
                ...paramsBody,
              });

              res.setHeader('Location', `/api/projects/?id=${params.id}`);
              res.writeHead(201);
              res.end();
            }
          } else {
            res.writeHead(400);
            res.end();
          }
        });
      }
      else if(req.method === 'PATCH'){
        let body = '';
        req.on('data', function(chunk){
          body += chunk;
          if(body.length > 1e6){
            res.writeHead(413).end();
            req.connection.destroy();
          }
        });

        req.on('end', function(){
          if(body === ''){body = '{}';}
          const paramsBody = JSON.parse(body);
          if(paramsBody && params.id){
            if(isProjectExists(projects, params.id)){
              const index = getProjectIndex(projects, params.id);
              if(index !== -1){
                projects[index] = {
                  ...projects[index],
                  id: params.id,
                  ...paramsBody,
                };
              }
              res.setHeader("Content-Type", "application/json");
              res.writeHead(200);
              res.end(JSON.stringify(projects[index]));
            } else {
              res.writeHead(400);
              res.end();
            }
          } else {
            res.writeHead(400);
            res.end();
          }
        });
      }
      else {
        res.writeHead(404);
        res.end();
      }
      break;
    case "/pr":
      res.statusCode = 302;
      res.setHeader("Location", "/projects");
      res.end();
      break;

    default:
      console.log(req.url)
      let fullPathToFile = path.join(__dirname, req.url);//"public"
      fs.access(fullPathToFile, fs.constants.F_OK)
        .then(() => {
          fs.readFile(fullPathToFile)
            .then((contents) => {
              res.setHeader("Content-Type", mime.getType(fullPathToFile));
              res.writeHead(200);
              res.end(contents);
            })
            .catch((error) => {
              res.setHeader("Content-Type", "application/json");
              res.writeHead(500);
              res.end(JSON.stringify({ error: "Ошибка на стороне сервера" }));
              return;
            });
        })
        .catch((error) => {
          res.setHeader("Content-Type", "application/json");
          res.writeHead(404);
          res.end(JSON.stringify({ error: "Страница не найдена" }));
        });
  }
};

function trimSlashes(str){
  return '/' + str.split('/').filter(item => item !== '').join('/');
} 

function isProjectExists(projects, id){
  const index = getProjectIndex(projects, id);
  return index !== -1;
}

function getProjectIndex(projects, id){
  return projects.map(item => item.id).indexOf(id);
}

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Сервер запущен! URL: http://${host}:${port}`);
});