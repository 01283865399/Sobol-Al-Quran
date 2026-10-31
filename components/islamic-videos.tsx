import * as React from 'react';

interface IslamicVideo {
  id: string;
  title: string;
  type: string;
  archiveId: string;
  archiveHost: string;
  file: string;
}

const VIDEOS: IslamicVideo[] = [
  {
    id: 'ramadan-mission',
    title: 'عمر وهانا — مهمة رمضان',
    type: 'كرتون إسلامي للأطفال',
    archiveId: 'sah0Uej3oPha6oothai6',
    archiveHost: 'dn600300.us.archive.org',
    file: 'Omar & Hana | Ramadan Mission | Islamic Cartoon for Kids--mzf85eISp8-nomusic.mp4',
  },
  {
    id: 'water-gone',
    title: 'عمر وهانا — لقد نفد الماء',
    type: 'كرتون إسلامي للأطفال',
    archiveId: 'aix1quae4ohchahsoo3X',
    archiveHost: 'dn600206.us.archive.org',
    file: "Omar & Hana | The Water's Gone | Islamic Cartoon-KTPp8F9LMb8-nomusic.mp4",
  },
  {
    id: 'grandparents',
    title: 'عمر وهانا — نريد جدّنا وجدّتنا',
    type: 'كرتون إسلامي للأطفال',
    archiveId: 'egeiceshohquei9ca1Vo',
    archiveHost: 'dn800209.us.archive.org',
    file: 'Omar & Hana | We Want Grandma & Grandpa | Islamic Cartoon-PfEt75fjitw-nomusic.mp4',
  },
];

function getVideoUrl(video: IslamicVideo) {
  return `https://${video.archiveHost}/0/items/${video.archiveId}/${encodeURIComponent(video.file)}`;
}

function getPosterUrl(video: IslamicVideo) {
  return `https://archive.org/download/${video.archiveId}/__ia_thumb.jpg`;
}

export function IslamicVideos() {
  return (
    <div className="islamic-videos-grid" dir="rtl">
      {VIDEOS.map((video) => (
        <article className="islamic-video-card" key={video.id}>
          <video
            className="islamic-video-frame"
            controls
            preload="metadata"
            playsInline
            poster={getPosterUrl(video)}
            aria-label={video.title}
          >
            <source src={getVideoUrl(video)} type="video/mp4" />
            متصفحك لا يدعم تشغيل الفيديو.
          </video>
          <h3 className="islamic-video-title" title={video.title}>{video.title}</h3>
          <p className="islamic-video-type">{video.type}</p>
          <p className="islamic-video-source">
            المصدر: Internet Archive
          </p>
        </article>
      ))}
    </div>
  );
}
