# Females-Enraged-Bot-0024
This is the source code for Facebook bot Females Enraged Bot 0024.
You can do whatever you want with this, crediting is not required.

# Required node modules

You're gonna need to install these modules to run the bot:

```
npm i fb
npm i canvas
npm i cloudinary
npm i sqlite3
npm i minimist
npm i chance
npm i dotenv
```

After you're done you're pretty much good to go.

# Command Line Arguments

The bot accepts the following command line arguments (you can run the bot without any of them and it'll just use the default settings):

**--width**: Width of the canvas (default: 510).

**--height**: Height of the canvas (default: 180).


**--r**: 0-255 value for the red value (this controls the background color, default is 255).

**--g**: 0-255 value for the green value (this controls the background color, default is 255).

**--b**: 0-255 value for the blue value (this controls the background color, default is 255).

Example: 
``` 
node bot.js --width 1200 --height 650 --r 130 --g 40 --b 192
```


**--filename**: Name of the image to be saved (without the extension, default is feb_final_image). 

Example: 
``` 
node bot.js --filename "my image" 
```


**--name**: Name to be used for the hook. (Randomized by default).

**--adjective**: Adjective to be used for the hook. (Randomized by default).

**--times**: Number of times to be used for the hook. (Randomized by default).

**--rapname**: Rap name to be used for the hook. (Randomized by default). 

Example: 
``` 
node bot.js --name "Github" --adjective "Nice" --times 99 --rapname "Lil Biggie"
```

**-u**: If provided, the bot will try to upload the image to Cloudinary and then to Facebook. Won't work if you don't have an .env file with the required fields in it. (Off by default).

Example: 
``` 
node bot.js -u
```

Below is an example of running the bot using every argument (note that they can be in any order, however arguments are case-sensitive so be careful with that):

Example: 
``` 
node bot.js --width 1000 --height 600 --r 155 --g 120 --b 95 --name "Foo" --adjective "Bar" --times 12 --rapname "foobar" --filename "foobar" -u
```

# API Keys

If you want to use the uploading capabilities of the bot, you're gonna need to store your API keys in a .env file. Creating and including a .env file is not required, however installing the dotenv module is. 

You're going to want to setup your .env file like this:

**FB_API_KEY**=YOUR FACEBOOK API KEY

**CLOUDINARY_CLOUD_NAME**=YOUR CLOUDINARY CLOUD NAME

**CLOUDINARY_API_KEY**=YOUR CLOUDINARY API KEY

**CLOUDINARY_API_SECRET**=YOUR CLOUDINARY API SECRET

**FB_PAGE_ID**=YOUR FACEBOOK PAGE ID


# Other stuff

I'm using Priori Sans to draw the hook text on the canvas, however this is not included in the repository. To use it just install it as a system font or include it in the ".fonts" folder as a .ttf file.
