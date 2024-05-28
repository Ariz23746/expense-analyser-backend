const asyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    await requestHandler(req, res, next);
  } catch (err) {
    console.log("err", err);
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.errors,
    });
  }
};

export default asyncHandler;
