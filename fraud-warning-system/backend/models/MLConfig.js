const mongoose = require("mongoose");

const ALGORITHMS = [
  "isolation_forest",
  "autoencoder",
  "one_class_svm",
  "local_outlier_factor",
];

const mlConfigSchema = new mongoose.Schema(
  {
    activeAlgorithm: {
      type: String,
      enum: ALGORITHMS,
      default: "isolation_forest",
    },
    riskThreshold: {
      type: Number,
      min: 1,
      max: 100,
      default: 70,
    },
    modelSensitivity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  { timestamps: true, collection: "ml_config" },
);

module.exports = mongoose.model("MLConfig", mlConfigSchema);
