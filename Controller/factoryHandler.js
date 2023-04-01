exports.getOne = (Model,popOptions) => async (req,res)=>{
    
    try {
        const query =  Model.findOne({ _id: req.params.id });
    if(popOptions) query = query.populate(popOptions)
    const doc = await query;
        //   const tour = await Model.findOne({ _id: req.params.id }).populate('reviews')
          //for the getAllTours also we have to create so we will make a populate query middleware
          console.log(doc);
          if (!doc) {
           throw new Error("No tours availbale for this ID");
          }
          res.status(200).json({
            status: "success",
            data: doc,
          });
        }
     catch (error) {
        throw new Error(error)
        }
    }
