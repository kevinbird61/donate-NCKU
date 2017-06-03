/* mongoose - usage */
const mongoose = require('mongoose');

class MongoDBService {
    constructor(){
        // connect to database
        mongoose.connect('mongodb://localhost/donateNCKU');
        this.donateDB = mongoose.connection;
        // define schema
        // Donation record here
        this.donateSchema = mongoose.Schema({
            dep: String,
            lecturer: String,
            donation: Number,
            currency: String
        });
        // Click record here
        this.clickSchema = mongoose.Schema({
            dep: String,
            lecturer: String,
            title: String,
            click: Number
        });
        // Article maintain
        this.articleSchema = mongoose.Schema({
            dep: String,
            lecturer: String,
            title: String,
            content: String,
            about: String,
            img_url: String
        });
        // Define user schema
        this.userSchema = mongoose.Schema({
            username: String,
            passwd: String
        });

        // define schema model
        this.donate_m = mongoose.model('donate_m',this.donateSchema);
        this.click_m = mongoose.model('click_m',this.clickSchema);
        this.article_m = mongoose.model('article_m',this.articleSchema);
        this.user_m = mongoose.model('user_m',this.userSchema);
    }
    add_user(uname,pwd,callback){
        var userModel = this.user_m;
        this.user_m.findOne({username: uname},'username',function(err,user){
            if(err){
                console.log("[Add_User] User-findOne error.");
                callback(1,"[Add_User] User-findOne error.");
            }
            else{
                if(user == null){
                    // Not found this user => create !
                    let newuser = new userModel({username: uname,passwd: pwd});
                    newuser.save(function(err,newuser){
                        if(err){
                            console.log("Error with new user save: " + err);
                            callback(1,err);
                        }
                        else{
                            console.log("Successfully add new user!");
                            callback(0,"create user!");
                        }
                    });
                }
                else{
                    // exist => return error
                    console.log("Duplicate account name, please use another account to sign up.");
                    callback(1,"Duplicate account name, please use another account to sign up.");
                }
            }
        });
    }
    check_user(uname,pwd,callback){
        var userModel = this.user_m;
        this.user_m.findOne({username: uname,passwd: pwd},'username passwd',function(err,user){
            if(err){
                console.log("[Check_User] User-findOne error.");
                callback(1,"[Check_User] User-findOne error.");
            }
            else{
                if(user == null){
                    // Not found this user => error
                    console.log("Not found this user.");
                    callback(1,"Not found this user.");
                }
                else{
                    // exist => find !
                    console.log("Found one !");
                    callback(0,user);
                }
            }
        });
    }
    add_article(dep,lecturer,title,content,about,img_url,callback){
        var articleModel = this.article_m;
        this.article_m.findOne({lecturer:lecturer,dep:dep,title:title},'lecturer dep title',function(err,article){
            if(err){
                console.log("Article-findOne error.");
                callback(1,"Article-findOne error.");
            }
            else {
                if(article == null){
                    // not found , then create one
                    let newarticle = new articleModel({dep:dep, lecturer:lecturer, title:title, content:content, about:about, img_url:img_url});
                    newarticle.save(function(err,newarticle){
                        if(err){
                            console.log("Error with article save:"+err);
                            callback(1,err);
                        }
                        else {
                            console.log("Successfully save article");
                            callback(0,"create article");
                        }
                    });
                }
                else{
                    // exist , update/do nothing
                    callback(1,"exist");
                }
            }
        });
    }
    update_article(dep,lecturer,title,content,about,img_url,callback){
        var articleModel = this.article_m;
        this.article_m.findOne({lecturer:lecturer,dep:dep,title:title},'dep lecturer title content about img_url',function(err,article){
            if(err){
                console.log("Article-findOne error.");
                callback(1,"Article-findOne error.");
            }
            else {
                if(article == null){
                    // not found , then create one
                    callback(1,"not found");
                }
                else{
                    // exist , update
                    article.title = title;
                    article.content = content;
                    article.about = about;
                    article.img_url = img_url;
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
        });
    }
    find_article(dep,lecturer,title,callback){
        var articleModel = this.article_m;
        this.article_m.findOne({lecturer:lecturer,dep:dep,title:title},'dep lecturer content title img_url about',function(err,article){
            if(err){
                console.log("Article-findOne error.");
                callback(1,"Article-findOne error.");
            }
            else {
                if(article == null){
                    // not found , then create one
                    callback(1,"not found");
                }
                else{
                    // find it
                    callback(0,article);
                }
            }
        });
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
