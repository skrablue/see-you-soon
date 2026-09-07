/* ============================================================
   See You Soon Papa!  —  điều khiển lật trang
   ============================================================ */
(function () {
  /* ----------------------------------------------------------
     VỪA MÀN HÌNH — thu phóng nguyên khối, KHÔNG xếp lại bố cục.
     Tấm thiệp luôn là 980x660; ở đây chỉ tính xem nhét vừa khung
     nhìn thì phải nhân bao nhiêu. Nhờ vậy điện thoại, máy tính bảng
     hay màn hình rộng đều thấy đúng một bố cục.
     ---------------------------------------------------------- */
  var CARD_W = 980, CARD_H = 660;

  function fitCard() {
    var small = (document.documentElement.clientWidth || window.innerWidth) < 700;
    var padX  = small ? 10 : 16;          /* khớp padding của body    */
    var padY  = small ? 12 : 14;
    var bar   = small ? 62 : 88;          /* chỗ cho thanh điều khiển */
    /* Do bằng documentElement.clientWidth/Height chứ KHÔNG dùng
       visualViewport: visualViewport co lại khi người ta phóng to hai ngón
       hoặc khi bàn phím ảo bật lên -> tấm thiệp tự dưng teo lại. */
    var vw = document.documentElement.clientWidth  || window.innerWidth;
    var vh = document.documentElement.clientHeight || window.innerHeight;
    var s = Math.min((vw - padX * 2) / CARD_W, (vh - padY - bar) / CARD_H);
    /* chặn hai đầu: nhỏ quá thì không đọc nổi, to quá thì vỡ bố cục
       so với thanh điều khiển (thanh này không phóng theo). */
    s = Math.max(0.24, Math.min(s, 1.6));
    document.documentElement.style.setProperty('--card-scale', s.toFixed(4));
  }

  fitCard();
  window.addEventListener('resize', fitCard);
  window.addEventListener('orientationchange', fitCard);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', fitCard);

  var pages   = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var prevBtn = document.getElementById('prev');
  var nextBtn = document.getElementById('next');
  var counter = document.getElementById('counter');
  var dotsBox = document.getElementById('dots');
  var index   = 0;
  var busy    = false;

  /* --- chấm tròn chỉ mục --- */
  pages.forEach(function (p, i) {
    var d = document.createElement('i');
    d.title = p.dataset.label || ('Trang ' + (i + 1));
    d.addEventListener('click', function () { go(i); });
    dotsBox.appendChild(d);
  });
  var dots = Array.prototype.slice.call(dotsBox.children);

  function render() {
    pages.forEach(function (p, i) { p.classList.toggle('is-active', i === index); });
    dots.forEach(function (d, i) { d.classList.toggle('on', i === index); });
    counter.textContent = (index + 1) + ' / ' + pages.length;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === pages.length - 1;
    /* KHÔNG ghi #pN lên URL nữa: mở lại / F5 là quay về gói quà, nên URL
       mang số trang chỉ gây hiểu nhầm (địa chỉ ghi #p5 mà mở ra lại là
       gói quà). Muốn nhảy nhanh tới một trang thì bấm chấm chỉ mục. */
  }

  function go(target) {
    if (busy || target === index || target < 0 || target >= pages.length) return;
    busy = true;
    var leaving = pages[index];
    var forward = target > index;
    if (forward) leaving.classList.add('leaving');
    index = target;
    render();
    setTimeout(function () {
      leaving.classList.remove('leaving');
      busy = false;
    }, 560);
  }

  prevBtn.addEventListener('click', function () { go(index - 1); });
  nextBtn.addEventListener('click', function () { go(index + 1); });

  /* --- bàn phím --- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { go(index + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft'  || e.key === 'PageUp')                    { go(index - 1); e.preventDefault(); }
    if (e.key === 'Home') go(0);
    if (e.key === 'End')  go(pages.length - 1);
  });

  /* --- vuốt trên điện thoại --- */
  var x0 = null, y0 = null;
  var book = document.getElementById('book');
  book.addEventListener('touchstart', function (e) {
    x0 = e.changedTouches[0].clientX;
    y0 = e.changedTouches[0].clientY;
  }, { passive: true });
  book.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    var dy = e.changedTouches[0].clientY - y0;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
    x0 = y0 = null;
  }, { passive: true });

  /* --- LUÔN BẮT ĐẦU LẠI TỪ GÓI QUÀ ---
     Mở web, F5 hay bấm reload ở bất cứ trang nào cũng quay về màn gói
     quà, mở gói ra là trang 1. Bản cũ có deep-link #p2 trở đi vào thẳng
     trang truyện — đã bỏ: đây là món quà, ai mở cũng nên được mở từ đầu.
     Còn sót #pN trên địa chỉ (dấu trang cũ, link cũ) thì gột luôn cho
     sạch, chứ không nhảy trang theo nó. --- */
  if (location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
  }

  var gate    = document.getElementById('gift-gate');
  var giftBtn = document.getElementById('gift-open');

  function unlock() {
    document.body.classList.remove('gift-locked');
  }

  function openGift() {
    if (!gate || gate.classList.contains('is-open')) return;
    gate.classList.add('is-open');
    /* nắp bật lên rồi mới thả trang bìa ra */
    setTimeout(unlock, 620);
    setTimeout(function () {
      if (gate.parentNode) gate.parentNode.removeChild(gate);
    }, 1800);
  }

  if (gate && giftBtn) {
    giftBtn.addEventListener('click', openGift);
    giftBtn.focus({ preventScroll: true });
  } else {
    unlock();
  }

  render();
})();
