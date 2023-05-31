const createTokenUser = (user) =>{
    return { name: user.name, lastName:user.lastName, userId: user._id, role: user.role }; 
}

module.exports = createTokenUser