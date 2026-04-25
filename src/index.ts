import { createApp } from "./server/app";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

createApp().listen(port, host, () => {
  console.log(`Colony mainframe listening on http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
});
