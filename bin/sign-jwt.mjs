#!/usr/bin/env node

import { SignJWT, importPKCS8 } from 'jose';
import { readFile } from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const payload = JSON.parse(process.argv[2]),
      privateKeyPath = path.join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'private_key.pem'),
      privateKey = await importPKCS8(await readFile(privateKeyPath, 'utf8'), 'RS256');

const jwt = await new SignJWT(payload)
   .setProtectedHeader({ alg: 'RS256' })
   .sign(privateKey);

console.info(jwt);
