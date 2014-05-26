var expect = require("chai").expect;
var settings = require("../modules/setting");
var mongojs = require("mongojs");
var ObjectId = mongojs.ObjectId;

function getCollection(name) {
  var db = getDb();
  var collection = db.collection(name);
  return collection;
}

function getDb() {
  var db = mongojs(settings.connectionString);
  return db;
}

describe("[MTLA DB]", function(){

  it("Should query database success", function(done){
    this.timeout(5000);

    var qcase = getCollection("QCaseInfo");
    var cons = {
      //_id: ObjectId("51d26f9bef053a0808a94b38"),
      ReceiveUser : "naree.ke"
    };

    qcase.find( cons , function(err, docs) {
      console.log(docs.length);
      done();
    });
  });

  it("Should map case and number of images success", function(done){
    this.timeout(50000);
    function map() {
      emit(this.CaseID, 1);
    }
    function reduce(key, values) {
       return Array.sum(values);
    }

    var qimage = getCollection("QImageInfo");
    var options = {
      out: "_mr_images_count"
    };

    qimage.mapReduce(map, reduce, options, function(err, docs){
      console.log(">> Callback <<");
      console.log(docs);
    });
  });

  it.skip("Should map & reduce", function(done){

    this.timeout(5000000);
    function map () {
      if(!this.IsDelete) {
        emit(this.AdminUser , this.NumberOfImages);
      }
    }

    function reduce(key, values) {
      return Array.sum(values);
    }

    var qcase = getCollection("QCaseInfo");
    var options = {
      out: "_mr_qcase"
    };

    qcase.mapReduce(map, reduce, options , function(err, docs) {
      console.log(">> Callback <<");
      console.log(docs);
      done();
    });

  });
});
