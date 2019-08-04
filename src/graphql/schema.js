const Asset = require('../models/asset');
const ContentTypes = require('../models/contentType');
const Contents = require('../models/content');
const {GraphQLJSONObject} = require('graphql-type-json');
const {
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLBoolean
} = require("graphql");

function buildTree(parent, list)
{
    if (parent == undefined || parent == null || list == undefined || (list != undefined && list.length == 0))
        return;
    parent.items = [];
    list.forEach(cat => {
        if (cat.parentId == parent.id)
        {
            parent.items.push(cat);
            buildTree(cat, list);
        }
    });
}

const MultiLangItemType = new GraphQLObjectType({
    name : "MultiLangItemType",
    fields : {
      en : {type : GraphQLString},
      fa : {type : GraphQLString},
      sv : {type : GraphQLString},
      it : {type : GraphQLString},
      ar : {type : GraphQLString},
      rs : {type : GraphQLString},
      dn : {type : GraphQLString},
    }
  })
  
  const SysType = new GraphQLObjectType({
      name : "SysType",
      fields : {
        link : {type : GraphQLString},
        spaceId : {type : GraphQLString},
        issuer : {type: GraphQLJSONObject},
        issueDate : {type : GraphQLString},
        lastUpdater : {type : GraphQLJSONObject},
        lastUpdateTime : {type : GraphQLString}
      }
  });
const AssetType = new GraphQLObjectType({
  name: "Asset",
  fields: {
      _id : {type : GraphQLID},
      sys : {type : SysType},
      name: { type: GraphQLString },
      fileType: { type: GraphQLString },
      url : {type : MultiLangItemType},
      status : {type : GraphQLString}
  }
});


  const ContentTypeType = new GraphQLObjectType({
    name: "ContentType",
    fields: {
        _id : {type : GraphQLID},
        sys : {type : SysType},
        name : {type : GraphQLString},
        title : {type : MultiLangItemType},
        description : {type : MultiLangItemType},
        template : {type : GraphQLString},
        media : {type : GraphQLList(MultiLangItemType)},
        fields : {type : GraphQLList(GraphQLJSONObject)},
        status : {type : GraphQLBoolean}
    }
  });


  const ContentType = new GraphQLObjectType({
    name: "Content",
    fields: {
        _id : {type : GraphQLID},
      sys : {type : SysType},
      fields : {type : GraphQLJSONObject},
      status : {type : GraphQLString},
      contentType : {type: GraphQLString},
    }
  });

  const ContentDetailType = new GraphQLObjectType({
    name: "ContentDetail",
    fields: {
      _id : {type : GraphQLID},
      sys : {type : SysType},
      fields : {type : GraphQLJSONObject},
      status : {type : GraphQLString},
      contentType : {
          type: ContentTypeType,
          resolve : (root, args, context, info)=>{
            var data = ContentTypes.findById({"_id" : root.contentType}).exec();
            return data;
          }
      },
    }
  });

const schema = new GraphQLSchema({
    query : new GraphQLObjectType({
        name : "Query",
        fields : {
          assets : {
            type : GraphQLList(AssetType),
            resolve : (root, args, context, info) => {
              return Asset.find({"sys.spaceId" : context.clientId}).exec();
            }
          },
          asset : {
            type : AssetType,
            args : {
              id : {type : GraphQLNonNull(GraphQLID)}
            },
            resolve : (root, args, context, info)=>{
              var data = Asset.findOne({"_id" : args.id}).exec();
              return data;
            }
          },
          contents : {
            type : GraphQLList(ContentType),
            args : {
                contentType : {type : GraphQLString},
                fields : {type : GraphQLJSONObject}
              },
            resolve : (root, args, context, info) => {
              var c= undefined, ct, st;
              console.log(context);
              if (args.contentType)
                  ct = args.contentType.split(',');
              var flt = {
                  'sys.spaceId' : context.clientId,
                  contentType : { $in : ct},
                  template : args.template
              };
              if (args.fields)
              {
                Object.keys(args.fields).forEach(function(key) {
                  var val = args.fields[key];
                  flt["fields." + key] = val;
                });
              }
              if (!args.fields)
                  delete flt.fields;
              if (!args.template)
                  delete flt.template;
              if (!args.contentType)
                  delete flt.contentType;
              console.log(flt);
              return Contents.find(flt).exec();
            }
          },
          contentlist : {
            type : GraphQLList(ContentDetailType),
            resolve : (root, args, context, info) => {
              return Contents.find({"sys.spaceId" : context.clientId}).exec();
            }
          },
          content : {
            type : ContentDetailType,
            args : {
              link : {type : GraphQLNonNull(GraphQLString)}
            },
            resolve : (root, args, context, info)=>{
              var data = Contents.findOne({"sys.link" : args.link}).exec();
              console.log(data);
              return data;
            }
          },
          contentTypes : {
            type : GraphQLList(ContentTypeType),
            resolve : (root, args, context, info) => {
              return ContentTypes.find({"sys.spaceId" : context.clientId}).populate().exec();
            }
          },
          contentType : {
            type : ContentTypeType,
            args : {
              link : {type : GraphQLNonNull(GraphQLString)}
            },
            resolve : (root, args, context, info)=>{
              var data = ContentTypes.findOne({"sys.link" : args.link}).exec();
              console.log(data);
              return data;
            }
          },
          contentTypeByID : {
            type : ContentTypeType,
            args : {
              id : {type : GraphQLNonNull(GraphQLString)}
            },
            resolve : (root, args, context, info)=>{
              var data = ContentTypes.findById(args.id).exec();
              console.log(data);
              return data;
            }
          }
        }
    }),
    mutation : new GraphQLObjectType({
      name : "Mutation",
      fields : {
        submit :{
          type: ContentType,
          args: {
              
          },
          resolve:  async function (root, args, context, info) {
            // console.log('start saving request : ' + JSON.stringify(args));
            // await controller.submitRequest({userId : context.userId, spaceid : context.clientId, body : args.input}, (result)=>{
            //   if (result.success)
            //   {
            //     return result.data;
            //   }
            //   return undefined;
            // });

          }
        }
    }
    })
});
exports.schema = schema;

