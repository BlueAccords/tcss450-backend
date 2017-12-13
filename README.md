# tcss450-backend
Backend nodejs server for tcss450

## Set up
You will need to add two files:
- `server/config/config.json` which holds the configuration for the databases
- `server/config/secret.js` which holds the username/password for sending emails

I have already set up placeholder files in the `secret/config` directory with the  
correct format these files should have so you only have to replace the values within these files,  
and rename them to the correct name.  

You will also have to do the standard set up for a node project:
1. start an mysql instance
2. `npm install`
3. `npm run start`

If `npm run start` doesn't work try `node index.js`
