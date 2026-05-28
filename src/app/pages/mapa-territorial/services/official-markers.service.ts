import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { Official } from '../models/official.model';

@Injectable({ providedIn: 'root' })
export class OfficialMarkersService {
  private readonly markers = new Map<number, L.Marker>();

  syncMarkers(map: L.Map, officials: Official[]): void {
    const activeIds = new Set<number>();

    for (const official of officials) {
      activeIds.add(official.id_official);

      const latlng: L.LatLngExpression = [official.last_latitude, official.last_longitude];
      const icon = this.buildMarkerIcon(official);
      const tooltipText = official.gps_active
        ? official.name
        : `Sin conexión - Últ: ${this.formatShortDate(official.last_gps_update)}`;
      const popupHtml = this.buildPopupHtml(official);

      const existing = this.markers.get(official.id_official);
      if (existing) {
        existing.setLatLng(latlng);
        existing.setIcon(icon);
        existing.unbindTooltip();
        existing.bindTooltip(tooltipText, {
          direction: 'top',
          offset: [0, -14],
          opacity: 0.95,
          sticky: true,
        });
        existing.unbindPopup();
        existing.bindPopup(popupHtml, {
          maxWidth: 280,
          className: 'official-marker-popup',
        });
        if (!map.hasLayer(existing)) {
          existing.addTo(map);
        }
        continue;
      }

      const marker = L.marker(latlng, {
        icon,
        keyboard: false,
        riseOnHover: true,
      }).addTo(map);

      marker.bindTooltip(tooltipText, {
        direction: 'top',
        offset: [0, -14],
        opacity: 0.95,
        sticky: true,
      });

      marker.bindPopup(popupHtml, {
        maxWidth: 280,
        className: 'official-marker-popup',
      });

      this.markers.set(official.id_official, marker);
    }

    for (const [id, marker] of this.markers.entries()) {
      if (!activeIds.has(id)) {
        map.removeLayer(marker);
        this.markers.delete(id);
      }
    }
  }

  clearAll(map: L.Map): void {
    for (const marker of this.markers.values()) {
      map.removeLayer(marker);
    }
    this.markers.clear();
  }

  focusOfficial(map: L.Map, official: Official): void {
    const latlng: L.LatLngExpression = [official.last_latitude, official.last_longitude];
    const marker = this.markers.get(official.id_official);

    map.flyTo(latlng, 16, { duration: 1 });

    if (marker) {
      marker.openPopup();
    }
  }

  private buildMarkerIcon(official: Official): L.DivIcon {
    const isActive = official.gps_active;
    const borderColor = isActive ? '#22c55e' : '#94a3b8';
    const opacity = isActive ? '1' : '0.6';
    const badge = official.photo_url?.trim()
      ? `<img src="${this.escapeHtml(official.photo_url)}" alt="${this.escapeHtml(official.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;" />`
      : `<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:50%;font-weight:800;font-size:1rem;color:#0f172a;background:linear-gradient(135deg,#e2e8f0,#cbd5e1);">${this.getInitial(official.name)}</span>`;

    return L.divIcon({
      className: 'official-marker-icon',
      html: `
        <div style="
          width:44px;
          height:44px;
          border-radius:50%;
          border:3px solid ${borderColor};
          box-shadow:0 6px 18px rgba(15, 23, 42, 0.18);
          overflow:hidden;
          background:#fff;
          opacity:${opacity};
          box-sizing:border-box;
        ">${badge}</div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
      popupAnchor: [0, -22],
    });
  }

  private buildPopupHtml(official: Official): string {
    const name = this.escapeHtml(official.name);
    const address = this.escapeHtml(official.address ?? 'Sin dirección registrada');
    const updatedAt = this.formatShortDate(official.last_gps_update);

    return `
      <div style="min-width:220px;display:flex;flex-direction:column;gap:6px;">
        <strong style="font-size:0.95rem;color:#0f172a;">${name}</strong>
        <span style="font-size:0.8rem;color:#475569;">${address}</span>
        <span style="font-size:0.75rem;color:#64748b;">Última actualización: ${updatedAt}</span>
      </div>
    `;
  }

  private formatShortDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
  }

  private getInitial(name: string): string {
    const trimmed = name.trim();
    return (trimmed.charAt(0) || '?').toUpperCase();
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}
