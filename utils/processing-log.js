require('dotenv').config();
const formatDate = require('date-fns/format');
const path = require('path');
const fs = require('fs');

const { saveToFile } = require('./save-to-file');

class ProcessingLog {
  constructor(script) {
    this._script = script;
    this._start = null;
    this._finish = null;
    this._elapsedTime = null;
    this._prs = {};
    this._prCount = null;
    this._logfile = path.resolve(__dirname, `../logs/data-for_${this.getRunType()}_${this._script}.json`);
  }

  sortedPRs() { 
    return Object.keys(this._prs)
      .sort((a, b) => a - b)
      .map(num => ({ number: num, data: this._prs[num] }));
  }

  getRunType() {
    return process.env.PRODUCTION_RUN === 'true' ? 'production' : 'test';
  }

  export() {
    let sortedPRs = this.sortedPRs();
    const [ firstPR, lastPR ] = this.getPrRange(sortedPRs);
    const log = {
      start: this._start,
      finish: this._finish,
      elapsedTime: this._elapsedTime,
      prCount: sortedPRs.length,
      firstPR,
      lastPR,
      prs: sortedPRs
    };
    saveToFile(this._logfile, JSON.stringify(log));
  }

  add(prNum, props) {
    this._prs[prNum] = props;
  }

  getPrRange(prs) {
    if (prs.length) { 
       const firstPR = prs[0].number;
       const lastPR = prs[prs.length - 1].number;
       return [ firstPR, lastPR ];
    } else {
      return ['unknown', 'unknown'];
    }
  }

  start() {
    this._start = new Date();
  }

  finish() {
    this._finish = new Date();
    const minutesElapsed = (this._finish - this._start) / 1000 / 60;
    this._elapsedTime =  minutesElapsed.toFixed(2) + ' mins';
    this.export();
    this.changeFilename();
  }

  changeFilename() {
    const now = formatDate(new Date(), 'YYYY-MM-DDTHHmmss');
    let sortedPRs = this.sortedPRs();
    const [firstPR, lastPR] = this.getPrRange(sortedPRs);
    const newFilename = path.resolve(__dirname, `../logs/${this.getRunType()}_${this._script}_${firstPR}-${lastPR}_${now}.json`);
    fs.rename(this._logfile, newFilename, function(err) {
      if (err) {
        process.exit();
      }
    });
  }
};

module.exports = { ProcessingLog };
