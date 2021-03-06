/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-17 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Will Weatherill                                                  |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  10 March 2017

*/

const path = './';

var types = {
  referrals: require(path + 'referrals'),
  discharges: require(path + 'discharge')
};

function toDetail(source, openEhrDocument) { 
  const documentHandler = getDocumentHandler(openEhrDocument);
    
  var canonicalDocument = {
    source: source,
    documentType: documentHandler.getDocumentType()
  };

  var canonicalFieldName;
  var childFieldMap;
  var element;

  var indexStart;
  var indexEnd;
  var indexValue;
  var childElement;
  var childEhrFieldName;
  var childRippleFieldName;

  for (var openEhrFieldName in documentHandler.fieldMap) {
    canonicalFieldName = documentHandler.fieldMap[openEhrFieldName].field;
    childFieldMap = documentHandler.fieldMap[openEhrFieldName].fieldMap;

    if (childFieldMap) {     
      canonicalDocument[canonicalFieldName] = [];
      for (element in openEhrDocument) {
        if (element.startsWith(openEhrFieldName)) {
          indexStart = element.indexOf(":") + 1;
          indexEnd = element.indexOf("/", indexStart);
          indexValue = element.substr(indexStart, (indexEnd - indexStart));
                
          childElement =  canonicalDocument[canonicalFieldName][indexValue];

          if (!childElement) {
            childElement = {};
            canonicalDocument[canonicalFieldName][indexValue] = childElement;
          }

          // lookup the property in the childFieldMap
          for (childEhrFieldName in childFieldMap) {
            if (element.endsWith(childEhrFieldName)) {
              childRippleFieldName = childFieldMap[childEhrFieldName].field;
              childElement[childRippleFieldName] = openEhrDocument[element];
            }
          }
        }
      }
    }
    else {
      canonicalDocument[canonicalFieldName] = openEhrDocument[openEhrFieldName];
    }
  }

  return canonicalDocument;
}

function toSummary(source, openEhrDocument) {
  const canonicalDetail = toDetail(source, openEhrDocument);

  const canonicalSummary = {
    sourceId: canonicalDetail.sourceId, //.split('::')[0],
    source: canonicalDetail.source,
    documentType: canonicalDetail.documentType,
    documentDate: canonicalDetail.documentDate
  };

  return canonicalSummary;
}

function getDocumentHandler(openEhrDocument) {
  var document;
  var currentDocument;
  
  const properties = Object.keys(types);
  for (var p = 0; (p < properties.length && document === undefined); p++) {
    currentDocument = types[properties[p]];
    
    if(currentDocument.canHandle(openEhrDocument)) {
      document = currentDocument;
    }
  }

  return document;
}

module.exports = {
  toDetail: toDetail,
  toSummary: toSummary
};
