# A JavaScript mini-library to help connecting to M-Files REST API.

### Examples
````javascript
    // authenticate using M-Files user
    MFiles.user.auth({"Username":'demo',"Password":'demo'}, callback, errCallback);
    // Generates a list with download links
    MFiles.vault.searchDocuments({100:104, 'q':'volvo'}, 'list');
    // Returns an array of all vault classes
    MFiles.vault.getClasses().then(callback);
    // Returns an array of recently accesed objects
    MFiles.vault.getRecentlyAccessed().then(callback);
    // Returns an array of document collections filtered by class
    MFiles.vault.getDocumentCollectionsByClass(classId).then(callback);
    // Returns an array of documents filtered by class
    MFiles.vault.getDocumentsByClass(50).then(callback);
````

# Documentation

### Config object
The following variables and functions can be accesed using the path MFiles.config.

````javascript
    config : {
        // variables
        __tokenName: __tokenName,
        // functions
        getToken: getToken,
        storeToken: storeToken,
        setHost: setHost,
        setVault: setVault,
        generateHtmlLinks: generateHtmlLinks
    }
````

##### __tokenName
Usage: `MFiles.config.__tokenName = "my_own_token_name";`
Represents the name of the token when is stored in localStorage.

##### getToken
Usage: `MFiles.config.getToken()`
Returns the current users M-Files token.

##### storeToken(boolean)
Usage: `MFiles.config.storeToken(false);`
Triggers whether to store or not the token in the browser. In this case, the token will be stored solely in javascript and when the browser will refresh, the user will have to get a new token or you have to store the token somewhere else, like a database.

##### setHost
Usage: `MFiles.config.setHost("127.0.0.1");`
Sets the M-Files server address.

##### setVault
Usage: `MFiles.config.setVault("{35B5D2EE-7BF4-4D4E-9717-C292CBD81A7B}");`
Sets the M-Files vault to which the user will connect.

##### generateHtmlLinks
````javascript
    function generateHtmlLinks(data, id){
        data.Items.forEach(function(item){
            item.Files.forEach(function(file){
                var ul = document.getElementById(id);
                var li = document.createElement("li");
                var a = document.createElement("a");
                a.onclick = file.download;
                a.href = "";
                a.innerHTML = file.EscapedName;
                li.appendChild(a);
                ul.appendChild(li);
            });
        });
    }
````
This function is automatically called when you search the vault for objects.
You can overwrite it using : `MFiles.config.generateHtmlLinks = yourFunction()`


### User object
This object contains the function related to m-files user account.

````javascript
    user: {
        auth: auth,
        logout: logout,
        isLoggedIn: isLoggedIn
    }
````

##### auth
Usage: `MFiles.user.auth({"Username":"demo","Password":"demo"}, callback, errCallback);`

The auth function accepts 3 parameters. First one contains the username and credentials sent as an object, second is the success callback and the third is the error callback.

It sets the token to localStorage and to javascript in order to use it further for other interogations to the API.

##### logout
Usage: `MFiles.user.logout()`
Logouts from the M-Files server and deletes the token from the storage, also from javascript.

##### isLoggedIn
Usage: `MFiles.user.isLoggedIn()`
Returns true or false, by checking if the current token(if any) is still valid.


### Vault object
This object contains the functions related to document operations in the M-Files vault.

````javascript
    vault: {
        getObjectTypes: getObjectTypes,
        getClasses: getClasses,
        getRecentlyAccessed: getRecentlyAccessed,
        getDocumentsByClass: getDocumentsByClass,
        getDocumentCollectionsByClass: getDocumentCollectionsByClass,
        searchDocuments: searchDocuments
    }
````

##### getObjectTypes
Usage: `MFiles.vault.getObjectTypes(type [optional])`
Returns a list of all objects on the server.

##### getClasses
Usage: `MFiles.vault.getClasses(objectId [optional], byGroup [optional])`
Returns a list of the current classes on the server.

##### getRecentlyAccessed
Usage: `MFiles.vault.getRecentlyAccessed()`
Returns most recent accesed objects by current user.

##### getDocumentsByClass
Usage: `MFiles.vault.getDocumentsByClass(classId)`
Returns documents filtered by class.

##### getDocumentCollectionsByClass
Usage: `MFiles.vault.getDocumentCollectionsByClass(classId)`
Returns document collections filtered by class.

##### searchDocuments
Usage: `MFiles.vault.searchDocuments(params, listId, callback [optional], errCallback [optional])`
Ex: MFiles.vault.searchDocuments({"q":"My document", "100":50, "120":4}, successFunction, errorFunction);
* q contains the Search query term.
* 100 represents the class property and in the above example we are searching for all objects that have the class matching the ID 100.
* 120 represents a property with the ID 120 and 4 is the entry in this value list.
* listId - Represents the ID# of the container in HTML in which the list with the files will be generated. Ex: <ul id="list"></ul>
* successFunction is called if the search is executed succesfuly.
* errorFunction is called when an error occurs.

The final result will look like this:
````html
    <ul id="list">
        <li><a href="">VOLVO DEMO.xlsx</a>
        </li>
    </ul>
````

### More information

````javascript
    // The first parameter is an object. The key represents the property ID from M-Files vault and it's followed by the value.
    // In the below example, will search for the class with ID 104 and that contains the text "volvo";
    // This function generates a list of links, that will be attached to the <ul id="list"></ul> element.
    MFiles.vault.searchDocuments({100:104, 'q':'volvo'}, 'list');
````


## Changelog

Version 0.1
* M-Files user authentication.
* M-Files search.
* Get object types, class types and documents from the server/
* Generation of list with download links

# Contributors

* Alexandru Muntean


# License

The MIT License

Copyright (c) 2016 Softventure.ro http://www.softventure.ro

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.