/**
 * Script to run after npm install
 *
 * Remove service worker from the projects public folder
 */

"use strict";

const fs = require("fs");

const publicPath = process.env.INIT_CWD + "/public";
const serviceWorkerwFolderPath = publicPath + "/next-google-analytics";
const serviceWorkerwPath = serviceWorkerwFolderPath + "/service-worker.js";

if (fs.existsSync(serviceWorkerwPath)) {
  try {
    fs.unlinkSync(serviceWorkerwPath);
  } catch (err) {
    console.error(err);
  }
}

if (fs.existsSync(serviceWorkerwFolderPath)) {
  fs.rmdirSync(serviceWorkerwFolderPath);
}
