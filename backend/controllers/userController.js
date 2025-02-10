const getUser = async (req, res) => {
  console.log("Cookies Received:", req.cookies);
  try {
    console.log("Cookies Received:", req.cookies);

    if (!req.user1) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    
    res.status(200).json({
      id: req.user1.id,
      email: req.user1.email,
      role: req.user1.role
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { getUser };
