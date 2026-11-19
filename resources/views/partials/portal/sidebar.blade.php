{{--
  Portal sidebar (publisher + admin) - ONE partial, content driven by App\Support\Navigation so a publisher
  item can never leak into the admin sidebar (and vice versa): the persona decides the item list.

  Source: <aside id="publisher-sidebar"> in the 14 portal pages. P04 audit proved that, per persona, the
  sidebar markup is identical across pages and differs only in which link is current (`aria-current="page"`
  + `bg-primary ... text-white` vs `font-medium text-muted hover:bg-neutral hover:text-ink`).
  The id `publisher-sidebar` is kept because the prototype CSS/JS and the golden screenshots depend on it.

  Variables
    $persona     'publisher' | 'admin'
    $navLabel    aria-label of the <nav>
    $accountHref named route for the account block
    $account     ['title' => ..., 'subtitle' => ..., 'icon' => ...]
    $logoutHref  named route for the sign-out icon
--}}
@php
    $items = \App\Support\Navigation::items($persona);
    $href = static fn (?string $name): string => $name !== null && \Illuminate\Support\Facades\Route::has($name) ? route($name) : '#';
@endphp

<!-- SIDEBAR -->
<div @if ($manualShell ?? false) id="sidebar-scrim" @else data-ikapi-sidebar-scrim @endif class="fixed inset-0 z-40 hidden bg-[#222225]/40 lg:hidden"></div>
<aside id="publisher-sidebar" class="fixed bottom-0 left-0 z-40 flex w-[248px] flex-col rounded-tr-[12px] bg-white shadow-[2px_0_10px_rgba(34,34,37,0.07)] lg:translate-x-0">
  <nav aria-label="{{ $navLabel }}" class="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pb-4 pt-7">
    @foreach ($items as $item)
      @if ($item['type'] === 'heading')
        <p class="mt-3 px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-muted">{{ $item['label'] }}</p>
      @elseif ($item['ready'])
        <a href="{{ $item['href'] }}" @if ($item['active']) aria-current="page" @endif
          class="focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] {{ $item['active'] ? 'bg-primary font-semibold text-white' : 'font-medium text-muted transition-colors hover:bg-neutral hover:text-ink' }}">
          <span class="material-symbols-outlined text-[20px]">{{ $item['icon'] }}</span><span>{{ $item['label'] }}</span>
        </a>
      @else
        <span aria-disabled="true" title="Halaman ini belum dimigrasi"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-muted">
          <span class="material-symbols-outlined text-[20px]">{{ $item['icon'] }}</span><span>{{ $item['label'] }}</span>
        </span>
      @endif
    @endforeach
  </nav>
  <div class="flex items-center gap-2 border-t border-divider p-3">
    <a href="{{ $href($accountHref) }}" class="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 hover:bg-neutral">
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-white">
        <span class="material-symbols-outlined text-[18px]">{{ $account['icon'] }}</span>
      </span>
      <span class="min-w-0 text-left leading-tight">
        <span class="block truncate text-[13px] font-semibold text-ink">{{ $account['title'] }}</span>
        <span class="block truncate text-[11px] text-muted">{{ $account['subtitle'] }}</span>
      </span>
    </a>
    <a href="{{ $href($logoutHref) }}" aria-label="Keluar" title="Keluar"
      class="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#B42318] transition-colors hover:bg-[#FEF3F2]">
      <span class="material-symbols-outlined text-[20px]">logout</span>
    </a>
  </div>
</aside>
