import { Router } from "@tsndr/cloudflare-worker-router";
import { toHex } from "@cosmjs/encoding";

import { name, version } from "../package.json";
import * as secp from "@noble/secp256k1";
import * as jose from "jose";

const router = new Router();

router.cors();

router.get("/version", (handle) => {
  handle.res.body = { name, version, env: handle.env };
});

router.get("/test", (handle) => {
  console.log(handle);
  handle.res.body = { env: handle.env };
});

router.get("/", async (handle) => {
  const payload = {
    name: "JWT",
    iss: "cf-workers",
  };

  const algorithm = "ES256";
  const keyPair = await jose.generateKeyPair(algorithm);
  const ecPrivateKey = keyPair.privateKey;
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: algorithm })
    .setExpirationTime("120s")
    .sign(ecPrivateKey);

  const secpKey = toHex(secp.utils.randomPrivateKey());

  handle.res.body = { token, secpKey };
});

router.post("/", async (handle) => {
  const body = handle.req.body;

  handle.res.body = { body };
});

export default {
  async fetch(request: Request, env: unknown): Promise<Response> {
    return router.handle(env, request);
  },
};
