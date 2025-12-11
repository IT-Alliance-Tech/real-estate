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
  } = req.body;

  try {
    // Find owner profile
    const owner = await Owner.findOne({ user: req.user._id });
    console.log(owner);

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

    const property = new Property({
      owner: owner._id,
      title,
      description,
      location,
      rent: listingType === 'rent' ? rent : undefined,
      deposit: listingType === 'rent' ? deposit : undefined,
      listingType,
      price: listingType !== 'rent' ? price : undefined,
      propertyType,
      bedrooms,
      bathrooms,
      area,
      amenities: amenities || [],
      images: images || [],
      ownerDetails: {
        phone: ownerPhone,
        idProofType: ownerIdProofType,
        idProofNumber: ownerIdProofNumber,
        idProofImageUrl: ownerIdProofImageUrl,
      },
      status: PROPERTY_STATUS.PENDING,
    });

    const response = await property.save();
    console.log("Property saved:", response);

    owner.properties.push(property._id);
    await owner.save();

    const populatedOwner = await Owner.findById(owner._id)
      .populate({
        path: "user",
        select: "name email phone",
      })
      .lean();
    // populate property.owner field with populatedOwner
    const returnedProperty = {
      id: property._id,
      title: property.title,
      description: property.description,
      location: property.location,
      rent: property.rent,
      deposit: property.deposit,
      listingType: property.listingType,
      price: property.price,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      area: property.area,
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
              (populatedOwner.user && populatedOwner.user.phone) ||
              populatedOwner.phone ||
              null,
            idProofType: property.ownerDetails?.idProofType || populatedOwner.idProofType || null,
            idProofNumber: property.ownerDetails?.idProofNumber || populatedOwner.idProofNumber || null,
            idProofImageUrl: property.ownerDetails?.idProofImageUrl || populatedOwner.idProofImageUrl || null,
            // Use property-specific details if available, else fallback to profile
            phone: property.ownerDetails?.phone ||
              (populatedOwner.user && populatedOwner.user.phone) ||
              populatedOwner.phone ||
              null,
          }
        : property.owner,
      ownerDetails: property.ownerDetails, // Include raw ownerDetails in response
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
          rent: property.rent,
          deposit: property.deposit,
          listingType: property.listingType,
          price: property.price,
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          amenities: property.amenities,
          images: property.images,
          status: property.status,
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

    // Build owner object for response (prefer user fields if populated)
    let ownerObj = null;
    if (property.owner) {
      const owner = property.owner;
      const user = owner.user || {};
      ownerObj = {
        id: owner._id,
        name: user.name || owner.name || null,
        email: user.email || owner.email || null,
        phone: user.phone || owner.phone || null,
        idProofType: property.ownerDetails?.idProofType || owner.idProofType || null,
        idProofNumber: property.ownerDetails?.idProofNumber || owner.idProofNumber || null,
        idProofImageUrl: property.ownerDetails?.idProofImageUrl || owner.idProofImageUrl || null,
        verified: owner.verified || false,
        // Prefer property specific phone
        phone: property.ownerDetails?.phone || user.phone || owner.phone || null,
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
          rent: property.rent,
          deposit: property.deposit,
          listingType: property.listingType,
          price: property.price,
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          amenities: property.amenities,
          images: property.images,
          status: property.status,
          createdAt: property.createdAt,
          updatedAt: property.updatedAt,
          owner: ownerObj,
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
    
    // Update ownerDetails if provided
    if (req.body.ownerDetails) {
       property.ownerDetails = {
         ...property.ownerDetails, // merge with existing
         ...req.body.ownerDetails
       }
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
          rent: property.rent,
          deposit: property.deposit,
          listingType: property.listingType,
          price: property.price,
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          area: property.area,
          amenities: property.amenities,
          images: property.images,
          status: property.status,
          owner: property.owner,
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
