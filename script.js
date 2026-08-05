// Telegram Bot Config
const TELEGRAM_BOT_TOKEN = "8907164237:AAFSKHkRhVBxrW1Fw-zKTyFKolWcJzLoWqY";
const TELEGRAM_CHAT_ID = "7095929240";

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

// Order wizard — handles AI Plans & Social Media services with dynamic price calculation,
// payment methods (Wave Money / KBZPay), Telegram links, and Telegram Bot Notification.
(function () {
  var wizard = document.querySelector('.order-wizard');
  if (!wizard) return;

  var PRICE_PER_1000 = 6200;
  var state = {
    category: 'AI Plans',
    aiPlan: 'Canva Pro',
    unitPrice: 20000,
    platform: 'Facebook Page',
    service: 'Likes',
    email: '',
    link: '',
    qty: 1,
    payment: 'Wave Money',
    txn: '',
    accName: '',
    totalPrice: 20000
  };

  var currentStep = 1;
  var steps = wizard.querySelectorAll('.order-step');
  var dots = wizard.querySelectorAll('.op-dot');

  var aiPlanSection = document.getElementById('aiPlanSection');
  var socialSection = document.getElementById('socialSection');
  var aiPlanSelect = document.getElementById('aiPlanSelect');
  var step2AiInputs = document.getElementById('step2-ai-inputs');
  var step2SocialInputs = document.getElementById('step2-social-inputs');
  var cardQty = document.getElementById('cardQty');
  var orderQty = document.getElementById('orderQty');
  var priceEl = document.getElementById('orderPrice');

  function formatKs(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' MMK';
  }

  function updatePrice() {
    if (state.category === 'AI Plans') {
      var q = Math.max(1, parseInt(cardQty ? cardQty.value : 1, 10) || 1);
      state.qty = q;
      state.totalPrice = state.unitPrice * q;
    } else {
      var q = Math.max(1000, parseInt(orderQty ? orderQty.value : 1000, 10) || 1000);
      state.qty = q;
      state.totalPrice = Math.round((q / 1000) * PRICE_PER_1000);
    }
    if (priceEl) priceEl.textContent = formatKs(state.totalPrice);
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

  // Handle Main Category Toggle (AI Plans vs Social Services)
  var categoryBtns = wizard.querySelectorAll('[data-group="mainCategory"] .choice-btn');
  if (categoryBtns.length) {
    categoryBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        categoryBtns.forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        state.category = btn.getAttribute('data-value');

        if (state.category === 'AI Plans') {
          if (aiPlanSection) aiPlanSection.style.display = 'block';
          if (socialSection) socialSection.style.display = 'none';
          if (step2AiInputs) step2AiInputs.style.display = 'block';
          if (step2SocialInputs) step2SocialInputs.style.display = 'none';
        } else {
          if (aiPlanSection) aiPlanSection.style.display = 'none';
          if (socialSection) socialSection.style.display = 'block';
          if (step2AiInputs) step2AiInputs.style.display = 'none';
          if (step2SocialInputs) step2SocialInputs.style.display = 'block';
        }
        updatePrice();
      });
    });
  }

  // Handle AI Dropdown Change
  if (aiPlanSelect) {
    aiPlanSelect.addEventListener('change', function (e) {
      var selected = e.target.options[e.target.selectedIndex];
      state.aiPlan = selected.value;
      state.unitPrice = parseInt(selected.getAttribute('data-price'), 10) || 20000;
      updatePrice();
    });
  }

  // Other Choice buttons (Platform, Service, Payment)
  wizard.querySelectorAll('.choice-group').forEach(function (group) {
    var groupName = group.getAttribute('data-group');
    if (groupName === 'mainCategory') return;

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

  // Inputs live price tracking
  if (cardQty) cardQty.addEventListener('input', updatePrice);
  if (orderQty) orderQty.addEventListener('input', updatePrice);

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

  // Navigation logic
  wizard.querySelectorAll('[data-goto]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = parseInt(btn.getAttribute('data-goto'), 10);

      if (target > currentStep) {
        if (currentStep === 1) {
          setError('err1', '');
        }
        if (currentStep === 2) {
          if (state.category === 'AI Plans') {
            var emailVal = (document.getElementById('accountEmail') || {}).value || '';
            state.email = emailVal.trim();
            if (!state.email) {
              setError('err2', 'Email သို့မဟုတ် Telegram Username ဖြည့်ပေးပါ။');
              return;
            }
          } else {
            var linkVal = (document.getElementById('orderLink') || {}).value || '';
            state.link = linkVal.trim();
            if (!state.link) {
              setError('err2', 'Refill Link ထည့်ပါ။');
              return;
            }
            if (state.qty < 1000) {
              setError('err2', 'Minimum Refill အရေအတွက်က 1,000 ဖြစ်ပါတယ်။');
              return;
            }
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

  // Submit Order Handle
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

      // Build Order Summary
      var summary = '📦 NEW ORDER — SHM DIGITAL MARKETING 📦\n';
      summary += '-------------------------\n';
      summary += 'Category: ' + state.category + '\n';
      if (state.category === 'AI Plans') {
        summary += 'Plan Name: ' + state.aiPlan + '\n';
        summary += 'Target Info: ' + state.email + '\n';
        summary += 'Quantity: ' + state.qty + '\n';
      } else {
        summary += 'Platform: ' + state.platform + '\n';
        summary += 'Service: ' + state.service + '\n';
        summary += 'Link: ' + state.link + '\n';
        summary += 'Quantity: ' + state.qty.toLocaleString() + '\n';
      }
      summary += 'Total Price: ' + formatKs(state.totalPrice) + '\n';
      summary += 'Payment Method: ' + state.payment + '\n';
      summary += 'Txn Last 5 Digits: ' + state.txn + '\n';
      summary += 'Account Name: ' + state.accName + '\n';
      summary += '-------------------------\n';
      summary += 'Note: /payerror တွေ့ရှိပါက t.me/SHMAcademy သို့ ဆက်သွယ်ပါ။';

      var summaryEl = document.getElementById('orderSummary');
      if (summaryEl) summaryEl.textContent = summary;

      // Update direct link button to send text to Telegram
      var telegramLink = document.getElementById('telegramSendLink');
      if (telegramLink) {
        telegramLink.href = 'https://t.me/SHMAcademy?text=' + encodeURIComponent(summary);
      }

      // Direct Telegram Bot Notification Call
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: summary
          })
        }).catch(function (err) {
          console.log('Bot sending error:', err);
        });
      }

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
