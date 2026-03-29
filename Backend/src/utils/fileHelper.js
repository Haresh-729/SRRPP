const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.resolve(filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlink(fullPath, (err) => {
      if (err) logger.error(`Failed to delete file: ${fullPath} | ${err.message}`);
    });
  }
};

const getFileUrl = (filePath) => {
  if (!filePath) return null;
  return filePath.replace(/\\/g, '/');
};

module.exports = { deleteFile, getFileUrl };