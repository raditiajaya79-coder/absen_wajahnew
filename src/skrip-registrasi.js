document.addEventListener("DOMContentLoaded", async () => {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const photo = document.getElementById("photo");
  const captureButton = document.getElementById("captureButton");
  const faceRegistrationForm = document.getElementById("faceRegistrationForm");
  const messageElement = document.getElementById("message");
  const fullNameInput = document.getElementById("fullName");
  const idNumberInput = document.getElementById("idNumber");
  const roleInput = document.getElementById("role");
  const scheduleTypeSelect = document.getElementById("scheduleType");
  const defaultScheduleFields = document.getElementById(
    "defaultScheduleFields"
  );
  const customScheduleFields = document.getElementById("customScheduleFields");
  const defaultArrivalTimeInput = document.getElementById("defaultArrivalTime");
  const defaultDepartureTimeInput = document.getElementById(
    "defaultDepartureTime"
  );
  const customArrivalTimeInput = document.getElementById("customArrivalTime");
  const customDepartureTimeInput = document.getElementById(
    "customDepartureTime"
  );

  let capturedImageBase64 = null;
  let capturedFaceSignature = null;
  let capturedFaceEmbedding = null;
  const FACE_SIZE = 40; // Ukuran wajah untuk signature

  // Akses kamera dengan error handling yang lebih baik
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
      });
      video.srcObject = stream;
      video.play();

      // Tambahkan event listener untuk error kamera
      video.addEventListener("error", (err) => {
        console.error("Video error:", err);
        messageElement.textContent =
          "Kesalahan kamera saat registrasi. Pastikan kamera tidak digunakan aplikasi lain.";
        messageElement.style.color = "red";
      });
    } catch (err) {
      console.error("Error accessing camera: ", err);
      messageElement.textContent = "Gagal mengakses kamera. Pastikan:";
      messageElement.style.color = "red";
      messageElement.innerHTML += "<br>-- Anda memberikan izin akses kamera --";
      messageElement.innerHTML +=
        "<br>-- Kamera tidak digunakan aplikasi lain --";
    }
  }

  // Ambil foto dari video
  captureButton.addEventListener("click", async () => {
    try {
      // Pastikan video siap
      if (!video.readyState || video.readyState < 2) {
        messageElement.textContent =
          "Kamera belum siap. Harap tunggu beberapa saat.";
        messageElement.style.color = "orange";
        return;
      }

      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      capturedImageBase64 = canvas.toDataURL("image/png");
      photo.src = capturedImageBase64;
      photo.style.display = "block";
      video.style.display = "none";
      captureButton.textContent = "Ambil Ulang Foto";

      // Process image for signature
      capturedFaceSignature = processImageForSignature(canvas);

      // Extract embedding using face-api.js if available (simulated)
      // In a real implementation, this would use face-api.js properly
      capturedFaceEmbedding = await extractFaceEmbedding(canvas);

      messageElement.textContent =
        "Foto berhasil diambil. Silakan daftarkan wajah.";
      messageElement.style.color = "green";
    } catch (error) {
      console.error("Error capturing image:", error);
      messageElement.textContent = "Gagal mengambil foto. Coba lagi.";
      messageElement.style.color = "red";
    }
  });

  // Fungsi untuk memproses gambar (grayscale, resize, signature pixel array)
  function processImageForSignature(sourceCanvas) {
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");

    // Resize ke ukuran FACE_SIZE x FACE_SIZE
    tempCanvas.width = FACE_SIZE;
    tempCanvas.height = FACE_SIZE;
    tempContext.drawImage(sourceCanvas, 0, 0, FACE_SIZE, FACE_SIZE);

    const imageData = tempContext.getImageData(0, 0, FACE_SIZE, FACE_SIZE);
    const data = imageData.data;
    const signature = [];

    for (let i = 0; i < data.length; i += 4) {
      // Convert to grayscale (rata-rata R, G, B)
      const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
      signature.push(Math.round(grayscale));
    }
    return signature;
  }

  // Function to simulate face embedding extraction (would use face-api.js in real implementation)
  async function extractFaceEmbedding(canvas) {
    try {
      // In a real implementation with face-api.js, we would do something like:
      // const detections = await faceapi.detectSingleFace(canvas).withFaceLandmarks().withFaceDescriptor();
      // return detections?.descriptor;

      // For now, we'll simulate an embedding
      const embedding = Array.from({ length: 512 }, () => Math.random());

      return {
        embedding: embedding,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error extracting face embedding:", error);
      return null;
    }
  }

  // Handle form submission
  faceRegistrationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!capturedImageBase64 || !capturedFaceSignature) {
      messageElement.textContent = "Harap ambil foto wajah terlebih dahulu.";
      messageElement.style.color = "red";
      return;
    }

    const fullName = fullNameInput.value;
    const idNumber = idNumberInput.value;
    const role = roleInput.value;
    let arrivalTime = "";
    let departureTime = "";

    if (scheduleTypeSelect.value === "default") {
      arrivalTime = defaultArrivalTimeInput.value;
      departureTime = defaultDepartureTimeInput.value;
    } else {
      arrivalTime = customArrivalTimeInput.value;
      departureTime = customDepartureTimeInput.value;
    }

    const newFace = {
      id: Date.now().toString(), // ID unik
      fullName: fullName,
      idNumber: idNumber,
      role: role, // Use role
      photo: capturedImageBase64,
      signature: capturedFaceSignature,
      embedding: capturedFaceEmbedding ? capturedFaceEmbedding.embedding : null,
      arrivalTime: arrivalTime,
      departureTime: departureTime,
    };

    let registeredFaces =
      JSON.parse(localStorage.getItem("registeredFaces")) || [];
    registeredFaces.push(newFace);
    localStorage.setItem("registeredFaces", JSON.stringify(registeredFaces));

    messageElement.textContent = `Wajah ${fullName} berhasil didaftarkan!`;
    messageElement.style.color = "green";

    // Reset form dan kamera
    faceRegistrationForm.reset();
    photo.style.display = "none";
    video.style.display = "block";
    captureButton.textContent = "Ambil Foto";
    capturedImageBase64 = null;
    capturedFaceSignature = null;
    capturedFaceEmbedding = null;
    scheduleTypeSelect.value = "default"; // Reset to default
    defaultScheduleFields.classList.remove("hidden");
    customScheduleFields.classList.add("hidden");
    defaultArrivalTimeInput.value = "08:00"; // Reset to default times
    defaultDepartureTimeInput.value = "17:00";
    customArrivalTimeInput.value = "";
    customDepartureTimeInput.value = "";
    startCamera();
  });

  // Schedule type toggle logic
  if (scheduleTypeSelect && defaultScheduleFields && customScheduleFields) {
    scheduleTypeSelect.addEventListener("change", () => {
      if (scheduleTypeSelect.value === "custom") {
        defaultScheduleFields.classList.add("hidden");
        customScheduleFields.classList.remove("hidden");
      } else {
        defaultScheduleFields.classList.remove("hidden");
        customScheduleFields.classList.add("hidden");
      }
    });
  }

  startCamera();
});
