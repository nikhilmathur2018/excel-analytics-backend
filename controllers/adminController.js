const User=require('../models/User');
const UploadedFile=require('../models/UploadedFile');

exports.getAllUsers=async(req,res)=>{
  try{
    const users=await User.find({}).select('-password');
    res.json(users);
  } catch(error){
    res.status(500).json({message: error.message});
  }
};

exports.deleteUser=async(req,res)=>{
  try{
    const user=await User.findById(req.params.id);
    if(!user){
      return res.status(404).json({message:'User not found'});
    }
    await user.deleteOne();
    res.json({message: 'User removed'});
  } catch(error){
    res.status(500).json({message: error.message});
  }
};

exports.updateUserRole = async (req, res) => {
    const { role } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.role = role;
        await user.save();
        res.json({ message: 'User role updated', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};