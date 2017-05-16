/* mongoose - usage */
const mongoose = require('mongoose');

class MongoDBService {
    constructor(){
        // connect to database
        mongoose.connect('mongodb://localhost/donateNCKU');
        this.donateDB = mongoose.connection;
        // define schema
        this.donateSchema = mongoose.Schema({
            dep: String,
            lecturer: String,
            donation: Number,
            currency: String
        });

        this.clickSchema = mongoose.Schema({
            dep: String,
            lecturer: String,
            title: String,
            click: Number
        });

        // define schema model
        this.donate_m = mongoose.model('donate_m',this.donateSchema);
        this.click_m = mongoose.model('click_m',this.clickSchema);
    }
    article_donate(dep,lecturer,donation,currency,callback){
        var donationModel = this.donate_m;
        this.donate_m.findOne({lecturer: lecturer,dep: dep},'dep lecturer donation currency',function(err,article){
            if(err)
                console.log(err);
            else{
                if(article == null){
                    // not found
                    let newarticle = new donationModel({dep: dep, lecturer: lecturer,donation: donation,currency: currency});
                    newarticle.save(function(err,newarticle){
                        if(err){
                            console.log("Error with article save: "+err);
                            callback(1,err);
                        }
                        else{
                            console.log("Successfully save article");
                            callback(0,"create");
                        }
                    })
                }
                else{
                    // found one => increase click and donation
                    article.donation = article.donation + donation;
                    article.currency = currency;
                    article.save(function(err,article){
                        if(err){
                            console.log("Error with article update: "+err);
                            callback(1,err);
                        }
                        else{
                            console.log("Successfully update article");
                            callback(0,"update");
                        }
                    });
                }
            }
        })
    }
    article_click(dep,lecturer,title,callback){
        var clickModel = this.click_m;
        this.click_m.findOne({dep: dep,lecturer: lecturer,title: title},'dep lecturer title click',function(err,article){
            if(err)
                console.log(err);
            else{
                if(article == null){
                    // not found
                    let newarticle = new clickModel({dep: dep,lecturer: lecturer,title: title,click : 1});
                    newarticle.save(function(err,newarticle){
                        if(err){
                            console.log("Error with article click save: "+err);
                            callback(1,err);
                        }
                        else{
                            console.log("Successfully save article click");
                            callback(0,"create");
                        }
                    })
                }
                else{
                    // found one => increase click and donation
                    article.click = article.click + 1;
                    article.save(function(err,article){
                        if(err){
                            console.log("Error with article update click: "+err);
                            callback(1,err);
                        }
                        else{
                            console.log("Successfully update article click");
                            callback(0,"update");
                        }
                    });
                }
            }
        })
    }
}

module.exports = {
    MongoDBService : new MongoDBService()
}
