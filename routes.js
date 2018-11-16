const express = require('express')
const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const { url, dbName } = require('./db/config')

var historys = express.Router();

function recombineDocs(doc) {  
  return {
    lifetime: doc.lifetime,
    trx_hash: doc.transaction_id,
    sender: doc.sender,
    method: doc.method,
    block_number: doc.block_number,
    param: doc.param,
    create_time: doc.create_time,
  }
}

function findTransactions(client, params, pageParams, callback) {
  const db = client.db(dbName);
  // Get the Transactions collection
  let collection = db.collection('Transactions');
  const { page_size, page_num } = pageParams
  let skipNum = page_size * page_num
  // Find some documents
  collection.find(params).sort({ 'block_number': -1 }).skip(skipNum).limit(page_size).toArray(function(err, docs) {
    assert.equal(err, null);
    // console.log(docs)
    let list = docs.map(recombineDocs)
    callback(list);
    client.close();
  });
}


historys.get('/:method', (req, res) => {
  // console.log('req.params.method', req.params.method); // vote
  // console.log('vote req.query.account', req.query.account);
  const account = req.query.account
  const page_size = Number.parseInt(req.query.page_size) || 8
  const page_num = Number.parseInt(req.query.page_num) || 0
  const method = req.params.method
  const pageParams = { page_size, page_num }

  // Use connect method to connect to the server
  MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    if (err != null) return res.sendStatus(500)

    function sendDocs(docs) {
      // console.log('docs', docs)
      res.json({
        errcode: 0,
        msg: 'success',
        result: docs
      })
    }

    if (method == 'vote') {
      const params = {
        sender: account,
        method: "votedelegate"
      }
      findTransactions(client, params, pageParams, sendDocs)
      return 
    } else if (method == 'stake') {
      const params = {
        sender: account,
        $or: [{ method: "stake" }, { method: "unstake" }, { method: "claim" }]
      }
      findTransactions(client, params, pageParams, sendDocs)
      return 
    }
    const params = {
      $or: [{ sender: account, }, { "param.to": account }]
    }
    findTransactions(client, params, pageParams, sendDocs)
  });

})

// console.log('historys type: ', typeof historys)

module.exports = historys