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

      var originalLabel = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="btn-spinner"></span> Processing…';
      setTimeout(function () {
        var summaryEl = document.getElementById('orderSummary');
        if (summaryEl) summaryEl.textContent = summary;
        goToStep(5);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalLabel;
      }, 500);
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

// AI Pro & Premium — product catalog, cart, and checkout
(function () {
  var grid = document.getElementById('prodGrid');
  if (!grid) return;

  var PRODUCTS = [
    { id: 'canva',        name: 'Canva Pro',                        price: 23000 },
    { id: 'canva-prem',   name: 'Canva Pro (Premium)',               price: 35000 },
    { id: 'perplexity',   name: 'Perplexity Ai Pro Plan',            price: 23000 },
    { id: 'gemini-pro',   name: 'Gemini Ai Pro',                     price: 23000 },
    { id: 'gemini-plan',  name: 'Gemini Ai Pro Plan',                price: 28000 },
    { id: 'chatgpt-ai',   name: 'Chat Gpt Ai',                       price: 28000 },
    { id: 'chatgpt-inv',  name: 'Chat Gpt Invite (Premium)',         price: 38000 },
    { id: 'chatgpt-shr',  name: 'Chat Gpt Shared (Premium)',         price: 35000 },
    { id: 'gemini-google',name: 'Gemini + Google Ai Pro',            price: 28000 },
    { id: 'gemini-plan2', name: 'Gemini Ai Pro plan',                price: 68000 }
  ];

  var cart = {}; // { productId: qty }

  function formatMMK(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' MMK';
  }
  function findProduct(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }
  function cartCount() {
    var n = 0;
    for (var id in cart) n += cart[id];
    return n;
  }
  function cartTotal() {
    var sum = 0;
    for (var id in cart) {
      var p = findProduct(id);
      if (p) sum += p.price * cart[id];
    }
    return sum;
  }

  // Render product grid
  var cardsHtml = '';
  PRODUCTS.forEach(function (p) {
    cardsHtml +=
      '<div class="prod-card">' +
        '<span class="prod-badge">AI Models</span>' +
        '<h3>' + p.name + '</h3>' +
        '<div class="prod-price">' + formatMMK(p.price) + '</div>' +
        '<div class="prod-actions">' +
          '<button type="button" class="prod-add" data-add="' + p.id + '">Add to Cart</button>' +
          '<button type="button" class="prod-order" data-order="' + p.id + '">Order Now</button>' +
        '</div>' +
      '</div>';
  });
  grid.innerHTML = cardsHtml;

  var cartFab = document.getElementById('cartFab');
  var cartCountEl = document.getElementById('cartCount');
  var cartOverlay = document.getElementById('cartOverlay');
  var cartItemsEl = document.getElementById('cartItems');
  var cartTotalEl = document.getElementById('cartTotal');
  var checkoutOverlay = document.getElementById('checkoutOverlay');

  function renderCartBadge() {
    if (!cartCountEl) return;
    cartCountEl.textContent = cartCount();
    cartCountEl.classList.remove('pulse');
    void cartCountEl.offsetWidth; // restart animation
    cartCountEl.classList.add('pulse');
  }

  function renderCartDrawer() {
    if (!cartItemsEl) return;
    var ids = Object.keys(cart);
    if (!ids.length) {
      cartItemsEl.innerHTML = '<p class="cart-empty">Cart ထဲမှာ ဘာမှ မရှိသေးပါ</p>';
    } else {
      var html = '';
      ids.forEach(function (id) {
        var p = findProduct(id);
        if (!p) return;
        var qty = cart[id];
        html +=
          '<div class="cart-item">' +
            '<div class="cart-item-info"><div class="name">' + p.name + '</div><div class="unit">' + formatMMK(p.price) + ' / unit</div></div>' +
            '<div class="cart-qty">' +
              '<button type="button" data-qty-down="' + id + '">−</button>' +
              '<span>' + qty + '</span>' +
              '<button type="button" data-qty-up="' + id + '">+</button>' +
            '</div>' +
            '<span class="cart-item-remove" data-remove="' + id + '">Remove</span>' +
          '</div>';
      });
      cartItemsEl.innerHTML = html;
    }
    if (cartTotalEl) cartTotalEl.textContent = formatMMK(cartTotal());
  }

  function addToCart(id, qty) {
    cart[id] = (cart[id] || 0) + (qty || 1);
    renderCartBadge();
    renderCartDrawer();
  }

  grid.addEventListener('click', function (e) {
    var addBtn = e.target.closest('[data-add]');
    var orderBtn = e.target.closest('[data-order]');
    if (addBtn) {
      addToCart(addBtn.getAttribute('data-add'), 1);
      addBtn.classList.add('in-cart');
      var original = addBtn.textContent;
      addBtn.textContent = 'Added ✓';
      setTimeout(function () { addBtn.textContent = original; addBtn.classList.remove('in-cart'); }, 1200);
    }
    if (orderBtn) {
      addToCart(orderBtn.getAttribute('data-order'), 1);
      openCheckout();
    }
  });

  if (cartItemsEl) {
    cartItemsEl.addEventListener('click', function (e) {
      var up = e.target.closest('[data-qty-up]');
      var down = e.target.closest('[data-qty-down]');
      var rm = e.target.closest('[data-remove]');
      if (up) { cart[up.getAttribute('data-qty-up')]++; }
      if (down) {
        var id = down.getAttribute('data-qty-down');
        cart[id]--;
        if (cart[id] <= 0) delete cart[id];
      }
      if (rm) { delete cart[rm.getAttribute('data-remove')]; }
      renderCartBadge();
      renderCartDrawer();
    });
  }

  function openCart() { renderCartDrawer(); if (cartOverlay) cartOverlay.classList.add('open'); }
  function closeCart() { if (cartOverlay) cartOverlay.classList.remove('open'); }

  if (cartFab) cartFab.addEventListener('click', openCart);
  var cartCloseBtn = document.getElementById('cartCloseBtn');
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', function (e) { if (e.target === cartOverlay) closeCart(); });

  // ---- Checkout modal ----
  var cState = { name: '', phone: '', telegram: '', notes: '', payment: '', txn: '', accName: '' };
  var cStep = 1;
  var cSteps = checkoutOverlay ? checkoutOverlay.querySelectorAll('.order-step') : [];
  var cDots = document.getElementById('checkoutProgress') ? document.getElementById('checkoutProgress').querySelectorAll('.op-dot') : [];

  function goToCStep(n) {
    cSteps.forEach(function (s) {
      s.classList.toggle('active', parseInt(s.getAttribute('data-cstep'), 10) === n);
    });
    cDots.forEach(function (d) {
      var dn = parseInt(d.getAttribute('data-cdot'), 10);
      d.classList.toggle('active', dn === n);
      d.classList.toggle('done', dn < n);
    });
    cStep = n;
  }
  function setCError(id, msg) {
    var el = document.getElementById(id);
    if (el) el.textContent = msg || '';
  }

  function openCheckout() {
    if (!cartCount()) return;
    closeCart();
    goToCStep(1);
    if (checkoutOverlay) checkoutOverlay.classList.add('open');
  }
  function closeCheckout() { if (checkoutOverlay) checkoutOverlay.classList.remove('open'); }

  var cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
  if (cartCheckoutBtn) cartCheckoutBtn.addEventListener('click', openCheckout);
  var checkoutCloseBtn = document.getElementById('checkoutCloseBtn');
  if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', closeCheckout);
  if (checkoutOverlay) checkoutOverlay.addEventListener('click', function (e) { if (e.target === checkoutOverlay) closeCheckout(); });

  if (checkoutOverlay) {
    checkoutOverlay.querySelectorAll('.choice-group[data-group="copayment"] .choice-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        checkoutOverlay.querySelectorAll('.choice-group[data-group="copayment"] .choice-btn').forEach(function (b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        cState.payment = btn.getAttribute('data-value');
        var waveBox = document.getElementById('co-pd-wave');
        var kbzBox = document.getElementById('co-pd-kbz');
        if (waveBox) waveBox.hidden = cState.payment !== 'Wave Money';
        if (kbzBox) kbzBox.hidden = cState.payment !== 'KBZPay';
      });
    });

    checkoutOverlay.querySelectorAll('.pd-copy').forEach(function (btn) {
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

    checkoutOverlay.querySelectorAll('[data-cgoto]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = parseInt(btn.getAttribute('data-cgoto'), 10);
        if (target > cStep) {
          if (cStep === 1) {
            var name = (document.getElementById('coName') || {}).value || '';
            var phone = (document.getElementById('coPhone') || {}).value || '';
            var tg = (document.getElementById('coTelegram') || {}).value || '';
            cState.name = name.trim(); cState.phone = phone.trim(); cState.telegram = tg.trim();
            cState.notes = ((document.getElementById('coNotes') || {}).value || '').trim();
            if (!cState.name || !cState.phone || !cState.telegram) {
              setCError('cerr1', 'Name, Phone, Telegram Username ဖြည့်ပါ။');
              return;
            }
            setCError('cerr1', '');
          }
          if (cStep === 2) {
            if (!cState.payment) {
              setCError('cerr2', 'ငွေပေးချေမှု နည်းလမ်း ရွေးပါ။');
              return;
            }
            setCError('cerr2', '');
          }
        }
        goToCStep(target);
      });
    });
  }

  var checkoutSubmit = document.getElementById('checkoutSubmit');
  if (checkoutSubmit) {
    checkoutSubmit.addEventListener('click', function () {
      var txnVal = (document.getElementById('coTxn') || {}).value || '';
      var accVal = (document.getElementById('coAccName') || {}).value || '';
      cState.txn = txnVal.trim();
      cState.accName = accVal.trim();

      if (cState.txn.length !== 5 || !/^\d{5}$/.test(cState.txn)) {
        setCError('cerr3', 'ငွေလွဲပြေစာ ID နောက်ဆုံး ၅ လုံးကို ဂဏန်းနဲ့ ထည့်ပါ။');
        return;
      }
      if (!cState.accName) {
        setCError('cerr3', 'ငွေလွဲထားသည့် အကောင့်နာမည် ထည့်ပါ။');
        return;
      }
      setCError('cerr3', '');

      var lines = ['🛒 New AI Pro Order — SHM Digital Marketing', ''];
      Object.keys(cart).forEach(function (id) {
        var p = findProduct(id);
        if (!p) return;
        lines.push('• ' + p.name + '  x' + cart[id] + '  (' + formatMMK(p.price * cart[id]) + ')');
      });
      lines.push('');
      lines.push('Total: ' + formatMMK(cartTotal()));
      lines.push('');
      lines.push('Name: ' + cState.name);
      lines.push('Phone: ' + cState.phone);
      lines.push('Telegram: ' + cState.telegram);
      if (cState.notes) lines.push('Notes: ' + cState.notes);
      lines.push('');
      lines.push('Payment Method: ' + cState.payment);
      lines.push('Transaction Last 5 Digits: ' + cState.txn);
      lines.push('Transferred From (Account Name): ' + cState.accName);
      lines.push('');
      lines.push('⚠️ Payment Screenshot ကို ဒီ Message နဲ့အတူ တွဲပို့ပေးပါ။');

      var originalLabel = checkoutSubmit.innerHTML;
      checkoutSubmit.disabled = true;
      checkoutSubmit.innerHTML = '<span class="btn-spinner"></span> Processing…';
      setTimeout(function () {
        var summaryEl = document.getElementById('checkoutSummary');
        if (summaryEl) summaryEl.textContent = lines.join('\n');
        goToCStep(4);
        checkoutSubmit.disabled = false;
        checkoutSubmit.innerHTML = originalLabel;
      }, 500);
    });
  }

  var checkoutCopyBtn = document.getElementById('checkoutCopyBtn');
  if (checkoutCopyBtn) {
    checkoutCopyBtn.addEventListener('click', function () {
      var summaryEl = document.getElementById('checkoutSummary');
      if (!summaryEl || !navigator.clipboard) return;
      navigator.clipboard.writeText(summaryEl.textContent).then(function () {
        var original = checkoutCopyBtn.textContent;
        checkoutCopyBtn.textContent = 'Copied!';
        setTimeout(function () { checkoutCopyBtn.textContent = original; }, 1500);
      });
    });
  }

  renderCartBadge();
})();

// Preloader — hides once the page has finished loading
(function () {
  var pre = document.getElementById('preloader');
  if (!pre) return;
  function hidePreloader() {
    pre.classList.add('pl-hide');
    setTimeout(function () { pre.style.display = 'none'; }, 550);
  }
  if (document.readyState === 'complete') {
    setTimeout(hidePreloader, 200);
  } else {
    window.addEventListener('load', function () { setTimeout(hidePreloader, 200); });
  }
  // Safety net: never let the preloader block the page for more than 2.5s
  setTimeout(hidePreloader, 2500);
})();

// Cursor glow — follows the mouse on desktop pointers only
(function () {
  var glow = document.getElementById('cursorGlow');
  if (!glow) return;
  if (window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var raf = null;
  window.addEventListener('mousemove', function (e) {
    glow.classList.add('active');
    if (raf) return;
    raf = requestAnimationFrame(function () {
      glow.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
      raf = null;
    });
  });
  window.addEventListener('mouseleave', function () { glow.classList.remove('active'); });
})();

// 3D tilt — applies a subtle perspective tilt to card grids on mousemove (desktop only)
(function () {
  if (window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var selectors = '.service-card, .prod-card, .feature-card, .tip-card, .contact-card, .process-step, .orbit-item';
  var cards = document.querySelectorAll(selectors);

  cards.forEach(function (card) {
    card.classList.add('tilt-3d');
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;   // 0..1
      var py = (e.clientY - r.top) / r.height;   // 0..1
      var rx = (0.5 - py) * 10;  // rotateX degrees
      var ry = (px - 0.5) * 10;  // rotateY degrees
      card.style.transform = 'perspective(700px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });
})();

// Button ripple microinteraction — spawns an expanding circle at the click point
(function () {
  var selector = '.btn-primary, .btn-ghost, .prod-add, .prod-order, .choice-btn, .cart-fab, .nav-cta';
  document.addEventListener('click', function (e) {
    var target = e.target.closest(selector);
    if (!target) return;
    var r = target.getBoundingClientRect();
    var size = Math.max(r.width, r.height) * 1.4;
    var ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
    target.appendChild(ripple);
    setTimeout(function () { ripple.remove(); }, 650);
  });
})();

// Outline Custom Key Service Module — Dynamic Price Multiplier & Checkout
(function () {
  var section = document.getElementById('outlineServiceSection');
  if (!section) return;

  var PACKAGES = [
    { id: '80gb',  name: '80GB / 30 Days',  price: 8000,  badge: 'Standard' },
    { id: '150gb', name: '150GB / 30 Days', price: 16000, badge: 'Popular 🔥' },
    { id: '250gb', name: '250GB / 30 Days', price: 32000, badge: 'Pro Value' }
  ];

  var state = {
    customName: '',
    packageId: '80gb',
    qty: 1,
    payment: '',
    txn: '',
    accName: ''
  };

  function formatKs(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' Ks';
  }

  function getSelectedPackage() {
    for (var i = 0; i < PACKAGES.length; i++) {
      if (PACKAGES[i].id === state.packageId) return PACKAGES[i];
    }
    return PACKAGES[0];
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

  // Outline Icon Header & Package Selection Setup
  var groupContainer = section.querySelector('.choice-group[data-group="outlinePackage"]');
  if (groupContainer) {
    var html = '';
    PACKAGES.forEach(function (p, index) {
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

  // Name & Quantity Inputs
  var nameInput = document.getElementById('outlineCustomName');
  if (nameInput) {
    nameInput.addEventListener('input', function () {
      state.customName = nameInput.value;
    });
  }

  var qtyInput = document.getElementById('outlineQty');
  if (qtyInput) {
    qtyInput.addEventListener('input', function () {
      var val = parseInt(qtyInput.value, 10);
      state.qty = isNaN(val) || val < 1 ? 1 : val;
      updatePriceDisplay();
    });
  }

  // Payment Selection Toggle
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

  // Copy payment numbers
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

  // Steps Navigation & Validation
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
            setError('oerr2', 'ငွေပေးချေမှု နည်းလမ်း (KBZPay သို့မဟုတ် Wave Money) ရွေးချယ်ပါ။');
            return;
          }
          setError('oerr2', '');
        }
      }
      goToStep(target);
    });
  });

  // Order Submission & Telegram Summary Generation
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

      // SVG Icon Header + Clean Telegram Output
      var summary =
        '🔒 New Order — Outline Custom Key Service\n\n' +
        '🔑 Custom Key Name: ' + state.customName + '\n' +
        '📦 Selected Package: ' + pkg.name + '\n' +
        '🔢 Quantity (Key အရေအတွက်): ' + state.qty + '\n' +
        '💰 Total Price: ' + formatKs(total) + ' (' + formatKs(pkg.price) + ' x ' + state.qty + ')\n\n' +
        '💳 Payment Method: ' + state.payment + '\n' +
        '🧾 Transaction Last 5 Digits: ' + state.txn + '\n' +
        '👤 Account Name: ' + state.accName + '\n\n' +
        '⚡ High-Speed Server | 100% Guaranteed Uptime';

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

  // Copy Summary Button
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

  updatePriceDisplay();
})();
