import { formatCompact } from "@/lib/discovery/discover-query"
import {
  formatPct,
  type AudienceBlock,
  type CompareRow,
  type CreatorReport,
  type GrowthPoint,
  type ReportStat,
  type ShareRow,
} from "@/lib/discovery/creator-report"

export function creatorReportHtml(report: CreatorReport, mode: "preview" | "print") {
  const toolbar = mode === "print"
    ? `<div class="toolbar"><span>Salve como PDF na janela de impressão.</span><button type="button" onclick="window.print()">Baixar PDF</button></div>`
    : ""
  const script = mode === "print"
    ? `<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},400)})</script>`
    : ""
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>${esc(report.fileName)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: #f4f4f5; color: #18181b; font: 14px/1.45 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .toolbar { position: sticky; top: 0; z-index: 2; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 20px; background: #18181b; color: white; }
    .toolbar button { border: 0; border-radius: 8px; background: white; color: #18181b; font: inherit; font-weight: 600; padding: 8px 12px; cursor: pointer; }
    .sheet { max-width: 760px; margin: 16px auto 32px; background: white; padding: 28px 32px 40px; }
    header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
    .brand { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: #71717a; }
    .who { display: flex; gap: 14px; margin-top: 18px; }
    .who img, .avatar { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; background: #e4e4e7; }
    h1 { margin: 0; font-size: 26px; line-height: 1.15; }
    .muted { color: #71717a; }
    .account { margin: 2px 0 0; color: #52525b; font-size: 13px; }
    .bio { margin: 12px 0 0; color: #3f3f46; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
    .metric { padding: 12px 0; border-top: 1px solid #e4e4e7; }
    .metric b { display: block; font-size: 22px; letter-spacing: -0.03em; }
    .metric span, .delta { color: #71717a; font-size: 12px; }
    h2 { margin: 28px 0 10px; font-size: 13px; letter-spacing: 0.04em; text-transform: uppercase; }
    h3 { margin: 16px 0 8px; font-size: 13px; }
    .posts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    figure { margin: 0; }
    figure img, .ph { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 10px; background: #f4f4f5; }
    .ph { display: flex; align-items: center; justify-content: center; font-weight: 600; }
    figcaption { margin-top: 6px; font-size: 12px; color: #3f3f46; }
    figcaption p { margin: 4px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: #71717a; }
    .split { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
    .bar { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr) auto; gap: 8px; align-items: center; margin: 6px 0; font-size: 12px; }
    .bar b { font-weight: 500; }
    .track { height: 6px; border-radius: 99px; background: #f4f4f5; overflow: hidden; }
    .track span { display: block; height: 100%; border-radius: inherit; background: #18181b; }
    .stat { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid #f4f4f5; font-size: 13px; }
    .stat span { color: #52525b; }
    .cols { display: flex; align-items: flex-end; gap: 6px; height: 120px; margin-top: 8px; }
    .col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; gap: 4px; }
    .col-track { flex: 1; width: 100%; display: flex; align-items: flex-end; }
    .col-bar { width: 100%; background: #18181b; border-radius: 4px 4px 0 0; }
    .col span { font-size: 10px; color: #71717a; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
    th, td { text-align: left; padding: 7px 8px; border-bottom: 1px solid #f4f4f5; vertical-align: top; }
    th { color: #71717a; font-weight: 500; }
    td:nth-child(n+2), th:nth-child(n+2) { text-align: right; white-space: nowrap; }
    .note { margin: 8px 0 0; color: #71717a; font-size: 12px; }
    footer { margin-top: 28px; color: #71717a; font-size: 12px; }
    @media (max-width: 720px) {
      .sheet { margin: 0; padding: 20px 16px 32px; }
      .metrics, .posts, .split { grid-template-columns: 1fr; }
    }
    @media print {
      body { background: white; }
      .toolbar { display: none !important; }
      .sheet { margin: 0; max-width: none; padding: 0; }
      h2, .posts, .split, table { break-inside: avoid; }
    }
    @page { size: A4; margin: 14mm; }
  </style>
</head>
<body>
  ${toolbar}
  <article class="sheet">
    <header>
      <div>
        <div class="brand">WeSell · Relatório do creator</div>
      </div>
      <div class="brand">${esc(report.generatedOn)}</div>
    </header>
    <div class="who">
      <img src="${esc(report.photo)}" alt="" />
      <div>
        <h1>${esc(report.name)}</h1>
        <p class="account">${esc(report.handle)}</p>
        <p class="account">${esc(report.accountLine)}</p>
      </div>
    </div>
    <p class="bio">${esc(report.bio)}</p>
    <section class="metrics">
      <div class="metric"><b>${esc(report.followersLabel)}</b><span>Seguidores</span><div class="delta">${esc(report.followerGrowthLabel)} no período</div></div>
      <div class="metric"><b>${esc(report.avgLikesLabel)}</b><span>Curtidas médias</span><div class="delta">${esc(report.likesDeltaLabel)} contra a mediana</div></div>
      <div class="metric"><b>${esc(report.engagementLabel)}</b><span>Taxa de engajamento</span><div class="delta">${esc(report.engagementNote)}</div></div>
    </section>
    ${section("Posts populares", `${report.postsEstimated ? `<p class="note">Estimativa do perfil. Esta rede ainda não tem publicações monitoradas com foto própria.</p>` : ""}${posts(report)}`)}
    ${section("Seguidores", `
      ${stats([{ label: "Seguidores", value: report.followerTotalLabel }, { label: "Seguidores falsos", value: report.fakeFollowersLabel }])}
      <p class="note">${esc(report.fakeComparison)}</p>
      <div class="split">
        <div><h3>Composição da audiência</h3>${bars(report.audienceMix)}</div>
        <div><h3>Alcance da audiência</h3>${bars(report.reachability)}</div>
      </div>
      <div class="split">
        <div><h3>Crescimento de seguidores</h3>${columns(report.followerGrowth)}</div>
        <div><h3>Crescimento de curtidas</h3>${columns(report.likesGrowth)}</div>
      </div>
    `)}
    ${section("Conteúdo", `
      ${stats(report.content)}
      <div class="split">
        <div><h3>${esc(report.reelsTitle)}</h3>${stats(report.reels)}</div>
        <div><h3>${report.stories ? "Stories" : "Colaborações"}</h3>${report.stories ? stats(report.stories) : collab(report)}</div>
      </div>
      ${report.stories ? `<h3>Colaborações</h3>${collab(report)}` : ""}
    `)}
    ${section("Audiência dos seguidores", audience(report.followerAudience))}
    ${section("Audiência de quem curte", audience(report.likerAudience))}
    ${section("Afinidade e interesses", `
      <div class="split">
        <div><h3>Marcas</h3>${bars(report.brands)}</div>
        <div><h3>Interesses</h3>${bars(report.interests)}</div>
      </div>
      <p class="note">Afinidade estimada pelas colaborações e pelo nicho. Os interesses se sobrepõem e não fecham em 100%.</p>
    `)}
    ${section("Hashtags e menções", `
      <div class="split">
        <div><h3>Hashtags</h3>${bars(report.hashtags)}${report.hashtagsNote ? `<p class="note">${esc(report.hashtagsNote)}</p>` : ""}</div>
        <div><h3>Menções</h3>${bars(report.mentions)}${report.mentionsNote ? `<p class="note">${esc(report.mentionsNote)}</p>` : ""}</div>
      </div>
    `)}
    ${section("Gênero", table("Gênero", report.genderTable))}
    ${section("Interesses em detalhe", table("Interesse", report.interestTable))}
    ${section("Marcas em detalhe", table("Marca", report.brandTable))}
    ${section("Leitura WeSell", `
      ${stats([
        { label: "Faixa estimada de mídia", value: report.priceLabel },
        { label: "Credibilidade", value: report.credibilityLabel },
        ...report.safety,
        ...report.grades,
      ])}
    `)}
    <footer>Relatório gerado em ${esc(report.generatedOn)}. Audiência, alcance, seguidores falsos e afinidade são estimativas da WeSell a partir dos dados deste creator. O arquivo não inclui documento, endereço, telefone nem dados bancários.</footer>
  </article>
  ${script}
</body>
</html>`
}

export function openCreatorReport(report: CreatorReport) {
  const popup = window.open("about:blank", "_blank")
  if (!popup) return false
  popup.document.open()
  popup.document.write(creatorReportHtml(report, "print"))
  popup.document.close()
  return true
}

function collab(report: CreatorReport) {
  if (report.collaborations.length === 0) return `<p class="note">Sem colaboração paga recente nesta rede.</p>`
  return stats(report.collaborations)
}

function audience(block: AudienceBlock) {
  return `<div class="split">
    <div><h3>Gênero</h3>${bars(block.gender)}</div>
    <div><h3>Idade</h3>${bars(block.age)}</div>
  </div>
  <div class="split">
    <div><h3>Países</h3>${bars(block.countries)}</div>
    <div><h3>Cidades</h3>${bars(block.cities)}</div>
  </div>
  <h3>Idiomas</h3>${bars(block.languages)}`
}

function section(title: string, body: string) {
  return `<section><h2>${esc(title)}</h2>${body}</section>`
}

function stats(rows: ReportStat[]) {
  return rows.map((row) => `<div class="stat"><span>${esc(row.label)}</span><b>${esc(row.value)}</b></div>`).join("")
}

function bars(rows: ShareRow[]) {
  if (rows.length === 0) return `<p class="note">Sem dados nesta rede.</p>`
  return rows.map((row) => `<div class="bar"><span>${esc(row.label)}</span><span class="track"><span style="width:${Math.max(0, Math.min(100, row.pct))}%"></span></span><b>${esc(formatPct(row.pct))}</b></div>`).join("")
}

function columns(points: GrowthPoint[]) {
  const max = Math.max(...points.map((point) => point.value), 1)
  return `<div class="cols">${points.map((point) => `<div class="col"><div class="col-track"><div class="col-bar" style="height:${Math.max(6, (point.value / max) * 100)}%"></div></div><span>${esc(point.label)}</span></div>`).join("")}</div>`
}

function posts(report: CreatorReport) {
  if (report.posts.length === 0) return `<p class="note">Nenhum post recente nesta rede.</p>`
  return `<div class="posts">${report.posts.map((post) => `<figure>${post.image ? `<img src="${esc(post.image)}" alt="" />` : `<div class="ph">${esc(report.name.slice(0, 1))}</div>`}<figcaption><b>${esc(formatCompact(post.likes))}</b> curtidas · <b>${esc(formatCompact(post.comments))}</b> comentários<p>${esc(post.caption)}</p></figcaption></figure>`).join("")}</div>`
}

function table(label: string, rows: CompareRow[]) {
  return `<table><thead><tr><th>${esc(label)}</th><th>Quem curte</th><th>Seguidores</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${esc(row.label)}</td><td>${esc(row.likers)}</td><td>${esc(row.followers)}</td></tr>`).join("")}</tbody></table>`
}

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
