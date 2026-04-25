import QRCode from "qrcode";
import { Player, ProgramCard, Session } from "../domain/types";
import { ROLE_PROGRAM_REFERENCE } from "../domain/catalog";

export async function renderPrintablesHtml(bundle: {
  session: Session;
  players: Player[];
  programCards: ProgramCard[];
}) {
  const CARDS_PER_PAGE = 6;
  const playerCards = await Promise.all(
    bundle.players.map(async (player) => ({
      label: `Player ${player.seatNumber} Registration`,
      subtitle: `Use on the current session registration page`,
      qr: await QRCode.toDataURL(player.qrToken)
    }))
  );
  const programCards = await Promise.all(
    bundle.programCards.map(async (card) => {
      const sourcePlayer = bundle.players.find((player) => player.id === card.sourcePlayerId);
      const seatNumber = sourcePlayer?.seatNumber ?? "?";
      return {
      label: `Player ${seatNumber} Power`,
      subtitle: `Reusable anonymous power card`,
      qr: await QRCode.toDataURL(card.qrToken)
    };
    })
  );
  const referenceRoles = Array.from(new Set(bundle.session.activeRoleIds)).sort();
  const playerCardPages = chunk(playerCards, CARDS_PER_PAGE);
  const programCardPages = chunk(programCards, CARDS_PER_PAGE);
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Printables - ${bundle.session.name}</title>
      <style>
        @page { margin: 10mm; }
        body { font-family: Arial, sans-serif; margin: 0; color: #0ff3e8; background: #081018; }
        h1, h2 { margin: 0 0 12px; }
        .sheet { page-break-after: always; break-after: page; padding: 12mm; box-sizing: border-box; min-height: 277mm; }
        .sheet:last-of-type { page-break-after: auto; break-after: auto; }
        .card-grid { display: grid; grid-template-columns: repeat(2, 63mm); gap: 6mm 8mm; justify-content: center; }
        .card {
          width: 63mm;
          height: 88mm;
          border: 1px solid #284c52;
          border-radius: 3mm;
          padding: 4mm;
          box-sizing: border-box;
          break-inside: avoid;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
          background:
            linear-gradient(180deg, rgba(9, 22, 30, 0.96), rgba(6, 14, 20, 0.98)),
            repeating-linear-gradient(0deg, rgba(15,243,232,0.05), rgba(15,243,232,0.05) 1px, transparent 1px, transparent 8px);
          box-shadow: inset 0 0 0 1px rgba(255, 90, 90, 0.08);
        }
        .card strong { font-size: 14px; line-height: 1.2; color: #ff695e; text-transform: uppercase; letter-spacing: 0.04em; }
        img { width: 42mm; height: 42mm; display: block; margin: 4mm auto; }
        .small { font-size: 11px; color: #9fd8d5; word-break: break-word; line-height: 1.3; }
        .reference-sheet {
          border: 1px solid #284c52;
          border-radius: 8px;
          padding: 16px;
          min-height: 250mm;
          box-sizing: border-box;
          background:
            linear-gradient(180deg, rgba(9, 22, 30, 0.96), rgba(6, 14, 20, 0.98)),
            repeating-linear-gradient(0deg, rgba(15,243,232,0.05), rgba(15,243,232,0.05) 1px, transparent 1px, transparent 8px);
        }
        .reference-item { border-top: 1px solid #284c52; padding: 10px 0; }
        .reference-item:first-child { border-top: 0; padding-top: 0; }
        .reference-item strong { display: block; margin-bottom: 4px; color: #ff695e; }
        .sheet-note { margin-bottom: 10px; font-size: 12px; color: #9fd8d5; }
      </style>
    </head>
    <body>
      ${playerCardPages
        .map(
          (pageCards, pageIndex) => `
      <section class="sheet">
        <h1>${bundle.session.name}</h1>
        <h2>Player Registration Cards${playerCardPages.length > 1 ? ` - Page ${pageIndex + 1}` : ""}</h2>
        <div class="sheet-note">Print and cut these to playing-card size. Each player keeps their own registration card.</div>
        <div class="card-grid">
          ${pageCards
            .map(
              (card) => `<div class="card"><strong>${card.label}</strong><img src="${card.qr}" alt="${card.label}" /><div class="small">${card.subtitle}</div></div>`
            )
            .join("")}
        </div>
      </section>`
        )
        .join("")}
      ${programCardPages
        .map(
          (pageCards, pageIndex) => `
      <section class="sheet">
        <h1>${bundle.session.name}</h1>
        <h2>Program Cards${programCardPages.length > 1 ? ` - Page ${pageIndex + 1}` : ""}</h2>
        <div class="sheet-note">Print and cut these to playing-card size. These cards stay anonymous and do not reveal their program on the printout.</div>
        <div class="card-grid">
          ${pageCards
            .map(
              (card) => `<div class="card"><strong>${card.label}</strong><img src="${card.qr}" alt="${card.label}" /><div class="small">${card.subtitle}</div></div>`
            )
            .join("")}
        </div>
      </section>`
        )
        .join("")}
      <section class="sheet">
        <h1>${bundle.session.name}</h1>
        <h2>Role / Program Reference</h2>
        <div class="reference-sheet">
          ${referenceRoles
            .map((roleId) => {
              const reference = ROLE_PROGRAM_REFERENCE[roleId];
              return `<div class="reference-item">
                <strong>${roleId}</strong>
                <div><strong>Role:</strong> ${reference.role}</div>
                <div><strong>Program:</strong> ${reference.program}</div>
                <div><strong>Output:</strong> ${reference.output}</div>
              </div>`;
            })
            .join("")}
        </div>
      </section>
    </body>
  </html>`;
}

export async function renderReusableCardsHtml(maxPlayers = 12) {
  const cardEntries = Array.from({ length: maxPlayers }, (_, index) => ({
    seatNumber: index + 1,
    playerToken: `player:${index + 1}`,
    programToken: `program:${index + 1}`
  }));
  const playerCards = await Promise.all(
    cardEntries.map(async (entry) => ({
      label: `Player ${entry.seatNumber} Registration`,
      subtitle: `Use on the current session registration page`,
      qr: await QRCode.toDataURL(entry.playerToken)
    }))
  );
  const programCards = await Promise.all(
    cardEntries.map(async (entry) => ({
      label: `Player ${entry.seatNumber} Power`,
      subtitle: `Reusable anonymous power card`,
      qr: await QRCode.toDataURL(entry.programToken)
    }))
  );
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Colony Reusable Card Set</title>
      <style>
        @page { margin: 10mm; }
        body { font-family: Arial, sans-serif; margin: 0; color: #0ff3e8; background: #081018; }
        h1, h2 { margin: 0 0 12px; }
        .sheet { page-break-after: always; break-after: page; padding: 12mm; box-sizing: border-box; min-height: 277mm; }
        .sheet:last-of-type { page-break-after: auto; break-after: auto; }
        .card-grid { display: grid; grid-template-columns: repeat(2, 63mm); gap: 6mm 8mm; justify-content: center; }
        .card {
          width: 63mm; height: 88mm; border: 1px solid #284c52; border-radius: 3mm; padding: 4mm; box-sizing: border-box;
          break-inside: avoid; display: flex; flex-direction: column; justify-content: space-between; align-items: center; text-align: center;
          background:
            linear-gradient(180deg, rgba(9, 22, 30, 0.96), rgba(6, 14, 20, 0.98)),
            repeating-linear-gradient(0deg, rgba(15,243,232,0.05), rgba(15,243,232,0.05) 1px, transparent 1px, transparent 8px);
          box-shadow: inset 0 0 0 1px rgba(255, 90, 90, 0.08);
        }
        .card strong { font-size: 14px; line-height: 1.2; color: #ff695e; text-transform: uppercase; letter-spacing: 0.04em; }
        img { width: 42mm; height: 42mm; display: block; margin: 4mm auto; }
        .small { font-size: 11px; color: #9fd8d5; word-break: break-word; line-height: 1.3; }
        .sheet-note { margin-bottom: 10px; font-size: 12px; color: #9fd8d5; }
      </style>
    </head>
    <body>
      ${renderCardPages("Reusable Player Registration Cards", "Print once and reuse across all sessions.", playerCards)}
      ${renderCardPages("Reusable Program Cards", "Print once and reuse across all sessions. These cards stay anonymous and do not reveal their program on the printout.", programCards)}
    </body>
  </html>`;
}

function renderCardPages(title: string, note: string, cards: Array<{ label: string; subtitle: string; qr: string }>) {
  const pages = chunk(cards, 6);
  return pages
    .map(
      (pageCards, pageIndex) => `
      <section class="sheet">
        <h1>${title}${pages.length > 1 ? ` - Page ${pageIndex + 1}` : ""}</h1>
        <div class="sheet-note">${note}</div>
        <div class="card-grid">
          ${pageCards
            .map(
              (card) => `<div class="card"><strong>${card.label}</strong><img src="${card.qr}" alt="${card.label}" /><div class="small">${card.subtitle}</div></div>`
            )
            .join("")}
        </div>
      </section>`
    )
    .join("");
}

function chunk<T>(items: T[], size: number): T[][] {
  const pages: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

export function renderRoleReferenceHtml() {
  const allRoles = Object.keys(ROLE_PROGRAM_REFERENCE).sort();
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <title>Colony Role / Program Reference</title>
      <style>
        @page { margin: 12mm; }
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          color: #d7fff5;
          background: #081018;
        }
        main {
          padding: 12mm;
        }
        h1 {
          margin: 0 0 8px;
          color: #ff695e;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        p {
          margin: 0 0 14px;
          color: #97d8d5;
          font-size: 12px;
        }
        .sheet {
          border: 1px solid #284c52;
          border-radius: 8px;
          padding: 14px 16px;
          background:
            linear-gradient(180deg, rgba(9, 22, 30, 0.96), rgba(6, 14, 20, 0.98)),
            repeating-linear-gradient(0deg, rgba(15,243,232,0.05), rgba(15,243,232,0.05) 1px, transparent 1px, transparent 8px);
        }
        .entry {
          border-top: 1px solid #284c52;
          padding: 10px 0;
          break-inside: avoid;
        }
        .entry:first-child {
          border-top: 0;
          padding-top: 0;
        }
        .entry-title {
          color: #ff695e;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .entry-line {
          margin: 2px 0;
          line-height: 1.35;
          color: #d7fff5;
        }
        .entry-label {
          color: #97d8d5;
          font-weight: 700;
        }
      </style>
    </head>
    <body>
      <main>
        <h1>Role / Program Reference</h1>
        <p>Print this as a single A4 rules-side sheet for table reference.</p>
        <section class="sheet">
          ${allRoles
            .map((roleId) => {
              const reference = ROLE_PROGRAM_REFERENCE[roleId as keyof typeof ROLE_PROGRAM_REFERENCE];
              return `
                <article class="entry">
                  <div class="entry-title">${roleId} Program:</div>
                  <div class="entry-line">${reference.program}</div>
                  <div class="entry-line"><span class="entry-label">Output:</span> ${reference.output}</div>
                </article>
              `;
            })
            .join("")}
        </section>
      </main>
    </body>
  </html>`;
}
