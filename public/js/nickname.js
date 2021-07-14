const namePrefix = [
  "Greate",
  "Long",
  "Beautiful",
  "Short",
  "King",
  "Queen",
  "Master",
  "Doc",
  "The Red",
  "Zar",
  "Kaiser",
]

const nameSuffix = [
  "Jens",
  "Arnold",
  "Rose",
  "Peter",
  "Louise",
  "Sergey",
  "Abigel",
  "Mohammud"
]

//Get Random Name Generated out of namePrefix and nameSuffix
//**********************************************************************
function getRandName(){
//**********************************************************************
  var prefixLength = namePrefix.length
  var suffixLength = nameSuffix.length
  var newName = namePrefix[getRand(0,prefixLength)] + " " + nameSuffix[getRand(0,prefixLength)]
}

//Function for getting random numbers between two Numbers
//**********************************************************************
function getRand(min, max) {
//**********************************************************************
  return Math.random() * (max - min) + min;
}