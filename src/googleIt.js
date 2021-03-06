/* eslint-disable no-console */
/* eslint-disable array-callback-return */
const request = require('request');
const fs = require('fs');
const cheerio = require('cheerio');
require('colors');
const { exec } = require('child_process');

const {
  getDefaultRequestOptions,
  getTitleSelector,
  getLinkSelector,
  getSnippetSelector,
  logIt,
  saveToFile,
  saveResponse,
} = require('./utils');

export function errorTryingToOpen(error, stdout, stderr) {
  if (error) {
    console.log(`Error trying to open link in browser: ${error}`);
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  }
}

export function openInBrowser(open, results) {
  if (open !== undefined) {
    // open is the first X number of links to open
    results.slice(0, open).forEach((result) => {
      exec(`open ${result.link}`, errorTryingToOpen);
    });
  }
}

export function getSnippet(elem) {
  return elem.children
    .map((child) => {
      if (!child.data) {
        return child.children.map(c => c.data);
      }
      return child.data;
    })
    .join('');
}

export function display(results, disableConsole, onlyUrls) {
  logIt('\n', disableConsole);
  results.forEach((result) => {
    if (onlyUrls) {
      logIt(result.link.green, disableConsole);
    } else if (result.title) {
      logIt(result.title.blue, disableConsole);
      logIt(result.link.green, disableConsole);
      logIt(result.snippet, disableConsole);
      logIt('\n', disableConsole);
    } else {
      logIt('Result title is undefined.');
    }
  });
}

export function getResults({
  data,
  noDisplay,
  disableConsole,
  onlyUrls,
  titleSelector,
  linkSelector,
  snippetSelector,
}) {
  const $ = cheerio.load(data);
  let results = [];

  const titles = $(getTitleSelector(titleSelector)).contents();
  titles.each((index, elem) => {
    if (elem.data) {
      results.push({ title: elem.data });
    } else {
      results.push({ title: elem.children[0].data });
    }
  });

  $(getLinkSelector(linkSelector)).map((index, elem) => {
    if (index < results.length) {
      results[index] = Object.assign(results[index], {
        link: elem.attribs.href,
      });
    }
  });

  $(getSnippetSelector(snippetSelector)).map((index, elem) => {
    if (index < results.length) {
      results[index] = Object.assign(results[index], {
        snippet: getSnippet(elem),
      });
    }
  });

  if (onlyUrls) {
    results = results.map(r => ({ link: r.link }));
  }
  if (!noDisplay) {
    display(results, disableConsole, onlyUrls);
  }
  return results;
}

export function getResponseBody({
  fromFile: filePath, options, htmlFileOutputPath, query, limit, userAgent, start,
}) {
  return new Promise((resolve, reject) => {
    if (filePath) {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          return reject(new Error(`Erorr accessing file at ${filePath}: ${err}`));
        }
        return resolve(data);
      });
    } else {
      const defaultOptions = getDefaultRequestOptions({
        limit, query, userAgent, start,
      });
      request(Object.assign({}, defaultOptions, options), (error, response, body) => {
        if (error) {
          reject(new Error(`Error making web request: ${error}`));
        }
        saveResponse(response, htmlFileOutputPath);
        resolve(body);
      });
    }
  });
}

function googleIt(config) {
  const {
    output,
    open,
    returnHtmlBody,
    titleSelector,
    linkSelector,
    snippetSelector,
    start,
  } = config;
  return new Promise((resolve, reject) => {
    getResponseBody(config).then((body) => {
      const results = getResults({
        data: body,
        noDisplay: config['no-display'],
        disableConsole: config.disableConsole,
        onlyUrls: config['only-urls'],
        titleSelector,
        linkSelector,
        snippetSelector,
        start,
      });
      saveToFile(output, results);
      openInBrowser(open, results);
      if (returnHtmlBody) {
        return resolve({ results, body });
      }
      return resolve(results);
    }).catch(reject);
  });
}

export default googleIt;
