"use strict";

/* eslint-disable no-console */
var fs = require('fs');

var _process$env = process.env,
    GOOGLE_IT_TITLE_SELECTOR = _process$env.GOOGLE_IT_TITLE_SELECTOR,
    GOOGLE_IT_LINK_SELECTOR = _process$env.GOOGLE_IT_LINK_SELECTOR,
    GOOGLE_IT_SNIPPET_SELECTOR = _process$env.GOOGLE_IT_SNIPPET_SELECTOR; // NOTE:
// I chose the User-Agent value from http://www.browser-info.net/useragents
// Not setting one causes Google search to not display results

var defaultUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:34.0) Gecko/20100101 Firefox/34.0';
var defaultLimit = 10;
var defaultStart = 0;

var getDefaultRequestOptions = function getDefaultRequestOptions(_ref) {
  var limit = _ref.limit,
      query = _ref.query,
      userAgent = _ref.userAgent,
      start = _ref.start;
  return {
    url: 'https://www.google.com/search',
    qs: {
      q: query,
      num: limit || defaultLimit,
      start: start || defaultStart
    },
    headers: {
      'User-Agent': userAgent || defaultUserAgent
    }
  };
};

var titleSelector = '#rso > div > div > div > div > div > div.r > a > h3';
var linkSelector = 'div.rc > div.r > a';
var snippetSelector = '#rso > div > div > div > div > div > div.s > div > span';

var getTitleSelector = function getTitleSelector(passedValue) {
  return passedValue || GOOGLE_IT_TITLE_SELECTOR || titleSelector;
};

var getLinkSelector = function getLinkSelector(passedValue) {
  return passedValue || GOOGLE_IT_LINK_SELECTOR || linkSelector;
};

var getSnippetSelector = function getSnippetSelector(passedValue) {
  return passedValue || GOOGLE_IT_SNIPPET_SELECTOR || snippetSelector;
};

var logIt = function logIt(message, disableConsole) {
  if (!disableConsole) {
    console.log(message);
  }
};

var saveToFile = function saveToFile(output, results) {
  if (output !== undefined) {
    fs.writeFile(output, JSON.stringify(results, null, 2), 'utf8', function (err) {
      if (err) {
        console.error("Error writing to file ".concat(output, ": ").concat(err));
      }
    });
  }
};

var saveResponse = function saveResponse(response, htmlFileOutputPath) {
  if (htmlFileOutputPath) {
    fs.writeFile(htmlFileOutputPath, response.body, function () {
      console.log("Html file saved to ".concat(htmlFileOutputPath));
    });
  }
};

module.exports = {
  defaultUserAgent: defaultUserAgent,
  defaultLimit: defaultLimit,
  defaultStart: defaultStart,
  getDefaultRequestOptions: getDefaultRequestOptions,
  getTitleSelector: getTitleSelector,
  getLinkSelector: getLinkSelector,
  titleSelector: titleSelector,
  linkSelector: linkSelector,
  snippetSelector: snippetSelector,
  getSnippetSelector: getSnippetSelector,
  logIt: logIt,
  saveToFile: saveToFile,
  saveResponse: saveResponse
};