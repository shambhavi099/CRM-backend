const { db } = require("../FirebaseAdmin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = null;

    // Check users collection (admin/manager)
    const usersSnapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!usersSnapshot.empty) {
      const doc = usersSnapshot.docs[0];

      user = {
        id: doc.id,
        ...doc.data(),
      };
    }

    // Check employees collection
    if (!user) {
      const employeeSnapshot = await db
        .collection("employees")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!employeeSnapshot.empty) {
        const doc = employeeSnapshot.docs[0];

        user = {
          id: doc.id,
          ...doc.data(),
          role: "employee",
        };
      }
    }

    // Check clients collection
    if (!user) {
      const clientSnapshot = await db
        .collection("clients")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!clientSnapshot.empty) {
        const doc = clientSnapshot.docs[0];

        user = {
          id: doc.id,
          ...doc.data(),
          role: "client",
        };
      }
    }

    // User not found
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log("Found user:", {
    email: user.email,
    role: user.role
  });

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};

module.exports = { login };

const findUserByEmail = async (
  collectionName,
  email,
  defaultRole = null
) => {
  const snapshot = await db
    .collection(collectionName)
    .where("email", "==", email)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];

  return {
    id: doc.id,
    ...doc.data(),
    ...(defaultRole && {
      role: defaultRole,
    }),
  };
};

module.exports = { login };