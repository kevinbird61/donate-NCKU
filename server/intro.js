const path = require('path')
const jsfs = require('jsonfile');
const { MongoDBService } = require('./dbmodule');
/* dealing with intro service */
class IntroService {
    init(app){
        app.get('/',this.index);
        app.get('/about',this.about);
        app.get('/department',this.department);
        app.get('/dep_page',this.dep_page);
        app.get('/article',this.article);
    }
    index(req,res){
        var linkobj = jsfs.readFileSync(path.join(__dirname,'static','navbar_link.json'));
        var content = jsfs.readFileSync(path.join(__dirname,'static','landing.json'));
        var type = (req.query.type == undefined) ? 'TW' : req.query.type;

        // Fetch the click information (limit with 2 entries)
        MongoDBService.click_m.find({}).sort('-click').limit(2).exec(function(err,array){
            if(err)
                console.log("Fetch click from database error");
            else{
                res.render('index',{
                    title: "Donate-NCKU",
                    hotest_video: "https://www.youtube.com/embed/e-x1l53ZEKk?autoplay=1",
                    landing: content,
                    url: req.url,
                    link: linkobj.index,
                    type: type,
                    sorted_click: array
                });
            }
        });
    }
    about(req,res){
        // res.end("About page coming soon!");
        var linkobj = jsfs.readFileSync(path.join(__dirname,'static','navbar_link.json'));
        var team = jsfs.readFileSync(path.join(__dirname,'static','team.json'));
        var type = (req.query.type == undefined) ? 'TW' : req.query.type;

        res.render('about',{
            title: "About donate-NCKU",
            url: req.url,
            link: linkobj.about,
            type: type,
            team: team
        });
    }
    department(req,res){
        var depobj = jsfs.readFileSync(path.join(__dirname,'static','department.json'));
        var linkobj = jsfs.readFileSync(path.join(__dirname,'static','navbar_link.json'));
        var type = (req.query.type == undefined) ? 'TW' : req.query.type;

        res.render('department',{
            title: "Choose your department",
            url: req.url,
            link: linkobj.index,
            department: depobj.all,
            type: type
        })
    }
    dep_page(req,res){
        // Parsing from request
        var language_type = (req.query.type == undefined) ? 'TW' : req.query.type;
        var type = req.query.dep_type;
        // You can custom each link obj by yourself
        var linkobj = jsfs.readFileSync(path.join(__dirname,'static','navbar_link.json'));
        // Get the content of this department
        // FIXME: need to use database instead of json format to store this. But current use the json.
        var dep_detail = jsfs.readFileSync(path.join(__dirname,'static','department',type+'.json'));
        // Fetch contribution
        MongoDBService.donate_m.find({dep:type}).sort('-donation').exec(function(err,array){
            // rearrange array
            var rearrange = [ ['From which lecturer','accumulate donation'] ];
            var current_donation = 0;
            for(var index in array){
                var new_obj = [ array[index].lecturer,array[index].donation ];
                rearrange.push(new_obj);
                current_donation += array[index].donation;
            }
            // render the page
            /*res.render('dep_page',{
                title: "Department of "+type,
                url: req.url,
                link: linkobj.dep_page,
                type: language_type,
                dep_type: type,
                currency: "NTD",
                content: dep_detail,
                current_donation: current_donation,
                sorted_contribution: rearrange
            });*/
            // Find dep_detail (by type)
            MongoDBService.article_m.find({dep:type},function(err,article){
                // render the page
                res.render('dep_page',{
                    title: "Department of "+type,
                    url: req.url,
                    link: linkobj.dep_page,
                    type: language_type,
                    dep_type: type,
                    currency: "NTD",
                    content: dep_detail,
                    current_donation: current_donation,
                    article: article,
                    sorted_contribution: rearrange
                });
            });
        });
    }
    article(req,res){
        var linkobj = jsfs.readFileSync(path.join(__dirname,'static','navbar_link.json'));
        var article_type = req.query.a_type;
        var dep_detail = jsfs.readFileSync(path.join(__dirname,'static','department',req.query.dep+'.json'));
        var type = (req.query.type == undefined) ? 'TW' : req.query.type;
        // type,lecturer,title,dep
        // Update: using db to store each article
        MongoDBService.find_article(req.query.dep,req.query.lecturer,req.query.title,function(err,msg_data){
            if(err){
                console.log("[Error/NotFound]: "+msg_data);
                // For DEMO - debug version:
                for(var index in dep_detail.article){
                    if(dep_detail.article[index].title == req.query.title && dep_detail.article[index].lecturer == req.query.lecturer){
                        res.render('article',{
                            title: req.query.title,
                            link: linkobj.about,
                            type: 'TW',
                            url: req.url,
                            dep_type: req.query.dep,
                            content: dep_detail.article[index]
                        });
                        return;
                    }
                }
                res.end("Error!");
                /* error page
                res.render('article',{
                    title: "縮哩~找不到該文章",
                    link: linkobj.about,
                    type: 'TW',
                    url: req.url,
                    dep_type: req.query.dep,
                    content: undefined
                });*/
            }
            else {
                // get msg_data as find article
                res.render('article',{
                    title: "瀏覽文章",
                    link: linkobj.about,
                    url: req.url,
                    type: type,
                    dep_type: req.query.dep,
                    content: msg_data
                });
            }
        });
    }
}

module.exports = {
    IntroService: new IntroService()
}
