const { db, admin } = require("../FirebaseAdmin");
const bcrypt = require("bcryptjs");

const createManager = async (req, res) => {
  try {
    const { name, email, password, profilePicture } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db
      .collection("users")
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("users").add({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "manager",
      profilePicture:"",
      isActive: "true",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "Manager created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create manager" });
  }
};

/*const createClient = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db
      .collection("clients")
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.collection("clients").add({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "client",
      isActive: "true",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: "Client created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create manager" });
  }
};*/

const getManagers = async (req, res) => {
  try {
    const snapshot = await db
      .collection("users")
      .orderBy("createdAt", "desc")
      .get();

    const managers = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate().toLocaleString() : null,
      };
      
    });

    res.status(200).json(managers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch managers" });
  }
};

const deleteManager = async (req, res) => {
  try {
    await db.collection("users").doc(req.params.id).delete();
    res.json({ message: "Manager deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete manager" });
  }
};

const updateManagerProfile = async (req, res) => {
  try {
    const { } = req.body;

    let profilePictureUrl;

    if (req.files?.profilePicture?.[0]) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            folder: "manager-profile-pictures",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier
          .createReadStream(
            req.files.profilePicture[0].buffer
          )
          .pipe(stream);
      });

      profilePictureUrl = result.secure_url;
    }

    const updates = {
      ...(profilePictureUrl && {
        profilePicture: profilePictureUrl,
      }),
      updatedAt: new Date(),
    };

    await db
      .collection("users")
      .doc(req.user.id)
      .update(updates);

    return res.status(200).json({
      message: "Profile updated successfully",
      updatedFields: updates,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createManager,
  //createClient,
  getManagers,
  deleteManager,
  updateManagerProfile

};