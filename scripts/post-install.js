/**
 * Script to run after npm install
 *
 * Copy service worker to the projects public folder
 */

"use strict";

const fs = require("fs");

const publicPath = process.env.INIT_CWD + "/public";
const serviceWorkerwFolderPath = publicPath + "/next-google-analytics";
const serviceWorkerwPath = serviceWorkerwFolderPath + "/service-worker.js";

if (fs.existsSync(publicPath)) {
  if (!fs.existsSync(serviceWorkerwFolderPath)) {
    fs.mkdirSync(serviceWorkerwFolderPath);
  } else if (fs.existsSync(serviceWorkerwPath)) {
    try {
      fs.unlinkSync(serviceWorkerwPath);
    } catch (err) {
      console.error(err);
    }
  }

  fs.writeFileSync(serviceWorkerwPath, fs.readFileSync("service-worker.js"));
}
