import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { auth } from '../middleware/auth.js'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const createUploadPath = (userId, type) => {
  const baseDir = path.join(__dirname, '../public/uploads')
  const userDir = path.join(baseDir, userId.toString())
  const typeDir = path.join(userDir, type)

  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir)
  if (!fs.existsSync(userDir)) fs.mkdirSync(userDir)
  if (!fs.existsSync(typeDir)) fs.mkdirSync(typeDir)

  return typeDir
}

const getStorage = (type) => multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user._id
    const uploadDir = createUploadPath(userId, type)
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Nur JPG, PNG und GIF Dateien sind erlaubt'), false)
  }
}

const uploadImage = multer({
  storage: getStorage('images'),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

const uploadAvatar = multer({
  storage: getStorage('avatars'),
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
})

router.post('/', auth, uploadImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' })
    }

    const userId = req.user._id
    const imageUrl = `/uploads/${userId}/images/${req.file.filename}`
    
    res.json({ 
      url: imageUrl,
      filename: req.file.filename
    })
  } catch (error) {
    console.error('Upload-Fehler:', error)
    res.status(500).json({ error: 'Fehler beim Hochladen der Datei' })
  }
})

router.post('/avatar', auth, uploadAvatar.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' })
    }

    const userId = req.user._id
    const imageUrl = `/uploads/${userId}/avatars/${req.file.filename}`
    
    res.json({ 
      url: imageUrl,
      filename: req.file.filename
    })
  } catch (error) {
    console.error('Upload-Fehler:', error)
    res.status(500).json({ error: 'Fehler beim Hochladen der Datei' })
  }
})

router.delete('/:filename', auth, (req, res) => {
  try {
    const userId = req.user._id
    const filename = req.params.filename
    const filepath = path.join(__dirname, '../public/uploads', userId.toString(), 'images', filename)

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Datei nicht gefunden' })
    }

    fs.unlinkSync(filepath)
    res.json({ message: 'Datei erfolgreich gelöscht' })
  } catch (error) {
    console.error('Lösch-Fehler:', error)
    res.status(500).json({ error: 'Fehler beim Löschen der Datei' })
  }
})

router.delete('/avatar/:filename', auth, (req, res) => {
  try {
    const userId = req.user._id
    const filename = req.params.filename
    const filepath = path.join(__dirname, '../public/uploads', userId.toString(), 'avatars', filename)

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Datei nicht gefunden' })
    }

    fs.unlinkSync(filepath)
    res.json({ message: 'Datei erfolgreich gelöscht' })
  } catch (error) {
    console.error('Lösch-Fehler:', error)
    res.status(500).json({ error: 'Fehler beim Löschen der Datei' })
  }
})

export default router 