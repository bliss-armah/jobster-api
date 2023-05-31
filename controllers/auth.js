const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { attachCookiesToResponse,createTokenUser } = require("../utils");
const CustomError = require("../errors");

const register = async (req, res) => {
  const { email, name,lastName, password } = req.body;
  const emailAlreadyExist = await User.findOne({ email });
  if (emailAlreadyExist) {
    throw new CustomError.BadRequestError("Email alredy exist");
  }

   // first registered user is an admin
   const isFirstAccount = (await User.countDocuments({})) === 0;
   const role = isFirstAccount ? "admin" : "user";

   const user = await User.create({ email, name,lastName, role });
   const tokenUser =createTokenUser(user);

   attachCookiesToResponse({ res, user: tokenUser });
   res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid credentials')
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  // compare password
  const tokenUser =createTokenUser(user)

  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUser = async(req,res) => {
  const {email,name,lastName,location} = req.body
  console.log(req.user);
  if (!email || !name || !lastName || !location) {
    throw new CustomError.BadRequestError('Please provide all values')
  }
  const user = await User.findOne({_id : req.user.userId})
  user.email = email
  user.name = name
  user.lastName = lastName
  user.location = location

  await user.save();
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser }); 
}

module.exports = {
  register,
  login,
  updateUser
};
