function generateSidebar(activePage, basePath = '') {
    const sidebarHtml = `
        <aside id="sidebar" class="sidebar w-64 sidebar-gradient text-white p-5 shadow-2xl flex flex-col">
            <h1 id="sidebarTitle" class="text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-extrabold text-2xl">Dashboard Admin</h1>
            <nav class="flex-grow">
                <ul class="space-y-2">
                    <li><a href="${basePath}dashboard.html" class="block px-4 py-2 rounded-md hover:bg-gray-700 hover:text-white transition ${activePage === 'dashboard' ? 'active-link bg-gray-700 text-white' : ''}">Dashboard</a></li>
                    <li><a href="${basePath}pages/daftar-wajah.html" class="block px-4 py-2 rounded-md hover:bg-gray-700 hover:text-white transition ${activePage === 'daftar-wajah' ? 'active-link bg-gray-700 text-white' : ''}">Daftar Wajah</a></li>
                    <li><a href="${basePath}pages/registrasi.html" class="block px-4 py-2 rounded-md hover:bg-gray-700 hover:text-white transition ${activePage === 'registrasi' ? 'active-link bg-gray-700 text-white' : ''}">Registrasi Wajah</a></li>
                </ul>
            </nav>
            <div class="mt-8 pt-4 border-t border-gray-700">
                <button id="sidebarExportButton" class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 font-medium rounded-lg transition duration-200 flex items-center justify-center text-sm">
                    💾 Export Semua Data
                </button>
            </div>
        </aside>
    `;
    return sidebarHtml;
}

document.addEventListener('DOMContentLoaded', () => {
    // Setup export button functionality
    document.body.addEventListener('click', (event) => {
        if (event.target && event.target.id === 'sidebarExportButton') {
            const registeredFaces = JSON.parse(localStorage.getItem('registeredFaces')) || [];
            const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
            
            const dataToExport = {
                registeredFaces: registeredFaces,
                attendanceRecords: attendanceRecords
            };
            const dataStr = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([dataStr], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `facelite_data_export_${new Date().toISOString().slice(0, 10)}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('Data berhasil diexport sebagai TXT!');
        }
    });

    // Sidebar toggle functionality for mobile
    document.body.addEventListener('click', (event) => {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggleButton = document.getElementById('sidebarToggleButton');

        if (sidebar && sidebarToggleButton) {
            const isClickInsideSidebar = sidebar.contains(event.target);
            const isClickOnToggleButton = sidebarToggleButton.contains(event.target);

            if (isClickOnToggleButton) {
                sidebar.classList.toggle('open');
            } else if (!isClickInsideSidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }
    });
});