//base64 encode and decode polyfil
//modified version of https://github.com/davidchambers/Base64.js
//you can replace the b64Encode and b64Decode for atob and btoa.
var b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
function b64Encode(input) {
  var output = '';
  for (
    var block, charCode, idx = 0, map = b64ch;
    input.charAt(idx | 0) || (map = '=', idx % 1);
    output += map.charAt(63 & block >> 8 - idx % 1 * 8)
  ) {
    charCode = input.charCodeAt(idx += 3/4);
    block = block << 8 | charCode;
  }
  return output;
}

function b64Decode(input) {
  var str = input.replace(/=+$/, '');
  var output = '';
  for (
    var bc = 0, bs, buffer, idx = 0;
    buffer = str.charAt(idx++);
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
  ) {
    buffer = b64ch.indexOf(buffer);
  }
  return output;
}

function encode(input) {
  if (typeof input !== 'string') {
    try {
      input = JSON.stringify(input);
    } catch(e) {}
  }
  input = unescape(encodeURIComponent(input));
  return b64Encode(input);
}

function decode(input) {
  var result = decodeURIComponent(escape(b64Decode(input)));
  try {
    result = JSON.parse(result);
  } catch(e){}
  return result;
}

module.exports = {
  encode: encode,
  decode: decode
}
