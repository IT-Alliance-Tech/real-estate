// ownercontroller.js
const Property = require("../models/Property");
const Owner = require("../models/Owner");
const { PROPERTY_STATUS } = require("../utils/constants");

// Upload new property
const uploadProperty = async (req, res) => {
  const {
    title,
    description,
    location,
    rent,
    deposit,
    listingType,
    price,
    propertyType,
    bedrooms,
    bathrooms,
    area,
    amenities,
    images,
    // Owner Details (Per Property)
    ownerPhone,
    ownerIdProofType,
    ownerIdProofNumber,
    ownerIdProofImageUrl,
    // NEW: electricity bill per-property
    ownerElectricityBillNumber,
    ownerElectricityBillImageUrl,
  } = req.body;

  try {
    // Find owner profile
    const owner = await Owner.findOne({ user: req.user._id });
    console.log("uploadProperty owner:", owner);

    if (!owner) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        error: {
          message: "Owner profile not found",
        },
        data: null,
      });
    }

    // require electricity bill number OR image
    if (
      !ownerElectricityBillNumber &&
      (!ownerElectricityBillImageUrl ||
        String(ownerElectricityBillImageUrl).trim() === "")
    ) {
      return res.status(400).json({
        statusCode: 400,
        success: false,
        error: {
          message:
            "Electricity bill number or electricity bill image is required for property upload. Provide ownerElectricityBillNumber or ownerElectricityBillImageUrl.",
        },
        data: null,
      });
    }
    const normalizedListingType = (listingType || "").toString();

    // Decide final values using commercial rule
    let finalBedrooms = bedrooms;
    let finalBathrooms = bathrooms;
    let finalPropertyType = propertyType;
    let finalRent = undefined;
    let finalDeposit = undefined;
    let finalPrice = undefined;

    // Keep existing semantics: rent/deposit only for rent listings, price for others
    if (normalizedListingType === "rent") {
      finalRent = rent !== undefined ? rent : null;
      finalDeposit = deposit !== undefined ? deposit : null;
      finalPrice = null;
    } else {
      finalRent = null;
      finalDeposit = null;
      finalPrice = price !== undefined ? price : null;
    }


    if (normalizedListingType === "commercial") {
      finalBedrooms = null;
      finalBathrooms = null;
      finalPropertyType = null;
      finalRent = null;
      finalDeposit = null;
    }
    const property = new Property({
      owner: owner._id,
      title,
      description,
      location,
      rent: finalRent,
      deposit: finalDeposit,
      listingType,
      price: finalPrice,
      propertyType: finalPropertyType,
      bedrooms: finalBedrooms,
      bathrooms: finalBathrooms,
      area,
      amenities: amenities || [],
      images: images || [],
      ownerDetails: {
        phone: ownerPhone,
        idProofType: ownerIdProofType,
        idProofNumber: ownerIdProofNumber,
        idProofImageUrl: ownerIdProofImageUrl,
        electricityBillNumber: ownerElectricityBillNumber || null,
        electricityBillImageUrl: ownerElectricityBillImageUrl || null,
      },
      status: PROPERTY_STATUS.PENDING,
    });

    const response = await property.save();
    console.log("Property saved:", response);

    // update owner's properties array and fallback fields (do not overwrite existing non-empty fields)
    owner.properties.push(property._id);
    if (!owner.electricityBill && ownerElectricityBillNumber) {
      owner.electricityBill = ownerElectricityBillNumber;
    }
    if (!owner.electricityBillImageUrl && ownerElectricityBillImageUrl) {
      owner.electricityBillImageUrl = ownerElectricityBillImageUrl;
    }
    await owner.save();

    // populate owner.user for returning
    const populatedOwner = await Owner.findById(owner._id)
      .populate({
        path: "user",
        select: "name email phone",
      })
      .lean();

    const returnedProperty = {
      id: property._id,
      title: property.title,
      description: property.description,
      location: property.location,
      rent: property.rent === undefined ? null : property.rent,
      deposit: property.deposit === undefined ? null : property.deposit,
      listingType: property.listingType,
      price: property.price === undefined ? null : property.price,
      propertyType: property.propertyType === undefined ? null : property.propertyType,
      bedrooms: property.bedrooms === undefined ? null : property.bedrooms,
      bathrooms: property.bathrooms === undefined ? null : property.bathrooms,
      area: property.area === undefined ? null : property.area,
      amenities: property.amenities,
      images: property.images,
      status: property.status,
      owner: populatedOwner
        ? {
          id: populatedOwner._id,
          name:
            (populatedOwner.user && populatedOwner.user.name) ||
            populatedOwner.name ||
            null,
          email:
            (populatedOwner.user && populatedOwner.user.email) ||
            populatedOwner.email ||
            null,
          phone:
            property.ownerDetails?.phone ||
            (populatedOwner.user && populatedOwner.user.phone) ||
            populatedOwner.phone ||
            null,
          idProofType:
            property.ownerDetails?.idProofType || populatedOwner.idProofType || null,
          idProofNumber:
            property.ownerDetails?.idProofNumber || populatedOwner.idProofNumber || null,
          idProofImageUrl:
            property.ownerDetails?.idProofImageUrl || populatedOwner.idProofImageUrl || null,
          // electricity fields
          electricityBillNumber:
            property.ownerDetails?.electricityBillNumber ||
            populatedOwner.electricityBill ||
            null,
          electricityBillImageUrl:
            property.ownerDetails?.electricityBillImageUrl ||
            populatedOwner.electricityBillImageUrl ||
            null,
        }
        : property.owner,
      ownerDetails: property.ownerDetails,
      createdAt: property.createdAt,
    };

    res.status(201).json({
      statusCode: 201,
      success: true,
      error: null,
      data: {
        message: "Property uploaded successfully",
        property: returnedProperty,
      },
    });
  } catch (error) {
    console.error("Upload property error:", error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: {
        message: "Internal server error",
        details: error.message,
      },
      data: null,
    });
  }
};

// Get owner's properties
const getOwnerProperties = async (req, res) => {
  try {
    const owner = await Owner.findOne({ user: req.user._id }).populate(
      "properties"
    );
    if (!owner) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        error: {
          message: "Owner profile not found",
        },
        data: null,
      });
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      error: null,
      data: {
        message: "Properties retrieved successfully",
        properties: owner.properties.map((property) => ({
          id: property._id,
          title: property.title,
          description: property.description,
          location: property.location,
          rent: property.rent === undefined ? null : property.rent,
          deposit: property.deposit === undefined ? null : property.deposit,
          listingType: property.listingType,
          price: property.price === undefined ? null : property.price,
          propertyType: property.propertyType === undefined ? null : property.propertyType,
          bedrooms: property.bedrooms === undefined ? null : property.bedrooms,
          bathrooms: property.bathrooms === undefined ? null : property.bathrooms,
          area: property.area === undefined ? null : property.area,
          amenities: property.amenities,
          images: property.images,
          status: property.status,
          ownerDetails: property.ownerDetails || {},
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
        })),
        totalProperties: owner.properties.length,
      },
    });
  } catch (error) {
    console.error("Get owner properties error:", error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: {
        message: "Internal server error",
        details: error.message,
      },
      data: null,
    });
  }
};

const getProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id }).populate({
      path: "owner",
      populate: {
        path: "user",
        model: "User",
        select: "name email phone",
      },
    });

    if (!property) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        error: {
          message: "Property not found",
        },
        data: null,
      });
    }

    // Build owner object for response (prefer property.ownerDetails then owner model then user fields)
    let ownerObj = null;
    if (property.owner) {
      const owner = property.owner;
      const user = owner.user || {};
      const perProp = property.ownerDetails || {};

      ownerObj = {
        id: owner._id,
        name: perProp.name || user.name || owner.name || null,
        email: perProp.email || user.email || owner.email || null,
        phone:
          perProp.phone ||
          (user && user.phone) ||
          owner.phone ||
          owner.mobile ||
          null,
        idProofType:
          perProp.idProofType || owner.idProofType || null,
        idProofNumber:
          perProp.idProofNumber || owner.idProofNumber || null,
        idProofImageUrl:
          perProp.idProofImageUrl || owner.idProofImageUrl || null,
        electricityBillNumber:
          perProp.electricityBillNumber || owner.electricityBill || null,
        electricityBillImageUrl:
          perProp.electricityBillImageUrl || owner.electricityBillImageUrl || null,
        verified: owner.verified || false,
      };
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      error: null,
      data: {
        message: "Property retrieved successfully",
        property: {
          id: property._id,
          title: property.title,
          description: property.description,
          location: property.location,
          rent: property.rent === undefined ? null : property.rent,
          deposit: property.deposit === undefined ? null : property.deposit,
          listingType: property.listingType,
          price: property.price === undefined ? null : property.price,
          propertyType: property.propertyType === undefined ? null : property.propertyType,
          bedrooms: property.bedrooms === undefined ? null : property.bedrooms,
          bathrooms: property.bathrooms === undefined ? null : property.bathrooms,
          area: property.area === undefined ? null : property.area,
          amenities: property.amenities,
          images: property.images,
          status: property.status,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          owner: ownerObj,
          ownerDetails: property.ownerDetails || {},
        },
      },
    });
  } catch (error) {
    console.error("Get property error:", error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: {
        message: "Internal server error",
        details: error.message,
      },
      data: null,
    });
  }
};

// Update property
const updateProperty = async (req, res) => {
  const {
    title,
    description,
    location,
    rent,
    deposit,
    listingType,
    price,
    propertyType,
    bedrooms,
    bathrooms,
    area,
    amenities,
    images,
    ownerDetails, // allow ownerDetails object
  } = req.body;

  const allowedUpdates = [
    "title",
    "description",
    "location",
    "rent",
    "deposit",
    "listingType",
    "price",
    "propertyType",
    "bedrooms",
    "bathrooms",
    "area",
    "amenities",
    "images",
    "ownerDetails",
  ];

  // Validate only allowed fields are being updated
  const isValidOperation = Object.keys(req.body).every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).json({
      statusCode: 400,
      success: false,
      error: {
        message:
          "Invalid updates! Allowed fields: " + allowedUpdates.join(", "),
      },
      data: null,
    });
  }

  try {
    // Find owner
    const owner = await Owner.findOne({ user: req.user._id });
    if (!owner) {
      return res.status(403).json({
        statusCode: 403,
        success: false,
        error: {
          message: "Owner profile not found",
        },
        data: null,
      });
    }

    // Find property belonging to owner
    const property = await Property.findOne({
      _id: req.params.id,
      owner: owner._id,
    });

    if (!property) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        error: {
          message:
            "Property not found or you do not have permission to update this property",
        },
        data: null,
      });
    }

    // If approved/published, re-approval needed
    if (
      property.status === PROPERTY_STATUS.APPROVED ||
      property.status === PROPERTY_STATUS.PUBLISHED
    ) {
      property.status = PROPERTY_STATUS.PENDING;
    }

    // Update fields explicitly
    if (title !== undefined) property.title = title;
    if (description !== undefined) property.description = description;
    if (location !== undefined) property.location = location;
    if (rent !== undefined) property.rent = rent;
    if (deposit !== undefined) property.deposit = deposit;
    if (listingType !== undefined) property.listingType = listingType;
    if (price !== undefined) property.price = price;
    if (propertyType !== undefined) property.propertyType = propertyType;
    if (bedrooms !== undefined) property.bedrooms = bedrooms;
    if (bathrooms !== undefined) property.bathrooms = bathrooms;
    if (area !== undefined) property.area = area;
    if (amenities !== undefined) property.amenities = amenities || [];
    if (images !== undefined) property.images = images || [];

    // Update ownerDetails if provided (merge)
    if (ownerDetails) {
      property.ownerDetails = {
        ...property.ownerDetails,
        ...ownerDetails,
      };

      // sync with Owner model fallback fields (only set if Owner missing those fields)
      if (ownerDetails.electricityBillNumber && !owner.electricityBill) {
        owner.electricityBill = ownerDetails.electricityBillNumber;
      }
      if (ownerDetails.electricityBillImageUrl && !owner.electricityBillImageUrl) {
        owner.electricityBillImageUrl = ownerDetails.electricityBillImageUrl;
      }
      await owner.save();
    }

    const normalizedListingType = (property.listingType || "").toString();

    // Enforce commercial rule AFTER applying updates
    if (normalizedListingType === "commercial") {
      property.bedrooms = null;
      property.bathrooms = null;
      property.propertyType = null;
      property.rent = null;
      property.deposit = null;

    } else if (normalizedListingType === "rent") {

      property.price = null;

    } else {

      property.rent = null;
      property.deposit = null;

    }
    property.updatedAt = new Date();
    await property.save();

    res.status(200).json({
      statusCode: 200,
      success: true,
      error: null,
      data: {
        message: "Property updated successfully",
        property: {
          id: property._id,
          title: property.title,
          description: property.description,
          location: property.location,
          rent: property.rent === undefined ? null : property.rent,
          deposit: property.deposit === undefined ? null : property.deposit,
          listingType: property.listingType,
          price: property.price === undefined ? null : property.price,
          propertyType: property.propertyType === undefined ? null : property.propertyType,
          bedrooms: property.bedrooms === undefined ? null : property.bedrooms,
          bathrooms: property.bathrooms === undefined ? null : property.bathrooms,
          area: property.area === undefined ? null : property.area,
          amenities: property.amenities,
          images: property.images,
          status: property.status,
          owner: property.owner,
          ownerDetails: property.ownerDetails || {},
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update property error:", error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: {
        message: "Internal server error",
        details: error.message,
      },
      data: null,
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id });
    if (!property) {
      return res.status(404).json({
        statusCode: 404,
        success: false,
        error: {
          message: "Property not found",
        },
        data: null,
      });
    }

    await Property.deleteOne({ _id: req.params.id });

    // Also remove from owner's list if it exists
    if (property.owner) {
      try {
        await Owner.updateOne(
          { _id: property.owner },
          { $pull: { properties: property._id } }
        );
      } catch (err) {
        console.warn("Failed to remove property from owner list:", err);
      }
    }

    res.status(200).json({
      statusCode: 200,
      success: true,
      error: null,
      data: {
        message: "Property deleted successfully",
      },
    });
  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({
      statusCode: 500,
      success: false,
      error: {
        message: "Internal server error",
        details: error.message,
      },
      data: null,
    });
  }
};

module.exports = {
  uploadProperty,
  getOwnerProperties,
  updateProperty,
  getProperty,
  deleteProperty,
};
