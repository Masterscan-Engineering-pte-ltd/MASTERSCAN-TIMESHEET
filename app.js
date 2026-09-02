const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyyAfDeE-dM6fRXXH3VkKti6Qux2aO-E4oYroaoyMgNiRNXEuJhg7PcobO7NfGhnohItw/exec';
        let currentWorker = '', currentMonth = '', currentYear = '', currentData = [], daysInMonth = 0, entryMode = 'month', isAdmin = false, masterWorkerList = {}, masterAdmins = [], currentDepartment = '', isLocked = false, selectedDayOnly = null;

        document.addEventListener('DOMContentLoaded', () => {
            setDefaultMonthYear();
            updateClock();
            setInterval(updateClock, 60000);
            rfcCCMt9jxJsDqTBXGeaCrr616tdvW3emh();

            // Set up exit modal handlers
            document.getElementById('btnExitSave').onclick = async () => {
                closeModal('exitConfirmModal');
                await submitTimesheet();
                exitTimesheet();
            };
            document.getElementById('btnExitNoSave').onclick = () => {
                closeModal('exitConfirmModal');
                exitTimesheet();
            };
        });

        function updateClock() { const now = new Date(); const clockEl = document.getElementById('currentDateTime'); if (clockEl) clockEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

        function setDefaultMonthYear() { const now = new Date(); const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']; document.getElementById('monthSelect').value = months[now.getMonth()]; document.getElementById('yearSelect').value = now.getFullYear(); document.getElementById('dateSelect').valueAsDate = now; }

        function setEntryMode(mode) {
            entryMode = mode;
            document.getElementById('btnModeDay').classList.toggle('active', mode === 'day');
            document.getElementById('btnModeMonth').classList.toggle('active', mode === 'month');
            document.getElementById('dateGroup').style.display = mode === 'day' ? 'flex' : 'none';
            document.getElementById('monthGroup').style.display = mode === 'month' ? 'flex' : 'none';
            document.getElementById('yearGroup').style.display = mode === 'month' ? 'flex' : 'none';
        }

        function getDaysInMonth(m, y) { return new Date(y, getMonthIndex(m) + 1, 0).getDate(); }
        function getDayName(d) { return ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][d.getDay()]; }
        function getMonthIndex(m) { return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(m); }
        function formatDate(d, m, y) { return `${String(d).padStart(2, '0')}/${String(getMonthIndex(m) + 1).padStart(2, '0')}/${y}`; }

        function showLoading(txt) { document.getElementById('loadingText').textContent = txt || 'Loading...'; document.getElementById('loadingOverlay').classList.remove('hidden'); }
        function hideLoading() { document.getElementById('loadingOverlay').classList.add('hidden'); }
        function showToast(msg, type = 'success') { const toast = document.getElementById('toast'), tMsg = document.getElementById('toastMessage'), tIco = document.getElementById('toastIcon'); tMsg.textContent = msg; toast.className = `toast ${type}`; tIco.textContent = type === 'success' ? '✓' : '✗'; setTimeout(() => toast.classList.add('show'), 10); setTimeout(() => toast.classList.remove('show'), 4000); }

        function showSection(id) {
            document.getElementById('homeSection').style.display = id === 'home' ? 'block' : 'none';
            document.getElementById('timesheetSection').classList.toggle('hidden', id !== 'timesheet');
            
            const accSection = document.getElementById('accountsPortalSection');
            if (accSection) {
                accSection.classList.toggle('hidden', id !== 'accounts');
            }
        }

        let currentAdminUser = null;

        async function rfcCCMt9jxJsDqTBXGeaCrr616tdvW3emh() {
            try {
                const res = await fetch(`${SCRIPT_URL}?action=getWorkerList`).then(r => r.json());
                if (res.status === 'success') {
                    masterWorkerList = res.data;
                    masterAdmins = res.admins || [];
                    populateDepartmentDropdown();
                }
            } catch (e) { console.error('Master list fetch failed', e); }
        }

        function populateDepartmentDropdown() {
            const deptSelect = document.getElementById('departmentSelect');
            if (!deptSelect) return;
            const currentVal = deptSelect.value;
            deptSelect.innerHTML = '<option value="">Select Department</option>';

            let availableDepts = Object.keys(masterWorkerList).filter(dept => !dept.toLowerCase().includes('accounts'));

            if (isAdmin && currentAdminUser && currentAdminUser.allowedDepts && !currentAdminUser.allowedDepts.includes('ALL')) {
                availableDepts = availableDepts.filter(dept => currentAdminUser.allowedDepts.includes(dept));
            }

            availableDepts.forEach(dept => {
                const opt = document.createElement('option');
                opt.value = dept;
                opt.textContent = dept;
                deptSelect.appendChild(opt);
            });

            if (availableDepts.length === 1) {
                deptSelect.value = availableDepts[0];
            } else if (availableDepts.includes(currentVal)) {
                deptSelect.value = currentVal;
            } else {
                deptSelect.value = '';
            }

            loadWorkerList();
        }

        function loadWorkerList() {
            const dept = document.getElementById('departmentSelect').value;
            const input = document.getElementById('workerSelect');
            const dropdown = document.getElementById('customWorkerDropdown');
            input.value = '';
            dropdown.innerHTML = '';
            dropdown.classList.remove('show');
            if (dept && masterWorkerList[dept]) {
                filterCustomWorkerList();
            }
        }

        function togglePasswordVisibility(id) {
            const el = document.getElementById(id);
            const btn = el.nextElementSibling;
            if (el.type === 'password') {
                el.type = 'text';
                btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
            } else {
                el.type = 'password';
                btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
            }
        }

        function showCustomWorkerList() {
            const dept = document.getElementById('departmentSelect').value;
            if (!dept) {
                showToast('Select Department first', 'info');
                return;
            }
            filterCustomWorkerList();
            document.getElementById('customWorkerDropdown').classList.add('show');
        }

        function filterCustomWorkerList() {
            const dept = document.getElementById('departmentSelect').value;
            const inputVal = document.getElementById('workerSelect').value.toLowerCase();
            const dropdown = document.getElementById('customWorkerDropdown');
            dropdown.innerHTML = '';

            if (dept && masterWorkerList[dept]) {
                const filtered = masterWorkerList[dept].filter(worker => {
                    const wName = typeof worker === 'string' ? worker : worker.name;
                    return wName.toLowerCase().includes(inputVal);
                });

                if (filtered.length > 0) {
                    filtered.forEach(worker => {
                        const wName = typeof worker === 'string' ? worker : worker.name;
                        const div = document.createElement('div');
                        div.className = 'dropdown-item';
                        div.textContent = wName;
                        div.onclick = () => selectWorker(wName);
                        dropdown.appendChild(div);
                    });
                } else {
                    const div = document.createElement('div');
                    div.className = 'dropdown-item no-results';
                    div.textContent = 'No matching workers';
                    dropdown.appendChild(div);
                }
            }
        }

        function selectWorker(name) {
            document.getElementById('workerSelect').value = name;
            document.getElementById('customWorkerDropdown').classList.remove('show');
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown-wrapper')) {
                const dropdown = document.getElementById('customWorkerDropdown');
                if (dropdown) dropdown.classList.remove('show');
            }
        });

        function toggleAdminLogin() {
            if (isAdmin) {
                // If already admin, clicking should just logout immediately
                performLogout();
            } else {
                document.getElementById('loginModal').classList.add('show');
            }
        }

        function performLogout() {
            isAdmin = false;
            currentAdminUser = null;
            document.body.classList.remove('admin-active');

            // Clean up UI instantly
            document.getElementById('btnAdminNav').textContent = 'Supervisor Portal';
            document.getElementById('welcomeGreeting').textContent = 'Welcome back!';
            document.getElementById('workerPasswordGroup').style.display = 'flex';
            document.getElementById('workerPassword').value = '';

            const loginLink = document.querySelector('.admin-login-link');
            if (loginLink) loginLink.textContent = 'Login as Supervisor';

            // Hide admin verification panels
            document.getElementById('btnAdminVerify').style.display = 'none';
            document.getElementById('btnHeaderVerify').style.display = 'none';

            // Close the modal instantly
            closeModal('logoutModal');

            // Exit any active timesheet view
            exitTimesheet();

            // Repopulate all departments for normal worker selection
            populateDepartmentDropdown();

            showToast('Logged out of Supervisor');
        }

        function closeModal(id) { document.getElementById(id).classList.remove('show'); }

        function handleAdminLogin() {
            const id = document.getElementById('adminId').value.trim();
            const pw = document.getElementById('adminPassword').value;

            const admin = masterAdmins.find(a => a.name === id && String(a.password) === String(pw));
            if (admin) {
                isAdmin = true;
                currentAdminUser = admin;
                document.body.classList.add('admin-active');
                closeModal('loginModal');
                document.getElementById('btnAdminNav').textContent = 'Supervisor Portal Logout';
                
                let deptInfo = '';
                if (admin.allowedDepts && !admin.allowedDepts.includes('ALL') && admin.allowedDepts.length > 0) {
                    deptInfo = ' (' + admin.allowedDepts.join(', ') + ')';
                }
                document.getElementById('welcomeGreeting').textContent = 'Supervisor Portal Active' + deptInfo;
                document.getElementById('workerPasswordGroup').style.display = 'none';
                const loginLink = document.querySelector('.admin-login-link');
                if (loginLink) loginLink.textContent = 'Logout Supervisor';

                populateDepartmentDropdown();
                showToast('Welcome Supervisor!');
            } else {
                showToast('Invalid credentials', 'error');
            }
        }

        async function showStatusModal() {
            const dept = document.getElementById('departmentSelect').value;
            const mon = document.getElementById('monthSelect').value;
            const yr = document.getElementById('yearSelect').value;
            if (!dept) { showToast('Select Department first', 'error'); return; }

            const btnViewPayroll = document.getElementById('btnViewPayrollStatus');
            const btnDownloadPayroll = document.getElementById('btnDownloadPayrollStatus');
            if (btnViewPayroll) btnViewPayroll.style.display = isAdmin ? 'inline-flex' : 'none';
            if (btnDownloadPayroll) btnDownloadPayroll.style.display = isAdmin ? 'inline-flex' : 'none';

            showLoading('Fetching status...');
            document.getElementById('statusSubtitle').textContent = `${dept} · ${mon} ${yr}`;
            try {
                const res = await fetch(`${SCRIPT_URL}?action=getStatus&department=${encodeURIComponent(dept)}&monthYear=${encodeURIComponent(mon + ' ' + yr)}`).then(r => r.json());
                hideLoading();
                if (res.status === 'success') {
                    let html = '<table class="status-table"><thead><tr><th>Worker Name</th><th>Status</th><th>Action</th></tr></thead><tbody>';
                    res.data.forEach(item => {
                        const badgeClass = `badge-${item.status.toLowerCase()}`;
                        let actions = '-';
                        if (isAdmin && (item.status === 'Submitted' || item.status === 'Verified')) {
                            actions = `<div style="display: flex; gap: 5px; justify-content: flex-start;"><button onclick="viewWorkerFromStatus('${item.name}')" style="background:var(--accent-primary); color:white; border:none; padding:4px 8px; border-radius:4px; font-size:0.8rem; cursor:pointer;">View</button>`;
                            if (item.status === 'Verified') {
                                actions += `<button onclick="handleResubmit('${item.name}')" style="background:var(--accent-orange); color:white; border:none; padding:4px 8px; border-radius:4px; font-size:0.8rem; cursor:pointer;">Resubmit</button>`;
                            }
                            actions += `</div>`;
                        }
                        html += `<tr><td>${item.name}</td><td><span class="badge ${badgeClass}">${item.status}</span></td><td>${actions}</td></tr>`;
                    });
                    html += '</tbody></table>';
                    document.getElementById('statusListContent').innerHTML = html;
                    document.getElementById('statusModal').classList.add('show');
                }
            } catch (e) { hideLoading(); showToast('Error fetching status', 'error'); }
        }

        function viewWorkerFromStatus(name) {
            document.getElementById('workerSelect').value = name;
            closeModal('statusModal');
            loadTimesheet();
        }

        async function handleResubmit(name) {
            if (!confirm(`Allow ${name} to edit their timesheet again?`)) return;
            showLoading('Unlocking...');
            const dept = document.getElementById('departmentSelect').value;
            const mon = document.getElementById('monthSelect').value;
            const yr = document.getElementById('yearSelect').value;
            try {
                const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify({ action: 'resubmitWorker', department: dept, monthYear: mon + ' ' + yr, workerName: name }) }).then(r => r.json());
                hideLoading(); showToast(res.message); showStatusModal();
            } catch (e) { hideLoading(); showToast('Error', 'error'); }
        }

        async function loadTimesheet() {
            const dept = document.getElementById('departmentSelect').value;
            const workerInput = document.getElementById('workerSelect');
            const name = workerInput.value.trim();
            const mon = document.getElementById('monthSelect').value;
            const yr = document.getElementById('yearSelect').value;

            if (!dept || !name) { showToast('Select department and worker', 'error'); return; }

            if (!isAdmin) {
                const workerList = masterWorkerList[dept] || [];
                const workerObj = workerList.find(w => (typeof w === 'string' ? w : w.name) === name);
                if (!workerObj) {
                    showToast('Invalid worker name', 'error');
                    return;
                }
                const expectedPwd = typeof workerObj === 'string' ? '' : (workerObj.password || '');
                const enteredPwd = document.getElementById('workerPassword').value;
                if (expectedPwd && expectedPwd.trim() !== '') {
                    if (enteredPwd !== expectedPwd) {
                        showToast('Incorrect worker password', 'error');
                        return;
                    }
                }
            }

            if (entryMode === 'day') {
                const dVal = document.getElementById('dateSelect').value;
                if (!dVal) { showToast('Select date', 'error'); return; }
                const sDate = new Date(dVal);
                currentMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][sDate.getMonth()];
                currentYear = sDate.getFullYear().toString();
                selectedDayOnly = sDate.getDate();
            } else {
                currentMonth = mon; currentYear = yr; selectedDayOnly = null;
            }

            currentDepartment = dept; currentWorker = name; daysInMonth = getDaysInMonth(currentMonth, currentYear);

            showLoading('Loading...');
            try {
                const activeCols = DEPARTMENTS_CONFIG[dept] || DEPARTMENTS_CONFIG['DEFAULT'];
                const keys = ['name', 'date', 'day', ...activeCols.map(c => c.id)].join(',');
                const sheetName = `${name}-${currentMonth}-${currentYear}`;
                const url = `${SCRIPT_URL}?action=getData&department=${encodeURIComponent(dept)}&monthYear=${encodeURIComponent(currentMonth + ' ' + currentYear)}&sheetName=${encodeURIComponent(sheetName)}&keys=${encodeURIComponent(keys)}`;
                const res = await fetch(url).then(r => r.json());

                isLocked = res.isLocked || false;
                currentData = res.data || [];
                buildSpreadsheet(currentData);

                const btnSubmit = document.getElementById('btnHeaderSubmit');
                const btnVerify = document.getElementById('btnHeaderVerify');
                if (btnSubmit) btnSubmit.style.display = isLocked ? 'none' : 'block';
                if (btnVerify) btnVerify.style.display = (isAdmin && !isLocked) ? 'flex' : 'none';

                showSection('timesheet');
                document.getElementById('timesheetTitle').textContent = `${name}'s Timesheet`;
                document.getElementById('timesheetSubtitle').textContent = `${dept} · ${currentMonth} ${currentYear} ${isLocked ? '(LOCKED)' : ''}`;
                document.getElementById('verticalTimesheetTitle').textContent = `${name}'s Timesheet`;
                document.getElementById('verticalTimesheetSubtitle').textContent = `${dept} · ${currentMonth} ${currentYear} ${isLocked ? '(LOCKED)' : ''}`;
                hideLoading();
            } catch (e) { hideLoading(); showSection('timesheet'); buildSpreadsheet(null); }
        }

        const DEPARTMENTS_CONFIG = {
            'RADIOGRAPHY': [
                { id: 'nightShiftIn', label: 'IN', topLabel: 'NIGHT SHIFT', type: 'time', width: 'col-time-wide' },
                { id: 'nightShiftOut', label: 'OUT', topLabel: 'NIGHT SHIFT', type: 'time', width: 'col-time-wide' },
                { id: 'lunchIn', label: 'IN', topLabel: 'LUNCH TIME', type: 'time', width: 'col-time-wide' },
                { id: 'lunchOut', label: 'OUT', topLabel: 'LUNCH TIME', type: 'time', width: 'col-time-wide' },
                { id: 'standBy', label: 'STAND BY', topLabel: 'STAND BY', type: 'text', width: 'col-location' },
                { id: 'lunchRtClient', label: 'CLIENT', topLabel: 'LUNCH RT', type: 'text', width: 'col-location' },
                { id: 'lunchRtFilms', label: 'FILMS', topLabel: 'LUNCH RT', type: 'text', width: 'col-location' },
                { id: 'tsNumber', label: 'TIMESHEET NUMBER', topLabel: 'TIMESHEET NUMBER', type: 'text', width: 'col-number-wide' },
                { id: 'loc1Client1', label: 'CLIENT 01', topLabel: 'LOCATION 01', type: 'text', width: 'col-location' },
                { id: 'loc1Films', label: 'FILMS', topLabel: 'LOCATION 01', type: 'text', width: 'col-location' },
                { id: 'loc2Client2', label: 'CLIENT 02', topLabel: 'LOCATION 02', type: 'text', width: 'col-location' },
                { id: 'loc2Films', label: 'FILMS', topLabel: 'LOCATION 02', type: 'text', width: 'col-location' },
                { id: 'loc3Client3', label: 'CLIENT 03', topLabel: 'LOCATION 03', type: 'text', width: 'col-location' },
                { id: 'loc3Films', label: 'FILMS', topLabel: 'LOCATION 03', type: 'text', width: 'col-location' },
                { id: 'expF4x10', label: '4"X10"', topLabel: 'EXPOSED FILMS', type: 'number', width: 'col-number', sum: true },
                { id: 'expF4x15', label: '4"X15"', topLabel: 'EXPOSED FILMS', type: 'number', width: 'col-number', sum: true },
                { id: 'expF17x14', label: '17"X14"', topLabel: 'EXPOSED FILMS', type: 'number', width: 'col-number', sum: true },
                { id: 'expFReshoot', label: 'RESHOOT', topLabel: 'EXPOSED FILMS', type: 'number', width: 'col-number', sum: true },
                { id: 'expFTotal', label: 'TOTAL', topLabel: 'EXPOSED FILMS', type: 'number', width: 'col-number', sum: true },
                { id: 'otLunchRt', label: 'LUNCH RT', topLabel: 'OT DETAILS', type: 'number', width: 'col-number', sum: true },
                { id: 'otSiteToSite', label: 'SITE TO SITE', topLabel: 'OT DETAILS', type: 'number', width: 'col-number', sum: true },
                { id: 'otXrayScar', label: 'X-RAY / SCAR', topLabel: 'OT DETAILS', type: 'number', width: 'col-number', sum: true },
                { id: 'otProfile', label: 'PROFILE (MIN 4FILM)', topLabel: 'OT DETAILS', type: 'number', width: 'col-number-wide', sum: true },
                { id: 'timesheetOt', label: 'Timesheet OT', topLabel: 'OT DETAILS', type: 'number', width: 'col-number', sum: true },
                { id: 'sunday', label: 'SUNDAY', topLabel: 'OT DETAILS', type: 'number', width: 'col-number', sum: true },
                { id: 'totalOt', label: 'TOTAL OT', topLabel: 'OT DETAILS', type: 'number', width: 'col-number', sum: true },
                { id: 'otRtrDrtPautAllow', label: 'RTR/DRT/PAUT ALLOW', topLabel: 'OT DETAILS', type: 'number', width: 'col-number-wide', sum: true },
                { id: 'otRopeAllow', label: 'ROPE ALLOW', topLabel: 'OT DETAILS', type: 'number', width: 'col-number-wide', sum: true },
                { id: 'otWeldtestAllow', label: 'WELDTEST ALLOW', topLabel: 'OT DETAILS', type: 'number', width: 'col-number-wide', sum: true },
                { id: 'busFarw', label: 'BUS FARE', topLabel: 'BUS FARE', type: 'number', width: 'col-number', sum: true }
            ],
            'DEFAULT': [
                { id: 'clientIn', label: 'Client IN', type: 'time', width: 'col-time-wide' },
                { id: 'clientOut', label: 'Client OUT', type: 'time', width: 'col-time-wide' },
                { id: 'tsNumber', label: 'Timesheet Number', type: 'text', width: 'col-number-wide' },
                { id: 'siteLoc1', label: 'Site Location 1', type: 'text', width: 'col-location' },
                { id: 'siteLoc2', label: 'Site Location 2', type: 'text', width: 'col-location' },
                { id: 'otHrs', label: 'OT Hrs', type: 'number', width: 'col-number', step: '0.5', sum: true },
                { id: 'siteAllowanceHrs', label: 'Site Allowance Hrs', type: 'number', width: 'col-number-wide', step: '0.5', sum: true },
                { id: 'travelAllowance', label: 'Travel Allowance', type: 'number', width: 'col-money', step: '0.01', sum: true, prefix: '$' },
                { id: 'otherAllowance', label: 'Other Allowance', type: 'number', width: 'col-money', step: '0.01', sum: true, prefix: '$' },
                { id: 'busAllowance', label: 'Bus Allowance', type: 'number', width: 'col-money', step: '0.01', sum: true, prefix: '$' },
                { id: 'remarks', label: 'Remarks', type: 'text', width: 'col-remarks', countTimesheets: true }
            ]
        };

        function getActiveColumns() {
            return DEPARTMENTS_CONFIG[currentDepartment] || DEPARTMENTS_CONFIG['DEFAULT'];
        }

        function formatTimeValue(val) {
            if (!val) return '';
            val = String(val).trim();
            const timeMatch = val.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM|am|pm)?$/);
            if (timeMatch) {
                let hours = parseInt(timeMatch[1], 10);
                const mins = timeMatch[2];
                const modifier = timeMatch[3];
                if (modifier) {
                    const modUpper = modifier.toUpperCase();
                    if (modUpper === 'PM' && hours < 12) hours += 12;
                    else if (modUpper === 'AM' && hours === 12) hours = 0;
                }
                return `${hours.toString().padStart(2, '0')}:${mins}`;
            }
            return val;
        }

        function buildSpreadsheet(data) {
            const activeCols = getActiveColumns();
            const tbody = document.getElementById('spreadsheetBody');
            const table = document.getElementById('spreadsheetTable');
            const dayForm = document.getElementById('dayWiseForm');
            const section = document.getElementById('timesheetSection');
            const thead = document.querySelector('.spreadsheet thead');

            EDITABLE_COL_INDICES = Array.from({ length: activeCols.length }, (_, i) => i + 4);

            if (thead) {
                const hasGroups = activeCols.some(c => c.topLabel);

                if (hasGroups) {
                    let row1 = `<tr><th class="col-sno" rowspan="2">#</th><th class="col-name" rowspan="2">Full Name</th><th class="col-date" rowspan="2">Date</th><th class="col-day" rowspan="2">Day</th>`;
                    let row2 = `<tr>`;

                    let groups = [];
                    activeCols.forEach(col => {
                        let lastGroup = groups[groups.length - 1];
                        if (lastGroup && lastGroup.label === col.topLabel) {
                            lastGroup.count++;
                        } else {
                            groups.push({ label: col.topLabel, count: 1 });
                        }
                    });

                    groups.forEach(g => {
                        if (g.count === 1) {
                            let col = activeCols.find(c => c.topLabel === g.label);
                            row1 += `<th rowspan="2" class="${col.width}">${g.label}</th>`;
                        } else {
                            row1 += `<th colspan="${g.count}">${g.label}</th>`;
                        }
                    });

                    activeCols.forEach(col => {
                        let g = groups.find(x => x.label === col.topLabel);
                        if (g.count > 1) {
                            row2 += `<th class="${col.width}">${col.label}</th>`;
                        }
                    });

                    row1 += `</tr>`;
                    row2 += `</tr>`;
                    thead.innerHTML = row1 + row2;
                } else {
                    let thHtml = `<tr><th class="col-sno">#</th><th class="col-name">Full Name</th><th class="col-date">Date</th><th class="col-day">Day</th>`;
                    activeCols.forEach(col => { thHtml += `<th class="${col.width}">${col.label}</th>`; });
                    thHtml += `</tr>`;
                    thead.innerHTML = thHtml;
                }
            }

            tbody.innerHTML = '';
            dayForm.innerHTML = '';

            if (selectedDayOnly) {
                section.classList.add('vertical-mode');
                table.style.display = 'none';
                dayForm.style.display = 'grid';

                const d = selectedDayOnly;
                const mIdx = getMonthIndex(currentMonth);
                const date = new Date(currentYear, mIdx, d), dName = getDayName(date), dStr = formatDate(d, currentMonth, currentYear);
                const rD = data ? data.find(x => x.date === dStr) : null;

                let dHtml = `
                    <div class="vertical-info-banner">
                        <div class="vertical-info-item"><span>Worker</span><span>${currentWorker}</span></div>
                        <div class="vertical-info-item"><span>Date</span><span>${dStr}</span></div>
                        <div class="vertical-info-item"><span>Day</span><span>${dName}</span></div>
                    </div>`;

                activeCols.forEach(col => {
                    let step = col.step ? `step='${col.step}'` : '';
                    let val = rD && rD[col.id] !== undefined ? rD[col.id] : '';
                    if (col.type === 'time' && val) val = formatTimeValue(val);
                    let oninput = col.sum || col.countTimesheets ? `oninput='updateTotals()'` : '';
                    let style = col.id === 'remarks' ? 'style="text-align: left; padding-left: 10px;"' : '';
                    let gridCol = col.id === 'remarks' ? 'style="grid-column: 1 / -1;"' : '';
                    let labelText = col.topLabel && col.topLabel !== col.label ? `${col.topLabel} - ${col.label}` : col.label;
                    dHtml += `<div class="vertical-field-card" ${gridCol}><label>${labelText}</label><input type='${col.type}' id='${col.id}_${d}' value='${val}' ${step} ${oninput} ${style} ${isLocked ? 'readonly' : ''}></div>`;
                });

                dHtml += `
                    <div class="vertical-submit-container">
                        <button class="btn-submit" onclick="submitTimesheet()" style="background: #10b981; padding: 12px 30px; font-size: 1rem;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            Submit & Save
                        </button>
                    </div>`;

                dayForm.innerHTML = dHtml;

                setTimeout(() => {
                    const firstInput = document.getElementById(`${activeCols[0].id}_${d}`);
                    if (firstInput) firstInput.focus();
                }, 100);

            } else {
                section.classList.remove('vertical-mode');
                table.style.display = 'table';
                dayForm.style.display = 'none';

                const mIdx = getMonthIndex(currentMonth);
                for (let d = 1; d <= daysInMonth; d++) {
                    const date = new Date(currentYear, mIdx, d), dName = getDayName(date), dStr = formatDate(d, currentMonth, currentYear), isSun = date.getDay() === 0, isSat = date.getDay() === 6;
                    const tr = document.createElement('tr');
                    if (isSun) tr.classList.add('row-sunday'); else if (isSat) tr.classList.add('row-saturday');
                    const rD = data ? data.find(x => x.date === dStr) : null;

                    let rowHtml = `<td class="${isLocked ? 'locked' : ''}">${d}</td><td class="${isLocked ? 'locked' : ''}">${currentWorker}</td><td class="${isLocked ? 'locked' : ''}">${dStr}</td><td class='${isSun ? 'sunday' : isSat ? 'saturday' : ''} ${isLocked ? 'locked' : ''}'>${dName}</td>`;

                    activeCols.forEach(col => {
                        let step = col.step ? `step='${col.step}'` : '';
                        let oninput = col.sum || col.countTimesheets ? `oninput='updateTotals()'` : '';
                        let val = rD && rD[col.id] !== undefined ? rD[col.id] : '';
                        if (col.type === 'time' && val) val = formatTimeValue(val);
                        rowHtml += `<td class="${isLocked ? 'locked' : ''}"><input type='${col.type}' id='${col.id}_${d}' value='${val}' ${step} ${oninput} ${isLocked ? 'readonly' : ''}></td>`;
                    });

                    tr.innerHTML = rowHtml;
                    tbody.appendChild(tr);
                }
                buildTotalsRow(); updateTotals();
            }
        }

        function buildTotalsRow() {
            const activeCols = getActiveColumns();
            let html = `<tr><td colspan='4'>TOTAL</td>`;
            activeCols.forEach(col => {
                if (col.sum) {
                    html += `<td id='total_${col.id}'>${col.prefix || ''}0${col.prefix ? '.00' : ''}</td>`;
                } else if (col.countTimesheets) {
                    html += `<td id='totalTimesheets' style='font-size:0.7rem;'></td>`;
                } else {
                    html += `<td></td>`;
                }
            });
            html += `</tr>`;
            document.getElementById('spreadsheetFoot').innerHTML = html;
        }

        function updateTotals() {
            const activeCols = getActiveColumns();
            let totals = {};
            activeCols.filter(c => c.sum).forEach(c => totals[c.id] = 0);
            let tsCount = 0;

            for (let d = 1; d <= daysInMonth; d++) {
                const firstColId = activeCols[0].id;
                if (!document.getElementById(`${firstColId}_${d}`)) continue;

                let hasTimesheetEntry = false;

                if (currentDepartment === 'RADIOGRAPHY') {
                    const getVal = (id) => {
                        const el = document.getElementById(`${id}_${d}`);
                        return el && el.value !== '' ? parseFloat(el.value) : 0;
                    };
                    const hasVal = (id) => {
                        const el = document.getElementById(`${id}_${d}`);
                        return el && el.value !== '';
                    };

                    const expF4x10 = getVal('expF4x10');
                    const expF4x15 = getVal('expF4x15');
                    const expF17x14 = getVal('expF17x14');
                    const expFReshoot = getVal('expFReshoot');
                    const expFTotalEl = document.getElementById(`expFTotal_${d}`);
                    
                    if (expFTotalEl) {
                        if (hasVal('expF4x10') || hasVal('expF4x15') || hasVal('expF17x14') || hasVal('expFReshoot')) {
                            expFTotalEl.value = expF4x10 + expF4x15 + expF17x14 + expFReshoot;
                        } else {
                            expFTotalEl.value = '';
                        }
                    }

                    const otLunchRt = getVal('otLunchRt');
                    const otSiteToSite = getVal('otSiteToSite');
                    const otXrayScar = getVal('otXrayScar');
                    const otProfile = getVal('otProfile');
                    const timesheetOt = getVal('timesheetOt');
                    const sunday = getVal('sunday');
                    const totalOtEl = document.getElementById(`totalOt_${d}`);

                    if (totalOtEl) {
                        if (hasVal('otLunchRt') || hasVal('otSiteToSite') || hasVal('otXrayScar') || hasVal('otProfile') || hasVal('timesheetOt') || hasVal('sunday')) {
                            totalOtEl.value = otLunchRt + otSiteToSite + otXrayScar + otProfile + timesheetOt + sunday;
                        } else {
                            totalOtEl.value = '';
                        }
                    }
                }

                activeCols.forEach(col => {
                    const el = document.getElementById(`${col.id}_${d}`);
                    if (!el) return;

                    if (col.sum) {
                        totals[col.id] += parseFloat(el.value) || 0;
                    }

                    if (currentDepartment === 'AB') {
                        if (col.id === 'tsNumber' && el.value) {
                            hasTimesheetEntry = true;
                        }
                    } else {
                        if ((col.id === 'clientIn' || col.id === 'clientOut') && el.value) {
                            hasTimesheetEntry = true;
                        }
                    }
                });

                if (hasTimesheetEntry) tsCount++;
            }

            activeCols.forEach(col => {
                if (col.sum) {
                    let val = totals[col.id];
                    let text = col.prefix ? col.prefix + val.toFixed(2) : (Number.isInteger(val) ? val.toString() : val.toFixed(1));
                    document.getElementById(`total_${col.id}`).textContent = text;
                }
            });

            const countEl = document.getElementById('totalTimesheets');
            if (countEl) {
                countEl.innerHTML = `CLIENT TIMESHEETS:<br>${tsCount}`;
            }
        }

        function getTableRows() {
            let rows = JSON.parse(JSON.stringify(currentData || []));
            const mIdx = getMonthIndex(currentMonth);
            const activeCols = getActiveColumns();

            if (rows.length === 0) {
                for (let d = 1; d <= daysInMonth; d++) {
                    let row = {
                        name: currentWorker,
                        date: formatDate(d, currentMonth, currentYear),
                        day: getDayName(new Date(currentYear, mIdx, d))
                    };
                    activeCols.forEach(col => {
                        row[col.id] = '';
                    });
                    rows.push(row);
                }
            }
            for (let d = 1; d <= daysInMonth; d++) {
                const firstColId = activeCols[0].id;
                const el = id => document.getElementById(`${id}_${d}`);
                if (el(firstColId)) {
                    const dStr = formatDate(d, currentMonth, currentYear);
                    let row = rows.find(r => r.date === dStr);
                    if (!row) {
                        row = { name: currentWorker, date: dStr, day: getDayName(new Date(currentYear, mIdx, d)) };
                        rows.push(row);
                    }
                    activeCols.forEach(col => {
                        row[col.id] = el(col.id).value;
                    });
                }
            }
            return rows;
        }

        async function submitTimesheet() {
            showLoading('Saving...');
            const activeCols = getActiveColumns();
            const headers = ['Full Name', 'Date', 'Day', ...activeCols.map(c => c.topLabel && c.topLabel !== c.label ? `${c.topLabel} ${c.label}` : c.label)];
            const keys = ['name', 'date', 'day', ...activeCols.map(c => c.id)];
            const sums = activeCols.map(c => c.sum ? true : false);

            const payload = {
                action: 'saveData',
                department: currentDepartment,
                monthYear: `${currentMonth} ${currentYear}`,
                sheetName: `${currentWorker}-${currentMonth}-${currentYear}`,
                workerName: currentWorker,
                rows: getTableRows(),
                headers: headers,
                keys: keys,
                sums: sums
            };
            try { await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) }); hideLoading(); showToast('Saved Successfully!'); }
            catch (e) { hideLoading(); showToast('Error saving', 'error'); }
        }

        async function handleSaveAndExit() {
            await submitTimesheet();
            exitTimesheet();
        }

        async function handleVerify() {
            const vName = document.getElementById('headerVerifierName').value;
            if (!vName) { showToast('Enter Verifier Name', 'error'); return; }

            showLoading('Saving & Verifying...');

            // 1. Save Data First
            const activeCols = getActiveColumns();
            const headers = ['Full Name', 'Date', 'Day', ...activeCols.map(c => c.topLabel && c.topLabel !== c.label ? `${c.topLabel} ${c.label}` : c.label)];
            const keys = ['name', 'date', 'day', ...activeCols.map(c => c.id)];
            const sums = activeCols.map(c => c.sum ? true : false);

            const savePayload = { action: 'saveData', department: currentDepartment, monthYear: `${currentMonth} ${currentYear}`, sheetName: `${currentWorker}-${currentMonth}-${currentYear}`, workerName: currentWorker, rows: getTableRows(), headers: headers, keys: keys, sums: sums };
            try {
                const saveRes = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(savePayload) }).then(r => r.json());
                if (saveRes.status !== 'success') {
                    hideLoading(); showToast(saveRes.message || 'Error saving before verify', 'error'); return;
                }
            } catch (e) { hideLoading(); showToast('Error saving data', 'error'); return; }

            // 2. Verify Data
            const verifyPayload = { action: 'verifyWorker', department: currentDepartment, monthYear: `${currentMonth} ${currentYear}`, workerName: currentWorker, verifierName: vName, rows: getTableRows(), headers: headers, keys: keys };
            try {
                const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(verifyPayload) }).then(r => r.json());
                hideLoading();
                if (res.status === 'success') {
                    showToast('Saved & Verified successfully!');
                    loadTimesheet();
                } else {
                    showToast(res.message || 'Error verifying', 'error');
                }
            } catch (e) { hideLoading(); showToast('Error verifying data', 'error'); }
        }

        async function handleForgotPassword(type) {
            let dept, name;
            if (type === 'admin') {
                dept = 'Admin';
                name = document.getElementById('adminId').value.trim();
                if (!name) { showToast('Enter Admin User ID first', 'error'); return; }
            } else {
                dept = document.getElementById('departmentSelect').value;
                name = document.getElementById('workerSelect').value.trim();
                if (!dept || !name) { showToast('Select department and name first', 'error'); return; }
            }

            if (!confirm(`Send current password for ${name} to registered email?`)) return;

            showLoading('Sending email...');
            try {
                const res = await fetch(SCRIPT_URL, {
                    method: 'POST',
                    body: JSON.stringify({ action: 'forgotPassword', department: dept, workerName: name })
                }).then(r => r.json());
                hideLoading();
                if (res.status === 'success') showToast(res.message);
                else showToast(res.message, 'error');
            } catch (e) { hideLoading(); showToast('Connection error', 'error'); }
        }

        function openAdminChangePasswordModal() {
 
