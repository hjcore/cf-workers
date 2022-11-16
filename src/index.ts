import { Router } from "itty-router";
import { error, json, withContent } from "itty-router-extras";
import { createCors } from "itty-cors";
import pkg from "../package.json";

const { preflight, corsify } = createCors({
  methods: ["GET", "POST", "DELETE"],
  origins: ["*"],
  maxAge: 86400,
  headers: {},
});

const router = Router();

router.all("*", preflight);

router.get("/version", () => json({ name: pkg.name, version: pkg.version }));

router.get("/", async (req) => {
  const ip = (req as any).headers.get("CF-Connecting-IP");
  return new Response(ip);
});

router.get("/json", async (req) => {
  const ip = (req as any).headers.get("CF-Connecting-IP");
  return json({ ip });
});

router.post("/", withContent, async (req, env) => {
  return json({ env });
});

export default {
  fetch: (...args) =>
    router
      .handle(...args)
      .catch((err) => error(500, err.stack))
      .then(corsify),
};
