import { createApp } from "./app";
import { appConfig } from "./config";
import { logLine } from "./logger";

const config = appConfig(process.env);
const app = createApp(config);

app.listen(config.port, ()=>{
    logLine({ msg: "listening", port: config.port });
})
