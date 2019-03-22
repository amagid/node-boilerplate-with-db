# Node Boilerplate With DB Support
Basic Node application template with built-in MySQL database support.

## Backend Server Setup

### 1) Set Up The Database

This application utilizes a MySQL database for all of its storage needs. It was designed to operate with MySQL Server 8.0, but should also work with MySQL Server versions as old as 5.7.

The first step to setting up the database for this application is to download and install MySQL Server at least version 5.7.

```
sudo apt-get install mysql-server
```

Once this is complete, we need to create the databases and users that will be used by the application. The SQL for these operations is included in the **db-init.sql** file. You can import the 
whole **db-init.sql** file into MySQL with the following command, or open up a MySQL terminal instance and paste the SQL contained in the **db-init** file directly there.

```
mysql -u root -p mysql < path/to/db-init.sql
```

You will be prompted for the MySQL password after entering this command.

Once the databases and users have been created by this import, we will need to fill in the table structure for the databases. There are two other SQL files included with this application: 
**dbdump.sql** and **dbdump-testing.sql**. As you may guess, the **dbdump.sql** file includes table structure and some meaningless test data for the main application database, and 
**dbdump-testing.sql** contains table structure and very specific testing data which is used for automated testing of the system.

Import both of these files into MySQL, *and make sure they are imported into their correct respective databases!* You can use the following two commands, or copy all of the SQL included in the 
files and paste it into a MySQL terminal session *that is using the correct databases at the time.*

```
mysql -u root -p boilerplate < path/to/dbdump.sql

mysql -u root -p boilerplate_testing < path/to/dbdump-testing.sql
```

Congratulations! Your database should now be set up.

### 2) Configure The Application

For security reasons, this application package omits a few files, and configures version-control systems to ignore them. These files include the server logs as well as any file which may include 
passwords or other sensitive information. Please create the following files and directories:

- In the **config** directory, find the file named *development.json.sample*. Make two copies of this file. Name one copy *development.json* and the other *production.json*. These two files 
control the configuration data for the application when in development and live production use, respectively. In each file, fill in the fields marked with angle brackets (<>). For the "db" 
section, the username and password can be found in the *db-init.sql* file; use the information for the **boilerplate_server** user. **Please note that some external services, including the Google 
Maps API, may require that this server's IP address be whitelisted in their sprcific management console.**
- In the **config/keys** directory, create two files: *jwt-public.key* and *jwt-private.key*. Generate an RSA key pair and save the public and private keys to these files, respectively.

### 3) Install The Core Dependencies

#### Utility Dependencies

Depending on your cloud solution, there may be some core dependencies missing from your machine. While it is impossible to anticipate all of the packages that may be missing, **please watch for 
error messages throughout the installation process. Most systems will tell you what packages are missing.** Below is a list of packages that have been noticed missing during various installation 
processes, with associated installation commands:

- **make**: sudo apt-get install make
- **g++**: sudo apt-get install g++
- **PM2**: sudo apt-get install pm2

#### Node & NPM

This application requires Node.js and NPM. The application was built using Node.js version 10.9.0, scheduled for Long Term Support until April 2021. Please install the closest version to 10.9 as 
you can. If you install Node.js from the official website, the installation will include NPM. While installation commands differ by operating system, the command used for Ubuntu 18.04 is 
included below. **Note: a reboot may be required after installing Node.js.**

```
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Once the installation is complete, you can verify the success of the installation by opening a command prompt and typing the following commands:

```
node -v
npm -v
```

The `node -v` command should output the version of Node.js which you installed. The `npm -v` command should output the version of NPM included with your installation. This application was built 
using Node version 10.9.0 and NPM version 5.6.0.

### 4) Install The NPM Package Dependencies

**NEW: The Backend repository now includes an update script which can also be used to finish the installation process. The script should be run from the root of the Backend code directory with 
the command *./scripts/update.sh*. However, this script requires that the Backend and Frontend code folders be siblings in their installation directories. That is, as long as when you initially 
ran the *git clone* commands, you ran them from the same directory, the install script should work. However, in case there are issues with the script, full instructions are included below. ALSO: 
You will need to do the final steps under *Webserver Setup* regardless of whether or not you use the update script!**

To keep the application small, the source code does not ship with its NPM dependencies included. Don't worry though - installing them is simple. Open a command prompt and navigate to the root 
directory of this project. Once you're there, type the following command:

```
npm install
```

This operation will install all of the NPM dependencies of this application, and may take a few minutes. Once the operation is complete, the application should be ready to go! 

### 5) Test The Application

As a final precaution, it is always a good idea to test all features of the application. This application comes with a comprehensive automated testing suite which can be run with the following 
command:

```
npm run test:dev
```

OR

```
npm run test:prod
```

All of the tests should pass. If any do not, the reliability of the application cannot be guaranteed, and the problem should be investigated. If they do pass, congratulations! The Backend Server is ready for use.

### 6) Start The Server

Now that the application is fully installed, let's start it up! Start the server with the following command:

```
npm run start:dev
```

OR

```
npm run start:prod
```

You should see at least two messages. One should be *"Database connection has been established successfully"* and the other should read *"Server listening on port \<port number\>."* If you see 
these two messages, the application is running!

## Frontend Application Setup

Now that the Backend Server is set up, we need to set up the Frontend GUI Application! Navigate over to the directory in which you cloned the Frontend Application Git repository.

### 1) Configure The Application

The first step in setting up the Frontend Application is to ensure it is configured properly for its new environment. Go to the *src/environments* directory and update the files within it to 
reflect the environment in which the application will be running. As of this writing, the only field that needs to be updated is the Maps API Key, which should be a Google Maps API Key with 
permission to generate and view Maps and also to GeoCode. You can create these keys through the Google Cloud Platform.

### 2) Install The NPM Package Dependencies

**NEW: The Backend repository now includes an update script which can also be used to finish the installation process. The script should be run from the root of the Backend code directory with 
the command *./scripts/update.sh*. However, this script requires that the Backend and Frontend code folders be siblings in their installation directories. That is, as long as when you initially 
ran the *git clone* commands, you ran them from the same directory, the install script should work. However, in case there are issues with the script, more instructions are included below. ALSO: 
You will need to do the final steps under *Webserver Setup* regardless of whether or not you use the update script!**

To keep the application small, the source code does not ship with its NPM dependencies included. Don't worry though - installing them is simple. Open a command prompt and navigate to the root 
directory of the Frontend code. Once you're there, type the following command:

```
npm install
```

This operation will install all of the NPM dependencies of this application, and may take a few minutes. Once the operation is complete, the application should be ready to go! 

### 3) Run The Build Script

Now that the application is fully installed, we need to run the build scripts to compile the application into a useable format. Use the following command to do that:

```
npm run build
```

The build process can easily take up to a few minutes, so go get a coffee while you're waiting.

Once the build process is complete, all that is left to do is set up a webserver to serve the application to users!

## Webserver Setup

This application was build to use NginX as its webserver, however any webserver system should work (such as Apache). Instructions are included below for NginX.

### 1) Install NginX

This one is simple - NginX can be installed through most linux package managers. For our Ubuntu 18.04 server, we're using the following command:

```
apt-get install nginx
```

### 2) Configure NginX

Once the install process has completed, we need to configure NginX. In the Frontend code repository, there is an **nginx.conf.sample** file. Copy the contents of this file into your main 
**nginx.conf** file. The location of this file varies with operating system, but a quick google search should help you find it. For us, it is located at **/etc/nginx/nginx.conf**.

You will need to update the root location, which is surrounded in angle brackets in the sample file. That line needs to contain the file path to the **dist** folder inside the Frontend 
application code. The dist folder is created when you run the build scripts in step 5 of the frontend application setup.

### 3) Reload NginX

In order for the new configuration to take effect, you need to tell NginX to reload. You can do this with the following command:

```
nginx -s reload
```

**You may need root access to perform this command.** Once NginX has updated, the application should be ready for use! Open a web browser and go to the IP address of the server you installed the 
application on. You should see the application load!
