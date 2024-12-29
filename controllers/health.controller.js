const healthcheck = async (req, res) => {
    return res
        .status(200)
        .json({ success: true, health: "OK", message: "Health check passed!" });
};

export { healthcheck };
