
const send = (err, data, res) => {
  if (err) {
    const code = err.code || 400;
    if (code === 200) {
      res.status(200).json({
        success: false,
        err: err.message,
      });
    } else {
      res.status(code).send(err.stack);
    }
  } else {
    res.status(200).json(data);
  }
};

module.exports.send = send;
