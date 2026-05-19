const { db } = require("../FirebaseAdmin");

const getNotifications = async (req, res) => {
    try{
        const snapshot = await db.collection("notifications")
        .orderBy("createdAt", "desc")
        .get();

        const notifications = snapshot.docs.map((doc) => ({
            id : doc.id,
            ...doc.data(),
        }));

        res.status(200).json(notifications)
    }
    catch(err){
        console.error("Get notifications error:", err);
    }
}

const markAsRead =  async (req, res) => {
try{
    const { id } = req.params;
    await db.collection("notifications").doc(id).update({
        isRead: true
    });

    res.status(200).json({message: "Notification marked as read"})
}
catch(err){
    console.error("Mark as read error: ", err)
}
}

module.exports = {
    getNotifications,
    markAsRead
}