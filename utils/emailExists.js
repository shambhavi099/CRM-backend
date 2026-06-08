const { db } = require("../FirebaseAdmin");

const emailExists = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();

  const users = await db
    .collection("users")
    .where("email", "==", normalizedEmail)
    .limit(1)
    .get();

  if (!users.empty) return true;

  const employees = await db
    .collection("employees")
    .where("email", "==", normalizedEmail)
    .limit(1)
    .get();

  if (!employees.empty) return true;

  const clients = await db
    .collection("clients")
    .where("email", "==", normalizedEmail)
    .limit(1)
    .get();

  return !clients.empty;
};

module.exports = {
  emailExists
}