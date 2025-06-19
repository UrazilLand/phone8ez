'use client';
import type React from 'react';

interface PostVideoEmbedProps {
  videoUrl?: string;
}

const PostVideoEmbed: React.FC<PostVideoEmbedProps> = ({ videoUrl }) => {
  if (!videoUrl) return null;

  let embedUrl = '';

  if (videoUrl.includes('youtube.com/watch?v=')) {
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (videoUrl.includes('youtu.be/')) {
    const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (videoUrl.includes('vimeo.com/')) {
    const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
    if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
  }

  if (!embedUrl) {
    return (
      <div className="my-4 p-4 bg-destructive/10 text-destructive rounded-md">
        지원되지 않는 비디오 URL입니다. YouTube 또는 Vimeo 링크를 사용해주세요.
      </div>
    );
  }

  return (
    <div className="my-6 aspect-video">
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        title="Video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="rounded-lg shadow-md"
      ></iframe>
    </div>
  );
};

export default PostVideoEmbed;
