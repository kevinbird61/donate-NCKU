const path = require('path')
const jsfs = require('jsonfile');

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

        res.render('index',{
            title: "Donate-NCKU",
            link: linkobj.index
        });
    }
    about(req,res){
        res.end("About page coming soon!");
    }
    department(req,res){
        var depobj = jsfs.readFileSync(path.join(__dirname,'static','department.json'));
        var linkobj = jsfs.readFileSync(path.join(__dirname,'static','navbar_link.json'));

        res.render('department',{
            title: "Choose your department",
            link: linkobj.index,
            department: depobj.all
        })
    }
    dep_page(req,res){
        // You can custom each link obj by yourself
        var linkobj = jsfs.readFileSync(path.join(__dirname,'static','navbar_link.json'));
        // Get the content of this department
        // FIXME: need to use database instead of json format to store this. But current use the json.
        var dep_detail = jsfs.readFileSync(path.join(__dirname,'static','department',type+'.json'));

        var type = req.query.type;

        res.render('dep_page',{
            title: "Department of "+type,
            link: linkobj,
            content: dep_detail
        });
    }
}

module.exports = {
    IntroService: new IntroService()
}
