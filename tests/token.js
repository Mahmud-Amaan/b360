require("dotenv").config();

const http = require("http");
const fs = require("fs");
const path = require("path");
const twilio = require("twilio");

const AccessToken = twilio.jwt.AccessToken;
const VoiceGrant = AccessToken.VoiceGrant;

const PORT = 3002;

const server = http.createServer(async (req, res) => {

    // ✅ Serve Twilio Call Tester
    if (req.method === "GET" && req.url === "/") {
        const html = fs.readFileSync(path.join(__dirname, "call.html"), "utf8");
        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(html);
    }

    // ✅ Serve Vapi Call Tester
    if (req.method === "GET" && req.url === "/vapi") {
        const html = fs.readFileSync(path.join(__dirname, "vapi.html"), "utf8");
        res.writeHead(200, { "Content-Type": "text/html" });
        return res.end(html);
    }

    // ✅ Serve Local Vapi Bundle
    if (req.method === "GET" && req.url === "/vapi-bundle.js") {
        const js = fs.readFileSync(path.join(__dirname, "vapi-bundle.js"));
        res.writeHead(200, { "Content-Type": "application/javascript" });
        return res.end(js);
    }

    // ✅ Serve Twilio SDK
    if (req.method === "GET" && req.url === "/twilio.min.js") {
        const js = fs.readFileSync(path.join(__dirname, "twilio.min.js"));
        res.writeHead(200, { "Content-Type": "application/javascript" });
        return res.end(js);
    }

    // ✅ Config endpoint (for Vapi Public Key & Base URL)
    if (req.method === "GET" && req.url === "/config") {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({
            vapiPublicKey: process.env.VAPI_PUBLIC_API_KEY || "your-public-key",
            baseUrl: process.env.NEXT_PUBLIC_APP_URL
        }));
    }

    // ✅ Proxy to get real agents from the main app
    if (req.method === "GET" && req.url === "/api/agents") {
        const tunnelUrl = process.env.NEXT_PUBLIC_APP_URL;
        try {
            const agentRes = await fetch(`${tunnelUrl}/api/vapi/agents-list`);
            const agentData = await agentRes.json();
            res.writeHead(200, { "Content-Type": "application/json" });
            return res.end(JSON.stringify(agentData));
        } catch (e) {
            console.error("Proxy Error:", e);
            res.writeHead(500);
            return res.end(JSON.stringify({ error: "Failed to bridge to main app" }));
        }
    }

    // ✅ Proxy to get assistant config
    if (req.method === "POST" && req.url === "/api/assistant") {
        const tunnelUrl = process.env.NEXT_PUBLIC_APP_URL;
        let body = "";
        req.on("data", chunk => { body += chunk; });
        req.on("end", async () => {
            try {
                const assistantRes = await fetch(`${tunnelUrl}/api/vapi/assistant`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body
                });
                const assistantData = await assistantRes.json();
                res.writeHead(200, { "Content-Type": "application/json" });
                return res.end(JSON.stringify(assistantData));
            } catch (e) {
                console.error("Proxy Error:", e);
                res.writeHead(500);
                return res.end(JSON.stringify({ error: "Failed to bridge to main app" }));
            }
        });
        return;
    }

    // ✅ Token endpoint
    if (req.method === "GET" && req.url === "/token") {
        try {
            const token = new AccessToken(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_API_KEY,
                process.env.TWILIO_API_SECRET,
                { identity: "browser-client" }
            );

            const voiceGrant = new VoiceGrant({
                outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
                incomingAllow: true,
            });

            token.addGrant(voiceGrant);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ token: token.toJwt() }));
        } catch (err) {
            res.writeHead(500);
            res.end(err.message);
        }
        return;
    }

    // ❌ Anything else
    res.writeHead(404);
    res.end("Not found");
});

server.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
console.log({
    ACCOUNT: process.env.TWILIO_ACCOUNT_SID,
    API_KEY: process.env.TWILIO_API_KEY,
    API_SECRET: process.env.TWILIO_API_SECRET,
    TWIML_APP: process.env.TWILIO_TWIML_APP_SID,
});
