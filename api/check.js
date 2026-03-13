export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const { answer } = req.body;

  const correctAnswer = process.env.NODE7_ANSWER;
  const flag = process.env.NODE7_FLAG;

  if (answer === correctAnswer) {
    return res.status(200).json({
      correct: true,
      flag: flag
    });
  }

  return res.status(200).json({
    correct: false
  });
}
