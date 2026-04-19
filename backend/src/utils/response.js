export const success = (res, data, message, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data
  });
};

export const error = (res, message, status = 500, err = null) => {
  if (err) console.error(`[Error]: ${message}`, err);
  return res.status(status).json({
    success: false,
    message,
    error: err?.message || err
  });
};
