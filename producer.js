/* This file generates 200,000 fake log entries and streams them to an HTTP server
   (http://localhost:3000/ingest), using backpressure handling so it doesn't
   overwhelm the connection.
 */

import http from "http";

const BatchSize = 200000;
const url = "http://localhost:3000/ingest";

const req = http.request(url, {
    method: "POST",
    headers: { "content-type": "application/x-ndjson" }
}, (res) => {
    console.log(`server responded with status code ${res.statusCode}`)
    res.resume()
})

req.on("error", (err) => console.error(`error occured ${err.message}`))

let count = 0;
//function for creating fake logs
function writeLogs() {
    let canwrite = true;

    while (count < BatchSize && canwrite) {
        const logEntry = JSON.stringify({
            timestamp: new Date().toISOString(),
            service: 'payment-gateway',
            level: Math.random() > 0.9 ? 'ERROR' : 'INFO',
            message: `Transaction processed for user_${Math.floor(Math.random() * 1000)}`
        }) + '\n';

        canwrite = req.write(logEntry);
        count++;
    }

    if (count < BatchSize) {
        req.once("drain", writeLogs)
    } else {
        req.end()
        console.log(`Successfully streamed ${BatchSize} logs.`);
    }

}

console.log('Starting log stream...');
writeLogs();