#!/bin/bash
LIGHT_BLUE='\033[1;36m'
YELLOW='\033[1;33m'
GREEN='\033[1;32m'
WHITE='\033[1;37m'
BACKEND_GITHUB_REPO_NAME='node-boilerplate-with-db'
FRONTEND_GITHUB_REPO_NAME=''
FRONTEND_DIRECTORY='../frontend'
clear
echo -ne "${LIGHT_BLUE}New Version Number (ex: v6.3.7): "
read version
echo ""
echo ""
echo -ne "${LIGHT_BLUE}Git Username: "
read git_username
echo ""
echo -ne "${LIGHT_BLUE}Git Password: "
read -s git_password
echo ""
echo ""
echo -ne "${LIGHT_BLUE}DB Password: "
read -s db_password
echo ""
echo -e "${YELLOW}Killing Active Server Instances...${WHITE}"
pm2 kill
sleep 1
clear
echo -e "${YELLOW}Server Instances Stopped!${WHITE}"
echo -e "${YELLOW}Updating Backend Server Code...${WHITE}"
git stash > /dev/null
git checkout master > /dev/null
git pull https://$git_username:$git_password@github.com/amagid/$BACKEND_GITHUB_REPO_NAME.git
git fetch https://$git_username:$git_password@github.com/amagid/$BACKEND_GITHUB_REPO_NAME.git --tags
echo ""
git checkout $version > /dev/null
clear
echo -e "${YELLOW}Code Updated!${WHITE}"
# echo -e "${YELLOW}Preparing Database Files For Update${WHITE}"
# sed -i 's/ COLLATE=utf8mb4_0900_ai_ci//g' db-init.sql
# sed -i 's/ COLLATE=utf8mb4_0900_ai_ci//g' dbdump.sql
# sed -i 's/ COLLATE=utf8mb4_0900_ai_ci//g' dbdump-testing.sql
# clear
# echo -e "${YELLOW}Importing New DB Files...${WHITE}"
# mysql -uroot -p$db_password cti_panels < db-init.sql
# mysql -uroot -p$db_password cti_panels < dbdump.sql
# mysql -uimporter -pimporter boilerplate_testing < dbdump-testing.sql
# clear
# echo -e "${YELLOW}DB Updated!${WHITE}"
echo -e "${YELLOW}Installing Dependencies...${WHITE}"
npm install
clear
echo -e "${YELLOW}Dependencies Installed!${WHITE}"
echo -e "${YELLOW}Formatting NPM Scripts${WHITE}"
sed -r -i 's/set ([A-Za-z_=]+)& set ([A-Za-z_=]+)&/\1 \2/' package.json
echo -e "${YELLOW}Restarting Server...${WHITE}"
npm run start:dev
sleep 1s
clear
echo -e "${GREEN}====================${WHITE}"
echo -e "${GREEN}  -Server Updated-  ${WHITE}"
echo -e "${GREEN}====================${WHITE}"
echo ""
sleep 2s
clear
echo -e "${YELLOW}Updating Frontend Application Code...${WHITE}"
cd ${FRONTEND_DIRECTORY}
sudo git stash > /dev/null
sudo git checkout master > /dev/null
echo -e "${LIGHT_BLUE}"
sudo git pull https://$git_username:$git_password@github.com/amagid/$FRONTEND_GITHUB_REPO_NAME.git
sudo git fetch https://$git_username:$git_password@github.com/amagid/$FRONTEND_GITHUB_REPO_NAME.git --tags
echo ""
echo -e "${WHITE}"
sudo git checkout $version
clear
echo -e "${YELLOW}Frontend Code Updated!${WHITE}"
echo -e "${YELLOW}Installing Dependencies...${WHITE}"
sudo npm install
clear
echo -e "${YELLOW}Dependencies Installed!${WHITE}"
echo -e "${YELLOW}Rebuilding Angular Application...${WHITE}"
sudo npm run build
sleep 1s
clear
echo -e "${GREEN}====================${WHITE}"
echo -e "${GREEN} -Frontend Updated- ${WHITE}"
echo -e "${GREEN}====================${WHITE}"
echo ""
sleep 2s
clear
echo -e "${GREEN}====================${WHITE}"
echo -e "${GREEN}     -All Done-     ${WHITE}"
echo -e "${GREEN}====================${WHITE}"
echo ""
exit
