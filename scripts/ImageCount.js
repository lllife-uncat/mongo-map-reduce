/**
* How to run:
* 1. Open command windows
* 2. Execute 'mongo ImageCount.js'
*/

/**
* mongo: Mongo(host:port)
*/
var mongo = new Mongo("10.0.0.90:27017");
var db = mongo.getDB("db_mtla");

/**
* Ensure index for _mr_upload_date & _mr_images_count
* @member {function} ensureAllIndex
*/
function Indexer() {
  this.ensureAllIndex = function() {
    print(":: start index....");
    db.getCollection("_mr_upload_date").ensureIndex({ _id: 1 });
    db.getCollection("_mr_images_count").ensureIndex({ _id: 1 });
    print(":: operation success.");
  }
}

/**
* QImageInfo map & reduce
* @member {function} map
* @member {function} reduce
*/
function ImageInfo() {

  this.map = function () {
    emit(this.CaseID, 1);
  };

  this.reduce = function(key, values) {
    return Array.sum(values);
  };

  this.start = function() {
    print(":: start map & reduce image count....");
    var qimage = db.QImageInfo;
    var options = {
      out: "_mr_images_count"
    };

    qimage.mapReduce(this.map, this.reduce, options);
    print(":: operation success.")
  };
}

/**
* QGenerateInfo map & reduce
* @member {function} map
* @member {function} reduce
*/
function GenerateInfo() {
  this.map = function() {
    emit(this.CaseID, this.UploadDate);
  }
  this.reduce = function(key, values) {
    var value = values[0];
    //print(">>" + value);
    return value;
  }

  this.start = function() {
    print(":: start map & reduce upload date....");
    var qgenerate = db.QGenerateInfo;
    var options = {
      out: "_mr_upload_date"
    };
    qgenerate.mapReduce(this.map, this.reduce, options);
    print(":: operation success.");
  }
}

/**
* Start here.
* Map & reduce QImageInfo.
* Map & reduce QGenerateInfo.
* Ensure index both QImageInfo and QGenerateInfo
*/
new ImageInfo().start();
new GenerateInfo().start();
new Indexer().ensureAllIndex();
