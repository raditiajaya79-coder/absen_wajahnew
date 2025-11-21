document.addEventListener("DOMContentLoaded", () => {
  const faceListContainer = document.getElementById("faceListContainer");
  const noFacesMessage = document.getElementById("noFacesMessage");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const exportJsonButton = document.getElementById("exportJsonButton");
  const clearAllFacesButton = document.getElementById("clearAllFacesButton");

  const editModal = document.getElementById("editModal");
  const editModalCloseButton = editModal.querySelector(".close-button");
  const editFaceForm = document.getElementById("editFaceForm");
  const editFaceIdInput = document.getElementById("editFaceId");
  const editFullNameInput = document.getElementById("editFullName");
  const editIdNumberInput = document.getElementById("editIdNumber");
  const editRoleInput = document.getElementById("editRole");
  const editCustomScheduleToggle = document.getElementById(
    "editCustomScheduleToggle"
  );
  const editCustomScheduleFields = document.getElementById(
    "editCustomScheduleFields"
  );
  const editArrivalTimeInput = document.getElementById("editArrivalTime");
  const editDepartureTimeInput = document.getElementById("editDepartureTime");

  const deleteConfirmModal = document.getElementById("deleteConfirmModal");
  const deleteConfirmModalCloseButton =
    deleteConfirmModal.querySelector(".close-button");
  const deleteFaceNameSpan = document.getElementById("deleteFaceName");
  const deleteFaceIdSpan = document.getElementById("deleteFaceId");
  const cancelDeleteButton = document.getElementById("cancelDeleteButton");
  const confirmDeleteButton = document.getElementById("confirmDeleteButton");

  let faceToDeleteId = null;

  let registeredFaces =
    JSON.parse(localStorage.getItem("registeredFaces")) || [];

  const deleteAllConfirmModal = document.getElementById(
    "deleteAllConfirmModal"
  );
  const deleteAllConfirmModalCloseButton =
    deleteAllConfirmModal.querySelector(".close-button");
  const cancelDeleteAllButton = document.getElementById(
    "cancelDeleteAllButton"
  );
  const confirmDeleteAllButton = document.getElementById(
    "confirmDeleteAllButton"
  );

  function renderFaces(facesToRender) {
    faceListContainer.innerHTML = ""; // Bersihkan container
    if (facesToRender.length === 0) {
      noFacesMessage.classList.remove("hidden");
      return;
    }
    noFacesMessage.classList.add("hidden");

    const attendanceRecords =
      JSON.parse(localStorage.getItem("attendanceRecords")) || [];
    const todayISO = new Date().toISOString().slice(0, 10);

    facesToRender.forEach((face) => {
      const faceCard = document.createElement("div");
      faceCard.className =
        "bg-gray-700 p-4 rounded-lg shadow-lg border border-gray-600 flex flex-col";

      let attendanceStatusText = "";
      const todayAttendance = attendanceRecords.find(
        (record) =>
          record.idNumber === face.idNumber && record.date === todayISO
      );

      if (todayAttendance) {
        attendanceStatusText = `<p class="text-sm text-green-400 mt-1">Status Hari Ini: ${todayAttendance.status} (${todayAttendance.time})</p>`;
      } else {
        attendanceStatusText = `<p class="text-sm text-red-400 mt-1">Status Hari Ini: Belum Absen</p>`;
      }

      faceCard.innerHTML = `
                <div class="flex items-center mb-3">
                    <img src="${face.photo}" alt="${
        face.fullName
      }" class="w-16 h-16 object-cover rounded-full mr-4 border-2 border-blue-500">
                    <div>
                        <h3 class="text-lg font-semibold text-white">${
                          face.fullName
                        }</h3>
                        <p class="text-gray-400 text-sm">ID: ${
                          face.idNumber
                        }</p>
                        <p class="text-gray-400 text-sm">Role: ${face.role}</p>
                    </div>
                </div>
               ${
                 face.arrivalTime &&
                 face.departureTime &&
                 (face.arrivalTime !== "08:00" ||
                   face.departureTime !== "17:00")
                   ? `
<div class="mt-2 text-sm text-gray-300">
    Jadwal khusus: Datang ${face.arrivalTime} | Pulang ${face.departureTime}
</div>
`
                   : `
<div class="mt-2 text-sm text-gray-300">
    Jadwal default: Datang 08:00 | Pulang 17:00
</div>
`
               }


                ${attendanceStatusText}
                <div class="flex justify-end gap-2 mt-4">
                    <button class="edit-button px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-md text-sm transition duration-200" data-id="${
                      face.id
                    }">✏️ Edit</button>
                    <button class="delete-button px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md text-sm transition duration-200" data-id="${
                      face.id
                    }">🗑️ Hapus</button>
                </div>
            `;
      faceListContainer.appendChild(faceCard);
    });

    document.querySelectorAll(".edit-button").forEach((button) => {
      button.addEventListener("click", (event) =>
        openEditModal(event.target.dataset.id)
      );
    });
    document.querySelectorAll(".delete-button").forEach((button) => {
      button.addEventListener("click", (event) =>
        openDeleteConfirmModal(event.target.dataset.id)
      );
    });
  }

  function filterAndSortFaces() {
    let filteredFaces = [...registeredFaces];
    const searchTerm = searchInput.value.toLowerCase();

    if (searchTerm) {
      filteredFaces = filteredFaces.filter(
        (face) =>
          face.fullName.toLowerCase().includes(searchTerm) ||
          face.idNumber.toLowerCase().includes(searchTerm)
      );
    }

    const sortValue = sortSelect.value;
    if (sortValue === "nameAsc") {
      filteredFaces.sort((a, b) => a.fullName.localeCompare(b.fullName));
    } else if (sortValue === "nameDesc") {
      filteredFaces.sort((a, b) => b.fullName.localeCompare(a.fullName));
    } else if (sortValue === "idAsc") {
      filteredFaces.sort((a, b) => a.idNumber.localeCompare(b.idNumber));
    } else if (sortValue === "idDesc") {
      filteredFaces.sort((a, b) => b.idNumber.localeCompare(a.idNumber));
    }

    renderFaces(filteredFaces);
  }

  function openEditModal(id) {
    const faceToEdit = registeredFaces.find((face) => face.id === id);
    if (faceToEdit) {
      editFaceIdInput.value = faceToEdit.id;
      editFullNameInput.value = faceToEdit.fullName;
      editIdNumberInput.value = faceToEdit.idNumber;
      editRoleInput.value = faceToEdit.role;

      if (faceToEdit.arrivalTime && faceToEdit.departureTime) {
        editCustomScheduleToggle.checked = true;
        editCustomScheduleFields.classList.remove("hidden");
        editArrivalTimeInput.value = faceToEdit.arrivalTime;
        editDepartureTimeInput.value = faceToEdit.departureTime;
      } else {
        editCustomScheduleToggle.checked = false;
        editCustomScheduleFields.classList.add("hidden");
        editArrivalTimeInput.value = "";
        editDepartureTimeInput.value = "";
      }
      editModal.style.display = "block";
    }
  }

  editModalCloseButton.addEventListener("click", () => {
    editModal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === editModal) {
      editModal.style.display = "none";
    }
    if (event.target === deleteConfirmModal) {
      deleteConfirmModal.style.display = "none";
    }
    if (event.target === deleteAllConfirmModal) {
      deleteAllConfirmModal.style.display = "none";
    }
  });

  editCustomScheduleToggle.addEventListener("change", () => {
    if (editCustomScheduleToggle.checked) {
      editCustomScheduleFields.classList.remove("hidden");
    } else {
      editCustomScheduleFields.classList.add("hidden");
    }
  });

  editFaceForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const faceId = editFaceIdInput.value;
    const updatedFullName = editFullNameInput.value;
    const updatedIdNumber = editIdNumberInput.value;
    const updatedRole = editRoleInput.value;
    const updatedArrivalTime = editCustomScheduleToggle.checked
      ? editArrivalTimeInput.value
      : "";
    const updatedDepartureTime = editCustomScheduleToggle.checked
      ? editDepartureTimeInput.value
      : "";

    registeredFaces = registeredFaces.map((face) =>
      face.id === faceId
        ? {
            ...face,
            fullName: updatedFullName,
            idNumber: updatedIdNumber,
            role: updatedRole,
            arrivalTime: updatedArrivalTime,
            departureTime: updatedDepartureTime,
          }
        : face
    );
    localStorage.setItem("registeredFaces", JSON.stringify(registeredFaces));
    editModal.style.display = "none";
    filterAndSortFaces(); // Render ulang dengan data yang diperbarui
    alert("Data wajah berhasil diperbarui!");
  });

  function openDeleteConfirmModal(id) {
    const faceToDelete = registeredFaces.find((face) => face.id === id);
    if (faceToDelete) {
      faceToDeleteId = id;
      deleteFaceNameSpan.textContent = faceToDelete.fullName;
      deleteFaceIdSpan.textContent = faceToDelete.idNumber;
      deleteConfirmModal.style.display = "block";
    }
  }

  deleteConfirmModalCloseButton.addEventListener("click", () => {
    deleteConfirmModal.style.display = "none";
    faceToDeleteId = null;
  });

  cancelDeleteButton.addEventListener("click", () => {
    deleteConfirmModal.style.display = "none";
    faceToDeleteId = null;
  });

  confirmDeleteButton.addEventListener("click", () => {
    if (faceToDeleteId) {
      registeredFaces = registeredFaces.filter(
        (face) => face.id !== faceToDeleteId
      );
      localStorage.setItem("registeredFaces", JSON.stringify(registeredFaces));
      filterAndSortFaces();
      alert("Wajah berhasil dihapus!");
      deleteConfirmModal.style.display = "none";
      faceToDeleteId = null;
    }
  });

  exportJsonButton.addEventListener("click", () => {
    const dataStr = JSON.stringify(registeredFaces, null, 2);
    const blob = new Blob([dataStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facelite_registered_faces_export_${new Date()
      .toISOString()
      .slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert("Data wajah berhasil diexport sebagai TXT!");
  });

  clearAllFacesButton.addEventListener("click", () => {
    deleteAllConfirmModal.style.display = "block";
  });

  deleteAllConfirmModalCloseButton.addEventListener("click", () => {
    deleteAllConfirmModal.style.display = "none";
  });

  cancelDeleteAllButton.addEventListener("click", () => {
    deleteAllConfirmModal.style.display = "none";
  });

  confirmDeleteAllButton.addEventListener("click", () => {
    registeredFaces = [];
    localStorage.setItem("registeredFaces", JSON.stringify(registeredFaces));
    filterAndSortFaces();
    alert("Semua wajah terdaftar berhasil dihapus!");
    deleteAllConfirmModal.style.display = "none";
  });

  searchInput.addEventListener("input", filterAndSortFaces);
  sortSelect.addEventListener("change", filterAndSortFaces);

  // Initial render
  filterAndSortFaces();
});
