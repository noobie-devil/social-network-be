import mongoose from "mongoose";
import * as process from "process";
import os from "os";

const _SECOND = 5000
// Count connect
export const countConnect = () => {
    const numConnection = mongoose.connections.length
    console.log(`Number of connections::${numConnection}`)
}

// Check overload
export const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length
        const numCores = os.cpus().length
        const memoryUsage = process.memoryUsage().rss;

        // Example maximum number of connections based on number osf cores
        const maxConnections = numCores * 5;
        console.log(`Active connections: ${numConnection}`)
        console.log(`Memory usage: ${memoryUsage/1024/1024} MB`)

        if(numConnection > maxConnections) {
            console.log(`Connection overload detected`)
        }
    }, _SECOND)
}
