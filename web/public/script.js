        // ==================== ESTADO GLOBAL ====================
        let currentUser = null;
        let isClocked = false;
        let isPaused = false;
        let clockStartTime = null;
        let pauseStartTime = null;
        let totalPauseTime = 0;
        let workTimerInterval = null;
        let projectTimerInterval = null;
        let projectTimerRunning = false;
        let projectTimerSeconds = 0;
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();

        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcons();

        const users = {
            admin: {
                id: 1,
                name: 'Adrián Martínez',
                initials: 'AM',
                email: 'adrian.martinez@empresa.com',
                role: 'admin',
                roleLabel: 'Administrador'
            },
            manager: {
                id: 2,
                name: 'Adrián Terán',
                initials: 'AT',
                email: 'adrian.teran@empresa.com',
                role: 'manager',
                roleLabel: 'Responsable'
            },
            employee: {
                id: 3,
                name: 'Pablo Acero',
                initials: 'PA',
                email: 'pablo.acero@empresa.com',
                role: 'employee',
                roleLabel: 'Empleado'
            }
        };

        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcons();
            
            showToast(
                newTheme === 'dark' ? 'Tema oscuro activado' : 'Tema claro activado',
                'info'
            );
        }

        function updateThemeIcons() {
            const theme = document.documentElement.getAttribute('data-theme');
            const iconClass = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
            
            const loginIcon = document.getElementById('themeIconLogin');
            const appIcon = document.getElementById('themeIconApp');
            
            if (loginIcon) {
                loginIcon.className = iconClass;
            }
            if (appIcon) {
                appIcon.className = iconClass;
            }
        }

        // ==================== RELOJ ====================
        function updateClock() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            
            const clockTimeEl = document.getElementById('clockTime');
            if (clockTimeEl) {
                clockTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
            }
            
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            
            const clockDateEl = document.getElementById('clockDate');
            if (clockDateEl) {
                clockDateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} ${now.getFullYear()}`;
            }
        }

        setInterval(updateClock, 1000);
        updateClock();

        // ==================== AUTENTICACIÓN ====================
        function loginAs(userType) {
            currentUser = users[userType];
            
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('appContainer').classList.add('active');
            
            // Actualizar UI con datos del usuario
            document.getElementById('userAvatarSidebar').textContent = currentUser.initials;
            document.getElementById('userNameSidebar').textContent = currentUser.name;
            document.getElementById('userRoleSidebar').textContent = currentUser.roleLabel;
            
            document.getElementById('profileAvatar').textContent = currentUser.initials;
            document.getElementById('profileName').textContent = currentUser.name;
            document.getElementById('profileEmail').textContent = currentUser.email;
            document.getElementById('profileRole').textContent = currentUser.roleLabel;
            
            // Mostrar/ocultar secciones de admin
            const adminSection = document.getElementById('adminSection');
            const adminOnlyElements = document.querySelectorAll('.admin-only');
            
            if (currentUser.role === 'admin' || currentUser.role === 'manager') {
                adminSection.style.display = 'block';
                adminOnlyElements.forEach(el => el.style.display = '');
            } else {
                adminSection.style.display = 'none';
                adminOnlyElements.forEach(el => el.style.display = 'none');
            }
            
            showToast(`Bienvenido/a, ${currentUser.name}`, 'success');
            showPage('dashboard');
        }

        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            loginAs('employee');
        });

        function logout() {
            currentUser = null;
            isClocked = false;
            isPaused = false;
            
            document.getElementById('appContainer').classList.remove('active');
            document.getElementById('loginScreen').style.display = 'flex';
            
            showToast('Sesión cerrada correctamente', 'info');
        }

        // ==================== NAVEGACIÓN ====================
        function showPage(pageId) {
            // Ocultar todas las páginas
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.add('hidden');
            });
            
            // Mostrar la página seleccionada
            const targetPage = document.getElementById(`page-${pageId}`);
            if (targetPage) {
                targetPage.classList.remove('hidden');
            }
            
            // Actualizar navegación activa
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            event.currentTarget?.classList.add('active');
            
            // Actualizar título
            const titles = {
                dashboard: 'Dashboard',
                fichaje: 'Control de Fichaje',
                timesheet: 'Timesheet',
                proyectos: 'Proyectos',
                ausencias: 'Ausencias',
                calendario: 'Calendario',
                usuarios: 'Gestión de Usuarios',
                aprobaciones: 'Aprobaciones',
                informes: 'Informes',
                auditoria: 'Auditoría',
                perfil: 'Mi Perfil',
                configuracion: 'Configuración'
            };
            
            document.getElementById('pageTitle').textContent = titles[pageId] || 'Dashboard';
            
            // Generar calendario si es necesario
            if (pageId === 'calendario') {
                generateCalendar();
            }
        }

        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('active');
        }

        // ==================== FICHAJE ====================
        function clockIn() {
            if (isClocked) return;
            
            isClocked = true;
            clockStartTime = new Date();
            totalPauseTime = 0;
            
            const timeStr = clockStartTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            
            document.getElementById('todayEntry').textContent = timeStr;
            document.getElementById('clockStatusDot').classList.remove('inactive');
            document.getElementById('clockStatusText').textContent = 'Trabajando';
            
            document.getElementById('btnClockIn').disabled = true;
            document.getElementById('btnClockIn2').disabled = true;
            document.getElementById('btnClockOut').disabled = false;
            document.getElementById('btnClockOut2').disabled = false;
            document.getElementById('btnPause').disabled = false;
            document.getElementById('btnPause2').disabled = false;
            
            // Iniciar timer de trabajo
            workTimerInterval = setInterval(updateWorkTimer, 1000);
            
            showToast('Entrada registrada correctamente', 'success');
            addActivity('Entrada registrada', 'Inicio de jornada', 'clock');
        }

        function clockOut() {
            if (!isClocked) return;
            
            const now = new Date();
            const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            
            document.getElementById('todayExit').textContent = timeStr;
            document.getElementById('clockStatusDot').classList.add('inactive');
            document.getElementById('clockStatusText').textContent = 'Jornada finalizada';
            
            document.getElementById('btnClockIn').disabled = true;
            document.getElementById('btnClockIn2').disabled = true;
            document.getElementById('btnClockOut').disabled = true;
            document.getElementById('btnClockOut2').disabled = true;
            document.getElementById('btnPause').disabled = true;
            document.getElementById('btnPause2').disabled = true;
            
            clearInterval(workTimerInterval);
            
            isClocked = false;
            isPaused = false;
            
            showToast('Salida registrada correctamente', 'success');
            addActivity('Salida registrada', 'Fin de jornada', 'clock');
        }

        function togglePause() {
            if (!isClocked) return;
            
            if (!isPaused) {
                isPaused = true;
                pauseStartTime = new Date();
                
                document.getElementById('btnPause').innerHTML = '<i class="ri-play-line"></i> Reanudar';
                document.getElementById('btnPause2').innerHTML = '<i class="ri-play-line"></i> Reanudar';
                document.getElementById('clockStatusText').textContent = 'En pausa';
                document.getElementById('clockStatusDot').classList.add('inactive');
                
                showToast('Pausa iniciada', 'info');
            } else {
                isPaused = false;
                const pauseDuration = new Date() - pauseStartTime;
                totalPauseTime += pauseDuration;
                
                const pauseMinutes = Math.floor(totalPauseTime / 60000);
                document.getElementById('todayPause').textContent = `${String(Math.floor(pauseMinutes / 60)).padStart(2, '0')}:${String(pauseMinutes % 60).padStart(2, '0')}`;
                
                document.getElementById('btnPause').innerHTML = '<i class="ri-pause-line"></i> Pausa';
                document.getElementById('btnPause2').innerHTML = '<i class="ri-pause-line"></i> Pausa';
                document.getElementById('clockStatusText').textContent = 'Trabajando';
                document.getElementById('clockStatusDot').classList.remove('inactive');
                
                showToast('Pausa finalizada', 'info');
            }
        }

        function updateWorkTimer() {
            if (!clockStartTime || isPaused) return;
            
            const now = new Date();
            let elapsed = now - clockStartTime - totalPauseTime;
            if (isPaused) {
                elapsed -= (now - pauseStartTime);
            }
            
            const hours = Math.floor(elapsed / 3600000);
            const minutes = Math.floor((elapsed % 3600000) / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            document.getElementById('workTimer').textContent = timeStr;
        }

        // ==================== TIMER DE PROYECTO ====================
        function startProjectTimer() {
            const projectSelect = document.getElementById('timerProjectSelect');
            if (!projectSelect.value) {
                showToast('Selecciona un proyecto primero', 'warning');
                return;
            }
            
            projectTimerRunning = true;
            document.getElementById('btnStartTimer').disabled = true;
            document.getElementById('btnStopTimer').disabled = false;
            projectSelect.disabled = true;
            
            projectTimerInterval = setInterval(() => {
                projectTimerSeconds++;
                const hours = Math.floor(projectTimerSeconds / 3600);
                const minutes = Math.floor((projectTimerSeconds % 3600) / 60);
                const seconds = projectTimerSeconds % 60;
                document.getElementById('projectTimer').textContent = 
                    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }, 1000);
            
            showToast('Timer iniciado', 'success');
        }

        function stopProjectTimer() {
            clearInterval(projectTimerInterval);
            projectTimerRunning = false;
            
            const hours = (projectTimerSeconds / 3600).toFixed(2);
            const projectSelect = document.getElementById('timerProjectSelect');
            const projectName = projectSelect.options[projectSelect.selectedIndex].text;
            
            document.getElementById('btnStartTimer').disabled = false;
            document.getElementById('btnStopTimer').disabled = true;
            projectSelect.disabled = false;
            
            projectTimerSeconds = 0;
            document.getElementById('projectTimer').textContent = '00:00:00';
            
            showToast(`${hours}h imputadas a ${projectName}`, 'success');
            addActivity(`${hours}h imputadas`, `Proyecto: ${projectName}`, 'project');
        }

        // ==================== CALENDARIO ====================
        function generateCalendar() {
            const grid = document.getElementById('calendarGrid');
            grid.innerHTML = '';
            
            const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            dayNames.forEach(day => {
                const cell = document.createElement('div');
                cell.className = 'calendar-day-name';
                cell.textContent = day;
                grid.appendChild(cell);
            });
            
            const firstDay = new Date(currentYear, currentMonth, 1);
            const lastDay = new Date(currentYear, currentMonth + 1, 0);
            
            let startDay = firstDay.getDay() - 1;
            if (startDay === -1) startDay = 6;
            
            // Días del mes anterior
            const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
            for (let i = startDay - 1; i >= 0; i--) {
                const cell = document.createElement('div');
                cell.className = 'calendar-day other-month';
                cell.innerHTML = `<div class="calendar-day-number">${prevMonthLastDay - i}</div>`;
                grid.appendChild(cell);
            }
            
            // Días del mes actual
            const today = new Date();
            const events = {
                20: { type: 'vacation', label: 'Carlos - Perm' },
                18: { type: 'sick', label: 'María - Perm' },
                25: { type: 'holiday', label: 'Navidad' },
                26: { type: 'holiday', label: 'Festivo' }
            };
            
            for (let day = 1; day <= lastDay.getDate(); day++) {
                const cell = document.createElement('div');
                cell.className = 'calendar-day';
                
                if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                    cell.classList.add('today');
                }
                
                let eventHtml = '';
                if (events[day]) {
                    eventHtml = `<div class="calendar-event ${events[day].type}">${events[day].label}</div>`;
                }
                
                cell.innerHTML = `<div class="calendar-day-number">${day}</div>${eventHtml}`;
                cell.onclick = () => {
                    showToast(`Día ${day} seleccionado`, 'info');
                };
                grid.appendChild(cell);
            }
            
            // Días del mes siguiente
            const totalCells = grid.children.length;
            const remainingCells = 42 - totalCells + 7; // +7 por los nombres de días
            for (let i = 1; i <= remainingCells && grid.children.length < 49; i++) {
                const cell = document.createElement('div');
                cell.className = 'calendar-day other-month';
                cell.innerHTML = `<div class="calendar-day-number">${i}</div>`;
                grid.appendChild(cell);
            }
            
            const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
            document.getElementById('calendarMonth').textContent = `${months[currentMonth]} ${currentYear}`;
        }

        function changeMonth(delta) {
            currentMonth += delta;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            } else if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generateCalendar();
        }

        function goToToday() {
            currentMonth = new Date().getMonth();
            currentYear = new Date().getFullYear();
            generateCalendar();
        }

        // ==================== MODALES ====================
        function openModal(modalId) {
            document.getElementById(modalId).classList.add('active');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        // Cerrar modal al hacer clic fuera
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                }
            });
        });

        // ==================== NOTIFICACIONES ====================
        function toggleNotifications() {
            document.getElementById('notificationsPanel').classList.toggle('active');
        }

        // ==================== TOASTS ====================
        function showToast(message, type = 'info') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            
            const icons = {
                success: 'ri-checkbox-circle-line',
                error: 'ri-close-circle-line',
                warning: 'ri-alert-line',
                info: 'ri-information-line'
            };
            
            toast.innerHTML = `
                <div class="toast-icon">
                    <i class="${icons[type]}"></i>
                </div>
                <span class="toast-message">${message}</span>
            `;
            
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'fadeIn 0.3s ease-out reverse';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // ==================== ACCIONES ====================
        function addActivity(title, desc, type) {
            const list = document.getElementById('activityList');
            const now = new Date();
            const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            
            const iconClass = {
                clock: 'ri-login-box-line',
                project: 'ri-folder-add-line',
                absence: 'ri-calendar-event-line',
                success: 'ri-checkbox-circle-line'
            };
            
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="activity-icon ${type}">
                    <i class="${iconClass[type]}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${title}</div>
                    <div class="activity-desc">${desc}</div>
                </div>
                <div class="activity-time">${timeStr}</div>
            `;
            
            list.insertBefore(item, list.firstChild);
            
            // Limitar a 5 actividades
            while (list.children.length > 5) {
                list.removeChild(list.lastChild);
            }
        }

        function submitAbsence() {
            const type = document.getElementById('absenceType').value;
            const start = document.getElementById('absenceStart').value;
            const end = document.getElementById('absenceEnd').value;
            
            if (!start || !end) {
                showToast('Por favor, selecciona las fechas', 'warning');
                return;
            }
            
            closeModal('newAbsenceModal');
            showToast('Solicitud de ausencia enviada', 'success');
            addActivity('Solicitud de ausencia', `${start} - ${end}`, 'absence');
        }

        function submitCorrection() {
            const date = document.getElementById('correctionDate').value;
            const time = document.getElementById('correctionTime').value;
            
            if (!date || !time) {
                showToast('Por favor, completa todos los campos', 'warning');
                return;
            }
            
            closeModal('correctionModal');
            showToast('Solicitud de corrección enviada', 'success');
        }

        function addTimeEntry() {
            const hours = document.getElementById('addTimeHours').value;
            const project = document.getElementById('addTimeProject');
            const projectName = project.options[project.selectedIndex].text;
            
            closeModal('addTimeModal');
            showToast(`${hours}h añadidas a ${projectName}`, 'success');
            addActivity(`${hours}h imputadas`, `Proyecto: ${projectName}`, 'project');
        }

        function createProject() {
            const name = document.getElementById('projectName').value;
            
            if (!name) {
                showToast('El nombre del proyecto es obligatorio', 'warning');
                return;
            }
            
            closeModal('newProjectModal');
            showToast(`Proyecto "${name}" creado correctamente`, 'success');
        }

        function createUser() {
            const name = document.getElementById('newUserName').value;
            const email = document.getElementById('newUserEmail').value;
            
            if (!name || !email) {
                showToast('Nombre y email son obligatorios', 'warning');
                return;
            }
            
            closeModal('newUserModal');
            showToast(`Usuario ${name} creado. Se ha enviado invitación.`, 'success');
        }

        function approveRequest(id) {
            showToast('Solicitud aprobada correctamente', 'success');
            // En una app real, actualizaríamos la tabla
        }

        function rejectRequest(id) {
            showToast('Solicitud rechazada', 'warning');
        }

        function cancelAbsence(id) {
            showToast('Solicitud cancelada', 'info');
        }

        function submitTimesheet() {
            showToast('Parte semanal enviado para aprobación', 'success');
        }

        function changeWeek(delta) {
            showToast('Semana cambiada', 'info');
        }

        function exportData(type) {
            showToast(`Exportando ${type}...`, 'info');
            setTimeout(() => {
                showToast('Archivo descargado correctamente', 'success');
            }, 1500);
        }

        function saveProfile() {
            showToast('Perfil actualizado correctamente', 'success');
        }

        function changePassword() {
            showToast('Contraseña actualizada correctamente', 'success');
        }

        function saveConfig() {
            showToast('Configuración guardada', 'success');
        }

        function filterProjects(filter) {
            document.querySelectorAll('#page-proyectos .tab').forEach(tab => tab.classList.remove('active'));
            event.currentTarget.classList.add('active');
            showToast(`Filtrando proyectos: ${filter}`, 'info');
        }

        function filterAbsences(filter) {
            document.querySelectorAll('#page-ausencias .tab').forEach(tab => tab.classList.remove('active'));
            event.currentTarget.classList.add('active');
            showToast(`Filtrando ausencias: ${filter}`, 'info');
        }

        function filterApprovals(filter) {
            document.querySelectorAll('#page-aprobaciones .tab').forEach(tab => tab.classList.remove('active'));
            event.currentTarget.classList.add('active');
            showToast(`Filtrando aprobaciones: ${filter}`, 'info');
        }

        // ==================== RESPONSIVE ====================
        function checkResponsive() {
            const menuBtn = document.getElementById('menuBtn');
            if (window.innerWidth <= 768) {
                menuBtn.style.display = 'flex';
            } else {
                menuBtn.style.display = 'none';
                document.getElementById('sidebar').classList.remove('active');
            }
        }

        window.addEventListener('resize', checkResponsive);
        checkResponsive();

        // ==================== INICIALIZACIÓN ====================
        // Establecer fechas por defecto en los formularios
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('absenceStart').value = today;
        document.getElementById('absenceEnd').value = today;
        document.getElementById('correctionDate').value = today;
        document.getElementById('addTimeDate').value = today;