# Procedure to create a remote couchdb database

In order to run element-api in production you will need to define a `ELEMENT_COUCHDB_REMOTE` in your `.env` file. Here is how you can obtain one for free (up to 1GB of data)

## Registering an IBM Cloud account

- Head to https://cloud.ibm.com
- Click "Create an IBM Cloud account"
- Fill out your info and click "Create account"
- Check your email to confirm the account then log in
- Accept the privacy policy and you should land on the Dashboard

## Creating the database

- On the [Dashboard](https://cloud.ibm.com) click on "Create resource"
- In the Databases section, click on "Cloudant"
- Name your instance (or keep the default value) and select "Use both legacy credentials and IAM" under authentication methods
- Then hit "Create" button in the right pane
- You should see your Cloudant resource in the Resource list, click on its name
- Copy "External Endpoint (preferred)" that's your `ELEMENT_COUCHDB_REMOTE`
- You can click on the "Launch Cloudant Dashboard" to see and manage your couchdb databases
