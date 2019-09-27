    require('dotenv').config() // loads the api key from your .env file
    const fs = require('fs');
    const FB = require('fb');
    var Canvas = require('canvas');
    const  { Image } = require('canvas') // i gotta be honest, i have no idea why this require needed to be different from the others to work.
    var cloudinary = require('cloudinary').v2;
    
    // set api keys for facebook and cloudinary

    FB.setAccessToken(process.env.FB_API_KEY);

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });


    // main variables declaration and assignment

    var N_OF_NAMES;
    var N_OF_ADJECTIVES;
    var N_OF_USER_SUBMISSIONS;
    var N_OF_TEMPLATES;
    var N_OF_RAPNAMES;
    var N_OF_RAPNAMES_SUBMISSIONS;

    var Credits;

    var Name;
    var Adjective;
    var rapName;

    var fontSize = "35";

    var canvas, context;

    var textWidth;

    // setter functions

    function setCredits(newCredits) {
        Credits = newCredits;
    }

    function setNOFNAMES(newNOFNAMES) {
        N_OF_NAMES = newNOFNAMES;
    }

    function setNOFADJECTIVES(newNOFADJECTIVES) {
        N_OF_ADJECTIVES = newNOFADJECTIVES;
    }

    function setNOFUSERSUBMISSIONS(newNOFUSERSUBMISSIONS) {
        N_OF_USER_SUBMISSIONS = newNOFUSERSUBMISSIONS;
    }

    function setNOFTEMPLATES(newNOFTEMPLATES) {
        N_OF_TEMPLATES = newNOFTEMPLATES;
    }

    function setNOFRAPNAMES(newNOFRAPNAMES) {
        N_OF_RAPNAMES = newNOFRAPNAMES;
    }

    function setNOFRNS(newNOFRNS) {
        N_OF_RAPNAMES_SUBMISSIONS = newNOFRNS;
    }

    function setName(line) {
        Name = line;
    }

    function setAdjective(line) {
        Adjective = line;
    }
    
    function setFontSize(newFontSize) {
        fontSize = newFontSize;
    }

    function calculateTextWidth(widthOne, widthTwo, widthThree) {
        textWidth = widthOne + widthTwo + widthThree; // calculates total text width given 3 individual widths
    }

    function generateRapName() {
        var template, tempName;
        get_line('./nametemplates.txt', indexOfTemplate, function(err, line){  //get_line is used to check a text file line by line
            template = line.trim();
        })
        get_line('./rapnames.txt', indexOfRapName, function(err, line){
            tempName = line.trim();
        })

        // we check if the selected name has credits attached to it i.e. user submissions
        for (i = 0; i < N_OF_RAPNAMES_SUBMISSIONS; i++) {
            get_line('./rapnamescredits.txt', i, function(err, line){
                if (line.trim().startsWith(tempName + ":", 0)) { 
                    console.log("Found line in credits " + line);
                    if (Credits) setCredits(Credits + ", " + line.substring(tempName.length + 2).trim());
                    if (!Credits) setCredits(line.substring(tempName.length + 2).trim());
                }
            })
        }

        return template.replace("NAME", tempName);
    }
    
    function commentOnPost(responseID) { // function that is only used when the Credits variable is not undefined, so when the bot selects a user submission of any kind
        FB.api(
            "/" + responseID + "/comments",
            "POST",
            {
                "message": "Submission(s) by: " + Credits + "." + "\nCheck pinned post for info about submissions.\n" + "Number of names: " + N_OF_NAMES + "\nNumber of adjectives: " + N_OF_ADJECTIVES + "\nNumber of user submissions: " + (N_OF_USER_SUBMISSIONS + N_OF_RAPNAMES_SUBMISSIONS)
            },
            function (response) {
              if (response && !response.error) {
                console.log("Posted succesfully: " + response.id);
              }
            }
        );
    }


    function uploadPicture(urlOfPic) { // main uploader function that calls the commentOnPost function if Credits are not undefined
        FB.api('/3057642924247718/photos', 'post', {
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

    function get_line(filename, line_no, callback) { // function used to check text files line by line. from http://researchhubs.com/post/computing/javascript/read-nth-line-of-file-in-nodejs.html
        var data = fs.readFileSync(filename, 'utf8');
        var lines = data.split("\n");
    
        if(+line_no > lines.length){
          throw new Error('File end reached without finding line');
        }
    
        callback(null, lines[+line_no]);
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
        context.font = "35px Priori Sans OT"; 
        context.fillStyle = "#000000";
        context.fillText("[Hook]", 28, 75);
    }

    function writeText(Name, Adjective, nOfTimes, rapName) { // function that decreases font size if it goes over the image's dimensions (i only check width), then writes the lyric on the canvas.
        calculateTextWidth(context.measureText(Name).width, context.measureText(Adjective).width, context.measureText(" " + " (x" + nOfTimes.toString() + ")").width); // we calculate the initial text width with the default font size
       
        while (textWidth > 510 - 28 - 4) { // 510 is the canvas' width, 28 is the amount of pixels from the left border, 
                                           // 4 is: 2 extra pixels of the grey rectangle under the text, 
                                           // 2 extra pixels from the right border just in case
            var oldFontSize = parseInt(fontSize);
            oldFontSize--; // uuuhhh
            setFontSize(oldFontSize.toString());
            context.font = fontSize + "px Priori Sans OT";
            calculateTextWidth(context.measureText(Name).width, context.measureText(Adjective).width, context.measureText(" " + " (x" + nOfTimes.toString() + ")").width);
        } 
        
        // we're done with the text width, now we simply draw the text over the canvas

        context.font = fontSize + "px Priori Sans OT";
        
        context.fillStyle = "rgb(233,233,233)";
        
        context.fillRect(27, 84, textWidth + 2, 33); // this is for the grey rectangle under the text, it's always 2 pixels bigger

        context.fillStyle = "#000000";
        context.fillText(Name + " " + Adjective + " (x" + nOfTimes + ")", 28, 110);

        calculateTextWidth(context.measureText(rapName + ', "').width, context.measureText(Name.toUpperCase() + " ").width, context.measureText(Adjective.toUpperCase() + '"').width);

        fontSize = "16";

        while (textWidth > 510 - 5 - 2) { // same exact thing for the hook, but this time it's for the rap name at the bottom of the image
            var oldFontSize = parseInt(fontSize);
            oldFontSize--;
            setFontSize(oldFontSize.toString());
            context.font = fontSize + "px Lato";
            calculateTextWidth(context.measureText(rapName + ', "').width, context.measureText(Name.toUpperCase() + " ").width, context.measureText(Adjective.toUpperCase() + '"').width);
        }

        // draw rap name

        context.font = fontSize + "px Lato";
        context.fillStyle = "#000000";
        context.fillText(rapName + ', "' + Name.toUpperCase() + " " + Adjective.toUpperCase() + '"', 5, 174);

        if (Name == "Hoes" && Adjective == "Mad" && nOfTimes == 24) { // easter egg in case the impossible happened, unfortunately it never did
            const img = new Image()
            img.onload = () => context.drawImage(img, 400, 0)
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
                                                                                                                            // before it's actually ready

                    uploadToCloudinary(nameOfPicture, ++nOfTries);
                } 
                if (result) {
                    uploadPicture(result.url);
                }
            });
        }
        else if (nOfTries > 5) { 
            FB.api('/3057642924247718/photos', 'post', {
                url: "https://res.cloudinary.com/ds2jgqdby/image/upload/v1558902669/catastrophe_b6jurz.png", // easter egg #2, never happened either
                message: "Something went terribly wrong, couldn't upload image.",
              }, function(response){
                if (response && response.id)
                  console.log('Photo uploaded', response.id);
              });
        }
    }

    // read and set each "number of" variable
    
    get_line('./stats.txt', 0, function(err, line){
        setNOFNAMES(parseInt(line));
    })
    get_line('./stats.txt', 1, function(err, line){
        setNOFADJECTIVES(parseInt(line));
    })
    get_line('./stats.txt', 2, function(err, line){
        setNOFUSERSUBMISSIONS(parseInt(line));
    }) 
    get_line('./stats.txt', 3, function(err, line){
        setNOFTEMPLATES(parseInt(line));
    }) 
    get_line('./stats.txt', 4, function(err, line){
        setNOFRAPNAMES(parseInt(line));
    }) 
    get_line('./stats.txt', 5, function(err, line){
        setNOFRNS(parseInt(line)); // messy variable names, sorry
    }) 



    drawCanvas(255, 255, 255, 510, 180); // draw a 510x180 white canvas
    

    // the actual rng part. pretty simple.
    var indexOfName = Math.floor(Math.random() * ((N_OF_NAMES - 1) + 1));
    var indexOfAdjective = Math.floor(Math.random() * ((N_OF_ADJECTIVES - 1) + 1));
    var nOfTimes = Math.floor(Math.random() * (36 - 2 + 1)) + 2;
    var indexOfRapName = Math.floor(Math.random() * ((N_OF_RAPNAMES - 1) + 1));
    var indexOfTemplate = Math.floor(Math.random() * ((N_OF_TEMPLATES - 1) + 1));

    
    get_line('./names.txt', indexOfName, function(err, line){
      setName(line); // set the name variable with the nth line of the names.txt file
    })

    get_line('./adjectives.txt', indexOfAdjective, function(err, line){
        setAdjective(line); // same as above but with the adjective
    })

    // get rid of any eventual whitespaces and such
    Name = Name.trim();
    Adjective = Adjective.trim();

    // credits checking part

    for (i = 0; i < N_OF_USER_SUBMISSIONS; i++) {
        get_line('./credits.txt', i, function(err, line){
            if (line.trim().startsWith(Name + ":", 0)) { 
                console.log("Found line in credits " + line);
                if (Credits) setCredits(Credits + ", " + line.substring(Name.length + 2).trim());
                if (!Credits) setCredits(line.substring(Name.length + 2).trim());
            }
            else if (line.trim().startsWith(Adjective + ":", 0)) {
                console.log("Found line in credits " + line);
                if (Credits) setCredits(Credits + ", " + line.substring(Adjective.length + 2).trim());
                if (!Credits) setCredits(line.substring(Adjective.length + 2).trim());
            }
        })
    }

    rapName = generateRapName(); // returns the rap name

    // debug

    console.log(Name + " " + Adjective + " " + nOfTimes);
    console.log(rapName);
    console.log("Credits: " + Credits);

    writeText(Name, Adjective, nOfTimes, rapName); // pretty self explanatory

    createPNG("hoesmad"); // creates and writes to disk the final png. the argument is the name of the file.

    uploadToCloudinary("hoesmad"); // uploads the png. the argument is the name of the file.

    
    