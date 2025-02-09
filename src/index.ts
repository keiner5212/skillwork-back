import dotenv from "dotenv";
import { createDebugger } from "./utils/debugConfig";
import { App } from "./app";
import { getLocalIP } from "./utils/net/LocalIp";

// CONFIGURATION
dotenv.config();
const PORT: number = parseInt(process.env.PORT ?? '3000', 10);

// APP
const app = new App().config();

// DEBUGGER
const serverDebugger = createDebugger('server');


// LISTEN
app.listen(PORT, () => {
    const ip = getLocalIP();
    serverDebugger(`Server running, check:\nhttp://localhost:${PORT}\nhttp://${ip}:${PORT}`);
});

export default app