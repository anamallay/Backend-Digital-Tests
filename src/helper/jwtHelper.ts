import jwt from 'jsonwebtoken'

export const createJSONWebToken = (tokenpayload: object, secretKey: string, expiresIn: string) => {
    if (!tokenpayload) {
      throw Error('tokenpayload must be an object')
  }
    const token = jwt.sign(tokenpayload, secretKey, {
    expiresIn: expiresIn,
  })
  return token
}
export const verifyJSONWebToken = (token: string, secretKey: string) => {
//   const token = jwt.verify()
//   return token
}