var express = require("express");

var app = express();



app.listen(2006, function () {
    console.log("Server Started");
})
app.use(express.static("public"));//index.html will open


app.get("/", function (req, resp) {
    var path = __dirname + "/public/index.html";
    resp.sendFile(path);
});

//--------my sql--------//

var mysql = require("mysql2");
require('dotenv').config();


let url = process.env.AIVEN_URL;
let mysqlCon = mysql.createConnection(url);
mysqlCon.connect(function (err) {
    if (err == null)
        console.log("Connected Sucessfullyyy");
    else
        console.log(err.message);
})

// ===========================//
//file uploader//
var fileuploader = require("express-fileupload");
app.use(fileuploader());
app.use(express.urlencoded({ extended: true }));
var cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API,
    api_secret: process.env.CLOUD_KEY //click "view api keys above to cpy your api secret"
});
// --------GEN AI--------------//

const { GoogleGenerativeAI } = require("@google/generative-ai");


const genAI = new GoogleGenerativeAI("AQ.Ab8RN6J-UMRKzC0rVimF3CHQ3e99C5Dosc_X-jvnifqEl8muhg");//add your own API key
const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

//let url=process.env.AIVEN_URL;
/*let mysqlCon=mysql.createConnection({
    host: "mysql-345a9a65-taniya240106-d3a6.l.aivencloud.com",
    port:21196,
    user: "avnadmin",
    password: "AVNS_0Tym5xyTxN9qKM-xP_T",
    database: "defaultdb",
    ssl: {
        rejectUnauthorized: false
    }

});   
mysqlCon.connect(function(err)
{
    if(err==null)
        console.log("Connected Sucessfullyyy");
    else
        console.log(err.message);
});*/

//---------using ajax-------//

//------chk email is aleardy or not------------//

app.get("/check-email", function (req, resp) {

    let email = req.query.emailKuch;
    mysqlCon.query("select * from userspro where emailid=?", [email], function (err, resultJSNAry) {
        if (err == null) {
            if (resultJSNAry.length == 1)
                resp.send("Already Occupied");
            else
                resp.send("AVAILABLE");
        }
        else
            resp.send(err.message);

    })
})

//--------send data to server (signup)----//
app.get("/signup-process-ajax", function (req, resp) {
    let email = req.query.emailKuch;
    let pwd = req.query.pwdKuch;
    let utype = req.query.utypeKuch;
    // let active=1;
    mysqlCon.query("insert into userspro values(?,?,?,current_date(),1)", [email, pwd, utype], function (err) {
        if (err == null)
            resp.send("Congoo !! record saved successfullyyy");
        else
            resp.send(err.message);
    })

});


//--------login--------//
app.get("/login-process-ajax", function (req, resp) {
    let email = req.query.emailKuchlogin;
    let pwd = req.query.pwdKuchlogin;
    //resultJSNAry → contains the rows returned from the database.

    mysqlCon.query("select * from userspro where emailid=? and pwd=?", [email, pwd], function (err, resultJSNAry) {
        if (err == null) {
            if (resultJSNAry.length == 1) {
                if (resultJSNAry[0].active == 1)
                    resp.send(resultJSNAry[0].utype);
                else
                    resp.send("Invalid Userid or Password");
            }
            else
                resp.send("Invalid Userid or Password");
        }
        else
            resp.send(err.message);
    })
})
//-----------donar avail equip linking----//
app.get("/donorprofile", function (req, resp) {
    console.log(req.body);
    console.log(req.files);
    var path = __dirname + "/public/donor-profile.html";
    resp.sendFile(path);
});
// ----------------//
app.get("/availmed", function (req, resp) {
    var path = __dirname + "/public/availmed.html";
    resp.sendFile(path);
});
// ---------------//
app.get("/availEquip", function (req, resp) {
    var path = __dirname + "/public/availEquip.html";
    resp.sendFile(path);
});
// ------------//
app.get("/admin-users-dash", function (req, resp) {
    var path = __dirname + "/public/admin-users-dash.html";
    resp.sendFile(path);
});
// ------------//
app.get("/admin-donors-dash", function (req, resp) {
    var path = __dirname + "/public/admin-donors-dash.html";
    resp.sendFile(path);
});
// -------------------//
app.get("/donorDash", function (req, resp) {
    var path = __dirname + "/public/dash-donor.html";
    resp.sendFile(path);
});
// -------------------//
app.get("/adminDash", function (req, resp) {
    var path = __dirname + "/public/dash-admin.html";
    resp.sendFile(path);
});
// ------------------//
app.get("/allmed", function (req, resp) {
    var path = __dirname + "/public/allmedicine.html";
    resp.sendFile(path);
});
//------------------//
app.get("/medFinder", function (req, resp) {
    var path = __dirname + "/public/medFinder.html";
    resp.sendFile(path);
});
//--------ngo dash linking---------//
app.get("/NgoDash", function (req, resp) {
    var path = __dirname + "/public/dash-ngo.html";
    resp.sendFile(path);
});
// -------needy linking---------//
app.get("/needyDash", function (req, resp) {
    var path = __dirname + "/public/dash-needy.html";
    resp.sendFile(path);
});
// -------- donor send data to server-------------//

app.post("/send-data-donor", async function (req, resp) {

    //File Uploading
    let msg = "File not Uploaded";
    let myUrl = "nopic.jpg";

    if (req.files != null) {

        // ----------adhar crd-----------//
        let fileName = req.files.acard.name; //uploaded files goes in file obj
        let fullPath = __dirname + "/uploads/" + fileName;
        await req.files.acard.mv(fullPath); //saving pic in uploader folder
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myUrl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl);
        });
    }
    //File Uploading
    let msg2 = "File not Uploaded";
    let myUrl2 = "nopic.jpg";

    if (req.files != null) {

        // ----------profilePic-----------//
        let fileName2 = req.files.profilePic.name; //uploaded files goes in file obj
        let fullPath2 = __dirname + "/uploads/" + fileName2;
        await req.files.profilePic.mv(fullPath2); //saving pic in uploader folder
        msg2 = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath2).then(function (picUrlResult2) {
            myUrl2 = picUrlResult2.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl2);
        });
    }
    /*--------profile pic-----------
              let PicfileName = req.files.profilePic.name;
            let PicfullPath = __dirname + "/public/" + PicfileName ;
            await req.files.profilePic.mv(PicfullPath);
            msg = "Uploaded Successfully";
    
            await cloudinary.uploader.upload(PicfullPath).then(function (picUrlResult) {
              picpath = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
                console.log("************")
                console.log( picpath );
            });
        }*/


    let emailid = req.body.inputEmail;  //.emailid should be =name in.html
    let name = req.body.inputName;
    let mobile = req.body.inputMobile;
    let address = req.body.inputAddress;
    let city = req.body.inputCity;
    //------------------//
    mysqlCon.query("insert into dprofiles values(?,?,?,?,?,?,?)", [emailid, name, mobile, address, city, myUrl, myUrl2], function (err) {
        if (err == null)
            // resp.send("Badhai!!!! Record Saved Successsfulllyyyy");
            resp.sendFile(__dirname + "/public/response.html");
        else
            resp.send(err.message);
    })

})

//--------- donar update-------------//
app.post("/update-data-donor", async function (req, resp) {

    //File Uploading
    let msg = "File not Uploaded";
    let myUrl = "nopic.jpg";

    if (req.files != null) {

        // ----------adhar crd-----------//
        let fileName = req.files.acard.name; //uploaded files goes in file obj
        let fullPath = __dirname + "/uploads/" + fileName;
        await req.files.acard.mv(fullPath); //saving pic in uploader folder
        msg = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myUrl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl);
        });
    }
    else {
        myUrl = req.body.hdnacard;
    }
    //File Uploading
    let msg2 = "File not Uploaded";
    let myUrl2 = "nopic.jpg";

    if (req.files != null) {

        // ----------profilePic-----------//
        let fileName2 = req.files.profilePic.name; //uploaded files goes in file obj
        let fullPath2 = __dirname + "/uploads/" + fileName2;
        await req.files.profilePic.mv(fullPath2); //saving pic in uploader folder
        msg2 = "Uploaded Successfully";

        await cloudinary.uploader.upload(fullPath2).then(function (picUrlResult2) {
            myUrl2 = picUrlResult2.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl2);
        });
    }
    else {
        myUrl2 = req.body.hdnpic;
    }


    let emailid = req.body.inputEmail;  //.emailid should be =name in.html
    let name = req.body.inputName;
    let mobile = req.body.inputMobile;
    let address = req.body.inputAddress;
    let city = req.body.inputCity;
    //------------------//
    mysqlCon.query("update  dprofiles set name=?,mobile=?,address=?,city=?,acardpath=?,picpath=? where emailid=?", [name, mobile, address, city, myUrl, myUrl2, emailid], function (err) {
        if (err == null)
            //resp.send("Badhai!!!! Record Updated Successsfulllyyyy");
            resp.sendFile(__dirname + "/public/response.html");
        else
            resp.send(err.message);
    })

})
//------------ update end---------//


// ---------fetch -------------//
app.get("/fetch-one", function (req, resp) {
    let email = req.query.emailidKuch;
    mysqlCon.query("select * from dprofiles where emailid=?", [email], function (err, resultone) {
        if (err == null)
            resp.send(resultone);
        else
            resp.send(err.message);
    })
})
// ---------fetch end-------------//

//=============AVIL-MEDICINE===================
app.post("/med-data", async function (req, resp) {


    //File uploading
    let msg = "File Not Uploaded";
    let myUrl = "nopic.jpg";


    if (req.files != null) {
        let fileName = req.files.medPic.name;//uploaded files goes in file object 
        let fullPath = __dirname + "/uploads/" + fileName;
        await req.files.medPic.mv(fullPath);//saving pic in upload folder
        msg = "uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myUrl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("****")
            console.log(myUrl);
        })
    }



    let emailid = req.body.inputEmail;
    let medname = req.body.inputMedName;
    let expdate = req.body.inputDate;
    let company = req.body.inputCompany;
    let packing = req.body.packing
    let qty = req.body.qty;
    let info = req.body.inputInfo;


    //----------------------//
    mysqlCon.query("insert into medicines values(?,?,?,?,?,?,?,?,?)", [null, emailid, medname, expdate, company, packing, qty, info, myUrl], function (err) {

        if (err == null)
            // resp.send("Badhaii!!!! Record Saved Successfully");
            resp.sendFile(__dirname + "/public/response.html");
        else
            resp.send(err.message);
    })

})
//------------------Avail-Equip--------------------//
app.post("/equip-data", async function (req, resp) {
    //File uploading
    let msg = "File Not Uploaded";
    let myUrl = "nopic.jpg";

    if (req.files != null) {
        let fileName = req.files.Pic.name;//uploaded files goes in file object 
        let fullPath = __dirname + "/uploads/" + fileName;
        await req.files.Pic.mv(fullPath);//saving pic in upload folder
        msg = "uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myUrl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("****")
            console.log(myUrl);
        });
    }

    //File uploading 2
    let msg2 = "File Not Uploaded";
    let myUrl2 = "nopic.jpg";

    if (req.files != null) {
        let fileName2 = req.files.Pic2.name;//uploaded files goes in file object 
        let fullPath2 = __dirname + "/uploads/" + fileName2;
        await req.files.Pic2.mv(fullPath2);//saving pic in upload folder
        msg2 = "uploaded Successfully";

        await cloudinary.uploader.upload(fullPath2).then(function (picUrlResult2) {
            myUrl2 = picUrlResult2.url;   //will give u the url of ur pic on cloudinary server
            console.log("****")
            console.log(myUrl2);
        })
    }


    //------------------------//
    let emailid = req.body.inputEmail;
    let equipment = req.body.inputEquip;
    let conditions = req.body.condition;
    let type = req.body.radioAmount;
    let amount = req.body.inputAmount;
    let info = req.body.inputInfo;

    //---------------------------//
    mysqlCon.query("insert into equipments values(?,?,?,?,?,?,?,?,?)", [null, emailid, equipment, conditions, type, amount, myUrl, myUrl2, info], function (err) {

        if (err == null)
            // resp.send("Badhaii!!!! Record Saved Successfully")
            resp.sendFile(__dirname + "/public/response.html");
        else
            resp.send(err.message);
    })

})
// ------------angular  admin donar dash(fetch)-------//
app.get("/fetch-all", function (req, resp) {
    //? is called in Parameter
    mysqlCon.query("select * from userspro ", function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
//--------dlt-----------//
app.get("/do-delete", function (req, resp) {
    let email = req.query.emailKeyKuch;
    //? is called in Parameter
    mysqlCon.query("delete from  userspro where emailid=?", [email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("Record  Deleted Successsfulllyyyy");
            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(err.message);
    })
})
// ---------block user--------//
app.get("/do-Block", function (req, resp) {
    let email = req.query.emailKeyKuch;

    mysqlCon.query("update userspro set active=? where emailid=?", [0, email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("User Blocked Successsfulllyyyy");
            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(err.message);
    })
})
//--------------resume----------//
app.get("/do-Resume", function (req, resp) {
    let email = req.query.emailKeyKuch;

    mysqlCon.query("update  userspro set active=? where emailid=?", [1, email], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("User REsume Successsfulllyyyy");
            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(err.message);
    })
})

// -------admin user dash(fetch)---------//

app.get("/fetch-alll", function (req, resp) {
    //? is called in Parameter
    mysqlCon.query("select * from dprofiles ", function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
// ---------admin donor dashboard(med manager)--------------//
app.get("/fetch-all-medManager", function (req, resp) {
    let email = req.query.emailKeyKuch;
    //? is called in Parameter
    mysqlCon.query("select * from medicines where emailid=? ", [email], function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

app.get("/do-deletemed", function (req, resp) {
    let rid = req.query.ridKuchbhi;
    // console.log("RID =", rid);                                //? is called in Parameter
    mysqlCon.query("delete from  medicines where rid=?", [rid], function (err, result) {

        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("Record  Deleted Successsfulllyyyy");
            else
                resp.send("Invalid Rid");
        }
        else
            resp.send(err.message);
    })
})
// --------chnge pwd-------------//
app.get("/update-pwd", function (req, resp) {
    let email = req.query.emailidKuchbhi;
    let oldpwd = req.query.oldPwdKuchbhi;
    let newpwd = req.query.newPwdKuchbhi;

    mysqlCon.query("update userspro set pwd=? where emailid=? AND pwd=?", [newpwd, email, oldpwd], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)
                resp.send("Password UPdated Successfullly");
            else
                resp.send("Invalid Email");
        }
        else
            resp.send(err.message);
    })
})
// -----------fetch all medicine---------//
app.get("/fetch-Allmedicine", function (req, resp) {
    //? is called in Parameter
    mysqlCon.query("select * from medicines ", function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
// ----------  particular medicine detail-----------//
app.get("/fetch-onemedDetail", function (req, resp) {
    let rid = req.query.ridKuch;

    mysqlCon.query("select * from  medicines where rid=?", [rid], function (err, resultJSONAry) {

        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);;
    })
})
//-----------------fetch equipment--------//
app.get("/fetch-equipment", function (req, resp) {
    let email = req.query.emailidKuch;
    mysqlCon.query("select * from equipments where emailid=? ", [email], function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })})

//==========delete equipment====================//
app.get("/do-dltequipment", function (req, resp) {
    let rid = req.query.ridKuch;
    mysqlCon.query("delete from equipments where rid =?", [rid], function (err, result) {
        if (err == null) {
            if (result.affectedRows == 1)//ik row ch data hega haii
                resp.send("Record deletes successfully");
            else
                resp.send("invalid email id");
        }
        else
            resp.send(err.message);
    })
})

//--------------show cities----------//
app.get("/Show-Cities", function (req, resp) {
    //? is called in Parameter
    mysqlCon.query("select distinct city  from dprofiles", function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

//-------shw med by city--------//
app.get("/Show-MedByCity", function (req, resp) {
    //(selected city) On the server side, the city is received using req.query.city
    let city = req.query.city;

    // --              Get unique medicine names    Start from donor profiles  Join medicines table Match records using email ID  Show medicines for selected city
    mysqlCon.query("select  distinct m.medname from dprofiles p inner    join medicines m on p.emailid=m.emailid       where p.city=? ", [city], function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
//-----btn click card show--------//
// Return medicines matching selected city and medicine

app.get("/Show-SelMed", function (req, resp) {
    // Get selected medicine and city from request
    let med = req.query.medicine;
    let city = req.query.city;


    mysqlCon.query("select  * from dprofiles p inner    join medicines m on p.emailid=m.emailid       where p.city=? and m.medname=?", [city, med], function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
//-----------donor----//
// Return donor details using email ID
app.get("/show-donor", function (req, resp) {
    // Get donor email from request
    let email = req.query.email;
    mysqlCon.query("select * from dprofiles where emailid=? ", [email], function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
// -----------linking of ngo-registration-----------//
app.get("/ngo-registration", function (req, resp) {
    var path = __dirname + "/public/ngo-registration.html";
    resp.sendFile(path);
});
//-------------ngo reg-----//
app.post("/ngo-reg", async function (req, resp) {


    //File uploading
    let msg = "File Not Uploaded";
    let myUrl = "nopic.jpg";


    if (req.files != null) {
        let fileName = req.files.regproof.name;//uploaded files goes in file object 
        let fullPath = __dirname + "/uploads/" + fileName;
        await req.files.regproof.mv(fullPath);//saving pic in upload folder
        msg = "uploaded Successfully";

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            myUrl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            console.log("****")
            console.log(myUrl);
        })
    }



    let emailid = req.body.inputEmail;
    let ngoname = req.body.inputngoName;
    let registration = req.body.inputreg;
    let city = req.body.inputCity;
    let website = req.body.inputWebsite;
    let contact = req.body.inputContact;
    let since = req.body.inputSince;
    let cp = req.body.inputChairPerson;
    let work = req.body.inputWorks;
    let regno = req.body.inputregno;


    //----------------------//
    mysqlCon.query("insert into ngos values(?,?,?,?,?,?,?,?,?,?,?)", [emailid, ngoname, registration, city, website, contact, since, cp, work, regno, myUrl], function (err) {

        if (err == null)
            // resp.send("Badhaii!!!! Record Saved Successfully");
            resp.sendFile(__dirname + "/public/response.html");
        else
            resp.send(err.message);
    })

})

// -----------linking of ngo-finder-----------//
app.get("/ngoFinder", function (req, resp) {
    var path = __dirname + "/public/NGO-finder.html";
    resp.sendFile(path);
});
// ------shw  ngo citis---------//

app.get("/Show-NgoCities", function (req, resp) {
    //? is called in Parameter
    mysqlCon.query("select distinct city  from ngos", function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})

// -------------------//
app.get("/Show-ngoByCity", function (req, resp) {
    // Get donor email from request
    let city = req.query.city;
    mysqlCon.query("select * from ngos where city=? ", [city], function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})


//--------------linking of equip finder---------//
app.get("/equipFinder", function (req, resp) {
    var path = __dirname + "/public/equip-finder.html";
    resp.sendFile(path);
});
// -----shw city----//
app.get("/Show-Citiess", function (req, resp) {
    //? is called in Parameter
    mysqlCon.query("select distinct city  from dprofiles", function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
// show city by equip----------//
app.get("/Show-EquipByCityy", function (req, resp) {
    //(selected city) On the server side, the city is received using req.query.city
    let city = req.query.city;

    // --              Get unique medicine names    Start from donor profiles  Join medicines table Match records using email ID  Show medicines for selected city
    mysqlCon.query("select  distinct e.equipment from dprofiles p inner  join equipments e on p.emailid=e.emailid   where p.city=? ", [city], function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
//----------------//
app.get("/Show-SelEquipm", function (req, resp) {
    // Get selected medicine and city from request
    let equip = req.query.equipment;
    let city = req.query.city;


    mysqlCon.query("select  * from dprofiles p inner    join equipments e on p.emailid=e.emailid       where p.city=? and e.equipment=?", [city, equip], function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
//-----------donor----//
// Return donor details using email ID
app.get("/show-donors", function (req, resp) {
    // Get donor email from request
    let email = req.query.email;
    mysqlCon.query("select * from dprofiles where emailid=? ", [email], function (err, resultJSONAry) {
        if (err == null) {
            console.log(resultJSONAry)
            resp.send(resultJSONAry)

        }
        else
            resp.send(err.message);
    })
})
// --------linking of needy profile--------------//

app.get("/needy-profile", function (req, resp) {
    var path = __dirname + "/public/needy-profile.html";
    resp.sendFile(path);
});
// ---------gen ai   front side of adhar crd----------//
async function ConnectToGeminiFront(imgurl) {
    const frontprompt = "Read the  only FRONT side of Aadhaar card and give date in YYYY-MM-DD and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string.";
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());
    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        frontprompt,
    ]);
    console.log(result.response.text())

    const cleaned = result.response.text().replace(/```json|```/g, '').trim();
    const jsonData = JSON.parse(cleaned);
    console.log(jsonData);

    return jsonData

}

// ---------gen ai   back side of adhar crd----------//
async function ConnectToGeminiBack(imgurl) {
    //  console.log("Before Back Gemini");
    const backprompt = "Read the  only BACK side of Aadhaar card and give output STRICTLY in JSON format {address:''}. Dont give output as string.";
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        backprompt,

    ]);
    // console.log("After Back Gemini");

    console.log(result.response.text())
    const cleaned = result.response.text().replace(/```json|```/g, '').trim();
    const jsonData2 = JSON.parse(cleaned);
    console.log(jsonData2);
    return jsonData2;

}

app.post("/ai-needy-profile", async function (req, resp) {
    let jsonFront;
    let jsonBack;
    let msg1 = "File not Uploaded";
    let myUrl1 = "nopic.jpg";
    if (req.files != null) {
        let fileName1 = req.files.AdharfrontPic.name;
        let fullPath1 = __dirname + "/uploads/" + fileName1;
        await req.files.AdharfrontPic.mv(fullPath1);
        msg1 = "Uploaded Successfully";
        await cloudinary.uploader.upload(fullPath1).then(async function (picUrlResult1) {
            myUrl1 = picUrlResult1.url;   //will give u the url of ur pic on cloudinary server
            console.log("************")
            console.log(myUrl1);
            jsonFront = await ConnectToGeminiFront(myUrl1);
            console.log(jsonFront);
            // resp.send(jsonResultFromAi);

        });

    }

    //File uploading 2
    let msg2 = "File Not Uploaded";
    let myUrl2 = "nopic.jpg";
    if (req.files != null) {
        let fileName2 = req.files.AdharBackPic.name;//uploaded files goes in file object 
        let fullPath2 = __dirname + "/uploads/" + fileName2;
        await req.files.AdharBackPic.mv(fullPath2);//saving pic in upload folder
        msg2 = "uploaded Successfully";
        await cloudinary.uploader.upload(fullPath2).then(async function (picUrlResult2) {
            myUrl2 = picUrlResult2.url;   //will give u the url of ur pic on cloudinary server
            console.log("****")
            console.log(myUrl2);
            jsonBack = await ConnectToGeminiBack(myUrl2);
            console.log(jsonBack);
            // resp.send(jsonResultFromAi);
        })
    }

    let emailid = req.body.inputEmail;
    let mobile = req.body.inputMobile;
    let name = jsonFront.name;
    let acardno = jsonFront.adhaar_number;
    let gender = jsonFront.gender;

    // Convert DD/MM/YYYY to YYYY-MM-DD
    let dob = jsonFront.dob;

    let address = jsonBack.address;


    mysqlCon.query(
        "INSERT INTO needys VALUES (?,?,?,?,?,?,?,?,?)",
        [
            emailid,
            mobile,
            myUrl1,      // fronturl
            myUrl2,      // rearurl
            name,
            acardno,
            address,
            gender,
            dob
        ], function (err) {

            if (err == null)
                // resp.send("Badhaii!!!! Record Saved Successfully");
                resp.sendFile(__dirname + "/public/response.html");
            else
                resp.send(err.message);
        })


})