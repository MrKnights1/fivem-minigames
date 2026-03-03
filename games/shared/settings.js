function initSettings(gameName, selectors) {
    const key = 'settings_' + gameName;
    let saved;
    try { saved = JSON.parse(localStorage.getItem(key) || '{}'); }
    catch (e) { saved = {}; localStorage.removeItem(key); }

    selectors.forEach(function(sel) {
        const els = document.querySelectorAll(sel);
        if (els.length === 0) return;
        const first = els[0];

        if (first.type === 'radio') {
            if (saved[sel] !== undefined) {
                els.forEach(function(el) {
                    el.checked = (el.value === saved[sel]);
                });
            }
        } else if (first.type === 'checkbox' && els.length > 1) {
            els.forEach(function(el) {
                const k = sel + '[' + el.value + ']';
                if (saved[k] !== undefined) el.checked = saved[k];
            });
        } else if (first.type === 'checkbox') {
            if (saved[sel] !== undefined) first.checked = saved[sel];
        } else {
            if (saved[sel] !== undefined) first.value = saved[sel];
        }
    });

    function save() {
        const data = {};
        selectors.forEach(function(sel) {
            const els = document.querySelectorAll(sel);
            if (els.length === 0) return;
            const first = els[0];

            if (first.type === 'radio') {
                const checked = document.querySelector(sel + ':checked');
                data[sel] = checked ? checked.value : null;
            } else if (first.type === 'checkbox' && els.length > 1) {
                els.forEach(function(el) {
                    data[sel + '[' + el.value + ']'] = el.checked;
                });
            } else if (first.type === 'checkbox') {
                data[sel] = first.checked;
            } else {
                data[sel] = first.value;
            }
        });
        localStorage.setItem(key, JSON.stringify(data));
    }

    selectors.forEach(function(sel) {
        document.querySelectorAll(sel).forEach(function(el) {
            el.addEventListener('change', save);
        });
    });
}
