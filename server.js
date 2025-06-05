import express from 'express';
import multer from 'multer';
import path from 'path';
import { execFile } from 'child_process';
import fs from 'fs/promises';

const app = express();
const upload = multer({ dest: 'uploads/' });

const WAIFU2X_BIN = './waifu2x-converter-cpp'; // place your binary here

app.post('/upscale', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded');

  const inputPath = req.file.path;
  const outputPath = `${inputPath}-upscaled.png`;

  try {
    // Run waifu2x to upscale image to 1024x1024 PNG
    await new Promise((resolve, reject) => {
      execFile(WAIFU2X_BIN, [
        '-i', inputPath,
        '-o', outputPath,
        '-s', '2',        // scale 2x (adjust as needed)
        '-m', 'noise_scale', // noise reduction + scale
        '-n', '3'         // noise level (0-3)
      ], (err) => err ? reject(err) : resolve());
    });

    res.type('png');
    const data = await fs.readFile(outputPath);
    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Upscaling failed');
  } finally {
    // Cleanup temp files
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Waifu2x API running on port ${port}`));