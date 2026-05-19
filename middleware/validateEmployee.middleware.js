module.exports = (req, res, next) => {
  const {
    name,
    number,
    email,
    DOB,
    emergencyContact,
    aadhar,
    pan,
  } = req.body;

  if (!name || !number || !email || !DOB || !emergencyContact) {
    return res.status(400).json({
      message: "Name, Mobile, Email, DOB and Emergency Contact are required",
    });
  }

  const mobileRegex = /^[6-9]\d{9}$/;
  if (!mobileRegex.test(number)) {
    return res.status(400).json({
      message: "Invalid mobile number",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email address",
    });
  }

  const dobDate = new Date(DOB);
  if (isNaN(dobDate.getTime())) {
    return res.status(400).json({
      message: "Invalid date of birth",
    });
  }

  if (!aadhar && !pan) {
    return res.status(400).json({
      message: "At least one KYC document (Aadhar or PAN) is required",
    });
  }

  next();
};
