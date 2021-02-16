function registerUser() {
  console.log("registerUser was called");
  let method = "POST";
  //let at = Cookies.get('at');
  let flow = Cookies.get('flowID');
  let contentType = 'application/vnd.pingidentity.user.register+json';
  let url = authUrl + '/' + environmentID + '/flows/' + flow;
  let payload = JSON.stringify({
    username: $('#email').val(),
    email: $('#email').val(),
    name: {
      family: $('#lname').val(),
      given: $('#fname').val()
    },
    birthday: $('#birthday').val(),
    gender: $('gender').val(),
    //relationship: 
    address: {
      streetAddress: $('#address').val(),
      locality: $('city').val(),
      region: $('state').val(),
      postalCode: $('zip').val()
    },
    password: $('#user_pass').val()
  });
  console.log('url:' + url);
  console.log('payload:' + payload);
  exJax("POST", url, nextStep, contentType, payload);
}


function checkPass()
{
    //Store the password field objects into variables ...
    var password = document.getElementById('user_pass');
    var confirm  = document.getElementById('user_pass_conf');
    //Store the Confirmation Message Object ...
    var message = document.getElementById('confirm-message2');
    //Set the colors we will be using ...
    var good_color = "#66cc66";
    var bad_color  = "#ff6666";
    //Compare the values in the password field 
    //and the confirmation field
    if(password.value == confirm.value){
        //The passwords match. 
        //Set the color to the good color and inform
        //the user that they have entered the correct password 
        confirm.style.backgroundColor = good_color;
        message.style.color           = good_color;
        message.innerHTML             = '<img src="/wp-content/uploads/2019/04/tick.png" alt="Passwords Match!">';
    }else{
        //The passwords do not match.
        //Set the color to the bad color and
        //notify the user.
        confirm.style.backgroundColor = bad_color;
        message.style.color           = bad_color;
        message.innerHTML             = '<img src="/wp-content/uploads/2019/04/publish_x.png" alt="Passwords Do Not Match!">';
    }
}  

function validateUser(){
  console.log('verifyUser called');
  let otp = $('#user_otp').val();
  let payload = JSON.stringify({
    verificationCode: $('#user_otp').val()
  });
  //let url = $('#validateOtpUrl').val();
  //let url = $('verifyUserUrl').val();
  let url = authUrl + '/'+ environmentID + '/flows/' + flowId;
  let contenttype ='application/vnd.pingidentity.user.verify+json';
  console.log('url :' + url);
  console.log('verificationCode: ' + otp);
  console.log('content' + contenttype);

  exJax('POST', url, nextStep, contenttype, payload);
}

function nextStep(data) {
  status = data.status;
  console.log('Parsing json to determine next step: ' + status);
  flowId= data.id;
  console.log('FlowId is: ' + flowId);
  console.log('FlowId is: ' + data);

  switch (status) {
    case 'VERIFICATION_CODE_REQUIRED':
      console.log('Verify email');
      $('#reg').hide();
      $('#otpDiv').show();
      
      break;
    case 'COMPLETED':
      console.log('Registration was a SUCCESS!');
      let url = data.resumeUrl;
      let accessToken = data.accessToken;
      console.log('resume url is :' + url);
      finishAuth(url);
      break;
    default:
      console.log('something went wrong');
      break;
  }
}
function getFlowStatus(){
  let url = authUrl + "/" + environmentID + "/flows/" +flowId;
  exJax('POST', url ,nextStep);
}
// function finishAuth(url){
//   console.log('finishAuth called');
//   let contentType = 'application/json';
//   exJax('GET', url , setCookies, contentType);
//   //location.href = 'https://morgapp.ping-eng.com/p1ui/profile.html';
// }

function finishAuth(url){
  console.log('finishAuth called');
  console.log('Redirect to: '+ url);
  location.href = url;
}

function setCookies(data){
  console.log("setcookie Called");
  console.log(data);
  let userAPIid = data._embedded.user.id;
  console.log('user is: ' + userAPIid);
  let accessToken = data.authorizeResponse.access_token
Cookies.set('userAPIid', userAPIid,{ sameSite: 'strict' });
Cookies.set('accessToken', accessToken, { sameSite: 'strict' });
window.location.replace("https://morgapp.ping-eng.com/p1ui/admin.html");
}


// function validateOTP(){
//     console.log('validateOtp called');
//     let otp = $('#user_otp').val();
//     let payload = JSON.stringify({
//       otp: otp
//     });
//     //let url = $('#validateOtpUrl').val();
//     let url = (authUrl + '/' + environmentID + '/flows/' + flowId);
//     let contenttype ='application/vnd.pingidentity.otp.check+json';
//     //$('#validateOtpContentType').val();
//     console.log('url :' + url);
//     console.log('otp: ' + otp);
//     console.log('content' + contenttype);
  
//     exJax('POST', url, nextStep, contenttype, payload);
//   }