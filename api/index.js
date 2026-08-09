let appPromise;

module.exports = async (req, res) => {
  try {
    if (!appPromise) {
      appPromise = import("../artifacts/api-server/dist/app.mjs").then(
        (m) => m.default || m
      );
    }
    const app = await appPromise;
    return app(req, res);
  } catch (err) {
    console.error("Vercel Serverless Function error:", err);
    res.status(500).json({
      message: err.message || "Internal Server Error",
    });
  }
};
