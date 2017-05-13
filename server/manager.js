const path = require('path')
const jsfs = require('jsonfile');

/* Interact with users */
class Manager {
    init(app){
        app.get('/login',this.login_render);
        app.ws('/login',this.login);
    }
    login_render(req,res){
        var linkobj = jsfs.readFileSync(path.join(__dirname,'static','navbar_link.json'));
        var type = (req.query.type == undefined) ? 'TW' : req.query.type;

        res.render('login',{
            title: "Login page",
            link: linkobj.index,
            type: type
        });
    }

    login(ws,req){
        console.log("Login Web Socket");

        ws.on('message',function(msg){
            console.log("Msg from Login page : "+msg);
        });


    }
}

module.exports = {
    Manager: new Manager()
}
