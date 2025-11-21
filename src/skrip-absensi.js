document.addEventListener("DOMContentLoaded", async () => {
  // === Elemen DOM ===
  const video = document.getElementById("attendanceVideo");
  const canvas = document.getElementById("attendanceCanvas");
  const statusMessage = document.getElementById("statusMessage");
  const detectedName = document.getElementById("detectedName");
  const detectedId = document.getElementById("detectedId");
  const detectedTime = document.getElementById("detectedTime");
  const detectedDate = document.getElementById("detectedDate");
  const detectedKeterangan = document.getElementById("detectedKeterangan");
  const currentDateTime = document.getElementById("currentDateTime");
  const context = canvas.getContext("2d");

  // === Konfigurasi ===
  const SIMILARITY_THRESHOLD = 70;
  const SCAN_INTERVAL = 1000;

  // === Data LocalStorage ===
  let registeredFaces =
    JSON.parse(localStorage.getItem("registeredFaces")) || [];
  let attendanceRecords =
    JSON.parse(localStorage.getItem("attendanceRecords")) || [];

  // === VARIABEL KONTROL SCAN DAN DELAY ===
  let resetTimer = null;
  let scanIntervalId = null;
  let isScanningActive = false;

  // Fungsi untuk mendapatkan hari, tanggal, bulan, tahun, dan waktu lengkap (Tidak diubah)
  function getCurrentDateTimeString() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    };
    return now.toLocaleDateString("id-ID", options);
  }

  // Fungsi untuk memperbarui waktu dan tanggal saat ini (Tidak diubah)
  function updateCurrentDateTime() {
    if (currentDateTime) {
      currentDateTime.textContent = getCurrentDateTimeString();
    }
  }

  // Fungsi untuk mereset tampilan informasi absensi (PENTING: Semua menjadi '-')
  function resetDetectedInfo() {
    detectedName.textContent = "-";
    detectedId.textContent = "-";
    detectedTime.textContent = "-";
    if (detectedDate) detectedDate.textContent = "-";
    if (detectedKeterangan) detectedKeterangan.textContent = "-";
  }

  // Fungsi logik perhitungan status absensi (Tidak diubah)
  function calculateAttendanceStatus(registeredFace, now) {
    let attendanceStatus = "Hadir";
    let displayStatus = "Hadir";

    const defaultArrivalTime = "08:00";
    const defaultDepartureTime = "16:00";

    const arrivalTimeStr = registeredFace?.arrivalTime || defaultArrivalTime;
    const departureTimeStr =
      registeredFace?.departureTime || defaultDepartureTime;

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const [arrivalHour, arrivalMinute] = arrivalTimeStr.split(":").map(Number);
    const [departureHour, departureMinute] = departureTimeStr
      .split(":")
      .map(Number);

    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const arrivalTimeInMinutes = arrivalHour * 60 + arrivalMinute;
    const departureTimeInMinutes = departureHour * 60 + departureMinute;

    if (currentTimeInMinutes <= arrivalTimeInMinutes) {
      attendanceStatus = "Hadir";
      displayStatus = "Hadir";
    } else if (
      currentTimeInMinutes > arrivalTimeInMinutes &&
      currentTimeInMinutes < departureTimeInMinutes
    ) {
      attendanceStatus = "Terlambat";
      displayStatus = "Terlambat";
    } else if (currentTimeInMinutes >= departureTimeInMinutes) {
      attendanceStatus = "Pulang";
      displayStatus = "Pulang";
    }

    return { attendanceStatus, displayStatus };
  }

  // Fungsi untuk MENGHENTIKAN scan (Tidak diubah)
  function stopScan() {
    if (scanIntervalId) {
      clearInterval(scanIntervalId);
      scanIntervalId = null;
      isScanningActive = false;
    }
  }

  // Fungsi untuk MEMULAI scan (Tidak diubah)
  function startScanLoop() {
    if (!isScanningActive) {
      scanIntervalId = setInterval(scanFace, SCAN_INTERVAL);
      isScanningActive = true;
    }
  }

  // Akses kamera dengan error handling yang lebih baik (Tidak diubah)
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      video.srcObject = stream;
      video.play();

      video.addEventListener("loadeddata", () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        setTimeout(() => {
          startScanLoop(); // Mulai loop scan setelah 1 detik
        }, 1000);
      });

      video.addEventListener("error", (err) => {
        console.error("Video error:", err);
        statusMessage.textContent =
          "Kesalahan kamera. Pastikan kamera tidak digunakan aplikasi lain.";
        statusMessage.style.color = "red";
      });
    } catch (err) {
      console.error("Error accessing camera: ", err);
      statusMessage.style.color = "red";
      statusMessage.textContent =
        "Gagal mengakses kamera. Periksa izin atau hardware.";
    }
  }

  // Fallback function for older entries that don't have embeddings (tidak diubah)
  function compareSignaturesWithFallback(sourceCanvas, signature) {
    const FACE_SIZE = 40;
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");
    tempCanvas.width = FACE_SIZE;
    tempCanvas.height = FACE_SIZE;
    tempContext.drawImage(sourceCanvas, 0, 0, FACE_SIZE, FACE_SIZE);
    const imageData = tempContext.getImageData(0, 0, FACE_SIZE, FACE_SIZE);
    const data = imageData.data;
    const currentSignature = [];
    for (let i = 0; i < data.length; i += 4) {
      const grayscale = (data[i] + data[i + 1] + data[i + 2]) / 3;
      currentSignature.push(Math.round(grayscale));
    }
    let matchingPixels = 0;
    const totalPixels = currentSignature.length;
    if (signature.length !== totalPixels) {
      return 0;
    }
    for (let i = 0; i < totalPixels; i++) {
      if (Math.abs(currentSignature[i] - signature[i]) < 30) {
        matchingPixels++;
      }
    }
    return (matchingPixels / totalPixels) * 100;
  }

  // Fungsi untuk melakukan scan wajah
  async function scanFace() {
    if (!video.srcObject || resetTimer) return;

    if (registeredFaces.length === 0) {
      if (statusMessage.textContent !== "Wajah Belum Terdaftar") {
        statusMessage.textContent = "Wajah Belum Terdaftar";
        statusMessage.style.color = "orange";
      }
      resetDetectedInfo();
      return;
    }

    try {
      if (!video.readyState || video.readyState < 2) {
        if (statusMessage.textContent !== "Menunggu kamera siap...") {
          statusMessage.textContent = "Menunggu kamera siap...";
          statusMessage.style.color = "black";
        }
        resetDetectedInfo();
        return;
      }

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      let bestMatch = null;
      let highestScore = 0;

      for (const face of registeredFaces) {
        if (face.signature) {
          const score = compareSignaturesWithFallback(canvas, face.signature);
          if (score > highestScore) {
            highestScore = score;
            bestMatch = face;
          }
        }
      }

      if (bestMatch && highestScore >= SIMILARITY_THRESHOLD) {
        stopScan();

        const now = new Date();
        const todayISO = now.toISOString().slice(0, 10);
        const hasAttendedToday = attendanceRecords.some(
          (record) =>
            record.idNumber === bestMatch.idNumber && record.date === todayISO
        );

        const attendanceTime = now.toLocaleTimeString("id-ID", {
          hour12: false,
        });
        const attendanceDateDisplay = now.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const { attendanceStatus, displayStatus } = calculateAttendanceStatus(
          bestMatch,
          now
        );

        if (hasAttendedToday) {
          // KASUS 1: Sudah absen
          statusMessage.textContent = `Anda sudah absen hari ini, ${bestMatch.fullName}.`;
          statusMessage.style.color = "orange";

          const latestRecord = attendanceRecords.find(
            (record) =>
              record.idNumber === bestMatch.idNumber && record.date === todayISO
          ) || { time: "0", status: "Sudah Absen" };

          detectedName.textContent = bestMatch.fullName;
          // *** PERBAIKAN DI SINI: Menggunakan idNumber ***
          detectedId.textContent = bestMatch.idNumber;
          detectedTime.textContent = latestRecord.time;
          detectedKeterangan.textContent = latestRecord.status;
          if (detectedDate) detectedDate.textContent = attendanceDateDisplay;
        } else {
          // KASUS 2: Absensi Berhasil
          const newRecord = {
            id: Date.now().toString(),
            fullName: bestMatch.fullName,
            idNumber: bestMatch.idNumber,
            time: attendanceTime,
            date: todayISO,
            status: attendanceStatus,
          };

          attendanceRecords.push(newRecord);
          localStorage.setItem(
            "attendanceRecords",
            JSON.stringify(attendanceRecords)
          );

          statusMessage.textContent = `Absensi berhasil untuk ${bestMatch.fullName} (${displayStatus})!`;
          statusMessage.style.color = "green";

          detectedName.textContent = bestMatch.fullName;
          detectedId.textContent = bestMatch.idNumber;
          detectedTime.textContent = attendanceTime;
          detectedKeterangan.textContent = displayStatus;
          if (detectedDate) detectedDate.textContent = attendanceDateDisplay;

          updateDashboardSummary();
        }

        // SET DELAY 5 DETIK UNTUK SEMUA KONDISI BERHASIL
        resetTimer = setTimeout(() => {
          resetDetectedInfo();
          statusMessage.textContent = "Menunggu deteksi wajah...";
          statusMessage.style.color = "black";
          resetTimer = null;
          startScanLoop();
        }, 5000);
      } else {
        // Tidak ada kecocokan yang melewati ambang batas
        if (!resetTimer) {
          if (statusMessage.textContent !== "Menunggu deteksi wajah...") {
            statusMessage.textContent = "Menunggu deteksi wajah...";
            statusMessage.style.color = "black";
          }
          resetDetectedInfo();
        }
      }
    } catch (error) {
      console.error("Error during face scan:", error);
      if (
        statusMessage.textContent !==
        "Kesalahan saat memproses wajah. Coba lagi."
      ) {
        statusMessage.textContent =
          "Kesalahan saat memproses wajah. Coba lagi.";
        statusMessage.style.color = "red";
      }
    }
  }

  // Fungsi untuk memperbarui ringkasan dashboard (Tidak diubah)
  function updateDashboardSummary() {
    const totalUsersElement = document.getElementById("totalUsers");
    const todayAttendanceElement = document.getElementById("todayAttendance");
    if (totalUsersElement && todayAttendanceElement) {
      const registeredFacesCount =
        JSON.parse(localStorage.getItem("registeredFaces")) || [];
      const attendanceRecordsCount =
        JSON.parse(localStorage.getItem("attendanceRecords")) || [];

      totalUsersElement.textContent = registeredFacesCount.length;

      const today = new Date().toISOString().slice(0, 10);
      const uniqueAttendanceToday = [
        ...new Set(
          attendanceRecordsCount
            .filter(
              (record) =>
                record.date === today &&
                (record.status === "Hadir" || record.status === "Terlambat")
            )
            .map((record) => record.idNumber)
        ),
      ];

      todayAttendanceElement.textContent = uniqueAttendanceToday.length;
    }
  }

  // FUNGSI INI DIUBAH: Panggil resetDetectedInfo() agar layar bersih saat dimuat
  function initializeDisplayData() {
    updateDashboardSummary();
    // KUNCI: Reset tampilan info di awal agar bersih
    resetDetectedInfo();
    statusMessage.textContent = "Menunggu kamera siap...";
    statusMessage.style.color = "black";
  }

  // === Inisialisasi dan Loop ===
  startCamera();
  initializeDisplayData();

  setInterval(updateCurrentDateTime, 1000);
  updateCurrentDateTime();

  // Fungsi untuk absen manual berdasarkan ID/NIS
  document
    .getElementById("manualAbsenButton")
    .addEventListener("click", function () {
      const manualId = document.getElementById("manualIdInput").value.trim();
      if (!manualId) {
        statusMessage.textContent = "Silakan masukkan ID/NIS terlebih dahulu";
        statusMessage.style.color = "red";
        return;
      }

      const registeredFace = registeredFaces.find(
        (face) => face.idNumber === manualId
      );
      if (!registeredFace) {
        statusMessage.textContent = "ID/NIS tidak ditemukan";
        statusMessage.style.color = "red";
        return;
      }

      const now = new Date();
      const todayISO = now.toISOString().slice(0, 10);
      const hasAttendedToday = attendanceRecords.some(
        (record) =>
          record.idNumber === registeredFace.idNumber &&
          record.date === todayISO
      );

      if (hasAttendedToday) {
        statusMessage.textContent = `Anda sudah absen hari ini, ${registeredFace.fullName}.`;
        statusMessage.style.color = "orange";
        // Tampilkan data absensi terakhir jika sudah absen (sesuai permintaan)
        const latestRecord = attendanceRecords.find(
          (record) =>
            record.idNumber === registeredFace.idNumber &&
            record.date === todayISO
        ) || { time: "0", status: "Sudah Absen" };

        detectedName.textContent = registeredFace.fullName;
        detectedId.textContent = registeredFace.idNumber;
        detectedTime.textContent = latestRecord.time;
        detectedKeterangan.textContent = latestRecord.status;
        if (detectedDate)
          detectedDate.textContent = now.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });

        // Set delay 5 detik agar data tetap muncul
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          resetDetectedInfo();
          statusMessage.textContent = "Menunggu deteksi wajah...";
          statusMessage.style.color = "black";
          resetTimer = null;
          startScanLoop();
        }, 5000);

        return;
      }

      const { attendanceStatus, displayStatus } = calculateAttendanceStatus(
        registeredFace,
        now
      );
      const attendanceTime = now.toLocaleTimeString("id-ID", { hour12: false });
      const attendanceDateDisplay = now.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const newRecord = {
        id: Date.now().toString(),
        fullName: registeredFace.fullName,
        idNumber: registeredFace.idNumber,
        time: attendanceTime,
        date: todayISO,
        status: attendanceStatus,
      };

      attendanceRecords.push(newRecord);
      localStorage.setItem(
        "attendanceRecords",
        JSON.stringify(attendanceRecords)
      );

      statusMessage.textContent = `Absensi berhasil untuk ${registeredFace.fullName} (${displayStatus})!`;
      statusMessage.style.color = "green";

      stopScan();

      if (resetTimer) clearTimeout(resetTimer);

      // *** PENGISIAN DATA SETELAH ABSEN MANUAL BERHASIL (sudah benar) ***
      detectedName.textContent = registeredFace.fullName;
      detectedId.textContent = registeredFace.idNumber;
      detectedTime.textContent = attendanceTime;
      detectedKeterangan.textContent = displayStatus;
      if (detectedDate) detectedDate.textContent = attendanceDateDisplay;
      // *** AKHIR PENGISIAN DATA ***

      resetTimer = setTimeout(() => {
        resetDetectedInfo();
        statusMessage.textContent = "Menunggu deteksi wajah...";
        statusMessage.style.color = "black";
        resetTimer = null;
        startScanLoop();
      }, 5000);

      updateDashboardSummary();
      document.getElementById("manualIdInput").value = "";
    });

  // Event listener untuk toggle manual absen (Tidak diubah)
  document
    .getElementById("toggleManualAbsen")
    .addEventListener("click", function () {
      const manualSection = document.getElementById("manualAbsenSection");
      if (manualSection) {
        if (
          manualSection.style.display === "none" ||
          manualSection.style.display === ""
        ) {
          manualSection.style.display = "block";
          this.textContent = "Sembunyikan Absen Manual";
        } else {
          manualSection.style.display = "none";
          this.textContent = "Aktifkan Absen Manual";
        }
      }
    });
});
