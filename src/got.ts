import got from "got";

const gotInstance = got.extend({
  timeout: 4000,
  headers: {
    accept: "text/plain",
    "user-agent": `Mozilla/5.0 rsshub-launcher(https://github.com/fengkx/rsshub-launcher)`,
  },
});

export { gotInstance as got };
