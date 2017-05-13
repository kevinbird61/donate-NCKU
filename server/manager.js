const path = require('path')
const jsfs = require('jsonfile');

/* Interact with users */
class Manager {
    init(app){
        app.get('/login',this.login_render);
        app.get('/user',this.user);
        app.get('/content',this.content_page);
        app.post('/upload',this.upload);
    }
    login_render(req,res){
        var linkobj = jsfs.readFileSync(path.join(__dirname,'static','navbar_link.json'));
        var type = (req.query.type == undefined) ? 'TW' : req.query.type;

        res.render('login',{
            title: "Login page",
            url: req.url,
            link: linkobj.login,
            type: type
        });
    }
    user(req,res){
        // User name & FIXME key
        var username = req.query.username;
        var type = (req.query.type == undefined) ? 'TW' : req.query.type;
        var linkobj = jsfs.readFileSync(path.join(__dirname,'static','navbar_link.json'));
        // Fetch all department data (FIXME: using database)
        var total_obj = {
            user: username,
            obj: []
        }
        jsfs.readFile(path.join(__dirname,'static','department.json'), (err,data) => {
            if(err)
                console.log("Error in read Department list json. (${err})");
            else{
                // data now is all current department name (in US tag)
                for(var index in data.all){
                    // read every file , and check out this user's lecture
                    var d_data = jsfs.readFileSync(path.join(__dirname,'static','department',data.all[index].US+'.json'));
                    // Check article
                    for(var a_index in d_data.article){
                        if(d_data.article[a_index].lecturer == username){
                            console.log(username);
                            // Store into total_obj
                            var subobj = {
                                dep: data.all[index].US,
                                title: d_data.article[a_index].title,
                                lecturer: username
                            }
                            total_obj.obj.push(subobj);
                        }
                    }
                    // Check video
                    for(var a_index in d_data.video){
                        if(d_data.video[a_index].lecturer == username){
                            // Store into total_obj
                            var subobj = {
                                dep: data.all[index].US,
                                title: d_data.video[a_index].title,
                                lecturer: username
                            }
                            total_obj.obj.push(subobj);
                        }
                    }
                }
                // render user's page
                res.render('user',{
                    title: "Hello, " + username,
                    url: req.url,
                    exist_article: total_obj,
                    link: linkobj.user_page,
                    type: type
                })
            }
        });
    }
    content_page(req,res){
        let type = req.query.etype;
        var ltype = (req.query.type == undefined) ? 'TW' : req.query.type;
        var linkobj = jsfs.readFileSync(path.join(__dirname,'static','navbar_link.json'));
        var depobj = jsfs.readFileSync(path.join(__dirname,'static','department.json'));
        if(type == 'article'){
            // Parse the user
            let user = req.query.username;
            // Show the editor page
            res.render('edit',{
                title: "Add Article page",
                page_type: "new_article",
                user: user,
                url: req.url,
                dep: depobj,
                link: linkobj.edit_page,
                type: ltype
            })
        }
        else if(type == 'edit'){
            // FIXME: find the target to modify
            let dep = req.query.dep;
            let lecturer = req.query.lecturer;
            let title = req.query.title;
            var linkobj = jsfs.readFileSync(path.join(__dirname,'static','navbar_link.json'));
            var dep_detail = jsfs.readFileSync(path.join(__dirname,'static','department',dep+'.json'));
            for(var index in dep_detail.article){
                if(dep_detail.article[index].lecturer == lecturer && dep_detail.article[index].title == title){
                    res.render('edit',{
                        title: "Modify Article page",
                        page_type: "modify_article",
                        user: lecturer,
                        url: req.url,
                        dep: depobj,
                        thisdep: dep,
                        thistitle: title,
                        thiscontent: dep_detail.article[index].content,
                        link: linkobj.edit_page,
                        type: ltype
                    });
                    return;
                }
            }
            res.end("Error occur!");
        }
        else if(type == 'video'){
            res.end('Video has not support yet.')
        }
        else{
            res.end('Not match');
        }
    }
    upload(req,res){
        let edit_type = req.body.page_type;
        let title = req.body.title;
        let dep = req.body.dep;
        let lecturer = req.body.lecturer;
        let content = req.body.content;
        // FIXME: store into database
        console.log(edit_type+';'+title+';'+dep+';'+lecturer+';'+content);
        if(edit_type == "new_article"){
            // Store back into specific department
            var dep_detail = jsfs.readFileSync(path.join(__dirname,'static','department',dep+'.json'));
            // check whether it is duplicated or not
            for(var index in dep_detail.article){
                if(dep_detail.article[index].lecturer == lecturer && dep_detail.article[index].title == title){
                    // duplicated
                    res.end("duplicated! do nothing...");
                    return;
                }
            }
            // Add this new obj into dep_detail
            var new_obj = {
                title: title,
                lecturer: lecturer,
                about: "Something, need to fetch from user data",
                img_url: "http://i.imgur.com/RTx4hLq.jpg",
                content: content
            }
            dep_detail.article.push(new_obj);
            // write back into department json
            jsfs.writeFile(path.join(__dirname,'static','department',dep+'.json'),dep_detail,{spaces: 2}, (err) => {
                if(err)
                    res.end("Error when writing file in specific department: " + err);
                else{
                    res.redirect('/department');
                }
            });
        }
        else if(edit_type == "modify_article"){
            var dep_detail = jsfs.readFileSync(path.join(__dirname,'static','department',dep+'.json'));
            // check whether it is duplicated or not
            for(var index in dep_detail.article){
                if(dep_detail.article[index].lecturer == lecturer && dep_detail.article[index].title == title){
                    // update
                    dep_detail.article[index].content = content;
                    // store back
                    jsfs.writeFile(path.join(__dirname,'static','department',dep+'.json'),dep_detail,{spaces: 2}, (err) => {
                        if(err)
                            res.end("Error when writing file in specific department: " + err);
                        else{
                            res.redirect('/department');
                        }
                    });
                    return;
                }
            }
            res.end("Modify not found. Cause error !");
        }
    }
}

module.exports = {
    Manager: new Manager()
}
