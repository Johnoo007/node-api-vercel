const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/generate", async (req, res) => {
  const userInput = req.body.text;

  const prompt = `Event: "${userInput}"  
Describe **exactly 5** continuous and increasingly severe consequences in numbered format with simple language.  
1. Each consequence must be realistic, creative and logically follow the previous one.  
2. Only list the 5 consequences—no extra commentary or explanation.  
3. After listing the consequences, end with an engaging question about the situation.  
**Format :**  
1. [First consequence]  
2. [Second consequence]  
3. [Third consequence]  
4. [Fourth consequence]  
5. [Fifth consequence]  
[The final question asks what you will do next in this situation.]  
 `;

  try {
    // เชื่อมต่อกับ Hugging Face API
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/google/gemma-2-2b-it", // เปลี่ยนเป็นโมเดลที่รองรับภาษาอังกฤษ
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
        },
      }
    );

    // // รับผลลัพธ์ที่ได้จาก Hugging Face และจัดการข้อมูลที่ส่งกลับ
    const lines = response.data[0].generated_text.split("\n").map(e => e.trim()).filter(e => e);
    const effects = lines.slice(12, 20); // เอาแค่ 5 ข้อแรก
    console.log(effects)
    res.json({ result: effects }); // ส่งผลลัพธ์กลับไปยัง client
  //   res.json({ "result": [
  //   "1. Mild: Some mild nostalgia, a yearning for a specific feeling of relaxation or a sense of achievement.",
  //   "2. Moderately Severe: Can't stop thinking about your missed test, anxiety flares up.",
  //   "3. Severe: Extreme stress and panic, feeling like freezing up or causing damage.",
  //   "4. Ultimate: Dishonest and harmful actions (cheating, plagiarism, lying, etc.) taken in attempt to make up for failing the exam.",
  //   "5. Extreme: Self-destructive thoughts and tempting actions (suicidal ideation, accidental harm)."
  // ] }); // ส่งผลลัพธ์กลับไปยัง client

  } catch (error) {
    console.error("Error fetching from Hugging Face:", error);
    res.status(500).json({ error: "AI Error" });
  }
});

async function testAPI() {
  const API_URL = "https://api-inference.huggingface.co/models/google/gemma-2-2b-it"; // URL ของโมเดล GPT-2

  try {
    const response = await axios.post(
      API_URL,
      { inputs: "How are you today? (short answer)" }, // ใช้คำถามภาษาอังกฤษ
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );
    
    console.log("✅ API Response:", response.data);
  } catch (error) {
    console.error("❌ API Error:", error.response ? error.response.data : error.message);
  }
}

// testAPI();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;