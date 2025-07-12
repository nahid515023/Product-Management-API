import crypto from 'crypto'

function findLongestIncreasingSubstringsLength (str: string) {
  let maxLength = 0
  let left = -1
  let right = 0
  while (right < str.length) {
    if (str[right] > str[right - 1]) {
      right++
    } else {
      maxLength = Math.max(maxLength, right - left - 1)
      left = right - 1
      right++
    }
  }
  maxLength = Math.max(maxLength, right - left - 1)
  return maxLength
}

function findLongestIncreasingSubstrings (str: string) {
  const lowerStr = str.toLowerCase()
  const maxLength = findLongestIncreasingSubstringsLength(lowerStr)
  let left = -1
  let right = 0

  const results: { substring: string; startIndex: number; endIndex: number } = {
    substring: '',
    startIndex: -1,
    endIndex: 0
  }

  while (right < lowerStr.length) {
    if (lowerStr[right] > lowerStr[right - 1]) {
      right++
    } else {
      if (right - left - 1 === maxLength) {
        results.substring += lowerStr.substring(left + 1, right)
        if (results.startIndex === -1) {
          results.startIndex = left + 1
        }
        results.endIndex = right - 1
      }
      left = right - 1
      right++
    }
  }
  if (right - left - 1 === maxLength) {
    if (right - left - 1 === maxLength) {
      results.substring += lowerStr.substring(left + 1, right)
      if (results.startIndex === -1) {
        results.startIndex = left + 1
      }
      results.endIndex = right - 1
    }
  }
  return results
}

function generateHash (productName: string) {
  return crypto
    .createHash('md5')
    .update(productName)
    .digest('hex')
    .substring(0, 7)
}

export default function generateProductCode (productName: string) {
  const { substring, startIndex, endIndex } =
    findLongestIncreasingSubstrings(productName)
  const hash = generateHash(productName)
  const getTime = new Date().getTime().toString()

  return `${hash}${getTime}-${startIndex}${substring}${endIndex}`
}
