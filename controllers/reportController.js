const Report = require("./../models/report");
const User = require("./../models/userModel");
const File = require("./../models/file");
const APIFeatures = require("./../utils/apiFeatures");
const sendEmail = require("./../utils/email");

exports.getAllReports = async (req, res, next) => {
  try {
    let reports;
    reports = Report.find();
    const estCount = await Report.find().countDocuments(); // SEND RESPONSE
    const features = new APIFeatures(reports, req.query)
      // .filter()
      .paginate()
      .sort();
    reports = await features.query.populate({ path: "fileId", select: "name" });
    const limit = req.query.limit * 1 || 5;
    res.status(200).json({
      status: "success",
      totalPages: Math.ceil(estCount / limit),
      results: reports.length,
      data: {
        reports,
      },
    });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err,
    });
  }
};

exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate({
      path: "fileId",
      select: "_id",
    });
    console.log(report.fileId._id);
    await File.findByIdAndDelete(report.fileId._id);
    await Report.deleteMany({ fileId: report.fileId._id });
    res.status(204).json({ status: "success" });
  } catch (err) {
    return res.status(400).json({
      status: "error",
      message: err,
    });
  }
};

exports.sendWarning = async (req, res, next) => {
  const report = await Report.findById(req.params.id).populate({
    path: "fileId",
    select: "userId name",
  });
  const user = await User.findById(report.fileId.userId);
  const message = `Hi user ${user.name}. Your file ${report.fileId.name} has been reported for potential policy violation. Please check`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Reported file",
      message,
    });
    return res.status(200).json({
      status: "success",
      msg: "Token sent to email",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      msg: "Server could not send email, try again later",
    });
  }
};
