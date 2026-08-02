// Scroll-reveal for .reveal elements — staggered fade/rise on entry
(function () {
  var items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () {
            entry.target.classList.add('in');
          }, i * 60);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach(function (el) { observer.observe(el); });

  // Stats strip — count up each number once it scrolls into view
  var statNums = document.querySelectorAll('[data-count-to]');
  if (statNums.length && 'IntersectionObserver' in window) {
    var counted = new WeakSet();
    var statObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !counted.has(entry.target)) {
            counted.add(entry.target);
            animateCount(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    statNums.forEach(function (el) { statObserver.observe(el); });
  } else {
    statNums.forEach(function (el) { el.textContent = el.getAttribute('data-count-to'); });
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
    var duration = 900;
    var start = null;
    el.textContent = '0';

    function step(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    window.requestAnimationFrame(step);
  }

  // Reel videos — fall back to the animated visual if a clip is missing/fails to load
  document.querySelectorAll('.reel-video').forEach(function (video) {
    function useFallback() { video.style.display = 'none'; }
    video.addEventListener('error', useFallback, true);
    setTimeout(function () {
      if (video.readyState === 0) useFallback();
    }, 1500);
  });

  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.style.display === 'flex';
      links.style.display = open ? 'none' : 'flex';
      links.style.position = 'absolute';
      links.style.top = '64px';
      links.style.left = '0';
      links.style.right = '0';
      links.style.flexDirection = 'column';
      links.style.background = 'rgba(10,8,18,0.98)';
      links.style.padding = '20px var(--pad)';
      links.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
    });
  }
})();

// Hero platform rotator — cycles through platform names with a fade/rise transition
(function () {
  var track = document.getElementById('platformRotator');
  if (!track) return;
  var words = ['Facebook', 'Instagram', 'TikTok'];
  var i = 0;
  var current = track.querySelector('.rotator-word');
  if (!current) return;

  setInterval(function () {
    i = (i + 1) % words.length;
    current.classList.add('out');
    setTimeout(function () {
      current.textContent = words[i];
      current.classList.remove('out');
    }, 400);
  }, 2200);
})();

// FAQ accordion — single item open at a time, height animated to fit content
(function () {
  var items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      items.forEach(function (other) {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-answer').style.maxHeight = '0px';
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0px';
      } else {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
})();

// Order wizard — platform/service selection, live price calc, payment details,
// validation, and a final Telegram-ready summary (site has no backend, so the
// actual order still has to be sent to Telegram by the customer)
(function () {
  var wizard = document.querySelector('.order-wizard');
  if (!wizard) return;

  var PRICE_PER_1000 = 6200;
  var state = { platform: '', service: '', link: '', qty: 1000, payment: '', txn: '', accName: '' };
  var currentStep = 1;

  var steps = wizard.querySelectorAll('.order-step');
  var dots = wizard.querySelectorAll('.op-dot');

  function formatKs(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' Ks';
  }

  function updatePrice() {
    var qty = parseInt(state.qty, 10) || 0;
    var price = (qty / 1000) * PRICE_PER_1000;
    var priceEl = document.getElementById('orderPrice');
    if (priceEl) priceEl.textContent = formatKs(price);
  }

  function goToStep(n) {
    steps.forEach(function (s) {
      s.classList.toggle('active', parseInt(s.getAttribute('data-step'), 10) === n);
    });
    dots.forEach(function (d) {
      var dn = parseInt(d.getAttribute('data-dot'), 10);
      d.classList.toggle('active', dn === n);
      d.classList.toggle('done', dn < n);
    });
    currentStep = n;
  }

  function setError(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg || '';
  }

  // Choice buttons (platform / service / payment)
  wizard.querySelectorAll('.choice-group').forEach(function (group) {
    var groupName = group.getAttribute('data-group');
    group.querySelectorAll('.choice-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        group.querySelectorAll('.choice-btn').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        state[groupName] = btn.getAttribute('data-value');

        if (groupName === 'payment') {
          var waveBox = document.getElementById('pd-wave');
          var kbzBox = document.getElementById('pd-kbz');
          if (waveBox) waveBox.hidden = state.payment !== 'Wave Money';
          if (kbzBox) kbzBox.hidden = state.payment !== 'KBZPay';
        }
      });
    });
  });

  // Quantity live price
  var qtyInput = document.getElementById('orderQty');
  if (qtyInput) {
    qtyInput.addEventListener('input', function () {
      state.qty = qtyInput.value;
      updatePrice();
    });
  }

  // Copy payment number buttons
  wizard.querySelectorAll('.pd-copy').forEach(function (btn) {
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

  // Next / Back navigation with per-step validation
  wizard.querySelectorAll('[data-goto]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = parseInt(btn.getAttribute('data-goto'), 10);

      if (target > currentStep) {
        if (currentStep === 1) {
          if (!state.platform || !state.service) {
            setError('err1', 'Platform နဲ့ Service ကို ရွေးပါ။');
            return;
          }
          setError('err1', '');
        }
        if (currentStep === 2) {
          var linkVal = (document.getElementById('orderLink') || {}).value || '';
          state.link = linkVal.trim();
          var qtyVal = parseInt(state.qty, 10) || 0;
          if (!state.link) {
            setError('err2', 'Refill Link ထည့်ပါ။');
            return;
          }
          if (qtyVal < 1000) {
            setError('err2', 'Minimum Refill အရေအတွက်က 1,000 ဖြစ်ပါတယ်။');
            return;
          }
          setError('err2', '');
        }
        if (currentStep === 3) {
          if (!state.payment) {
            setError('err3', 'ငွေပေးချေမှု နည်းလမ်း ရွေးပါ။');
            return;
          }
          setError('err3', '');
        }
      }

      goToStep(target);
    });
  });

  // Submit — validate step 4, build summary, jump to step 5
  var submitBtn = document.getElementById('orderSubmit');
  if (submitBtn) {
    submitBtn.addEventListener('click', function () {
      var txnVal = (document.getElementById('orderTxn') || {}).value || '';
      var accVal = (document.getElementById('orderAccName') || {}).value || '';
      state.txn = txnVal.trim();
      state.accName = accVal.trim();

      if (state.txn.length !== 5 || !/^\d{5}$/.test(state.txn)) {
        setError('err4', 'ငွေလွဲပြေစာ ID နောက်ဆုံး ၅ လုံးကို ဂဏန်းနဲ့ ထည့်ပါ။');
        return;
      }
      if (!state.accName) {
        setError('err4', 'ငွေလွဲထားသည့် အကောင့်နာမည် ထည့်ပါ။');
        return;
      }
      setError('err4', '');

      var qty = parseInt(state.qty, 10) || 0;
      var price = formatKs((qty / 1000) * PRICE_PER_1000);
      var summary =
        '🛒 New Order — SHM Digital Marketing\n\n' +
        'Platform: ' + state.platform + '\n' +
        'Service: ' + state.service + '\n' +
        'Link: ' + state.link + '\n' +
        'Quantity: ' + qty.toLocaleString() + '\n' +
        'Total: ' + price + '\n\n' +
        'Payment Method: ' + state.payment + '\n' +
        'Transaction Last 5 Digits: ' + state.txn + '\n' +
        'Transferred From (Account Name): ' + state.accName;

      var summaryEl = document.getElementById('orderSummary');
      if (summaryEl) summaryEl.textContent = summary;

      goToStep(5);
    });
  }

  // Copy full summary
  var copyBtn = document.getElementById('orderCopyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var summaryEl = document.getElementById('orderSummary');
      if (!summaryEl || !navigator.clipboard) return;
      navigator.clipboard.writeText(summaryEl.textContent).then(function () {
        var original = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(function () { copyBtn.textContent = original; }, 1500);
      });
    });
  }

  updatePrice();
})();
