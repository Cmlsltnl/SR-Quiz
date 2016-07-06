/**
 * Created by fabi on 31.03.16.
 */

(function() {

    var Promise = require('bluebird');
    var MongoClient = Promise.promisifyAll(require('mongodb')).MongoClient;

    /*var url = 'mongodb://localhost:27017/quizDatabase';*/
    var url = 'mongodb://admin:1906Selina@ds011775.mlab.com:11775/srquiz';

    module.exports.authenticate = function(username, password) {
        return new Promise(function(resolve) {
            MongoClient.connectAsync(url)
                .then(function (db) {
                    return db.collection('users').findAsync({'username': username})
                })
                .then(function (cursor) {
                    return cursor.toArrayAsync(function (err, item) {
                        if (item != "" && item[0].password === password) {
                            resolve(item);
                        }
                        else {
                            resolve(false);
                        }

                    });
                })
                .catch(function (err) {
                    throw err;
                });

        })};

    module.exports.createUser = function(username, password){
        return new Promise(function(resolve){
            MongoClient.connectAsync(url)
                .then(function(db){
                    if(username){
                        db.collection('users').insertOne({
                            "username":username,
                            "password":password
                        }, function(err,result){
                            if(err === null){
                                resolve(username);
                                db.close();
                            }
                            else if(err.message.indexOf("duplicate key")>1){
                                resolve(0);
                            }
                        });
                    }
                });

        });
    };
    module.exports.createEntry = function(question, answer){
        return new Promise(function (resolve){
            MongoClient.connectAsync(url)
                .then(function(db){
                    if(question && answer){
                        db.collection('questions').insertOne({
                            "question":question
                        },function(err, resultQuestion){
                            if(err === null){
                                console.log(resultQuestion.insertedId);
                                db.collection('answers').insertOne({
                                    "answer":answer,
                                    "question_id": resultQuestion.insertedId
                                },function(err, resultAnswer){
                                    if(err === null){
                                        var resultArray = [
                                            {
                                                "question":question,
                                                "_id":{
                                                    "$oid":resultQuestion.insertedId
                                                },
                                                "answer":answer
                                            }
                                        ];
                                        resolve(resultArray);
                                    }
                                })
                            }
                        })
                    }
                })
        })
    }

}());