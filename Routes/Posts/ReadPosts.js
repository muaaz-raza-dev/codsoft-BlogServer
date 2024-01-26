const app = require("express").Router();
let { StatusCodes } = require("http-status-codes");
const Posts = require("../../models/Posts");
const VerifyMember = require("../../middleware/VerifyMember");
const { ObjectId, LEGAL_TCP_SOCKET_OPTIONS } = require("mongodb");
const Topic = require("../../models/Topic");
const Member = require("../../models/Member");
let limit = parseInt(process.env.DocsPerRequest);

app.get("/topic/:topic", async (req, res) => {
  let count = req.header("count");
  let totalResults = (await Posts.find({ isDeleted:false, topic: req.params.topic })).length
  let payload = await Posts.aggregate([
    {
      $match: {
        topic:new ObjectId(req.params.topic),
        isDeleted:false
      },
    },
      {
        $addFields: {
          author: {
            $cond: {
              if: { $eq: ["$anonymous", true] },
              then: [], // Exclude sensitiveField if isAnonymous is true
              else: "$author", // Include sensitiveField if isAnonymous is false
            },
          },
        },
      },
      {
        $project: { isDeleted: 0,  }
      },
  
    
    {
      
      $lookup: {
        from: "members",
        localField: "author",
        foreignField: "_id",
        as: "author"
    }
    },
    {$unwind: {
      path: "$author",
      // includeArrayIndex: 'author',
      preserveNullAndEmptyArrays: true
    }}
    ,
  
    
    {
      
      $lookup: {
        from: "topics",
        localField: "topic",
        foreignField: "_id",
        as: "topic"
    }
    },
    {$unwind: {
      path: "$topic",
      // includeArrayIndex: 'author',
    }}
   
  
  ]).sort({publishDate:-1,likes:-1})
  let TopicInfo =await Topic.findById(req.params.topic)
  let Followers =(await Member.find({interests:req.params.topic})).length;
  res.json({ success: true, payload ,totalResults ,Topic:{_id:TopicInfo?._id,title:TopicInfo?.title,totalPosts:totalResults,Followers} });
});
app.get("/search", async (req, res) => {
  let count = req.header("count");
  let q = req.header("q");
  let payload = await Posts.find({ isDeleted:false,$text:{$search:q}   }).limit(limit)
  .skip(parseInt(count) * limit);
  res.json({ success: true, payload ,totalResults:payload.length, count :payload.length>limit*(count==0?count+1:count)?count+1:count  });
});
app.get("/trending", async (req, res) => {
  let payload = await Posts.find({ isDeleted:false,}).sort({ likes: -1, views: -1 }).limit(6);
  res.json({ success: true, payload });
});

app.post("/", async (req, res) => {
  let {  count } = req.body;
  let payload;
  let TotalResults;
  if (req.body.topic!==""){
TotalResults   = (await Posts.aggregate([
  {
    $lookup: {
      from: "topics",
      localField: "topic",
      foreignField: "_id",
      as: "topiced",
    },
  },
  {
    $match: {
      "topiced.title": req.body.topic,
    },
  },

 
])).length

 payload=await Posts.aggregate([
  {
    $lookup: {
      from: "topics",
      localField: "topic",
      foreignField: "_id",
      as: "topic",
    },
  },
  {
    $unwind: {
      path: "$topic",
    },
  },
  {
    $match: {
      "topic.title": req.body.topic,
      isDeleted:false
    },
  },
  {
    $lookup: {
      from: "members",
      localField: "author",
      foreignField: "_id",
      as: "author",
    },
  },
  {
    $unwind: {
      path: "$author",
    },
  },
  {
    $addFields: 
 {
      author: {
        $cond:{
          if: { $eq: ["anonymous", true] },
          then: "$anonymous", // Exclude sensitiveField if isAnonymous is true
          else: "$author", // Include sensitiveField if isAnonymous is false
        },
      },
    },
  },

]).sort({publishDate:-1,likes:-1}).skip(count*limit).limit(limit)


  }
  else{
TotalResults   = await Posts.find({ isDeleted:false,}).count()

   payload=await Posts.aggregate([
    {
      $match:{
        isDeleted:false
      }
    }, 
    {
      $lookup: {
        from: "topics",
        localField: "topic",
        foreignField: "_id",
        as: "topiced"
      }
    }
  ,
  {
      $addFields: {
        "topiced": {
          $map: {
            input: "$topiced",
            as: "topiced",
            in: "$$topiced.title"
          }
        }
      }
  }
  , 
    {
      $unwind: "$topiced"
    },

    {
      $facet: {
        matchingDocs: [
          { $match: { topiced: { $in: req.body.interests||[] } } },
        ],
        unrelatedDocs: [
          { $match: { topiced: { $nin: req.body.interests||[] } } },
        ],
      },
    },
    {
      $project: {
        sortedDocs: {
          $concatArrays: ['$matchingDocs', '$unrelatedDocs'],
        },
      },
    },
    {
      $unwind: '$sortedDocs',
    },
    {
      $replaceRoot: { newRoot: '$sortedDocs' },
    },
    {
      $lookup: {
        from: "members",
        localField: "author",
        foreignField: "_id",
        as: "author"
      }
    },
    {
      $unwind: "$author"
    },
    {
      $lookup: {
        from: "topics",
        localField: "topic",
        foreignField: "_id",
        as: "topic"
      }
    },
    {
      $unwind: "$topic"
    },
    {
      $addFields: 
   {
        author: {
          $cond:{
            if: { $eq: ["$anonymous", true] },
            then: "$anonymous", // Exclude sensitiveField if isAnonymous is true
            else: "$author", // Include sensitiveField if isAnonymous is false
          },
        },
      },
    },
  ]).sort({publishDate:-1,likes:-1}).skip(count*limit).limit(limit)
  }
    res.json({ success: true,payload,TotalResults });
});

app.get("/post/:id",async(req,res)=>{
try {
  let Post = await Posts.findById(req.params.id)
  await Posts.aggregate([
  {
    $match: {
      _id : Post._id,
      isDeleted:false
    },
  },
    {
      $addFields: {
        author: {
          $cond: {
            if: { $eq: ["$anonymous", true] },
            then: [], // Exclude sensitiveField if isAnonymous is true
            else: "$author", // Include sensitiveField if isAnonymous is false
          },
        },
      },
    },
    {
      $project: { isDeleted: 0,  }
    },

  
  {
    
    $lookup: {
      from: "members",
      localField: "author",
      foreignField: "_id",
      as: "author"
  }
  },
  {$unwind: {
    path: "$author",
    preserveNullAndEmptyArrays: true
  }},
 
]).then(async post=>{
  if (post[0].author) {
    let Recommendations = await Posts.find({ isDeleted:false,author:post[0].author._id}).populate("topic").sort({publishDate:-1}).limit(4)
    res.json({success:true,payload:{Post:post[0],Recommendations}})
  }
  else{
    res.json({success:true,payload:{Post:post[0],Recommendations:[]}})

  }
})
} catch (error) {
  console.log(error);
  res.status(500).json({success: false, message: 'Internal server error'})
}
})
app.post("/topics",async(req,res)=>{
  let paylaod  = await Posts.aggregate([
    {$group: {
      _id: "$topic",
      }}
  
  ])
  res.json({success:true,payload})
})


app.post("/starter", async (req, res) => {
  try {
    await Posts.updateMany({FollowerOnly:{$exists:false}},{$set:{FollowerOnly:false}})
    let Topics = await Posts.aggregate([
      {$lookup: {
        from: "topics",
        localField: "topic",
        foreignField: "_id",
        as: "topic"
      }},
      {$unwind: {
        path:"$topic",
        preserveNullAndEmptyArrays: false
      }},
      {$group: {
        _id: "$topic.title",
        results: {
          $sum: 1
        },
      }},
      {$sort: {
        "results": -1
      }}
    ,
  {$lookup: {
        from: "topics",
        localField: "_id",
        foreignField: "title",
        as: "topic"
      }},
      {$unwind: {
        path:"$topic",
        preserveNullAndEmptyArrays: false
      }},
    
    ]).limit(20)
    let Trendings = await Posts.find({ isDeleted:false,anonymous:false}).sort({publishDate:-1,likes:-1}).populate(["author","topic"]).sort({likes:-1,publishDate:-1}).limit(6)
    let  Post=await Posts.aggregate([ 
        {$match:{isDeleted:false}},
        {
          $lookup: {
            from: "topics",
            localField: "topic",
            foreignField: "_id",
            as: "topiced"
          }
        }
      ,
      {
          $addFields: {
            "topiced": {
              $map: {
                input: "$topiced",
                as: "topiced",
                in: "$$topiced.title"
              }
            }
          }
      }
      , 
        {
          $unwind: "$topiced"
        },
    
        {
          $facet: {
            matchingDocs: [
              { $match: { topiced: { $in: req.body.interests?req.body.interests:[] } } },
            ],
            unrelatedDocs: [
              { $match: { topiced: { $nin: req.body.interests?req.body.interests:[] } } },
            ],
          },
        },
        {
          $project: {
            sortedDocs: {
              $concatArrays: ['$matchingDocs', '$unrelatedDocs'],
            },
          },
        },
        {
          $unwind: '$sortedDocs',
        },
        {
          $replaceRoot: { newRoot: '$sortedDocs' },
        },
        {
          $lookup: {
            from: "members",
            localField: "author",
            foreignField: "_id",
            as: "author"
          }
        },
        {
          $unwind: "$author"
        },
        {
          $lookup: {
            from: "topics",
            localField: "topic",
            foreignField: "_id",
            as: "topic"
          }
        },
        {
          $unwind: "$topic"
        },
        {
          $addFields: 
       {
            author: {
              $cond:{
                if: { $eq: ["$anonymous", true] },
                then: "$anonymous", // Exclude sensitiveField if isAnonymous is true
                else: "$author", // Include sensitiveField if isAnonymous is false
              },
            },
          },
        },
      ]).sort({publishDate:-1,likes:-1}).limit(limit)
   
    res.json({success: true, payload: {Topics, Trendings, Blogs:Post}})
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, msg: 'Internal server error' });
  }

})


module.exports = app;
