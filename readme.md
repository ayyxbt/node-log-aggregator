# Log Stream Demo
 
A small practice project exploring Node.js streams, HTTP backpressure, and NDJSON log ingestion.
 
`producer.js` generates a large batch of fake log entries and streams them over HTTP to `server.js`, which listens for and receives them at `/ingest`. The producer handles backpressure manually pausing writes when the connection buffer fills up and resuming once it drains instead of blindly writing everything at once.
 
## Why this project
 
This started as a way to understand:
- How Node's writable streams signal backpressure via `write()`'s return value and the `"drain"` event
- How to stream large volumes of data over HTTP without loading it all into memory at once
- NDJSON (newline-delimited JSON) as a format for log/event ingestion
## Project structure
 
```
.
├── producer.js     # generates fake logs and streams them to the server
├── server.js       # receives the NDJSON log stream at /ingest
├── package.json
└── README.md
```
 
## Requirements
 
- Node.js (project uses ES modules — see `"type": "module"` in `package.json`)
## Getting started
 
1. Clone the repo and install dependencies (if any):
```bash
   npm install
```
 
2. Start the server in one terminal:
```bash
   node server.js
```
 
3. Run the producer in another terminal:
```bash
   node producer.js
```
 
The producer will stream a batch of fake `payment-gateway` log entries (JSON lines, ~10% marked as `ERROR`) to the server and log progress as it goes.
 
## How the backpressure handling works
 
`producer.js` doesn't call `req.write()` in a plain loop. Instead:
- It writes log entries until `req.write()` returns `false` (meaning the internal buffer is full)
- It then pauses and waits for the `"drain"` event before resuming
- This keeps memory usage bounded even when generating a very large number of log entries
## Status
 
This is a learning/practice project — not production-ready. Next steps might include batching writes into larger chunks for better throughput, adding compression, or having the server actually parse and store the incoming logs.
