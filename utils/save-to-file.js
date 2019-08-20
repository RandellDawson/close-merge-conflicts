const fs = require('fs');
var getDirName = require('path').dirname;

const saveToFile = (fileName, data) => {
  const targetDir = getDirName(fileName);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(fileName, data);
}

module.exports = { saveToFile };
