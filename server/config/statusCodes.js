module.exports = {
  Success: {
    OK: 200,
    created: 201,
    accepted: 202,
  },
  Redirection: {
    temporaryRedirect: 307
  },
  ClientError: {
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    imATeapot: 418,
  },
  ServerError: {
    internalServerError: 500,
    notImplemented: 501
  }
}