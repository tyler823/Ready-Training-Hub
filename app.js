    // =====================================================
    // FIREBASE CONFIG — Replace with your values from Firebase Console
    // See firebase-setup-guide.md for instructions
    // =====================================================
    const FIREBASE_CONFIG = {
        apiKey: "AIzaSyDbGjssNIei0PLbJbhvbAPDktA2U8ekcnc",
        authDomain: "ready-training-hub.firebaseapp.com",
        projectId: "ready-training-hub",
        storageBucket: "ready-training-hub.firebasestorage.app",
        messagingSenderId: "789732882977",
        appId: "1:789732882977:web:074aef70c5b8703bdcc160"
    };

    let db = null;
    try {
        if (FIREBASE_CONFIG.apiKey !== "YOUR_API_KEY_HERE") {
            firebase.initializeApp(FIREBASE_CONFIG);
            
            // App Check — temporarily disabled for testing
            // try {
            //     var appCheck = firebase.appCheck();
            //     appCheck.activate('6LcrMoEsAAAAAC_N03emlSYAUcbFLkaOT_qNHBVO', true);
            //     console.log('🛡️ App Check activated');
            // } catch(acErr) { console.warn('App Check init skipped:', acErr); }
            
            db = firebase.firestore();
            try { db.settings({ experimentalForceLongPolling: true, experimentalAutoDetectLongPolling: false }); } catch(se) { console.log('Firestore settings note:', se.message); }
            console.log('🔥 Firebase initialized, db:', !!db);
        } else {
            console.warn('⚠️ Firebase not configured — progress tracking disabled');
        }
    } catch(e) { console.error('Firebase init error:', e); }

    // Current user state
    window.rtUser = { id: null, email: null, name: null, companyCode: null, role: null };

    // =====================================================
    // PROGRESS MODULE DEFINITIONS
    // =====================================================
    const PROGRESS_MODULES = {
        readiness: { name: 'Readiness & Prep', section: 'sec-readiness', tier: 'solo', items: {
            'rapid-response': { label: 'Rapid Response Checklist', detId: 'det-rapid-response' },
            'vehicle-maint': { label: 'Vehicle Maintenance Protocol', detId: 'det-veh-maint' },
            'equip-hygiene': { label: 'Equipment & Sensor Hygiene', detId: 'det-equip-maint' },
            'consumables': { label: 'Consumables Inventory', detId: 'det-consumables' }
        }},
        mitigation: { name: 'Mitigation Workflow', section: 'sec-mitigation', tier: 'solo', items: {
            'work-auth': { label: 'Step 1: Work Authorization', detId: 'det-step1' },
            'investigation': { label: 'Step 2: Investigation & Documentation', detId: 'det-step2' },
            'extraction': { label: 'Step 3: Extraction', detId: 'det-step3' },
            'equip-setup': { label: 'Step 4: Equipment Setup', detId: 'det-step4' },
            'monitoring': { label: 'Step 5: Daily Monitoring', detId: 'det-step5' },
            'dry-standard': { label: 'Step 6: Dry Standard', detId: 'det-step6' },
            'tear-down': { label: 'Step 7: Tear Down & Close-Out', detId: 'det-step7' }
        }},
        contents: { name: 'Contents & Logistics', section: 'sec-contents', tier: 'solo', items: {
            'encircle': { label: 'Project Documentation Setup', detId: 'det-encircle' },
            'trailer': { label: 'Trailer Safety & Loading', detId: 'det-trailer' }
        }},
        reconstruction: { name: 'Reconstruction', section: 'sec-reconstruction', tier: 'team', items: {
            'transition': { label: 'Transition & Handoff', detId: 'det-transition' },
            'estimating': { label: 'Estimating Software', detId: 'det-estimating' },
            'preconstruction': { label: 'Pre-Construction', detId: 'det-preconstruction' },
            'construction': { label: 'Construction Sequencing', detId: 'det-construction' },
            'completion': { label: 'Project Completion', detId: 'det-closeout' }
        }},
        financial: { name: 'Financial Operations', section: 'sec-financial', tier: 'team', items: {
            'profitability': { label: 'Business Profitability', detId: 'det-profitability' },
            'margins': { label: 'Margins & Markups', detId: 'det-margins' },
            'cashflow': { label: 'Break-Even & Cash Flow', detId: 'det-cashflow' },
            'pricing': { label: 'Pricing Strategy', detId: 'det-pricing' },
            'tax': { label: 'Tax Considerations', detId: 'det-taxes' }
        }},
        onboarding: { name: 'Employee Onboarding', section: 'sec-onboarding', tier: 'team', items: {
            'preboarding': { label: 'Pre-Boarding & Day 1', detId: 'det-onb-preboard' },
            'week1': { label: 'Week 1: Foundation', detId: 'det-onb-week1' },
            'weeks24': { label: 'Weeks 2-4: Building Skills', detId: 'det-onb-weeks24' },
            'days3190': { label: 'Days 31-90: Independence', detId: 'det-onb-3190' },
            'assessment': { label: 'Competency Assessment', detId: 'det-onb-assess' },
            'retention': { label: 'Retention & Career Paths', detId: 'det-onb-retention' }
        }},
        'team-scaling': { name: 'Team Scaling', section: 'sec-team-scaling', tier: 'enterprise', items: {
            'owner-dilemma': { label: "The Owner's Dilemma", detId: 'det-owner-dilemma' },
            'org-structure': { label: 'Organizational Structure', detId: 'det-org-structure' },
            'hiring': { label: 'Systematic Hiring', detId: 'det-hiring' },
            'training-systems': { label: 'Training Systems', detId: 'det-training' },
            'delegation': { label: 'Delegation & Systems', detId: 'det-delegation' },
            'leadership-dev': { label: 'Leadership Development', detId: 'det-leadership' }
        }},
        'exit-strategy': { name: 'Exit Strategy', section: 'sec-exit-strategy', tier: 'enterprise', items: {
            'valuation': { label: 'Business Valuation', detId: 'det-valuation' },
            'sale-prep': { label: 'Sale Preparation', detId: 'det-sale-prep' },
            'exit-options': { label: 'Exit Options & Deal Structures', detId: 'det-exit-options' }
        }},
        'mgmt-development': { name: 'Managerial Development', section: 'sec-mgmt-development', tier: 'enterprise', items: {
            'promotion': { label: 'The Promotion Problem', detId: 'det-mgmt-promo' },
            'branch-mgr': { label: 'Branch Manager Role', detId: 'det-mgmt-branch' },
            'regional-mgr': { label: 'Regional Manager Role', detId: 'det-mgmt-regional' },
            'first-time-mgr': { label: 'First-Time Manager Training', detId: 'det-mgmt-firsttime' },
            'restoration-leadership': { label: 'Restoration-Specific Leadership', detId: 'det-mgmt-restoration' },
            'meetings': { label: 'Meeting Structure', detId: 'det-meetings' }
        }},
        'maturity-models': { name: 'Employee Maturity Models', section: 'sec-maturity-models', tier: 'enterprise', items: {
            'ops-emm': { label: 'Operations/Field EMM', detId: 'det-emm-ops' },
            'estimating-emm': { label: 'Estimating EMM', detId: 'det-emm-est' },
            'admin-emm': { label: 'Admin/Office EMM', detId: 'det-emm-admin' },
            'sales-emm': { label: 'Sales/BD EMM', detId: 'det-emm-sales' }
        }}
    };

    // Local progress cache
    let localProgress = {};

    // =====================================================
    // PROGRESS TRACKING FUNCTIONS
    // =====================================================
    function getProgressKey(mod, item) { return mod + '.' + item; }

    function calcModuleProgress(mod) {
        var items = Object.keys(PROGRESS_MODULES[mod].items);
        var done = 0;
        items.forEach(function(item) { if (localProgress[getProgressKey(mod, item)]) done++; });
        return { done: done, total: items.length, pct: items.length ? Math.round((done / items.length) * 100) : 0 };
    }

    async function saveProgress(mod, item, checked) {
        const key = getProgressKey(mod, item);
        localProgress[key] = checked;
        updateProgressBar(mod);
        if (!db || !window.rtUser.companyCode || !window.rtUser.id) return;
        try {
            const ref = db.collection('companies').doc(window.rtUser.companyCode).collection('members').doc(window.rtUser.id);
            await ref.set({ progress: { [key]: checked } }, { merge: true });
        } catch(e) { console.error('Save progress error:', e); }
    }

    async function loadProgress() {
        if (!db || !window.rtUser.companyCode || !window.rtUser.id) return;
        try {
            const doc = await db.collection('companies').doc(window.rtUser.companyCode).collection('members').doc(window.rtUser.id).get();
            if (doc.exists && doc.data().progress) {
                localProgress = doc.data().progress;
                // Update all checkboxes and progress bars
                Object.keys(localProgress).forEach(function(key) {
                    const cb = document.getElementById('prog-cb-' + key.replace('.', '-'));
                    if (cb) cb.checked = localProgress[key];
                });
                Object.keys(PROGRESS_MODULES).forEach(function(mod) { updateProgressBar(mod); });
                if (typeof renderHomeProgress === 'function') renderHomeProgress();
            }
        } catch(e) { console.error('Load progress error:', e); }
    }

    function updateProgressBar(mod) {
        const p = calcModuleProgress(mod);
        const bar = document.getElementById('prog-bar-' + mod);
        const txt = document.getElementById('prog-txt-' + mod);
        if (bar) { bar.style.width = p.pct + '%'; bar.className = 'h-full rounded-full transition-all duration-500 ' + (p.pct === 100 ? 'bg-emerald-500' : 'bg-violet-500'); }
        if (txt) txt.textContent = p.done + '/' + p.total + ' (' + p.pct + '%)';
    }

    // =====================================================
    // PREMIUM HOME — overall sliver, per-card bars, smart CTA
    // Reuses calcModuleProgress / PROGRESS_MODULES (no new store).
    // =====================================================
    function renderHomeProgress() {
        if (!document.getElementById('sec-home')) return;

        // Per-module card bars
        document.querySelectorAll('#sec-home [data-home-fill]').forEach(function(span) {
            var mod = span.getAttribute('data-home-fill');
            if (!PROGRESS_MODULES[mod]) return;
            var p = calcModuleProgress(mod);
            span.style.width = p.pct + '%';
            span.classList.toggle('is-complete', p.pct === 100);
            var lbl = document.querySelector('#sec-home [data-home-label="' + mod + '"]');
            if (lbl) lbl.textContent = (p.pct === 100) ? 'Complete' : (p.pct + '% complete');
        });

        // Overall progress sliver
        var done = 0, total = 0, modsComplete = 0, modCount = 0;
        Object.keys(PROGRESS_MODULES).forEach(function(mod) {
            var p = calcModuleProgress(mod);
            done += p.done; total += p.total; modCount++;
            if (p.pct === 100) modsComplete++;
        });
        var pct = total ? Math.round((done / total) * 100) : 0;
        var fill = document.getElementById('home-overall-fill');
        var label = document.getElementById('home-overall-label');
        if (fill) fill.style.width = pct + '%';
        if (label) label.textContent = pct + '% complete · ' + modsComplete + '/' + modCount + ' modules complete';

        // Smart primary CTA -> first incomplete base/team module
        var order = ['readiness', 'mitigation', 'contents', 'reconstruction', 'financial', 'onboarding'];
        var target = 'readiness', anyStarted = false, foundIncomplete = false;
        order.forEach(function(mod) {
            if (!PROGRESS_MODULES[mod]) return;
            var p = calcModuleProgress(mod);
            if (p.done > 0) anyStarted = true;
            if (!foundIncomplete && p.pct < 100) { target = mod; foundIncomplete = true; }
        });
        var btn = document.getElementById('home-cta');
        var ctaLabel = document.getElementById('home-cta-label');
        if (btn) btn.setAttribute('onclick', "nav('" + target + "')");
        if (ctaLabel) ctaLabel.textContent = anyStarted ? ('Continue: ' + PROGRESS_MODULES[target].name) : 'Start with Readiness';
    }

    // =====================================================
    // INJECT CHECKBOXES & PROGRESS BARS INTO SECTIONS
    // =====================================================
    function injectProgressUI() {
        Object.keys(PROGRESS_MODULES).forEach(function(mod) {
            var section = document.getElementById(PROGRESS_MODULES[mod].section);
            if (!section) return;

            // Progress bar at top of section (after first child)
            var barDiv = document.createElement('div');
            barDiv.className = 'bg-white rounded-xl p-4 mb-8 shadow-sm border border-slate-200';
            barDiv.innerHTML = '<div class="flex justify-between items-center mb-2">' +
                '<span class="text-xs font-bold text-slate-600 uppercase tracking-wide">Your Progress: ' + PROGRESS_MODULES[mod].name + '</span>' +
                '<span class="text-xs font-bold text-violet-600" id="prog-txt-' + mod + '">0/0 (0%)</span></div>' +
                '<div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden"><div class="h-full rounded-full bg-violet-500 transition-all duration-500" id="prog-bar-' + mod + '" style="width:0%"></div></div>';

            if (section.children.length > 1) {
                section.insertBefore(barDiv, section.children[1]);
            } else {
                section.appendChild(barDiv);
            }

            // Embed a checkbox at the bottom of each detail-expansion div
            Object.keys(PROGRESS_MODULES[mod].items).forEach(function(item) {
                var info = PROGRESS_MODULES[mod].items[item];
                var detDiv = document.getElementById(info.detId);
                if (!detDiv) return;

                var innerDiv = detDiv.querySelector('div[class*="p-"]') || detDiv;
                var cbId = 'prog-cb-' + mod + '-' + item;
                var cbDiv = document.createElement('div');
                cbDiv.className = 'mt-6 pt-4 border-t border-slate-200';
                cbDiv.innerHTML = '<label class="flex items-center gap-3 p-3 rounded-lg bg-white border-2 border-violet-200 hover:border-violet-400 transition cursor-pointer shadow-sm" for="' + cbId + '">' +
                    '<input type="checkbox" id="' + cbId + '" class="w-5 h-5 text-violet-600 rounded border-slate-300 focus:ring-violet-500" ' +
                    'onchange="saveProgress(\'' + mod + '\', \'' + item + '\', this.checked)">' +
                    '<div><span class="text-sm font-bold text-violet-700">Mark Complete</span>' +
                    '<p class="text-xs text-slate-500">I have reviewed and understand: ' + info.label + '</p></div></label>';

                innerDiv.appendChild(cbDiv);
            });
        });
    }

    // =====================================================
    // COMPANY CODE FUNCTIONS
    // =====================================================
    function generateCompanyCode() {
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        var code = '';
        for (var i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
    }

    async function createCompany(name) {
        console.log('📝 createCompany called with name:', name);
        console.log('📝 db exists:', !!db);
        console.log('📝 rtUser:', JSON.stringify(window.rtUser));
        if (!db) { alert('Firebase not configured. Contact your administrator.'); return; }
        var code = generateCompanyCode();
        console.log('📝 Generated code:', code);
        try {
            // Check code doesn't already exist
            console.log('📝 Checking if code exists...');
            var existing = await db.collection('companies').doc(code).get();
            console.log('📝 Code exists:', existing.exists);
            if (existing.exists) { code = generateCompanyCode(); }

            console.log('📝 Writing company doc...');
            await db.collection('companies').doc(code).set({
                name: name, ownerId: window.rtUser.id, createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('📝 Company doc written. Writing member doc...');
            await db.collection('companies').doc(code).collection('members').doc(window.rtUser.id).set({
                name: window.rtUser.name || window.rtUser.email, email: window.rtUser.email,
                role: 'owner', joinedAt: firebase.firestore.FieldValue.serverTimestamp(), progress: {}
            });
            console.log('📝 Member doc written. Saving to Memberstack...');
            window.rtUser.companyCode = code;
            window.rtUser.role = 'owner';

            // Save to Memberstack custom fields
            try {
                console.log('📝 Attempting Memberstack save...');
                console.log('📝 $memberstackDom methods:', Object.keys(window.$memberstackDom || {}));
                
                // Try Memberstack 2.0 format
                if (window.$memberstackDom && window.$memberstackDom.updateMember) {
                    var result = await window.$memberstackDom.updateMember({ customFields: { 'company-code': code, 'company-role': 'owner' } });
                    console.log('📝 updateMember result:', JSON.stringify(result));
                } else if (window.MemberStack && window.MemberStack.onReady) {
                    // Try legacy Memberstack format
                    window.MemberStack.onReady.then(function(member) {
                        member.updateProfile({ 'company-code': code, 'company-role': 'owner' });
                        console.log('📝 Legacy updateProfile called');
                    });
                } else {
                    console.warn('📝 No Memberstack update method found');
                }
            } catch(e) { console.error('❌ Memberstack save error:', e.message, e); }
            try { localStorage.setItem('rt_companyCode', code); localStorage.setItem('rt_companyRole', 'owner'); } catch(e) {}

            closeCompanyModal();
            loadProgress();
            alert('Company created! Your company code is: ' + code + '\n\nShare this code with your team members so they can join.');
        } catch(e) { console.error('❌ Create company error:', e); alert('Error creating company: ' + e.message); }
    }

    async function joinCompany(code) {
        if (!db) { alert('Firebase not configured. Contact your administrator.'); return; }
        code = code.toUpperCase().trim();
        try {
            var companyDoc = await db.collection('companies').doc(code).get();
            if (!companyDoc.exists) { alert('Company code not found. Please check with your employer and try again.'); return; }

            await db.collection('companies').doc(code).collection('members').doc(window.rtUser.id).set({
                name: window.rtUser.name || window.rtUser.email, email: window.rtUser.email,
                role: 'member', joinedAt: firebase.firestore.FieldValue.serverTimestamp(), progress: {}
            }, { merge: true });
            window.rtUser.companyCode = code;
            window.rtUser.role = 'member';

            // Save to Memberstack custom fields
            try {
                if (window.$memberstackDom && window.$memberstackDom.updateMember) {
                    var result = await window.$memberstackDom.updateMember({ customFields: { 'company-code': code, 'company-role': 'member' } });
                    console.log('📝 Join updateMember result:', JSON.stringify(result));
                } else if (window.MemberStack && window.MemberStack.onReady) {
                    window.MemberStack.onReady.then(function(member) {
                        member.updateProfile({ 'company-code': code, 'company-role': 'member' });
                    });
                }
            } catch(e) { console.error('❌ Join Memberstack save error:', e.message, e); }
            try { localStorage.setItem('rt_companyCode', code); localStorage.setItem('rt_companyRole', 'member'); } catch(e) {}

            closeCompanyModal();
            loadProgress();
            alert('You joined ' + companyDoc.data().name + '! Your progress will now be tracked.');
        } catch(e) { console.error('Join company error:', e); alert('Error joining company. Please try again.'); }
    }

    function showCompanyModal() { document.getElementById('company-setup-modal').classList.add('active'); }
    function closeCompanyModal() { document.getElementById('company-setup-modal').classList.remove('active'); }
    function showJoinForm() { document.getElementById('company-create-form').classList.add('hidden'); document.getElementById('company-join-form').classList.remove('hidden'); }
    function showCreateForm() { document.getElementById('company-join-form').classList.add('hidden'); document.getElementById('company-create-form').classList.remove('hidden'); }

    // =====================================================
    // TEAM DASHBOARD FUNCTIONS
    // =====================================================
    async function removeMember(memberId, memberName) {
        if (!db || !window.rtUser.companyCode) return;
        if (!confirm('Remove ' + memberName + ' from your team?\n\nThis removes their progress tracking data. To also revoke their plan access, use the "Manage Team" button to remove them from your Memberstack team.')) return;
        try {
            await db.collection('companies').doc(window.rtUser.companyCode).collection('members').doc(memberId).delete();
            console.log('🗑️ Removed member:', memberId);
            initTeamDashboard(); // Refresh
        } catch(e) { console.error('Remove member error:', e); alert('Error removing member. Please try again.'); }
    }

    async function setMemberRole(memberId, memberName, newRole) {
        if (!db || !window.rtUser.companyCode) return;
        var action = newRole === 'manager' ? 'promote to Manager' : 'set back to Member';
        if (!confirm(action.charAt(0).toUpperCase() + action.slice(1) + ': ' + memberName + '?\n\nManagers can view the Team Dashboard and remove team members.')) return;
        try {
            await db.collection('companies').doc(window.rtUser.companyCode).collection('members').doc(memberId).set({ role: newRole }, { merge: true });
            console.log('🔄 Changed role for', memberId, 'to', newRole);
            initTeamDashboard(); // Refresh
        } catch(e) { console.error('Set role error:', e); alert('Error updating role. Please try again.'); }
    }

    async function initTeamDashboard() {
        if (!db || !window.rtUser.companyCode) {
            document.getElementById('dash-no-company').classList.remove('hidden');
            document.getElementById('dash-content').classList.add('hidden');
            return;
        }
        document.getElementById('dash-no-company').classList.add('hidden');
        document.getElementById('dash-content').classList.remove('hidden');

        // Show company code
        document.getElementById('dash-company-code').textContent = window.rtUser.companyCode;

        try {
            var snapshot = await db.collection('companies').doc(window.rtUser.companyCode).collection('members').get();
            var members = [];
            snapshot.forEach(function(doc) { members.push(Object.assign({ id: doc.id }, doc.data())); });

            // Summary stats
            document.getElementById('dash-total-members').textContent = members.length;
            var totalPct = 0;
            members.forEach(function(m) {
                var memberTotal = 0, memberDone = 0;
                Object.keys(PROGRESS_MODULES).forEach(function(mod) {
                    Object.keys(PROGRESS_MODULES[mod].items).forEach(function(item) {
                        memberTotal++;
                        if (m.progress && m.progress[mod + '.' + item]) memberDone++;
                    });
                });
                m._pct = memberTotal ? Math.round((memberDone / memberTotal) * 100) : 0;
                totalPct += m._pct;
            });
            document.getElementById('dash-avg-completion').textContent = members.length ? Math.round(totalPct / members.length) + '%' : '0%';

            // Render member cards
            var container = document.getElementById('dash-members-grid');
            container.innerHTML = '';
            var currentRole = window.rtUser.role;
            var canManage = (currentRole === 'owner' || currentRole === 'manager');

            members.forEach(function(m) {
                var card = document.createElement('div');
                card.className = 'bg-white rounded-xl p-6 shadow-sm border border-slate-200';
                var isOwner = (m.role === 'owner');
                var isManager = (m.role === 'manager');
                var isSelf = (m.id === window.rtUser.id);

                // Role badge colors
                var badgeClass = 'bg-slate-100 text-slate-600';
                if (isOwner) badgeClass = 'bg-violet-100 text-violet-700';
                else if (isManager) badgeClass = 'bg-amber-100 text-amber-700';

                var html = '<div class="flex justify-between items-start mb-4">' +
                    '<div><h3 class="font-bold text-slate-900">' + (m.name || 'Unknown') + '</h3>' +
                    '<p class="text-xs text-slate-500">' + (m.email || '') + '</p></div>' +
                    '<span class="text-xs font-bold px-2 py-1 rounded ' + badgeClass + '">' + (m.role || 'member') + '</span></div>' +
                    '<div class="mb-3"><div class="flex justify-between text-xs mb-1"><span class="font-bold text-slate-600">Overall</span><span class="font-bold text-violet-600">' + m._pct + '%</span></div>' +
                    '<div class="w-full bg-slate-100 rounded-full h-2.5"><div class="h-full rounded-full ' + (m._pct === 100 ? 'bg-emerald-500' : 'bg-violet-500') + '" style="width:' + m._pct + '%"></div></div></div>' +
                    '<div class="space-y-2 mb-4">';

                Object.keys(PROGRESS_MODULES).forEach(function(mod) {
                    var items = Object.keys(PROGRESS_MODULES[mod].items);
                    var done = 0;
                    items.forEach(function(item) { if (m.progress && m.progress[mod + '.' + item]) done++; });
                    var pct = items.length ? Math.round((done / items.length) * 100) : 0;
                    html += '<div class="flex items-center gap-2"><span class="text-[10px] text-slate-500 w-24 truncate" title="' + PROGRESS_MODULES[mod].name + '">' + PROGRESS_MODULES[mod].name + '</span>' +
                        '<div class="flex-1 bg-slate-100 rounded-full h-1.5"><div class="h-full rounded-full ' + (pct === 100 ? 'bg-emerald-400' : 'bg-violet-400') + '" style="width:' + pct + '%"></div></div>' +
                        '<span class="text-[10px] font-bold text-slate-500 w-8 text-right">' + pct + '%</span></div>';
                });

                html += '</div>';

                var escapedName = (m.name || m.email || '').replace(/'/g, "\\'");

                // Action buttons
                if (!isSelf && canManage) {
                    html += '<div class="flex gap-2 mt-2">';

                    // Remove button — owners can remove anyone except themselves; managers can remove regular members only
                    if (!isOwner && (currentRole === 'owner' || (!isManager && currentRole === 'manager'))) {
                        html += '<button onclick="removeMember(\'' + m.id + '\', \'' + escapedName + '\')" class="flex-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg transition border border-red-200">Remove</button>';
                    }

                    // Promote/Demote buttons — only owners can change roles
                    if (currentRole === 'owner' && !isOwner) {
                        if (isManager) {
                            html += '<button onclick="setMemberRole(\'' + m.id + '\', \'' + escapedName + '\', \'member\')" class="flex-1 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 py-2 rounded-lg transition border border-slate-200">Demote to Member</button>';
                        } else {
                            html += '<button onclick="setMemberRole(\'' + m.id + '\', \'' + escapedName + '\', \'manager\')" class="flex-1 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 py-2 rounded-lg transition border border-amber-200">Promote to Manager</button>';
                        }
                    }

                    html += '</div>';
                }

                card.innerHTML = html;
                container.appendChild(card);
            });

            if (members.length === 0) {
                container.innerHTML = '<div class="text-center py-8 text-slate-500 col-span-full">No team members yet. Share your company code or use the invite link above.</div>';
            }

        } catch(e) { console.error('Dashboard load error:', e); }
    }

    // =====================================================
    // POST-AUTH INITIALIZATION
    // =====================================================
    function initProgressSystem(member) {
        window.rtUser.id = member.data.id;
        window.rtUser.email = member.data.auth.email;
        var cf = member.data.customFields || {};
        var firstName = cf['first-name'] || cf.firstName || '';
        var lastName = cf['last-name'] || cf.lastName || '';
        window.rtUser.name = (firstName + ' ' + lastName).trim() || member.data.auth.email;

        // Check for existing company code
        var cc = member.data.customFields && (member.data.customFields['companycode'] || member.data.customFields['company-code'] || member.data.customFields.companyCode);
        var cr = member.data.customFields && (member.data.customFields['companyrole'] || member.data.customFields['company-role'] || member.data.customFields.companyRole);
        
        // Fallback to localStorage if Memberstack doesn't have it
        if (!cc) { try { cc = localStorage.getItem('rt_companyCode'); } catch(e) {} }
        if (!cr) { try { cr = localStorage.getItem('rt_companyRole'); } catch(e) {} }

        console.log('🔍 Company code from Memberstack:', cc);
        console.log('🔍 Company role from Memberstack:', cr);
        console.log('🔍 db exists:', !!db);

        if (cc) {
            window.rtUser.companyCode = cc;
            window.rtUser.role = cr || 'member'; // Temporary — will be overwritten by Firestore below
            
            // Auto-create or update Firestore member doc on every login
            if (db) {
                (async function() {
                    try {
                        var memberRef = db.collection('companies').doc(cc).collection('members').doc(window.rtUser.id);
                        var memberDoc = await memberRef.get();
                        if (!memberDoc.exists) {
                            console.log('📝 Auto-creating Firestore member doc for', window.rtUser.email);
                            await memberRef.set({
                                name: window.rtUser.name || window.rtUser.email,
                                email: window.rtUser.email,
                                role: cr || 'member',
                                joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
                                progress: {}
                            });
                            console.log('✅ Firestore member doc created');
                        } else {
                            // Update name and email but NEVER overwrite role — Firestore role is the source of truth
                            await memberRef.set({
                                name: window.rtUser.name || window.rtUser.email,
                                email: window.rtUser.email,
                                lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                            }, { merge: true });
                            
                            // Read role from Firestore — this is the real role set by owner/promote
                            var firestoreRole = memberDoc.data().role;
                            if (firestoreRole) {
                                window.rtUser.role = firestoreRole;
                                console.log('✅ Role from Firestore:', firestoreRole);
                            }
                        }
                    } catch(e) { console.warn('Auto-create/update member doc error:', e); }
                })();
            }
        } else if (db) {
            window.rtUser._needsCompanySetup = true;
            console.log('🔍 Needs company setup: true');
        }

        // Defer all DOM operations until the page is fully loaded
        function runAfterDOM() {
            console.log('🔍 runAfterDOM executing. readyState was:', document.readyState);
            console.log('🔍 Looking for sec-readiness:', !!document.getElementById('sec-readiness'));
            console.log('🔍 Looking for company-setup-modal:', !!document.getElementById('company-setup-modal'));
            
            injectProgressUI();
            if (typeof renderHomeProgress === 'function') renderHomeProgress();
            if (window.rtUser.companyCode) {
                loadProgress();
            } else if (window.rtUser._needsCompanySetup) {
                console.log('🔍 Scheduling showCompanyModal in 1500ms');
                setTimeout(function() {
                    console.log('🔍 Calling showCompanyModal now');
                    showCompanyModal();
                }, 1500);
            }
        }

        console.log('🔍 document.readyState:', document.readyState);
        if (document.readyState === 'loading') {
            console.log('🔍 Page still loading, deferring to DOMContentLoaded');
            document.addEventListener('DOMContentLoaded', runAfterDOM);
        } else {
            console.log('🔍 Page already loaded, running immediately');
            runAfterDOM();
        }
    }

// ==========================================================
// BLOCK 2 — Auth guard / user-tier detection
// ==========================================================

    // Track user's subscription tier for nav gating
    window.userTier = 'solo';
    
    (function() {
        console.log('🔐 Checking authentication...');
        
        // Check if user is logged in
        window.$memberstackDom.getCurrentMember()
            .then(member => {
                if (!member.data) {
                    // Not logged in - redirect to main website
                    console.log('⚠️ User not authenticated - redirecting to main site');
                    window.location.href = 'https://readytraining.app';
                    return;
                }
                
                // User is logged in!
                console.log('✅ User authenticated:', member.data.auth.email);
                
                // Get their plan IDs
                const planIds = member.data.planConnections.map(p => p.planId);
                console.log('📋 User plans:', planIds);
                
                // Show content based on membership level
                // Everyone with any plan sees Solo content
                if (planIds.includes('pln_ready-solo-4845d0ug3') || 
                    planIds.includes('pln_ready-team-o41x001dz') || 
                    planIds.includes('pln_ready-pro-coaching-kr45e0udm')) {
                    
                    console.log('✅ Showing Ready Solo content');
                    document.querySelectorAll('[data-ms-membership*="ready-solo"]').forEach(el => {
                        el.style.display = '';
                    });
                }
                
                // Team members (Team + Pro) see reconstruction content
                if (planIds.includes('pln_ready-team-o41x001dz') || 
                    planIds.includes('pln_ready-pro-coaching-kr45e0udm')) {
                    
                    console.log('✅ Showing Ready Team content');
                    window.userTier = 'team';
                    document.querySelectorAll('[data-ms-membership*="ready-team"]').forEach(el => {
                        el.style.display = '';
                    });
                    // Hide Team lock icons
                    var lockTeam = document.getElementById('lock-team');
                    var lockTeamMobile = document.getElementById('lock-team-mobile');
                    if (lockTeam) lockTeam.style.display = 'none';
                    if (lockTeamMobile) lockTeamMobile.style.display = 'none';
                }
                
                // Pro members see everything
                if (planIds.includes('pln_ready-pro-coaching-kr45e0udm')) {
                    console.log('✅ Showing Ready Enterprise content');
                    window.userTier = 'enterprise';
                    document.querySelectorAll('[data-ms-membership*="ready-pro"]').forEach(el => {
                        el.style.display = '';
                    });
                    // Hide Enterprise lock icons
                    var lockEnt = document.getElementById('lock-enterprise');
                    var lockEntMobile = document.getElementById('lock-enterprise-mobile');
                    if (lockEnt) lockEnt.style.display = 'none';
                    if (lockEntMobile) lockEntMobile.style.display = 'none';
                }
                
                // Initialize progress tracking system
                try {
                    console.log('🏗️ Calling initProgressSystem...');
                    console.log('📦 customFields:', JSON.stringify(member.data.customFields));
                    console.log('📦 db exists:', !!db);
                    initProgressSystem(member);
                } catch(progErr) {
                    console.error('❌ Progress system error:', progErr);
                }
                
                // Hide auth overlay if it exists
                const authOverlay = document.getElementById('auth-overlay');
                if (authOverlay) {
                    authOverlay.style.display = 'none';
                }
            })
            .catch(err => {
                // Error checking auth - redirect to main website
                console.error('❌ Auth error:', err);
                window.location.href = 'https://readytraining.app';
            });
    })();

// ==========================================================
// BLOCK 3 — Mobile menu helpers
// ==========================================================

function toggleMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const isActive = menu.classList.contains('active');
    
    if (isActive) {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    } else {
        menu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileMenu() {
    document.querySelector('.mobile-menu').classList.remove('active');
    document.querySelector('.mobile-menu-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

function toggleMobileSubmenu(id) {
    const submenu = document.getElementById(id);
    const arrow = document.getElementById(id.replace('-sub', '-arrow'));
    if (submenu) submenu.classList.toggle('active');
    if (arrow) arrow.classList.toggle('active');
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMobileMenu();
});

// ==========================================================
// BLOCK 4 — Main application (nav, quiz engines, ROI, etc.)
// ==========================================================

        // Upgrade Modal Functions
        function showUpgradeModal(tier) {
            const modal = document.getElementById('upgrade-modal');
            const title = document.getElementById('upgrade-modal-title');
            const msg = document.getElementById('upgrade-modal-message');
            
            if (tier === 'enterprise') {
                title.textContent = 'Ready Enterprise Content';
                msg.textContent = 'This module is available with a Ready Enterprise subscription. Upgrade to access advanced leadership training, exit strategy frameworks, managerial development resources, and employee maturity models.';
            } else {
                title.textContent = 'Ready Team Content';
                msg.textContent = 'This module is available with a Ready Team subscription. Upgrade to access reconstruction operations, financial management, employee onboarding, and team development training.';
            }
            
            modal.classList.add('active');
        }
        
        function closeUpgradeModal(e) {
            if (e && e.target && !e.target.classList.contains('upgrade-modal-overlay')) return;
            document.getElementById('upgrade-modal').classList.remove('active');
        }

        function handleUpgrade() {
            closeUpgradeModal();
            try {
                if (typeof window.$memberstackDom !== 'undefined' && window.$memberstackDom.openPlans) {
                    window.$memberstackDom.openPlans();
                } else if (typeof window.$memberstackDom !== 'undefined' && window.$memberstackDom.openAccount) {
                    window.$memberstackDom.openAccount();
                } else {
                    // Fallback: open homepage in new tab
                    window.open('https://readytraining.app', '_blank');
                }
            } catch(err) {
                console.error('Upgrade error:', err);
                window.open('https://readytraining.app', '_blank');
            }
        }

        function toggleDetails(id) {
            const el = document.getElementById(id);
            if (!el) return;
            
            if (el.classList.contains('is-open')) {
                // Close
                el.classList.remove('is-open');
                el.style.borderWidth = '0px';
            } else {
                // Open
                el.classList.add('is-open');
                el.style.borderWidth = '1px';
            }
        }

        function nav(id) {
            try {
                // Map reconstruction sub-sections to the main reconstruction section
                const reconSubSections = {
                    'recon-transition': 'reconstruction',
                    'recon-estimating': 'reconstruction',
                    'recon-scope': 'reconstruction',
                    'recon-preconstruction': 'reconstruction',
                    'recon-construction': 'reconstruction',
                    'recon-completion': 'reconstruction'
                };
                const sectionId = reconSubSections[id] || id;

                // Check membership access before showing section
                const targetSection = document.getElementById('sec-' + sectionId);
                if (!targetSection) {
                    console.error('Section not found: sec-' + sectionId);
                    return;
                }
                
                const requiredMembership = targetSection.getAttribute('data-ms-membership');
                if (requiredMembership) {
                    const requiredTiers = requiredMembership.split(',').map(t => t.trim());
                    const hasTeamAccess = (window.userTier === 'team' || window.userTier === 'enterprise');
                    const hasEnterpriseAccess = (window.userTier === 'enterprise');
                    
                    let hasAccess = false;
                    if (requiredTiers.includes('ready-team') && hasTeamAccess) hasAccess = true;
                    if (requiredTiers.includes('ready-pro') && hasEnterpriseAccess) hasAccess = true;
                    
                    if (!hasAccess) {
                        // Determine which tier is needed
                        const needsEnterprise = requiredTiers.includes('ready-pro') && !requiredTiers.includes('ready-team');
                        showUpgradeModal(needsEnterprise ? 'enterprise' : 'team');
                        return;
                    }
                }

                // Hide all sections
                document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
                
                // Show target section
                targetSection.classList.remove('hidden');
                
                // Update nav link styling
                document.querySelectorAll('.nav-link').forEach(el => {
                    el.classList.remove('rt-active');
                });

                const activeLink = document.getElementById('link-' + id);
                if (activeLink && activeLink.classList.contains('nav-link')) {
                    activeLink.classList.add('rt-active');
                }
                
                // Section-specific initialization
                if (id === 'home' && typeof renderHomeProgress === 'function') renderHomeProgress();
                if (LP_SECTION_TO_PREFIX[id]) lpInit(LP_SECTION_TO_PREFIX[id]);
                if (id === 'quiz') resetQuiz();
                if (id === 'dashboard') initTeamDashboard();
                if (id === 'recon-quiz') {
                    reconQuizMode = 'practice';
                    const badge = document.getElementById('recon-quiz-mode-badge');
                    if (badge) {
                        badge.className = 'quiz-mode-indicator bg-blue-100 text-blue-700';
                        badge.innerHTML = '📝 Practice Mode';
                    }
                    setTimeout(() => {
                        reconQIdx = 0;
                        reconQScore = 0;
                        loadReconQ();
                    }, 100);
                }
                
                window.scrollTo(0,0);
            } catch(error) {
                console.error('Navigation error:', error);
                alert('Navigation error. Please refresh the page.');
            }
        }

        let readinessChart;
        function initCharts() {
            const canvas = document.getElementById('prepChart');
            if(!canvas) return;
            const ctx = canvas.getContext('2d');
            readinessChart = new Chart(ctx, {
                type: 'doughnut',
                data: { labels: ['Ready', 'Needed'], datasets: [{ data: [3, 1], backgroundColor: ['#7c3aed', '#f1f5f9'], borderWidth: 0 }] },
                options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }
            });
        }

        function updateReadiness() {
            const checked = document.querySelectorAll('.readiness-check:checked').length;
            const total = document.querySelectorAll('.readiness-check').length;
            readinessChart.data.datasets[0].data = [checked, total - checked];
            readinessChart.update();
        }

        function drawFloorPlan() {
            const canvas = document.getElementById('floorPlanCanvas');
            if(!canvas) return;
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = 180;
            const ctx = canvas.getContext('2d');
            const w = canvas.width, h = canvas.height, pad = 30;
            ctx.clearRect(0,0,w,h);
            ctx.setLineDash([10, 5]); ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 3;
            ctx.strokeRect(pad, pad, w-pad*2, h-pad*2); ctx.setLineDash([]);
            const corners = [{x: pad, y: pad, tx: w-pad, ty: h-pad}, {x: w-pad, y: pad, tx: pad, ty: h-pad}, {x: pad, y: h-pad, tx: w-pad, ty: pad}, {x: w-pad, y: h-pad, tx: pad, ty: pad}];
            corners.forEach(n => {
                ctx.beginPath(); ctx.arc(n.x, n.y, 8, 0, Math.PI*2); ctx.fillStyle = '#7c3aed'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
                ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(n.x + (n.tx-n.x)*0.25, n.y + (n.ty-n.y)*0.25); ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 2; ctx.stroke();
            });
        }

        // =====================================================
        // GENERALIZED LESSON PLAYER (reusable across all content modules)
        // ---------------------------------------------------------------
        // One init per module via a small config object. Reuses the EXISTING
        // progress system: saveProgress(module, key, true), localProgress,
        // calcModuleProgress, and the injected prog-cb-<module>-<key> checkboxes.
        // No second progress store is created — keyed lessons tick the same
        // dashboard keys; un-keyed (foundation) lessons are view-tracked only.
        //
        // The Mitigation module is the reference instance (prefix 'mit'); it is
        // registered below with the exact same 15-page list (0-14), denominator
        // of 7, short quiz (quizQuestions 10-19), completion screen, and the
        // floorPlanCanvas redraw hook it used before generalization.
        //
        // Element id convention (per module prefix P):
        //   #P-player #P-progress-fill #P-progress-label #P-menu #P-menu-overlay
        //   #P-menu-list #P-menu-item-<i> #P-content #P-lesson-<i> #P-back #P-next
        //   #P-quiz-stage #P-complete-score
        // =====================================================
        const LP = {};                       // prefix -> instance state
        const LP_SECTION_TO_PREFIX = {};      // nav section id -> player prefix

        function lpRegister(cfg) {
            cfg.quizCount = cfg.quizCount || 5;
            cfg.hooks = cfg.hooks || {};
            cfg.quizIndex = cfg.hasQuiz ? cfg.lessons.length : -1;
            cfg.endIndex  = cfg.lessons.length + (cfg.hasQuiz ? 1 : 0);
            LP[cfg.prefix] = {
                cfg: cfg, current: 0, viewed: {}, menuBuilt: false,
                quizSet: [], quizIdx: 0, quizScore: 0, quizAnswered: false, quizDone: false
            };
            if (cfg.section) LP_SECTION_TO_PREFIX[cfg.section] = cfg.prefix;
        }

        // A lesson is "complete" when its progress key is saved (keyed lessons),
        // or once it has been viewed (foundation / un-keyed lessons).
        function lpIsComplete(p, i) {
            const st = LP[p]; if (!st) return false;
            const L = st.cfg.lessons;
            if (i < 0 || i >= L.length) return false;
            const key = L[i].key;
            if (key) return !!localProgress[getProgressKey(st.cfg.module, key)];
            return !!st.viewed[i];
        }

        function lpBuildMenu(p) {
            const st = LP[p]; if (!st) return;
            const list = document.getElementById(p + '-menu-list');
            if (!list) return;
            list.innerHTML = '';
            st.cfg.lessons.forEach(function(les, i) {
                const li = document.createElement('li');
                li.className = 'lp-menu-item';
                li.id = p + '-menu-item-' + i;
                li.setAttribute('role', 'button');
                li.setAttribute('tabindex', '0');
                li.setAttribute('onclick', "lpGoTo('" + p + "', " + i + ", true)");
                li.innerHTML = '<span class="lp-menu-num"></span>' +
                               '<span class="lp-menu-label">' + les.title + '</span>' +
                               '<span class="lp-menu-check">✓</span>';
                list.appendChild(li);
            });
            st.menuBuilt = true;
        }

        function lpRefreshMenu(p) {
            const st = LP[p]; if (!st) return;
            st.cfg.lessons.forEach(function(les, i) {
                const li = document.getElementById(p + '-menu-item-' + i);
                if (!li) return;
                li.classList.toggle('is-current', i === st.current);
                li.classList.toggle('is-complete', lpIsComplete(p, i));
            });
            // Progress bar mirrors the dashboard denominator (keyed steps only).
            const prog = (typeof calcModuleProgress === 'function')
                ? calcModuleProgress(st.cfg.module) : { done: 0, total: 0, pct: 0 };
            const fill = document.getElementById(p + '-progress-fill');
            const lbl  = document.getElementById(p + '-progress-label');
            if (fill) fill.style.width = prog.pct + '%';
            if (lbl)  lbl.textContent = prog.done + '/' + prog.total;
        }

        function lpGoTo(p, i, fromMenu) {
            const st = LP[p]; if (!st) return;
            const cfg = st.cfg;
            if (typeof i !== 'number' || isNaN(i)) i = 0;
            if (i < 0) i = 0;
            if (i > cfg.endIndex) i = cfg.endIndex;
            st.current = i;

            const panels = document.querySelectorAll('#' + p + '-content .lp-lesson');
            panels.forEach(function(panel) {
                const idx = parseInt(panel.getAttribute('data-lesson'), 10);
                const active = (idx === i);
                panel.hidden = !active;
                panel.classList.toggle('active', active);
                if (active) {
                    // Auto-open every accordion inside the active lesson (no click-to-expand).
                    panel.querySelectorAll('.detail-expansion').forEach(function(d) {
                        d.classList.add('is-open');
                    });
                }
            });

            // Foundation lessons count as complete once viewed.
            if (i < cfg.lessons.length && !cfg.lessons[i].key) st.viewed[i] = true;

            // Per-lesson hooks (e.g. (re)draw a canvas now that it is visible).
            if (cfg.hooks[i]) { try { cfg.hooks[i](); } catch (e) { console.error(e); } }

            // Short wrap-up quiz and completion screen drive their own flow.
            if (cfg.hasQuiz && i === cfg.quizIndex) lpQuizBuild(p);
            if (i === cfg.endIndex) lpRenderCompletion(p);

            const back = document.getElementById(p + '-back');
            const next = document.getElementById(p + '-next');
            if (back) back.disabled = (i === 0);
            if (next) {
                // Hide the player Next on the quiz + completion steps — those screens
                // advance via their own buttons (quiz "Continue", cert/Cortex CTAs).
                const hideFrom = cfg.hasQuiz ? cfg.quizIndex : cfg.endIndex;
                if (i >= hideFrom) {
                    next.style.display = 'none';
                } else {
                    next.style.display = '';
                    next.textContent = (i === cfg.lessons.length - 1) ? 'Finish' : 'Next';
                }
            }

            lpRefreshMenu(p);
            if (fromMenu) lpCloseMenu(p);
            const content = document.getElementById(p + '-content');
            if (content) content.scrollTop = 0;
            window.scrollTo(0, 0);
        }

        function lpNext(p) {
            const st = LP[p]; if (!st) return;
            const cfg = st.cfg;
            // Completing a keyed lesson writes through the EXISTING progress mechanism.
            if (st.current < cfg.lessons.length) {
                const key = cfg.lessons[st.current].key;
                if (key) {
                    const cb = document.getElementById('prog-cb-' + cfg.module + '-' + key);
                    if (cb && !cb.checked) cb.checked = true; // keep injected checkbox in sync
                    saveProgress(cfg.module, key, true);       // idempotent — no double count
                } else {
                    st.viewed[st.current] = true;
                }
            }
            lpGoTo(p, st.current + 1, false);
        }

        function lpPrev(p) { const st = LP[p]; if (st) lpGoTo(p, st.current - 1, false); }

        function lpToggleMenu(p) {
            const menu = document.getElementById(p + '-menu');
            const ov = document.getElementById(p + '-menu-overlay');
            if (!menu) return;
            const open = menu.classList.toggle('is-open');
            if (ov) ov.classList.toggle('is-open', open);
        }

        function lpCloseMenu(p) {
            const menu = document.getElementById(p + '-menu');
            const ov = document.getElementById(p + '-menu-overlay');
            if (menu) menu.classList.remove('is-open');
            if (ov) ov.classList.remove('is-open');
        }

        function lpInit(p) {
            const st = LP[p]; if (!st) return;
            if (!document.getElementById(p + '-player')) return;
            if (!st.menuBuilt) lpBuildMenu(p);
            // Hide the auto-injected duplicate section progress bar — the player shows
            // its own bar driven by the same data (not a 2nd progress system).
            const dupBar = document.getElementById('prog-bar-' + st.cfg.module);
            if (dupBar && dupBar.parentElement && dupBar.parentElement.parentElement) {
                dupBar.parentElement.parentElement.style.display = 'none';
            }
            lpCloseMenu(p);
            lpGoTo(p, st.current || 0, false);
        }

        // ----------------------------------------------------------------------
        // Short end-of-module wrap-up quiz (self-contained in the lesson player).
        // Reuses an EXISTING slice of the shared quizQuestions array — question
        // text, options, correct answer, and feedback are NOT retyped. This is a
        // friendly knowledge check, not a gated exam: it never touches or launches
        // the separate certification engines.
        // ----------------------------------------------------------------------
        function lpQuizBuild(p) {
            const st = LP[p]; if (!st || !st.cfg.hasQuiz) return;
            const sl = st.cfg.quizSlice || [0, 0];
            const pool = (typeof quizQuestions !== 'undefined') ? quizQuestions.slice(sl[0], sl[1]) : [];
            st.quizSet = shuffleArray(pool).slice(0, st.cfg.quizCount).map(shuffleQuestion);
            st.quizIdx = 0;
            st.quizScore = 0;
            st.quizAnswered = false;
            st.quizDone = false;
            lpQuizRender(p);
        }

        function lpQuizRender(p) {
            const st = LP[p]; if (!st) return;
            const stage = document.getElementById(p + '-quiz-stage');
            if (!stage || !st.quizSet.length) return;
            st.quizAnswered = false;
            const total = st.quizSet.length;
            const d = st.quizSet[st.quizIdx];
            let html = '<div class="lp-quiz-meta">' +
                         '<span class="lp-quiz-counter">Question ' + (st.quizIdx + 1) + ' of ' + total + '</span>' +
                         '<span class="lp-quiz-score" id="' + p + '-quiz-score">Score: ' + st.quizScore + '</span>' +
                       '</div>' +
                       '<div class="lp-quiz-question">' + d.q + '</div>' +
                       '<div class="lp-quiz-options">';
            d.o.forEach(function(opt, idx) {
                html += '<button type="button" class="lp-quiz-option" onclick="lpQuizAnswer(\'' + p + '\', ' + idx + ')">' + opt + '</button>';
            });
            html += '</div>' +
                    '<div class="lp-quiz-feedback" id="' + p + '-quiz-feedback" hidden></div>' +
                    '<button type="button" class="lp-quiz-advance" id="' + p + '-quiz-advance" hidden onclick="lpQuizNext(\'' + p + '\')"></button>';
            stage.innerHTML = html;
        }

        function lpQuizAnswer(p, idx) {
            const st = LP[p]; if (!st || st.quizAnswered) return;
            st.quizAnswered = true;
            const d = st.quizSet[st.quizIdx];
            const correct = (idx === d.c);
            if (correct) st.quizScore++;
            const opts = document.querySelectorAll('#' + p + '-quiz-stage .lp-quiz-option');
            opts.forEach(function(b, i) {
                b.style.pointerEvents = 'none';
                if (i === d.c) b.classList.add('correct');
                if (i === idx && !correct) b.classList.add('incorrect');
            });
            const scoreEl = document.getElementById(p + '-quiz-score');
            if (scoreEl) scoreEl.textContent = 'Score: ' + st.quizScore;
            const fb = document.getElementById(p + '-quiz-feedback');
            if (fb) {
                fb.hidden = false;
                fb.className = 'lp-quiz-feedback ' + (correct ? 'correct' : 'incorrect');
                fb.innerHTML = (correct ? '✅ Correct! ' : '❌ Not quite. ') + d.f;
            }
            const adv = document.getElementById(p + '-quiz-advance');
            if (adv) {
                adv.hidden = false;
                adv.textContent = (st.quizIdx === st.quizSet.length - 1) ? 'See your score' : 'Next question';
            }
        }

        function lpQuizNext(p) {
            const st = LP[p]; if (!st) return;
            if (st.quizIdx < st.quizSet.length - 1) {
                st.quizIdx++;
                lpQuizRender(p);
            } else {
                lpQuizShowResult(p);
            }
        }

        function lpQuizShowResult(p) {
            const st = LP[p]; if (!st) return;
            st.quizDone = true;
            const stage = document.getElementById(p + '-quiz-stage');
            if (!stage) return;
            const total = st.quizSet.length;
            stage.innerHTML =
                '<div class="lp-quiz-result">' +
                  '<div class="lp-quiz-result-score">' + st.quizScore + ' / ' + total + '</div>' +
                  '<p class="lp-quiz-result-text">You got ' + st.quizScore + ' of ' + total + ' correct.</p>' +
                  '<div class="lp-quiz-result-actions">' +
                    '<button type="button" class="lp-quiz-retry" onclick="lpQuizBuild(\'' + p + '\')">Try again</button>' +
                    '<button type="button" class="lp-quiz-continue" onclick="lpGoTo(\'' + p + '\', ' + st.cfg.endIndex + ', false)">Continue &rarr;</button>' +
                  '</div>' +
                '</div>';
        }

        // Populate the completion screen with the short-quiz score (if any).
        function lpRenderCompletion(p) {
            const st = LP[p]; if (!st) return;
            const el = document.getElementById(p + '-complete-score');
            if (!el) return;
            const total = st.quizSet.length || st.cfg.quizCount;
            if (st.quizDone) {
                el.textContent = 'Short quiz: you got ' + st.quizScore + ' of ' + total + ' correct.';
            } else {
                el.textContent = 'Short quiz: take the quick check on the previous step to see your score.';
            }
        }

        // ----- Module registrations -------------------------------------------
        // MITIGATION (reference instance). Step 2 is split across THREE pages
        // (Investigation, Vertical Elevation Rule, 4 Corners Photography); only the
        // LAST carries the 'investigation' key so the dashboard ticks once.
        // Denominator stays 7 (PROGRESS_MODULES.mitigation.items).
        lpRegister({
            prefix: 'mit', module: 'mitigation', section: 'mitigation',
            hasQuiz: true, quizSlice: [10, 20], quizCount: 5,
            hooks: { 7: function () { if (typeof drawFloorPlan === 'function') drawFloorPlan(); } },
            lessons: [
                { title: 'Intro & IICRC S500 Foundation',          key: null },
                { title: 'Critical Safety: Asbestos',              key: null },
                { title: 'Water Categories & Classes',             key: null },
                { title: 'The 7-Step Lifecycle (Overview)',        key: null },
                { title: 'Step 1: Arrival & Onboarding',           key: 'work-auth' },
                { title: 'Step 2: Investigation & Documentation',  key: null },
                { title: 'Vertical Elevation Rule',                key: null },
                { title: '4 Corners Photography',                  key: 'investigation' },
                { title: 'Step 3: Ancillary Services & Demolition',key: 'extraction' },
                { title: 'Step 4: Equipment Set',                  key: 'equip-setup' },
                { title: 'Step 5: Daily Monitoring',               key: 'monitoring' },
                { title: 'Step 6: Labor & Scope Capture',          key: 'dry-standard' },
                { title: 'Step 7: Completion & COC',               key: 'tear-down' }
            ]
        });
        // Back-compat: nav() still calls mitInit() for the Mitigation section.
        function mitInit() { lpInit('mit'); }

        // EMPLOYEE ONBOARDING (no short quiz / no cert). Denominator 6. Pages
        // 7-10 are view-tracked (policies, safety, fleet, wrap-up knowledge check).
        lpRegister({
            prefix: 'onb', module: 'onboarding', section: 'onboarding',
            hasQuiz: false,
            lessons: [
                { title: 'Employee Onboarding Overview',           key: null },
                { title: 'Pre-Boarding & Day 1',                   key: 'preboarding' },
                { title: 'Week 1: Foundation',                     key: 'week1' },
                { title: 'Weeks 2-4: Building Skills',             key: 'weeks24' },
                { title: 'Days 31-90: Independence',               key: 'days3190' },
                { title: 'Competency Assessment',                  key: 'assessment' },
                { title: 'Retention & Career Paths',               key: 'retention' },
                { title: 'Workplace Policies & Conduct',           key: null },
                { title: 'Safety Orientation',                     key: null },
                { title: 'Fleet & Vehicle Safety',                 key: null },
                { title: 'Wrap-Up Knowledge Check',                key: null }
            ]
        });

        // TEAM SCALING & LEADERSHIP (no short quiz / no cert). Denominator 6.
        // Completion has no Cortex CTA — the Summary page already carries the
        // VAST + Cortex CTAs. Page 0 hosts kc-team-scaling.
        lpRegister({
            prefix: 'ts', module: 'team-scaling', section: 'team-scaling',
            hasQuiz: false,
            lessons: [
                { title: 'Team Scaling & Leadership Overview',     key: null },
                { title: "The Owner's Dilemma",                    key: 'owner-dilemma' },
                { title: 'Organizational Structure',               key: 'org-structure' },
                { title: 'Systematic Hiring',                      key: 'hiring' },
                { title: 'Training Systems',                       key: 'training-systems' },
                { title: 'Delegation & Systems',                   key: 'delegation' },
                { title: 'Leadership Development',                 key: 'leadership-dev' },
                { title: 'Safety & Fleet Program',                key: null },
                { title: 'Team Scaling Summary',                   key: null }
            ]
        });

        // EXIT STRATEGY & SALE PREP (no short quiz / no cert). Denominator 3.
        // Page 0 hosts kc-exit-strategy.
        lpRegister({
            prefix: 'ex', module: 'exit-strategy', section: 'exit-strategy',
            hasQuiz: false,
            lessons: [
                { title: 'Exit Strategy Overview',                 key: null },
                { title: 'Business Valuation',                     key: 'valuation' },
                { title: 'Sale Preparation',                       key: 'sale-prep' },
                { title: 'Exit Options & Deal Structures',         key: 'exit-options' },
                { title: 'Exit Strategy Summary',                  key: null }
            ]
        });

        // MANAGERIAL DEVELOPMENT (no short quiz / no cert). Denominator 6.
        // kc-mgmt sits on the "Managing in a Restoration Setting" page.
        lpRegister({
            prefix: 'mg', module: 'mgmt-development', section: 'mgmt-development',
            hasQuiz: false,
            lessons: [
                { title: 'Managerial Development Overview',        key: null },
                { title: 'The Promotion Problem',                  key: 'promotion' },
                { title: 'Branch Manager Role',                    key: 'branch-mgr' },
                { title: 'Regional Manager Role',                  key: 'regional-mgr' },
                { title: 'First-Time Manager Training',            key: 'first-time-mgr' },
                { title: 'Restoration-Specific Leadership',        key: 'restoration-leadership' },
                { title: 'Meeting Structure',                      key: 'meetings' }
            ]
        });

        // EMPLOYEE MATURITY MODELS (no short quiz / no cert). Denominator 4.
        // Page 0 hosts det-emm-overview; final page hosts det-emm-implement.
        lpRegister({
            prefix: 'em', module: 'maturity-models', section: 'maturity-models',
            hasQuiz: false,
            lessons: [
                { title: 'Employee Maturity Models Overview',      key: null },
                { title: 'Operations / Field EMM',                 key: 'ops-emm' },
                { title: 'Estimating EMM',                         key: 'estimating-emm' },
                { title: 'Admin / Office EMM',                     key: 'admin-emm' },
                { title: 'Sales / BD EMM',                         key: 'sales-emm' },
                { title: 'Implementing EMMs',                      key: null }
            ]
        });

        // FINANCIAL OPERATIONS (no short quiz — no slice in quizQuestions; no
        // certification). Denominator 5.
        lpRegister({
            prefix: 'fin', module: 'financial', section: 'financial',
            hasQuiz: false,
            lessons: [
                { title: 'Financial Operations Overview',          key: null },
                { title: 'Understanding Business Profitability',   key: 'profitability' },
                { title: 'Margins & Markups',                      key: 'margins' },
                { title: 'Break-Even Analysis & Cash Flow',        key: 'cashflow' },
                { title: 'Pricing Strategy & Value',               key: 'pricing' },
                { title: 'Tax Considerations & Compliance',        key: 'tax' },
                { title: 'Financial Standards',                    key: null }
            ]
        });

        // RECONSTRUCTION (no short quiz — its question bank feeds the separate
        // Ready Certified Contractor certification engine). Completion links to
        // startReconCertificationQuiz. Denominator 5.
        lpRegister({
            prefix: 'rc', module: 'reconstruction', section: 'reconstruction',
            hasQuiz: false,
            lessons: [
                { title: 'Reconstruction Overview',                key: null },
                { title: 'Phase 1: Transition & Handoff',          key: 'transition' },
                { title: 'Phase 2: Estimating & Scope',            key: 'estimating' },
                { title: 'Phase 3: Pre-Construction Planning',     key: 'preconstruction' },
                { title: 'Phase 4: Construction & Sequencing',     key: 'construction' },
                { title: 'Phase 5: Completion & Closeout',         key: 'completion' },
                { title: 'Reconstruction Standards',               key: null }
            ]
        });

        // READINESS & PREP (short quiz = Readiness slice 0-10; rolls into the
        // Ready Certified Technician certification). Page 1 hosts prepChart; resize
        // it once visible so the doughnut sizes to its container.
        lpRegister({
            prefix: 'rd', module: 'readiness', section: 'readiness',
            hasQuiz: true, quizSlice: [0, 10], quizCount: 5,
            hooks: { 1: function () { if (typeof readinessChart !== 'undefined' && readinessChart) readinessChart.resize(); } },
            lessons: [
                { title: 'Readiness & Prep Overview',              key: null },
                { title: 'Rapid Response Status',                  key: 'rapid-response' },
                { title: 'Vehicle Maintenance Protocol',           key: 'vehicle-maint' },
                { title: 'Equipment & Sensor Hygiene',             key: 'equip-hygiene' },
                { title: 'Consumables Inventory',                  key: 'consumables' }
            ]
        });

        // CONTENTS & LOGISTICS (short quiz = Contents slice 20-30; rolls into the
        // Ready Certified Technician certification via startCertificationQuiz).
        lpRegister({
            prefix: 'ct', module: 'contents', section: 'contents',
            hasQuiz: true, quizSlice: [20, 30], quizCount: 5,
            lessons: [
                { title: 'Contents & Logistics Overview',          key: null },
                { title: 'Project Documentation Setup',            key: 'encircle' },
                { title: 'Trailer Safety & Loading',               key: 'trailer' },
                { title: 'Clean Materials & Inventory Control',    key: null }
            ]
        });

        const quizQuestions = [
            // Readiness (1-10)
            { q: "What is the minimum fuel level required for response vehicles at all times?", o: ["1/4 Tank", "1/2 Tank", "3/4 Tank", "Full Tank"], c: 1, f: "Maintain at least 1/2 tank for immediate response capability." },
            { q: "How must vehicles be parked in their assigned spots?", o: ["Nose-in", "Any direction", "Backed-in and Locked", "Parallel"], c: 2, f: "All vehicles must be backed-in, locked, and secured." },
            { q: "How often must the digital vehicle inspection form be completed?", o: ["Daily", "Weekly", "Bi-Weekly", "Monthly"], c: 2, f: "Each vehicle requires a bi-weekly inspection form in Cortex." },
            { q: "In Cortex, where is the digital vehicle inspection form found?", o: ["Contacts", "Adjuster tab", "Documents list", "Journal Notes"], c: 2, f: "The form is located in the Documents list within Cortex." },
            { q: "What Hygiene step is required before bringing fans into a home?", o: ["Check battery", "Remove filter", "Wipe down and clean", "Spray with perfume"], c: 2, f: "All equipment must be clean and hygienic before entering a customer property." },
            { q: "Which part of the vehicle maintenance check includes PSI and tread?", o: ["Oil Level", "Wipers", "Tires", "Lights"], c: 2, f: "Inspect PSI and tread depth visually during maintenance checks." },
            { q: "What is the status requirement for Thermal Cameras in the van?", o: ["Charge only if used", "Functional and calibrated", "Kept in office", "Optional item"], c: 1, f: "Thermal cameras must be functional and calibrated at all times." },
            { q: "Where is the vehicle stocking PAR list physically located?", o: ["On the dashboard", "In the rear door of the van", "In the glovebox", "On Cortex only"], c: 1, f: "The PAR list is posted inside the rear door of the van." },
            { q: "What consumable items are critical for moisture meter maintenance?", o: ["Trash bags", "Nitrile gloves", "Meter pins and batteries", "Ducting"], c: 2, f: "Always keep extra pins and batteries stocked for meters." },
            { q: "What must be confirmed about the van during the Rapid Response check?", o: ["Washed and waxed", "Nose-in parked", "Fully loaded and stocked", "Windows tinted"], c: 2, f: "Rapid Response requires the van to be fully loaded and stocked per the PAR list." },

            // Mitigation (11-20)
            { q: "When must the Work Authorization be signed by the customer?", o: ["After first day", "Before any services begin", "When picking up equipment", "Only on commercial jobs"], c: 1, f: "Work Authorization is the legal trigger required before any physical service starts." },
            { q: "What is the primary goal of the 4-Corner Photography method?", o: ["Take artistic shots", "100% visual coverage of a room", "Check lighting", "Save space in Cortex"], c: 1, f: "Stand in corners and shoot diagonally for 100% coverage." },
            { q: "What moisture reading percentage is considered 'affected'?", o: ["Above 10%", "Above 12%", "Above 16%", "Above 20%"], c: 2, f: "Any reading above 16% is considered affected per IICRC S500." },
            { q: "What is the maximum moisture content level to be logged?", o: ["45%", "60%", "75%", "99%"], c: 1, f: "60% is our highest logged level per industry standards." },
            { q: "If you get a moisture reading of 88%, how do you log it?", o: ["88%", "99%", "60%", "Wet"], c: 2, f: "Readings 60-99% are logged as 60% for data standardization." },
            { q: "What is the first step if you suspect asbestos (popcorn ceiling, floor tiles)?", o: ["Scrape a sample", "STOP WORK IMMEDIATELY", "Drill a test hole", "Wear a Tyvek and continue"], c: 1, f: "Stop work immediately and notify your supervisor per EPA NESHAP regulations." },
            { q: "Where should technicians get recommendations for equipment placement?", o: ["From the customer", "From system recommendations after build", "Trial and error", "Wait for the adjuster"], c: 1, f: "Follow system recommendations once the project is built in the software." },
            { q: "When should demo/removal be completed in the lifecycle?", o: ["Last day of job", "In a timely fashion as to not slow progress", "After dry-out is done", "Only if requested"], c: 1, f: "Timely removal within 48-72 hours is vital for drying progress and mold prevention." },
            { q: "In the lifecycle, what happens immediately after Investigation & Documentation?", o: ["Monitoring", "Equipment Set", "Ancillary Services & Demolition", "Final COC"], c: 2, f: "Extraction and demo happen before equipment is set per IICRC protocol." },
            { q: "How long do you have to enter Cortex notes after leaving a site?", o: ["5 minutes", "15 minutes", "1 hour", "End of day"], c: 1, f: "15 minutes is the standard for documentation accuracy." },

            // Contents (21-30)
            { q: "When should your project documentation tool be initialized on a contents job?", o: ["After completing the job", "Before leaving the job site", "At the office the next day", "When the adjuster requests it"], c: 1, f: "Documentation must be initialized before leaving the site so the Contents team has immediate access to field data." },
            { q: "What is the room setup requirement for contents documentation?", o: ["Syncs automatically from your estimating tool", "Technicians manually document each room", "Adjuster adds rooms remotely", "Office handles room setup"], c: 1, f: "Technicians must manually build the room structure and photograph all contents in place before moving anything." },
            { q: "When must photos of contents be taken for the inventory?", o: ["After packing", "In place and on site", "In the trailer", "At the facility"], c: 1, f: "Photo items exactly as found BEFORE touching them per IICRC S800." },
            { q: "What detailing info is required for electronics and appliances?", o: ["Color and age", "Weight and size", "Make, Model, and Serial #", "Owner name"], c: 2, f: "Serial numbers and model details are critical for insurance detailing." },
            { q: "How should individual items be identified within a contents inventory?", o: ["By color and size only", "Using a unique item or box number in your documentation tool", "By room name only", "No numbering needed"], c: 1, f: "Each item or box should be assigned a unique number in your documentation tool for tracking and chain of custody." },
            { q: "How are packed items typically categorized in a contents inventory?", o: ["Wet/Dry", "Small/Large", "Medium Box or Unboxed Item", "High/Low Value"], c: 2, f: "Categorize packed items as either 'medium box' or 'unboxed item' to standardize inventory tracking." },
            { q: "What info must be on every box and unboxed item tag?", o: ["Job ID only", "Room and Date", "Customer Name & Original Room", "Weight"], c: 2, f: "Labels must identify the owner and origin per tracking protocols." },
            { q: "What is the trailer loading hierarchy?", o: ["Heavy top", "Heavy bottom, Boxes middle, Fragile top", "Fragile bottom", "Random order"], c: 1, f: "Heavy bottom layer provides stable center of gravity and prevents damage." },
            { q: "When should packing materials be exchanged on Fire/Mold jobs?", o: ["Upon arrival at facility", "Once the contents have been processed", "After 1 week", "They are never exchanged"], c: 1, f: "Exchange materials once contents are clean and processed to prevent recontamination." },
            { q: "What is the priority item category in Fire and Mold jobs?", o: ["Glassware", "Furniture", "Textiles", "Electronics"], c: 2, f: "Textiles are top priority to prevent permanent odor absorption." }
        ];

        // Quiz State
        let qIdx = 0, qScore = 0;
        let quizMode = 'practice'; // 'practice' or 'certification'
        let shuffledQuiz = [];
        
        // Fisher-Yates shuffle utility
        function shuffleArray(arr) {
            const a = arr.slice();
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }
        
        // Shuffle options and remap correct answer index
        function shuffleQuestion(q) {
            const correctText = q.o[q.c];
            const shuffledOpts = shuffleArray(q.o);
            const newCorrectIdx = shuffledOpts.indexOf(correctText);
            return { q: q.q, o: shuffledOpts, c: newCorrectIdx, f: q.f };
        }

        function startCertificationQuiz() {
            quizMode = 'certification';
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.getElementById('sec-quiz').classList.remove('hidden');
            document.getElementById('quiz-mode-badge').className = 'quiz-mode-indicator bg-violet-100 text-violet-700';
            document.getElementById('quiz-mode-badge').innerHTML = '🏆 Certification Mode';
            // Restore quiz-box structure in case it was replaced by practice quiz pass/fail screen
            document.getElementById('quiz-box').innerHTML = `
                <div id="quiz-question-area">
                    <div class="flex justify-between items-center mb-8">
                        <span id="quiz-counter" class="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full uppercase tracking-widest">Question 1/30</span>
                        <span id="quiz-score" class="text-xs font-black text-slate-400">Score: 0</span>
                    </div>
                    <h3 id="quiz-q" class="text-2xl font-bold text-slate-800 mb-10 leading-tight">Question goes here?</h3>
                    <div id="quiz-opts" class="space-y-4"></div>
                </div>
                <div id="quiz-feedback" class="mt-10 hidden p-6 rounded-2xl border-2">
                    <p id="quiz-feedback-text" class="text-base font-bold"></p>
                    <button onclick="nextQ()" class="mt-6 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-violet-600 transition shadow-lg">Continue</button>
                </div>`;
            resetQuiz();
            window.scrollTo(0,0);
        }

        function resetQuiz() { 
            qIdx = 0; 
            qScore = 0; 
            shuffledQuiz = shuffleArray(quizQuestions).map(shuffleQuestion);
            loadQ(); 
        }

        function loadQ() {
            const d = shuffledQuiz[qIdx];
            document.getElementById('quiz-counter').innerText = `Question ${qIdx + 1}/${shuffledQuiz.length}`;
            document.getElementById('quiz-score').innerText = `Score: ${qScore}`;
            document.getElementById('quiz-q').innerText = d.q;
            document.getElementById('quiz-feedback').classList.add('hidden');
            const o = document.getElementById('quiz-opts');
            o.innerHTML = '';
            d.o.forEach((opt, idx) => {
                const b = document.createElement('button');
                b.className = "w-full text-left p-5 rounded-xl border-2 border-slate-100 hover:border-violet-400 hover:bg-violet-50 transition-all font-semibold";
                b.innerText = opt;
                b.onclick = () => checkAns(idx);
                o.appendChild(b);
            });
        }

        function checkAns(idx) {
            const d = shuffledQuiz[qIdx];
            const btns = document.querySelectorAll('#quiz-opts button');
            btns.forEach(b => b.disabled = true);
            const feed = document.getElementById('quiz-feedback');
            const feedText = document.getElementById('quiz-feedback-text');
            feed.classList.remove('hidden');
            if (idx === d.c) {
                feed.className = "mt-10 p-6 rounded-2xl bg-green-50 border-green-200 text-green-800 border-2";
                feedText.innerText = "✅ " + d.f;
                btns[idx].classList.add('bg-green-100', 'border-green-500');
                qScore++;
            } else {
                feed.className = "mt-10 p-6 rounded-2xl bg-red-50 border-red-200 text-red-800 border-2";
                feedText.innerText = "❌ Incorrect. " + d.f;
                btns[idx].classList.add('bg-red-100', 'border-red-500');
                btns[d.c].classList.add('bg-green-50', 'border-green-300');
            }
        }

        function nextQ() {
            qIdx++;
            if (qIdx < shuffledQuiz.length) loadQ();
            else showResults();
        }

        function showResults() {
            const total = shuffledQuiz.length;
            const percent = Math.round((qScore/total)*100);
            const pass = percent >= 80;

            if (quizMode === 'practice') {
                if (pass) {
                    document.getElementById('quiz-box').innerHTML = `
                        <div class='py-12 text-center'>
                            <div class='text-6xl mb-4'>✅</div>
                            <h2 class='text-2xl font-bold text-green-600'>Practice Quiz Passed!</h2>
                            <p class='text-slate-500 mt-2'>Final Score: ${qScore}/${total} (${percent}%)</p>
                            
                            <div class="mt-8 p-6 bg-green-50 rounded-xl border-2 border-green-200">
                                <h3 class="font-bold text-green-900 mb-3 text-lg">🎉 You're Ready for Certification!</h3>
                                <p class="text-sm text-green-800 mb-6">You've demonstrated strong knowledge of field operations. Now take the official certification exam to earn your Ready Certified Technician credential.</p>
                                <button onclick="startCertificationQuiz()" class="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl font-bold transition shadow-lg">
                                    Take Certification Exam
                                </button>
                            </div>

                            <button onclick='resetQuiz()' class='mt-6 text-slate-400 text-sm font-bold hover:text-violet-600 underline'>Retake Practice Quiz</button>
                        </div>`;
                } else {
                    document.getElementById('quiz-box').innerHTML = `
                        <div class='py-12 text-center'>
                            <div class='text-6xl mb-4'>📚</div>
                            <h2 class='text-2xl font-bold text-violet-600'>Review Recommended</h2>
                            <p class='text-slate-500 mt-2'>Final Score: ${qScore}/${total} (${percent}%)</p>
                            
                            <div class="mt-8 p-6 bg-violet-50 rounded-xl border-2 border-violet-200">
                                <h3 class="font-bold text-violet-900 mb-3 text-lg">📖 Keep Learning</h3>
                                <p class="text-sm text-violet-800 mb-6">You need 80% or higher to proceed to certification. Review the training materials and try again. Click "More" buttons throughout the platform to dive deeper into each topic.</p>
                                <div class="grid grid-cols-3 gap-3 mb-6">
                                    <button onclick="nav('readiness')" class="bg-white hover:bg-violet-50 text-violet-900 py-3 px-4 rounded-lg font-bold border-2 border-violet-300 transition text-xs">
                                        Review Readiness
                                    </button>
                                    <button onclick="nav('mitigation')" class="bg-white hover:bg-violet-50 text-violet-900 py-3 px-4 rounded-lg font-bold border-2 border-violet-300 transition text-xs">
                                        Review Mitigation
                                    </button>
                                    <button onclick="nav('contents')" class="bg-white hover:bg-violet-50 text-violet-900 py-3 px-4 rounded-lg font-bold border-2 border-violet-300 transition text-xs">
                                        Review Contents
                                    </button>
                                </div>
                                <button onclick="resetQuiz()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition shadow-lg">
                                    Retake Practice Quiz
                                </button>
                            </div>
                        </div>`;
                }
            } else {
                if (pass) {
                    document.getElementById('quiz-box').innerHTML = `
                        <div class='py-12 text-center'>
                            <div class='text-6xl mb-4'>🏆</div>
                            <h2 class='text-3xl font-bold text-violet-600 mb-2'>Certification Earned!</h2>
                            <p class='text-xl font-bold text-slate-800'>Ready Certified Technician</p>
                            <p class='text-slate-500 mt-2'>Final Score: ${qScore}/${total} (${percent}%)</p>
                            
                            <div class="mt-8 p-6 bg-violet-50 rounded-xl border-2 border-violet-200">
                                <h3 class="font-bold text-violet-900 mb-3 text-lg">📜 Get Your Certificate</h3>
                                <p class="text-sm text-violet-800 mb-4">Enter your information to generate and download your official Ready Certified Technician certificate.</p>
                                
                                <input type="text" id="cert-name" placeholder="Enter Your Full Name" class="w-full p-3 rounded-lg border-2 border-slate-200 mb-3 focus:border-violet-500 outline-none transition text-center">
                                <input type="text" id="cert-company" placeholder="Company Name (Optional)" class="w-full p-3 rounded-lg border-2 border-slate-200 mb-4 focus:border-violet-500 outline-none transition text-center">
                                
                                <button onclick="generateCertificate()" class="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl font-bold transition shadow-lg mb-3">
                                    📥 Download Certificate PDF
                                </button>
                                
                                <button onclick="emailResults()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold transition shadow-lg">
                                    📧 Email Results to Supervisor
                                </button>
                            </div>

                            <button onclick='nav("home")' class='mt-6 text-slate-400 text-sm font-bold hover:text-violet-600 underline'>Return to Home</button>
                        </div>`;
                } else {
                    document.getElementById('quiz-box').innerHTML = `
                        <div class='py-12 text-center'>
                            <div class='text-6xl mb-4'>❌</div>
                            <h2 class='text-2xl font-bold text-red-600'>Certification Not Passed</h2>
                            <p class='text-slate-500 mt-2'>Final Score: ${qScore}/${total} (${percent}%)</p>
                            
                            <div class="mt-8 p-6 bg-red-50 rounded-xl border-2 border-red-200">
                                <h3 class="font-bold text-red-900 mb-3 text-lg">📖 Additional Study Required</h3>
                                <p class="text-sm text-red-800 mb-6">You need 80% or higher to earn certification. Review the training materials thoroughly and take the practice quiz before attempting certification again.</p>
                                <div class="grid grid-cols-3 gap-3 mb-6">
                                    <button onclick="nav('readiness')" class="bg-white hover:bg-red-50 text-red-900 py-3 px-4 rounded-lg font-bold border-2 border-red-300 transition text-xs">
                                        Review Readiness
                                    </button>
                                    <button onclick="nav('mitigation')" class="bg-white hover:bg-red-50 text-red-900 py-3 px-4 rounded-lg font-bold border-2 border-red-300 transition text-xs">
                                        Review Mitigation
                                    </button>
                                    <button onclick="nav('contents')" class="bg-white hover:bg-red-50 text-red-900 py-3 px-4 rounded-lg font-bold border-2 border-red-300 transition text-xs">
                                        Review Contents
                                    </button>
                                </div>
                                <button onclick="quizMode='practice'; resetQuiz()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition shadow-lg">
                                    Return to Practice Mode
                                </button>
                            </div>
                        </div>`;
                }
            }
        }

        function generateCertificate() {
            const name = document.getElementById('cert-name').value;
            const company = document.getElementById('cert-company').value;
            
            if(!name) {
                alert("Please enter your full name to generate the certificate.");
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Border
            doc.setDrawColor(124, 58, 237);
            doc.setLineWidth(3);
            doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
            doc.setDrawColor(167, 139, 250);
            doc.setLineWidth(1);
            doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

            // Header
            doc.setFontSize(16);
            doc.setTextColor(100, 116, 139);
            doc.text('READY FIELD OPERATIONS HUB', pageWidth / 2, 30, { align: 'center' });

            // Title
            doc.setFontSize(36);
            doc.setTextColor(124, 58, 237);
            doc.setFont(undefined, 'bold');
            doc.text('Certificate of Completion', pageWidth / 2, 50, { align: 'center' });

            // Divider
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.5);
            doc.line(60, 55, pageWidth - 60, 55);

            // Text
            doc.setFontSize(14);
            doc.setTextColor(71, 85, 105);
            doc.setFont(undefined, 'normal');
            doc.text('This certifies that', pageWidth / 2, 70, { align: 'center' });

            // Name
            doc.setFontSize(28);
            doc.setTextColor(15, 23, 42);
            doc.setFont(undefined, 'bold');
            doc.text(name, pageWidth / 2, 85, { align: 'center' });

            // Name underline
            doc.setDrawColor(124, 58, 237);
            doc.setLineWidth(0.5);
            const nameWidth = doc.getTextWidth(name);
            doc.line((pageWidth - nameWidth) / 2, 87, (pageWidth + nameWidth) / 2, 87);

            // Company
            let yOffset = 0;
            if (company) {
                doc.setFontSize(12);
                doc.setTextColor(100, 116, 139);
                doc.setFont(undefined, 'italic');
                doc.text(company, pageWidth / 2, 95, { align: 'center' });
                yOffset = 8;
            }

            // Achievement
            doc.setFontSize(14);
            doc.setTextColor(71, 85, 105);
            doc.setFont(undefined, 'normal');
            doc.text('has successfully completed the comprehensive training program and', pageWidth / 2, 100 + yOffset, { align: 'center' });
            doc.text('demonstrated proficiency in restoration field operations by achieving', pageWidth / 2, 108 + yOffset, { align: 'center' });

            // Score badge
            const percent = Math.round((qScore/shuffledQuiz.length)*100);
            doc.setFillColor(124, 58, 237);
            doc.roundedRect(pageWidth / 2 - 20, 114 + yOffset, 40, 12, 3, 3, 'F');
            doc.setFontSize(16);
            doc.setTextColor(255, 255, 255);
            doc.setFont(undefined, 'bold');
            doc.text(`${percent}%`, pageWidth / 2, 122 + yOffset, { align: 'center' });

            // Final text
            doc.setFontSize(14);
            doc.setTextColor(71, 85, 105);
            doc.setFont(undefined, 'normal');
            doc.text('on the Ready Certified Technician examination', pageWidth / 2, 134 + yOffset, { align: 'center' });

            // Certification
            doc.setFontSize(18);
            doc.setTextColor(124, 58, 237);
            doc.setFont(undefined, 'bold');
            doc.text('Ready Certified Technician', pageWidth / 2, 147 + yOffset, { align: 'center' });

            // Date and ID
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const credentialId = 'RCT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.setFont(undefined, 'normal');
            doc.text(`Issued: ${today}`, pageWidth / 2, 162 + yOffset, { align: 'center' });
            doc.text(`Credential ID: ${credentialId}`, pageWidth / 2, 168 + yOffset, { align: 'center' });

            // Footer seal
            doc.setFillColor(124, 58, 237);
            doc.circle(pageWidth / 2, pageHeight - 20, 10, 'F');
            doc.setFontSize(14);
            doc.setTextColor(255, 255, 255);
            doc.text('✓', pageWidth / 2, pageHeight - 16, { align: 'center' });

            doc.save(`Ready_Certified_Technician_${name.replace(/\s+/g, '_')}.pdf`);
        }

        // ── Shared helper: resolve account owner's email from Firestore ──────────
        async function getOwnerEmail() {
            const FALLBACK = '';
            try {
                if (!db || !window.rtUser || !window.rtUser.companyCode) return FALLBACK;
                // If the current user IS the owner, their own email is the answer
                if (window.rtUser.role === 'owner') return window.rtUser.email || FALLBACK;
                // Otherwise query the members subcollection for the owner doc
                const snap = await db
                    .collection('companies')
                    .doc(window.rtUser.companyCode)
                    .collection('members')
                    .where('role', '==', 'owner')
                    .limit(1)
                    .get();
                if (!snap.empty) {
                    const ownerEmail = snap.docs[0].data().email;
                    if (ownerEmail) return ownerEmail;
                }
            } catch(e) {
                console.warn('getOwnerEmail error:', e);
            }
            return FALLBACK;
        }
        // ─────────────────────────────────────────────────────────────────────

        function emailResults() {
            const name = document.getElementById('cert-name').value.trim();
            const company = document.getElementById('cert-company').value.trim();
            
            if(!name) {
                alert("Please enter your name before sending results.");
                return;
            }
            
            const score = qScore;
            const total = shuffledQuiz.length;
            const percent = Math.round((score/total)*100);
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            // Auto-generate and download the certificate PDF first
            generateCertificate();

            // Resolve owner email then open mail client
            getOwnerEmail().then(function(toEmail) {
                setTimeout(function() {
                    const subject = encodeURIComponent(`${name} Just Completed an Exam`);
                    let body = `Hi,%0D%0A%0D%0A`;
                    body += `${name} has just completed the Ready Certified Technician (Mitigation) exam.%0D%0A%0D%0A`;
                    body += `--- EXAM RESULTS ---%0D%0A`;
                    body += `Name: ${name}%0D%0A`;
                    if (company) body += `Company: ${company}%0D%0A`;
                    body += `Exam: Ready Certified Technician — Mitigation%0D%0A`;
                    body += `Score: ${score} / ${total} (${percent}%)%0D%0A`;
                    body += `Result: PASSED%0D%0A`;
                    body += `Date: ${today}%0D%0A%0D%0A`;
                    body += `The certificate PDF has been downloaded to this device. Please attach it to this email before sending.%0D%0A%0D%0A`;
                    body += `— Ready Training Platform`;
                    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
                }, 800);
            });
        }

        // ============================================
        // RECONSTRUCTION QUIZ SYSTEM
        // ============================================


        // SIMPLE DIRECT QUIZ LOADER - bypasses all other logic
        function startReconQuiz() {
            console.log('=== STARTING RECONSTRUCTION QUIZ ===');
            
            // Hide all sections
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            
            // Show quiz section
            const quizSection = document.getElementById('sec-recon-quiz');
            if (!quizSection) {
                console.error('Quiz section not found!');
                return;
            }
            quizSection.classList.remove('hidden');
            
            // Set mode
            reconQuizMode = 'practice';
            document.getElementById('recon-quiz-mode-badge').className = 'quiz-mode-indicator bg-blue-100 text-blue-700';
            document.getElementById('recon-quiz-mode-badge').innerHTML = '📝 Practice Mode';
            
            // Reset, shuffle, and load
            reconQIdx = 0;
            reconQScore = 0;
            
            if (!reconQuizQuestions || reconQuizQuestions.length === 0) {
                alert('Error: Quiz questions not loaded. Please refresh the page.');
                return;
            }
            
            shuffledReconQuiz = shuffleArray(reconQuizQuestions).map(shuffleQuestion);
            loadReconQ();
            window.scrollTo(0, 0);
        }

        const reconQuizQuestions = [
            // Transition & Handoff (1-6)
            { q: "What must be verified before transitioning a project from mitigation to reconstruction?", o: ["Drying equipment removed", "Estimate approved", "Customer signed off", "Mitigation completion and source repair"], c: 3, f: "Verify mitigation is complete AND the source of loss is fully repaired before starting reconstruction." },
            { q: "How many days delay between mitigation completion and reconstruction start triggers adjuster scrutiny?", o: ["3 days", "7 days", "14 days", "30 days"], c: 1, f: "Delays of 7+ days trigger insurance adjuster scrutiny and can complicate claims." },
            { q: "What documentation must the mitigation team provide to the reconstruction team?", o: ["Photos only", "Scope only", "Equipment logs only", "Complete reports with moisture readings and photos"], c: 3, f: "Complete documentation including moisture readings, photos, equipment logs, and scope of mitigation performed is required." },
            { q: "Who is responsible for assessing structural integrity after major water or fire damage?", o: ["Insurance adjuster", "Mitigation team", "Reconstruction team", "Building inspector"], c: 2, f: "The Ready Companies reconstruction team assesses structural integrity after major damage." },
            { q: "What is the first step in the reconstruction handoff process per Ready protocols?", o: ["Start estimating", "Contact customer", "Verify mitigation completion", "Order materials"], c: 2, f: "Always verify mitigation completion before proceeding with reconstruction planning." },
            { q: "What percentage of project delays occur during the mitigation-to-reconstruction transition?", o: ["25%", "40%", "Majority", "10%"], c: 2, f: "The majority of project delays and cost overruns occur during this critical transition point." },

            // Estimating Software (7-12)
            { q: "What percentage of insurance claim pricing in North America is controlled by Xactimate?", o: ["50%", "65%", "80%+", "95%"], c: 2, f: "Xactimate controls 80%+ of insurance claim pricing in North America." },
            { q: "What is Xactimate primarily used for in restoration?", o: ["Project management", "Creating insurance estimates", "Customer communication", "Equipment tracking"], c: 1, f: "Xactimate is the industry-standard platform for creating detailed insurance repair estimates." },
            { q: "Besides Xactimate, what other estimating platform do insurance companies commonly use?", o: ["QuickBooks", "Symbility", "Excel", "Cortex"], c: 1, f: "Symbility is the secondary estimating platform used by several major insurance carriers." },
            { q: "How many scope revision cycles are typical before insurance approval?", o: ["1", "2-3", "5-7", "10+"], c: 1, f: "It's typical to go through 2-3 revision cycles with adjusters before reaching agreed scope." },
            { q: "What determines line-item pricing in Xactimate?", o: ["Company preference", "Regional pricing databases", "Customer budget", "Federal guidelines"], c: 1, f: "Xactimate uses regional pricing databases with industry-standard costs per geographic area." },
            { q: "What happens if you rush the scope development process?", o: ["Faster payment", "Better profit", "Incomplete estimates requiring supplements", "Adjuster approval"], c: 2, f: "Rushing scope development results in incomplete estimates that require expensive supplements and delay payment." },

            // Scope Development (13-18)
            { q: "What must be included when revising a scope for insurance approval?", o: ["Highlighted changes", "Line notes explaining reasons", "Customer signature", "Photos only"], c: 1, f: "All scope revisions must include line notes explaining why each item is necessary." },
            { q: "When should customer-requested upgrades be priced and documented?", o: ["After work starts", "During initial estimate", "After insurance approval", "At final walkthrough"], c: 2, f: "Customer upgrades should be priced and documented AFTER insurance scope is agreed upon." },
            { q: "What software format should you request when an adjuster sends their scope?", o: ["PDF", "Word", "ESX (Xactimate)", "Excel"], c: 2, f: "Request ESX format from adjusters so you can directly import their scope into Xactimate for comparison." },
            { q: "What is required before beginning ANY reconstruction work?", o: ["Verbal approval", "Materials delivered", "Initial draw payment received and posted", "Permit application submitted"], c: 2, f: "NEVER begin reconstruction work before the initial draw payment is received and posted - this creates 100% financial risk." },
            { q: "How should customer extras and upgrades be approved?", o: ["Verbal agreement", "Text message", "In writing", "Email without signature"], c: 2, f: "All customer extras and upgrades must be approved in writing to prevent disputes." },
            { q: "What happens if insurance denies coverage for specific scope items?", o: ["Perform work anyway", "Adjuster must explain why and document", "Skip those items", "Argue indefinitely"], c: 1, f: "If coverage is denied, the adjuster must explain why and document the reasoning. Do not perform uncovered work without customer agreement." },

            // Pre-Construction & Permits (19-24)
            { q: "What is the typical initial draw percentage for reconstruction projects?", o: ["10-20%", "30-50%", "70-80%", "100%"], c: 1, f: "Initial draw is typically 30-50% of total project cost to cover materials and initial labor." },
            { q: "Who often holds reconstruction funds and requires inspections before releasing payment?", o: ["Insurance company", "Mortgage company", "Customer", "Building department"], c: 1, f: "Mortgage companies hold insurance proceeds and release funds based on inspection-verified completion milestones." },
            { q: "What happens if you start construction without required permits?", o: ["Nothing", "Small fine", "Stop-work order and potential legal liability", "Delayed inspection"], c: 2, f: "Building without permits results in stop-work orders, failed inspections, and potential legal liability." },
            { q: "What does AHJ stand for in construction permitting?", o: ["Authorized Home Jurisdiction", "Authority Having Jurisdiction", "Approved Housing Joint", "none of these"], c: 1, f: "AHJ stands for Authority Having Jurisdiction - the local building department that enforces codes." },
            { q: "When must building permits be obtained?", o: ["After work starts", "Before starting work per agreed scope", "Only for commercial jobs", "Optional"], c: 1, f: "Building permits must be obtained BEFORE starting any work that requires them per local codes." },
            { q: "What percentage of financial risk does the company assume when starting without initial draw?", o: ["50%", "75%", "100%", "0%"], c: 2, f: "Starting work without initial draw payment creates 100% financial risk for Ready Companies." },

            // Execution & Sequencing (25-28)
            { q: "What must happen before installing drywall?", o: ["Paint is ready", "Flooring ordered", "Rough-in inspections pass", "Customer approves"], c: 2, f: "Rough-in inspections for electrical, plumbing, and HVAC MUST pass before installing drywall." },
            { q: "What is the typical cost of rework when drywall is installed before electrical inspection passes?", o: ["$500-$1,000", "$2,000-$5,000", "$10,000+", "No cost"], c: 1, f: "Installing drywall before inspections pass creates $2,000-$5,000 in rework costs per occurrence." },
            { q: "When should subcontractors be paid?", o: ["Upon arrival", "After work verification 100% complete", "50% upfront", "Weekly"], c: 1, f: "Ready Companies pays subcontractors ONLY after 100% work verification to ensure quality." },
            { q: "What liability exposure exists per incident when subcontractor insurance certificates lapse?", o: ["$5,000-$10,000", "$50,000-$500,000", "$1,000-$5,000", "No exposure"], c: 1, f: "Lapsed insurance certificates create liability exposure averaging $50,000-$500,000 per incident." },

            // Completion & Closeout (29-30)
            { q: "What is required to release depreciation from the insurance company?", o: ["Customer request", "Completion letter and final photos with final scope", "Initial estimate", "Verbal confirmation"], c: 1, f: "Depreciation release requires final scope with supplements, Certificate of Completion, and final photos." },
            { q: "When should warranty information be provided to the customer?", o: ["Upon request only", "At project completion", "Never", "Only if issues arise"], c: 1, f: "Warranty information for workmanship and materials should be provided at project completion." }
        ];

        let reconQIdx = 0, reconQScore = 0;
        let shuffledReconQuiz = [];


        // Knowledge Check Quiz Handler
        function checkKnowledge(quizId, selectedOption, correctOption, feedback) {
            const quiz = document.getElementById(quizId);
            if (!quiz) return;
            
            const options = quiz.querySelectorAll('.knowledge-check-option');
            const feedbackDiv = quiz.querySelector('.knowledge-check-feedback');
            
            // Disable all options
            options.forEach(opt => {
                opt.style.pointerEvents = 'none';
                opt.style.cursor = 'not-allowed';
            });
            
            // Mark selected
            options[selectedOption].classList.add(selectedOption === correctOption ? 'correct' : 'incorrect');
            
            // Show correct answer if wrong
            if (selectedOption !== correctOption) {
                options[correctOption].classList.add('correct');
            }
            
            // Show feedback
            feedbackDiv.style.display = 'block';
            feedbackDiv.className = 'knowledge-check-feedback ' + (selectedOption === correctOption ? 'correct' : 'incorrect');
            feedbackDiv.innerHTML = (selectedOption === correctOption ? '✅ Correct! ' : '❌ Incorrect. ') + feedback;
        }

        let reconQuizMode = 'practice'; // 'practice' or 'certification'

        function resetReconQuiz() { reconQIdx = 0; reconQScore = 0; shuffledReconQuiz = shuffleArray(reconQuizQuestions).map(shuffleQuestion); loadReconQ(); }

        function startReconCertificationQuiz() {
            reconQuizMode = 'certification';
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.getElementById('sec-recon-quiz').classList.remove('hidden');
            document.getElementById('recon-quiz-mode-badge').className = 'quiz-mode-indicator bg-violet-100 text-violet-700';
            document.getElementById('recon-quiz-mode-badge').innerHTML = '🏆 Certification Mode';
            resetReconQuiz();
            window.scrollTo(0,0);
        }

        function loadReconQ() {
            if (!shuffledReconQuiz || shuffledReconQuiz.length === 0) {
                document.getElementById('recon-quiz-q').innerText = 'Error: Questions not loaded. Please refresh the page.';
                return;
            }
            
            if (reconQIdx >= shuffledReconQuiz.length) {
                showReconResults();
                return;
            }
            
            const d = shuffledReconQuiz[reconQIdx];
            document.getElementById('recon-quiz-counter').innerText = `Question ${reconQIdx + 1}/${shuffledReconQuiz.length}`;
            document.getElementById('recon-quiz-score').innerText = `Score: ${reconQScore}`;
            document.getElementById('recon-quiz-q').innerText = d.q;
            document.getElementById('recon-quiz-feedback').classList.add('hidden');
            const o = document.getElementById('recon-quiz-opts');
            o.innerHTML = '';
            d.o.forEach((opt, idx) => {
                const b = document.createElement('button');
                b.className = "w-full text-left p-5 rounded-xl border-2 border-slate-100 hover:border-violet-400 hover:bg-violet-50 transition-all font-semibold";
                b.innerText = opt;
                b.onclick = () => checkReconAns(idx);
                o.appendChild(b);
            });
        }

        function checkReconAns(idx) {
            const d = shuffledReconQuiz[reconQIdx];
            const btns = document.querySelectorAll('#recon-quiz-opts button');
            btns.forEach(b => b.disabled = true);
            const feed = document.getElementById('recon-quiz-feedback');
            const feedText = document.getElementById('recon-quiz-feedback-text');
            feed.classList.remove('hidden');
            if (idx === d.c) {
                feed.className = "mt-10 p-6 rounded-2xl bg-green-50 border-green-200 text-green-800 border-2";
                feedText.innerText = "✅ " + d.f;
                btns[idx].classList.add('bg-green-100', 'border-green-500');
                reconQScore++;
            } else {
                feed.className = "mt-10 p-6 rounded-2xl bg-red-50 border-red-200 text-red-800 border-2";
                feedText.innerText = "❌ Incorrect. " + d.f;
                btns[idx].classList.add('bg-red-100', 'border-red-500');
                btns[d.c].classList.add('bg-green-50', 'border-green-300');
            }
        }

        function nextReconQ() {
            reconQIdx++;
            if (reconQIdx < shuffledReconQuiz.length) loadReconQ();
            else showReconResults();
        }

        // Test function - can be called from console
        window.testReconQuiz = function() {
            console.log('Testing reconstruction quiz...');
            console.log('1. Questions array:', reconQuizQuestions ? reconQuizQuestions.length + ' questions' : 'NOT FOUND');
            console.log('2. Current index:', reconQIdx);
            console.log('3. Current score:', reconQScore);
            console.log('4. Quiz section exists:', !!document.getElementById('sec-recon-quiz'));
            console.log('5. Question element exists:', !!document.getElementById('recon-quiz-q'));
            console.log('6. Options element exists:', !!document.getElementById('recon-quiz-opts'));
            
            if (reconQuizQuestions && reconQuizQuestions.length > 0) {
                console.log('7. First question preview:', reconQuizQuestions[0].q.substring(0, 50) + '...');
                console.log('8. Attempting to load first question...');
                reconQIdx = 0;
                reconQScore = 0;
                loadReconQ();
                console.log('9. Done! Check if question appeared above.');
            }
        };
        console.log('Test function available: window.testReconQuiz()');
        // Robust quiz initialization - watches for section visibility
        const reconQuizObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const section = document.getElementById('sec-recon-quiz');
                    if (section && !section.classList.contains('hidden')) {
                        console.log('Reconstruction quiz section became visible');
                        // Only load if not already loaded (check if question is still placeholder)
                        const currentQ = document.getElementById('recon-quiz-q').innerText;
                        if (currentQ === 'Question goes here?' || currentQ === '') {
                            console.log('Loading first question...');
                            setTimeout(() => {
                                reconQIdx = 0;
                                reconQScore = 0;
                                loadReconQ();
                            }, 50);
                        }
                    }
                }
            });
        });
        
        // Start observing the quiz section for class changes
        const quizSection = document.getElementById('sec-recon-quiz');
        if (quizSection) {
            reconQuizObserver.observe(quizSection, { attributes: true, attributeFilter: ['class'] });
            console.log('Reconstruction quiz observer initialized');
        }



        function showReconResults() {
            const total = reconQuizQuestions.length;
            const percent = Math.round((reconQScore/total)*100);
            const pass = percent >= 80;

            if (reconQuizMode === 'practice') {
                if (pass) {
                    document.getElementById('recon-quiz-box').innerHTML = `
                        <div class='py-12 text-center'>
                            <div class='text-6xl mb-4'>✅</div>
                            <h2 class='text-2xl font-bold text-green-600'>Practice Quiz Passed!</h2>
                            <p class='text-slate-500 mt-2'>Final Score: ${reconQScore}/${total} (${percent}%)</p>

                <!-- Knowledge Check: Completion -->
                <div class="knowledge-check" id="kc-recon-completion">
                    <div class="knowledge-check-header">
                        <span class="knowledge-check-icon">🧠</span>
                        <span class="knowledge-check-title">Quick Knowledge Check</span>
                    </div>
                    <div class="knowledge-check-question">
                        What is required to release depreciation holdback from the insurance company?
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-completion', 0, 2, 'Verbal confirmation is not sufficient for depreciation release.')">
                        Verbal confirmation from adjuster
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-completion', 1, 2, 'The initial estimate is not what releases depreciation—completion documentation is.')">
                        Original estimate and invoice
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-completion', 2, 2, 'Correct! Depreciation release requires: Certificate of Completion, final photos showing completed work, and final scope with any supplements. This package proves work was completed per agreement.')">
                        Certificate of Completion, final photos, and final scope
                    </div>
                    <div class="knowledge-check-feedback" style="display: none;"></div>
                </div>


                <!-- Knowledge Check: Construction -->
                <div class="knowledge-check" id="kc-recon-construction">
                    <div class="knowledge-check-header">
                        <span class="knowledge-check-icon">🧠</span>
                        <span class="knowledge-check-title">Quick Knowledge Check</span>
                    </div>
                    <div class="knowledge-check-question">
                        What must pass before you can install drywall?
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-construction', 0, 1, 'Customer approval is not the critical prerequisite for drywall installation.')">
                        Customer approval
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-construction', 1, 1, 'Correct! Rough-in inspections (electrical, plumbing, HVAC) must pass before drywall goes up. Installing drywall before inspections pass creates $2,000-$5,000 in rework costs.')">
                        Rough-in inspections
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-construction', 2, 1, 'Material delivery is not the controlling factor. Code compliance is.')">
                        All materials delivered
                    </div>
                    <div class="knowledge-check-feedback" style="display: none;"></div>
                </div>


                <!-- Knowledge Check: Pre-Construction -->
                <div class="knowledge-check" id="kc-recon-preconstruction">
                    <div class="knowledge-check-header">
                        <span class="knowledge-check-icon">🧠</span>
                        <span class="knowledge-check-title">Quick Knowledge Check</span>
                    </div>
                    <div class="knowledge-check-question">
                        What financial risk does the company assume when starting reconstruction work before receiving the initial draw payment?
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-preconstruction', 0, 2, 'Much higher. Starting without payment creates complete financial exposure.')">
                        50% risk
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-preconstruction', 1, 2, 'Close, but it is actually worse. You have zero protection.')">
                        75% risk
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-preconstruction', 2, 2, 'Correct! Starting work without initial draw payment creates 100% financial risk. NEVER begin reconstruction work until payment is received and posted.')">
                        100% risk
                    </div>
                    <div class="knowledge-check-feedback" style="display: none;"></div>
                </div>


                <!-- Knowledge Check: Estimating -->
                <div class="knowledge-check" id="kc-recon-estimating">
                    <div class="knowledge-check-header">
                        <span class="knowledge-check-icon">🧠</span>
                        <span class="knowledge-check-title">Quick Knowledge Check</span>
                    </div>
                    <div class="knowledge-check-question">
                        What percentage of insurance claim pricing in North America is controlled by Xactimate?
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-estimating', 0, 2, 'Much higher. Xactimate dominates the insurance restoration estimating market.')">
                        50%
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-estimating', 1, 2, 'Close, but even higher. Xactimate is the overwhelming industry standard.')">
                        65%
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-estimating', 2, 2, 'Correct! Xactimate controls 80%+ of insurance claim pricing. This is why mastering Xactimate is non-negotiable for reconstruction work.')">
                        80%+
                    </div>
                    <div class="knowledge-check-feedback" style="display: none;"></div>
                </div>


                <!-- Knowledge Check: Reconstruction Transition -->
                <div class="knowledge-check" id="kc-recon-transition">
                    <div class="knowledge-check-header">
                        <span class="knowledge-check-icon">🧠</span>
                        <span class="knowledge-check-title">Quick Knowledge Check</span>
                    </div>
                    <div class="knowledge-check-question">
                        What TWO things must be verified before transitioning from mitigation to reconstruction?
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-transition', 0, 2, 'Customer approval is important but not the first verification step.')">
                        Customer approval and estimate signed
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-transition', 1, 2, 'These are later steps. The critical verification happens first.')">
                        Materials ordered and permit submitted
                    </div>
                    <div class="knowledge-check-option" onclick="checkKnowledge('kc-recon-transition', 2, 2, 'Correct! You must verify mitigation is 100% complete AND the source of loss is fully repaired. Starting reconstruction before these are confirmed creates massive liability.')">
                        Mitigation complete and source repaired
                    </div>
                    <div class="knowledge-check-feedback" style="display: none;"></div>
                </div>

                            
                            <div class="mt-8 p-6 bg-green-50 rounded-xl border-2 border-green-200">
                                <h3 class="font-bold text-green-900 mb-3 text-lg">🎉 You're Ready for Certification!</h3>
                                <p class="text-sm text-green-800 mb-6">You've demonstrated strong knowledge of reconstruction operations. Now take the official certification exam to earn your Ready Certified Contractor credential.</p>
                                <button onclick="startReconCertificationQuiz()" class="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl font-bold transition shadow-lg">
                                    Take Certification Exam
                                </button>
                            </div>

                            <button onclick='resetReconQuiz()' class='mt-6 text-slate-400 text-sm font-bold hover:text-violet-600 underline'>Retake Practice Quiz</button>
                        </div>`;
                } else {
                    document.getElementById('recon-quiz-box').innerHTML = `
                        <div class='py-12 text-center'>
                            <div class='text-6xl mb-4'>📚</div>
                            <h2 class='text-2xl font-bold text-violet-600'>Review Recommended</h2>
                            <p class='text-slate-500 mt-2'>Final Score: ${reconQScore}/${total} (${percent}%)</p>
                            
                            <div class="mt-8 p-6 bg-violet-50 rounded-xl border-2 border-violet-200">
                                <h3 class="font-bold text-violet-900 mb-3 text-lg">📖 Keep Learning</h3>
                                <p class="text-sm text-violet-800 mb-6">You need 80% or higher to proceed to certification. Review the reconstruction training materials and try again. Click "More" buttons throughout the platform to dive deeper into each topic.</p>
                                <div class="mb-6">
                                    <button onclick="nav('reconstruction')" class="w-full bg-white hover:bg-violet-50 text-violet-900 py-3 px-4 rounded-lg font-bold border-2 border-violet-300 transition text-sm mb-3">
                                        Review Reconstruction Training
                                    </button>
                                </div>
                                <button onclick="resetReconQuiz()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition shadow-lg">
                                    Retake Practice Quiz
                                </button>
                            </div>
                        </div>`;
                }
            } else {
                // Certification mode
                if (pass) {
                    document.getElementById('recon-quiz-box').innerHTML = `
                        <div class='py-12 text-center'>
                            <div class='text-6xl mb-4'>🏆</div>
                            <h2 class='text-3xl font-bold text-violet-600 mb-2'>Certification Earned!</h2>
                            <p class='text-xl font-bold text-slate-800'>Ready Certified Contractor</p>
                            <p class='text-slate-500 mt-2'>Final Score: ${reconQScore}/${total} (${percent}%)</p>
                            
                            <div class="mt-8 p-6 bg-violet-50 rounded-xl border-2 border-violet-200">
                                <h3 class="font-bold text-violet-900 mb-3 text-lg">📜 Get Your Certificate</h3>
                                <p class="text-sm text-violet-800 mb-4">Enter your information to generate and download your official Ready Certified Contractor certificate.</p>
                                
                                <input type="text" id="recon-cert-name" placeholder="Enter Your Full Name" class="w-full p-3 rounded-lg border-2 border-slate-200 mb-3 focus:border-violet-500 outline-none transition text-center">
                                <input type="text" id="recon-cert-company" placeholder="Company Name (Optional)" class="w-full p-3 rounded-lg border-2 border-slate-200 mb-4 focus:border-violet-500 outline-none transition text-center">
                                
                                <button onclick="generateReconCertificate()" class="w-full bg-violet-600 hover:bg-violet-700 text-white py-4 rounded-xl font-bold transition shadow-lg mb-3">
                                    📥 Download Certificate PDF
                                </button>
                                
                                <button onclick="emailReconResults()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold transition shadow-lg">
                                    📧 Email Results to Supervisor
                                </button>
                            </div>

                            <button onclick='nav("home")' class='mt-6 text-slate-400 text-sm font-bold hover:text-violet-600 underline'>Return to Home</button>
                        </div>`;
                } else {
                    document.getElementById('recon-quiz-box').innerHTML = `
                        <div class='py-12 text-center'>
                            <div class='text-6xl mb-4'>❌</div>
                            <h2 class='text-2xl font-bold text-red-600'>Certification Not Passed</h2>
                            <p class='text-slate-500 mt-2'>Final Score: ${reconQScore}/${total} (${percent}%)</p>
                            
                            <div class="mt-8 p-6 bg-red-50 rounded-xl border-2 border-red-200">
                                <h3 class="font-bold text-red-900 mb-3 text-lg">📖 Additional Study Required</h3>
                                <p class="text-sm text-red-800 mb-6">You need 80% or higher to earn certification. Review the reconstruction training materials thoroughly and take the practice quiz before attempting certification again.</p>
                                <div class="mb-6">
                                    <button onclick="nav('reconstruction')" class="w-full bg-white hover:bg-red-50 text-red-900 py-3 px-4 rounded-lg font-bold border-2 border-red-300 transition text-sm mb-3">
                                        Review Reconstruction Training
                                    </button>
                                </div>
                                <button onclick="reconQuizMode='practice'; resetReconQuiz()" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold transition shadow-lg">
                                    Return to Practice Mode
                                </button>
                            </div>
                        </div>`;
                }
            }
        }

        function generateReconCertificate() {
            const name = document.getElementById('recon-cert-name').value;
            const company = document.getElementById('recon-cert-company').value;
            
            if(!name) {
                alert("Please enter your full name to generate the certificate.");
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Border
            doc.setDrawColor(124, 58, 237); // Violet-600
            doc.setLineWidth(3);
            doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
            doc.setDrawColor(139, 92, 246); // Violet-400
            doc.setLineWidth(1);
            doc.rect(13, 13, pageWidth - 26, pageHeight - 26);

            // Header
            doc.setFontSize(16);
            doc.setTextColor(100, 116, 139);
            doc.text('READY COMPANIES', pageWidth / 2, 30, { align: 'center' });

            // Title
            doc.setFontSize(36);
            doc.setTextColor(124, 58, 237);
            doc.setFont(undefined, 'bold');
            doc.text('Certificate of Completion', pageWidth / 2, 50, { align: 'center' });

            // Divider
            doc.setDrawColor(203, 213, 225);
            doc.setLineWidth(0.5);
            doc.line(60, 55, pageWidth - 60, 55);

            // Text
            doc.setFontSize(14);
            doc.setTextColor(71, 85, 105);
            doc.setFont(undefined, 'normal');
            doc.text('This certifies that', pageWidth / 2, 70, { align: 'center' });

            // Name
            doc.setFontSize(28);
            doc.setTextColor(15, 23, 42);
            doc.setFont(undefined, 'bold');
            doc.text(name, pageWidth / 2, 85, { align: 'center' });

            // Name underline
            doc.setDrawColor(124, 58, 237);
            doc.setLineWidth(0.5);
            const nameWidth = doc.getTextWidth(name);
            doc.line((pageWidth - nameWidth) / 2, 87, (pageWidth + nameWidth) / 2, 87);

            // Company
            let yOffset = 0;
            if (company) {
                doc.setFontSize(12);
                doc.setTextColor(100, 116, 139);
                doc.setFont(undefined, 'italic');
                doc.text(company, pageWidth / 2, 95, { align: 'center' });
                yOffset = 8;
            }

            // Achievement
            doc.setFontSize(14);
            doc.setTextColor(71, 85, 105);
            doc.setFont(undefined, 'normal');
            doc.text('has successfully completed comprehensive reconstruction training and', pageWidth / 2, 100 + yOffset, { align: 'center' });
            doc.text('demonstrated proficiency in insurance-based reconstruction operations by achieving', pageWidth / 2, 108 + yOffset, { align: 'center' });

            // Score badge
            const percent = Math.round((reconQScore/reconQuizQuestions.length)*100);
            doc.setFillColor(124, 58, 237);
            doc.roundedRect(pageWidth / 2 - 20, 114 + yOffset, 40, 12, 3, 3, 'F');
            doc.setFontSize(16);
            doc.setTextColor(255, 255, 255);
            doc.setFont(undefined, 'bold');
            doc.text(`${percent}%`, pageWidth / 2, 122 + yOffset, { align: 'center' });

            // Final text
            doc.setFontSize(14);
            doc.setTextColor(71, 85, 105);
            doc.setFont(undefined, 'normal');
            doc.text('on the Ready Certified Contractor examination', pageWidth / 2, 134 + yOffset, { align: 'center' });

            // Certification
            doc.setFontSize(18);
            doc.setTextColor(124, 58, 237);
            doc.setFont(undefined, 'bold');
            doc.text('Ready Certified Contractor', pageWidth / 2, 147 + yOffset, { align: 'center' });

            // Date and ID
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const credentialId = 'RCC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            doc.setFont(undefined, 'normal');
            doc.text(`Issued: ${today}`, pageWidth / 2, 162 + yOffset, { align: 'center' });
            doc.text(`Credential ID: ${credentialId}`, pageWidth / 2, 168 + yOffset, { align: 'center' });

            // Footer seal
            doc.setFillColor(124, 58, 237);
            doc.circle(pageWidth / 2, pageHeight - 20, 10, 'F');
            doc.setFontSize(14);
            doc.setTextColor(255, 255, 255);
            doc.text('✓', pageWidth / 2, pageHeight - 16, { align: 'center' });

            doc.save(`Ready_Certified_Contractor_${name.replace(/\s+/g, '_')}.pdf`);
        }

        function emailReconResults() {
            const name = document.getElementById('recon-cert-name').value.trim();
            const company = document.getElementById('recon-cert-company').value.trim();
            
            if(!name) {
                alert("Please enter your name before sending results.");
                return;
            }
            
            const score = reconQScore;
            const total = reconQuizQuestions.length;
            const percent = Math.round((score/total)*100);
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            // Auto-generate and download the certificate PDF first
            generateReconCertificate();

            // Resolve owner email then open mail client
            getOwnerEmail().then(function(toEmail) {
                setTimeout(function() {
                    const subject = encodeURIComponent(`${name} Just Completed an Exam`);
                    let body = `Hi,%0D%0A%0D%0A`;
                    body += `${name} has just completed the Ready Certified Contractor (Reconstruction) exam.%0D%0A%0D%0A`;
                    body += `--- EXAM RESULTS ---%0D%0A`;
                    body += `Name: ${name}%0D%0A`;
                    if (company) body += `Company: ${company}%0D%0A`;
                    body += `Exam: Ready Certified Contractor — Reconstruction%0D%0A`;
                    body += `Score: ${score} / ${total} (${percent}%)%0D%0A`;
                    body += `Result: PASSED%0D%0A`;
                    body += `Date: ${today}%0D%0A%0D%0A`;
                    body += `The certificate PDF has been downloaded to this device. Please attach it to this email before sending.%0D%0A%0D%0A`;
                    body += `— Ready Training Platform`;
                    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
                }, 800);
            });
        }

                window.onload = function() { initCharts(); drawFloorPlan(); nav('home'); };
    
        // Verify quiz on page load
        window.addEventListener('DOMContentLoaded', function() {
            console.log('=== PAGE LOADED - VERIFYING QUIZ ===');
            console.log('reconQuizQuestions array exists:', typeof reconQuizQuestions !== 'undefined');
            if (typeof reconQuizQuestions !== 'undefined') {
                console.log('Number of questions:', reconQuizQuestions.length);
                console.log('First question preview:', reconQuizQuestions[0].q.substring(0, 60) + '...');
            } else {
                console.error('ERROR: reconQuizQuestions array not found!');
            }
            console.log('startReconQuiz function exists:', typeof startReconQuiz !== 'undefined');
            console.log('loadReconQ function exists:', typeof loadReconQ !== 'undefined');
            console.log('Quiz section element exists:', !!document.getElementById('sec-recon-quiz'));
            console.log('=== VERIFICATION COMPLETE ===');
        });

        // ===== MANAGEMENT CERTIFICATION QUIZ =====
        const mgmtQuizQuestions = [
            {q:"What percentage of their time should a Branch Manager spend on people management?",o:["20%","30%","40%","50%"],c:2,f:"People management is the largest domain at 40%. Everything else depends on having a well-managed team."},
            {q:"What is the primary mindset shift when transitioning from individual contributor to manager?",o:["Focus on personal technical skills","Success measured by team output instead of personal output","Working longer hours than the team","Being the most experienced person in the room"],c:1,f:"The key shift is that your success is now measured by your team's output, not your own individual performance."},
            {q:"According to McKinsey research, when do most managers first receive formal leadership training?",o:["Before their first management role","Within the first year","After about 5 years","After about 10 years"],c:3,f:"Shockingly, most managers don't receive formal training until about 10 years into the role — far too late to prevent bad habits."},
            {q:"What is the Employee Maturity Model (EMM) based on the Cardone Ventures framework?",o:["A personality assessment for hiring","A clear roadmap for career advancement with defined competencies at each level","A system for tracking employee attendance","A tool for calculating employee profitability"],c:1,f:"The EMM provides a clear roadmap outlining specific competencies, knowledge, and skills needed to progress through different roles and pay levels."},
            {q:"What are the three components of the employee lifecycle in the EMM framework?",o:["Hire, Train, Fire","Interview, Onboard, Review","Alignment, Development, Transition","Recruit, Retain, Promote"],c:2,f:"Alignment (first 6 months), Development (ongoing growth), and Transition (promotion, lateral move, or exit)."},
            {q:"In the SBI feedback model, what does SBI stand for?",o:["Strengths, Barriers, Improvements","Situation, Behavior, Impact","Skills, Benchmarks, Incentives","Standards, Benchmarks, Implementation"],c:1,f:"SBI (Situation, Behavior, Impact) provides a structured way to deliver both positive and constructive feedback."},
            {q:"What is the recommended on-call management best practice?",o:["Assign it to the newest team members","Make it voluntary with no structure","Create fair rotation schedules published 4+ weeks in advance","Eliminate on-call entirely"],c:2,f:"Fair, transparent rotation schedules published well in advance prevent resentment and ensure equitable distribution of after-hours work."},
            {q:"What is the typical IICRC certification expected at the Technician II level?",o:["OSHA 30-Hour","IICRC WRT (Water Restoration Technician)","Xactimate Certification","Project Management Professional"],c:1,f:"The IICRC WRT certification is the standard expected at the Technician II level, demonstrating water damage restoration competency."},
            {q:"Why is promoting the 'best technician' to manager often a mistake?",o:["Technicians don't want management roles","Technical skills don't translate to people management skills","It leaves a gap in the field crew","Technicians earn more than managers"],c:1,f:"Being excellent at technical work has almost nothing to do with managing people, budgets, and customer relationships. Only about 10% of people naturally possess management skills."},
            {q:"What should a Regional Manager's primary focus be?",o:["Running the largest branch personally","Developing Branch Managers' leadership capabilities","Handling the most complex technical jobs","Managing the company's finances directly"],c:1,f:"The Regional Manager develops the managers who manage the people. Their job is building leadership capability in others."},
            {q:"How often should a manager conduct one-on-one meetings with direct reports?",o:["Monthly","Quarterly","Weekly","Only when there's a problem"],c:2,f:"Weekly one-on-ones (15-30 minutes) are the foundation of effective people management, providing consistent coaching and connection."},
            {q:"What is the recommended duration for the first-time manager development program?",o:["30 days","60 days","90 days","6 months"],c:2,f:"A structured 90-day program covers learning to lead (Days 1-30), building confidence (Days 31-60), and leading confidently (Days 61-90)."},
            {q:"According to the EMM framework, what should be attached to every career level?",o:["A specific job title only","Defined salary ranges and documented competencies","A minimum number of years","A specific certification requirement"],c:1,f:"Every tier should have defined salary ranges (for transparency) and documented competencies (for clarity on what's needed to advance)."},
            {q:"What is the recommended incentive target range according to Cardone Ventures' framework?",o:["5-10% above base salary","10-25% above base salary","25-50% above base salary","50-100% above base salary"],c:1,f:"Cardone Ventures targets 10-25% of additional opportunity above base salary if employees hit their incentive metrics."},
            {q:"How should Employee Maturity Models be introduced to the team?",o:["Mass rollout at an all-hands meeting","Individual conversations through one-on-ones","Email announcement with the document attached","Post it on the break room wall"],c:1,f:"Walk through the EMM individually with each direct report in one-on-ones. Identify their current level, discuss what's needed for advancement, and set a development plan together."},
            {q:"What is the delegation spectrum progression?",o:["Ask, Tell, Do, Review","Tell, Sell, Consult, Agree, Advise, Inquire, Delegate","Observe, Assist, Lead, Own","Plan, Assign, Monitor, Complete"],c:1,f:"The delegation spectrum runs from Tell (most directed) to fully Delegate. New managers almost always under-delegate."},
            {q:"What percentage of a Branch Manager's time should go to strategic planning and reporting?",o:["5%","15%","25%","35%"],c:0,f:"Strategic planning and reporting is about 5% of time — important but the smallest allocation. The majority of time goes to people management (40%)."},
            {q:"What is the key difference between a Branch Manager and a Regional Manager?",o:["Regional Managers earn more","Branch Managers manage people who do the work; Regional Managers develop managers","Regional Managers handle technical work across branches","Branch Managers focus on sales while Regional Managers focus on operations"],c:1,f:"The fundamental shift is from managing individual contributors to developing the managers who manage individuals."},
            {q:"Which of these is a burnout indicator that managers should watch for in their teams?",o:["Asking for more responsibility","Arriving early consistently","Declining documentation quality and increased callouts","Requesting additional training"],c:2,f:"Declining work quality, increased absences, short tempers, and withdrawal are key burnout indicators especially after intense restoration jobs."},
            {q:"In the Operations EMM, what level corresponds to a Project Manager?",o:["Level 2","Level 3","Level 4","Level 5"],c:2,f:"Level 4 is Project Manager — managing full project lifecycle, multiple simultaneous projects, scope negotiation, and job costing."},
            {q:"What should a manager NEVER allow schedule pressure to override?",o:["Customer communication timelines","Documentation upload deadlines","Safety protocols","Billing submission windows"],c:2,f:"Safety is non-negotiable. 'We need to get this done fast' never justifies skipping PPE or ignoring safety protocols. Managers are personally and legally responsible."},
            {q:"According to the pre-promotion development plan, how long should a candidate be given leadership exposure before formalizing a promotion?",o:["1-2 weeks","30 days","60-90 days","6 months"],c:2,f:"Give candidates 60-90 days of leadership exposure — leading projects, running briefings, handling escalations — with coaching support before formalizing any promotion."},
            {q:"What is the primary purpose of weekly safety toolbox talks?",o:["Compliance paperwork","Keeping safety top of mind through focused 5-minute topics","Documenting incidents for insurance","Training new employees on equipment"],c:1,f:"Short, focused safety topics keep safety awareness high across the team. They should be conversational, not just check-the-box exercises."},
            {q:"In the Estimating department EMM, what distinguishes a Senior Estimator from an Estimator I?",o:["Longer tenure","Ability to handle complex reconstruction estimates, TPA compliance, and mentor junior estimators","Higher salary","More certifications"],c:1,f:"Senior Estimators handle complex work, manage TPA relationships, mentor junior staff, and maintain supplement approval rates above 80%."},
            {q:"How often should Employee Maturity Models be reviewed with each team member?",o:["Annually","Semi-annually","Quarterly in one-on-ones","Only at hire and termination"],c:2,f:"Quarterly reviews in one-on-ones keep the EMM active — celebrating advancement, addressing stagnation, and updating development plans."}
        ];

        let mgmtQIdx = 0, mgmtQScore = 0, shuffledMgmtQuiz = [], mgmtQuizMode = 'practice';

        function startMgmtQuiz() {
            mgmtQuizMode = 'practice';
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.getElementById('sec-mgmt-quiz').classList.remove('hidden');
            document.getElementById('mgmt-quiz-mode-badge').className = 'quiz-mode-indicator bg-blue-100 text-blue-700';
            document.getElementById('mgmt-quiz-mode-badge').innerHTML = '📝 Practice Mode';
            resetMgmtQuiz();
            window.scrollTo(0,0);
        }

        function startMgmtCertQuiz() {
            mgmtQuizMode = 'certification';
            document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
            document.getElementById('sec-mgmt-quiz').classList.remove('hidden');
            document.getElementById('mgmt-quiz-mode-badge').className = 'quiz-mode-indicator bg-indigo-100 text-indigo-700';
            document.getElementById('mgmt-quiz-mode-badge').innerHTML = '🏆 Certification Mode';
            resetMgmtQuiz();
            window.scrollTo(0,0);
        }

        function resetMgmtQuiz() { mgmtQIdx = 0; mgmtQScore = 0; shuffledMgmtQuiz = shuffleArray(mgmtQuizQuestions).map(shuffleQuestion); loadMgmtQ(); }

        function loadMgmtQ() {
            if (mgmtQIdx >= shuffledMgmtQuiz.length) { showMgmtResults(); return; }
            const q = shuffledMgmtQuiz[mgmtQIdx];
            const total = mgmtQuizQuestions.length;
            document.getElementById('mgmt-quiz-counter').textContent = `Question ${mgmtQIdx+1}/${total}`;
            document.getElementById('mgmt-quiz-score').textContent = `Score: ${mgmtQScore}`;
            document.getElementById('mgmt-quiz-q').textContent = q.q;
            document.getElementById('mgmt-quiz-feedback').classList.add('hidden');
            document.getElementById('mgmt-quiz-question-area').style.opacity = '1';
            const optDiv = document.getElementById('mgmt-quiz-opts');
            optDiv.innerHTML = '';
            q.o.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.className = 'w-full py-4 px-6 rounded-2xl text-left font-semibold transition border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-700';
                btn.textContent = opt;
                btn.onclick = function() { checkMgmtAnswer(i, q.c, q.f); };
                optDiv.appendChild(btn);
            });
        }

        function checkMgmtAnswer(sel, correct, feedback) {
            const isCorrect = sel === correct;
            if (isCorrect) mgmtQScore++;
            const fb = document.getElementById('mgmt-quiz-feedback');
            const fbText = document.getElementById('mgmt-quiz-feedback-text');
            fb.classList.remove('hidden', 'bg-emerald-50', 'border-emerald-300', 'bg-red-50', 'border-red-300');
            if (isCorrect) {
                fb.classList.add('bg-emerald-50', 'border-emerald-300');
                fbText.innerHTML = `<span class="text-emerald-700">✅ Correct!</span> <span class="text-slate-600 font-normal">${feedback}</span>`;
            } else {
                fb.classList.add('bg-red-50', 'border-red-300');
                fbText.innerHTML = `<span class="text-red-700">❌ Incorrect.</span> <span class="text-slate-600 font-normal">${feedback}</span>`;
            }
            document.getElementById('mgmt-quiz-question-area').style.opacity = '0.3';
        }

        function nextMgmtQ() { mgmtQIdx++; loadMgmtQ(); }

        function showMgmtResults() {
            const total = mgmtQuizQuestions.length;
            const percent = Math.round((mgmtQScore/total)*100);
            const box = document.getElementById('mgmt-quiz-box');
            const passed = percent >= 80;

            if (mgmtQuizMode === 'certification' && passed) {
                box.innerHTML = `
                    <div class="py-12 text-center">
                        <div class="text-6xl mb-4">🏆</div>
                        <h2 class="text-3xl font-black text-indigo-700 mb-2">Management Certification Earned!</h2>
                        <p class="text-xl font-bold text-slate-800">Ready Certified Manager</p>
                        <p class="text-slate-500 mt-2">Final Score: ${mgmtQScore}/${total} (${percent}%)</p>

                        <div class="mt-8 p-6 bg-indigo-50 rounded-xl border-2 border-indigo-200">
                            <h3 class="font-bold text-indigo-900 mb-3 text-lg">📜 Get Your Certificate</h3>
                            <p class="text-sm text-indigo-800 mb-4">Enter your information to generate and download your official Ready Certified Manager certificate.</p>

                            <input type="text" id="mgmt-cert-name" placeholder="Enter Your Full Name" class="w-full p-3 rounded-lg border-2 border-slate-200 mb-3 focus:border-indigo-500 outline-none transition text-center">
                            <input type="text" id="mgmt-cert-company" placeholder="Company Name (Optional)" class="w-full p-3 rounded-lg border-2 border-slate-200 mb-4 focus:border-indigo-500 outline-none transition text-center">

                            <button onclick="generateMgmtCertificate()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold transition shadow-lg mb-3">
                                📥 Download Certificate PDF
                            </button>

                            <button onclick="emailMgmtResults()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold transition shadow-lg">
                                📧 Email Results to Supervisor
                            </button>
                        </div>

                        <button onclick="resetMgmtQuiz()" class="mt-6 text-slate-400 text-sm font-bold hover:text-indigo-600 underline">Retake Quiz</button>
                    </div>`;
            } else if (mgmtQuizMode === 'certification' && !passed) {
                box.innerHTML = `
                    <div class="text-center">
                        <div class="text-6xl mb-4">📚</div>
                        <h2 class="text-3xl font-black text-red-600 mb-2">Not Yet &mdash; Keep Studying!</h2>
                        <p class="text-slate-500 mt-2">Final Score: ${mgmtQScore}/${total} (${percent}%)</p>
                        <p class="text-red-600 font-bold mt-4">You need 80% or higher to earn certification. Review the Managerial Development and Employee Maturity Models modules.</p>
                        <button onclick="resetMgmtQuiz()" class="mt-8 bg-slate-900 text-white py-3 px-8 rounded-xl font-bold hover:bg-indigo-600 transition">Try Again</button>
                    </div>`;
            } else {
                box.innerHTML = `
                    <div class="text-center">
                        <div class="text-6xl mb-4">${percent >= 80 ? '🌟' : '💪'}</div>
                        <h2 class="text-3xl font-black text-slate-800 mb-2">Practice Complete!</h2>
                        <p class="text-slate-500 mt-2">Score: ${mgmtQScore}/${total} (${percent}%)</p>
                        <p class="text-slate-600 mt-4">${percent >= 80 ? 'Great job! You\'re ready for certification mode.' : 'Review the modules and try again to improve your score.'}</p>
                        <div class="flex gap-4 justify-center mt-8">
                            <button onclick="resetMgmtQuiz()" class="bg-slate-200 text-slate-800 py-3 px-6 rounded-xl font-bold hover:bg-slate-300 transition">Practice Again</button>
                            <button onclick="startMgmtCertQuiz()" class="bg-indigo-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-indigo-700 transition">🏆 Certification Mode</button>
                        </div>
                    </div>`;
            }
        }


    
        // ===== MANAGEMENT CERTIFICATE FUNCTIONS =====

        function generateMgmtCertificate() {
            const name = document.getElementById('mgmt-cert-name') ? document.getElementById('mgmt-cert-name').value.trim() : '';
            const company = document.getElementById('mgmt-cert-company') ? document.getElementById('mgmt-cert-company').value.trim() : '';
            if (!name) { alert('Please enter your name to generate the certificate.'); return; }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // Background
            doc.setFillColor(245, 243, 255);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');

            // Border
            doc.setDrawColor(79, 70, 229);
            doc.setLineWidth(3);
            doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'S');
            doc.setLineWidth(1);
            doc.setDrawColor(167, 139, 250);
            doc.rect(12, 12, pageWidth - 24, pageHeight - 24, 'S');

            // Header accent
            doc.setFillColor(79, 70, 229);
            doc.rect(8, 8, pageWidth - 16, 22, 'F');

            // Title
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('READY TRAINING PLATFORM', pageWidth / 2, 22, { align: 'center' });

            // Certificate of completion
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(79, 70, 229);
            doc.text('Certificate of Achievement', pageWidth / 2, 52, { align: 'center' });

            doc.setFontSize(13);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text('This is to certify that', pageWidth / 2, 66, { align: 'center' });

            // Name
            doc.setFontSize(36);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(15, 23, 42);
            doc.text(name, pageWidth / 2, 84, { align: 'center' });

            // Underline
            const nameWidth = doc.getTextWidth(name);
            doc.setDrawColor(79, 70, 229);
            doc.setLineWidth(1);
            doc.line((pageWidth - nameWidth) / 2, 87, (pageWidth + nameWidth) / 2, 87);

            if (company) {
                doc.setFontSize(14);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 116, 139);
                doc.text(company, pageWidth / 2, 96, { align: 'center' });
            }

            doc.setFontSize(14);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(71, 85, 105);
            doc.text('has successfully earned the designation of', pageWidth / 2, company ? 108 : 100, { align: 'center' });

            // Credential title
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(79, 70, 229);
            doc.text('Ready Certified Manager', pageWidth / 2, company ? 122 : 114, { align: 'center' });

            // Score
            const total = mgmtQuizQuestions.length;
            const percent = Math.round((mgmtQScore / total) * 100);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            doc.text(`Final Score: ${mgmtQScore}/${total} (${percent}%)`, pageWidth / 2, company ? 133 : 125, { align: 'center' });

            // Date
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            doc.setFontSize(11);
            doc.text(`Issued: ${today}`, pageWidth / 2, pageHeight - 28, { align: 'center' });

            // Footer seal
            doc.setFillColor(79, 70, 229);
            doc.circle(pageWidth / 2, pageHeight - 14, 10, 'F');
            doc.setFontSize(14);
            doc.setTextColor(255, 255, 255);
            doc.text('✓', pageWidth / 2, pageHeight - 10, { align: 'center' });

            doc.save(`Ready_Certified_Manager_${name.replace(/\s+/g, '_')}.pdf`);
        }

        function emailMgmtResults() {
            const name = document.getElementById('mgmt-cert-name') ? document.getElementById('mgmt-cert-name').value.trim() : '';
            const company = document.getElementById('mgmt-cert-company') ? document.getElementById('mgmt-cert-company').value.trim() : '';

            if (!name) {
                alert('Please enter your name before sending results.');
                return;
            }

            const total = mgmtQuizQuestions.length;
            const percent = Math.round((mgmtQScore / total) * 100);
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            // Auto-generate and download the certificate PDF first
            generateMgmtCertificate();

            // Resolve owner email then open mail client
            getOwnerEmail().then(function(toEmail) {
                setTimeout(function() {
                    const subject = encodeURIComponent(`${name} Just Completed an Exam`);
                    let body = `Hi,%0D%0A%0D%0A`;
                    body += `${name} has just completed the Ready Certified Manager (Management) exam.%0D%0A%0D%0A`;
                    body += `--- EXAM RESULTS ---%0D%0A`;
                    body += `Name: ${name}%0D%0A`;
                    if (company) body += `Company: ${company}%0D%0A`;
                    body += `Exam: Ready Certified Manager — Management%0D%0A`;
                    body += `Score: ${mgmtQScore} / ${total} (${percent}%)%0D%0A`;
                    body += `Result: PASSED%0D%0A`;
                    body += `Date: ${today}%0D%0A%0D%0A`;
                    body += `The certificate PDF has been downloaded to this device. Please attach it to this email before sending.%0D%0A%0D%0A`;
                    body += `— Ready Training Platform`;
                    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
                }, 800);
            });
        }

        // ===== AUTHENTICATION FUNCTIONS =====
        
        // Toggle between login and signup forms
        function toggleAuthForm(mode) {
            const loginForm = document.getElementById('login-form');
            const signupForm = document.getElementById('signup-form');
            
            if (mode === 'signup') {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
            } else {
                signupForm.style.display = 'none';
                loginForm.style.display = 'block';
            }
            
            // Clear errors
            document.getElementById('login-error').style.display = 'none';
            document.getElementById('signup-error').style.display = 'none';
            document.getElementById('signup-success').style.display = 'none';
        }
        
        // Handle login form submission
        async function handleLogin(event) {
            event.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');
            
            try {
                // Check if Memberstack is available
                if (typeof window.$memberstackDom !== 'undefined') {
                    const member = await window.$memberstackDom.loginMemberEmailPassword({
                        email: email,
                        password: password
                    });
                    
                    console.log('Memberstack login successful:', member);
                    hideAuthOverlay();
                } else {
                    // Fallback: Simple local storage authentication for demo
                    console.log('Memberstack not available, using demo mode');
                    const storedUsers = JSON.parse(localStorage.getItem('ready_users') || '{}');
                    
                    if (storedUsers[email] && storedUsers[email].password === password) {
                        localStorage.setItem('ready_auth', JSON.stringify({
                            email: email,
                            name: storedUsers[email].name,
                            loggedIn: true,
                            timestamp: Date.now()
                        }));
                        hideAuthOverlay();
                    } else {
                        throw new Error('Invalid email or password');
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                errorDiv.textContent = error.message || 'Login failed. Please check your credentials.';
                errorDiv.style.display = 'block';
            }
        }
        
        // Handle signup form submission
        async function handleSignup(event) {
            event.preventDefault();
            
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const errorDiv = document.getElementById('signup-error');
            const successDiv = document.getElementById('signup-success');
            
            try {
                // Check if Memberstack is available
                if (typeof window.$memberstackDom !== 'undefined') {
                    const member = await window.$memberstackDom.signupMemberEmailPassword({
                        email: email,
                        password: password,
                        customFields: {
                            name: name
                        }
                    });
                    
                    console.log('Memberstack signup successful:', member);
                    successDiv.textContent = 'Account created successfully! Logging you in...';
                    successDiv.style.display = 'block';
                    
                    setTimeout(() => {
                        hideAuthOverlay();
                    }, 1500);
                } else {
                    // Fallback: Simple local storage authentication for demo
                    console.log('Memberstack not available, using demo mode');
                    const storedUsers = JSON.parse(localStorage.getItem('ready_users') || '{}');
                    
                    if (storedUsers[email]) {
                        throw new Error('An account with this email already exists');
                    }
                    
                    storedUsers[email] = {
                        name: name,
                        password: password,
                        createdAt: Date.now()
                    };
                    
                    localStorage.setItem('ready_users', JSON.stringify(storedUsers));
                    localStorage.setItem('ready_auth', JSON.stringify({
                        email: email,
                        name: name,
                        loggedIn: true,
                        timestamp: Date.now()
                    }));
                    
                    successDiv.textContent = 'Account created successfully! Welcome to Ready!';
                    successDiv.style.display = 'block';
                    
                    setTimeout(() => {
                        hideAuthOverlay();
                    }, 1500);
                }
            } catch (error) {
                console.error('Signup error:', error);
                errorDiv.textContent = error.message || 'Signup failed. Please try again.';
                errorDiv.style.display = 'block';
            }
        }
        
        // Handle Google authentication
        async function handleGoogleAuth(mode) {
            try {
                // Check if Memberstack is available
                if (typeof window.$memberstackDom !== 'undefined') {
                    const member = await window.$memberstackDom.loginWithProvider({
                        provider: 'google'
                    });
                    
                    console.log('Google auth successful:', member);
                    hideAuthOverlay();
                } else {
                    // Fallback: Alert for demo mode
                    alert('Google Sign-In will be available once Memberstack is configured.\n\nFor now, please use email/password to ' + (mode === 'login' ? 'log in' : 'sign up') + '.');
                }
            } catch (error) {
                console.error('Google auth error:', error);
                const errorDiv = mode === 'login' ? document.getElementById('login-error') : document.getElementById('signup-error');
                errorDiv.textContent = 'Google sign-in failed. Please try email/password.';
                errorDiv.style.display = 'block';
            }
        }
        
        // Hide authentication overlay
        function hideAuthOverlay() {
            const overlay = document.getElementById('auth-overlay');
            if (overlay) {
                overlay.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        }
        
        // Show authentication overlay (redirects to main site)
        function showAuthOverlay() {
            window.location.href = 'https://readytraining.app';
        }
        
        // Check authentication status on page load
        function checkAuthStatus() {
            // Check Memberstack first
            if (typeof window.$memberstackDom !== 'undefined') {
                window.$memberstackDom.getCurrentMember()
                    .then(member => {
                        if (member.data) {
                            console.log('User is logged in via Memberstack:', member.data);
                            hideAuthOverlay();
                        } else {
                            console.log('No Memberstack session found');
                            window.location.href = 'https://readytraining.app';
                        }
                    })
                    .catch(error => {
                        console.log('Memberstack check failed:', error);
                        // Fallback to localStorage check
                        checkLocalAuth();
                    });
            } else {
                // Fallback: Check localStorage
                checkLocalAuth();
            }
        }
        
        // Check local storage authentication (fallback)
        function checkLocalAuth() {
            const auth = localStorage.getItem('ready_auth');
            if (auth) {
                const authData = JSON.parse(auth);
                // Check if session is less than 7 days old
                const sevenDays = 7 * 24 * 60 * 60 * 1000;
                if (authData.loggedIn && (Date.now() - authData.timestamp < sevenDays)) {
                    console.log('User is logged in (localStorage):', authData.email);
                    hideAuthOverlay();
                } else {
                    console.log('Session expired');
                    localStorage.removeItem('ready_auth');
                    window.location.href = 'https://readytraining.app';
                }
            } else {
                console.log('No session found');
                window.location.href = 'https://readytraining.app';
            }
        }
        
        // Logout function
        async function logout() {
            try {
                // Clear Memberstack session
                if (typeof window.$memberstackDom !== 'undefined') {
                    await window.$memberstackDom.logout();
                    console.log('Logged out from Memberstack');
                }
                // Clear local storage
                localStorage.removeItem('ready_auth');
                console.log('Local session cleared');
                
                // Redirect to main website
                window.location.href = 'https://readytraining.app';
            } catch (error) {
                console.error('Logout error:', error);
                // Force logout anyway
                localStorage.removeItem('ready_auth');
                window.location.href = 'https://readytraining.app';
            }
        }
        
        // Run auth check when page loads
        window.addEventListener('DOMContentLoaded', checkAuthStatus);
        
        // ===== ROI CALCULATOR FUNCTION =====
        function calculateROI() {
            // Get input values
            const employees = parseFloat(document.getElementById('roi-employees').value) || 0;
            const wage = parseFloat(document.getElementById('roi-wage').value) || 0;
            const hoursSaved = parseFloat(document.getElementById('roi-hours-saved').value) || 0;
            const onboardingWeeks = parseFloat(document.getElementById('roi-onboarding').value) || 0;
            const errorSavings = parseFloat(document.getElementById('roi-errors').value) || 0;
            const platformCost = parseFloat(document.getElementById('roi-cost').value) || 0;
            
            // Calculate monthly savings components
            // 1. Time saved: hours per week × 4.33 weeks/month × employees × wage
            const timeSavingsMonthly = hoursSaved * 4.33 * employees * wage;
            
            // 2. Onboarding reduction: weeks saved × 40 hrs/week × wage × (employees/12 months)
            // Assumes you hire throughout the year, so divide employees by 12
            const onboardingSavingsMonthly = (onboardingWeeks * 40 * wage * employees) / 12;
            
            // 3. Error reduction (already monthly)
            const errorSavingsMonthly = errorSavings;
            
            // Total value created
            const totalMonthlyValue = timeSavingsMonthly + onboardingSavingsMonthly + errorSavingsMonthly;
            
            // Net savings (after platform cost)
            const netMonthlySavings = totalMonthlyValue - platformCost;
            const netAnnualSavings = netMonthlySavings * 12;
            
            // ROI multiple (annual savings / annual cost)
            const annualCost = platformCost * 12;
            const roiMultiple = annualCost > 0 ? (netAnnualSavings / annualCost) : 999;
            
            // Update UI
            document.getElementById('roi-monthly-savings').textContent = '$' + Math.round(netMonthlySavings).toLocaleString();
            document.getElementById('roi-annual-savings').textContent = '$' + Math.round(netAnnualSavings).toLocaleString();
            document.getElementById('roi-multiple').textContent = roiMultiple.toFixed(1) + 'x';
            
            document.getElementById('roi-time-value').textContent = '$' + Math.round(timeSavingsMonthly).toLocaleString() + '/mo';
            document.getElementById('roi-onboarding-value').textContent = '$' + Math.round(onboardingSavingsMonthly).toLocaleString() + '/mo';
            document.getElementById('roi-error-value').textContent = '$' + Math.round(errorSavingsMonthly).toLocaleString() + '/mo';
            document.getElementById('roi-total-value').textContent = '$' + Math.round(totalMonthlyValue).toLocaleString();
            document.getElementById('roi-platform-cost').textContent = '-$' + Math.round(platformCost).toLocaleString();
            document.getElementById('roi-net-savings').textContent = '$' + Math.round(netMonthlySavings).toLocaleString();
            
            // Update interpretation
            let interpretation = '';
            if (roiMultiple >= 10) {
                interpretation = `Excellent ROI! For every dollar invested, you're getting back $${roiMultiple.toFixed(1)}. This represents ${Math.round(roiMultiple * 100)}% return—dramatically outperforming any traditional investment. Standardized training is delivering massive value to your company.`;
            } else if (roiMultiple >= 5) {
                interpretation = `Strong ROI! You're generating ${roiMultiple.toFixed(1)}x return on your training investment. This ${Math.round(roiMultiple * 100)}% return significantly exceeds typical business investments and demonstrates clear value from process standardization.`;
            } else if (roiMultiple >= 2) {
                interpretation = `Positive ROI! Your training platform is generating ${roiMultiple.toFixed(1)}x return. Every dollar invested returns $${roiMultiple.toFixed(1)}, proving that standardized processes create measurable value for your business.`;
            } else if (roiMultiple >= 1) {
                interpretation = `Break-even ROI. Your investment is generating ${roiMultiple.toFixed(1)}x return. While positive, there may be opportunities to increase adoption or optimize training workflows to boost returns.`;
            } else if (annualCost === 0) {
                interpretation = `With Ready's free platform, you're capturing $${Math.round(netAnnualSavings).toLocaleString()} in annual value at zero cost! This represents pure value creation through standardized training and process documentation.`;
            } else {
                interpretation = `Current ROI is ${roiMultiple.toFixed(1)}x. Consider increasing training adoption, reducing platform costs, or focusing on high-impact areas (onboarding, error reduction) to improve returns.`;
            }
            
            document.getElementById('roi-interpretation').textContent = interpretation;
            
            // Show results
            document.getElementById('roi-results').style.display = 'block';
            
            // Scroll to results
            document.getElementById('roi-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        window.addEventListener('DOMContentLoaded', setupROICalculator);

    

        
        // Calculate on input change
        function setupROICalculator() {
            // ROI calculator is set up to only calculate when button is clicked
            // No auto-calculation on input changes
            // Button has onclick="calculateROI()" already
        }

    
                // ===== TEMPLATE DOWNLOAD FUNCTION =====
        function downloadTemplate(templateId) {
            const templates = window.readyTemplates || {};
            const template = templates[templateId];
            
            if (!template) {
                alert('This template is being finalized and will be available soon!');
                return;
            }
            
            // Clean text function to remove problematic characters
            function cleanText(text) {
                return text
                    // Replace tabs with spaces
                    .replace(/\t/g, '    ')
                    // Remove carriage returns
                    .replace(/\r/g, '')
                    // Replace smart quotes with regular quotes
                    .replace(/[\u2018\u2019]/g, "'")
                    .replace(/[\u201C\u201D]/g, '"')
                    // Replace em/en dashes with regular dashes
                    .replace(/[\u2013\u2014]/g, '-')
                    // Replace bullet points with asterisks
                    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '*')
                    // Remove any other non-ASCII characters except common ones
                    .replace(/[^\x20-\x7E\n]/g, '')
                    // Clean up multiple spaces
                    .replace(/  +/g, ' ');
            }
            
            // Create PDF using jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Set up PDF styling
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            const maxWidth = pageWidth - (margin * 2);
            let yPosition = margin;
            
            // Add Ready branding header
            doc.setFillColor(124, 58, 237); // violet-600
            doc.rect(0, 0, pageWidth, 15, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('READY TRAINING PLATFORM', margin, 10);
            
            // Reset text color for content
            doc.setTextColor(0, 0, 0);
            yPosition = 25;
            
            // Clean the content and split into lines
            const cleanedContent = cleanText(template.content);
            const lines = cleanedContent.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // Check if we need a new page
                if (yPosition > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                }
                
                // Detect headers (all caps lines or lines ending with :)
                if (line.trim() === line.toUpperCase() && line.trim().length > 0 && line.trim().length < 60) {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(11);
                    yPosition += 3; // Extra space before headers
                } else if (line.trim().endsWith(':') && line.trim().length < 60) {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10);
                } else {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                }
                
                // Handle long lines by splitting them
                const wrappedLines = doc.splitTextToSize(line || ' ', maxWidth);
                
                for (let j = 0; j < wrappedLines.length; j++) {
                    if (yPosition > pageHeight - margin) {
                        doc.addPage();
                        yPosition = margin;
                    }
                    doc.text(wrappedLines[j], margin, yPosition);
                    yPosition += 5;
                }
            }
            
            // Add footer with page numbers
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }
            
            // Download the PDF
            doc.save(template.name);
        }

        // Template content for downloads
        window.readyTemplates = {
                'water-mitigation-sop': {
                    name: 'Ready_Water_Mitigation_SOP.pdf',
                    content: `READY COMPANIES
WATER MITIGATION STANDARD OPERATING PROCEDURE
Based on IICRC S500 Standards

═══════════════════════════════════════════════════════════

PHASE 1: INITIAL RESPONSE & ASSESSMENT (0-2 Hours)

1.1 EMERGENCY CALL INTAKE
□ Document customer name, address, phone number
□ Record water category (Cat 1, 2, or 3 - ask questions)
□ Estimated square footage affected
□ Source of water if known
□ Insurance information (carrier, claim #, adjuster if available)
□ Safety concerns noted
□ Dispatch closest available team
□ Communicate ETA to customer (within 2 hours target)

1.2 ON-SITE SAFETY ASSESSMENT
□ PPE assessment - determine required protection level
□ Electrical hazards check - standing water + electricity
□ Structural stability evaluation
□ Slip/fall hazards identification
□ Biohazard potential (Category 2/3 water)
□ Document safety concerns in job notes

1.3 SOURCE IDENTIFICATION & ELIMINATION
□ Locate source of water intrusion
□ Shut off water source if possible
□ Document source with photos (subrogation potential)
□ If unable to stop source, coordinate with plumber/specialist
□ Verify source is completely stopped before proceeding

═══════════════════════════════════════════════════════════

PHASE 2: DOCUMENTATION (Critical - Do NOT Skip!)

2.1 PHOTOGRAPHIC DOCUMENTATION
Take minimum 4 photos per affected room (one from each corner):
□ Vehicle on site (logo visible, address visible)
□ Front of property with posted address
□ Origin/source of water loss
□ Close-up of subrogation potential
□ All affected rooms BEFORE mitigation
□ 10-second video of affected area (water movement)
□ Damaged contents "as they lie"
□ Building materials (for estimator grade selection)
□ Material intersections (how installed = cost impact)

2.2 THERMAL IMAGING
□ Scan all walls in affected areas
□ Identify hidden moisture migration
□ Document ceiling moisture if overhead source
□ Check adjacent rooms for moisture travel
□ Save thermal images to job file

2.3 MOISTURE MAPPING
□ Use graph paper or digital sketch
□ Draw room layout with dimensions
□ Mark affected vs unaffected areas
□ Take readings at HIGHEST point showing legitimate number
   (Not just "HIGH" - get actual % reading)
□ Establish DRY STANDARD in unaffected area
□ Record: MC%, meter setting, material type
□ Document: Normal Dry Range _____% to _____%

METER SETTINGS TO USE:
- Setting: MC% (Moisture Content Percentage)
- Material: DRYWALL (for walls), PINE (for subfloor)
- Type: Penetrating for accuracy verification

2.4 SKETCH/FLOOR PLAN
□ Outline of all rooms (affected + continuous flooring)
□ Dimensions of walls (to nearest foot)
□ Ceiling height
□ Room labels
□ Flooring types per room
□ Windows, doors (with swing direction), case openings
□ Door/window measurements
□ Equipment placement with directional arrows
□ Color code: Air movers, Dehus, Air scrubbers, etc.

2.5 JOURNALING
□ Write detailed description of damage
□ Note source and category of water
□ List all affected areas and flooring types
□ Document any customer concerns or requests
□ Record time on site and actions taken

═══════════════════════════════════════════════════════════

PHASE 3: WATER EXTRACTION

3.1 EXCESS WATER REMOVAL
"It is 1,000x easier to physically remove water than evaporate it"

□ Squeegee standing water from hard surfaces
□ Mop excess water from floors
□ Pump standing water from below-grade areas
□ Extract carpet and pad using truck-mount or portable
□ Use specialty extraction tools:
   - Wand extraction (standard)
   - Claw tool (aggressive extraction)
   - Xtreme extraction mat (maximum removal)

3.2 EXTRACTION EFFICIENCY TEST
Perform "weight test" to verify extraction quality:
- Weigh 3 sq ft sample wet
- Weigh 3 sq ft sample after extraction
- Weigh 3 sq ft sample dry
- Calculate gallons remaining per sq ft
- Target: <0.5 gallons remaining per sq ft

□ Document extraction method used
□ Test extraction efficiency
□ Re-extract if efficiency is poor

3.3 DRAINAGE
□ Drain water from wall cavities (drill weep holes if needed)
□ Drain ceiling cavities
□ Check and drain HVAC ductwork if affected
□ Document drainage activities

═══════════════════════════════════════════════════════════

PHASE 4: CONTENT MANAGEMENT

4.1 CONTENT PROTECTION
□ Pick up contents from flooring
□ Hang draperies on hangers
□ Tuck in bedspreads
□ Pin up furniture skirts
□ Hang closet clothes

4.2 FURNITURE BLOCKING
□ Place foam blocks under all furniture feet
□ Move furniture to center of room for airflow
□ Tab furniture edges to prevent staining
□ Elevate furniture minimum 2" off wet surfaces

4.3 PACK-OUT COORDINATION
If entire structure affected:
□ Inventory contents requiring removal
□ Photo document "as they lie"
□ Coordinate off-site storage
□ Complete pack-out inventory forms

═══════════════════════════════════════════════════════════

PHASE 5: STRUCTURE PREPARATION

5.1 CLEANING
□ Edge vacuum all baseboards
□ Wipe baseboards to remove dust
□ Vacuum furniture to prevent dust distribution
□ Remove loose debris from affected areas

5.2 FLOOR ANALYSIS
□ Remove floor registers to inspect subfloor
□ Check thresholds to identify transitions
□ Document: Carpet type, pad type, subfloor layers
□ Note any specialty flooring (hardwood, tile, etc.)

5.3 AIRFLOW OPTIMIZATION
□ Remove interior doors (pull hinge pins)
□ Block and secure removed doors
□ OR leave doors in place to create drying chambers
□ Ensure airflow pathways throughout affected area

═══════════════════════════════════════════════════════════

PHASE 6: EQUIPMENT CALCULATION & PLACEMENT

6.1 DETERMINE WATER LOSS CLASS
Class 1: Minimal water, low porosity materials
Class 2: Entire room carpet/pad, walls wet to 24"
Class 3: Overhead source, everything saturated
Class 4: Low porosity materials (hardwood, concrete, etc.)

6.2 CALCULATE EQUIPMENT NEEDS
Air Movers: 1 per 100-150 sq ft (Class 2)
Dehumidifiers: Based on cubic footage and class
- Class 1: 1 dehu per 500-1000 cu ft
- Class 2: 1 dehu per 300-500 cu ft
- Class 3: 1 dehu per 200-300 cu ft
- Class 4: LGR or desiccant dehus required

6.3 EQUIPMENT PLACEMENT
□ Position air movers for laminar airflow
□ Aim air movers across wet surfaces
□ Angle air movers at 45° toward walls
□ Place dehumidifiers centrally in chamber
□ Ensure dehumidifier exhaust vents outside chamber
□ Position for easy drain hose routing
□ Document all equipment serial numbers
□ Photo document equipment placement

6.4 DRYING CHAMBER SETUP
□ Seal off unaffected areas
□ Close doors/windows in drying chamber
□ Activate HVAC if beneficial
□ Set thermostat to 75-80°F optimal drying
□ Verify negative air pressure in chamber

═══════════════════════════════════════════════════════════

PHASE 7: INITIAL PSYCHROMETRIC READINGS

7.1 RECORD BASELINE DATA
Location readings required:
□ Outside air (temp, RH, GPP)
□ Unaffected area (temp, RH, GPP)
□ Affected area (temp, RH, GPP)
□ HVAC supply (temp, RH, GPP)
□ Dehumidifier exhaust (temp, RH, GPP)

7.2 CALCULATE DRYING GOAL
Goal: Affected area GPP = Unaffected area GPP
Document target GPP: _______

═══════════════════════════════════════════════════════════

PHASE 8: DAILY MONITORING

8.1 DAILY SITE VISIT TASKS
□ Check all equipment function
□ Empty dehumidifier buckets if needed
□ Verify drain hoses flowing
□ Take psychrometric readings (all 5 locations)
□ Take moisture content readings (same locations daily)
□ Photo document moisture meter readings
□ Photo progress of drying
□ Adjust equipment as needed
□ Communicate progress to customer

8.2 MOISTURE CONTENT TRACKING
□ Use same meter settings each visit
□ Take readings at highest legitimate MC% location
□ Do NOT re-penetrate same hole (dry faster)
□ Record readings on moisture map
□ Update job notes with progress

8.3 DOCUMENTATION PER VISIT
□ Daily psychrometric sheet
□ Daily moisture content readings
□ Photos of meter readings (with location reference)
□ Equipment check photos
□ Progress journal entry

═══════════════════════════════════════════════════════════

PHASE 9: COMPLETION & CERTIFICATE OF COMPLETION

9.1 DRY STANDARD VERIFICATION
Materials must reach:
□ Wood: ≤15% MC
□ Drywall: ≤16% MC
□ Concrete: ≤4% MC
□ Psychrometrics: Affected = Unaffected GPP

9.2 FINAL DOCUMENTATION
□ Final moisture content readings all locations
□ Final psychrometric readings
□ Before/after photo comparison
□ Certificate of Completion form
□ Customer signature on COC

9.3 EQUIPMENT REMOVAL
□ Remove all air movers
□ Remove all dehumidifiers
□ Remove all accessories (hoses, cords, etc.)
□ Return furniture to normal placement
□ Clean/vacuum affected areas
□ Rehang doors

9.4 CUSTOMER COMMUNICATION
□ Explain final readings
□ Provide copy of Certificate of Completion
□ Review next steps (reconstruction if needed)
□ Obtain final signature and feedback

═══════════════════════════════════════════════════════════

CRITICAL REMINDERS:

🚨 NEVER use Cat 3 equipment on Cat 1 jobs without decontamination
📸 Insurance will NOT pay for undocumented work
✅ Mitigation must be 100% complete before reconstruction begins
📊 Take readings at HIGHEST point showing legitimate number
🎯 Dry Standard: Establish and document in unaffected area
⏱️ Response time goal: <2 hours from initial call
🔍 When in doubt, call supervisor for guidance

═══════════════════════════════════════════════════════════

This SOP is based on IICRC S500 Standard and Reference Guide for
Professional Water Damage Restoration and Ready Companies best practices.

For questions or clarification, contact your Ready Companies supervisor.

Version 1.0 - Ready Companies Training Platform
`
                },

                'fire-smoke-sop': {
                    name: 'Ready_Fire_Smoke_Restoration_SOP.pdf',
                    content: `READY COMPANIES
FIRE & SMOKE RESTORATION STANDARD OPERATING PROCEDURE
Based on IICRC S520 Standards

═══════════════════════════════════════════════════════════

⚠️ SAFETY FIRST - FULL PPE REQUIRED AT ALL TIMES ⚠️
- Respirator with appropriate filters (P100 minimum)
- Disposable coveralls
- Nitrile gloves (double layer recommended)
- Eye protection
- Boot covers

═══════════════════════════════════════════════════════════

PHASE 1: INITIAL ASSESSMENT & SAFETY

1.1 STRUCTURAL SAFETY INSPECTION
□ Check for structural compromise
□ Look for sagging ceilings or floors
□ Inspect for fire-weakened load-bearing elements
□ Verify electrical safety (shut off if questionable)
□ Check for gas leaks
□ Document all safety concerns
□ DO NOT ENTER if structure is unsafe - call supervisor

1.2 AIR QUALITY ASSESSMENT
□ Check for smoke odor intensity
□ Identify presence of chemical odors
□ Note any respiratory irritation
□ Determine need for air scrubbers immediately
□ Set up negative air if needed

1.3 DAMAGE ASSESSMENT
□ Document extent of fire damage (%)
□ Document extent of smoke damage (%)
□ Document extent of water damage (from firefighting)
□ Identify origin/cause of fire (photos for subrogation)
□ Separate affected from unaffected areas

1.4 PHOTOGRAPHIC DOCUMENTATION
□ 4-corner photos every affected room
□ Close-up photos of fire origin
□ Subrogation potential (appliances, electrical, etc.)
□ Soot/char patterns
□ Smoke migration evidence
□ Water damage from firefighting efforts
□ All damaged contents

═══════════════════════════════════════════════════════════

PHASE 2: EMERGENCY SERVICES

2.1 BOARD-UP & SECURITY
□ Board broken windows
□ Secure damaged doors
□ Tarp damaged roof sections
□ Protect from weather intrusion
□ Protect from theft/vandalism
□ Photo document all security measures
□ Notify customer and adjuster of actions taken

2.2 UTILITY ASSESSMENT
□ Verify electrical safety
□ Check water system integrity
□ Verify gas lines secure
□ Coordinate utility shutoffs if needed
□ Arrange utility repairs as required

═══════════════════════════════════════════════════════════

PHASE 3: CONTENTS EVALUATION

3.1 CONTENT TRIAGE
Sort contents into categories:

SALVAGEABLE - Light Soot:
□ Items with minimal soot deposit
□ No direct fire contact
□ No melting or charring
□ Cleanable materials

SALVAGEABLE - Moderate Soot:
□ Heavy soot but structurally intact
□ No melting or charring
□ Requires professional cleaning

NON-SALVAGEABLE:
□ Charred or melted items
□ Structural damage from fire
□ Contaminated with Category 3 water
□ Cost to clean exceeds replacement value

3.2 PACK-OUT PREPARATION
□ Inventory all items by room
□ Photo document condition codes
□ Apply condition stickers:
   - Green: Light soot
   - Yellow: Moderate soot  
   - Red: Heavy soot/non-salvageable
□ Box and label by room
□ Transport to cleaning facility

═══════════════════════════════════════════════════════════

PHASE 4: STRUCTURE CLEANING - SOOT REMOVAL

4.1 HEPA VACUUMING (First Step - Always!)
□ HEPA vacuum ALL surfaces before any wet cleaning
□ Vacuum walls from top to bottom
□ Vacuum ceilings
□ Vacuum floors
□ Vacuum furniture
□ Vacuum HVAC vents and returns

CRITICAL: Never wet clean before HEPA vacuuming!
Wet soot = permanent staining

4.2 DRY SPONGE CLEANING
□ Use dry chemical sponges on walls
□ Work from top to bottom
□ Use light pressure - don't smear
□ Replace sponge when saturated with soot
□ Dry sponge before any wet cleaning

4.3 WET CLEANING (After dry methods complete)
□ Use appropriate cleaning solution for surface type
□ Test in inconspicuous area first
□ Work in small sections
□ Rinse thoroughly
□ Dry immediately to prevent water damage

4.4 AIR SCRUBBING
□ Deploy HEPA/carbon air scrubbers
□ Position to create negative air pressure
□ Run continuously during cleaning
□ Calculate: 1 air scrubber per 1000-2000 cu ft
□ Exhaust filtered air outside if possible

═══════════════════════════════════════════════════════════

PHASE 5: ODOR MITIGATION

5.1 SOURCE REMOVAL (Most Important!)
□ Remove all charred materials
□ Remove smoke-saturated porous items
□ Seal subfloors if necessary
□ Seal wall cavities if necessary
□ Remove affected insulation

5.2 THERMAL FOGGING
□ Close off treatment area
□ Use appropriate fogging solution
□ Follow manufacturer dwell time
□ Ventilate per instructions
□ May require multiple applications

5.3 OZONE TREATMENT
⚠️ UNOCCUPIED SPACE ONLY - No people, pets, or plants!
□ Seal treatment area completely
□ Remove/protect rubber, leather items
□ Set ozone generator per cubic footage
□ Minimum 24-48 hour treatment
□ Ventilate minimum 2 hours before re-entry
□ Test air quality before allowing occupancy

5.4 HYDROXYL GENERATOR (Safe for Occupied Spaces)
□ Can run while area is occupied
□ Position for maximum air circulation
□ Run continuously for several days
□ Monitor odor levels
□ Safe alternative to ozone

5.5 SEALING ODOR-AFFECTED SURFACES
□ Apply odor-blocking primer/sealer
□ Seal subfloors before new flooring
□ Seal wall surfaces before painting
□ Use shellac-based or specifically formulated sealer
□ Multiple coats may be required

═══════════════════════════════════════════════════════════

PHASE 6: HVAC CLEANING

6.1 DUCT SYSTEM INSPECTION
□ Inspect all supply and return ducts
□ Check for soot contamination
□ Inspect furnace/AC unit
□ Check air handler
□ Document contamination level

6.2 HVAC CLEANING REQUIREMENTS
If soot present in system:
□ Professional duct cleaning required
□ Clean or replace all filters
□ Clean air handler components
□ Clean furnace/AC unit exterior
□ Verify system operation after cleaning
□ Document cleaning completion

═══════════════════════════════════════════════════════════

PHASE 7: STRUCTURAL CLEANING DETAILS

7.1 CEILING CLEANING
□ HEPA vacuum first
□ Dry sponge entire ceiling
□ Spot clean heavy soot areas
□ Wet clean if necessary
□ Apply sealer/primer before painting

7.2 WALL CLEANING
□ HEPA vacuum walls
□ Dry sponge from top to bottom
□ Wet clean with appropriate solution
□ Rinse thoroughly
□ Dry completely
□ Apply sealer before painting

7.3 FLOOR CLEANING
□ HEPA vacuum all flooring
□ Clean per flooring type:
   - Hardwood: specialized wood cleaner
   - Tile: degreaser then neutral cleaner
   - Carpet: professional cleaning or replace
   - Concrete: TSP or specialized cleaner

7.4 CABINET & MILLWORK CLEANING
□ HEPA vacuum all surfaces
□ Remove cabinet doors for easier access
□ Clean interior and exterior
□ Clean hinges and hardware
□ Seal/prime before refinishing

═══════════════════════════════════════════════════════════

PHASE 8: DEMOLITION (If Required)

8.1 DEMOLITION DECISION FACTORS
Remove materials if:
□ Structurally compromised by fire
□ Contaminated beyond cleaning
□ Cost to clean exceeds replacement
□ Retains persistent odor after cleaning attempts
□ Melted or severely charred

8.2 SELECTIVE DEMOLITION PROTOCOL
□ Photo document BEFORE demolition
□ Remove only necessary materials
□ Contain demolition area with plastic
□ Use HEPA vacuum during demo
□ Bag and remove debris properly
□ Photo document AFTER demolition

═══════════════════════════════════════════════════════════

PHASE 9: FINAL STEPS

9.1 POST-CLEANING INSPECTION
□ Visual inspection of all cleaned surfaces
□ Odor test in all areas
□ Air quality verification
□ Touch test for soot residue
□ Customer walkthrough

9.2 SEALING & PROTECTION
□ Apply sealer to all affected surfaces
□ Prime before paint
□ Encapsulate odor sources
□ Protect cleaned areas during reconstruction

9.3 DOCUMENTATION
□ Before/after photos
□ Cleaning methods used
□ Products applied
□ Odor mitigation techniques employed
□ Certificate of Completion
□ Customer signature

═══════════════════════════════════════════════════════════

CRITICAL SAFETY REMINDERS:

🚨 ALWAYS wear full PPE - soot is carcinogenic
🚫 NEVER use ozone in occupied spaces
⚠️ NEVER wet clean before dry cleaning (permanent staining)
🔍 ALWAYS verify structural safety before entry
📸 ALWAYS photo document for subrogation potential
🎯 SOURCE REMOVAL is more important than odor treatment
⏱️ Time is critical - soot etches surfaces quickly

═══════════════════════════════════════════════════════════

DISPOSAL REQUIREMENTS:

Soot-contaminated materials may be hazardous waste.
Check local regulations for proper disposal.
Many areas require manifest for disposal.

═══════════════════════════════════════════════════════════

This SOP is based on IICRC S520 Standard for Professional Mold
Remediation (smoke = soot particulate) and Ready Companies best practices.

For questions or clarification, contact your Ready Companies supervisor.

Version 1.0 - Ready Companies Training Platform
`
                },

                'contents-packout-sop': {
                    name: 'Ready_Contents_PackOut_SOP.pdf',
                    content: `READY COMPANIES
CONTENTS PACK-OUT STANDARD OPERATING PROCEDURE

═══════════════════════════════════════════════════════════

PURPOSE:
This SOP ensures proper documentation, inventory, and handling of
customer contents during pack-out for cleaning or storage during
restoration project.

═══════════════════════════════════════════════════════════

PHASE 1: PRE-PACK-OUT PREPARATION

1.1 CUSTOMER COMMUNICATION
□ Explain pack-out process to customer
□ Obtain signed authorization for pack-out
□ Discuss valuable items and special handling needs
□ Provide timeline for cleaning/storage
□ Explain inventory process
□ Obtain customer contact information

1.2 SAFETY ASSESSMENT
□ Identify fragile items requiring special care
□ Note items requiring professional packing (antiques)
□ Identify hazardous materials (chemicals, etc.)
□ PPE assessment based on damage category

1.3 GATHER SUPPLIES
□ Boxes (various sizes)
□ Packing paper
□ Bubble wrap
□ Packing tape
□ Markers
□ Inventory forms
□ Condition code stickers
□ Camera/tablet for documentation
□ Room labels

═══════════════════════════════════════════════════════════

PHASE 2: PHOTOGRAPHIC DOCUMENTATION

2.1 "AS THEY LIE" PHOTOGRAPHY
Before touching anything:
□ 4-corner photos each affected room
□ Close-ups of damaged items in place
□ Overall room condition shots
□ Items in closets/cabinets (before moving)

CRITICAL: Photos must show condition BEFORE pack-out
This prevents "you broke it" claims later

2.2 DETAILED ITEM PHOTOGRAPHY
□ High-value items individual photos
□ Pre-existing damage close-ups
□ Serial numbers/model numbers
□ Brand labels visible
□ Condition of upholstery/finishes

═══════════════════════════════════════════════════════════

PHASE 3: INVENTORY SYSTEM

3.1 ROOM DESIGNATION
Assign each room a number/code:
- Kitchen = K
- Master Bedroom = MB
- Living Room = LR
- Dining Room = DR
- Bathroom 1 = B1
- etc.

3.2 BOX NUMBERING SYSTEM
Format: [ROOM]-[BOX#]
Examples:
- MB-1 (Master Bedroom, Box 1)
- K-5 (Kitchen, Box 5)
- LR-3 (Living Room, Box 3)

3.3 INVENTORY FORM COMPLETION
For each box record:
□ Box number
□ Room of origin
□ General contents description
□ Number of items (estimate if many small items)
□ Condition code
□ Special handling notes
□ Pack-out date
□ Technician initials

═══════════════════════════════════════════════════════════

PHASE 4: CONDITION CODING

4.1 CONDITION CODE SYSTEM
Use color-coded stickers:

🟢 GREEN - GOOD CONDITION
- Clean, undamaged items
- Normal wear only
- No restoration needed

🟡 YELLOW - AFFECTED
- Moderate damage
- Requires cleaning/restoration
- Salvageable with treatment

🔴 RED - HEAVILY DAMAGED
- Significant damage
- May not be salvageable
- Requires specialized restoration or disposal

4.2 APPLYING CONDITION CODES
□ Apply sticker to box and inventory form
□ Note specific damage on inventory form
□ Photo document red-coded items
□ Customer review recommended for red items

═══════════════════════════════════════════════════════════

PHASE 5: PACKING PROCEDURES

5.1 GENERAL PACKING GUIDELINES
□ Pack room by room
□ Heavy items in small boxes
□ Light items in large boxes
□ No box over 50 lbs
□ Fill box voids with packing paper
□ Label all sides of box
□ Write "FRAGILE" on appropriate boxes

5.2 KITCHEN PACKING
Dishes/Glassware:
□ Wrap each item individually
□ Use dish barrel boxes
□ Layer with packing paper between plates
□ Stand glasses upright
□ Mark "FRAGILE - DISHES - THIS SIDE UP"

Pantry Items:
□ Check expiration dates
□ Seal open containers
□ Group by type
□ Note if refrigerated items (special handling)

Small Appliances:
□ Photo with model/serial number
□ Wrap cords separately
□ Pad with bubble wrap
□ Original boxes preferred

5.3 BEDROOM PACKING
Clothing:
□ Hanging clothes in wardrobe boxes
□ Folded clothes in standard boxes
□ Separate by owner if possible
□ Note if dry clean only

Linens:
□ Clean linens in boxes
□ Affected linens bagged separately for cleaning

Furniture:
□ Photo all sides
□ Wrap in moving blankets
□ Protect corners
□ Remove loose items from drawers

5.4 ELECTRONICS PACKING
□ Photo all connections before unplugging
□ Photo model/serial numbers
□ Wrap cords, label which device
□ Pad heavily with bubble wrap
□ Original boxes if available
□ Mark "FRAGILE - ELECTRONICS"

5.5 ARTWORK & PICTURES
□ Photo each piece
□ Wrap in paper, then bubble wrap
□ Mirror/picture boxes for framed items
□ Stand upright, never lay flat
□ Mark "FRAGILE - GLASS"

5.6 BOOKS & DOCUMENTS
□ Pack books spine down
□ Alternate direction for stability
□ Don't overfill boxes (get heavy quick)
□ Important documents in separate labeled box

═══════════════════════════════════════════════════════════

PHASE 6: SPECIALTY ITEMS

6.1 ANTIQUES & VALUABLES
□ Individual photos and documentation
□ Customer review before packing
□ Professional packing materials
□ Separate inventory list
□ Climate-controlled storage if needed

6.2 ELECTRONICS & COMPUTERS
□ Photo all connections
□ Unplug properly
□ Anti-static wrap if available
□ Note which cables go with which devices
□ Customer backup data before pack-out

6.3 ARTWORK & COLLECTIBLES
□ Individual appraisal recommended
□ Museum-quality packing if high value
□ Climate-controlled storage
□ Restoration specialist consultation if damaged

═══════════════════════════════════════════════════════════

PHASE 7: LOADING & TRANSPORT

7.1 LOADING PROCEDURES
□ Load heaviest boxes on bottom
□ Stack boxes of same size
□ Fragile boxes on top
□ Secure load with straps
□ No shifting during transport

7.2 TRANSPORT LOG
□ Date/time loaded
□ Number of boxes
□ Condition of items at loading
□ Driver name
□ Destination
□ Mileage/route

7.3 DELIVERY TO FACILITY
□ Climate-controlled area
□ Organized by customer/job number
□ Maintain room groupings
□ Secure storage
□ Pest-free environment

═══════════════════════════════════════════════════════════

PHASE 8: STORAGE MANAGEMENT

8.1 FACILITY ORGANIZATION
□ Assign storage area by job number
□ Keep contents from same job together
□ Maintain climate control
□ Regular pest control
□ Security system

8.2 INVENTORY TRACKING
□ Digital inventory system entry
□ Box location in facility noted
□ Condition code visible
□ Cleaning status tracked
□ Return date projected

═══════════════════════════════════════════════════════════

PHASE 9: CONTENT CLEANING

9.1 CLEANING TRIAGE
Sort by cleaning method needed:
- Dry clean only
- Wet clean
- Ozone treatment
- Specialty restoration
- Discard (non-salvageable)

9.2 CLEANING PROCEDURES
□ Follow manufacturer recommendations
□ Test cleaning methods on inconspicuous areas
□ Document cleaning process
□ Photo before/after cleaning
□ Quality control inspection

═══════════════════════════════════════════════════════════

PHASE 10: PACK-BACK & RETURN

10.1 RETURN PREPARATION
□ Coordinate with customer on timing
□ Verify reconstruction complete
□ Clean items inspected
□ Organize boxes by room
□ Update inventory status

10.2 DELIVERY PROCESS
□ Schedule delivery window with customer
□ Customer present for delivery
□ Unpack and place items where customer directs
□ Remove all packing materials
□ Conduct walkthrough with customer
□ Obtain sign-off on inventory return

10.3 FINAL INVENTORY RECONCILIATION
□ Check off all returned items
□ Note any damaged items
□ Note any non-salvageable items
□ Customer signature on final inventory
□ Address any concerns immediately

═══════════════════════════════════════════════════════════

CRITICAL REMINDERS:

📸 Photo EVERYTHING - before touching, during packing, after packing
📋 Inventory accuracy prevents disputes later
🏷️ Condition codes protect both you and customer
📦 Pack quality = customer satisfaction
🔍 High-value items get extra documentation
⏱️ Communication with customer throughout process
✅ Customer signature at every major step

═══════════════════════════════════════════════════════════

COMMON MISTAKES TO AVOID:

❌ Not photographing items "as they lie" before packing
❌ Poor labeling resulting in wrong room returns
❌ Not noting pre-existing damage (blame later)
❌ Over-packing boxes (breakage and safety)
❌ Not getting customer sign-off on inventory
❌ Mixing rooms in same box
❌ Not condition coding items
❌ Inadequate packing materials for fragile items

═══════════════════════════════════════════════════════════

Version 1.0 - Ready Companies Training Platform
For questions, contact your Ready Companies supervisor.
`
                },

                'reconstruction-workflow-sop': {
                    name: 'Ready_Reconstruction_Workflow_SOP.pdf',
                    content: `READY COMPANIES
RECONSTRUCTION WORKFLOW STANDARD OPERATING PROCEDURE
From Estimate to Certificate of Completion

═══════════════════════════════════════════════════════════

PHASE 1: TRANSITION FROM MITIGATION TO RECONSTRUCTION

1.1 MITIGATION COMPLETION VERIFICATION
□ Certificate of Completion received from mitigation
□ All moisture readings at dry standard
□ All equipment removed
□ Structure 100% dry and ready for rebuild
□ Final mitigation photos reviewed

1.2 HANDOFF DOCUMENTATION REVIEW
□ Scope of loss documentation
□ Moisture map history
□ Demo documentation
□ Material removal list
□ Before photos (all affected areas)
□ Estimate from mitigation (if applicable)

1.3 PROJECT MANAGER ASSIGNMENT
□ Assign PM based on project size/complexity
□ Review all mitigation documentation
□ Schedule initial reconstruction meeting
□ Begin estimate preparation

═══════════════════════════════════════════════════════════

PHASE 2: ESTIMATING & SCOPE DEVELOPMENT

2.1 ON-SITE ASSESSMENT (Post-Mitigation)
□ Walk entire affected area
□ Verify all demo complete
□ Check for hidden damage not previously noted
□ Confirm structural integrity
□ Identify any additional scope items
□ Take reconstruction "before" photos

2.2 XACTIMATE ESTIMATE DEVELOPMENT
□ Input all room dimensions
□ Select appropriate material grades
□ Include all demo already completed
□ Include all reconstruction line items
□ Apply local pricing
□ Include O&P (Overhead & Profit)
□ Review for accuracy
□ Export estimate PDF

2.3 SCOPE OF WORK DOCUMENT
Create detailed SOW including:
□ Project address and insured information
□ Detailed description of work
□ Materials to be used (with specifications)
□ Timeline estimate
□ Payment terms
□ Change order process

═══════════════════════════════════════════════════════════

PHASE 3: ESTIMATE APPROVAL & AUTHORIZATION

3.1 CUSTOMER PRESENTATION
□ Schedule estimate review meeting
□ Walk property with estimate in hand
□ Explain each line item
□ Answer customer questions
□ Discuss material selections
□ Review timeline and payment schedule

3.2 INSURANCE ADJUSTER COORDINATION
□ Submit estimate to adjuster
□ Schedule adjuster walkthrough if needed
□ Address any pricing discrepancies
□ Negotiate supplements if required
□ Obtain approval letter

3.3 CONTRACT EXECUTION
□ Finalize scope of work
□ Present contract to customer
□ Review payment terms
□ Obtain customer signature
□ Provide copy to customer

═══════════════════════════════════════════════════════════

PHASE 4: PRE-CONSTRUCTION

4.1 PERMIT ACQUISITION
□ Determine if permits required
□ Prepare permit application
□ Submit plans if needed
□ Pay permit fees
□ Post permit on site
□ Schedule inspections

4.2 MATERIAL ORDERING
□ Create detailed material list from estimate
□ Order long-lead items first
□ Verify material specifications match estimate
□ Confirm delivery dates
□ Arrange delivery logistics

4.3 SUBCONTRACTOR COORDINATION
Schedule subcontractors:
□ Electrician (rough-in date)
□ Plumber (rough-in date)
□ HVAC (rough-in date)
□ Insulation (after rough-ins)
□ Drywall (after insulation)
□ Flooring (after paint)

4.4 PROJECT SCHEDULE DEVELOPMENT
□ Create detailed timeline
□ Identify critical path items
□ Build in buffer for delays
□ Communicate schedule to customer

═══════════════════════════════════════════════════════════

PHASE 5: CONSTRUCTION EXECUTION

5.1 WEEK 1 - FRAMING & ROUGH-INS
□ Site protection setup
□ Rough framing installation
□ Rough-in electrical, plumbing, HVAC
□ Inspection (if required)
□ Photo document all work

5.2 WEEK 2 - INSULATION & DRYWALL
□ Install insulation
□ Inspection (if required)
□ Hang drywall
□ Photo document

5.3 WEEK 3 - DRYWALL FINISH
□ Mud and tape drywall
□ Sand smooth
□ Texture application
□ Prime all new drywall

5.4 WEEK 4 - PAINT & PREP
□ Paint walls and ceilings
□ Paint trim
□ Floor prep for installation

5.5 WEEK 5 - FLOORING & TRIM
□ Install flooring
□ Install baseboards and trim
□ Install doors and hardware

5.6 WEEK 6 - FINAL FIXTURES & PUNCH
□ Install light and plumbing fixtures
□ Final caulking and touch-up
□ Punch list completion

═══════════════════════════════════════════════════════════

PHASE 6: QUALITY CONTROL

6.1 DAILY QC CHECKS
□ Take daily progress photos
□ Check work quality each day
□ Verify materials match estimate
□ Address issues immediately
□ Document corrections made

6.2 PRE-FINAL WALKTHROUGH
□ Complete all punch list items
□ Clean entire work area
□ Touch up any scuffs/marks
□ Test all fixtures
□ Take final photos

═══════════════════════════════════════════════════════════

PHASE 7: PROJECT COMPLETION

7.1 CUSTOMER FINAL WALKTHROUGH
□ Walk entire project with customer
□ Demonstrate all new fixtures
□ Answer any questions
□ Note any concerns
□ Address minor items immediately

7.2 CERTIFICATE OF COMPLETION
□ Obtain customer signature on COC
□ Request testimonial/review
□ Provide warranty information
□ Leave product documentation

7.3 FINAL BILLING & CLOSEOUT
□ Submit final invoice
□ Process final payment
□ Archive project file

═══════════════════════════════════════════════════════════

CHANGE ORDER MANAGEMENT

When scope changes occur:
□ Document change immediately
□ Photo document reason
□ Create change order form
□ Never proceed without approval

═══════════════════════════════════════════════════════════

CRITICAL REMINDERS:

📸 Photo document EVERYTHING at every phase
📋 Signed change orders prevent payment disputes
🎯 Quality control catches problems early
⏱️ Communicate delays immediately
💰 Job costing weekly prevents profit loss
✅ Never skip permit requirements

═══════════════════════════════════════════════════════════

Version 1.0 - Ready Companies Training Platform
For questions, contact your Ready Companies supervisor.
`
                },

                'xactimate-estimating-sop': {
                    name: 'Ready_Xactimate_Estimating_SOP.pdf',
                    content: `READY COMPANIES
XACTIMATE ESTIMATING STANDARD OPERATING PROCEDURE
Creating Accurate, Defensible Estimates

═══════════════════════════════════════════════════════════

PURPOSE:
Ensure consistent, accurate estimates that capture all work,
use appropriate pricing, and get approved by insurance adjusters.

═══════════════════════════════════════════════════════════

PHASE 1: PROJECT SETUP

1.1 CREATE NEW ESTIMATE
□ File > New Estimate
□ Enter property address and insured name
□ Enter claim number and date of loss
□ Select local price list

1.2 SKETCH CREATION
□ Measure all affected rooms accurately
□ Label each room appropriately
□ Note ceiling heights
□ Mark doors and windows with dimensions

═══════════════════════════════════════════════════════════

PHASE 2: LINE ITEM SELECTION

DEMOLITION:
□ Always use "R&R" when replacing
□ R&R includes both removal AND replacement
□ Separate "Remove" only when not replacing

DRYWALL:
□ Specify thickness: 1/2" or 5/8"
□ R&R DRY - 1/2" for walls
□ R&R DRY - 5/8" for ceilings
□ Always include texture and paint

INSULATION:
□ Specify R-value (R-13, R-19, R-30)
□ Must match local code minimum

FLOORING - CARPET:
□ Specify grade (Budget, Standard, Premium)
□ Include carpet AND pad
□ Include transition strips

FLOORING - HARDWOOD:
□ Specify species and grade
□ Specify width (2-1/4", 3-1/4", etc.)
□ Include sand and finish if applicable

FLOORING - TILE:
□ Specify size (12x12, 18x18, etc.)
□ Include thin-set, grout, installation

PAINT:
□ Always include prime + 2 coats
□ Specify sheen (flat, eggshell, semi-gloss)
□ Interior vs Exterior

TRIM/BASEBOARDS:
□ Specify profile and material
□ Include material, installation, prime and paint

DOORS:
□ Specify style and material
□ Include casing both sides
□ Include hardware
□ Include prime and paint

═══════════════════════════════════════════════════════════

PHASE 3: QUANTITIES & MEASUREMENTS

3.1 ACCURATE TAKEOFFS
□ Use sketch for auto-calculated quantities
□ Verify auto-calculated quantities
□ Add waste factor where appropriate:
   - Flooring: 10% waste
   - Tile: 15% waste
   - Hardwood: 10-15% waste

3.2 UNITS OF MEASURE
- SQ = 100 square feet (roofing)
- EA = Each (individual items)
- LF = Linear Foot (trim, baseboards)
- SF = Square Foot (flooring, drywall)
- SY = Square Yard (carpet)
- CY = Cubic Yard (concrete, debris)

3.3 COMMON ERRORS TO AVOID
❌ Don't forget both sides of walls for paint
❌ Don't forget ceiling height affects wall area
❌ Don't forget to subtract door/window openings
❌ Don't forget transition strips between rooms

═══════════════════════════════════════════════════════════

PHASE 4: PRICING ACCURACY

4.1 MATERIAL GRADE SELECTION
Use photos to select appropriate grade:

BUDGET: Builder-grade, basic finishes
STANDARD: Mid-grade, typical residential
PREMIUM: High-end, luxury products

4.2 OVERHEAD & PROFIT (O&P)
□ 10% Overhead + 10% Profit = 20% total
□ Applied to subtotal of all line items
□ Formula: (Subtotal × 1.10) × 1.10 = Total

═══════════════════════════════════════════════════════════

PHASE 5: ESTIMATE REVIEW & QC

COMPLETENESS CHECK:
□ All rooms in sketch
□ All affected areas included
□ All materials specified with grade
□ All demo and reconstruction items listed
□ Permits included if needed
□ Dumpster/trash-out included

ACCURACY CHECK:
□ Quantities look reasonable
□ Material grades match photos
□ No duplicate line items
□ Math checks out
□ O&P applied correctly

PRESENTATION:
□ Professional appearance
□ Clear room labels
□ Organized by room/area
□ Photos attached
□ Sketch attached

═══════════════════════════════════════════════════════════

PHASE 6: SUPPLEMENT PROCEDURES

6.1 DOCUMENTING SUPPLEMENTS
□ Photo document new damage
□ Note why not in original estimate
□ Create detailed description
□ Explain reasoning to adjuster

6.2 COMMON SUPPLEMENT SCENARIOS
- Hidden damage behind walls
- Mold discovered during demo
- Structural damage not visible initially
- Code upgrade requirements

═══════════════════════════════════════════════════════════

CRITICAL REMINDERS:

📸 Photos = proper material grade selection
📏 Accurate measurements = accurate estimates
💰 Correct O&P = profitability
✅ Peer review = fewer errors
📋 Complete estimates = faster approval

═══════════════════════════════════════════════════════════

XACTIMATE SHORTCUTS:
- Ctrl+N: New estimate
- Ctrl+S: Save
- Ctrl+F: Find line item
- F2: Edit line item
- Delete: Remove line item

═══════════════════════════════════════════════════════════

Version 1.0 - Ready Companies Training Platform
For questions, contact your Ready Companies supervisor.
`
                },

                'customer-communication-sop': {
                    name: 'Ready_Customer_Communication_SOP.pdf',
                    content: `READY COMPANIES
CUSTOMER COMMUNICATION STANDARD OPERATING PROCEDURE
Excellence in Every Interaction

═══════════════════════════════════════════════════════════

THE READY STANDARD:
Every customer interaction should leave them feeling:
✓ Informed
✓ Confident
✓ Valued
✓ Heard

═══════════════════════════════════════════════════════════

PHASE 1: INITIAL CONTACT (Emergency Call)

1.1 ANSWERING THE CALL (Within 2 rings)
"Thank you for calling Ready Companies, this is [NAME]. 
How can I help you today?"

□ Speak clearly and professionally
□ Use customer's name once learned
□ Express empathy for their emergency
□ Remain calm and reassuring

1.2 GATHERING CRITICAL INFORMATION
□ "What is your name?"
□ "What is the property address?"
□ "What type of damage occurred?"
□ "When did this happen?"
□ "Is the source stopped?"
□ "Do you have insurance?"

1.3 SETTING EXPECTATIONS
□ "We can have a team there within 2 hours"
□ "Here's what to expect when we arrive..."
□ "Our technician will call 30 minutes before arrival"

═══════════════════════════════════════════════════════════

PHASE 2: ON-SITE ARRIVAL

2.1 FIRST IMPRESSION
□ Arrive in clean, logo'd vehicle
□ Wear clean uniform with name tag
□ Introduce yourself professionally

2.2 INITIAL WALKTHROUGH
□ "Let me take a look and explain everything I find"
□ Think out loud (appropriate level)
□ Point out what you're seeing
□ Answer questions patiently

2.3 ASSESSMENT SUMMARY
□ Sit down with customer
□ Review what you found
□ Explain what needs to be done
□ Discuss timeline and next steps
□ Get authorization to proceed

═══════════════════════════════════════════════════════════

PHASE 3: DAILY COMMUNICATION

EVERY DAY OF ACTIVE WORK:
□ Call or text customer by 5pm
□ Report progress
□ Share today's readings
□ Explain tomorrow's plan

Update Template:
"Hi [NAME], wanted to update you on today's progress. 
We [WHAT WAS DONE]. The readings show [PROGRESS]. 
Tomorrow we'll [NEXT STEPS]. Any questions?"

═══════════════════════════════════════════════════════════

PHASE 4: WHEN RUNNING LATE

If delayed >30 minutes:
□ Call BEFORE you're late
□ Explain situation honestly
□ Give revised ETA
□ Apologize for inconvenience

═══════════════════════════════════════════════════════════

PHASE 5: DIFFICULT CONVERSATIONS

WHEN CUSTOMER IS UPSET:

DO:
□ Listen without interrupting
□ Acknowledge their feelings
□ Empathize sincerely
□ Take ownership
□ Explain what you'll do to fix it

DON'T:
□ Get defensive
□ Make excuses
□ Blame others
□ Argue

Script:
"I understand you're frustrated, and I would be too. 
Let me see what I can do to make this right."

WHEN YOU MADE A MISTAKE:
□ Admit it immediately
□ Don't make excuses
□ Apologize sincerely
□ Explain how you'll fix it

═══════════════════════════════════════════════════════════

PHASE 6: INSURANCE COMMUNICATION

DO SAY:
□ "Your insurance should cover this"
□ "We'll work with your adjuster"
□ "We'll help document everything"

DON'T SAY:
□ "Insurance will definitely pay" (not your call)
□ "You won't pay anything" (deductible exists)
□ "Insurance always covers this" (policies vary)

═══════════════════════════════════════════════════════════

PHASE 7: PROJECT COMPLETION

7.1 FINAL WALKTHROUGH
□ "Let's walk through everything together"
□ "Please let me know if you see anything to address"
□ "Here's how everything works..."

7.2 REQUESTING REVIEWS
Only ask if project went well:
"If you were happy with our work, would you mind 
leaving us a review? Here's a card with the link."

═══════════════════════════════════════════════════════════

FORBIDDEN PHRASES

NEVER SAY:
❌ "That's not my job"
❌ "I don't know" (without adding "but I'll find out")
❌ "That's impossible"
❌ "It's not our fault"

INSTEAD SAY:
✓ "Let me find the right person to help"
✓ "Great question - let me find out and get back to you"
✓ "Here's what we can do..."
✓ "We'll take care of it"

═══════════════════════════════════════════════════════════

CRITICAL REMINDERS:

📞 Return calls within 4 hours
💬 Daily updates keep customers happy
😊 Positive attitude is contagious
🎯 Under-promise, over-deliver
⏱️ Communicate delays BEFORE you're late
✅ Follow through on every commitment

═══════════════════════════════════════════════════════════

Remember: Technical skill gets the job done.
Communication skill gets you referred.

═══════════════════════════════════════════════════════════

Version 1.0 - Ready Companies Training Platform
For questions, contact your Ready Companies supervisor.
`
                },

                'safety-ppe-sop': {
                    name: 'Ready_Safety_PPE_Protocols_SOP.pdf',
                    content: `READY COMPANIES
SAFETY & PPE PROTOCOLS STANDARD OPERATING PROCEDURE

═══════════════════════════════════════════════════════════

SAFETY FIRST - ALWAYS

No job is so important that we cannot take time to do it safely.
If you see something unsafe, STOP WORK and address it.

═══════════════════════════════════════════════════════════

PHASE 1: DAILY SAFETY REQUIREMENTS

EVERY DAY, EVERY JOB:
□ Inspect PPE before use
□ Identify hazards before starting work
□ Communicate hazards to team
□ Have first aid kit accessible
□ Know emergency exit routes
□ Have fire extinguisher on site

═══════════════════════════════════════════════════════════

PHASE 2: PPE BY JOB TYPE

WATER MITIGATION (Category 1 - Clean Water):
□ Safety glasses
□ Work gloves
□ Steel-toe boots
□ Hearing protection (if using loud equipment)

WATER MITIGATION (Category 2 - Gray Water):
□ Safety glasses
□ Nitrile gloves (double layer recommended)
□ Steel-toe boots
□ Respirator (N95 minimum)
□ Long sleeves and pants

WATER MITIGATION (Category 3 - Black Water):
□ Full-face respirator with P100 filters
□ Full Tyvek suit or rubber coveralls
□ Rubber boots
□ Nitrile gloves (double layer, taped to suit)
□ Eye protection under respirator

FIRE & SMOKE RESTORATION:
⚠️ MANDATORY FULL PPE:
□ Respirator with P100 filters (minimum)
□ Disposable Tyvek coveralls
□ Nitrile gloves (double layer)
□ Safety glasses
□ Boot covers
□ Soot is CARCINOGENIC - protect yourself!

MOLD REMEDIATION:
□ Full-face respirator with P100 filters
□ Disposable coveralls
□ Nitrile gloves (double layer, taped)
□ Boot covers
□ Never eat or drink in contaminated area

DEMOLITION:
□ Hard hat
□ Safety glasses
□ Dust mask (N95 minimum)
□ Work gloves
□ Steel-toe boots
□ Hearing protection

RECONSTRUCTION:
□ Hard hat (if overhead work)
□ Safety glasses
□ Work gloves appropriate to task
□ Steel-toe boots
□ Hearing protection (power tools)

═══════════════════════════════════════════════════════════

PHASE 3: ELECTRICAL SAFETY

BEFORE WORKING IN WET AREAS:
□ Turn off electricity at breaker
□ Test outlets with voltage tester
□ NEVER stand in water with electricity on
□ Use GFCI protected outlets

EXTENSION CORDS:
□ Inspect for damage before use
□ Never run through water
□ Never overload circuits
□ Keep cords away from traffic areas

═══════════════════════════════════════════════════════════

PHASE 4: CHEMICAL SAFETY

BEFORE USING ANY CHEMICAL:
□ Read Safety Data Sheet (SDS)
□ Wear appropriate PPE
□ Ensure adequate ventilation
□ Never mix chemicals unless directed
□ Know location of eyewash station

COMMON CHEMICALS:
- Bleach: Gloves, eye protection, ventilation
- Disinfectants: Read label for PPE requirements
- Solvents: Respirator, gloves, ventilation
- Acids: Face shield, chemical gloves, apron

═══════════════════════════════════════════════════════════

PHASE 5: LADDER SAFETY

EVERY TIME YOU USE A LADDER:
□ Inspect for damage
□ Set on level, stable surface
□ Maintain 3-point contact
□ Never stand on top 2 rungs
□ Face ladder when climbing
□ Don't overreach - move ladder instead
□ Have someone stabilize if possible

═══════════════════════════════════════════════════════════

PHASE 6: LIFTING & ERGONOMICS

PROPER LIFTING TECHNIQUE:
□ Bend at knees, not waist
□ Keep load close to body
□ Lift with legs, not back
□ Don't twist while lifting
□ Ask for help if load >50 lbs
□ Use equipment (dollies, carts) when possible

═══════════════════════════════════════════════════════════

PHASE 7: VEHICLE SAFETY

BEFORE DRIVING:
□ Do vehicle walk-around inspection
□ Check fluid levels
□ Secure all equipment and materials
□ Clean windshield
□ Adjust mirrors

WHILE DRIVING:
□ Obey all traffic laws
□ No phone use while driving
□ Wear seatbelt
□ Allow extra stopping distance
□ Drive defensively

═══════════════════════════════════════════════════════════

PHASE 8: SITE SAFETY

CUSTOMER'S HOME:
□ Use floor protection
□ Protect furnishings
□ Keep work area clean
□ No smoking on property
□ Respect customer's belongings

WORK SITE:
□ Keep exits clear
□ Store materials safely
□ Clean up trip hazards immediately
□ Proper disposal of sharps/debris
□ Lock up tools and equipment

═══════════════════════════════════════════════════════════

PHASE 9: EMERGENCY PROCEDURES

INJURY ON SITE:
1. Stop work immediately
2. Provide first aid if trained
3. Call 911 if serious
4. Notify supervisor immediately
5. Complete incident report
6. Preserve scene if serious injury

FIRE:
1. Alert everyone - evacuate
2. Call 911
3. Use fire extinguisher only if:
   - Fire is small
   - You're trained
   - You have clear exit
4. Never fight large fires

CHEMICAL EXPOSURE:
1. Remove from exposure
2. Flush with water (eyes: 15 min minimum)
3. Call Poison Control: 1-800-222-1222
4. Have SDS available for medical personnel

═══════════════════════════════════════════════════════════

PHASE 10: HAZARD RECOGNITION

STOP WORK IF YOU SEE:
□ Structural instability
□ Live electrical in wet areas
□ Asbestos-containing materials (suspected)
□ Lead paint (homes built pre-1978)
□ Gas smell
□ Biological hazards
□ Unsafe working conditions

Report to supervisor immediately - do NOT proceed.

═══════════════════════════════════════════════════════════

CRITICAL SAFETY REMINDERS:

🚨 Cat 3 water is SEWAGE - full PPE required
⚡ Turn off power before working in wet areas
🎭 Soot is carcinogenic - ALWAYS wear respirator
🧤 Double glove for contaminated water
⛑️ Hard hats required for demolition
🚫 NEVER mix chemicals
📞 When in doubt, call supervisor

═══════════════════════════════════════════════════════════

YOUR SAFETY IS YOUR RESPONSIBILITY

You have the right and obligation to refuse unsafe work.
No production goal is worth an injury.

If it's not safe, don't do it.

═══════════════════════════════════════════════════════════

Version 1.0 - Ready Companies Training Platform
For questions, contact your Ready Companies supervisor.
`
                },

                'job-mitigation-tech': {
                    name: 'Ready_Job_Description_Mitigation_Technician.pdf',
                    content: `JOB DESCRIPTION: MITIGATION TECHNICIAN
Company: [Your Company Name]
Department: Mitigation / Emergency Services

═══════════════════════════════════════════════════════════

POSITION OVERVIEW

We're looking for dependable and motivated Mitigation Technicians to join our field team. You'll work under the direction of a Project Manager to perform the hands-on work of water extraction, demolition, equipment setup, and cleanup. You'll help customers through one of the most stressful events in their lives—and make a real difference every day.

═══════════════════════════════════════════════════════════

CORE RESPONSIBILITIES

□ Perform water extraction, demolition, and cleanup of affected areas
□ Set up and monitor drying equipment including air movers and dehumidifiers
□ Follow IICRC standards and company protocols for effective mitigation
□ Take moisture readings and document progress using company software
□ Assist with packing out and protecting customer belongings
□ Maintain a clean, professional jobsite and positive customer experience
□ Communicate with Project Manager and team throughout each job
□ Participate in on-call rotation for emergency response work
□ Load/unload trucks and maintain equipment
□ Follow all safety protocols and PPE requirements

═══════════════════════════════════════════════════════════

QUALIFICATIONS

REQUIRED:
□ High school diploma or GED
□ Strong work ethic and willingness to learn
□ Ability to lift 50+ lbs and work in attics, crawlspaces, or confined areas
□ Positive attitude and good communication skills
□ Valid driver's license and clean driving record
□ Reliable transportation
□ Willingness to work after-hours and weekends (on-call rotation)
□ Pass background check and drug screening

PREFERRED:
□ Restoration or construction experience
□ IICRC certifications (WRT, ASD)
□ Experience with power tools and equipment
□ Bilingual English/Spanish

═══════════════════════════════════════════════════════════

COMPENSATION & BENEFITS

💵 Competitive hourly wage + overtime
💸 On-call pay and performance bonuses
📱 Company phone or tablet access
📚 Paid IICRC training & certifications
🛠️ Tools, equipment, and uniforms provided
🩺 Health insurance & retirement options
🌴 PTO & holidays
🚀 Clear path for advancement to Lead Tech or Project Manager

═══════════════════════════════════════════════════════════

WORKING CONDITIONS

□ Fast-paced emergency response environment
□ Work in various conditions (wet, dirty, damaged structures)
□ Exposure to Category 1, 2, and 3 water (with proper PPE)
□ Standing, bending, climbing for extended periods
□ Work in residential and commercial properties
□ Some travel within service area
□ Flexible schedule including nights, weekends, holidays

═══════════════════════════════════════════════════════════

PERFORMANCE METRICS

□ Job completion time vs. estimate
□ Equipment setup accuracy and quality
□ Documentation completeness
□ Customer feedback scores
□ Safety compliance record
□ Attendance and reliability
□ Teamwork and communication

═══════════════════════════════════════════════════════════

CAREER PATH

Entry: Mitigation Technician
↓
Lead Mitigation Technician
↓
Project Manager - Mitigation
↓
Department Manager

We promote from within and invest in developing great people!

═══════════════════════════════════════════════════════════

[Company Name] is an Equal Opportunity Employer
`
                },

                'job-mitigation-pm': {
                    name: 'Ready_Job_Description_Project_Manager_Mitigation.pdf',
                    content: `JOB DESCRIPTION: PROJECT MANAGER - MITIGATION
Company: [Your Company Name]
Department: Mitigation / Emergency Services

═══════════════════════════════════════════════════════════

POSITION OVERVIEW

We're looking for a top-performing Project Manager to join our mitigation team. In this role, you'll be the first person onsite after a water, fire, or storm event. You'll be responsible for assessing the damage, closing the sale, and managing every aspect of the mitigation project from start to finish. That includes overseeing technicians, communicating with customers, capturing documentation, and preparing files for insurance submission.

This is a fast-paced, field-based position that requires leadership, technical knowledge, and people skills. The right candidate is equal parts closer, coach, and chaos-calmer.

═══════════════════════════════════════════════════════════

CORE RESPONSIBILITIES

SALES & CUSTOMER RELATIONS:
□ Close mitigation jobs onsite with homeowners and property managers
□ Build rapport and trust with customers during crisis situations
□ Conduct damage assessments and explain scope of work
□ Provide accurate timeline and cost expectations
□ Maintain excellent customer communication throughout project

PROJECT MANAGEMENT:
□ Manage all aspects of mitigation from dry-out to documentation
□ Lead and support assigned field technicians
□ Schedule work, equipment, and personnel efficiently
□ Monitor moisture readings and adjust drying strategy as needed
□ Ensure jobs meet timeline and profitability targets

DOCUMENTATION & COMPLIANCE:
□ Capture photos, moisture logs, and notes in real-time
□ Follow IICRC standards and company SOPs
□ Prepare complete job files for insurance submission
□ Coordinate with estimators and office staff
□ Complete Certificates of Completion with customer signatures

TEAM LEADERSHIP:
□ Train and mentor mitigation technicians
□ Conduct daily job planning and team coordination
□ Address performance issues and provide feedback
□ Model professionalism and company values

═══════════════════════════════════════════════════════════

QUALIFICATIONS

REQUIRED:
□ 3+ years restoration or construction experience
□ Strong closing skills with face-to-face sales experience
□ Proven leadership managing field crews
□ Knowledge of water mitigation tools and drying science
□ Excellent communication and conflict resolution skills
□ Valid driver's license and clean driving record
□ Ability to be on call for emergency jobs
□ Tech-savvy (job management software, moisture meters, cameras)

PREFERRED:
□ IICRC certifications (WRT, ASD required within 6 months)
□ Xactimate experience
□ Previous restoration Project Manager role
□ Customer service or sales background

═══════════════════════════════════════════════════════════

COMPENSATION & BENEFITS

💵 Competitive base salary + performance bonuses
💸 Commissions on job sales and profitability
🚗 Company vehicle or vehicle stipend
📱 Company phone and tablet
📚 Paid IICRC training & certifications
🛠️ Tools, equipment, and uniforms provided
🩺 Health insurance & retirement options
🌴 PTO & holidays
🎯 Uncapped earning potential

═══════════════════════════════════════════════════════════

PERFORMANCE METRICS

□ Onsite sales conversion rate (target: 85%+)
□ Cycle time (job start to dry-out complete)
□ Customer satisfaction and review scores
□ Documentation completeness and timeliness
□ Project profitability and labor efficiency
□ Revenue per job
□ Technician development and retention

═══════════════════════════════════════════════════════════

WORKING CONDITIONS

□ Field-based position with office coordination
□ Emergency response 24/7 on-call rotation
□ Work in damaged structures (wet, fire, storm)
□ Significant driving throughout service area
□ Flexible hours including nights and weekends
□ Customer-facing role requiring professional appearance

═══════════════════════════════════════════════════════════

CAREER PATH

Project Manager - Mitigation
↓
Senior Project Manager
↓
Mitigation Department Manager
↓
Operations Manager

═══════════════════════════════════════════════════════════

[Company Name] is an Equal Opportunity Employer
`
                },

                'job-contents-supervisor': {
                    name: 'Ready_Job_Description_Contents_Supervisor.pdf',
                    content: `JOB DESCRIPTION: CONTENTS SUPERVISOR
Company: [Your Company Name]
Department: Contents / Pack-Out Services

═══════════════════════════════════════════════════════════

POSITION OVERVIEW

We are seeking a detail-oriented and organized Contents Supervisor to oversee the pack-out, handling, cleaning, and inventory of customer contents during mitigation and restoration projects. This is a hands-on leadership position that requires excellent logistics coordination, team leadership, and care for customer belongings. You'll be in charge of maintaining high-quality standards throughout the entire contents process—from onsite pack-outs to warehouse inventory.

═══════════════════════════════════════════════════════════

CORE RESPONSIBILITIES

PACK-OUT OPERATIONS:
□ Oversee pack-out and pack-back of personal property during restoration projects
□ Ensure proper "as they lie" photography before touching items
□ Direct team in proper packing techniques by item type
□ Verify condition coding (Green/Yellow/Red) accuracy
□ Coordinate transportation logistics to/from job sites

INVENTORY MANAGEMENT:
□ Maintain detailed and accurate inventory using contents management software
□ Implement room/box numbering system consistently
□ Ensure all items are photographed and documented
□ Track item location in warehouse
□ Manage inventory database updates

CLEANING & RESTORATION:
□ Oversee contents cleaning and deodorization processes
□ Assign items to appropriate cleaning methods
□ Conduct quality inspections of cleaned items
□ Coordinate specialty restoration (electronics, artwork, etc.)
□ Ensure proper storage conditions (climate, security)

TEAM LEADERSHIP:
□ Lead and direct team members for safe and efficient handling
□ Train staff on proper packing, cleaning, and documentation
□ Schedule pack-out and pack-back crews
□ Conduct performance reviews and provide feedback
□ Model professionalism and attention to detail

CUSTOMER COMMUNICATION:
□ Communicate with customers regarding their contents
□ Handle sensitive situations with care and empathy
□ Conduct final inventory reconciliation at pack-back
□ Address customer concerns professionally
□ Obtain signatures on inventory forms

═══════════════════════════════════════════════════════════

QUALIFICATIONS

REQUIRED:
□ 3+ years experience in restoration, moving, or contents handling
□ Strong leadership and team coordination skills
□ Excellent organizational skills and attention to detail
□ Ability to manage multiple jobs and shifting priorities
□ Computer skills for inventory and documentation (Excel, CRM)
□ Valid driver's license and clean driving record
□ Ability to lift 50+ lbs

PREFERRED:
□ IICRC Contents Processing Technician certification
□ Experience with contents management software
□ Restoration industry knowledge
□ Bilingual English/Spanish

═══════════════════════════════════════════════════════════

COMPENSATION & BENEFITS

💵 Competitive salary or hourly rate
💸 Performance bonuses based on job volume and quality
📱 Company phone and system access
📚 Paid IICRC training & certifications
🛠️ All necessary tools and equipment provided
🩺 Health insurance & retirement options
🌴 PTO & holidays

═══════════════════════════════════════════════════════════

PERFORMANCE METRICS

□ Pack-out/pack-back cycle time
□ Inventory accuracy rate
□ Customer satisfaction scores
□ Item damage/loss rate
□ Documentation completeness
□ Team productivity and morale
□ On-time delivery percentage

═══════════════════════════════════════════════════════════

WORKING CONDITIONS

□ Warehouse and residential/commercial job sites
□ Physically demanding (lifting, bending, standing)
□ Work with damaged and contaminated items (with PPE)
□ Climate-controlled warehouse environment
□ Some weekend and after-hours work
□ Travel to job sites in service area

═══════════════════════════════════════════════════════════

CAREER PATH

Contents Supervisor
↓
Contents Department Manager
↓
Operations Manager

═══════════════════════════════════════════════════════════

[Company Name] is an Equal Opportunity Employer
`
                },

                'job-mitigation-admin': {
                    name: 'Ready_Job_Description_Mitigation_Administrator.pdf',
                    content: `JOB DESCRIPTION: MITIGATION ADMINISTRATOR
Company: [Your Company Name]
Department: Mitigation / Administrative Support

═══════════════════════════════════════════════════════════

POSITION OVERVIEW

The Mitigation Administrator is responsible for overseeing the administrative health of all active and completed mitigation jobs. You'll be the engine behind invoicing accuracy, documentation compliance, and successful collections from insurance carriers. This role requires strong organization, persuasive communication skills, and a fearless attitude when it comes to pushing for full invoice approvals.

You'll work closely with project managers, technicians, estimators, and adjusters to ensure nothing slips through the cracks—from photo uploads to moisture logs to Xactimate invoices.

═══════════════════════════════════════════════════════════

CORE RESPONSIBILITIES

JOB DOCUMENTATION & COMPLIANCE:
□ Review job files daily to ensure all documentation is complete and accurate
□ Flag missing or incorrect items to field staff and ensure timely corrections
□ Maintain up-to-date file progress in internal systems (Cortex, CRM, etc.)
□ Ensure all job statuses reflect current stage in workflow
□ Verify photos, moisture readings, and notes meet insurance standards
□ Audit job files before submission to carriers

INVOICING & CARRIER COMMUNICATION:
□ Prepare and submit mitigation invoices to insurance carriers
□ Follow up persistently with adjusters to secure approvals and payments
□ Respond to carrier inquiries or pushbacks with clarity and professionalism
□ Appeal invoice reductions when appropriate using proper justification
□ Track invoice aging and payment status across all jobs
□ Escalate non-payment issues to management

INTERNAL COORDINATION:
□ Collaborate with mitigation project managers to ensure efficient job closeouts
□ Coordinate with accounting team on billing, collections, and financial reporting
□ Serve as resource for field staff on documentation best practices
□ Update project management systems with current information
□ Support estimators with scope verification

═══════════════════════════════════════════════════════════

QUALIFICATIONS

REQUIRED:
□ 3+ years in insurance billing, invoicing, or administrative support
□ Exceptionally organized with ability to manage multiple open files
□ Strong written and verbal communication skills
□ Comfortable communicating with insurance adjusters
□ Detail-oriented with high sense of urgency and follow-through
□ Tech-savvy with project management and CRM software experience
□ Proficiency in Microsoft Office (Excel, Word, Outlook)

PREFERRED:
□ Restoration industry experience
□ Working knowledge of Xactimate
□ Experience with insurance mitigation billing practices
□ Familiarity with Cortex or similar platforms
□ Understanding of IICRC standards and documentation requirements

═══════════════════════════════════════════════════════════

COMPENSATION & BENEFITS

💵 Competitive hourly or salary rate
💸 Performance bonuses based on collections
📱 Company phone or system access provided
🩺 Health, dental, vision, and retirement benefits
🌴 PTO and paid holidays
📚 Training on Xactimate, insurance processes, and restoration workflows

═══════════════════════════════════════════════════════════

PERFORMANCE METRICS

□ Invoice approval rate (target: 95%+)
□ Average days to invoice submission
□ Average days to payment collection
□ Documentation compliance rate
□ Carrier communication response time
□ Job file accuracy
□ Accounts receivable aging reduction

═══════════════════════════════════════════════════════════

WORKING CONDITIONS

□ Office-based position with occasional field visits
□ Standard business hours with flexibility as needed
□ Fast-paced environment with multiple priorities
□ Regular computer use and phone communication
□ Interaction with field staff, adjusters, and management
□ Minimal physical demands

═══════════════════════════════════════════════════════════

CAREER PATH

Mitigation Administrator
↓
Senior Administrator / Billing Manager
↓
Operations Coordinator
↓
Department Manager

═══════════════════════════════════════════════════════════

[Company Name] is an Equal Opportunity Employer
`
                },

                'job-reconstruction-admin': {
                    name: 'Ready_Job_Description_Reconstruction_Administrator.pdf',
                    content: `JOB DESCRIPTION: RECONSTRUCTION ADMINISTRATOR
Company: [Your Company Name]
Department: Reconstruction / Administrative Support

═══════════════════════════════════════════════════════════

POSITION OVERVIEW

The Reconstruction Administrator ensures that every reconstruction project is properly documented, invoiced, and supported through the full administrative lifecycle. You'll work closely with project managers, estimators, subcontractors, and insurance adjusters to ensure timely closeouts, clear invoicing, and successful collections.

This role is ideal for someone who thrives in a structured, high-accountability environment and isn't afraid to push for full payment when documentation supports it.

═══════════════════════════════════════════════════════════

CORE RESPONSIBILITIES

PROJECT ADMINISTRATION:
□ Review reconstruction job files for completeness before invoicing
□ Track progress milestones and ensure documentation is submitted at each stage
□ Coordinate with field teams and estimators to address missing items
□ Maintain internal systems with accurate, up-to-date status on all open jobs
□ Verify permits, contracts, and change orders are properly filed
□ Conduct pre-invoice quality checks

INVOICING & CARRIER COMMUNICATION:
□ Prepare and submit reconstruction invoices based on Xactimate estimates
□ Communicate with insurance adjusters to resolve billing questions
□ Push back confidently when underpaid, with supporting documentation
□ Escalate and appeal denials using proper records and project narratives
□ Track payment schedules and follow up on outstanding balances
□ Coordinate final invoice submissions and lien releases

SUBCONTRACTOR COORDINATION:
□ Collect and maintain subcontractor COIs (Certificates of Insurance)
□ Process lien waivers and payment documentation
□ Verify subcontractor invoices match approved scopes
□ Coordinate vendor payment schedules with accounting
□ Maintain vendor files and compliance records

INTERNAL COORDINATION:
□ Work with Reconstruction Department Manager to prioritize project closings
□ Assist accounting with reconciliation of payments and AR tracking
□ Support project managers with administrative tasks
□ Generate reports on job status, aging, and profitability
□ Facilitate communication between field, office, and finance teams

═══════════════════════════════════════════════════════════

QUALIFICATIONS

REQUIRED:
□ 3+ years in construction, restoration, or admin roles with invoicing responsibility
□ Highly organized and attentive to detail
□ Strong written and verbal communication skills
□ Confident and assertive when dealing with insurance carriers
□ Proficient in job management platforms and cloud-based systems
□ Ability to manage dozens of active files simultaneously
□ Microsoft Office proficiency (Excel, Word, Outlook)

PREFERRED:
□ Familiarity with Xactimate and construction documentation
□ Restoration industry experience
□ Understanding of construction draw schedules and lien law
□ Experience with Cortex or similar platforms
□ Knowledge of insurance billing processes

═══════════════════════════════════════════════════════════

COMPENSATION & BENEFITS

💵 Competitive salary or hourly rate
💸 Performance-based bonus potential
🩺 Health, dental, vision, and retirement benefits
📱 Company system access and tech support
🌴 Paid time off and holidays
📚 Ongoing training in restoration workflows and billing systems

═══════════════════════════════════════════════════════════

PERFORMANCE METRICS

□ Invoice approval rate
□ Average days to invoice submission
□ Average days to payment collection
□ Documentation completeness percentage
□ Change order processing time
□ AR aging improvement
□ Customer and PM satisfaction scores

═══════════════════════════════════════════════════════════

WORKING CONDITIONS

□ Office-based with occasional job site visits
□ Standard business hours with flexibility
□ Fast-paced, multi-project environment
□ Regular communication with field staff and insurance adjusters
□ Computer-intensive work
□ Professional office setting

═══════════════════════════════════════════════════════════

CAREER PATH

Reconstruction Administrator
↓
Senior Administrator / Billing Manager
↓
Operations Coordinator
↓
Department Manager

═══════════════════════════════════════════════════════════

[Company Name] is an Equal Opportunity Employer
`
                },

                'job-mitigation-dept-manager': {
                    name: 'Ready_Job_Description_Mitigation_Contents_Department_Manager.pdf',
                    content: `JOB DESCRIPTION: MITIGATION & CONTENTS DEPARTMENT MANAGER
Company: [Your Company Name]
Department: Operations / Department Management

═══════════════════════════════════════════════════════════

POSITION OVERVIEW

As the Mitigation & Contents Department Manager, you will oversee daily operations, staffing, and performance across all active mitigation and contents jobs. You'll manage field technicians, lead technicians, and supervisors—ensuring that every job meets scope, documentation, timeline, and quality standards. You'll be the go-to leader for executing timely emergency response, drying science best practices, and contents handling with care and compliance.

This is a fast-paced, field-heavy leadership role requiring strong people management skills, attention to detail, and operational discipline.

═══════════════════════════════════════════════════════════

CORE RESPONSIBILITIES

TEAM LEADERSHIP & SUPERVISION:
□ Manage all mitigation and contents staff (technicians, supervisors, leads)
□ Hire, onboard, train, and develop team members to meet IICRC standards
□ Conduct daily check-ins, job planning, and performance feedback
□ Oversee after-hours/emergency rotation schedules and ensure coverage
□ Address performance issues and provide coaching
□ Foster a culture of safety, quality, and customer service

PROJECT OVERSIGHT:
□ Ensure all emergency response jobs are deployed quickly and executed accurately
□ Maintain real-time oversight of job status, equipment usage, and documentation
□ Monitor moisture logs and drying progress across active jobs
□ Oversee proper pack-out, inventory, cleaning, and return of contents
□ Track timelines and minimize delays in dry-outs or contents workflows
□ Approve job completions and Certificates of Completion

QUALITY CONTROL & COMPLIANCE:
□ Enforce safety standards and equipment usage protocols on all job sites
□ Ensure job documentation (photos, notes, readings) is accurate and timely
□ Verify contents handling complies with SOPs and insurance expectations
□ Perform jobsite inspections and quality audits regularly
□ Address customer complaints and escalations professionally
□ Ensure IICRC and company standards are consistently met

CROSS-FUNCTIONAL COLLABORATION:
□ Work with project managers, estimators, and customer service for job coordination
□ Support scheduling and dispatch to optimize technician efficiency
□ Serve as escalation point for customer concerns during mitigation/pack-out
□ Collaborate with reconstruction team for seamless project handoffs
□ Coordinate with vendors for equipment, supplies, and specialty services

REPORTING & ACCOUNTABILITY:
□ Track departmental KPIs (response times, cycle times, job profitability)
□ Use company software (Cortex, etc.) to maintain visibility on all active jobs
□ Report performance and bottlenecks to executive leadership regularly
□ Monitor labor efficiency and equipment utilization
□ Ensure accurate time tracking and payroll submission

═══════════════════════════════════════════════════════════

QUALIFICATIONS

REQUIRED:
□ 5+ years experience in restoration, construction, or field service operations
□ 2+ years in supervisory or department leadership role
□ Strong knowledge of drying equipment, moisture mapping, and IICRC standards
□ Understanding of contents handling, inventory systems, and customer sensitivity
□ Ability to manage people, processes, and emergencies calmly and decisively
□ Exceptional communication and leadership skills
□ Valid driver's license and clean driving record

PREFERRED:
□ IICRC certifications (WRT, ASD required; CMP preferred)
□ Experience with job management systems and mobile apps
□ Previous department manager role in restoration industry
□ Xactimate knowledge
□ Bilingual English/Spanish

═══════════════════════════════════════════════════════════

COMPENSATION & BENEFITS

💵 Competitive salary + performance-based bonuses
🚗 Company vehicle or allowance
📱 Company-provided phone/tablet
🛠️ All tools, PPE, and technology provided
🩺 Health, dental, vision, and retirement benefits
🌴 Paid time off and holidays
📚 IICRC certification reimbursement and professional development

═══════════════════════════════════════════════════════════

PERFORMANCE METRICS

□ Average emergency response time (target: <2 hours)
□ Average job cycle time (start to completion)
□ Documentation compliance rate
□ Customer satisfaction scores
□ Job profitability and labor efficiency
□ Employee retention and development
□ Safety incident rate

═══════════════════════════════════════════════════════════

WORKING CONDITIONS

□ Field-heavy role with significant job site visits
□ Office coordination and administrative duties
□ On-call availability for emergency situations
□ Fast-paced environment with shifting priorities
□ Travel within service area
□ Flexible hours including nights and weekends

═══════════════════════════════════════════════════════════

CAREER PATH

Mitigation & Contents Department Manager
↓
Regional Operations Manager
↓
Director of Operations
↓
VP of Operations

═══════════════════════════════════════════════════════════

[Company Name] is an Equal Opportunity Employer
`
                },

                'job-reconstruction-dept-manager': {
                    name: 'Ready_Job_Description_Reconstruction_Department_Manager.pdf',
                    content: `JOB DESCRIPTION: RECONSTRUCTION DEPARTMENT MANAGER
Company: [Your Company Name]
Department: Operations / Department Management

═══════════════════════════════════════════════════════════

POSITION OVERVIEW

As the Reconstruction Department Manager, you'll oversee all reconstruction and repair jobs within a designated office or market. You'll manage a team of project managers, subcontractors, and field crews—ensuring timelines are met, work is high-quality, and customers are satisfied. You'll also serve as the key link between the field and executive leadership, reporting up to the Superintendent or COO.

This role requires strong field experience, excellent communication, and the ability to manage multiple active jobs simultaneously.

═══════════════════════════════════════════════════════════

CORE RESPONSIBILITIES

PROJECT OVERSIGHT:
□ Supervise all active reconstruction jobs in assigned region or branch
□ Monitor schedules, material orders, and labor for on-time, in-budget completion
□ Conduct site visits and verify milestone completion and quality standards
□ Troubleshoot delays, resource gaps, or customer issues quickly
□ Approve project phases and coordinate inspections
□ Ensure jobs stay within scope or change orders are properly documented

TEAM LEADERSHIP:
□ Lead and support team of reconstruction project managers and coordinators
□ Assign projects, set clear expectations, and hold team accountable
□ Provide guidance, mentorship, and discipline as needed
□ Conduct performance reviews and professional development
□ Hire and onboard new team members
□ Foster culture of quality, safety, and customer service

SUBCONTRACTOR MANAGEMENT:
□ Coordinate subcontractor assignments and schedules
□ Ensure vendor compliance (COIs, licenses, quality standards)
□ Resolve subcontractor performance or payment issues
□ Build and maintain relationships with reliable trade partners
□ Negotiate pricing and scope with subs

OPERATIONAL REPORTING & COORDINATION:
□ Maintain accurate reporting on job status, timelines, and cost overruns
□ Collaborate with estimators to ensure scopes are understood and followed
□ Liaise with mitigation and customer service for seamless handoffs
□ Use internal systems (Cortex, etc.) to track documentation and milestones
□ Report KPIs and challenges to executive leadership
□ Monitor departmental profitability and efficiency

CUSTOMER EXPERIENCE:
□ Serve as escalation point for customer questions or concerns
□ Ensure final walkthroughs are completed with attention to detail
□ Promote customer-first mindset throughout department
□ Resolve complaints professionally and promptly
□ Build long-term customer relationships for referrals

═══════════════════════════════════════════════════════════

QUALIFICATIONS

REQUIRED:
□ 5+ years construction or restoration project management experience
□ 2+ years in supervisory or department leadership role
□ Strong knowledge of residential/light commercial rebuilds
□ Excellent organizational and multitasking skills
□ Effective communicator with teams, customers, and leadership
□ Highly detail-oriented and quality-focused
□ Calm and confident leadership style
□ Valid driver's license

PREFERRED:
□ Familiarity with Xactimate scopes and estimates
□ Understanding of permitting processes and code compliance
□ Experience with job management software (Cortex preferred)
□ IICRC or construction certifications
□ Previous restoration department manager role

═══════════════════════════════════════════════════════════

COMPENSATION & BENEFITS

💵 Competitive salary + performance bonuses
🚙 Company vehicle or vehicle allowance
🛠️ Company tools, tablet, and software access
🩺 Health, dental, vision, and retirement benefits
🌴 Paid time off and holiday schedule
📚 Continuing education, certification support, and leadership training

═══════════════════════════════════════════════════════════

PERFORMANCE METRICS

□ On-time project completion rate
□ Project profitability margin
□ Customer satisfaction scores
□ Change order management
□ Safety compliance record
□ Team retention and development
□ Quality audit scores

═══════════════════════════════════════════════════════════

WORKING CONDITIONS

□ Field-based with office coordination
□ Regular job site visits and inspections
□ Flexible hours to accommodate project needs
□ Some travel within service area
□ Professional office and construction environments
□ Occasional weekend or after-hours work

═══════════════════════════════════════════════════════════

CAREER PATH

Reconstruction Department Manager
↓
Regional Operations Manager
↓
Superintendent
↓
VP of Operations

═══════════════════════════════════════════════════════════

[Company Name] is an Equal Opportunity Employer
`
                },

                'job-superintendent': {
                    name: 'Ready_Job_Description_Superintendent.pdf',
                    content: `JOB DESCRIPTION: SUPERINTENDENT - RECONSTRUCTION
Company: [Your Company Name]
Department: Executive Leadership / Operations

═══════════════════════════════════════════════════════════

POSITION OVERVIEW

The Superintendent is the highest-ranking field operations leader for the reconstruction division. You'll oversee all aspects of rebuild project performance across multiple offices—ensuring timelines, quality standards, budgets, and customer expectations are consistently met or exceeded. This includes supervising project managers, tradesmen, and subcontractors, as well as collaborating with estimators, the mitigation team, and client service personnel.

This role blends operational leadership, personnel management, quality control, and customer-facing professionalism—while supporting strategic company goals around efficiency, reputation, and margin growth.

═══════════════════════════════════════════════════════════

CORE RESPONSIBILITIES

PROJECT OVERSIGHT:
□ Provide top-down management for all reconstruction projects across regions
□ Ensure job timelines, budgets, and quality benchmarks are met for every site
□ Oversee site inspections, milestone approvals, and contractor scheduling
□ Resolve field escalations and jobsite complications quickly and professionally
□ Monitor critical path items and resource allocation
□ Approve major project decisions and change orders

TEAM LEADERSHIP:
□ Supervise team of in-market project managers, assistant supers, and field crews
□ Ensure alignment between corporate expectations and regional execution
□ Recruit, train, and mentor team members with focus on accountability
□ Build high-performance, results-driven culture across all field operations
□ Conduct performance reviews and succession planning
□ Provide leadership development and career pathing

PROCESS & QUALITY CONTROL:
□ Implement and enforce standardized SOPs and checklists across all projects
□ Ensure work meets IICRC, OSHA, building code, and insurance standards
□ Drive continuous improvement by identifying operational inefficiencies
□ Oversee final walk-throughs and ensure client satisfaction at closeout
□ Conduct regular quality audits and safety inspections
□ Maintain company reputation for excellence

CROSS-FUNCTIONAL COORDINATION:
□ Partner with Estimators, Mitigation PMs, and Customer Success team
□ Maintain accurate project documentation and timelines in systems
□ Coordinate with executive team to align capacity with growth forecasts
□ Collaborate with sales and marketing on customer experience
□ Work with HR on staffing, training, and retention strategies

FINANCIAL OVERSIGHT:
□ Monitor project costs and ensure jobs are completed within budget
□ Manage labor efficiency, subcontractor negotiations, and material usage
□ Support CFO and CEO with project margin insights and field cost trends
□ Track departmental profitability and efficiency metrics
□ Identify cost-saving opportunities without compromising quality

═══════════════════════════════════════════════════════════

QUALIFICATIONS

REQUIRED:
□ 10+ years experience in residential or light commercial construction management
□ Previous leadership role managing field teams across multiple regions/offices
□ Strong technical knowledge of construction sequencing, permits, and project controls
□ Proven track record managing multiple projects with exceptional outcomes
□ Clear communicator who can lead high-output teams
□ Strong tech literacy—comfortable with project management software
□ Ability to travel regularly to job sites across markets
□ Valid driver's license

PREFERRED:
□ Familiarity with insurance restoration work and Xactimate-scoped jobs
□ IICRC or construction certifications
□ Experience with Cortex or similar platforms
□ Previous Superintendent or Director-level role
□ MBA or business management education

═══════════════════════════════════════════════════════════

COMPENSATION & BENEFITS

💵 Executive salary + bonus based on division performance
💸 Incentive pay for on-time/on-budget job completion
🚙 Company vehicle or vehicle allowance
🛠️ Technology, uniforms, and equipment provided
🩺 Health, dental, vision, and retirement benefits
🌴 PTO and generous holiday schedule
📚 Continuing education, licensing support, and leadership development
🎯 Equity or profit-sharing opportunities (based on company structure)

═══════════════════════════════════════════════════════════

PERFORMANCE METRICS

□ Overall reconstruction division profitability
□ On-time project completion rate across all markets
□ Customer satisfaction scores (target: 4.8+/5.0)
□ Project margin percentage
□ Safety incident rate
□ Employee retention in reconstruction department
□ Quality audit scores

═══════════════════════════════════════════════════════════

WORKING CONDITIONS

□ Executive leadership position with field oversight
□ Significant travel to job sites across multiple markets
□ Balance of office strategy work and field execution
□ Flexible hours to accommodate project and team needs
□ Professional office and construction environments
□ Some weekend or after-hours availability required

═══════════════════════════════════════════════════════════

CAREER PATH

Superintendent
↓
VP of Operations
↓
Chief Operating Officer (COO)
↓
CEO / Partner / Owner

═══════════════════════════════════════════════════════════

[Company Name] is an Equal Opportunity Employer
`
                },

                'service-contract': {
                    name: 'Service_Contract_Template.pdf',
                    content: `SERVICE CONTRACT TEMPLATE

═══════════════════════════════════════════════════════════

This Service Contract ("Agreement") is entered into as of the date signed below.

PARTIES

Customer / Property Owner:
Name: _____________________________________________
Address: _____________________________________________
City, State, ZIP: _____________________________________________
Phone: _____________________ Email: _____________________

Service Provider / Contractor:
Name: _____________________________________________
Company: _____________________________________________
Address: _____________________________________________
City, State, ZIP: _____________________________________________
Phone: _____________________ Email: _____________________
License #: _____________________

Effective Date: _____________________________________________

═══════════════════════════════════════════════════════════

1. SERVICES

The Service Provider agrees to perform the following services:

1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

Additional scope details: _____________________________________________
_____________________________________________
_____________________________________________

═══════════════════════════════════════════════════════════

2. COMPENSATION

Total Cost of Services: $ _____________________________________________
Amount Due at Signing: $ _____________________________________________
Amount Due at Completion: $ _____________________________________________

═══════════════════════════════════════════════════════════

3. EXPENSES

Any expenses incurred by the Service Provider in connection with the Services shall require pre-approval by the Customer in writing. Approved expenses shall be reimbursed within the agreed payment terms.

═══════════════════════════════════════════════════════════

4. PAYMENT TERMS

Invoicing Frequency: _____________________________________________
Payment Due Within: __________ days of invoice date
Accepted Payment Methods: _____________________________________________

Late payments shall accrue interest at a rate of __________ % per month.

═══════════════════════════════════════════════════════════

5. TERM

This Agreement shall commence on the Effective Date and continue for a period of:
_____________________________________________

═══════════════════════════════════════════════════════════

6. TERMINATION

Either party may terminate this Agreement by providing __________ days written notice to the other party. Upon termination:
- The Service Provider shall complete any work in progress to a reasonable stopping point
- The Customer shall pay for all services rendered through the termination date
- Both parties shall return any property belonging to the other party

═══════════════════════════════════════════════════════════

7. RELATIONSHIP OF THE PARTIES

- This Agreement does not create an exclusive relationship between the parties
- The Service Provider is an independent contractor, not an employee
- Nothing in this Agreement shall be construed to create a partnership, joint venture, or agency relationship

═══════════════════════════════════════════════════════════

8. DISPUTE RESOLUTION

Governing Law: State of _____________________________________________

In the event of a dispute:
1. The parties shall first attempt to resolve the dispute through good-faith negotiation
2. If negotiation fails, the parties agree to submit to mediation or binding arbitration
3. The prevailing party shall be entitled to recover reasonable attorney's fees and costs

═══════════════════════════════════════════════════════════

9. GENERAL PROVISIONS

- Assignment: Neither party may assign this Agreement without the prior written consent of the other party
- Complete Contract: This Agreement constitutes the entire understanding between the parties and supersedes all prior agreements
- Severability: If any provision is found to be unenforceable, the remaining provisions shall continue in full force
- Waiver: Failure to enforce any provision shall not constitute a waiver of future enforcement

═══════════════════════════════════════════════════════════

10. NOTICES

All notices shall be sent to the addresses listed above or to such other address as either party may designate in writing.

═══════════════════════════════════════════════════════════

SIGNATURES

CUSTOMER / PROPERTY OWNER

Signed: _____________________________________________
Printed Name: _____________________________________________
Date: _____________________________________________


SERVICE PROVIDER / CONTRACTOR

Signed: _____________________________________________
Printed Name: _____________________________________________
Title: _____________________________________________
Date: _____________________________________________
`
                },

                'certificate-of-completion': {
                    name: 'Certificate_of_Completion_Template.pdf',
                    content: `CERTIFICATE OF COMPLETION

═══════════════════════════════════════════════════════════

Property Address: _____________________________________________
City, State, ZIP: _____________________________________________

Owner / Customer Name: _____________________________________________

Service Provider / Contractor: _____________________________________________
Company: _____________________________________________

═══════════════════════════════════════════════════════════

COMPLETION ACKNOWLEDGMENT

By signing below, the Customer / Property Owner acknowledges and agrees:

1. A final walkthrough of the property has been conducted with the Service Provider.

2. All contracted work has been completed to the Customer's satisfaction.

3. No additional work is required under the terms of the service agreement unless otherwise noted below.

═══════════════════════════════════════════════════════════

PAYMENT OBLIGATION ACKNOWLEDGMENT

The Customer / Property Owner acknowledges:

1. Any monetary benefits (insurance proceeds, grants, or other funds) received or to be received for the services performed are to be applied toward payment for the completed work.

2. Any remaining balance not covered by insurance or other funding sources is the responsibility of the Customer / Property Owner.

3. Failure to remit payment may result in a lien being placed on the property as permitted by applicable state law.

═══════════════════════════════════════════════════════════

SPECIAL NOTES / EXCEPTIONS

_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________

═══════════════════════════════════════════════════════════

SIGNATURES

CUSTOMER / PROPERTY OWNER

Signed: _____________________________________________
Printed Name: _____________________________________________
Date: _____________________________________________


SERVICE PROVIDER / CONTRACTOR

Signed: _____________________________________________
Printed Name: _____________________________________________
Title: _____________________________________________
Date: _____________________________________________
`
                },

                'right-to-rescind': {
                    name: 'Right_to_Rescind_Notice_Template.pdf',
                    content: `RIGHT TO RESCIND / NOTICE OF CANCELLATION

═══════════════════════════════════════════════════════════

Contract Date: _____________________________________________

Contractor Name: _____________________________________________
Contractor Address: _____________________________________________
City, State, ZIP: _____________________________________________

═══════════════════════════════════════════════════════════

NOTICE OF RIGHT TO CANCEL

YOU MAY CANCEL THIS TRANSACTION, WITHOUT ANY PENALTY OR OBLIGATION, WITHIN THREE (3) BUSINESS DAYS FROM THE DATE OF THIS TRANSACTION OR RECEIPT OF THIS NOTICE, WHICHEVER IS LATER.

IF YOU CANCEL, ANY PROPERTY TRADED IN, ANY PAYMENTS MADE BY YOU UNDER THE CONTRACT OR SALE, AND ANY NEGOTIABLE INSTRUMENT EXECUTED BY YOU WILL BE RETURNED WITHIN TEN (10) BUSINESS DAYS FOLLOWING RECEIPT BY THE SELLER OF YOUR CANCELLATION NOTICE.

IF YOU CANCEL, YOU MUST MAKE AVAILABLE TO THE SELLER AT YOUR RESIDENCE, IN SUBSTANTIALLY AS GOOD CONDITION AS WHEN RECEIVED, ANY GOODS DELIVERED TO YOU UNDER THIS CONTRACT OR SALE.

IF YOU DO MAKE THE GOODS AVAILABLE TO THE SELLER AND THE SELLER DOES NOT PICK THEM UP WITHIN TWENTY (20) DAYS OF THE DATE OF YOUR NOTICE OF CANCELLATION, YOU MAY RETAIN OR DISPOSE OF THE GOODS WITHOUT ANY FURTHER OBLIGATION.

IF YOU FAIL TO MAKE THE GOODS AVAILABLE TO THE SELLER, OR IF YOU AGREE TO RETURN THE GOODS BUT FAIL TO DO SO, YOU REMAIN LIABLE FOR THE PERFORMANCE OF ALL OBLIGATIONS UNDER THE CONTRACT.

═══════════════════════════════════════════════════════════

CANCELLATION INSTRUCTIONS

To cancel this transaction, mail or deliver a signed and dated copy of this cancellation notice, or any other written notice to the contractor at the address listed above, NOT LATER THAN MIDNIGHT OF THE THIRD BUSINESS DAY AFTER THE DATE OF THIS TRANSACTION.

═══════════════════════════════════════════════════════════

I HEREBY CANCEL THIS TRANSACTION.

Customer Name: _____________________________________________
Signature: _____________________________________________
Date: _____________________________________________
`
                },
                'new-hire-onboarding': {
                    name: 'New_Hire_Onboarding_SOP_Template.pdf',
                    content: `NEW HIRE ONBOARDING SOP
90-DAY EMPLOYEE INTEGRATION WORKFLOW

═══════════════════════════════════════════════════════════

COMPANY: _____________________________________________
NEW HIRE NAME: _____________________________________________
POSITION: _____________________________________________
START DATE: _____________________________________________
HIRING MANAGER: _____________________________________________
ASSIGNED MENTOR: _____________________________________________

═══════════════════════════════════════════════════════════

PRE-BOARDING (Before Day 1)

□ Offer letter signed and returned
□ Background check completed
□ Drug screening completed (if required)
□ I-9 and W-4 forms prepared
□ Employee handbook prepared for review
□ Workstation / vehicle / equipment assigned
□ Company email and system accounts created
□ Uniform / PPE ordered and ready
□ First-week schedule prepared and sent to new hire
□ Mentor assigned and notified
□ Team notified of new hire start date and role

═══════════════════════════════════════════════════════════

WEEK 1: ORIENTATION & FOUNDATIONS

Day 1 - Welcome & Administrative Setup
□ Welcome meeting with hiring manager
□ Office / facility tour
□ Complete all HR paperwork (I-9, W-4, direct deposit, benefits enrollment)
□ Review employee handbook and company policies
□ Issue company equipment (phone, keys, badges, PPE)
□ IT setup (email, software access, Cortex login)
□ Introduce to team members
□ Review company mission, vision, and core values
□ Set up payroll and timekeeping system access
□ Provide emergency contact and safety procedures

Day 2-3 - Safety & Compliance Training
□ OSHA safety orientation
□ PPE requirements and proper usage
□ Hazard communication (HazCom) training
□ Bloodborne pathogen awareness (if applicable)
□ Vehicle safety and fleet policy review
□ Jobsite safety protocols and emergency procedures
□ Asbestos awareness training (if restoration)
□ Company-specific safety policies acknowledgment signed

Day 4-5 - Role Introduction
□ Detailed job description review and expectations discussion
□ Introduction to tools and equipment used in role
□ Shadow experienced team member on active job
□ Overview of company software systems and documentation requirements
□ Review of customer interaction standards
□ End-of-week check-in with hiring manager

Week 1 Manager Checkpoint:
□ How is the new hire adjusting?
□ Any immediate concerns or questions addressed?
□ Confirm all administrative items are complete
□ Schedule Week 2 training plan

═══════════════════════════════════════════════════════════

WEEKS 2-4: SKILLS DEVELOPMENT & GUIDED PRACTICE

Week 2 - Technical Skills Introduction
□ Hands-on training with core job functions
□ Standard Operating Procedures (SOP) review for primary duties
□ Practice documentation and reporting requirements
□ Introduction to quality standards and inspection criteria
□ Paired work with mentor on live projects
□ Daily debrief with mentor (15 min)

Week 3 - Increasing Responsibility
□ Perform tasks with mentor observation (not direct assistance)
□ Customer communication training and role-play
□ Introduction to estimating / scoping basics (if applicable)
□ Review of common mistakes and how to avoid them
□ Equipment maintenance and care training
□ Mid-point check-in with hiring manager

Week 4 - Supervised Independence
□ Complete assigned tasks with periodic check-ins only
□ Knowledge check / quiz on core procedures
□ Review of first month performance with hiring manager
□ Identify strengths and areas for additional training
□ Adjust training plan based on progress
□ Set 60-day goals collaboratively

30-Day Competency Assessment:
□ Core job tasks demonstrated satisfactorily?  YES / NO
□ Safety protocols followed consistently?  YES / NO
□ Documentation meets company standards?  YES / NO
□ Customer interaction appropriate?  YES / NO
□ Attendance and punctuality acceptable?  YES / NO
□ Overall 30-day rating: _____ / 5

═══════════════════════════════════════════════════════════

DAYS 31-60: BUILDING PROFICIENCY

□ Increase workload toward full capacity
□ Introduce advanced tasks and responsibilities
□ Cross-training on secondary job functions
□ Certification training enrollment (IICRC, OSHA 10, etc.)
□ Participate in team meetings and contribute
□ Bi-weekly check-ins with hiring manager
□ Begin tracking individual performance metrics
□ Review career development pathway and advancement opportunities
□ Address any performance gaps with targeted coaching
□ 60-day performance review with hiring manager

60-Day Competency Assessment:
□ Working at 70-80% of expected productivity?  YES / NO
□ Requires minimal supervision for core tasks?  YES / NO
□ Demonstrates understanding of company standards?  YES / NO
□ Positive feedback from team and/or customers?  YES / NO
□ Overall 60-day rating: _____ / 5

═══════════════════════════════════════════════════════════

DAYS 61-90: FULL INTEGRATION & REVIEW

□ Operating at or near full capacity and productivity
□ Handle standard situations independently
□ Demonstrate consistent quality and documentation
□ Complete all required certifications
□ Participate in continuous improvement discussions
□ Prepare for 90-day comprehensive review

90-Day Comprehensive Performance Review:
□ Core competencies mastered?  YES / NO
□ Safety record clean?  YES / NO
□ Documentation consistently meets standards?  YES / NO
□ Customer satisfaction feedback positive?  YES / NO
□ Team integration successful?  YES / NO
□ Overall 90-day rating: _____ / 5

Decision:
□ CONFIRM employment - Onboarding complete
□ EXTEND probation - Additional training needed (specify timeline)
□ SEPARATE - Performance standards not met

═══════════════════════════════════════════════════════════

NOTES & ADDITIONAL TRAINING NEEDED:

_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

Manager Signature: ___________________________ Date: ___________
New Hire Signature: ___________________________ Date: ___________
HR Signature: _________________________________ Date: ___________
`
                }
            };

