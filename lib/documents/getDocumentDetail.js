/*

 ----------------------------------------------------------------------------
 | qewd-ripple: QEWD-based Middle Tier for Ripple OSI                       |
 |                                                                          |
 | Copyright (c) 2016-18 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author:  Will Weatherill                                                 |
 | Updated: Rob Tweed                                                       |
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

  22 January 2018

*/


var getDetail = require('./getDetail');

function getDocumentDetail(args, finished) {

  console.log('getDocumentDetail');

  var cachedDocument = args.session.data.$(['patients', args.patientId, 'documents']);
  var cachedDetail = cachedDocument.$(['detail', args.sourceId]);
  var cachedSummary = cachedDocument.$(['summary', args.sourceId]);
  var response = {};

  if (cachedDetail.exists) {
    response = cachedDetail.getDocument(true);
    response.documentType = cachedSummary.$('documentType').value;
    response.sourceId = args.sourceId;
    return finished(response);
  }

  getDetail(args, function(results) {
    if (!results.error) {
      cachedDetail.setDocument(results);
    }
    if (cachedSummary.exists) results.documentType = cachedSummary.$('documentType').value;
    results.sourceId = args.sourceId;
    return finished(results);
  });
}

module.exports = getDocumentDetail;
