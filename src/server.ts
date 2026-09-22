import { createApp } from "./app";
import { appConfig } from "./config";
import { logLine } from "./logger";
import {createProvider} from "./generation-engine/index"

const config = appConfig(process.env);
const provider = createProvider(config);

if(!provider)
        throw new Error("Gemini configuration missing.")

const app = createApp({ providers: provider, config });

app.listen(config.port, ()=>{
    logLine({ msg: "listening", port: config.port });
})
