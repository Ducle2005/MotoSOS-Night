import type {
  GasStation,
  PoliceStation,
  RepairShop,
  SafeStation,
  SafeStationCategory,
} from '../../types/rescue';

function getCategorySvgMarkup(category: SafeStationCategory): string {
  if (category === 'convenience') {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/></svg>`;
  }
  if (category === 'gas_station') {
    return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" x2="15" y1="22" y2="22"/><line x1="4" x2="14" y1="9" y2="9"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/></svg>`;
  }
  return `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>`;
}

export function createUserMarkerElement(isSearching: boolean): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'relative flex items-center justify-center pointer-events-none';
  wrapper.setAttribute('aria-label', 'Vị trí hiện tại của bạn');

  const radarRing = document.createElement('span');
  radarRing.className = isSearching
    ? 'absolute h-20 w-20 rounded-full border border-emerald-500/50 bg-emerald-500/15 animate-ping'
    : 'absolute h-14 w-14 rounded-full border border-sky-400/40 bg-sky-500/15 animate-ping';

  const pulseRing = document.createElement('span');
  pulseRing.className = 'absolute h-9 w-9 rounded-full border border-sky-400/30 bg-sky-400/10 animate-pulse';

  const halo = document.createElement('span');
  halo.className = 'absolute h-6 w-6 rounded-full bg-sky-500/25';

  const dot = document.createElement('span');
  dot.className =
    'relative h-4 w-4 rounded-full border-2 border-white bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.8)]';

  wrapper.appendChild(radarRing);
  wrapper.appendChild(pulseRing);
  wrapper.appendChild(halo);
  wrapper.appendChild(dot);
  return wrapper;
}

export function createStationMarkerElement(
  station: SafeStation,
  isHighlighted: boolean,
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute(
    'aria-label',
    `${station.name}, ${station.categoryLabel}, ${station.walkingDistanceMeters}m · ${station.walkingMinutes} phút đi bộ`,
  );
  button.setAttribute('aria-pressed', String(isHighlighted));
  button.className =
    'group flex h-11 w-11 items-center justify-center rounded-full focus:outline-none cursor-pointer';
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onClick();
  });

  const circle = document.createElement('span');
  circle.className = isHighlighted
    ? 'flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-lg shadow-emerald-600/40 ring-4 ring-emerald-500/30 scale-115 transition-transform'
    : 'flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white shadow-md shadow-emerald-700/25 transition-transform group-hover:scale-110';
  circle.innerHTML = getCategorySvgMarkup(station.category);

  button.appendChild(circle);
  return button;
}

export function createRepairShopMarkerElement(
  shop: RepairShop,
  isHighlighted: boolean,
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('data-testid', `repair-shop-marker-${shop.id}`);
  button.setAttribute(
    'aria-label',
    `${shop.name}, ${shop.openStatusLabel}, ${shop.distanceMeters}m`,
  );
  button.setAttribute('aria-pressed', String(isHighlighted));
  button.className =
    'group relative flex h-11 w-11 items-center justify-center rounded-full focus:outline-none cursor-pointer';
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onClick();
  });

  const pin = document.createElement('span');
  pin.className = isHighlighted
    ? 'relative flex items-center justify-center bg-blue-600 text-white rounded-full p-2 shadow-lg shadow-blue-600/40 border-2 border-white ring-4 ring-blue-500/25 scale-110 transition-transform'
    : 'relative flex items-center justify-center bg-blue-600 text-white rounded-full p-2 shadow-md border-2 border-white transition-transform group-hover:scale-110';
  pin.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;

  const onlineDot = document.createElement('span');
  onlineDot.className =
    'absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white';
  pin.appendChild(onlineDot);

  button.appendChild(pin);
  return button;
}

export function createGasStationMarkerElement(
  station: GasStation,
  isHighlighted: boolean,
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('data-testid', `gas-station-marker-${station.id}`);
  button.setAttribute(
    'aria-label',
    `${station.name}, ${station.walkingDistanceMeters}m · ${station.walkingMinutes} phút dắt bộ`,
  );
  button.setAttribute('aria-pressed', String(isHighlighted));
  button.className =
    'group relative flex h-11 w-11 items-center justify-center rounded-full focus:outline-none cursor-pointer';
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onClick();
  });

  const pin = document.createElement('span');
  pin.className = isHighlighted
    ? 'relative flex items-center justify-center bg-amber-500 text-white rounded-full p-2 border-2 border-white shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/25 scale-110 transition-transform'
    : 'relative flex items-center justify-center bg-amber-500 text-white rounded-full p-2 border-2 border-white shadow-md transition-transform group-hover:scale-110';
  pin.innerHTML = getCategorySvgMarkup('gas_station');

  button.appendChild(pin);
  return button;
}

export function createPoliceStationMarkerElement(
  station: PoliceStation,
  isHighlighted: boolean,
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('data-testid', `police-station-marker-${station.id}`);
  button.setAttribute(
    'aria-label',
    `${station.name}, ${station.distanceMeters}m · ${station.durationMinutes} phút`,
  );
  button.setAttribute('aria-pressed', String(isHighlighted));
  button.className =
    'group relative flex h-11 w-11 items-center justify-center rounded-full focus:outline-none cursor-pointer';
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onClick();
  });

  const pin = document.createElement('span');
  pin.className = isHighlighted
    ? 'relative flex items-center justify-center bg-indigo-700 text-white rounded-full p-2 border-2 border-white shadow-lg shadow-indigo-700/40 ring-4 ring-indigo-500/30 scale-110 transition-transform'
    : 'relative flex items-center justify-center bg-indigo-700 text-white rounded-full p-2 border-2 border-white shadow-md transition-transform group-hover:scale-110';
  pin.innerHTML = getCategorySvgMarkup('police');
  button.appendChild(pin);

  if (isHighlighted && station.isNearest) {
    const tag = document.createElement('span');
    tag.className =
      'pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-700 px-1.5 py-0.5 text-[9px] font-extrabold text-white shadow-sm ring-1 ring-white whitespace-nowrap';
    tag.textContent = 'Gần nhất';
    button.appendChild(tag);
  }

  return button;
}

export function createMechanicMarkerElement(
  mechanicName: string,
  etaMinutes: number,
  isArrivedOrCompleted: boolean,
): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'relative flex h-10 w-10 items-center justify-center pointer-events-none';
  wrapper.setAttribute('data-testid', 'mechanic-map-marker');

  const iconBox = document.createElement('div');
  iconBox.className =
    'flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-white shadow-lg shadow-amber-500/35';
  iconBox.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`;

  const label = document.createElement('span');
  label.setAttribute('data-role', 'mechanic-eta-label');
  label.className =
    'absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded-full border border-amber-200 bg-white px-2.5 py-0.5 font-sans text-[10px] font-bold tabular-nums text-amber-700 whitespace-nowrap shadow-md';

  wrapper.appendChild(iconBox);
  wrapper.appendChild(label);
  updateMechanicMarkerElement(wrapper, mechanicName, etaMinutes, isArrivedOrCompleted);
  return wrapper;
}

export function updateMechanicMarkerElement(
  wrapper: HTMLElement,
  mechanicName: string,
  etaMinutes: number,
  isArrivedOrCompleted: boolean,
): void {
  const label = wrapper.querySelector('[data-role="mechanic-eta-label"]');
  if (!label) return;
  const shortName = mechanicName.split(' ').pop() || mechanicName;
  if (isArrivedOrCompleted || etaMinutes <= 0) {
    label.textContent = `Thợ ${shortName} · Đã tới nơi`;
    return;
  }
  label.textContent = `Thợ ${shortName} · ${etaMinutes}p`;
}
