
# Copy User Roles
<img align="right" src="./cloudapp/src/assets/app-icon.png" width="100" style="border-radius: 3px">

An [ExLibris Alma CloudApp](https://developers.exlibrisgroup.com/cloudapps/), which allows to copy user roles from one user to another.

<br>
<br>

## How to use
1. Install the 'Copy User Roles' CloudApp (see: [ExLibris documentation on using CloudApps](https://knowledge.exlibrisgroup.com/Alma/Product_Documentation/010Alma_Online_Help_(English)/050Administration/050Configuring_General_Alma_Functions/Configuring_Cloud_Apps#Using_Cloud_Apps))
1. Open the user record in Alma which is to receive new roles
1. Open the 'Copy User Roles' CloudApp
1. The current user record is selected as target user
1. In the CloudApp, search for the user from whom the roles are to be copied
1. Select the user form the list
1. Click the 'Copy user roles' button

### Please note: all roles must be valid
* In order to copy user roles, all roles of the source user must be valid
* When selecting the source user the roles will be validated
* If not all roles are valid, copying is not possible. The roles must first be correctly configured
* There will be a dialog with the error message from Alma, which should help to find the role which is not correctly configured
* The error message is most detailed in english. If you are using another language than entlish and the error message does not help, try switching to english