import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export const extractTestMetadata = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No question paper file uploaded" });
    }

    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${AI_SERVICE_URL}/extract-tags`, formData, {
      headers: { ...formData.getHeaders() }
    });

    fs.unlink(req.file.path, () => {});

    return res.status(200).json({
      success: true,
      data: response.data.data
    });

  } catch (error) {
    console.error("AI Service Error:", error.response?.data || error.message);
    if (req.file) fs.unlink(req.file.path, () => {});
    return res.status(500).json({ message: "AI Analysis failed", error: error.message });
  }
};
