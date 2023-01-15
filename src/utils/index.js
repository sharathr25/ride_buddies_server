const randomCode = (length = 6) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz'
  const digits = '0123456789'
  let token = ''
  for (let i = 1; i <= length / 2; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  for (let i = length / 2 + 1; i <= length; i++) {
    token += digits.charAt(Math.floor(Math.random() * digits.length))
  }
  return token
}

module.exports = {
  randomCode
}
