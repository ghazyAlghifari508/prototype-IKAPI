// detail_agenda_desktop
// Ported verbatim from docs/design/prototype-copy/user/detail_agenda_desktop.html (inline <script>, 225 lines).
// Only this wrapper is new: the module runs once the DOM is ready and only on its own page.
import { onReady } from '../../shared.js';

onReady(function () {
    if (!document.querySelector('#event-cover')) return;

    /* Detail agenda. The three entries mirror the cards on /agenda
           so the listing and the detail page never disagree. */
        (function () {
          'use strict';

          const EVENTS = window.IKAPI_P6_DATA.EVENTS;;

          var $ = function (id) { return document.getElementById(id); };
          var params = new URLSearchParams(window.location.search);
          var key = window.IKAPI_P6_EVENT_ID || params.get('id');
          var event = EVENTS[key];

          function fill() {
            if (!event) {
              document.querySelector('main > section').classList.add('hidden');
              $('event-not-found').classList.remove('hidden');
              return;
            }

            document.title = event.title + ' — IKAPI Store Jawa Barat';
            var cover = $('event-cover');
            cover.src = event.cover;
            cover.alt = 'Foto kegiatan ' + event.title;

            $('event-category').textContent = event.category;
            $('event-format').textContent = event.format;
            $('event-title').textContent = event.title;
            $('event-date').textContent = event.dateText;
            $('event-time').textContent = event.time;
            $('event-location').textContent = event.location;
            $('event-organizer').textContent = event.organizer;
            $('event-side-category').textContent = event.category;
            $('event-side-format').textContent = event.format;
            $('event-side-fee').textContent = event.fee;

            var description = $('event-description');
            description.textContent = '';
            event.description.forEach(function (paragraph) {
              var p = document.createElement('p');
              p.textContent = paragraph;
              description.appendChild(p);
            });

            var rundown = $('event-rundown');
            rundown.textContent = '';
            event.rundown.forEach(function (row) {
              var li = document.createElement('li');
              li.className = 'flex items-start gap-4 py-3 text-[14px]';
              var time = document.createElement('span');
              time.className = 'w-14 shrink-0 font-bold tabular-nums text-ink-body';
              time.textContent = row[0];
              var text = document.createElement('span');
              text.className = 'text-ink-body';
              text.textContent = row[1];
              li.appendChild(time);
              li.appendChild(text);
              rundown.appendChild(li);
            });

            var speakers = $('event-speakers');
            speakers.textContent = '';
            event.speakers.forEach(function (person) {
              var li = document.createElement('li');
              li.className = 'flex items-start gap-3 rounded-xl border border-border-subtle bg-white px-4 py-3';
              var icon = document.createElement('span');
              icon.className = 'material-symbols-outlined text-[18px] text-primary';
              icon.setAttribute('aria-hidden', 'true');
              icon.textContent = 'person';
              var wrap = document.createElement('div');
              var name = document.createElement('p');
              name.className = 'text-[14px] font-bold text-ink-body';
              name.textContent = person[0];
              var role = document.createElement('p');
              role.className = 'mt-0.5 text-[13px] text-ink-muted';
              role.textContent = person[1];
              wrap.appendChild(name);
              wrap.appendChild(role);
              li.appendChild(icon);
              li.appendChild(wrap);
              speakers.appendChild(li);
            });

            var notes = $('event-notes');
            notes.textContent = '';
            event.notes.forEach(function (note) {
              var li = document.createElement('li');
              li.textContent = note;
              notes.appendChild(li);
            });
          }

          /* Same iCalendar writer used by the agenda list. */
          function downloadIcsFile(title, startISO, endISO, location, description) {
            var cleanSummary = title.replace(/([,;])/g, '\\$1');
            var cleanLocation = location.replace(/([,;])/g, '\\$1');
            var cleanDesc = description.replace(/([,;])/g, '\\$1');

            var icsData = [
              'BEGIN:VCALENDAR',
              'VERSION:2.0',
              'PRODID:-//IKAPI Jawa Barat//Agenda Literasi//ID',
              'CALSCALE:GREGORIAN',
              'METHOD:PUBLISH',
              'BEGIN:VEVENT',
              'SUMMARY:' + cleanSummary,
              'DESCRIPTION:' + cleanDesc,
              'LOCATION:' + cleanLocation,
              'DTSTART:' + startISO,
              'DTEND:' + endISO,
              'STATUS:CONFIRMED',
              'END:VEVENT',
              'END:VCALENDAR'
            ].join('\r\n');

            var blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.ics');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }

          $('event-save').addEventListener('click', function () {
            if (!event) return;
            downloadIcsFile(event.title, event.dateIcs[0], event.dateIcs[1], event.location, event.title + ' - ' + event.category + ' IKAPI Jabar.');
          });

          fill();
        })();

    // Prototype markup calls these from inline handlers; ES modules are scoped, so publish them.
});
