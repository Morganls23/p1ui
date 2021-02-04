//p14C Variables
const environmentID = 'ca3ad373-df71-4eb5-a3b5-76439336e1d6'; // env ID from p1 console
const baseUrl = 'https://morgapp.ping-eng.com/p1ui'; //Where this app lives

const scopes = 'openid profile email address phone p1:update:user p1:read:user'; // default scopes to request
const responseType = 'token id_token'; // tokens to recieve

const landingUrl = baseUrl + '/index.html'; // url to send the person once authentication is complete
const logoutUrl = baseUrl + 'logout/'; // whitelisted url to send a person who wants to logout
const redirectUri = baseUrl + '/login.html'; // whitelisted url P14C sends the token or code to

const workerClientID = 'cedd8115-38d5-49f6-8bd8-043505fd83c6'; //used to create/manage users
const workerClientSecret = 'EAarQcJAyAsS2QZN46MSrQD_nUHUK9~b2liHYlULE3jKne1EPIFwGG3Jayo6upBQ';

const appClientID = 'dd2157ed-6f2b-4de9-81e3-11feb2b19302';
const authUrl = 'https://auth.pingone.com';
const apiUrl = 'https://api.pingone.com/v1';

const flowId = '';

const regexLower = new RegExp('(?=.*[a-z])');
const regexUpper = new RegExp('(?=.*[A-Z])');
const regexNumeric = new RegExp('(?=.*[0-9])');
const regexSpecial = new RegExp('(?=.*[~!@#\$%\^&\*\)\(\|\;\:\,\.\?\_\-])');
const regexLength = new RegExp('(?=.{8,})');


// simple function to parse json web token
function parseJwt(token) {
  console.log("parseJWT was called");
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(window.atob(base64));
}

// function to generate random nonce

function generateNonce(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789:;_-.()!';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


if (!appClientID || !environmentID) {

  alert('Be sure to edit js/auth.js with your environmentID and clientId');

}


// exJax function makes an AJAX call
function exJax(method, url, callback, contenttype, payload) {
  console.log('ajax (' + url + ')');
  console.log("content type: "+contenttype);
  $.ajax({
      url: url,
      method: method,
      dataType: 'json',
      contentType: contenttype,
      data: payload,
      xhrFields: {
        withCredentials: true
      }
    })
    .done(function(data) {
      callback(data);
    })
    .fail(function(data) {
      console.log('ajax call failed');
      console.log(data);
      $('#warningMessage').text(data.responseJSON.details[0].message);
      $('#warningDiv').show();
    });
}

// build the authorization url in case we need it

const authorizationUrl =
  authUrl +
  '/' +
  environmentID +
  '/as/authorize?client_id=' +
  appClientID +
  '&response_type=' +
  responseType +
  '&redirect_uri=' +
  redirectUri +
  '&scope=' +
  scopes;


  function setUserinfoCookie() {  //put the AT and uuid somewhere handy --> bad coding :)
    let idToken = Cookies.get('idToken');
    let idPayload = parseJwt(idToken);
    Cookies.set('uuid', idPayload.sub);
    //Cookies.set('name', idPayload.given_name);
  }


//----initate logon ---- //
function initiateLogon(){
  console.log('initiateLogon called')
  let method = 'POST';
  let url = authorizationUrl;
  exJax(method, url, nextStep);
}





//-----Authentication related methods -----//

//--------First Factor------//

// change password function
function changePassword() {
  console.log('changePassword called');
  let payload = JSON.stringify({
    currentPassword: $('#current_password').val(),
    newPassword: $('#change_new_password').val()
  });
  let url = $('#changePasswordUrl').val();
  let contenttype = 'application/vnd.pingidentity.password.reset+json';
  console.log('payload '+ payload);
  exJax('POST', url, nextStep, contenttype, payload);
}

// validate password function
function validatePassword() {
  console.log('validatePassword called');
  let payload = JSON.stringify({
    username: $('#user_login').val(),
    password: $('#user_pass').val()
  });
  console.log('payload is ' + payload);
  let url = $('#validatePasswordUrl').val();
  //let url = (authUrl + environmentID + '/flows/' + flowId);
  console.log('url is: ' + url);
  let contenttype = 'application/vnd.pingidentity.usernamePassword.check+json';
  console.log('contenttype is ' + contenttype);
  exJax('POST', url, nextStep, contenttype, payload);
}


function resetPassword(){

  //https://api.pingone.com/v1/environments/7334523a-4a2d-4dd6-9f37-93c60114e938/users/bfd0e265-abe6-41c9-aca6-2352478b30da/password
  console.log("resetPassword was called");
  let method = "POST";
  let user = $('#user_login').val();
  let url = $('#forgotPasswordURL').val();
  let contentType='application/vnd.pingidentity.password.forgot+json';
  console.log('url (' + url + ')');
  console.log('user =' + user);
  console.log("make exJax call");
  let payload = JSON.stringify({
    username: user
  });
  exJax(method, url, nextStep, contentType, payload);
  console.log("resetPassword finished");
}


function validatePWResetCode(){
  console.log("validate password code called ")
  let method = "POST";
  let url = $('#forgotPasswordURL').val();
  let contentType='application/vnd.pingidentity.password.recover+json';
  console.log('url (' + url + ')');
  console.log("make exJax call");
  let payload = JSON.stringify({
    recoveryCode: $('#pwReset_Code').val(),
    newPassword: $('#new_password').val()
  });
    console.log('payload =' + payload);
  exJax(method, url, nextStep, contentType, payload);
  console.log("validate Password code finished");

}


//-------MFA Calls -------//
// validate one time passcode function
function validateOtp() {
  console.log('validateOtp called');
  let otp = $('#otp_login').val();
  let payload = JSON.stringify({
    otp: otp
  });
  //let url = $('#validateOtpUrl').val();
  let url = (authUrl + '/' + environmentID + '/flows/' + flowId);
  let contenttype ='application/vnd.pingidentity.otp.check+json';
  //$('#validateOtpContentType').val();
  console.log('url :' + url);
  console.log('otp: ' + otp);
  console.log('content' + contenttype);

  exJax('POST', url, nextStep, contenttype, payload);
}

function continue_push() {
  //location.href=authUrl + '/' + environmentID + '/flows/' + flowId;
  console.log('continue push called');
  //let url = $('#pushResumeUrl');
  let url = authUrl + '/' + environmentID + '/flows/' + flowId;
  let contenttype ='application/json';
  //location.href = $('#pushResumeUrl').val();
  console.log('url ' + url);
  exJax('GET', url, nextStep, contenttype);
}