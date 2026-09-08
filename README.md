# SSTV Decoder
# 📡 SSTV Decoder

A web-based **Slow Scan Television (SSTV) decoding application** that allows users to upload SSTV audio recordings and decode them into images through an integrated web interface.

The project combines a modern web application with a Python-based SSTV decoding pipeline, providing an easy-to-use platform for uploading, processing, and viewing decoded SSTV images.

## ✨ Features

* 📤 Upload SSTV audio files for decoding
* 🖼️ Convert SSTV audio signals into images
* 🔐 User authentication and protected routes
* 👤 User registration, login, and profile management
* 🔑 Password recovery and reset functionality
* 🗂️ Gallery for viewing decoded images
* 📡 Python-based SSTV decoding
* 🌐 Web-based user interface
* 💾 Database storage for users and decoded image information

## 🛠️ Tech Stack

### Frontend

* ⚛️ React
* ⚡ Vite
* 🎨 Tailwind CSS

### Backend

* 🟢 Node.js
* 🚂 Express.js
* 🍃 MongoDB

### SSTV Decoder

* 🐍 Python
* 📡 SSTV decoding modules

## 🚀 How It Works

1. The user registers and logs into the application.
2. An SSTV audio recording is uploaded through the web interface.
3. The audio file is sent to the backend for processing.
4. The backend invokes the Python-based SSTV decoder.
5. The SSTV signal is decoded into an image.
6. The decoded image is stored and displayed in the user's gallery.

## 📂 Project Components

* **Frontend:** Provides the user interface for uploading audio files and viewing decoded images.
* **Backend:** Handles authentication, file uploads, API requests, and communication with the decoder.
* **Database:** Stores user and decoded image information.
* **Python Decoder:** Processes SSTV audio signals and generates decoded images.

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/TRUSHALIPHATAK/SSTV-Decoder-.git
cd SSTV-Decoder-
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `backend` directory and add the required configuration variables.

Example:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
```

> ⚠️ Do not upload your `.env` file or credentials to GitHub.

## ▶️ Running the Application

### Start the Backend

From the `backend` directory:

```bash
npm start
```

### Start the Frontend

From the project root directory:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## 🔮 Future Improvements

* Support additional SSTV modes
* Real-time SSTV decoding
* Improved signal processing and synchronization
* Live SDR integration
* Satellite ground station integration
* Automatic SSTV signal detection

## 👩‍💻 Author

**Trushali Phatak**

Aspiring Space Systems Engineer | RF & Satellite Communications | Embedded Systems | AI/ML

---

⭐ If you find this project useful, consider giving the repository a star!
