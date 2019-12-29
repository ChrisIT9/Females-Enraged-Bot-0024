    require('dotenv').config() // loads the api key from your .env file
    const fs = require('fs');
    const FB = require('fb');
    var Canvas = require('canvas');
    const  { Image } = require('canvas') // i gotta be honest, i have no idea why this require needed to be different from the others to work.
    var cloudinary = require('cloudinary').v2;
    var Chance = require('chance');
    var sqlite3 = require('sqlite3').verbose();
    var argv = require('minimist')(process.argv.slice(2));


    try {
        FB.setAccessToken(process.env.FB_API_KEY); // set api keys for facebook and cloudinary

        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET 
        });

        var PAGE_ID = process.env.FB_PAGE_ID; // facebook page id
    } catch(e) {
        console.log(e);
    }


    // main variables declaration and assignment

    var chance = new Chance();

    var N_OF_NAMES, N_OF_ADJECTIVES;

    var N_OF_USER_SUBMISSIONS;

    var Credits;

    var Name;
    var Adjective;
    var rapName;
    var nOfTimes;

    var fontSize;

    var canvas, context;

    var textWidth;

    var r, g, b;
    
    var width, height;

    r = argv.r != null ? argv.r : 255;
    g = argv.g != null ? argv.g : 255;
    b = argv.b != null ? argv.b : 255;

    width = argv.width != null ? argv.width : 510;
    height = argv.height != null ? argv.height : 180;

    var fontSize = ((width + height) * 0.051).toString();

    

    // setter functions

    function setCredits(newCredits) {
        if (Credits == null) Credits = newCredits;
        else Credits += ", " + newCredits;
    }

    async function setName() {
        Name = await getRandomName();
    }

    async function setAdjective() {
        Adjective = await getRandomAdjective();
    }
    
    function setFontSize(newFontSize) {
        fontSize = newFontSize;
    }

    function calculateTextWidth(widthOne, widthTwo, widthThree) {
        textWidth = widthOne + widthTwo + widthThree;
    }

    async function setRapName() {
        rapName = await getRandomRapName();
    }

    async function setNumberOfTimes() {
        nOfTimes = await generateNumberOfTimes();
    }

    async function setNumberOfNames() {
        N_OF_NAMES = await getNumberOfNames();
    }

    async function setNumberOfAdjectives() {
        N_OF_ADJECTIVES = await getNumberOfAdjectives();
    }

    async function setNumberOfUserSubmissions() {
        N_OF_USER_SUBMISSIONS = await getNumberOfUserSubmissions();
    }

    async function getNumberOfNames() {
        return new Promise(function(resolve, reject) {
            db.serialize(function() {
                db.all("SELECT COUNT(*) AS count FROM names", [], (err, rows) => {
                    if (err) {
                        throw err;
                    }
                    resolve(rows[0].count);
                })
            });
        })
    }

    async function getNumberOfAdjectives() {
        return new Promise(function(resolve, reject) {
            db.serialize(function() {
                db.all("SELECT COUNT(*) AS count FROM adjectives", [], (err, rows) => {
                    if (err) {
                        throw err;
                    }
                    resolve(rows[0].count);
                })
            });
        })
    }

    async function getNumberOfUserSubmissions() {
        return new Promise(function(resolve, reject) {
            db.serialize(function() {
                db.all("SELECT COUNT(*) AS count FROM names WHERE submitted_by IS NOT NULL UNION ALL SELECT COUNT(*) AS count FROM adjectives WHERE submitted_by IS NOT NULL UNION ALL SELECT COUNT(*) AS count FROM rap_names WHERE submitted_by IS NOT NULL", [], (err, rows) => { // i still need to pass my databases class
                    if (err) {
                        throw err;
                    }
                    var submissionsTotal = rows[0].count + rows[1].count + rows[2].count;
                    resolve(submissionsTotal);
                })
            });
        })
    }

    function generateNumberOfTimes() {
        return new Promise(function(resolve, reject) {
            if (chance.integer({min: 0, max: 300}) == 69) {
                nOfTimes = 69; // nice
                console.log("Nice. Set nOfTimes to 69.");
            } 
            else nOfTimes = Math.floor(Math.random() * (36 - 2 + 1)) + 2;
            resolve(nOfTimes);
        })
    }

    async function getRandomName() { 
        return new Promise(function(resolve, reject) {
            db.serialize(function() {
                db.all("SELECT name, submitted_by FROM names ORDER BY RANDOM() LIMIT 1;", [], (err, rows) => {
                    if (err) {
                        throw err;
                    }
                    console.log(rows[0]);
                    if (rows[0].submitted_by != null) setCredits(rows[0].submitted_by.trim());
                    resolve(rows[0].name.trim());
                })
            });
        })
    }

    async function getRandomAdjective() { 
        return new Promise(function(resolve, reject) {
            db.serialize(function() {
                db.all("SELECT adjective, submitted_by FROM adjectives ORDER BY RANDOM() LIMIT 1;", [], (err, rows) => {
                    if (err) {
                        throw err;
                    }
                    console.log(rows[0]);
                    if (rows[0].submitted_by != null) setCredits(rows[0].submitted_by.trim());
                    resolve(rows[0].adjective.trim());
                })
            });
        })
    }
    
    async function getRandomRapName() { 
        return new Promise(function(resolve, reject) {
            db.serialize(function() {
                db.all("SELECT rap_name_template FROM rap_name_templates ORDER BY RANDOM() LIMIT 1;", [], (err, rapNameTemplateRow) => { // uuuhhh, yeah, nested queries
                    if (err) {
                        throw err;
                    }
                    db.all("SELECT rap_name, submitted_by FROM rap_names ORDER BY RANDOM() LIMIT 1;", [], (err, rapNameRow) => {
                        if (err) {
                            throw err;
                        }
                        console.log(rapNameRow[0]);
                        if (rapNameRow[0].submitted_by != null) setCredits(rapNameRow[0].submitted_by.trim());
                        var finalRapName = rapNameTemplateRow[0].rap_name_template.trim().replace("NAME", rapNameRow[0].rap_name.trim());
                        resolve(finalRapName);
                    })
                })
            });
        })
    }

    

    
    function commentOnPost(responseID) { // function that is only used when the Credits variable is not undefined, so when the bot selects a user submission of any kind
        FB.api(
            "/" + responseID + "/comments",
            "POST",
            {
                "message": "Submission(s) by: " + Credits + "." + "\nCheck pinned post for info about submissions.\n" + "Number of names: " + N_OF_NAMES + "\nNumber of adjectives: " + N_OF_ADJECTIVES + "\nNumber of user submissions: " + N_OF_USER_SUBMISSIONS
            },
            function (response) {
              if (response && !response.error) {
                console.log("Posted succesfully: " + response.id);
              }
            }
        );
    }


    function uploadToFacebook(urlOfPic) { // main uploader function that calls the commentOnPost function if Credits are not undefined
        FB.api('/' + PAGE_ID + '/photos', 'post', {
            url: urlOfPic,
            message: Name + " " + Adjective + " (x" + nOfTimes + ")\n\nFrom " + rapName + "'s " + Name + " " + Adjective,
          }, function(response){
            if (response && response.id)
              console.log('Photo uploaded', response.id);
              if (Credits) {
                  commentOnPost(response.id); // comments on the post with credits
              }
          });
    } 


    function drawCanvas(r, g, b, cWidth, cHeight) { // draws a blank canvas with the deisred bg color and dimensions.
        canvas = Canvas.createCanvas(cWidth, cHeight);
        context = canvas.getContext('2d');
        var color = "rgb("+r+","+g+","+b+")";
        
        context.beginPath();
        context.moveTo(0, 00);
        context.lineTo(0, cHeight);
        context.lineTo(cWidth, cHeight);
        context.lineTo(cWidth, 0);
        context.closePath();
        context.lineWidth = 5;
        context.fillStyle = color;
        context.fill(); 
        context.font = (((width + height) * 0.051).toString()) + "px Priori Sans OT"; 
        context.fillStyle = "#000000";
        context.fillText("[Hook]", (width * 0.055), (height * 0.416));
    }

    function writeText() { // function that decreases font size if text width > image width, then writes the lyric on the canvas.
        calculateTextWidth(context.measureText(Name).width, context.measureText(Adjective).width, context.measureText(" " + " (x" + nOfTimes.toString() + ")").width); // we calculate the initial text width with the default font size
    
        while (textWidth > width - (width * 0.055) - 4 && parseInt(fontSize) > 1) { // canvas' width, amount of pixels from the left border, 
                                        // 4 is: 2 extra pixels of the grey rectangle under the text, 
                                        // 2 extra pixels from the right border just in case
                                        // also this sucks, is inefficient and not straight-forward at all
            var oldFontSize = parseInt(fontSize);
            oldFontSize--; // uuuhhh
            setFontSize(oldFontSize.toString());
            context.font = fontSize + "px Priori Sans OT";
            calculateTextWidth(context.measureText(Name).width, context.measureText(Adjective).width, context.measureText(" " + " (x" + nOfTimes.toString() + ")").width);
        }
        
        // we're done with the text width, now we simply draw the text over the canvas

        context.font = fontSize + "px Priori Sans OT";
        
        context.fillStyle = "rgb(233,233,233)";
        
        context.fillRect((width * 0.054), (height * 0.475), textWidth + 2, (parseInt(fontSize) * 0.94)); // this is for the grey rectangle under the text, it's always 2 pixels bigger

        context.textBaseline = "top";
        context.fillStyle = "#000000";
        context.fillText(Name + " " + Adjective + " (x" + nOfTimes + ")", (width * 0.055), (height * 0.475));

        calculateTextWidth(context.measureText(rapName + ', "').width, context.measureText(Name.toUpperCase() + " ").width, context.measureText(Adjective.toUpperCase() + '"').width);

        fontSize = ((width + height) * 0.025).toString();

        while (textWidth > width - (width * 0.01) - 2 && parseInt(fontSize) > 1) { // same exact thing for the hook, but this time it's for the rap name at the bottom of the image
            var oldFontSize = parseInt(fontSize);
            oldFontSize--;
            setFontSize(oldFontSize.toString());
            context.font = fontSize + "px Lato";
            calculateTextWidth(context.measureText(rapName + ', "').width, context.measureText(Name.toUpperCase() + " ").width, context.measureText(Adjective.toUpperCase() + '"').width);
        }

        // draw rap name

        context.textBaseline = "alphabetic";
        context.font = fontSize + "px Lato";
        context.fillStyle = "#000000";
        
        context.fillText(rapName + ', "' + Name.toUpperCase() + " " + Adjective.toUpperCase() + '"', (width * 0.01), (height * 0.955));

        if (Name == "Hoes" && Adjective == "Mad" && nOfTimes == 24) { // easter egg in case the impossible happens
            const img = new Image()
            img.onload = () => context.drawImage(img, (width * 0.785), 0)
            img.onerror = err => { console.log(err) }
            img.src = './images/pogchamp.png'
        }
    }

    function createPNG(nameOfFile) { // create the final png 
        const out = fs.createWriteStream(__dirname + '/images/' + nameOfFile + '.png')
        const stream = canvas.createPNGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The PNG file was created.'))
    }

    function uploadToCloudinary(nameOfPicture, nOfTries = 1) { // main upload function for cloudinary. it tries to upload 5 times and if it fails it posts a placeholder image
        if (nOfTries <= 5) {
            console.log("Trying to upload image. Try #" + nOfTries);
            cloudinary.uploader.upload("./images/" + nameOfPicture + ".png", 
                { public_id: nameOfPicture }, 
                function(error, result) {console.log(result, error);
                if (error) {
                    console.log("Error " + error.http_code + " " + error.message + " trying to upload. Trying " + (5 - nOfTries) + " more times");

                    if (error.http_code == 400) console.log("Probably tried to upload before picture was actually ready."); // this happens because the function that
                                                                                                                            // creates the PNG is async, so there's
                                                                                                                            // a chance it'll try to upload the image
                                                                                                                            // before the latter is actually ready

                    uploadToCloudinary(nameOfPicture, ++nOfTries);
                } 
                if (result) {
                    uploadToFacebook(result.url);
                }
            });
        }
        else if (nOfTries > 5) { 
            FB.api('/' + PAGE_ID + '/photos', 'post', {
                url: "https://res.cloudinary.com/ds2jgqdby/image/upload/v1558902669/catastrophe_b6jurz.png", // easter egg #2
                message: "Something went terribly wrong, couldn't upload image.",
              }, function(response){
                if (response && response.id)
                  console.log('Photo uploaded', response.id);
              });
        }
    }

    let db = new sqlite3.Database('./feb_db.db', (err) => { // try to connect to the database
        if (err) {
        console.error(err.message);
        }
        console.log('Connected to the database.'); // if we're connected start doing stuff
    });

    async function generateAndUploadImage() { // i know, i know, it actually does way more than that but it's 3am and i just wanted to get this done
        if (argv.name != null) Name = argv.name;
        else await setName();
        if (argv.adjective != null) Adjective = argv.adjective;
        else await setAdjective();
        if (argv.rapname != null) rapName = argv.rapname;
        else await setRapName();
        if (argv.times != null) nOfTimes = argv.times;
        else await setNumberOfTimes();
        if (argv.u) {
            await setNumberOfNames();
            await setNumberOfAdjectives();
            await setNumberOfUserSubmissions();
            console.log(Credits);
        }
        try {
            drawCanvas(r, g, b, width, height); // draw a 510x180 white canvas (default settings)
            writeText();
            createPNG(argv.filename != null ? argv.filename : "hoesmad");
            if (argv.u) uploadToCloudinary("hoesmad"); // uploads the png. the argument is the name of the file.*/
        } catch(e) {
            console.log(e);
        }
    }

   

    generateAndUploadImage();
    
    
    
    
    

    

    

    
    