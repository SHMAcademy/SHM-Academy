// Outline & V2Box VPN Custom Key Service Module
(function () {
  var section = document.getElementById('outlineServiceSection');
  if (!section) return;

  var OUTLINE_PACKAGES = [
    { id: 'ol-80gb',  name: '80GB / 30 Days',  price: 8000,  badge: 'Standard' },
    { id: 'ol-150gb', name: '150GB / 30 Days', price: 16000, badge: 'Popular 🔥' },
    { id: 'ol-250gb', name: '250GB / 30 Days', price: 32000, badge: 'Pro Value' }
  ];

  var V2BOX_PACKAGES = [
    { id: 'v2-1m', name: '1Device - Unlimited Data - 1 Month', price: 8200,  badge: 'Starter' },
    { id: 'v2-3m', name: '1Device - Unlimited Data - 3 Month', price: 25000, badge: 'Popular 🔥' },
    { id: 'v2-6m', name: '1Device - Unlimited Data - 6 Month', price: 49000, badge: 'Best Value' }
  ];

  var state = {
    vpnType: 'outline', // 'outline' or 'v2box'
    customName: '',
    packageId: 'ol-80gb',
    qty: 1,
    payment: '',
    txn: '',
    accName: ''
  };

  function formatKs(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' Ks';
  }

  function getPackages() {
    return state.vpnType === 'outline' ? OUTLINE_PACKAGES : V2BOX_PACKAGES;
  }

  function getSelectedPackage() {
    var pkgs = getPackages();
    for (var i = 0; i < pkgs.length; i++) {
      if (pkgs[i].id === state.packageId) return pkgs[i];
    }
    return pkgs[0];
  }

  function calculateTotal() {
    var pkg = getSelectedPackage();
    var qty = parseInt(state.qty, 10) || 1;
    return pkg.price * qty;
  }

  function updatePriceDisplay() {
    var total = calculateTotal();
    var priceEl = document.getElementById('outlineTotalPrice');
    var unitEl = document.getElementById('outlineUnitPrice');
    if (priceEl) priceEl.textContent = formatKs(total);
    if (unitEl) {
      var pkg = getSelectedPackage();
      unitEl.textContent = '(' + formatKs(pkg.price) + ' × ' + state.qty + ')';
    }
  }

  function renderPackages() {
    var groupContainer = section.querySelector('.choice-group[data-group="outlinePackage"]');
    var labelEl = document.getElementById('pkgGroupLabel');
    var pkgs = getPackages();
    
    if (labelEl) {
      labelEl.textContent = 'ဝယ်ယူလိုသော Package ကို ရွေးချယ်ပါ (' + (state.vpnType === 'outline' ? 'Outline VPN' : 'V2Box VPN') + ')';
    }

    state.packageId = pkgs[0].id; // default to first item
    
    if (groupContainer) {
      var html = '';
      pkgs.forEach(function (p, index) {
        var activeClass = index === 0 ? ' selected' : '';
        html +=
          '<button type="button" class="choice-btn' + activeClass + '" data-value="' + p.id + '">' +
            '<div class="choice-title">' + p.name + '</div>' +
            '<div class="choice-price">' + formatKs(p.price) + '</div>' +
            '<span class="choice-badge">' + p.badge + '</span>' +
          '</button>';
      });
      groupContainer.innerHTML = html;

      groupContainer.querySelectorAll('.choice-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          groupContainer.querySelectorAll('.choice-btn').forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          state.packageId = btn.getAttribute('data-value');
          updatePriceDisplay();
        });
      });
    }
    updatePriceDisplay();
  }

  // VPN Type Switcher Listener
  section.querySelectorAll('.vpn-type-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      section.querySelectorAll('.vpn-type-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.vpnType = btn.getAttribute('data-vpn');
      renderPackages();
    });
  });

  // Inputs
  var nameInput = document.getElementById('outlineCustomName');
  if (nameInput) {
    nameInput.addEventListener('input', function () { state.customName = nameInput.value; });
  }

  var qtyInput = document.getElementById('outlineQty');
  if (qtyInput) {
    qtyInput.addEventListener('input', function () {
      var val = parseInt(qtyInput.value, 10);
      state.qty = isNaN(val) || val < 1 ? 1 : val;
      updatePriceDisplay();
    });
  }

  // Payment Toggle
  section.querySelectorAll('.choice-group[data-group="outlinePayment"] .choice-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      section.querySelectorAll('.choice-group[data-group="outlinePayment"] .choice-btn').forEach(function (b) { b.classList.remove('selected'); });
      btn.classList.add('selected');
      state.payment = btn.getAttribute('data-value');

      var waveBox = document.getElementById('outline-pd-wave');
      var kbzBox = document.getElementById('outline-pd-kbz');
      if (waveBox) waveBox.hidden = state.payment !== 'Wave Money';
      if (kbzBox) kbzBox.hidden = state.payment !== 'KBZPay';
    });
  });

  // Copy Buttons
  section.querySelectorAll('.pd-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function () {
          var original = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(function () { btn.textContent = original; }, 1500);
        });
      }
    });
  });

  // Navigation
  var steps = section.querySelectorAll('.order-step');
  var currentStep = 1;

  function goToStep(n) {
    steps.forEach(function (s) {
      s.classList.toggle('active', parseInt(s.getAttribute('data-ostep'), 10) === n);
    });
    currentStep = n;
  }

  function setError(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg || '';
  }

  section.querySelectorAll('[data-ogoto]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = parseInt(btn.getAttribute('data-ogoto'), 10);
      if (target > currentStep) {
        if (currentStep === 1) {
          if (!state.customName.trim()) {
            setError('oerr1', 'စိတ်ကြိုက် မူပိုင်နာမည် (Custom Key Name) ထည့်ပါ။');
            return;
          }
          setError('oerr1', '');
        }
        if (currentStep === 2) {
          if (!state.payment) {
            setError('oerr2', 'ငွေပေးချေမှု နည်းလမ်း (KBZPay / Wave Money) ရွေးချယ်ပါ။');
            return;
          }
          setError('oerr2', '');
        }
      }
      goToStep(target);
    });
  });

  // Submit Order
  var submitBtn = document.getElementById('outlineSubmit');
  if (submitBtn) {
    submitBtn.addEventListener('click', function () {
      var txnVal = (document.getElementById('outlineTxn') || {}).value || '';
      var accVal = (document.getElementById('outlineAccName') || {}).value || '';
      state.txn = txnVal.trim();
      state.accName = accVal.trim();

      if (state.txn.length !== 5 || !/^\d{5}$/.test(state.txn)) {
        setError('oerr3', 'ငွေလွှဲပြေစာ ID နောက်ဆုံး ၅ လုံးကို ဂဏန်းအတိအကျ ထည့်ပါ။');
        return;
      }
      if (!state.accName) {
        setError('oerr3', 'ငွေလွှဲထားသည့် အကောင့်နာမည် ထည့်ပါ။');
        return;
      }
      setError('oerr3', '');

      var pkg = getSelectedPackage();
      var total = calculateTotal();
      var serviceName = state.vpnType === 'outline' ? 'Outline VPN Custom Key' : 'V2Box VPN Key';

      var summary =
        '🔒 New Order — ' + serviceName + '\n\n' +
        '🔑 Custom Key Name: ' + state.customName + '\n' +
        '📦 Selected Package: ' + pkg.name + '\n' +
        '🔢 Quantity: ' + state.qty + '\n' +
        '💰 Total Price: ' + formatKs(total) + ' (' + formatKs(pkg.price) + ' x ' + state.qty + ')\n\n' +
        '💳 Payment Method: ' + state.payment + '\n' +
        '🧾 Transaction Last 5 Digits: ' + state.txn + '\n' +
        '👤 Account Name: ' + state.accName;

      var originalLabel = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="btn-spinner"></span> Processing…';

      setTimeout(function () {
        var summaryEl = document.getElementById('outlineSummary');
        if (summaryEl) summaryEl.textContent = summary;
        goToStep(4);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalLabel;
      }, 500);
    });
  }

  // Copy Summary
  var copyBtn = document.getElementById('outlineCopyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var summaryEl = document.getElementById('outlineSummary');
      if (!summaryEl || !navigator.clipboard) return;
      navigator.clipboard.writeText(summaryEl.textContent).then(function () {
        var original = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(function () { copyBtn.textContent = original; }, 1500);
      });
    });
  }

  renderPackages();
})();
