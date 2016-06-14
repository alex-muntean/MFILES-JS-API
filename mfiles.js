var MFiles = (function(){
	/**
	 * defined constants
	 */
	var __host = null,
		__vault = null,
		__token = null,
		__storeToken = true,
		__noTokenIsSetError = "The token is null. Cannot send request to server.",
		__tokenName = 'mfiles_api_token';

	/**
	 * The main IDs of the M-Files
	 * @type object
		var __main_IDs = {
			"objects": {
				"document":0,
				"documentCollection":9
			},
			"properties": {
				"nameOrTitle": 0,
				"class": 100,
				"created": 20,
				"lastModified": 21
			},
			"classes": {
				"unclassifiedDocument": 0,
				"report": -101,
				"assignment": -100
			}
		};
 	*/

	/**
	 * returns a list of all objects on the server
	 * @param  int type filter by type
	 * @return array
	 */
	function getObjectTypes(type = false){
		if (__token) {
			return $http(__host+'/objects'+(type != false ? '/'+type : ''))
				.get();
		} else {
			throw __noTokenIsSetError;
		}
	}

	/**
	 * Download file helper - It creates a link that clicks itself
	 * @param  int objectID The ID of the M-Files object
	 * @param  int fileID The ID of the file inside the M-Files object
	 */
	function downloadFile(objectID, fileID){
		// Construct the a element
		return function(){
		    var link = document.createElement("a");
		    link.target = "_blank";

		    // Construct the uri
		    link.href = __host + '/objects/0/'+objectID+'/latest/files/'+fileID+'/content?auth='+__token;
		    document.body.appendChild(link);
		    link.click();

		    // Cleanup the DOM
		    document.body.removeChild(link);
		    delete link;
		}
	}

	/**
	 * Searches documents
	 * @param  object params Search params
	 * @param  string listId The ID# of the UL element in which the list will be generated
	 * @param  function callback Callback function
	 * @param  function errCallback Error callback function
	 * @return array The search result
	 */
	function searchDocuments(params, listId, callback = false, errCallback = false){
		if (__token) {
			var queryString = '';
			var argCount = 0;
			// check if object is empty
			if ( !(Object.keys(params).length === 0 && params.constructor === Object) ) {
				for(var index in params) {
				    if (argCount == 0){
						queryString += '?';
						argCount++;
					} else {
						queryString += '&';
					}
					if (index == 'q'){
						queryString += 'q='+params[index];
					} else {
						queryString += 'p'+index+'='+params[index];
					}
				}
			}
			$http(__host+'/objects/0'+queryString)
				.get()
				.then(function(data){
					// string to JSON
					data = JSON.parse(data);
					// adds a download function to each file
					data = createDownloadLink(data);
					// generate the list with the links for the file download
					generateHtmlLinks(data, listId);
					if (callback != false){
						callback(data);
					}
				},
				function(data){
					if (errCallback != false){
						errCallback(data);
					}
				});
		} else {
			throw __noTokenIsSetError;
		}
	}

	/**
	 * Append to each file a function to download itself
	 * @param  array - Array with M-Files objects and files
	 * @return array - Array with M-Files object and files with download function
	 */
	function createDownloadLink(data) {
		data.Items.forEach(function(item){
			item.Files.forEach(function(file){
				file.download = downloadFile(item.ObjVer.ID, file.ID);
			});
		});
		return data;
	}

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

	/**
	 * Retrieve all documents belonging to a specific class
	 * @param  int classID - ID of the specific class
	 * @return promise
	 */
	function getDocumentsByClass(classID) {
		if (__token) {
			return $http(__host+'/objects/0?p100='+classID)
				.get();
		} else {
			throw __noTokenIsSetError;
		}
	}

	/**
	 * Retrieve all documents collections belonging to a specific class
	 * @param  int classID - ID of the specific class
	 * @return promise
	 */
	function getDocumentCollectionsByClass(classID) {
		if (__token) {
			return $http(__host+'/objects/9?p100='+classID)
				.get();
		} else {
			throw __noTokenIsSetError;
		}
	}

	/**
	 * returns the most recenly accessed objects by the current user
	 * @return array
	 */
	function getRecentlyAccessed(){
		if (__token) {
			return $http(__host+'/recentlyaccessedbyme')
				.get();
		} else {
			throw __noTokenIsSetError;
		}
	}

	/**
	 * Returns a list of all classes from the server
	 * @param  int objectID - filters the classes list by object
	 * @param  boolean byGroup - returns a list of classes grouped by parent
	 * @return array of objects containing the description of the classes
	 */
	function getClasses(objectID = false, byGroup = false){
		if (__token) {
			return $http(__host+'/structure/classes'+(objectID != false ? '/'+objectID : '')+(byGroup != false ? '/'+byGroup : ''))
				.get();
		} else {
			throw __noTokenIsSetError;
		}
	}

	/**
	 * getFavorites
	 * get user favorite objects
	 */
	function getFavorites(){
		if (__token) {
			return $http(__host+'/structure/classes'+(objectID != false ? '/'+objectID : '')+(byGroup != false ? '/'+byGroup : ''))
				.get();
		} else {
			throw __noTokenIsSetError;
		}
	}

	/**
	 * storeToken - a function to toggle whether to store token in storage or not.
	 * @param  boolean value
	 */
	function storeToken(value){
		if (typeof value === 'boolean' ) {
			__storeToken = value;
		} else {
			throw "The parameter must be of type boolean.";
		}
	}
	/**
	 * deletes the token from local storage
	 */
	function removeToken(){
		__token = null;
		localStorage.removeItem(__tokenName);
	}

	/**
	 * checks whether the current user is logged in or not
	 * @return {Boolean} [description]
	 */
	function isLoggedIn(){
		if (__token != null){
			http(__host+'/session')
				.get()
				.then(
					function(data){
						try {
							var result = JSON.parse(data)
						} catch (e) {
							throw "Error occured while decoding JSON response. (isLoggedIn)";
						}
						if(result.IsLoggedToVault && result.IsLoggedToApplication){
							return true;
						} else {
							return false;
						}
					}
				);
		}
		return false;
	}

	/**
	 * sets the token to javascript and to local storage if __storeToken is true
	 * @param string token - the authentication token sent by X-Authentication header to M-Files
	 */
	function setToken(token) {
		try {
			token_parsed = JSON.parse(token);
		} catch (e) {
			throw "Error occured while decoding JSON response. (setToken)";
		}
		__token = token_parsed.Value;
		if ( __storeToken ) {
			storeToken(__token);
		}
	}

	/**
	 * Returns the M-Files API token
	 * @return string M-Files API token
	 */
	function getToken() {
		return __token;
	}

	/**
	 * Sets host server
	 * @param string host Ex: 127.0.0.1, localhost etc.
	 */
	function setHost(host){
		__host = host;
	}

	/**
	 * Sets vault for the user to login into
	 * @param string vault Ex: {43D6F4FE-7BF4-4D4E-9717-C298BCC81A6B}
	 */
	function setVault(vault){
		__vault = vault;
	}

	/**
	 * store token in browser storage
	 * @param  string token Token used to authenticate into M-Files server using REST service
	 */
	function storeToken(token){
		removeToken(); // make sure there is no other token by removing it
		localStorage.setItem(__tokenName, token);
	}

	/**
	 * Authenticate user and retrieve token from M-Files server
	 * @param  object credentials - It must be of form: {"Username":"user", "Password":"pass"}
	 * @param Accepts callback that is injected in then function in order to process the response
	 * @param Accepts error callback that is injected in then function in order to handle the error
	 */
	function auth(credentials, callback = false, errCallback = false){
		// remove token from local storage if any
		removeToken();
		// set current vault
		credentials.VaultGuid = __vault;
		// authenticate
		$http(__host+'/server/authenticationtokens')
			.post(credentials)
			.then(function(data){
				setToken(data);
				if (callback != false){
					callback(data);
				}
			}, function(data){
				if (errCallback != false){
					errCallback(data);
				}
			});
	}

	// logout
	/**
	 * logout the user from M-Files vault
	 * @param  function callback - The success callback
	 * @param  function errCallback - Error callback
	 */
	function logout(callback = false, errCallback = false){
		$http(__host+'/session')
			.delete()
			.then(function(data){
				removeToken();
				if (callback != false){
					callback(data);
				}
			}, function(data){
				if (errCallback != false){
					errCallback(data);
				}
			});
	}

	/**
	 * A custom JavaScript function that is used to interogate the M-Files REST API
	 * @param  string url - The URL
	 * @return promise - It returns a promise that is later used to interogate the API
	 */
	function $http(url){
	  	var core = {
	    // Method that performs the ajax request
		ajax: function (method, url, args) {
		    var promise = new Promise( function (resolve, reject) {
		    	var client = new XMLHttpRequest();
		    	var uri = url;
		    	var params = {};
		    	// if the method is GET, then put the paramenters in the URL
		    	if (args && (method === 'GET')) {
		    	  	uri += '?';
		    	  	var argcount = 0;
		    	  	for (var key in args) {
			    	    if (args.hasOwnProperty(key)) {
			    	    	if (argcount++) {
			    	    		uri += '&';
			    	    	}
			    	    	uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
			    	    }
		    	  	}
		    	// if the method is POST, PUT or PATCH then send the parameters as form data
		    	} else if (args && (method === 'POST' || method === 'PUT' || method === 'PATCH')){
		    		for (var key in args) {
		    			if (args.hasOwnProperty(key)) {
		    				params[key] = args[key];
		    			}
		    		}
		    	}
		    	client.open(method, uri);
		    	// if the token is not null then send also the X-Authentication header
		    	if (__token != null) {
		    		client.setRequestHeader("X-Authentication", __token);
		    	}
		    	client.send(JSON.stringify(params));
		    	client.onload = function () {
			        if (this.status >= 200 && this.status < 300) {
			            // Performs the function "resolve" when this.status is equal to 2xx
			            resolve(this.response);
			        } else {
			            // Performs the function "reject" when this.status is different than 2xx
			            reject(this.statusText);
			        }
		        };
		        client.onerror = function () {
		        	reject(this.statusText);
		        };
		    });
		    return promise;
		  }
		};

		// Adapter pattern
		// Returns all methods
		return {
			'get': function(args) {
				return core.ajax('GET', url, args);
			},
			'post': function(args) {
				return core.ajax('POST', url, args);
			},
			'put': function(args) {
				return core.ajax('PUT', url, args);
			},
			'delete': function(args) {
				return core.ajax('DELETE', url, args);
			}
		};
	};

	// console.log function shorcut
	function log(msg){
		console.log(msg);
	}

	/**
	 * This loads then this JavaScript file is loaded into the document
	 */
	function init(){
		// get token from storage if any and save it into JavaScript
		__token = localStorage.getItem(__tokenName) || null;
	}

	/**
	 * Run the init function
	 */
	init();
	/**
	 * Returns the functions and the variables organized in categories
	 * Config - Settings to current JS instance
	 * User - User related functions
	 * Vault - Vault related functions
	 */
	return {
		config:{
			__tokenName: __tokenName,
			getToken: getToken,
			storeToken: storeToken,
			setHost: setHost,
			setVault: setVault,
			generateHtmlLinks: generateHtmlLinks,
		},
		user: {
			auth: auth,
			logout: logout,
			isLoggedIn: isLoggedIn
		},
		vault: {
			getObjectTypes: getObjectTypes,
			getClasses: getClasses,
			getRecentlyAccessed: getRecentlyAccessed,
			getDocumentsByClass: getDocumentsByClass,
			getDocumentCollectionsByClass: getDocumentCollectionsByClass,
			downloadFile: downloadFile,
			searchDocuments: searchDocuments,
		}
	}
})();