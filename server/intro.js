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
            link: linkobj.index,
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
            for(var index in array){
                var new_obj = [ array[index].lecturer,array[index].donation ];
                rearrange.push(new_obj);
            }
            // render the page
            res.render('dep_page',{
                title: "Department of "+type,
                url: req.url,
                link: linkobj.dep_page,
                type: language_type,
                dep_type: type,
                currency: "NTD",
                content: dep_detail,
                sorted_contribution: rearrange
            });
        });
    }
}

module.exports = {
    IntroService: new IntroService()
}
