import Image from "next/image";
import styles from "../app/app/series-spotlight.module.css";

const winners = [
  { rank: 2, initials: "ML", handle: "motionlab", followers: "8.900", offset: 3 },
  { rank: 1, initials: "SF", handle: "studioform", followers: "12.400", offset: 0 },
  { rank: 3, initials: "AK", handle: "atelierk", followers: "6.700", offset: 6 },
];

export function SeriesSpotlight() {
  return <section className={styles.seriesSpotlight} aria-labelledby="series-winners-title">
    <div className={styles.seriesSpotlightShade} />
    <div className={styles.seriesSpotlightTitle} id="series-winners-title"><b>puble&apos;da</b> Haftanın <strong>Enleri!</strong></div>
    <span className={styles.seriesDoodle} aria-hidden="true">✎</span>
    <svg className={styles.seriesTrophy} viewBox="0 0 120 112" aria-hidden="true">
      <path d="M38 15h44v20c0 24-10 39-22 39S38 59 38 35V15Z" />
      <path d="M38 25H21c0 19 8 28 24 31M82 25h17c0 19-8 28-24 31M60 74v18M44 96h32" />
      <text x="60" y="48" textAnchor="middle">WINNER</text>
    </svg>
    <div className={styles.seriesPodium}>
      {winners.map((winner) => <article className={`${styles.seriesWinner} ${winner.rank === 1 ? styles.seriesWinnerFirst : ""}`} key={winner.rank}>
        <span className={styles.seriesRank} aria-label={`${winner.rank}. sıra`}>{winner.rank}</span>
        {winner.rank === 1 ? <span className={styles.seriesPin} aria-hidden="true"><i /></span> : null}
        <div className={styles.seriesProfile}>
          <span className={styles.seriesAvatar}>{winner.initials}</span>
          <b>@{winner.handle} <small>/ Instagram</small></b>
          <p>{winner.followers} takipçi</p>
          <div className={styles.seriesGallery}>
            {Array.from({ length: 9 }, (_, index) => <Image key={index} src={`/UI/UX/inbox_media/post${((index + winner.offset) % 12) + 1}.jpg`} alt="" width={180} height={180} sizes="(max-width: 720px) 22vw, 95px" />)}
          </div>
        </div>
      </article>)}
    </div>
  </section>;
}
