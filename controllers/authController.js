const { db } = require("../FirebaseAdmin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

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

const login = async (req, res) => {
      try {
      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();


      let user = null;

      // Check Admin / Manager
      user = await findUserByEmail(
        "users",
        normalizedEmail
      );

      // Check Employee
      if (!user) {
        user = await findUserByEmail(
          "employees",
          normalizedEmail,
          "employee"
        );
      }

      // Check Client
      if (!user) {
        user = await findUserByEmail(
          "clients",
          normalizedEmail,
          "client"
        );
      }

      const isValidUser =
        user &&
        (await bcrypt.compare(
          password,
          user.password
        ));

      if (!isValidUser) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

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