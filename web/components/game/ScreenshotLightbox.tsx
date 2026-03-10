"use client";

import { useState, useEffect } from "react";

type Props = {
  images: string[];
};

export default function ScreenshotLightbox({ images }: Props) {

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  function close() {
    setActiveIndex(null);
  }

  function next() {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex + 1) % images.length);
  }

  function prev() {
    if (activeIndex === null) return;
    setActiveIndex((activeIndex - 1 + images.length) % images.length);
  }

  useEffect(() => {

  function handleKey(e: KeyboardEvent) {

    if (activeIndex === null) return;

    if (e.key === "Escape") close();

    if (e.key === "ArrowRight") next();

    if (e.key === "ArrowLeft") prev();
  }

  if (activeIndex !== null) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  window.addEventListener("keydown", handleKey);

  return () => {
    window.removeEventListener("keydown", handleKey);
    document.body.style.overflow = "";
  };

}, [activeIndex]);

useEffect(() => {

  if (activeIndex === null) return;

  const nextIndex = (activeIndex + 1) % images.length;

  const img = new Image();
  img.src = images[nextIndex];

}, [activeIndex, images]);

  return (
    <>
      <div className="screenshotGrid">

        {images.map((img, index) => (
          <img
            key={img}
            src={img}
            alt="Game screenshot"
            loading="lazy"
            onClick={() => setActiveIndex(index)}
          />
        ))}

      </div>

      {activeIndex !== null && (

        <div className="lightboxOverlay" onClick={close}>

          <button
            className="lightboxPrev"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            ←
          </button>

<img
  src={images[activeIndex]}
  className="lightboxImage"
  alt="Game screenshot"
  role="presentation"
  onClick={(e) => e.stopPropagation()}
/>

          <button
            className="lightboxNext"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            →
          </button>

        </div>

      )}

    </>
  );
}