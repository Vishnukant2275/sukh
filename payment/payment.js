exports.generateQrCode= async (req, res) => {
  try {
    const text = req.params.text; // URL ya custom text
    const qrDataUrl = await QRCode.toDataURL(text);

    // QR ko HTML img ke roop me bhej rahe hain
    res.send(`
      <h2>QR Code for: ${text}</h2>
      <img src="${qrDataUrl}" alt="QR Code"/>
    `);
  } catch (err) {
    res.status(500).send("Error generating QR code");
  }
}
