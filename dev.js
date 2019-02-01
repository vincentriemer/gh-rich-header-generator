const http = require("http");
const path = require("path");
const fs = require("fs");
const { parse } = require("url");

function serveStaticClientFile(req, res) {
  // parse URL
  const parsedUrl = parse(req.url);
  // extract URL path
  let pathname = `./client${parsedUrl.pathname}`;
  // based on the URL path, extract the file extention. e.g. .js, .doc, ...
  let ext = path.parse(pathname).ext;
  if (ext === "") ext = ".html";
  // maps file extention to MIME typere
  const map = {
    ".ico": "image/x-icon",
    ".html": "text/html",
    ".js": "text/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".svg": "image/svg+xml",
    ".pdf": "application/pdf",
    ".doc": "application/msword"
  };

  fs.exists(pathname, function(exist) {
    if (!exist) {
      // if the file is not found, return 404
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }

    // if is a directory search for index file matching the extention
    if (fs.statSync(pathname).isDirectory()) pathname += "index" + ext;

    // read file from file system
    fs.readFile(pathname, function(err, data) {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        // if the file is found, set Content-type and send data
        res.setHeader("Content-type", map[ext] || "text/plain");
        res.setHeader("Cache-Control", "max-age=15");
        res.end(data);
      }
    });
  });
}

function requestHandler(req, res) {
  const { query, pathname } = parse(req.url, true);

  switch (pathname) {
    case "/header": {
      require("./server/index")(req, res);
    }
    default: {
      serveStaticClientFile(req, res);
    }
  }
}

const app = http.createServer(requestHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`Dev server listening on port ${PORT}`);
});
