import http from "http";
import fs from "fs";
import zlib from "zlib"
import { pipeline } from "stream/promises";
//create server
const server = http.createServer(async (req, res) => {
    if (req.method === "POST" && req.url === "/ingest") {
        const timestamp = Date.now();
        const destPath = `./data/logs-${timestamp}.ndjson.gz`;

        //create a writeable stream to disk
        const fileWriteStream = fs.createWriteStream(destPath);
        const gzipStream = zlib.createGzip();

        try {
            console.log("receiving log stream")

            await pipeline(
                req,
                gzipStream,
                fileWriteStream
            );

            console.log(`Stream successfully compressed and saved to ${destPath}`);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Logs ingested successfully\n');

        } catch (err) {
            console.error('Pipeline failed.', err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error\n');
        }

    } else {
        res.writeHead(404);
        res.end('Not Found\n');
    }

})

server.listen(3000, () => {
    console.log("Log Aggregator running!!");
});