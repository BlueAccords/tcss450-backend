module.exports = {
  getConfirmationEmailHTMLBody(code) {
    var emailBody = "<html>\n\
    <body>\n\
    <h1>Thank you for creating an account with Cinemality</h1>\n\
    <h6>Below is your confirmation code</h6>\n\
    <p> Confirmation code: " + code + "</p>\n\
    </body>\n\
    </html>";
  }
}