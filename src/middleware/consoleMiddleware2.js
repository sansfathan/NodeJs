function console2 (req,res,next){
    console.log("console.log 2")
    next()
}
module.exports = console2