(function() {
  'use strict';

  var $ = document.querySelector.bind(document);
  var $$ = document.querySelectorAll.bind(document);
  var calendar = $('.calendar');
  var clock = $('.calendar__clock');
  var period = $('.calendar__period');
  var backdrop = $('.calendar__backdrop').style;
  var today = new Date();
  var curDate = today;
  var weeks = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ');
  var months = 'January February March April May June July August September October November December'.split(' ');
  var localeSupports = (function() {
    try {
      today.toLocaleTimeString('i');
    } catch (e) {
      return e.name === 'RangeError';
    }

    return false;
  })();

  function toArray(obj) {
    var j = obj.length, arr = new Array(j);
    while (j--) arr[j] = obj[j];
    return arr;
  }

  function selectToday() {
    var now = String(today.getDate());
    var weekday = today.getDay();
    var days = toArray($$('.calendar__day'));
    var day = days.filter(function(day, i) {
      return i % 7 === weekday && day.textContent === now;
    })[0];

    if (day) day.className += ' __today __active';
  }

  function selectDay(elem) {
    var active = $('.calendar__day.__active');

    if (active) active.classList.remove('__active');
    if (elem !== active) elem.classList.add('__active');
  }

  function formatTime(date) {
    function z(n) {
      return (n < 10 ? '0' : '') + n;
    }
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    return (h % 12 || 12) + ':' + z(m) + ':' + z(s) + ' ' + (h < 12 ? 'AM' : 'PM');
  }

  function clockTicking() {
    var date = new Date();
    var time = localeSupports ? date.toLocaleTimeString('en-US') : formatTime(date);

    clock.textContent = time.slice(0, -3);
    clock.setAttribute('data-time', time.slice(-2));
    setTimeout(clockTicking, 1e3);
  }

  function createDay(day, outOfRange) {
    var elem = document.createElement('div');
    elem.textContent = day;
    elem.className = 'calendar__day' + (!outOfRange ? '' : ' __gray');
    return elem;
  }

  function setPeriod(date) {
    period.textContent = getPeriodString(date);
  }

  function getPeriodString(date) {
    return months[date.getMonth()] + ' ' + date.getFullYear();
  }

  function getDateString(date) {
    var weekday = weeks[date.getDay()];
    var month = months[date.getMonth()];
    var day = date.getDate();
    var year = date.getFullYear();
    return weekday + ', ' + month + ' ' + day + ', ' + year;
  }

  function getDateWithDay(day, stamp) {
    var date = new Date(+stamp || Date.now());
    date.setDate(day);
    return date;
  }

  function getPrevMonthDays(stamp) {
    var date = getDateWithDay(0, stamp);
    var weekday = (date.getDay() + 1) % 7;
    var lastDay = date.getDate();
    return toArray(Array(weekday)).map(function(x, i) {
      return lastDay - i;
    }).reverse();
  }

  function getCurrentMonthDays(stamp) {
    var date = getDateWithDay(32, stamp);
    var max = 32 - date.getDate();
    return toArray(Array(max)).map(function(x, i) {
      return i + 1;
    });
  }

  function getNextMonthDays(stamp) {
    var max = 42 - (getCurrentMonthDays(stamp).length + getPrevMonthDays(stamp).length);
    return toArray(Array(max)).map(function(x, i) {
      return i + 1;
    });
  }

  function getCalendarParts(stamp) {
    return [
      getPrevMonthDays(stamp),
      getCurrentMonthDays(stamp),
      getNextMonthDays(stamp)
    ];
  }

  function fill(stamp) {
    var container = $('.calendar__days');
    container.innerHTML = '';

    getCalendarParts(stamp).forEach(function(days, i) {
      days.forEach(function(day) {
        container.appendChild(createDay(day, i !== 1));
      });
    });

    if (getPeriodString(curDate) === getPeriodString(today)) selectToday();
  }

  function setMonth(type) {
    var day = type === 'prev' ? 0 : 32;
    curDate = getDateWithDay(day, curDate.getTime());
    setPeriod(curDate);
    fill(curDate.getTime());
  }

  document.addEventListener('mousemove', function(e) {
    var cx = e.clientX;
    var cy = e.clientY;
    var coords = calendar.getBoundingClientRect();
    var x = cx - coords.left >> 0;
    var y = cy - coords.top >> 0;
    backdrop.transform = 'translate(' + x + 'px, ' + y + 'px)';
  });

  calendar.addEventListener('click', function(e) {
    var trg = e.target;
    var is = (function(selector) {
      return this.contains(selector);
    }).bind(trg.classList);

    switch (true) {
      case is('calendar__day'):
        return selectDay(trg);
      case is('calendar__arrow'):
        return setMonth(trg.getAttribute('data-type'));
      case is('calendar__date'):
        curDate = today;
        setPeriod(today);
        fill(today.getTime());
    }
  });

  $('.calendar__date').textContent = getDateString(today);
  setPeriod(today);
  fill(today.getTime());
  clockTicking();
})();