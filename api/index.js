// api/index.js — Vercel Serverless Function Entry Point
//
// This wrapper is committed to git so Vercel detects it.
// During deployment, esbuild bundles the Express API into api/handler.js,
// and this file re-exports it in the format Vercel expects (module.exports = fn).

const app = require('./handler.js');
module.exports = app.default || app;
