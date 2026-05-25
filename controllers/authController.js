const { db } = require("../FirebaseAdmin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "FLOWCLIENT_SECRET"; 

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userDoc = snapshot.docs[0];

    const user = {
      id: userDoc.id,
      ...userDoc.data()
    };

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id : user.id,
        email: user.email,
        role: user.role, 
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    );
    console.log(req.user);
    return res.status(200).json({
      token,
      user: { email: user.email, name: user.name },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
};

module.exports = { login };