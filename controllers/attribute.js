const { Attribute, validate } = require("../models/attribute");

const _ = require("lodash");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const common = require("../common/common");
const { Product } = require("../models/product");

exports.listAttributes = async (req, res) => {
  let ITEMS_PER_PAGE = 15;
  let DEFAULT_LANGUAGE = "en";
  let query = {};
  let languageCode = req.query.lang || DEFAULT_LANGUAGE;
  if (!_.isEmpty(req.query.page)) {
    const page = +req.query.page || 1;
    // query.parentId = { $ne: null };
    // let sort = {name:1};
    if (!_.isEmpty(req.query.search)) {
      query["resourceBundle.name"] = {
        $regex: req.query.search,
        $options: "i",
      };
    }
    // if (!_.isEmpty(req.query.sort)) {
    //   if(req.query.sort == 'desc')
    //   sort.name = -1;
    // }

    if (!_.isEmpty(req.query.limit)) ITEMS_PER_PAGE = +req.query.limit;
    try {
      const attributeCount = await Attribute.count(query);
      const allAttributes = await Attribute.find(query)
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        // .populate("attribute", "name")
        .select("-__v")
        .lean();
      if (_.isEmpty(allAttributes))
        return res.json({ msg: "No attributes found" });
      allAttributes.forEach((attribute) => {
        const i18nResourceBundle = common.getResourceBundle(
          languageCode,
          attribute.resourceBundle
        );
        attribute.i18nResourceBundle = i18nResourceBundle;
        // delete attribute.resourceBundle;
      });
      // res.send(allAttributes);
      return res.json({
        attributes: allAttributes,
        info: {
          totalNumber: attributeCount,
          hasNextPage: ITEMS_PER_PAGE * page < attributeCount,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(attributeCount / ITEMS_PER_PAGE),
        },
      });
    } catch (error) {
      console.log("Server Error in attribute.getAttributes", error);
      return res.status(500).send("Server Error in attribute.getAttributes");
    }
  }
  try {
    const allAttributes = await Attribute.find();
    if (_.isEmpty(allAttributes))
      return res.json({ msg: "No attributes found" });
    res.send(allAttributes);
  } catch (error) {
    return res.status(500).send("Server Error in attribute.getAttributes");
  }
};

exports.createAttribute = async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }

  const { resourceBundle, values } = req.body;
  // let valuesArray = values.split(",");
  // valuesArray = valuesArray.filter((item) => item.trim());
  const attributeObject = { resourceBundle };
  if (!_.isEmpty(values)){
    const toFindDuplicates = arry => arry.filter((item, index) => arr.indexOf(item) !== index)
    attributeObject.values = values;
  } 
  // valuesArray = valuesArray.map((value) => {
  //   return { value };
  // });
  const attribute = new Attribute(attributeObject);
  try {
    const savedAttribute = await attribute.save();
    return res.json(savedAttribute);
  } catch (err) {
    console.log("Server Error in attribute.postAttribute", err);
    return res.status(400).send("Server Error in attribute.postAttribute");
  }
};

exports.getSingleAttribute = async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id).select("-__v");

    if (!attribute)
      return res
        .status(404)
        .json({ msg: "The attribute with the given ID was not found." });

    res.send(attribute);
  } catch (err) {
    console.log("Server Error in attribute.getSingleAttribute", err);
    return res.status(400).send("Server Error in attribute.getSingleAttribute");
  }
};

exports.deleteAttribute = async (req, res) => {
  try {
    const existingAttribute = await Attribute.findById(req.params.id);
    if (!existingAttribute)
      return res
        .status(404)
        .json({ msg: "The attribute with the given ID was not found." });
    const attributeExistsInProducts = await Product.findOne({
      attribute_array: existingAttribute._id,
    });
    if (attributeExistsInProducts)
      return res
        .status(404)
        .json({ msg: "There are products under this attribute." });
    const attribute = await Attribute.findByIdAndRemove(req.params.id);
    return res.send(attribute);
  } catch (error) {
    console.log("Server Error in attribute.deleteAttribute", error);
    return res.status(400).json({
      err: "Server Error in attribute.deleteAttribute",
    });
  }
};

exports.updateAttribute = async (req, res) => {
  if (_.isEmpty(req.body)) {
    if (!req.file) return res.json({ msg: "Empty body" });
  }

  const { error } = validateAttribute(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }

  try {
    const existingAttribute = await Attribute.findOne({ _id: req.params.id });
    if (!existingAttribute)
      return res
        .status(404)
        .json({ msg: "The attribute with the given ID was not found." });

    // const attributeContent = {};
    if (!_.isEmpty(req.body.resourceBundle))
      existingAttribute.resourceBundle = req.body.resourceBundle;
    const newValues = req.body.values;
    if (!_.isEmpty(newValues)) {
      const existingValues = existingAttribute.values;
      // let newValues = req.body.values.split(",");
      // newValues = newValues.filter((item) => item.trim());

      //// do deletion for single value , sepeate api

      // const valuesToDelete = _.difference(existingValues, newValues);
      // if (!_.isEmpty(valuesToDelete)) {
      //   try {
      //     const queryField = `attribute_value_object.${existingAttribute._id}`;
      //     let query = { [queryField]: { $in: valuesToDelete } };
      //     const valueExistsInProducts = await Product.findOne(query);
      //     if (valueExistsInProducts)
      //       return res.status(404).json({
      //         msg: `There are products with attribute values ${valuesToDelete.join(
      //           ","
      //         )}`,
      //       });
      //     attributeContent.values = newValues;
      //   } catch (error) {
      //     console.log("Server Error in attribute.updateAttribute", err);
      //     return res
      //       .status(400)
      //       .send("Server Error in attribute.updateAttribute");
      //   }
      // } else {

      //check if the new values already exists
      if (!_.isEmpty(existingValues))
        newValues.forEach((newValue) => {
          const valueExists = existingValues.find((existingValue) => {
            return existingValue.value === newValue.value.trim();
          });
          if (valueExists && valueExists._id.toString() !== newValue._id)
            throw {
              type: "custom",
              msg: `Value ${valueExists.value} already exists`,
            };
        });
      // existingAttribute.values.push(newValues);
      // }
    }
    // const attribute = await Attribute.findByIdAndUpdate(
    //   req.params.id,
    //   attributeContent,
    //   {
    //     new: true,
    //   }
    // );
    const updatedAttribute = await Attribute.findByIdAndUpdate(
      req.params.id,
      {
        $push: { values: newValues },
      },
      { new: true, upsert: true }
    );
    // await existingAttribute.save();

    res.send(updatedAttribute);
  } catch (error) {
    let errorMsg =
      error.type === "custom"
        ? error.msg
        : '"Server Error in attribute.updateAttribute"';
    console.log("Server Error in attribute.updateAttribute", error);
    return res.status(500).send(errorMsg);
  }
};

exports.updateAttributeValue = async (req, res) => {
  const { error } = validateAttributeValue(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }

  try {
    const existingAttribute = await Attribute.findOne({ _id: req.params.id });
    if (!existingAttribute)
      return res
        .status(404)
        .json({ msg: "The attribute with the given ID was not found." });

    const { value } = req.body;
    const existingValues = existingAttribute.values;
    const valueToUpdate = existingValues.find((existingValue) => {
      return existingValue._id.toString() === value._id;
    });
    if (!valueToUpdate)
      return res.status(400).json({
        err: "Cannot find the value to update",
        msg: `Value with id ${value._id} doesn't exist under the attribute with id ${req.params.id}`,
      });
    const valueExists = existingValues.find((existingValue) => {
      return existingValue.value === value.value.trim();
    });
    if (valueExists && valueExists._id.toString() !== value._id)
      return res
        .status(400)
        .json({ err: `Value ${valueExists.value} already exists` });
    valueToUpdate.value = value.value;

    await existingAttribute.save();

    res.send(existingAttribute);
  } catch (error) {
    console.log("Server Error in attribute.updateAttributeValue", error);
    return res
      .status(500)
      .send("Server Error in attribute.updateAttributeValue");
  }
};

exports.deleteAttributeValue = async (req, res) => {
  const { error } = validateAttributeValue(req.body);
  if (error) {
    return res.status(400).json({ err: error.details[0].message });
  }

  try {
    const existingAttribute = await Attribute.findOne({ _id: req.params.id });
    if (!existingAttribute)
      return res
        .status(404)
        .json({ err: "The attribute with the given ID was not found." });

    const existingValues = existingAttribute.values;
    const { value } = req.body;
    const query = {
      "attribute_value_object.attribute": req.params.id,
      "attribute_value_object.values": value._id,
    };
    const valueExistsInProducts = await Product.findOne(query);
    if (valueExistsInProducts)
      return res.status(404).json({
        err: `Cannot delete, there are products with attribute values ${value.value}`,
      });
    existingValues.splice(
      existingValues.findIndex(
        (existingValue) => existingValue._id.toString() === value._id
      ),
      1
    );

    await existingAttribute.save();

    res.send(existingAttribute);
  } catch (error) {
    console.log("Server Error in attribute.deleteAttributeValue", error);
    return res
      .status(500)
      .send("Server Error in attribute.deleteAttributeValue");
  }
};

function validateAttribute(attribute) {
  const schema = Joi.object({
    resourceBundle: Joi.array().items(
      Joi.object({
        languageCode: Joi.string().valid("en", "ar").required(),
        name: Joi.string().required(),
      }).required()
    ),

    values: Joi.array().items(
      Joi.object({
        value: Joi.string().required(),
      }).required()
    ),
  });

  return schema.validate(attribute);
}

function validateAttributeValue(attribute) {
  const schema = Joi.object({
    value: Joi.object({
      value: Joi.string().required(),
      _id: Joi.objectId().required(),
    }).required(),
  });

  return schema.validate(attribute);
}
