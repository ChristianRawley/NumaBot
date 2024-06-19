# NumaBot: The perfect Discord bot for UAFS students
This project is a fun and simple Discord bot I started working on the summer before my first semester at UAFS. It is open-source and all are welcomed to contribute to it.
I am hoping to turn this into a React Native application if I have the time and finish most of the features I want to add to the bot.

This is developed by yours truly, Christian Rawley. You can email me at christianrawley0@gmail.com (personal) or crawle00@uafs.edu (university).

# Known Issues
There are currently no known issues. If you find an issue, please submit it to our [issues page](https://github.com/ChristianRawley/NumaBot/issues).

# Contributing
If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue. Don't forget to give the project a star!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b ChristianRawley/NumaBot`)
3. Commit your Changes (`git commit -m 'Add some feature'`)
4. Push to the Branch (`git push origin ChristianRawley/NumaBot`)
5. Open a Pull Request

# License
Distributed under the MIT License. See `LICENSE.txt` for more information.

# Build instructions
The Discord Bot can be added to your server by clicking [here](https://discord.com/oauth2/authorize?client_id=1249531339234087024&permissions=8&integration_type=0&scope=bot+applications.commands).

If you want to run the code on your own bot download [node.js](https://nodejs.org/en) and [git](https://www.git-scm.com/downloads), then run the following command in your terminal:
````
git clone github.com/ChristianRawley/NumaBot
````

Download the required packages using the following command in your terminal:
````
npm i
````

Create a file in your main folder titled .env with the following:
````
TOKEN=your token here (found in the discord application portal)
CLIENT=your client id here (found in the discord application portal)
````
Obviously, you will need to replace the text found after the "=" (equal) sign.

To run the bot, run the commands:
````
node deploy.js
node .
````

Your bot should now be online and ready to go.
